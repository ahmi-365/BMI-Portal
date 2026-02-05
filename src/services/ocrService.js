import * as pdfjsLib from "pdfjs-dist";

// Initialize PDF Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * ============================
 * HELPER: ROBUST SANITIZER
 * ============================
 * Converts OCR garbage into a clean stream of digits.
 * e.g., "DO No: S1OO 614 866" -> "5100614866"
 */
const sanitizeToDigits = (str) => {
  if (!str) return "";
  return str
    .toUpperCase()
    // 1. Fix common letter-to-number OCR errors
    .replace(/[S]/g, "5")  // S -> 5
    .replace(/[O]/g, "0")  // O -> 0
    .replace(/[I|L]/g, "1") // I or l -> 1
    .replace(/[Z]/g, "2")  // Z -> 2
    // 2. Remove EVERYTHING that is not a digit
    .replace(/\D/g, "");   // \D matches non-digits
};

const queryOCRSpace = async (imageBlob) => {
  const formData = new FormData();
  formData.append("file", imageBlob, "document.png");
  formData.append("apikey", "K88622409788957"); // Use your own key if this hits limits
  formData.append("language", "eng");
  formData.append("scale", "true");
  formData.append("OCREngine", "2"); // Engine 2 is best for numbers
  formData.append("filetype", "png");

  try {
    const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 190000);
    console.log("🚀 Sending to OCR...");
    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
      signal: controller.signal,
      priority: 'high'
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();

    if (result.IsErroredOnProcessing) {
      console.error("OCR API Error:", result.ErrorMessage);
      return null;
    }

    return result.ParsedResults?.[0]?.ParsedText || "";

  } catch (error) {
    console.error("OCR Request Failed:", error);
    return null;
  }
};

/**
 * ============================
 * MAIN EXTRACTOR
 * ============================
 */
export const extractDoNoFromPdf = async (file) => {
  try {
    console.log(`📄 Processing: ${file.name}`);
    
    // --- STRATEGY 0: FILENAME (If DO number is in filename) ---
    const filenameMatch = file.name.match(/(\d{2}-)?(51\d{8})/);
    if (filenameMatch) {
      const doFromFilename = filenameMatch[2];
      console.log(`📁 Found in filename: ${doFromFilename}`);
      // Still verify it exists in the document, but use filename as strong hint
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    // REGEX: Look for "DO No" followed by the 10-digit number
    const doRegex = /DO\s*No[:\s.]*([5S][1Il]\d{8})/i;
    const fallbackRegex = /(51\d{8})/; // Fallback if DO No: label not found

    // --- STRATEGY 1: TEXT LAYER (Fastest) ---
    try {
      const textContent = await page.getTextContent();
      const rawText = textContent.items.map(item => item.str).join(" ");
      
      // First try to find "DO No:" pattern
      const doMatch = rawText.match(doRegex);
      if (doMatch) {
        const cleaned = sanitizeToDigits(doMatch[1]);
        if (cleaned.length === 10 && cleaned.startsWith('51')) {
          console.log(`⚡ Found via Text Layer: ${cleaned}`);
          return cleaned;
        }
      }
      
      // Fallback: sanitize and search
      const cleanRaw = sanitizeToDigits(rawText);
      const textMatch = cleanRaw.match(fallbackRegex);
      if (textMatch) {
        console.log(`⚡ Found via Text Layer (fallback): ${textMatch[1]}`);
        return textMatch[1];
      }
    } catch (e) {
      console.warn("Text layer check failed, moving to OCR");
    }

    // --- STRATEGY 2: OCR (Fallback) ---
    console.log("⚠️ Text layer empty/nomatch. Switching to OCR...");

    const viewport = page.getViewport({ scale: 2.0 }); // High scale for clarity
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Crop top 50% to focus on header
    canvas.width = viewport.width;
    canvas.height = viewport.height * 0.5;

    await page.render({
      canvasContext: context,
      viewport,
      transform: [1, 0, 0, 1, 0, 0]
    }).promise;

    const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));

    if (!imageBlob) return null;

    const ocrText = await queryOCRSpace(imageBlob);

    if (ocrText) {
      console.log("📝 OCR Raw Output:", ocrText.substring(0, 300) + "...");

      // Strategy 1: Find "DO No:" pattern directly
      const ocrDoMatch = ocrText.match(doRegex);
      if (ocrDoMatch) {
        const cleaned = sanitizeToDigits(ocrDoMatch[1]);
        if (cleaned.length === 10 && cleaned.startsWith('51')) {
          console.log(`🎯 Found via OCR (with DO No context): ${cleaned}`);
          return cleaned;
        }
      }

      // Strategy 2: Look for the pattern in lines containing "DO" or near "Received"
      const lines = ocrText.split('\n');
      for (let line of lines) {
        // Skip lines that mention "Sold-To" or "Ship-To" to avoid false matches
        if (line.match(/sold[\s-]*to|ship[\s-]*to/i)) continue;
        
        // Look for lines with "DO", "No", or appear after "Received" text
        if (line.match(/DO|No\.|Received/i)) {
          const cleaned = sanitizeToDigits(line);
          const match = cleaned.match(/(51\d{8})/);
          if (match) {
            console.log(`🎯 Found via OCR (line scan): ${match[1]} from line: "${line.substring(0, 50)}..."`);
            return match[1];
          }
        }
      }

      // Strategy 3: Find ALL 10-digit numbers starting with 51 and score them
      const digitsOnly = sanitizeToDigits(ocrText);
      console.log("🔢 Sanitized Digits:", digitsOnly.substring(0, 500) + "...");
      
      const allMatches = [];
      for (let i = 0; i < digitsOnly.length - 9; i++) {
        const candidate = digitsOnly.substring(i, i + 10);
        if (candidate.startsWith('51') && /^\d{10}$/.test(candidate)) {
          // Calculate score based on context
          let score = 0;
          
          // Find approximate position in original text
          let foundInOriginal = false;
          const searchPattern = candidate.split('').join('[^0-9]{0,3}'); // Allow up to 3 non-digits between each digit
          const regex = new RegExp(searchPattern);
          const match = ocrText.match(regex);
          
          if (match) {
            const matchPos = ocrText.indexOf(match[0]);
            const contextBefore = ocrText.substring(Math.max(0, matchPos - 100), matchPos);
            const contextAfter = ocrText.substring(matchPos, Math.min(ocrText.length, matchPos + match[0].length + 50));
            
            // Score based on nearby keywords
            if (contextBefore.match(/DO\s*No|DO\s*Date|Received/i)) score += 100;
            if (contextAfter.match(/DO\s*Date|PO\s*No|Order\s*No/i)) score += 50;
            
            // Penalize if near "Sold-To" or "Ship-To"
            if (contextBefore.match(/Sold[\s-]*To|Ship[\s-]*To/i)) score -= 200;
            
            // Prefer numbers in the right half of the document (DO No comes after header)
            if (matchPos > ocrText.length / 3) score += 30;
            
            foundInOriginal = true;
          }
          
          // Additional scoring: prefer realistic DO numbers
          // Valid DO numbers shouldn't have too many repeated digits
          const repeatedDigits = candidate.match(/(.)\1{3,}/);
          if (repeatedDigits) score -= 50;
          
          // Prefer numbers with variety (5100614866 is more realistic than 5110110110)
          const uniqueDigits = new Set(candidate.split('')).size;
          score += uniqueDigits * 5;
          
          allMatches.push({ 
            candidate, 
            position: i, 
            score,
            foundInOriginal 
          });
        }
      }

      if (allMatches.length > 0) {
        // Sort by score (highest first)
        allMatches.sort((a, b) => b.score - a.score);
        
        console.log(`📋 Found ${allMatches.length} candidates (sorted by score):`);
        allMatches.slice(0, 5).forEach((m, idx) => {
          console.log(`  ${idx + 1}. ${m.candidate} (score: ${m.score})`);
        });
        
        // If we have a filename match, check for close matches (1-2 digit differences)
        if (filenameMatch) {
          const filenameNum = filenameMatch[2];
          for (let match of allMatches) {
            let diffCount = 0;
            for (let i = 0; i < 10; i++) {
              if (match.candidate[i] !== filenameNum[i]) diffCount++;
            }
            // If only 1-2 digits differ, it's likely OCR error - use filename version
            if (diffCount <= 2) {
              console.log(`🔍 Found close match to filename: ${match.candidate} vs ${filenameNum} (${diffCount} diffs)`);
              console.log(`✅ Using filename version (more reliable): ${filenameNum}`);
              return filenameNum;
            }
          }
        }
        
        const selected = allMatches[0].candidate;
        console.log(`🎯 Selected highest scoring: ${selected}`);
        return selected;
      }

      console.warn("❌ No valid DO number found in OCR text");
    }

    // --- STRATEGY 4: FILENAME FALLBACK ---
    if (filenameMatch) {
      console.log(`🔙 Falling back to filename: ${filenameMatch[2]}`);
      return filenameMatch[2];
    }

    return null;

  } catch (error) {
    console.error("Extraction Logic Error:", error);
    return null;
  }
};