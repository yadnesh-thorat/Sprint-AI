const pdfParse = require('pdf-parse');

const extractTextFromPdf = async (buffer) => {
    try {
        const data = await pdfParse(buffer);
        if (!data.text || data.text.trim() === '') {
            throw new Error("No text could be extracted from the PDF.");
        }
        return data.text.trim();
    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw new Error("Error reading PDF file");
    }
};

module.exports = {
    extractTextFromPdf
};
