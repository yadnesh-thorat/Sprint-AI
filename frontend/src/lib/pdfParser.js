/**
 * High-performance PDF to Clean Markdown converter & Zero-Token Optimizer.
 * Dynamically loads PDF.js on-demand to guarantee 100% Vite compatibility across all environments.
 */

let pdfjsLibInstance = null;

async function getPdfJs() {
  if (pdfjsLibInstance) return pdfjsLibInstance;

  if (typeof window !== 'undefined' && window.pdfjsLib) {
    pdfjsLibInstance = window.pdfjsLib;
    return pdfjsLibInstance;
  }

  // Dynamically load PDF.js from official CDN without breaking Vite static imports
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Window not defined'));
    }

    if (window.pdfjsLib) {
      pdfjsLibInstance = window.pdfjsLib;
      return resolve(pdfjsLibInstance);
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        pdfjsLibInstance = window.pdfjsLib;
        resolve(pdfjsLibInstance);
      } else {
        reject(new Error('PDF.js failed to initialize from script'));
      }
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

/**
 * Estimate tokens based on standard GPT/Gemini tokenization rule (~4 chars/token for English text)
 */
export function estimateTokenCount(text) {
  if (!text) return 0;
  return Math.ceil(text.trim().length / 4);
}

/**
 * High-performance PDF to Clean Markdown converter
 * Strips boilerplate headers/footers, extracts hierarchy & headings, and minimizes AI tokens by up to 90%.
 */
export async function convertPdfToMarkdown(file) {
  try {
    const pdfjs = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    let fullMarkdown = '';
    let totalExtractedChars = 0;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      if (!textContent || !textContent.items || textContent.items.length === 0) {
        continue;
      }

      // Group text items by vertical line (Y coordinate)
      const lines = [];
      let currentY = null;
      let currentLineItems = [];

      // Sort items top-to-bottom, left-to-right
      const items = [...textContent.items].filter(i => i.str && i.str.trim().length > 0);
      items.sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 4) return yDiff;
        return a.transform[4] - b.transform[4];
      });

      for (const item of items) {
        const itemY = Math.round(item.transform[5]);
        if (currentY === null || Math.abs(itemY - currentY) > 5) {
          if (currentLineItems.length > 0) {
            lines.push(currentLineItems.join(' ').trim());
            currentLineItems = [];
          }
          currentY = itemY;
        }
        currentLineItems.push(item.str.trim());
      }
      if (currentLineItems.length > 0) {
        lines.push(currentLineItems.join(' ').trim());
      }

      // Filter out boilerplate (page numbers, recurring confidentiality banners)
      const cleanedLines = lines.filter(line => {
        const isPageNumber = /^(page\s*\d+(\s*of\s*\d+)?|\d+\s*\/\s*\d+|\d+)$/i.test(line);
        const isFooterNote = /^(confidential|all rights reserved|internal use only|proprietary|draft)/i.test(line);
        return !isPageNumber && !isFooterNote;
      });

      // Format semantic Markdown
      const pageMarkdown = cleanedLines.map(line => {
        // Section Headings: e.g. "1.0 Overview", "Section 3: API Requirements", "FUNCTIONAL REQUIREMENTS"
        if (/^(\d+\.[\d\.]*|[A-Z\s]{4,}:?)\s+[A-Za-z]/i.test(line) && line.length < 90) {
          return `\n### ${line}\n`;
        }
        // Major Headings (All-caps short lines)
        if (line === line.toUpperCase() && line.length > 3 && line.length < 50 && !/^\d+$/.test(line)) {
          return `\n## ${line}\n`;
        }
        // Bullet points
        if (/^[•\-\*\u2022\u25E6]\s*/.test(line)) {
          return `- ${line.replace(/^[•\-\*\u2022\u25E6]\s*/, '')}`;
        }
        // Numbered list items
        if (/^\d+[\.\)]\s+/.test(line)) {
          return line;
        }
        return line;
      }).join('\n');

      if (pageMarkdown.trim()) {
        fullMarkdown += `\n\n<!-- Page ${pageNum} -->\n${pageMarkdown}`;
        totalExtractedChars += pageMarkdown.length;
      }
    }

    const cleanMarkdown = fullMarkdown
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Check if the PDF was a scanned image (almost zero text extracted)
    if (cleanMarkdown.length < 30) {
      return fallbackToBase64(file, numPages);
    }

    // Calculate token compression statistics
    const rawPdfTokensEstimate = numPages * 800; // Average multimodal token consumption per PDF page
    const optimizedTokens = estimateTokenCount(cleanMarkdown);
    const tokensSavedPercent = Math.max(0, Math.min(95, Math.round(((rawPdfTokensEstimate - optimizedTokens) / rawPdfTokensEstimate) * 100)));

    return {
      isScannedFallback: false,
      markdown: cleanMarkdown,
      numPages,
      pdfBase64: null,
      originalEstimatedTokens: rawPdfTokensEstimate,
      optimizedTokens,
      tokensSavedPercent
    };

  } catch (error) {
    console.warn('PDF to Markdown conversion fallback:', error);
    return fallbackToBase64(file, 1);
  }
}

function fallbackToBase64(file, numPages = 1) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = typeof result === 'string' && result.includes(',') ? result.split(',')[1] : result;
      resolve({
        isScannedFallback: true,
        markdown: '',
        numPages: numPages || 1,
        pdfBase64: base64,
        originalEstimatedTokens: (numPages || 1) * 800,
        optimizedTokens: (numPages || 1) * 800,
        tokensSavedPercent: 0
      });
    };
    reader.onerror = () => {
      resolve({
        isScannedFallback: true,
        markdown: '',
        numPages: 1,
        pdfBase64: '',
        originalEstimatedTokens: 800,
        optimizedTokens: 800,
        tokensSavedPercent: 0
      });
    };
    reader.readAsDataURL(file);
  });
}
