import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractDoNoFromPdf = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    
    // Render to canvas
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;

    const imageBlob = await new Promise(resolve => canvas.toBlob(resolve));

    // Run Tesseract
    const { data: { text } } = await Tesseract.recognize(
      imageBlob,
      'eng',
      { 
        // Log progress slightly less verbosely to avoid clutter
        logger: m => { if(m.status === 'recognizing text') console.log(m.progress); } 
      }
    );

    // --- LOGGING THE RESULT AS REQUESTED ---
    console.log("%c OCR Full Text Result:", "background: #222; color: #bada55; padding: 4px;");
    console.log(text); 
    // ---------------------------------------

    // Regex to find DO No specifically (Matches "DO No.: 5100612134")
    // It looks for "DO No" followed by optional dots/colons, then captures the number
    const doNoPattern = /DO\s*No\.?\s*[:.]?\s*(\d+)/i;
    const match = text.match(doNoPattern);

    if (match && match[1]) {
      const extractedNumber = match[1];
      console.log("Extracted DO No:", extractedNumber);
      return extractedNumber;
    }

    console.warn("DO No. pattern not found in text.");
    return null;

  } catch (error) {
    console.error("OCR Extraction Failed:", error);
    return null;
  }
};