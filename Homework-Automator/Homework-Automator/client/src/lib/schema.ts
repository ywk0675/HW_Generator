import { z } from "zod";

// --- Enums / Constants ---
export const GRADES = ["7yr-1", "7yr-2", "7yr-3", "8yr-1", "8yr-2", "8yr-3"] as const;
export const DAY_RANGE = { min: 1, max: 20 };

// --- Schemas ---

export const MetaSchema = z.object({
  month: z.string().min(1, "Month is required"),
  grade: z.string().default("7yr-3"),
  title: z.string().default("HOMEWORK"),
  instituteName: z.string().default("J-US INSTITUTE"),
  instituteSub: z.string().default("Jubilee With US"),
  startDay: z.number().min(1).default(1),
  endDay: z.number().max(31).default(20),
  pagesPerDay: z.number().default(4),
  // Global Mode Settings
  mode: z.enum(["monthly", "daily"]).default("daily"),
  globalTheme: z.string().optional(),
  globalGrammarFocus: z.string().optional(),
  globalVocabularyList: z.string().optional(),
});

export const VocabularyItemSchema = z.object({
  word: z.string(),
  definition: z.string().optional(),
  sentence: z.string().optional(),
});

export const GrammarItemSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswer: z.number().min(0).max(3),
});

export const ReadingPassageSchema = z.object({
  type: z.enum(["fiction", "non-fiction"]),
  title: z.string(),
  content: z.string(),
  lexile: z.string().optional(),
  wordCount: z.number().optional(),
  questions: z.array(GrammarItemSchema).length(5),
});

export const DayContentSchema = z.object({
  day: z.number(),
  // Explicitly 4 pages
  page1: ReadingPassageSchema, // Non-Fiction
  page2: ReadingPassageSchema, // Fiction
  page3: z.object({
    vocabulary: z.array(VocabularyItemSchema).length(10),
  }),
  page4: z.object({
    grammarFocus: z.string(),
    grammarExercises: z.array(GrammarItemSchema).length(10),
  }),
});

export const BookSchema = z.object({
  meta: MetaSchema,
  days: z.array(DayContentSchema),
});

export type Meta = z.infer<typeof MetaSchema>;
export type Book = z.infer<typeof BookSchema>;
export type DayContent = z.infer<typeof DayContentSchema>;
