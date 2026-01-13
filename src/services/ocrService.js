import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Image Processor with 3 Modes:
 * 1. 'BALANCED': Threshold 180. Best for normal/bold text. (Fixes 5->8 and 6->5 errors).
 * 2. 'HIGH_CONTRAST': Threshold 230. Best for very faint text. (Fixes missing digits).
 * 3. 'STAMP_FILTER': Blue channel only. Best for documents with stamps over text.
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
      // Blue Filter: High Blue = White, Low Blue = Black
      val = b > 200 ? 255 : 0;
    } else if (mode === 'HIGH_CONTRAST') {
      // Aggressive: Turns almost everything black. Good for faint text, bad for bold text.
      const avg = (r + g + b) / 3;
      val = avg > 230 ? 255 : 0;
    } else { // BALANCED
      // Moderate: Standard binarization. Keeps distinct shapes of 5, 6, 8.
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
    
    if (/\d{8,}/.test(cleaned)) {
      // Pattern: Starts with 51
      const startIdx = cleaned.indexOf('51');
      if (startIdx !== -1) {
        const potentialDO = cleaned.substring(startIdx);
        // Valid length: 9-12 digits
        if (potentialDO.length >= 9 && potentialDO.length <= 12) {
          return potentialDO;
        }
      }
      // Fallback: Clean 10-digit number
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
  
  console.log(`%c [${attemptName}] OCR Result:`, "color: #bada55", text);
  return text;
};

export const extractDoNoFromPdf = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    
    // Increased Scale to 4.0: More pixels = better curve distinction (6 vs 5)
    const viewport = page.getViewport({ scale: 4.0 });
    
    // Regex Strategies
    const regexStrategies = [
      { name: "Standard Label", regex: /D[O0][^:0-9\n]{0,10}[:.]?\s*([A-Za-z0-9\s/.-]{8,30})/i },
      { name: "Direct 51 Pattern", regex: /(?:\b|\D)(51\d{7,10})(?:\b|\D)/ },
      { name: "Sold-To Context", regex: /Sold-To[:\s]+\d+\s+.*?((?:[A-Za-z0-9]\s*){8,30})/i }
    ];

    // Define the 3 Passes
    const passes = [
      { name: "Attempt 1 (Balanced)", mode: "BALANCED" },       // Best for your current file
      { name: "Attempt 2 (High Contrast)", mode: "HIGH_CONTRAST" }, // Best for faint files
      { name: "Attempt 3 (Stamp Filter)", mode: "STAMP_FILTER" }    // Best for stamped files
    ];

    for (const pass of passes) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      
      // Apply the specific image filter for this pass
      processCanvas(canvas, pass.mode);
      
      const text = await runOCR(canvas, pass.name);
      
      for (const strat of regexStrategies) {
        const match = text.match(strat.regex);
        if (match && match[1]) {
          const result = extractBestNumber(match[1]);
          if (result) {
            console.log(`✅ Success via ${pass.name} [${strat.name}]:`, result);
            return result;
          }
        }
      }
      
      console.warn(`⚠️ ${pass.name} yielded no valid DO No. Moving to next strategy...`);
    }

    console.warn("❌ DO No. not found after all attempts.");
    return null;

  } catch (error) {
    console.error("OCR Extraction Failed:", error);
    return null;
  }
};