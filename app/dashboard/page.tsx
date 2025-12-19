"use client";

import { useEffect, useState } from "react";
import {
  getUserProgress,
  getVersesForDay,
  updateProgress,
} from "@/app/actions";
import { getSurahInfo, Verse } from "@/lib/quranApi"; // Ensure getSurahInfo is imported
import VerseCard from "@/components/VerseCard";
import ProgressCard from "@/components/ProgressCard"; // Import the new card
import { Loader2, Zap, BrainCircuit, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [progress, setProgress] = useState<any>(null);
  const [surahInfo, setSurahInfo] = useState<any>(null);
  const [versesForDay, setVersesForDay] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const userProgress = await getUserProgress();
        if (!userProgress) return;
        setProgress(userProgress);

        // Fetch Surah Details (Total verses, name)
        const sInfo = await getSurahInfo(userProgress.currentSurahId);
        setSurahInfo(sInfo);

        // Fetch Verses
        const verses = await getVersesForDay(userProgress.dayNumber);
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
      {/* Header */}
      <header className="bg-white p-6 border-b sticky top-0 z-20 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ড্যাশবোর্ড</h1>
        <Link
          href="/"
          className="text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full"
        >
          আজকের পড়া →
        </Link>
      </header>

      <div className="p-4 space-y-6">
        {/* 1. Progress Card */}
        {progress && surahInfo && (
          <ProgressCard
            currentAyah={progress.currentAyah}
            totalAyats={surahInfo.verses_count}
            surahName={surahInfo.name_simple}
            day={progress.dayNumber}
          />
        )}

        {/* 2. Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/exam"
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-green-50 transition group"
          >
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
              <BrainCircuit size={24} />
            </div>
            <span className="font-bold text-gray-700">Exam দিন</span>
            <span className="text-xs text-gray-400">শব্দার্থ পরীক্ষা</span>
          </Link>

          <button
            disabled
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 opacity-60"
          >
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
              <Zap size={24} />
            </div>
            <span className="font-bold text-gray-700">Hifz Test</span>
            <span className="text-xs text-gray-400">শীঘ্রই আসছে</span>
          </button>
        </div>

        {/* 3. Review Section */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <BookOpen size={18} className="text-gray-400" />
            আজকের রিভিশন
          </h3>
          {versesForDay.length > 0 ? (
            versesForDay.map((verse) => (
              <VerseCard key={verse.id} verse={verse} isTooltipMode={false} />
            ))
          ) : (
            <div className="p-4 text-center text-gray-400 bg-white rounded-xl border border-dashed">
              আজকের জন্য কোন পড়া নির্ধারিত নেই
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
