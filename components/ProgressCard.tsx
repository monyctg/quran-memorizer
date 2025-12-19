import { CheckCircle, Trophy, TrendingUp } from "lucide-react";

interface ProgressProps {
  currentAyah: number;
  totalAyats: number;
  surahName: string;
  day: number;
}

export default function ProgressCard({
  currentAyah,
  totalAyats,
  surahName,
  day,
}: ProgressProps) {
  // Calculate percentage
  const percentage = Math.min(
    100,
    Math.round(((currentAyah - 1) / totalAyats) * 100)
  );

  return (
    <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
        <Trophy size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{surahName}</h2>
            <p className="text-green-100 text-sm font-bengali">
              দিন {day} • রানিং
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
            {percentage}% সম্পন্ন
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1 text-green-100 font-bengali">
            <span>০ আয়াত</span>
            <span>{totalAyats} আয়াত</span>
          </div>
          <div className="h-3 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
            <CheckCircle className="text-yellow-400" size={20} />
            <div>
              <p className="text-xs text-green-200">মুখস্থ</p>
              <p className="text-lg font-bold">{currentAyah - 1}</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
            <TrendingUp className="text-yellow-400" size={20} />
            <div>
              <p className="text-xs text-green-200">বাকি</p>
              <p className="text-lg font-bold">
                {totalAyats - (currentAyah - 1)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
