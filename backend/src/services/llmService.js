const { GoogleGenerativeAI } = require("@google/generative-ai");

// Helper function to extract JSON from Gemini response
const extractJsonFromResponse = (responseText) => {
  // Extract JSON from markdown code blocks if present
  let jsonText = responseText;

  // Try to find JSON in ```json blocks first
  if (responseText.includes("```json")) {
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
  }
  // Try to find JSON in generic ``` blocks
  else if (responseText.includes("```")) {
    const jsonMatch = responseText.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
  }

  // Clean up any remaining markdown artifacts
  jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");

  return jsonText;
};

const generatePassageFromLLM = async ({
  apiKey,
  modelName = process.env.LLM_MODEL_NAME || "gemini-2.0-flash",
  prompt,
  maxTokens = 600,
}) => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent([
      "You are an expert English language teacher creating educational content. Always respond with valid JSON only. Do not use markdown formatting or code blocks - return pure JSON.",
      prompt,
    ]);

    const responseText = result.response.text();
    const jsonText = extractJsonFromResponse(responseText);
    return jsonText;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error(`Gemini API failed: ${error.message}`);
  }
};

module.exports = { generatePassageFromLLM };
