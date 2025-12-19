// components/VerseCard.tsx
"use client";

import { Verse, RECITERS } from "@/lib/quranApi";
import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";

interface VerseCardProps {
  verse: Verse;
  reciterKey?: string;
  isTooltipMode: boolean; // <--- New Prop
}

export default function VerseCard({
  verse,
  reciterKey = "alafasy",
  isTooltipMode,
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
      <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
        <span className="text-sm font-medium text-slate-500 bg-white px-2 py-1 rounded border">
          Ayat {verse.verse_key}
        </span>
        <button
          onClick={toggleAudio}
          className={`p-2 rounded-full ${
            isPlaying
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-600"
          } hover:bg-green-200 transition`}
        >
          {isPlaying ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
        </button>
      </div>

      <div className="p-6">
        {/* Arabic Word by Word */}
        <div className="flex flex-wrap flex-row-reverse gap-x-3 gap-y-6 mb-8">
          {verse.words.map(
            (word) =>
              word.char_type_name !== "end" && (
                <div
                  key={word.id}
                  className="group relative flex flex-col items-center"
                >
                  {/* Arabic Word */}
                  <span className="font-amiri text-3xl leading-relaxed text-gray-800 cursor-pointer hover:text-green-600 transition-colors">
                    {word.text_uthmani}
                  </span>

                  {/* CONDITIONAL RENDERING LOGIC */}
                  {isTooltipMode ? (
                    // Tooltip Mode: Hidden by default, visible on hover/group-hover
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none z-10 font-bengali">
                      {word.translation.text}
                      {/* Little arrow at bottom of tooltip */}
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></span>
                    </span>
                  ) : (
                    // Standard Mode: Always visible below
                    <span className="text-[13px] text-gray-500 mt-1 font-bengali text-center min-w-[40px]">
                      {word.translation.text}
                    </span>
                  )}
                </div>
              )
          )}
        </div>

        {/* Full Translation */}
        <div className="text-gray-800 text-lg leading-relaxed border-l-4 border-green-500 pl-4 bg-green-50/50 py-3 rounded-r font-bengali">
          {verse.translations?.[0]?.text || "Translation loading..."}
        </div>
      </div>
    </div>
  );
}
