// src/services/ocrService.js
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker source for pdf.js (Required for React/Vite)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extracts "DO No" from a PDF file using OCR
 * @param {File} file - The uploaded PDF file
 * @returns {Promise<string|null>} - The extracted DO Number or null
 */
export const extractDoNoFromPdf = async (file) => {
  try {
    // 1. Read the PDF file
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // 2. Get the first page (usually where DO No is located)
    const page = await pdf.getPage(1);
    
    // 3. Render page to a canvas (Convert PDF -> Image)
    const viewport = page.getViewport({ scale: 2.0 }); // Scale 2.0 improves OCR accuracy
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;

    // 4. Convert canvas to image blob
    const imageBlob = await new Promise(resolve => canvas.toBlob(resolve));

    // 5. Run Tesseract OCR on the image
    const { data: { text } } = await Tesseract.recognize(
      imageBlob,
      'eng',
      { logger: m => console.log(m) } // Optional: logs progress
    );

    // 6. Use Regex to find "DO No." specifically
    // Matches "DO No.:", "DO No :", "DO No.", followed by the number
    const doNoPattern = /DO\s*No\.?\s*[:.]?\s*([A-Z0-9]+)/i;
    const match = text.match(doNoPattern);

    if (match && match[1]) {
      return match[1]; // Returns "5100612134"
    }

    return null; // Not found
  } catch (error) {
    console.error("OCR Extraction Failed:", error);
    return null;
  }
};