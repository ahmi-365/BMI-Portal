import fs from 'fs/promises';
import path from 'path';

const root = path.resolve(process.cwd());

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const res = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await walk(res)));
    } else {
      files.push(res);
    }
  }
  return files;
}

function hasJsx(content) {
  return /<\s*[A-Za-z]/.test(content);
}

function removeTypes(content) {
  // Remove `import type ...` lines
  content = content.replace(/^import type .*$/gm, '');
  // Remove `as Type` casts
  content = content.replace(/\s+as\s+[A-Za-z0-9_\<\>\|\s\[\]\{\},]+/g, '');
  // Remove non-null assertions like foo! -> foo
  content = content.replace(/([\w)\]\"])(!)\b/g, '$1');
  // Remove React.FC<...> types
  content = content.replace(/React\.FC<[^>]+>/g, 'function');
  // Remove generic uses for common hooks
  content = content.replace(/useState<[^>]+>/g, 'useState');
  content = content.replace(/useRef<[^>]+>/g, 'useRef');
  content = content.replace(/useMemo<[^>]+>/g, 'useMemo');
  content = content.replace(/useCallback<[^>]+>/g, 'useCallback');
  // Remove type declarations like: const x: string = ...
  content = content.replace(/:\s*[A-Za-z0-9_\[\]\<\>\|\s{},]+(?=[=;),\n])/g, '');
  // Remove return type annotations: function foo(): Promise<void> { -> function foo() {
  content = content.replace(/\)\s*:\s*[A-Za-z0-9_\[\]\<\>\|\s{},]+\s*\{/g, ') {');
  // Remove standalone `type` or `interface` blocks (simple heuristic)
  content = content.replace(/(^|\n)\s*(export\s+)?(type|interface)\s+[A-Za-z0-9_]+\s*=[\s\S]*?;\n/gm, '\n');
  content = content.replace(/(^|\n)\s*(export\s+)?interface\s+[A-Za-z0-9_]+\s*\{[\s\S]*?\}\n/gm, '\n');
  // Remove `: JSX.Element` and similar
  content = content.replace(/:\s*JSX\.Element/g, '');
  // Remove `import { Something } from './file.tsx'` explicit ext -> remove ext
  content = content.replace(/(from\s+['"].*?)\.(ts|tsx|d\.ts)['"]/g, '$1"');
  // Remove `use client` directive
  content = content.replace(/^\s*"use client";?\s*\n?/gm, '');
  return content;
}

async function main() {
  console.log('Walking project...');
  const allFiles = await walk(root);
  const targets = allFiles.filter((f) => /\.(ts|tsx|d\.ts|mts|cts)$/.test(f));
  for (const file of targets) {
    const rel = path.relative(root, file);
    // skip node_modules
    if (rel.includes('node_modules') || rel.startsWith('node_modules')) continue;
    // skip package-lock etc
    if (rel.includes('.git')) continue;
    const content = await fs.readFile(file, 'utf8');
    if (file.endsWith('.d.ts')) {
      console.log('Removing declaration file', rel);
      await fs.rm(file);
      continue;
    }
    const jsx = hasJsx(content) || file.endsWith('.tsx');
    const newExt = jsx ? '.jsx' : '.js';
    const newPath = file.replace(/\.(ts|tsx|mts|cts)$/, newExt);
    console.log(`Converting ${rel} -> ${path.relative(root, newPath)}`);
    let newContent = content;
    newContent = removeTypes(newContent);
    // Replace TypeScript-only import/export patterns if present
    newContent = newContent.replace(/export\s+type\s+\{?[A-Za-z0-9_,\s]*\}?;?/g, '');
    // Ensure React import (if JSX is used and no import React exists, modern JSX may not need it)
    await fs.writeFile(newPath, newContent, 'utf8');
    await fs.rm(file);
  }
  console.log('Conversion complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
