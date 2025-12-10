import { useState, useCallback } from "react";
import {
  extractTextFromImage,
  processDocumentBatch,
  structureExtractedData,
  isOCRConfigured,
} from "../services/ocr";

/**
 * Custom Hook for OCR Operations
 * Simplifies OCR functionality in components
 *
 * Usage:
 * const {
 *   isProcessing,
 *   results,
 *   error,
 *   processFile,
 *   processBatch,
 *   reset
 * } = useOCR();
 */
export const useOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);

  // Process a single file
  const processFile = useCallback(async (file) => {
    if (!isOCRConfigured()) {
      setError("OCR service is not configured");
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await extractTextFromImage(file);
      setResults((prev) => ({
        ...prev,
        [file.name]: result,
      }));
      return result;
    } catch (err) {
      const errorMsg = err.message || "Failed to process file";
      setError(errorMsg);
      return {
        success: false,
        error: errorMsg,
        fileName: file.name,
      };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Process multiple files
  const processBatch = useCallback(async (files) => {
    if (!isOCRConfigured()) {
      setError("OCR service is not configured");
      return [];
    }

    setIsProcessing(true);
    setError(null);

    try {
      const batchResults = await processDocumentBatch(files);
      const newResults = {};
      batchResults.forEach((result) => {
        newResults[result.fileName] = result;
      });
      setResults((prev) => ({
        ...prev,
        ...newResults,
      }));
      return batchResults;
    } catch (err) {
      const errorMsg = err.message || "Batch processing failed";
      setError(errorMsg);
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Structure extracted data
  const structureData = useCallback(async (extraction) => {
    if (!extraction.success) {
      return extraction;
    }

    setIsProcessing(true);

    try {
      const structured = await structureExtractedData(extraction);
      setResults((prev) => ({
        ...prev,
        [extraction.fileName]: structured,
      }));
      return structured;
    } catch (err) {
      setError(err.message || "Failed to structure data");
      return extraction;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Get successful results only
  const getSuccessfulResults = useCallback(() => {
    return Object.values(results).filter((r) => r.success);
  }, [results]);

  // Get failed results only
  const getFailedResults = useCallback(() => {
    return Object.values(results).filter((r) => !r.success);
  }, [results]);

  // Clear all results
  const reset = useCallback(() => {
    setResults({});
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    isProcessing,
    results,
    error,
    processFile,
    processBatch,
    structureData,
    getSuccessfulResults,
    getFailedResults,
    reset,
  };
};
