import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Play, Pause, Wand2, Image as ImageIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  WORD_SUGGESTIONS,
  WordMemoryCard,
  buildWordMemoryCard,
} from "@/lib/word-lab";

type VisualProps = {
  card: WordMemoryCard;
  animated: boolean;
};

const stickerPositions = [
  { top: "10%", left: "10%" },
  { top: "18%", right: "8%" },
  { top: "55%", left: "12%" },
  { top: "62%", right: "16%" },
  { top: "35%", left: "46%" },
];

const WordVisual = ({ card, animated }: VisualProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br text-white shadow-sm">
      <div className={`absolute inset-0 bg-gradient-to-br ${card.theme.gradient}`} />
      <div className="relative p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
              Kids Visual
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur">
              {card.theme.emoji} {card.theme.label}
            </Badge>
          </div>
          <div className="text-xs text-white/80 hidden sm:block">
            {card.theme.description}
          </div>
        </div>

        <div className="mt-5 flex items-baseline justify-between">
          <div>
            <p className="text-sm text-white/80 font-medium">오늘의 단어</p>
            <p className="text-3xl sm:text-4xl font-black drop-shadow-sm">
              {card.word}
            </p>
          </div>
          <span className="text-4xl sm:text-5xl drop-shadow-sm">{card.theme.emoji}</span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-3 items-center">
          <div className="text-sm text-white/90 leading-relaxed bg-white/10 rounded-lg p-3 border border-white/20 backdrop-blur">
            <span className="font-semibold">이미지 힌트:</span>{" "}
            {card.prompt}
          </div>
          <div className="relative h-28 rounded-xl border border-white/30 bg-white/10 backdrop-blur overflow-hidden">
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
            {card.theme.stickers.map((sticker, index) => (
              <motion.span
                key={sticker + index}
                className="absolute text-2xl sm:text-3xl drop-shadow"
                style={stickerPositions[index % stickerPositions.length]}
                animate={
                  animated
                    ? {
                        y: [0, -6, 0],
                        rotate: [0, -4, 3, 0],
                        transition: {
                          duration: 3.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.2,
                        },
                      }
                    : undefined
                }
              >
                {sticker}
              </motion.span>
            ))}
            <motion.div
              className="absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/30 text-white backdrop-blur"
              animate={
                animated
                  ? {
                      opacity: [0.8, 1, 0.9],
                      scale: [1, 1.03, 1],
                      transition: { duration: 2.6, repeat: Infinity },
                    }
                  : undefined
              }
            >
              shorts style loop
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WordMemoryLab = () => {
  const [animationsOn, setAnimationsOn] = useState(true);
  const [wordInput, setWordInput] = useState("rainbow");
  const [cards, setCards] = useState<WordMemoryCard[]>(() => [
    buildWordMemoryCard("rainbow"),
    buildWordMemoryCard("brave"),
  ]);

  const activeBadge = useMemo(
    () => (animationsOn ? { icon: <Play className="h-3.5 w-3.5" />, text: "움직이는 GIF 느낌" } : { icon: <Pause className="h-3.5 w-3.5" />, text: "정지된 이미지" }),
    [animationsOn]
  );

  const addCard = () => {
    const trimmed = wordInput.trim();
    if (!trimmed) return;

    const freshCard = buildWordMemoryCard(trimmed);
    setCards((prev) => {
      const deduped = prev.filter(
        (card) => card.word.toLowerCase() !== freshCard.word.toLowerCase()
      );
      return [freshCard, ...deduped].slice(0, 6);
    });
    setWordInput("");
  };

  const handleSuggestion = (word: string) => {
    setWordInput(word);
    const freshCard = buildWordMemoryCard(word);
    setCards((prev) => {
      const deduped = prev.filter(
        (card) => card.word.toLowerCase() !== freshCard.word.toLowerCase()
      );
      return [freshCard, ...deduped].slice(0, 6);
    });
  };

  return (
    <div className="space-y-4">
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-blue-600" />
                단어 암기 비주얼 메이커
              </CardTitle>
              <CardDescription className="text-sm">
                단어를 입력하면 어린이가 좋아할 이미지 + 뜻 + 예문을 한 번에 보여줘요.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1.5 text-sm text-blue-700">
              {activeBadge.icon}
              <span>{activeBadge.text}</span>
              <Switch
                checked={animationsOn}
                onCheckedChange={setAnimationsOn}
                className="ml-1"
                aria-label="Toggle animated visual"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_auto] gap-3 items-center">
            <div className="space-y-1">
              <Label htmlFor="word-input" className="text-xs font-semibold text-gray-500">
                단어 입력
              </Label>
              <div className="flex gap-2">
                <Input
                  id="word-input"
                  value={wordInput}
                  placeholder="예: dinosaur, sparkle, kind"
                  onChange={(e) => setWordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addCard();
                  }}
                  className="bg-white"
                />
                <Button onClick={addCard} className="whitespace-nowrap gap-1">
                  <Wand2 className="h-4 w-4" />
                  이미지 만들기
                </Button>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <div className="flex items-center justify-start sm:justify-end gap-2 text-xs text-gray-500">
                <ImageIcon className="h-4 w-4 text-blue-500" />
                <span>이미지 힌트 + 예문까지 자동 생성</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {WORD_SUGGESTIONS.map((word) => (
              <Badge
                key={word}
                variant="secondary"
                className="cursor-pointer bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100"
                onClick={() => handleSuggestion(word)}
              >
                {word}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.word} className="overflow-hidden border-gray-100 shadow-sm">
            <WordVisual card={card} animated={animationsOn} />
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="border-blue-100 bg-blue-50 text-blue-700">
                  {card.theme.label}
                </Badge>
                <Badge variant="outline" className="border-amber-100 bg-amber-50 text-amber-700">
                  예문 + 뜻
                </Badge>
              </div>

              <div className="space-y-2 text-sm leading-relaxed">
                <p className="font-semibold text-gray-800 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500 mt-[2px]" />
                  <span>{card.meaning}</span>
                </p>
                <Separator />
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">예문</span>{" "}
                  {card.sentence}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
