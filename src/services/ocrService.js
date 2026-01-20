import * as pdfjsLib from "pdfjs-dist";

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * ============================
 * HELPER: TEXT CLEANER
 * ============================
 * Removes spaces to handle cases like "5 1 0 0..."
 */
const cleanString = (str) => str.replace(/\s+/g, "");

/**
 * ============================
 * STRATEGY 1: PDF TEXT LAYER
 * ============================
 */
const extractTextLayer = async (page) => {
  try {
    const textContent = await page.getTextContent();
    return textContent.items.map(item => item.str).join(" ");
  } catch (err) {
    console.error("Text layer extraction error:", err);
    return "";
  }
};

/**
 * ============================
 * STRATEGY 2: OCR.SPACE API
 * ============================
 */
const queryOCRSpace = async (imageBlob, retry = 1) => {
  const formData = new FormData();
  formData.append("file", imageBlob, "document.jpg");
  formData.append("apikey", "K88622409788957"); 
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("detectOrientation", "false"); // Disabled for speed
  formData.append("scale", "true");
  formData.append("OCREngine", "2"); // Engine 2 is best for numbers

  try {
    console.log(`🔍 Running OCR.space API (Blob size: ${(imageBlob.size / 1024).toFixed(2)} KB)...`);

    // 25s Timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();

    if (result.IsErroredOnProcessing) {
      console.error("OCR Error:", result.ErrorMessage);
      return null;
    }

    const text = result.ParsedResults?.[0]?.ParsedText || "";
    console.log("✅ OCR.space Success");
    return text;

  } catch (error) {
    console.error("OCR API Error:", error);
    if (retry > 0) {
      console.warn("🔁 Retrying OCR...");
      return queryOCRSpace(imageBlob, retry - 1);
    }
    return null;
  }
};

/**
 * ============================
 * MAIN EXTRACTION FUNCTION
 * ============================
 */
export const extractDoNoFromPdf = async (file) => {
  try {
    console.log(`📄 Processing: ${file.name}`);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    // REGEX: Matches "51" followed by 8 digits (Total 10 digits)
    // We search this on "clean" text (no spaces), so we don't use \b boundaries
    const doRegex = /(51\d{8})/;

    // ---------- ATTEMPT 1: TEXT LAYER ----------
    const rawText = await extractTextLayer(page);
    const cleanRawText = cleanString(rawText);
    const textMatch = cleanRawText.match(doRegex);

    if (textMatch) {
      console.log(`⚡ Found via Text Layer: ${textMatch[1]}`);
      return textMatch[1];
    }

    console.log("⚠️ Text layer empty/nomatch. Switching to Optimized OCR...");

    // ---------- ATTEMPT 2: OPTIMIZED OCR ----------
    
    // 1. Setup Canvas
    const viewport = page.getViewport({ scale: 1.5 }); // Good balance of quality vs size
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // 2. CROP: Render top 50% of the page 
    // (Increased from 30% to ensure we catch headers lower down)
    const cropHeight = viewport.height * 0.5; 

    canvas.width = viewport.width;
    canvas.height = cropHeight;

    await page.render({
      canvasContext: context,
      viewport,
      transform: [1, 0, 0, 1, 0, 0] // No offset needed
    }).promise;

    // 3. COMPRESS: Export as JPEG 0.7 (Small file size)
    const imageBlob = await new Promise(resolve =>
      canvas.toBlob(resolve, "image/jpeg", 0.7)
    );

    if (!imageBlob) {
      console.error("❌ Failed to create image blob");
      return null;
    }

    // 4. CALL API
    const ocrText = await queryOCRSpace(imageBlob);

    if (ocrText) {
      // DEBUG: See what OCR actually returned
      console.log(`📝 OCR RAW TEXT (Partial): "${ocrText.substring(0, 100).replace(/\n/g, ' ')}..."`);

      // 5. CLEAN & MATCH
      const cleanOcrText = cleanString(ocrText);
      const ocrMatch = cleanOcrText.match(doRegex);

      if (ocrMatch) {
        console.log(`🎯 Found via OCR: ${ocrMatch[1]}`);
        return ocrMatch[1];
      } else {
        console.warn("❌ Regex failed on OCR text.");
      }
    } else {
      console.warn("❌ OCR returned no text.");
    }

    return null;

  } catch (error) {
    console.error("Extraction Logic Error:", error);
    return null;
  }
};