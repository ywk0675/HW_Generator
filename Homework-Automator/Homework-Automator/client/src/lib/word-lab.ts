export type VisualTheme = {
  id: string;
  label: string;
  gradient: string;
  accent: string;
  emoji: string;
  stickers: string[];
  description: string;
  prompt: string;
};

export type WordMemoryCard = {
  word: string;
  meaning: string;
  sentence: string;
  prompt: string;
  theme: VisualTheme;
};

const VISUAL_THEMES: VisualTheme[] = [
  {
    id: "space",
    label: "우주 탐험",
    gradient: "from-indigo-500/80 via-purple-400/80 to-sky-300/80",
    accent: "text-indigo-900",
    emoji: "🚀",
    stickers: ["⭐", "🌙", "🛰️"],
    description: "부드러운 별빛과 둥근 행성이 미소 짓는 장면",
    prompt: "cute pastel space scene with smiling planets and stars"
  },
  {
    id: "ocean",
    label: "바다 친구",
    gradient: "from-cyan-400/80 via-emerald-300/80 to-blue-200/80",
    accent: "text-emerald-900",
    emoji: "🐬",
    stickers: ["🐠", "🪼", "🌊"],
    description: "잔잔한 파도 위를 떠다니는 알록달록 물고기",
    prompt: "playful ocean with friendly fish and soft watercolor waves"
  },
  {
    id: "forest",
    label: "숲 속 이야기",
    gradient: "from-emerald-400/80 via-lime-300/80 to-amber-200/80",
    accent: "text-emerald-950",
    emoji: "🦊",
    stickers: ["🍃", "🍄", "🦋"],
    description: "햇살이 비치는 숲길과 귀여운 동물 친구들",
    prompt: "cozy forest path with cute animals and warm sunlight"
  },
  {
    id: "candy",
    label: "사탕 놀이터",
    gradient: "from-pink-400/80 via-fuchsia-300/80 to-amber-200/80",
    accent: "text-pink-900",
    emoji: "🍭",
    stickers: ["🍬", "✨", "🧁"],
    description: "솜사탕 구름과 알록달록 젤리가 둥둥 떠다니는 장면",
    prompt: "bright candy land with floating sweets and cotton candy clouds"
  },
  {
    id: "sports",
    label: "에너지 스팟",
    gradient: "from-orange-400/80 via-amber-300/80 to-lime-200/80",
    accent: "text-orange-900",
    emoji: "⚡",
    stickers: ["🏀", "🎈", "🎯"],
    description: "점프하는 공과 반짝이는 응원 스파클",
    prompt: "energetic playground with bouncing balls and sparkling confetti"
  }
];

const THEME_KEYWORDS: Record<string, RegExp[]> = {
  space: [/(space|star|sky|moon|planet|rocket)/i],
  ocean: [/(water|sea|ocean|fish|blue|wave|splash)/i],
  forest: [/(tree|green|forest|fox|leaf|nature|rain)/i],
  candy: [/(sweet|candy|sugar|rainbow|cake|colorful|happy)/i],
  sports: [/(run|jump|energy|fast|sport|move|play)/i]
};

const MEANING_TEMPLATES = [
  "{word}는 {label} 느낌을 떠올리게 하는 단어예요. 어린이들은 {description} 장면으로 기억하면 좋아요.",
  "듣기만 해도 {label} 분위기가 생각나는 {word}! {description} 모습을 그려 보세요.",
  "친구에게 {word}를 설명할 땐 '{description}'처럼 이야기해 보세요. 금방 의미가 떠올라요."
];

const SENTENCE_TEMPLATES = [
  `We whispered "{word}" and imagined {description}.`,
  `During class we said, "Look! A {word}!" and everyone smiled.`,
  `"Remember {word}," the teacher said, "like {description}."`,
  `우리 반은 "{word}"를 외치며 {description} 장면을 그림으로 그렸어요.`,
  `"{word}"라는 말을 들으면 자연스럽게 {description} 그림을 떠올려요.`
];

const PROMPT_TEMPLATES = [
  "{prompt}, child-friendly, softly animated stickers, bright and simple",
  "rounded shapes, {prompt}, minimal background, cheerful for kids",
  "kids shorts style loop, {prompt}, thick outlines, playful colors"
];

const WORD_SUGGESTIONS = [
  "rainbow",
  "brave",
  "dolphin",
  "forest",
  "bounce",
  "dream",
  "rocket",
  "puzzle"
];

function hashWord(word: string) {
  return word.toLowerCase().split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function pickTheme(word: string): VisualTheme {
  const matched = Object.entries(THEME_KEYWORDS).find(([, patterns]) =>
    patterns.some((regex) => regex.test(word))
  );

  const baseThemeId =
    matched?.[0] ?? VISUAL_THEMES[hashWord(word) % VISUAL_THEMES.length].id;

  return VISUAL_THEMES.find((theme) => theme.id === baseThemeId) ?? VISUAL_THEMES[0];
}

function fillTemplate(templates: string[], word: string, theme: VisualTheme) {
  const template = templates[hashWord(word) % templates.length];
  return template
    .replace(/\{word\}/g, word)
    .replace(/\{label\}/g, theme.label)
    .replace(/\{description\}/g, theme.description)
    .replace(/\{prompt\}/g, theme.prompt);
}

function formatWord(raw: string) {
  if (!raw) return "단어";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function buildWordMemoryCard(wordInput: string): WordMemoryCard {
  const cleaned = wordInput.trim();
  const formatted = formatWord(cleaned);
  const theme = pickTheme(cleaned || "word");

  return {
    word: formatted,
    meaning: fillTemplate(MEANING_TEMPLATES, formatted, theme),
    sentence: fillTemplate(SENTENCE_TEMPLATES, formatted, theme),
    prompt: fillTemplate(PROMPT_TEMPLATES, formatted, theme),
    theme
  };
}

export { WORD_SUGGESTIONS };
