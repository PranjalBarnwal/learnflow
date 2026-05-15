import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface GenerateQuizResult {
  questions: QuizQuestion[];
  error?: string;
}


export async function generateQuizFromPrompt(
  topic: string,
  difficulty: string,
  numberOfQuestions: number = 5
): Promise<GenerateQuizResult> {
  if (!topic || topic.trim().length < 3) {
    return {
      questions: [],
      error: 'Topic must be at least 3 characters',
    };
  }

  try {
    const difficultyInstruction = getDifficultyInstruction(difficulty);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert quiz creator. Generate exactly ${numberOfQuestions} multiple choice questions on the given topic.

Return ONLY a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0
  }
]

Rules:
- Return raw JSON only - no markdown fences, no preamble, no explanation
- Exactly ${numberOfQuestions} questions
- Each question must have exactly 4 options
- correctIndex must be 0, 1, 2, or 3
- Questions should test understanding, not trivia
- Options should be plausible and similar in length
- ${difficultyInstruction}
- IMPORTANT: Always generate questions and options in English`,
        },
        {
          role: 'user',
          content: `Generate ${numberOfQuestions} ${difficulty} multiple choice quiz questions about: ${topic}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      return {
        questions: [],
        error: 'No response from AI',
      };
    }

    let questions: QuizQuestion[];
    try {
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      questions = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText);
      return {
        questions: [],
        error: 'Failed to parse AI response',
      };
    }

    if (!Array.isArray(questions) || questions.length !== numberOfQuestions) {
      return {
        questions: [],
        error: 'AI returned invalid number of questions',
      };
    }

    for (const q of questions) {
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctIndex !== 'number' ||
        q.correctIndex < 0 ||
        q.correctIndex > 3
      ) {
        return {
          questions: [],
          error: 'AI returned invalid question structure',
        };
      }
    }

    return { questions };
  } catch (error: any) {
    console.error('Groq API error:', error);

    if (error.status === 429) {
      return {
        questions: [],
        error: 'Rate limit exceeded. Please try again in a minute.',
      };
    }

    if (error.status === 401) {
      return {
        questions: [],
        error: 'Invalid API key',
      };
    }

    return {
      questions: [],
      error: 'Failed to generate quiz',
    };
  }
}

function getDifficultyInstruction(difficulty: string): string {
  const instructions: Record<string, string> = {
    easy: 'Questions should be basic, testing fundamental concepts. Keep language simple and straightforward.',
    medium: 'Questions should require moderate understanding. Mix of conceptual and applied knowledge.',
    hard: 'Questions should be challenging, requiring deep understanding and critical thinking. Include nuanced distractors.',
  };
  return instructions[difficulty.toLowerCase()] || instructions.medium;
}

// Keep the original generateQuiz for backward compatibility
export async function generateQuiz(content: string): Promise<GenerateQuizResult> {
  if (!content || content.length < 100) {
    return {
      questions: [],
      error: 'Content too short for quiz generation',
    };
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert quiz creator. Given lesson content, generate exactly 5 multiple choice questions to test understanding.

Return ONLY a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0
  }
]

Rules:
- Return raw JSON only - no markdown fences, no preamble, no explanation
- Exactly 5 questions
- Each question must have exactly 4 options
- correctIndex must be 0, 1, 2, or 3
- Questions should test comprehension, not memorization
- Options should be plausible and similar in length
- IMPORTANT: Always generate questions and options in English, regardless of the language of the input content`,
        },
        {
          role: 'user',
          content: `Generate 5 quiz questions from this lesson content:\n\n${content}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      return {
        questions: [],
        error: 'No response from AI',
      };
    }

    let questions: QuizQuestion[];
    try {
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      questions = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', responseText);
      return {
        questions: [],
        error: 'Failed to parse AI response',
      };
    }

    if (!Array.isArray(questions) || questions.length !== 5) {
      return {
        questions: [],
        error: 'AI returned invalid number of questions',
      };
    }

    for (const q of questions) {
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctIndex !== 'number' ||
        q.correctIndex < 0 ||
        q.correctIndex > 3
      ) {
        return {
          questions: [],
          error: 'AI returned invalid question structure',
        };
      }
    }

    return { questions };
  } catch (error: any) {
    console.error('Groq API error:', error);

    if (error.status === 429) {
      return {
        questions: [],
        error: 'Rate limit exceeded. Please try again in a minute.',
      };
    }

    if (error.status === 401) {
      return {
        questions: [],
        error: 'Invalid API key',
      };
    }

    return {
      questions: [],
      error: 'Failed to generate quiz',
    };
  }
}
