const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "your-gemini-api-key-here"
);

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

// Helper function to retry API calls with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Check if it's a rate limit error
      if (
        error.status === 429 ||
        error.message.includes("429") ||
        error.message.includes("Too Many Requests")
      ) {
        if (attempt === maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(
          `⏳ Rate limit hit, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // For non-rate-limit errors, throw immediately
      throw error;
    }
  }
};

// Generate lesson content for a specific section and level
const generateLessonContent = async (section, level, lessonNumber = 1) => {
  const sectionPrompts = {
    vocabulary: `Generate a ${level} level English vocabulary lesson (Lesson ${lessonNumber}). 
    Create:
    1. A lesson title
    2. 8-10 vocabulary words with definitions, examples, and usage
    3. Interactive exercises (fill-in-the-blank, matching, etc.)
    4. A brief explanation of the vocabulary topic
    
    Return in this JSON format:
    {
      "title": "Lesson Title",
      "section": "vocabulary",
      "level": "${level}",
      "lessonNumber": ${lessonNumber},
      "introduction": "Brief introduction to the lesson",
      "vocabulary": [
        {
          "word": "word",
          "definition": "definition",
          "example": "example sentence",
          "synonyms": ["synonym1", "synonym2"],
          "difficulty": "${level}"
        }
      ],
      "exercises": [
        {
          "type": "fill_blank",
          "question": "Complete the sentence: The weather is very ___ today.",
          "options": ["sunny", "rainy", "cloudy", "windy"],
          "correctAnswer": "sunny",
          "explanation": "Explanation of why this is correct"
        }
      ],
      "summary": "Brief summary of what was learned"
    }
    
    Requirements:
    - Vocabulary should be appropriate for ${level} level
    - Include practical, commonly used words
    - Provide clear definitions and examples
    - Create 3-4 interactive exercises
    - IMPORTANT: Every exercise MUST include an "explanation" string explaining the answer
    - For matching exercises, also include an explanation summarizing why each word matches its meaning
    - Use engaging, educational language`,

    grammar: `Generate a ${level} level English grammar lesson (Lesson ${lessonNumber}).
    Create:
    1. A lesson title focusing on a specific grammar topic
    2. Clear explanation of the grammar rule
    3. Examples and usage patterns
    4. Interactive exercises to practice the grammar
    
    Return in this JSON format:
    {
      "title": "Lesson Title",
      "section": "grammar",
      "level": "${level}",
      "lessonNumber": ${lessonNumber},
      "introduction": "Introduction to the grammar topic",
      "grammarRule": {
        "name": "Grammar Rule Name",
        "explanation": "Detailed explanation of the rule",
        "formula": "Rule formula or pattern",
        "examples": [
          {
            "sentence": "Example sentence",
            "explanation": "Why this is correct"
          }
        ]
      },
      "exercises": [
        {
          "type": "multiple_choice",
          "question": "Choose the correct form:",
          "options": ["option1", "option2", "option3", "option4"],
          "correctAnswer": "correct option",
          "explanation": "Explanation of the answer"
        }
      ],
      "summary": "Summary of the grammar rule learned"
    }
    
    Requirements:
    - Focus on one specific grammar topic per lesson
    - Use ${level} level appropriate complexity
    - Provide clear explanations and examples
    - Create 3-4 practice exercises
    - IMPORTANT: Every exercise MUST include an "explanation" string
    - Make it practical and applicable`,

    punctuation: `Generate a ${level} level English punctuation lesson (Lesson ${lessonNumber}).
    Create:
    1. A lesson title focusing on punctuation rules
    2. Clear explanation of punctuation usage
    3. Examples of correct punctuation
    4. Interactive exercises to practice punctuation
    
    Return in this JSON format:
    {
      "title": "Lesson Title",
      "section": "punctuation",
      "level": "${level}",
      "lessonNumber": ${lessonNumber},
      "introduction": "Introduction to punctuation topic",
      "punctuationRule": {
        "name": "Punctuation Rule Name",
        "explanation": "Detailed explanation of the rule",
        "examples": [
          {
            "correct": "Correctly punctuated sentence",
            "incorrect": "Incorrectly punctuated sentence",
            "explanation": "Why the correct version is right"
          }
        ]
      },
      "exercises": [
        {
          "type": "fill_blank",
          "question": "Add the correct punctuation: Hello world",
          "options": ["Hello world!", "Hello world.", "Hello world?", "Hello world,"],
          "correctAnswer": "Hello world!",
          "explanation": "Explanation of punctuation choice"
        }
      ],
      "summary": "Summary of punctuation rules learned"
    }
    
    Requirements:
    - Focus on one specific punctuation topic per lesson
    - Use ${level} level appropriate examples
    - Provide clear before/after examples
    - Create 3-4 practice exercises
    - IMPORTANT: Every exercise MUST include an "explanation" string
    - Make it practical and easy to understand`,

    reading: `Generate a ${level} level English reading comprehension lesson (Lesson ${lessonNumber}).
    Create:
    1. A lesson title
    2. A reading passage appropriate for ${level} level
    3. Reading comprehension questions
    4. Vocabulary from the passage
    
    Return in this JSON format:
    {
      "title": "Lesson Title",
      "section": "reading",
      "level": "${level}",
      "lessonNumber": ${lessonNumber},
      "introduction": "Introduction to the reading topic",
      "passage": "Reading passage text (200-400 words for ${level} level)",
      "vocabulary": [
        {
          "word": "word from passage",
          "definition": "definition",
          "context": "how it's used in the passage"
        }
      ],
      "exercises": [
        {
          "type": "multiple_choice",
          "question": "What is the main idea of the passage?",
          "options": ["option1", "option2", "option3", "option4"],
          "correctAnswer": "correct option",
          "explanation": "Explanation of the answer"
        }
      ],
      "summary": "Summary of what was learned from reading"
    }
    
    Requirements:
    - Reading passage should be engaging and appropriate for ${level} level
    - Include 3-4 comprehension questions
    - Highlight important vocabulary from the passage
    - Make content interesting and educational
    - Use clear, readable language`,
  };

  const prompt = sectionPrompts[section];
  if (!prompt) {
    throw new Error(`Invalid section: ${section}`);
  }

  const model = genAI.getGenerativeModel({
    model: process.env.LLM_MODEL_NAME || "gemini-2.0-flash",
  });

  const result = await retryWithBackoff(async () => {
    return await model.generateContent([
      "You are an expert English language teacher creating educational content. Always respond with valid JSON only. Do not use markdown formatting or code blocks - return pure JSON.",
      prompt,
    ]);
  });

  const responseText = result.response.text();
  const jsonText = extractJsonFromResponse(responseText);

  try {
    return JSON.parse(jsonText);
  } catch (parseError) {
    console.error("❌ JSON parsing error for lesson content:");
    console.error("Raw response:", responseText);
    console.error("Extracted JSON:", jsonText);
    console.error("Parse error:", parseError.message);
    throw new Error(
      `Failed to parse lesson content JSON: ${parseError.message}`
    );
  }
};

// Generate test for a specific lesson
const generateLessonTest = async (lessonContent, testNumber = 1) => {
  const { section, level, title } = lessonContent;

  const testPrompt = `Generate a comprehensive test for the ${level} level ${section} lesson: "${title}".
  
  Create exactly 10 questions that test understanding of the lesson content.
  
  Return in this JSON format:
  {
    "testTitle": "Test for ${title}",
    "section": "${section}",
    "level": "${level}",
    "testNumber": ${testNumber},
    "instructions": "Read each question carefully and choose the best answer.",
    "questions": [
      {
        "id": "unique_id",
        "questionNumber": 1,
        "question": "Question text here",
        "type": "single_choice | multiple_choice | fill_blank | matching | yes_no",
        "options": ["option1", "option2", "option3", "option4"],
        "correctAnswer": "string for single_choice/fill_blank/yes_no OR array for multiple_choice/matching",
        "explanation": "Explanation of why this answer is correct",
        "difficulty": "${level}"
      }
    ],
    "timeLimit": 15,
    "passingScore": 70
  }
  
  CRITICAL RULES FOR CHOICE QUESTIONS:
  - Use type = "single_choice" if there is EXACTLY ONE correct option.
  - Use type = "multiple_choice" ONLY if there are MULTIPLE correct options by design.
  - For single_choice, "correctAnswer" MUST be a string equal to one of the options.
  - For multiple_choice, "correctAnswer" MUST be an array of two or more option strings.
  - Always ensure all correct answers are included in "options".
  
  Requirements:
  - Create exactly 10 questions
  - Questions should test the specific lesson content
  - Use ${level} level appropriate difficulty
  - Include various question types (multiple choice, fill-in-the-blank, matching, etc.)
  - For matching questions, use this exact format:
    {
      "type": "matching",
      "instructions": "Match the word with its meaning:",
      "pairs": [
        {"word": "word1", "meaning": "meaning1"},
        {"word": "word2", "meaning": "meaning2"}
      ],
      "correctAnswer": ["meaning1", "meaning2"]
    }
  - Provide clear explanations for each answer
  - Make questions practical and applicable
  - Ensure all questions relate to the lesson material`;

  const model = genAI.getGenerativeModel({
    model: process.env.LLM_MODEL_NAME || "gemini-2.0-flash",
  });

  const result = await retryWithBackoff(async () => {
    return await model.generateContent([
      "You are an expert English language teacher creating educational tests. Always respond with valid JSON only. Do not use markdown formatting or code blocks - return pure JSON.",
      testPrompt,
    ]);
  });

  const responseText = result.response.text();
  const jsonText = extractJsonFromResponse(responseText);

  try {
    const parsed = JSON.parse(jsonText);
    // Normalize questions to enforce single_choice vs multiple_choice consistency
    if (parsed && Array.isArray(parsed.questions)) {
      parsed.questions = parsed.questions.map((q, idx) => {
        const question = { ...q };
        // Normalize choice question types
        if (
          question.type === "multiple_choice" ||
          question.type === "single_choice"
        ) {
          const options = Array.isArray(question.options)
            ? [...question.options]
            : [];
          let answersArray;
          if (Array.isArray(question.correctAnswer)) {
            answersArray = question.correctAnswer.filter(
              (a) => typeof a === "string"
            );
          } else if (typeof question.correctAnswer === "string") {
            answersArray = [question.correctAnswer];
          } else {
            answersArray = [];
          }

          // Decide type based on number of distinct answers
          const distinctAnswers = [...new Set(answersArray)];
          if (distinctAnswers.length <= 1) {
            question.type = "single_choice";
            question.correctAnswer = distinctAnswers[0] || options[0] || "";
          } else {
            question.type = "multiple_choice";
            question.correctAnswer = distinctAnswers;
          }

          // Ensure all answers exist in options
          const ensureInOptions = (ans) => {
            if (ans && !options.includes(ans)) options.push(ans);
          };
          if (question.type === "single_choice") {
            ensureInOptions(question.correctAnswer);
          } else {
            question.correctAnswer.forEach(ensureInOptions);
          }
          question.options = options;
        }

        // Matching normalization: ensure correctAnswer is array matching pairs length of meanings
        if (question.type === "matching" && Array.isArray(question.pairs)) {
          const meanings = question.pairs
            .map((p) => p.meaning || p.definition)
            .filter(Boolean);
          if (
            !Array.isArray(question.correctAnswer) ||
            question.correctAnswer.length !== meanings.length
          ) {
            question.correctAnswer = meanings;
          }
        }

        return question;
      });
    }
    // Ensure exercises exist and each has explanations; add for matching
    if (parsed && Array.isArray(parsed.exercises)) {
      parsed.exercises = parsed.exercises.map((ex) => {
        const exercise = { ...ex };
        if (!exercise.explanation || typeof exercise.explanation !== "string") {
          if (exercise.type === "matching" && Array.isArray(exercise.pairs)) {
            const pairsText = exercise.pairs
              .map((p) => `${p.word} → ${p.meaning || p.definition}`)
              .join(", ");
            exercise.explanation = `Each word is matched to its correct meaning: ${pairsText}.`;
          } else if (exercise.correctAnswer) {
            exercise.explanation = `The correct answer is ${
              Array.isArray(exercise.correctAnswer)
                ? exercise.correctAnswer.join(", ")
                : exercise.correctAnswer
            } because it best fits the question context.`;
          } else {
            exercise.explanation =
              "This is the best answer based on the lesson content.";
          }
        }
        return exercise;
      });
    }
    return parsed;
  } catch (parseError) {
    console.error("❌ JSON parsing error for test content:");
    console.error("Raw response:", responseText);
    console.error("Extracted JSON:", jsonText);
    console.error("Parse error:", parseError.message);
    throw new Error(`Failed to parse test content JSON: ${parseError.message}`);
  }
};

// Generate complete lesson set for a user
const generateCompleteLessonSet = async (level, userId) => {
  const sections = ["vocabulary", "grammar", "punctuation", "reading"];
  const lessonsPerSection = 1; // Start with 1 lesson per section to avoid rate limits
  const completeLessonSet = {
    userId: userId,
    level: level,
    generatedAt: new Date(),
    sections: {},
  };

  for (const section of sections) {
    completeLessonSet.sections[section] = {
      lessons: [],
      tests: [],
    };

    // Generate lessons for this section
    for (let lessonNum = 1; lessonNum <= lessonsPerSection; lessonNum++) {
      try {
        const totalLessons = sections.length * lessonsPerSection;
        const currentLesson =
          sections.indexOf(section) * lessonsPerSection + lessonNum;
        console.log(
          `📚 Generating ${level} ${section} lesson ${lessonNum}... (${currentLesson}/${totalLessons})`
        );

        const lessonContent = await generateLessonContent(
          section,
          level,
          lessonNum
        );
        completeLessonSet.sections[section].lessons.push(lessonContent);

        // Generate test for this lesson
        console.log(
          `🧪 Generating test for ${level} ${section} lesson ${lessonNum}... (${currentLesson}/${totalLessons})`
        );
        const testContent = await generateLessonTest(lessonContent, lessonNum);
        completeLessonSet.sections[section].tests.push(testContent);

        // Add delay to avoid rate limiting (5 seconds between requests)
        console.log(`⏳ Waiting 5 seconds to avoid rate limits...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(
          `❌ Error generating ${section} lesson ${lessonNum}:`,
          error.message
        );
        console.error("Full error:", error);
        throw new Error(
          `Failed to generate ${section} lesson ${lessonNum}: ${error.message}`
        );
      }
    }
  }

  return completeLessonSet;
};

module.exports = {
  generateLessonContent,
  generateLessonTest,
  generateCompleteLessonSet,
};
