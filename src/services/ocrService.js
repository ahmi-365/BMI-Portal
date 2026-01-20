import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  formData.append("file", imageBlob, "document.png");
  formData.append("apikey", "K87899142388957"); // free public key
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("detectOrientation", "true");
  formData.append("scale", "true");
  formData.append("OCREngine", "2");

  try {
    console.log("🔍 Running OCR.space API...");

    const response = await fetch(
      "https://api.ocr.space/parse/image",
      { method: "POST", body: formData }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result.IsErroredOnProcessing) {
      console.error("OCR.space Processing Error:", {
        message: result.ErrorMessage,
        details: result.ErrorDetails,
        time: result.ProcessingTimeInMilliseconds,
      });
      return null;
    }

    const text = result.ParsedResults?.[0]?.ParsedText || "";
    console.log("  OCR.space Success");
    return text;

  } catch (error) {
    console.error("OCR.space API Error:", error);

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

    const doPattern = /\b(51\d{8})\b/;

    // ---------- ATTEMPT 1: TEXT LAYER ----------
    const rawText = await extractTextLayer(page);
    const textMatch = rawText.match(doPattern);

    if (textMatch) {
      console.log(`⚡ Found via Text Layer: ${textMatch[1]}`);
      return textMatch[1];
    }

    console.log("⚠️ Text layer empty. Switching to OCR...");

    // ---------- ATTEMPT 2: OCR ----------
    const viewport = page.getViewport({ scale: 1.2 }); //   reduced scale
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    const imageBlob = await new Promise(resolve =>
      canvas.toBlob(resolve, "image/png")
    );

    if (!imageBlob) {
      console.error("❌ Failed to create image blob");
      return null;
    }

    const ocrText = await queryOCRSpace(imageBlob);

    if (ocrText) {
      console.log("📄 OCR Raw Output:", ocrText);
      const ocrMatch = ocrText.match(doPattern);

      if (ocrMatch) {
        console.log(`  Found via OCR: ${ocrMatch[1]}`);
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
