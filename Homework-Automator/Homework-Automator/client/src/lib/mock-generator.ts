import { Book, DayContent, Meta, ReadingPassageSchema } from "./schema";

const LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const MOCK_WORDS = [
  "abundant", "benevolent", "candid", "diligent", "empathy", 
  "fortitude", "gratitude", "harmony", "integrity", "jubilant"
];

// Sentence templates for variety
const SENTENCE_TEMPLATES = [
  "The student showed great {word} when completing the project.",
  "It is important to have {word} in difficult situations.",
  "Her {word} was admired by everyone in the room.",
  "They displayed {word} despite the challenges.",
  "The concept of {word} is central to this story.",
  "We must practice {word} every day.",
  "His {word} surprised the entire class.",
  "The definition of {word} became clear after the example.",
  "Without {word}, the team would have failed.",
  "She is known for her {word} and kindness."
];

const GRAMMAR_QUESTIONS_TEMPLATE = [
  { q: "Which sentence uses the past tense correctly?", opts: ["I go.", "I went.", "I gone.", "I going."], a: 1 },
  { q: "Choose the prefix for 'happy' to mean 'not happy'.", opts: ["un-", "dis-", "in-", "im-"], a: 0 },
  { q: "Identify the gerund: 'Swimming is fun.'", opts: ["Swimming", "is", "fun", "none"], a: 0 },
  { q: "Which word is a noun?", opts: ["Run", "Blue", "Cat", "Quickly"], a: 2 },
  { q: "Select the correct plural form of 'child'.", opts: ["childs", "childes", "children", "childrens"], a: 2 },
  { q: "Which sentence is correct?", opts: ["He don't know.", "He doesn't know.", "He not know.", "He no know."], a: 1 },
  { q: "Find the adjective: 'The red car is fast.'", opts: ["The", "red", "car", "is"], a: 1 },
  { q: "What is the synonym of 'Big'?", opts: ["Small", "Large", "Tiny", "Little"], a: 1 },
  { q: "Choose the correct conjunction.", opts: ["I like tea _ coffee.", "or", "but", "so", "because"], a: 0 }, // Simplified for mock
  { q: "Identify the subject: 'The dog barked.'", opts: ["The", "dog", "barked", "none"], a: 1 },
];

function getRandomSentence(word: string, index: number): string {
  // Use index to rotate templates to ensure variety within a page
  const template = SENTENCE_TEMPLATES[index % SENTENCE_TEMPLATES.length];
  return template.replace("{word}", "_______________"); 
}

export function generateMockBook(meta: Meta, dailyInputs: { day: number, theme?: string, grammarFocus?: string, words?: string[] }[]): Book {
  const days: DayContent[] = [];

  for (let i = meta.startDay; i <= meta.endDay; i++) {
    // Logic: If mode is 'monthly', prioritize global settings unless daily overrides exist (assuming UI sends mixed data, but here we simplify)
    // Actually, dashboard will pass the effective inputs. 
    // If 'monthly' mode was selected in UI, the dailyInputs passed here should already be pre-filled with global values 
    // OR we fallback here. Let's fallback here for robustness.

    let input = dailyInputs.find(d => d.day === i);
    
    // Default values if missing (Robustness)
    const theme = input?.theme || meta.globalTheme || "General Knowledge";
    const grammarFocus = input?.grammarFocus || meta.globalGrammarFocus || "Mixed Grammar";
    const rawWords = (input?.words && input.words.length > 0) ? input.words : (meta.globalVocabularyList ? meta.globalVocabularyList.split(',').map(s=>s.trim()) : MOCK_WORDS);

    // Pad words to 10
    const words = [...rawWords];
    while (words.length < 10) {
      words.push(`Word${words.length + 1}`);
    }
    const finalWords = words.slice(0, 10);

    const vocab = finalWords.map((w, idx) => ({
      word: w,
      definition: `Definition of ${w}`,
      sentence: getRandomSentence(w, idx)
    }));

    // Generate Grammar Questions (rotate through mock templates)
    const grammarExercises = Array(10).fill(null).map((_, idx) => {
      const t = GRAMMAR_QUESTIONS_TEMPLATE[idx % GRAMMAR_QUESTIONS_TEMPLATE.length];
      return {
        question: `Q${idx + 1}: ${t.q}`,
        options: t.opts,
        correctAnswer: t.a
      };
    });

    const readingQuestions = Array(5).fill(null).map((_, idx) => {
      const t = GRAMMAR_QUESTIONS_TEMPLATE[idx % GRAMMAR_QUESTIONS_TEMPLATE.length];
       return {
        question: `Comprehension Q${idx + 1}: ${t.q}`,
        options: t.opts,
        correctAnswer: t.a
      };
    });

    days.push({
      day: i,
      // Page 1: Non-Fiction
      page1: {
        type: "non-fiction",
        title: `${theme} (Non-Fiction)`,
        content: `[Non-Fiction Passage about ${theme}]\n\n${LOREM_IPSUM}\n\n${LOREM_IPSUM}`,
        lexile: "800L",
        wordCount: 200,
        questions: readingQuestions
      },
      // Page 2: Fiction
      page2: {
        type: "fiction",
        title: `${theme} (Fiction Story)`,
        content: `[Fiction Story based on ${theme}]\n\nOnce upon a time... ${LOREM_IPSUM}`,
        lexile: "750L",
        wordCount: 250,
        questions: readingQuestions
      },
      // Page 3: Vocabulary
      page3: {
        vocabulary: vocab
      },
      // Page 4: Grammar
      page4: {
        grammarFocus: grammarFocus,
        grammarExercises: grammarExercises
      }
    });
  }

  return {
    meta,
    days
  };
}
