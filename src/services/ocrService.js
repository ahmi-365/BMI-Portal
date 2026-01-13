import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * STRATEGY 1: DIRECT TEXT LAYER
 */
const extractTextLayer = async (page) => {
  try {
    const textContent = await page.getTextContent();
    return textContent.items.map(item => item.str).join(' ');
  } catch (err) {
    return "";
  }
};

/**
 * STRATEGY 2: OCR.SPACE FREE API
 * Free tier: 25,000 requests/month, no signup needed
 */
const queryOCRSpace = async (imageBlob) => {
  const formData = new FormData();
  formData.append('file', imageBlob, 'document.jpg');
  formData.append('apikey', 'K87899142388957'); // Public free key
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2'); // Engine 2 is more accurate

  try {
    console.log("🔍 Running OCR.space API...");

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR.space Error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.IsErroredOnProcessing) {
      console.error("OCR.space Error:", result.ErrorMessage);
      return null;
    }

    const text = result.ParsedResults?.[0]?.ParsedText || "";
    console.log("✅ OCR.space Success");
    return text;

  } catch (error) {
    console.error("OCR.space API Error:", error);
    return null;
  }
};

export const extractDoNoFromPdf = async (file) => {
  try {
    console.log(`📄 Processing: ${file.name}`);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    // --- ATTEMPT 1: TEXT LAYER ---
    const rawText = await extractTextLayer(page);
    const doPattern = /\b(51\d{8})\b/;
    
    let textMatch = rawText.match(doPattern);
    if (textMatch) {
      console.log(`⚡ Found via Text Layer: ${textMatch[1]}`);
      return textMatch[1];
    }

    console.log("⚠️ Text layer empty. Switching to OCR...");

    // --- ATTEMPT 2: OCR.SPACE API ---
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    
    const imageBlob = await new Promise(resolve => 
      canvas.toBlob(resolve, 'image/jpeg', 0.95)
    );

    const ocrText = await queryOCRSpace(imageBlob);
    
    if (ocrText) {
      console.log("Raw OCR Output:", ocrText);
      const ocrMatch = ocrText.match(doPattern);
      if (ocrMatch) {
        console.log(`✅ Found via OCR: ${ocrMatch[1]}`);
        return ocrMatch[1];
      }
    }

    console.warn("❌ Failed to find DO No.");
    return null;

  } catch (error) {
    console.error("Extraction Logic Error:", error);
    return null;
  }
};