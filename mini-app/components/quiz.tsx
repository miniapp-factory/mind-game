"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

type House = "Gryffindor" | "Hufflepuff" | "Ravenclaw" | "Slytherin";

interface Answer {
  text: string;
  house: House;
}

interface Question {
  prompt: string;
  answers: Answer[];
}

const questions: Question[] = [
  {
    prompt: "How do you handle problems?",
    answers: [
      { text: "Face it bravely and deal with it head-on.", house: "Gryffindor" },
      { text: "Take your time, stay patient, and work through it steadily.", house: "Hufflepuff" },
      { text: "Analyze it carefully and think of the smartest solution.", house: "Ravenclaw" },
      { text: "Look for a clever shortcut or angle that others might miss.", house: "Slytherin" },
    ],
  },
  {
    prompt: "What do your friends appreciate most about you?",
    answers: [
      { text: "Your bravery and willingness to defend them.", house: "Gryffindor" },
      { text: "Your loyalty and dependability.", house: "Hufflepuff" },
      { text: "Your intelligence and great ideas.", house: "Ravenclaw" },
      { text: "Your ambition and confidence.", house: "Slytherin" },
    ],
  },
  {
    prompt: "Which activity sounds most fun?",
    answers: [
      { text: "Adventuring or physical challenges.", house: "Gryffindor" },
      { text: "Helping others or working on a group task.", house: "Hufflepuff" },
      { text: "Solving puzzles, researching, or learning something new.", house: "Ravenclaw" },
      { text: "Debating, leading, or planning to win something big.", house: "Slytherin" },
    ],
  },
  {
    prompt: "How do you react when you see unfairness happening?",
    answers: [
      { text: "Stand up for the person immediately.", house: "Gryffindor" },
      { text: "Support them quietly and consistently.", house: "Hufflepuff" },
      { text: "Think of a logical, effective way to help.", house: "Ravenclaw" },
      { text: "Strategize how to turn the situation around in a smart way.", house: "Slytherin" },
    ],
  },
  {
    prompt: "What kind of success matters most to you?",
    answers: [
      { text: "Doing what’s right, even when it’s difficult.", house: "Gryffindor" },
      { text: "Knowing I helped others and stayed true.", house: "Hufflepuff" },
      { text: "Understanding something deeply or mastering a skill.", house: "Ravenclaw" },
      { text: "Achieving a powerful position or reaching a big goal.", house: "Slytherin" },
    ],
  },
];

const houseDescriptions: Record<House, string> = {
  Gryffindor:
    "You belong to Gryffindor! You’re courageous, bold, and willing to stand up for what’s right. You face challenges head-on and inspire others with your bravery.",
  Hufflepuff:
    "You belong to Hufflepuff! You’re patient, loyal, and hardworking. You value fairness, kindness, and consistency — and people trust you deeply.",
  Ravenclaw:
    "You belong to Ravenclaw! You’re curious, witty, and intelligent. You love learning new things and often see solutions others miss.",
  Slytherin:
    "You belong to Slytherin! You’re ambitious, strategic, and resourceful. You set big goals and find clever ways to achieve them.",
};

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState<Record<House, number>>({
    Gryffindor: 0,
    Hufflepuff: 0,
    Ravenclaw: 0,
    Slytherin: 0,
  });
  const [selected, setSelected] = useState<House[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [house, setHouse] = useState<House | null>(null);

  // Shuffle answers for each question on mount
  const [shuffled, setShuffled] = useState<Question[]>([]);

  useEffect(() => {
    const shuffle = (arr: Answer[]) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    setShuffled(
      questions.map((q) => ({
        ...q,
        answers: shuffle(q.answers),
      }))
    );
  }, []);

  const handleAnswer = (ans: Answer) => {
    setScores((prev) => ({
      ...prev,
      [ans.house]: prev[ans.house] + 1,
    }));
    setSelected((prev) => [...prev, ans.house]);

    if (current + 1 < shuffled.length) {
      setCurrent(current + 1);
    } else {
      // compute result
      const maxScore = Math.max(...Object.values(scores));
      const topHouses = Object.entries(scores)
        .filter(([, s]) => s === maxScore)
        .map(([h]) => h as House);

      let finalHouse: House;
      if (topHouses.length === 1) {
        finalHouse = topHouses[0];
      } else {
        // tie breaker: use answer from question 5
        const lastAnswer = selected[selected.length - 1];
        if (topHouses.includes(lastAnswer)) {
          finalHouse = lastAnswer;
        } else {
          // still tie, pick random
          finalHouse = topHouses[Math.floor(Math.random() * topHouses.length)];
        }
      }
      setHouse(finalHouse);
      setShowResult(true);
    }
  };

  const retake = () => {
    setCurrent(0);
    setScores({
      Gryffindor: 0,
      Hufflepuff: 0,
      Ravenclaw: 0,
      Slytherin: 0,
    });
    setSelected([]);
    setShowResult(false);
    setHouse(null);
  };

  if (!shuffled.length) return null;

  if (showResult && house) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-3xl font-bold">{house}</h2>
        <p className="text-center max-w-md">{houseDescriptions[house]}</p>
        <img
          src={`/images/${house.toLowerCase()}.png`}
          alt={`${house} mascot`}
          width={256}
          height={256}
        />
        <div className="flex gap-4">
          <Button onClick={retake}>Retake the Quiz</Button>
          <Share text={`I got ${house}! Which wizard house do you belong to? Try the quiz!`} />
        </div>
      </div>
    );
  }

  const q = shuffled[current];
  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-xl font-semibold">{q.prompt}</h3>
      <div className="flex flex-col gap-2">
        {q.answers.map((ans) => (
          <Button key={ans.text} onClick={() => handleAnswer(ans)} variant="outline">
            {ans.text}
          </Button>
        ))}
      </div>
    </div>
  );
}
