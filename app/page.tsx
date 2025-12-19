// app/page.tsx
"use client";

import VerseCard from "@/components/VerseCard";
import { getDailyVerses, Verse } from "@/lib/quranApi";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Icons for the toggle

export default function Home() {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [reciter, setReciter] = useState("alafasy");
  const [isTooltipMode, setIsTooltipMode] = useState(false); // <--- New State
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDailyVerses(67, 1, 2).then((data) => {
      setVerses(data);
      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 max-w-md mx-auto shadow-2xl pb-24">
      {/* App Header */}
      <header className="bg-white p-6 border-b sticky top-0 z-20">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">আজকের পড়া</h1>
            <p className="text-slate-500 text-sm font-bengali">
              সূরা আল-মুলক • ২ আয়াত
            </p>
          </div>

          {/* Tooltip Toggle Button */}
          <button
            onClick={() => setIsTooltipMode(!isTooltipMode)}
            className="flex flex-col items-center gap-1 text-xs text-gray-500 p-2 rounded hover:bg-gray-100 transition"
          >
            {isTooltipMode ? (
              <EyeOff size={20} className="text-gray-400" />
            ) : (
              <Eye size={20} className="text-green-600" />
            )}
            <span>{isTooltipMode ? "Hidden" : "Visible"}</span>
          </button>
        </div>

        {/* Reciter Selector */}
        <div className="mt-4">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Reciter
          </label>
          <select
            value={reciter}
            onChange={(e) => setReciter(e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="alafasy">Mishary Rashid Al-Afasy</option>
            <option value="sudais">Abdur-Rahman as-Sudais</option>
            <option value="shatri">Abu Bakr al-Shatri</option>
            <option value="husary">Mahmoud Khalil Al-Husary</option>
          </select>
        </div>
      </header>

      {/* Content Area */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400 animate-pulse">
            লোড হচ্ছে...
          </div>
        ) : (
          verses.map((verse) => (
            <VerseCard
              key={verse.id}
              verse={verse}
              reciterKey={reciter}
              isTooltipMode={isTooltipMode} // <--- Pass the prop
            />
          ))
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t p-4 flex gap-3 z-20">
        <button className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold font-bengali hover:bg-gray-200 transition">
          রিভিশন
        </button>
        <button className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold shadow-lg shadow-green-200 font-bengali hover:bg-green-700 transition">
          সম্পন্ন
        </button>
      </div>
    </main>
  );
}
