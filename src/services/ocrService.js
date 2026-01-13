import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Image Processor handles two modes:
 * Mode 'STANDARD': High contrast B&W (Best for normal files like 122.pdf)
 * Mode 'STAMP_FILTER': Erases blue/red ink (Best for stamped files like 130914.pdf)
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
      // BLUE FILTER: Only look at Blue channel. 
      // High Blue = White (Paper/Blue Stamp), Low Blue = Black (Text)
      val = b > 160 ? 255 : 0;
    } else {
      // STANDARD: Simple Grayscale + Threshold
      // Average brightness
      const avg = (r + g + b) / 3;
      val = avg > 140 ? 255 : 0;
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
    .replace(/[B]/g, '8');
};

const extractBestNumber = (rawString) => {
  if (!rawString) return null;
  
  // Split by common separators to isolate the number
  const parts = rawString.trim().split(/[\s/.,:-]+/);
  
  for (const part of parts) {
    const cleaned = cleanOCRText(part);
    
    // Look for sequence of digits
    if (/\d{8,}/.test(cleaned)) {
      
      // PATTERN: Starts with "51" (Standard for your client)
      const startIdx = cleaned.indexOf('51');
      if (startIdx !== -1) {
        const potentialDO = cleaned.substring(startIdx);
        // Valid length check (10-12 digits)
        if (potentialDO.length >= 10 && potentialDO.length <= 12) {
          return potentialDO;
        }
      }
      
      // Fallback: Just a clean 10-digit number
      if (/^\d{10}$/.test(cleaned)) {
        return cleaned;
      }
    }
  }
  return null;
};

/**
 * Helper to run OCR on a prepared canvas
 */
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
    
    const viewport = page.getViewport({ scale: 3.5 }); // High scale for accuracy
    
    // Define Strategies
    const regexStrategies = [
      { name: "Standard Label", regex: /D[O0][^:0-9\n]{0,10}[:.]?\s*([A-Za-z0-9\s/.-]{8,30})/i },
      { name: "Direct 51 Pattern", regex: /(?:\b|\D)(51\d{8,10})(?:\b|\D)/ },
      { name: "Sold-To Context", regex: /Sold-To[:\s]+\d+\s+.*?((?:[A-Za-z0-9]\s*){8,30})/i }
    ];

    // --- ATTEMPT 1: STANDARD PROCESSING (Best for clean files) ---
    const canvas1 = document.createElement('canvas');
    const ctx1 = canvas1.getContext('2d');
    canvas1.height = viewport.height;
    canvas1.width = viewport.width;
    await page.render({ canvasContext: ctx1, viewport: viewport }).promise;
    
    // Apply Standard B&W Filter
    processCanvas(canvas1, 'STANDARD');
    
    const text1 = await runOCR(canvas1, 'Attempt 1 (Standard)');
    
    for (const strat of regexStrategies) {
      const match = text1.match(strat.regex);
      if (match && match[1]) {
        const result = extractBestNumber(match[1]);
        if (result) {
          console.log(`✅ Success via Attempt 1 [${strat.name}]:`, result);
          return result;
        }
      }
    }

    console.warn("⚠️ Attempt 1 failed. Retrying with Stamp Filter...");

    // --- ATTEMPT 2: STAMP REMOVAL (Best for stamped/noisy files) ---
    const canvas2 = document.createElement('canvas');
    const ctx2 = canvas2.getContext('2d');
    canvas2.height = viewport.height;
    canvas2.width = viewport.width;
    await page.render({ canvasContext: ctx2, viewport: viewport }).promise;
    
    // Apply Blue Filter
    processCanvas(canvas2, 'STAMP_FILTER');
    
    const text2 = await runOCR(canvas2, 'Attempt 2 (Filter)');
    
    for (const strat of regexStrategies) {
      const match = text2.match(strat.regex);
      if (match && match[1]) {
        const result = extractBestNumber(match[1]);
        if (result) {
          console.log(`✅ Success via Attempt 2 [${strat.name}]:`, result);
          return result;
        }
      }
    }

    console.warn("❌ DO No. not found after both attempts.");
    return null;

  } catch (error) {
    console.error("OCR Extraction Failed:", error);
    return null;
  }
};