"use client";

import { useEffect, useState } from "react";
import { getUserProgress, getVersesForDay } from "@/app/actions";
import { getSurahInfo, Verse } from "@/lib/quranApi";
import VerseCard from "@/components/VerseCard";
import ProgressCard from "@/components/ProgressCard";
import { Loader2, BookOpen } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [progress, setProgress] = useState<any>(null);
  const [surahInfo, setSurahInfo] = useState<any>(null);
  const [versesForDay, setVersesForDay] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const userProgress = await getUserProgress();
        if (!userProgress) return;
        setProgress(userProgress);

        // 👇 FIXED: Added || 1 fallback here
        const sInfo = await getSurahInfo(userProgress.currentSurahId || 1);
        setSurahInfo(sInfo);

        // 👇 FIXED: Added || 1 fallback here too
        const verses = await getVersesForDay(userProgress.dayNumber || 1);
        setVersesForDay(verses);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 max-w-md mx-auto shadow-2xl pb-32">
      <header className="bg-white p-6 border-b sticky top-0 z-20 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/"
          className="text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full"
        >
          Home →
        </Link>
      </header>

      <div className="p-4 space-y-6">
        {progress && surahInfo && (
          <ProgressCard
            currentAyah={progress.currentAyah || 1}
            totalAyats={surahInfo.verses_count}
            surahName={surahInfo.name_simple}
            day={progress.dayNumber || 1}
          />
        )}

        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <BookOpen size={18} className="text-gray-400" />
            Review Today
          </h3>
          {versesForDay.length > 0 ? (
            versesForDay.map((verse) => (
              <VerseCard key={verse.id} verse={verse} isTooltipMode={false} />
            ))
          ) : (
            <div className="p-4 text-center text-gray-400 bg-white rounded-xl border border-dashed">
              No data available.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
