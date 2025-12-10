// OCR Service with OpenAI Vision API for document processing
// Supports images and PDFs with batch processing and custom settings
import { apiService } from "./api";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

/**
 * PDF Processing utility
 * Sends PDF to OpenAI Vision API for text extraction
 */
export const processPDFFile = async (file) => {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "VITE_OPENAI_API_KEY is not configured in environment variables"
    );
  }

  try {
    // Convert PDF to base64
    const base64Data = await fileToBase64(file);

    // Call OpenAI Vision API with PDF
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: base64Data,
                },
              },
              {
                type: "text",
                text: "Extract and return ALL text from this PDF document. Format the output clearly with proper structure, preserving any tables, lists, or special formatting. Return the text in plain text format.",
              },
            ],
          },
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenAI API Error: ${error.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    const extractedText = data.choices[0]?.message?.content || "";

    return {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      extractedText,
      model: "gpt-4o",
      usage: data.usage,
      isPDF: true,
    };
  } catch (error) {
    console.error("PDF processing error:", error);
    return {
      success: false,
      fileName: file.name,
      error: error.message || "Failed to process PDF. Please try again.",
      isPDF: true,
    };
  }
};

/**
 * Convert file to base64 for OpenAI API
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 encoded file
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Extract text from image using OpenAI Vision API
 * @param {File} file - Image file (JPG, PNG, GIF, WEBP)
 * @returns {Promise<object>} - Extracted text and metadata
 */
export const extractTextFromImage = async (file) => {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "VITE_OPENAI_API_KEY is not configured in environment variables"
    );
  }

  try {
    // Check file type
    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!supportedTypes.includes(file.type)) {
      throw new Error(
        `Unsupported file type: ${file.type}. Supported: JPEG, PNG, GIF, WEBP`
      );
    }

    // Convert file to base64
    const base64Data = await fileToBase64(file);
    const base64String = base64Data.split(",")[1];

    // Call OpenAI Vision API
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: base64Data,
                },
              },
              {
                type: "text",
                text: "Extract and return ALL text from this document/image. Format the output clearly with proper structure, preserving any tables, lists, or special formatting. Return the text in plain text format.",
              },
            ],
          },
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `OpenAI API Error: ${error.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    const extractedText = data.choices[0]?.message?.content || "";

    return {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      extractedText,
      model: "gpt-4o",
      usage: data.usage,
    };
  } catch (error) {
    console.error("OCR Error:", error);
    return {
      success: false,
      error: error.message,
      fileName: file.name,
    };
  }
};

/**
 * Universal file processor - handles both images and PDFs
 * @param {File} file - File to process (image or PDF)
 * @returns {Promise<object>} - Extracted text and metadata
 */
export const processFile = async (file) => {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "VITE_OPENAI_API_KEY is not configured in environment variables"
    );
  }

  if (file.type === "application/pdf") {
    return await processPDFFile(file);
  } else if (
    ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)
  ) {
    return await extractTextFromImage(file);
  } else {
    return {
      success: false,
      fileName: file.name,
      error: `Unsupported file type: ${file.type}. Supported: PDF, JPEG, PNG, GIF, WEBP`,
    };
  }
};

/**
 * Process multiple documents (batch OCR)
 * @param {File[]} files - Array of image files
 * @returns {Promise<object[]>} - Array of extraction results
 */
export const processDocumentBatch = async (files) => {
  const results = [];

  for (const file of files) {
    try {
      const result = await extractTextFromImage(file);
      results.push(result);

      // Add delay between API calls to avoid rate limiting
      if (files.indexOf(file) < files.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      results.push({
        success: false,
        fileName: file.name,
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * Process and structure extracted data
 * @param {object} extraction - Result from extractTextFromImage
 * @returns {Promise<object>} - Structured data ready for backend
 */
export const structureExtractedData = async (extraction) => {
  if (!extraction.success) {
    return extraction;
  }

  try {
    // Call OpenAI to structure the extracted text
    if (!OPENAI_API_KEY) {
      throw new Error("VITE_OPENAI_API_KEY is not configured");
    }

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a data extraction expert. Extract and structure data from documents into JSON format. Be accurate and preserve all information.",
          },
          {
            role: "user",
            content: `Extract and structure the following text into JSON format with appropriate fields. Identify document type, key information, and line items if any.\n\nText:\n${extraction.extractedText}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to structure data: ${error.error?.message}`);
    }

    const data = await response.json();
    const structuredContent = data.choices[0]?.message?.content || "";

    return {
      ...extraction,
      structuredData: structuredContent,
      isStructured: true,
    };
  } catch (error) {
    console.error("Data Structuring Error:", error);
    return {
      ...extraction,
      isStructured: false,
      structuringError: error.message,
    };
  }
};

/**
 * Validate API key is configured
 * @returns {boolean} - True if API key is configured
 */
export const isOCRConfigured = () => {
  return !!OPENAI_API_KEY;
};

/**
 * Get OCR configuration status
 * @returns {object} - Configuration status information
 */
export const getOCRStatus = () => {
  return {
    configured: !!OPENAI_API_KEY,
    apiKeySet: !!OPENAI_API_KEY,
    message: OPENAI_API_KEY
      ? "OCR service is ready"
      : "OCR service not configured. Please set VITE_OPENAI_API_KEY in environment variables",
  };
};
