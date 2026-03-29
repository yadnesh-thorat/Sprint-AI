const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

// Helper to get genAI instance lazily to ensure env vars are loaded
let genAIInstance = null;
const getGenAI = () => {
    if (!genAIInstance) {
        if (!process.env.GEMINI_API_KEY) {
            console.error('CRITICAL: GEMINI_API_KEY is not defined in process.env');
        }
        genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAIInstance;
};

// Helper for Groq
let groqInstance = null;
const getGroq = () => {
    if (!groqInstance) {
        if (!process.env.GROQ_API_KEY) {
            console.error('CRITICAL: GROQ_API_KEY is not defined in process.env');
        }
        groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groqInstance;
};

const buildPrompt = (srs, team, deadline) => {
    return `You are an Agile Product Manager and Technical Architect AI.
I am providing you with a Software Requirement Specification (SRS) document, along with our team structure and deadline.
SRS CONTENT:
${srs}

TEAM STRUCTURE:
${team}

DEADLINE:
${deadline}

Create Epics, User Stories, and Tasks based on the SRS. 

CORE REQUIREMENTS:
1. DESCRIPTIONS: For each task, provide a detailed technical description (3-5 sentences). Include the "Why", "What", and "How" (e.g., "Implement registration API with JWT: The goal is to allow user signups. Create a POST endpoint /api/register, hash passwords using bcrypt, and return a signed JWT token on success. Ensure email uniqueness is checked in the database.")
2. LIMITS: Consider the deadline and limit total estimated_hours for tasks appropriately.
3. ROLES: Only use roles from the team structure (e.g. FE, BE, DB).

Return the output STRICTLY in the following JSON format without any other text:
{
  "epics": [
    {
      "title": "",
      "stories": [
        {
          "title": "",
          "description": "",
          "acceptance_criteria": [""],
          "priority": "High|Medium|Low",
          "tasks": [
            {
              "title": "",
              "description": "",
              "estimated_hours": 0.0,
              "story_points": 1,
              "assigned_role": "FE|BE|DB"
            }
          ]
        }
      ]
    }
  ]
}`;
};

const generateWithGroq = async (prompt) => {
    console.log('Attempting generation with Groq (Fallback)...');
    const groq = getGroq();
    const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        response_format: { type: 'json_object' }
    });
    
    const text = chatCompletion.choices[0].message.content;
    return JSON.parse(text);
};

const generateAgileBoardFromSrs = async (srsContent, teamStructure, deadlineString) => {
    const prompt = buildPrompt(srsContent, teamStructure, deadlineString);
    
    try {
        const genAI = getGenAI();
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        console.log('Sending request to Gemini...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        console.log('Received response from Gemini');

        if (text.startsWith("```json")) {
            text = text.substring(7);
        }
        if (text.startsWith("```")) {
            text = text.substring(3);
        }
        if (text.endsWith("```")) {
            text = text.substring(0, text.length - 3);
        }

        return JSON.parse(text.trim());
    } catch (error) {
        console.error('Gemini API failed, falling back to Groq:', error.message);
        try {
            return await generateWithGroq(prompt);
        } catch (groqError) {
            console.error('Groq Fallback also failed:', groqError.message);
            throw new Error(`AI Generation failed (Gemini: ${error.message}, Groq: ${groqError.message})`);
        }
    }
};

module.exports = {
    generateAgileBoardFromSrs
};
