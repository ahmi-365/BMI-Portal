/**
 * OCR.space API integration for batch uploads
 * Free OCR API - no API key required for basic usage
 */

/**
 * Call OCR.space API to extract text from an image
 */
async function callOCRSpaceAPI(file) {
  const formData = new FormData();
  // OCR.space expects either `file` (multipart upload) or `base64Image`.
  // Do NOT send arbitrary parameters like `filename` or `filetype` (they are invalid).
  formData.append("apikey", "K86875111988957"); // Free tier key (replace with your own if available)
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("file", file);

  try {
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR.space API error: ${response.statusText}`);
    }

    const data = await response.json();

    // OCR.space returns `IsErroredOnProcessing` and `ParsedResults` array
    if (data.IsErroredOnProcessing) {
      const msg = Array.isArray(data.ErrorMessage)
        ? data.ErrorMessage.join(" | ")
        : data.ErrorMessage || "Unknown OCR.space error";
      throw new Error(msg);
    }

    if (data.ParsedResults && data.ParsedResults.length > 0) {
      return data.ParsedResults[0].ParsedText || "";
    }

    return "";
  } catch (error) {
    console.error("OCR.space API error:", error);
    throw error;
  }
}

/**
 * Process an image file using OCR.space
 */
export async function processImageFile(file) {
  try {
    const extractedText = await callOCRSpaceAPI(file);

    return {
      success: true,
      extractedText,
      engine: "ocr-space",
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  } catch (error) {
    console.error("Image processing error:", error);
    return {
      success: false,
      error: error.message,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  }
}

/**
 * Process a PDF file using OCR.space
 * Note: OCR.space has a 1MB file size limit on free tier
 */
export async function processPDFFile(file) {
  // Check file size (1MB = 1048576 bytes)
  if (file.size > 1048576) {
    return {
      success: false,
      error:
        "File size exceeds 1MB limit. Please use a smaller PDF or compress the file.",
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  }

  try {
    const extractedText = await callOCRSpaceAPI(file);

    return {
      success: true,
      extractedText,
      engine: "ocr-space",
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  } catch (error) {
    console.error("PDF processing error:", error);
    return {
      success: false,
      error: error.message,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  }
}

/**
 * Universal file processor - handles both PDFs and images
 */
export async function processFile(file) {
  const mimeType = file.type.toLowerCase();

  if (mimeType.includes("pdf")) {
    return processPDFFile(file);
  } else if (
    mimeType.includes("image") ||
    mimeType.includes("jpeg") ||
    mimeType.includes("png") ||
    mimeType.includes("gif") ||
    mimeType.includes("webp")
  ) {
    return processImageFile(file);
  } else {
    return {
      success: false,
      error: `Unsupported file type: ${mimeType}. Supported: PDF, JPEG, PNG, GIF, WEBP`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };
  }
}

/**
 * Parse invoice data from OCR text using regex patterns
 */
export async function parseInvoiceFromOCR(ocrText) {
  try {
    if (!ocrText || ocrText.trim().length === 0) {
      return {
        success: false,
        error: "No text extracted",
        invoice: null,
      };
    }

    // Extract invoice number
    const invoiceNoMatch =
      ocrText.match(/Invoice\s*(?:#|No\.?|Number)?\s*:?\s*([A-Z0-9]+)/i) ||
      ocrText.match(/(?:INV|Invoice|INVOICE)\s*[:\-]?\s*([A-Z0-9]+)/i) ||
      ocrText.match(/^([A-Z0-9]{8,})/m);
    const invoiceNo = invoiceNoMatch ? invoiceNoMatch[1].trim() : "N/A";

    // Extract invoice date
    const dateMatch = ocrText.match(
      /(?:Date|Invoice Date|Issued)\s*[:\-]?\s*(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4})/i
    );
    const invoiceDate = dateMatch ? dateMatch[1].trim() : "N/A";

    // Extract customer information
    const billToMatch = ocrText.match(
      /Bill\s*To\s*[:\-]?\s*(.+?)(?=Ship|Amount|Invoice|$)/is
    );
    const billTo = billToMatch ? billToMatch[1].trim() : "N/A";

    // Extract total amount
    const totalMatch =
      ocrText.match(
        /(?:Total|Grand Total|Amount Due)\s*[:\-]?\s*\$?([0-9]+[.,][0-9]{2})/i
      ) || ocrText.match(/\$?([0-9]+[.,][0-9]{2})\s*(?:Total|USD|$)/i);
    const totalAmount = totalMatch ? totalMatch[1].trim() : "0.00";

    // Extract company info (usually at top of invoice)
    const companyMatch = ocrText.match(
      /^(.*?)(?=Invoice|Bill|Date|Customer)/is
    );
    const companyInfo = companyMatch
      ? companyMatch[1].trim().split("\n")[0]
      : "N/A";

    // Extract line items (simplified pattern)
    const lineItemsMatch = ocrText.match(
      /(?:Items?|Description)[\s\S]*?(?:Total|Amount|$)/i
    );
    const lineItems = lineItemsMatch ? lineItemsMatch[0].trim() : "N/A";

    const invoice = {
      invoiceNo,
      invoiceDate,
      billTo,
      items: lineItems,
      totalAmount,
      companyInfo,
      extractedAt: new Date().toISOString(),
    };

    return {
      success: true,
      invoice,
    };
  } catch (error) {
    console.error("Invoice parsing error:", error);
    return {
      success: false,
      error: error.message,
      invoice: null,
    };
  }
}

/**
 * Process multiple documents in a batch
 */
export async function processDocumentBatch(files) {
  const results = [];

  for (const file of files) {
    const result = await processFile(file);
    results.push(result);

    // Add delay between files to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Check if OCR is configured
 */
export function isOCRConfigured() {
  return true; // OCR.space is always available with free key
}

/**
 * Get OCR status
 */
export function getOCRStatus() {
  return {
    configured: true,
    engine: "ocr-space",
    apiKeySet: true,
    note: "Using OCR.space free tier (1MB file limit)",
  };
}
