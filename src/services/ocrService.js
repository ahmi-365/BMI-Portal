import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Image Processor with 3 Modes:
 * 1. 'BALANCED': Threshold 180. Best for normal/bold text.
 * 2. 'HIGH_CONTRAST': Threshold 230. Best for very faint text.
 * 3. 'STAMP_FILTER': Blue channel only. Best for documents with stamps.
 */
const processCanvas = (canvas, mode) => {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let val;

    if (mode === 'STAMP_FILTER') {
      val = b > 200 ? 255 : 0;
    } else if (mode === 'HIGH_CONTRAST') {
      const avg = (r + g + b) / 3;
      val = avg > 230 ? 255 : 0;
    } else { // BALANCED
      const avg = (r + g + b) / 3;
      val = avg > 180 ? 255 : 0;
    }

    data[i] = val;     // R
    data[i + 1] = val; // G
    data[i + 2] = val; // B
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

const cleanOCRText = (str) => {
  if (!str) return '';
  return str
    .replace(/[kK]/g, '6')
    .replace(/[lI]/g, '1')
    .replace(/[OQ]/g, '0')
    .replace(/[S]/g, '5')
    .replace(/[Z]/g, '2')
    .replace(/[B]/g, '8')
    .replace(/[yYgGq]/g, '9');
};

const extractBestNumber = (rawString) => {
  if (!rawString) return null;
  
  const parts = rawString.trim().split(/[\s/.,:-]+/);
  
  for (const part of parts) {
    const cleaned = cleanOCRText(part);
    
    // Pattern: 51xxxxxxxx
    if (/\d{8,}/.test(cleaned)) {
      const startIdx = cleaned.indexOf('51');
      if (startIdx !== -1) {
        const potentialDO = cleaned.substring(startIdx);
        // Allow slight variations (9-12 digits) for processing
        if (potentialDO.length >= 9 && potentialDO.length <= 12) {
          return potentialDO;
        }
      }
      // Fallback
      if (/^\d{10}$/.test(cleaned)) {
        return cleaned;
      }
    }
  }
  return null;
};

const runOCR = async (canvas, attemptName) => {
  const imageBlob = await new Promise(resolve => canvas.toBlob(resolve));
  const { data: { text } } = await Tesseract.recognize(
    imageBlob,
    'eng',
    { 
      logger: m => { if(m.status === 'recognizing text') console.log(`[${attemptName}] ${m.progress}`); },
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.:- '
    }
  );
  return text;
};

export const extractDoNoFromPdf = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 4.0 });
    
    const regexStrategies = [
      { name: "Standard Label", regex: /D[O0][^:0-9\n]{0,10}[:.]?\s*([A-Za-z0-9\s/.-]{8,30})/i },
      { name: "Direct 51 Pattern", regex: /(?:\b|\D)(51\d{7,10})(?:\b|\D)/ },
      { name: "Sold-To Context", regex: /Sold-To[:\s]+\d+\s+.*?((?:[A-Za-z0-9]\s*){8,30})/i }
    ];

    const passes = [
      { name: "Attempt 1 (Balanced)", mode: "BALANCED" },
      { name: "Attempt 2 (High Contrast)", mode: "HIGH_CONTRAST" },
      { name: "Attempt 3 (Stamp Filter)", mode: "STAMP_FILTER" }
    ];

    const candidates = [];

    // --- STEP 1: RUN ALL PASSES ---
    for (const pass of passes) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      processCanvas(canvas, pass.mode);
      
      const text = await runOCR(canvas, pass.name);
      
      for (const strat of regexStrategies) {
        const match = text.match(strat.regex);
        if (match && match[1]) {
          const result = extractBestNumber(match[1]);
          if (result) {
            console.log(`🔎 [${pass.name}] Candidate found: ${result} via ${strat.name}`);
            candidates.push({
              value: result,
              passName: pass.name,
              length: result.length
            });
            // Stop checking other REGEX strategies for this specific image pass
            // but continue to the next IMAGE pass (High Contrast, etc.)
            break; 
          }
        }
      }
    }

    // --- STEP 2: CONSENSUS LOGIC ---
    
    // Priority A: Filter for exactly 10-digit numbers (The Gold Standard)
    const perfectCandidates = candidates.filter(c => c.length === 10);

    if (perfectCandidates.length > 0) {
      // Logic: If we have multiple 10-digit results, picking the most frequent one is safest.
      // If they are all different, prioritize "High Contrast" (Attempt 2) as it handles 5 vs 3 best.
      
      const counts = {};
      perfectCandidates.forEach(c => {
        counts[c.value] = (counts[c.value] || 0) + 1;
      });

      // Find the value with the highest count
      const winner = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      
      // If there is a tie (e.g. Pass 1 says X, Pass 2 says Y), check if High Contrast is involved
      if (counts[winner] === 1 && perfectCandidates.length > 1) {
        const highContrastMatch = perfectCandidates.find(c => c.passName === "Attempt 2 (High Contrast)");
        if (highContrastMatch) {
            console.log(`✅ Consensus Tie-Break: Trusting High Contrast result: ${highContrastMatch.value}`);
            return highContrastMatch.value;
        }
      }

      console.log(`✅ Consensus Winner: ${winner}`);
      return winner;
    }

    // Priority B: If no 10-digit numbers, look for the best imperfect match
    // (Prefer closest to 10 digits)
    if (candidates.length > 0) {
      // Sort by deviation from 10 digits
      candidates.sort((a, b) => Math.abs(10 - a.length) - Math.abs(10 - b.length));
      const bestGuess = candidates[0].value.substring(0, 10);
      console.warn(`⚠️ No perfect match. Returning best guess: ${bestGuess} (from ${candidates[0].value})`);
      return bestGuess;
    }

    console.warn("❌ DO No. not found after all attempts.");
    return null;

  } catch (error) {
    console.error("OCR Extraction Failed:", error);
    return null;
  }
};