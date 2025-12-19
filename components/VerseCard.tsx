"use client";

import { Verse, RECITERS } from "@/lib/quranApi";
import { Play, Pause, GraduationCap } from "lucide-react"; // Added GraduationCap
import { useState, useRef } from "react";

interface VerseCardProps {
  verse: Verse;
  reciterKey?: string;
  isTooltipMode?: boolean;
  onTest?: (verse: Verse) => void; // New Prop to trigger test
}

export default function VerseCard({
  verse,
  reciterKey = "alafasy",
  isTooltipMode,
  onTest,
}: VerseCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getAudioUrl = () => {
    const [surah, ayah] = verse.verse_key.split(":");
    const padSurah = surah.padStart(3, "0");
    const padAyah = ayah.padStart(3, "0");
    const reciterPath =
      RECITERS[reciterKey as keyof typeof RECITERS] || RECITERS.alafasy;
    return `https://everyayah.com/data/${reciterPath}/${padSurah}${padAyah}.mp3`;
  };

  const toggleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(getAudioUrl());
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
      {/* Header with Actions */}
      <div className="bg-slate-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <span className="text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded border border-gray-300">
          Ayat {verse.verse_key}
        </span>

        <div className="flex gap-2">
          {/* Test Button */}
          <button
            onClick={() => onTest && onTest(verse)}
            className="p-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200"
            title="Test this Ayat"
          >
            <GraduationCap size={18} />
          </button>

          {/* Audio Button */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-full border ${
              isPlaying
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-white text-gray-700 border-gray-300"
            } hover:bg-green-50 transition`}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Arabic Word by Word */}
        <div className="flex flex-wrap flex-row-reverse gap-x-4 gap-y-8 mb-8">
          {verse.words.map(
            (word) =>
              word.char_type_name !== "end" && (
                <div
                  key={word.id}
                  className="group relative flex flex-col items-center"
                >
                  {/* Darker Arabic Text */}
                  <span className="font-amiri text-4xl leading-relaxed text-black cursor-pointer hover:text-green-700 transition-colors">
                    {word.text_uthmani}
                  </span>

                  {isTooltipMode ? (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-sm py-1 px-3 rounded whitespace-nowrap pointer-events-none z-10 font-bengali font-bold">
                      {word.translation.text}
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
                    </span>
                  ) : (
                    // Darker Translation Text
                    <span className="text-[15px] text-gray-700 mt-1 font-bengali text-center min-w-[40px] font-medium">
                      {word.translation.text}
                    </span>
                  )}
                </div>
              )
          )}
        </div>

        {/* Full Translation - Darker */}
        <div className="text-gray-900 text-xl leading-relaxed border-r-4 border-green-500 pr-4 bg-green-50/50 py-4 rounded-l font-bengali">
          {verse.translations?.[0]?.text || "Translation loading..."}
        </div>
      </div>
    </div>
  );
}
