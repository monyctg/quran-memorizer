"use client";

import { useEffect, useState } from "react";
import { getUserProgress } from "@/app/actions";
import { getDailyVerses, Verse } from "@/lib/quranApi";
import { Loader2, ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

interface Question {
  arabicWord: string;
  correctMeaning: string;
  options: string[];
}

export default function ExamPage() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    async function generateQuiz() {
      try {
        const progress = await getUserProgress();
        if (!progress) return;

        // 👇 FIXED: Added "|| 1" to ensure endAyah is never null
        let endAyah = progress.currentAyah || 1;
        let startAyah = Math.max(1, endAyah - 4);

        // 👇 FIXED: Added "|| 1" here too
        if ((progress.currentAyah || 1) === 1) {
          startAyah = 1;
          endAyah = 2;
        }

        // 👇 FIXED: Added "|| 1" to surahId
        const verses = await getDailyVerses(
          progress.currentSurahId || 1,
          startAyah,
          endAyah - startAyah + 1
        );
        const allWords = verses.flatMap((v) =>
          v.words.filter((w) => w.char_type_name !== "end")
        );

        if (allWords.length < 4) {
          setLoading(false);
          return;
        }

        const quizQuestions: Question[] = [];

        for (let i = 0; i < 5; i++) {
          const randomIdx = Math.floor(Math.random() * allWords.length);
          const targetWord = allWords[randomIdx];

          const distractors = allWords
            .filter((w) => w.translation.text !== targetWord.translation.text)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map((w) => w.translation.text);

          while (distractors.length < 3) {
            distractors.push("Other Meaning");
          }

          const options = [...distractors, targetWord.translation.text].sort(
            () => 0.5 - Math.random()
          );

          quizQuestions.push({
            arabicWord: targetWord.text_uthmani,
            correctMeaning: targetWord.translation.text,
            options,
          });
        }
        setQuestions(quizQuestions);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    generateQuiz();
  }, []);

  const handleAnswer = (option: string) => {
    setSelectedAnswer(option);
    if (option === questions[currentIndex].correctMeaning) {
      setScore((s) => s + 1);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" />
      </div>
    );

  if (questions.length === 0)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
        <p className="text-xl font-bold text-gray-800">
          Not enough vocabulary yet!
        </p>
        <p className="text-gray-600">Complete a few lessons first.</p>
        <Link href="/" className="text-blue-600 font-bold underline">
          Back Home
        </Link>
      </div>
    );

  if (showResult)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-green-700 text-white">
        <Trophy size={80} className="mb-4 text-yellow-300 animate-bounce" />
        <h1 className="text-4xl font-bold mb-2">
          Score: {score}/{questions.length}
        </h1>
        <p className="text-green-100 mb-8">Great Job!</p>
        <Link
          href="/"
          className="bg-white text-green-800 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-100 transition"
        >
          Back to Dashboard
        </Link>
      </div>
    );

  const q = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-2xl">
      <div className="p-4 bg-white border-b flex items-center gap-4">
        <Link
          href="/"
          className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
        >
          <ArrowLeft />
        </Link>
        <span className="font-bold text-gray-800 text-lg">Vocabulary Exam</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">
          Translate this word
        </p>

        <h2 className="text-6xl font-amiri mb-12 text-center text-black leading-relaxed">
          {q.arabicWord}
        </h2>

        <div className="w-full space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => !selectedAnswer && handleAnswer(opt)}
              className={`w-full py-4 rounded-xl border-2 font-bold text-lg transition shadow-sm
                        ${
                          selectedAnswer === opt
                            ? opt === q.correctMeaning
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-red-600 text-white border-red-600"
                            : selectedAnswer && opt === q.correctMeaning
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-gray-800 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                        }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="mt-8 w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-green-500 h-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
