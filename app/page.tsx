"use client";

import { useEffect, useState } from "react";
import VerseCard from "@/components/VerseCard";
import DragTestModal from "@/components/DragTestModal";
import { getDailyVerses, Verse, RECITERS } from "@/lib/quranApi";
import {
  getUserProgress,
  updateProgress,
  resetUserProgress,
} from "@/app/actions";
import { getSurahName, getTotalVerses, SURAH_LIST } from "@/lib/surahData";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import {
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  Calendar,
  Trash2,
  ChevronRight,
  ChevronDown,
  PlayCircle,
  BookOpen,
  LayoutDashboard,
  BrainCircuit,
  Search,
  Menu,
  X,
  LogIn,
  LogOut,
} from "lucide-react";
import Link from "next/link";

// --- TYPES ---
interface DayNode {
  dayNum: number;
  startAyah: number;
  endAyah: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

export default function HomePage() {
  // 1. GET USER DATA (Fixed access for Sidebar)
  const { isSignedIn, user } = useUser();
  const { openSignIn, signOut } = useClerk();

  // State
  const [verses, setVerses] = useState<Verse[]>([]);
  const [reciter, setReciter] = useState("alafasy");
  const [isTooltipMode, setIsTooltipMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Progress State
  const [progress, setProgress] = useState<any>({
    currentSurahId: 1,
    currentAyah: 1,
    dayNumber: 1,
  });

  // Sidebar & Menu
  const [currentSurahDays, setCurrentSurahDays] = useState<DayNode[]>([]);
  const [openSurahs, setOpenSurahs] = useState<Record<number, boolean>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals & Reviews
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetInput, setResetInput] = useState("");
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testVerses, setTestVerses] = useState<Verse[]>([]);
  const [reviewDay, setReviewDay] = useState<number | null>(null);

  // --- LOGIC: GENERATE DAYS (Fixed Saving Issue) ---
  function generateCurrentSurahDays(
    surahId: number,
    currentAyah: number,
    currentDayGlobal: number
  ) {
    const totalAyats = getTotalVerses(surahId);
    const nodes: DayNode[] = [];
    let simAyah = 1;

    // 1. Calculate how many lessons we have so far in this Surah
    const lessons = [];
    while (simAyah <= totalAyats) {
      const start = simAyah;
      const end = Math.min(simAyah + 1, totalAyats);

      const isPast = simAyah < currentAyah;
      const isCurrent = simAyah === currentAyah;

      // Stop at current lesson
      if (simAyah > currentAyah) break;

      lessons.push({ start, end, isPast, isCurrent });
      simAyah += 2;
    }

    // 2. Assign Day Numbers Backwards
    // This ensures Day 5 stays Day 5, and Day 4 stays Day 4
    let dayCounter = currentDayGlobal;

    for (let i = lessons.length - 1; i >= 0; i--) {
      const lesson = lessons[i];
      nodes.unshift({
        dayNum: Math.max(1, dayCounter), // Ensure no negative days
        startAyah: lesson.start,
        endAyah: lesson.end,
        isCompleted: lesson.isPast,
        isCurrent: lesson.isCurrent,
      });
      dayCounter--;
    }

    return nodes;
  }

  // --- DATA LOADING ---
  async function loadData() {
    setLoading(true);
    setReviewDay(null);
    try {
      let activeProgress = progress;

      if (isSignedIn) {
        const userProgress = await getUserProgress();
        if (userProgress) {
          activeProgress = userProgress;
          setProgress(userProgress);
        }
      }

      // Generate Sidebar History
      const days = generateCurrentSurahDays(
        activeProgress.currentSurahId,
        activeProgress.currentAyah,
        activeProgress.dayNumber
      );
      setCurrentSurahDays(days);
      setOpenSurahs((prev) => ({
        ...prev,
        [activeProgress.currentSurahId]: true,
      }));

      // Fetch Verses
      const data = await getDailyVerses(
        activeProgress.currentSurahId,
        activeProgress.currentAyah,
        2
      );
      setVerses(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [isSignedIn]);

  // --- ACTIONS ---

  const handleTestPass = async () => {
    setIsTestModalOpen(false);

    if (!isSignedIn) {
      openSignIn();
      return;
    }

    setLoading(true);
    // 1. Update DB
    const result = await updateProgress("complete_day", 2);

    if (result.success) {
      // 2. Optimistic Update (Instant Speed)
      const nextProgress = {
        ...progress,
        currentSurahId: result.nextSurah || progress.currentSurahId,
        currentAyah: result.nextAyah,
        dayNumber: result.nextDay,
      };

      setProgress(nextProgress);

      // Update Sidebar immediately
      const newDays = generateCurrentSurahDays(
        nextProgress.currentSurahId,
        nextProgress.currentAyah,
        nextProgress.dayNumber
      );
      setCurrentSurahDays(newDays);
      setOpenSurahs((prev) => ({
        ...prev,
        [nextProgress.currentSurahId]: true,
      }));

      // Fetch new verses
      const data = await getDailyVerses(
        nextProgress.currentSurahId,
        nextProgress.currentAyah,
        2
      );
      setVerses(data);

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setLoading(false);
  };

  const changeSurah = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSurah = parseInt(e.target.value);
    setLoading(true);

    if (isSignedIn) {
      await updateProgress("set_surah", { surahId: newSurah, ayah: 1 });
      await loadData();
    } else {
      // Guest mode
      setProgress((p: any) => ({
        ...p,
        currentSurahId: newSurah,
        currentAyah: 1,
      }));
      const data = await getDailyVerses(newSurah, 1, 2);
      setVerses(data);
      setCurrentSurahDays(generateCurrentSurahDays(newSurah, 1, 1));
      setLoading(false);
    }
    setIsMobileMenuOpen(false);
  };

  const handleReset = async () => {
    if (resetInput !== "reset") return;
    if (isSignedIn) {
      await resetUserProgress();
    }
    window.location.reload();
  };

  const loadReview = async (node: DayNode) => {
    setLoading(true);
    setReviewDay(node.dayNum);
    try {
      const data = await getDailyVerses(
        progress.currentSurahId,
        node.startAyah,
        2
      );
      setVerses(data);
      setIsMobileMenuOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = (id: number) => {
    setOpenSurahs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --- COMPONENT: Sidebar Content (Internal to access User & State) ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 border-b border-gray-100 z-10">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-1">
          <BookOpen className="text-green-600" size={24} />
          Index
        </h2>
        <p className="text-xs text-gray-400">Your memorization journey</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {SURAH_LIST.map((surah) => {
          const isPast = progress && surah.id < progress.currentSurahId;
          const isCurrent = progress && surah.id === progress.currentSurahId;
          const isOpen = openSurahs[surah.id];

          return (
            <div
              key={surah.id}
              className={`border rounded-xl overflow-hidden bg-white shadow-sm transition ${
                isCurrent
                  ? "border-green-200 ring-1 ring-green-100"
                  : "border-gray-100"
              }`}
            >
              <button
                onClick={() => toggleAccordion(surah.id)}
                className={`w-full p-3 flex justify-between items-center hover:bg-gray-50 transition ${
                  isPast ? "opacity-60 grayscale" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-md ${
                      isCurrent
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {surah.id}
                  </span>
                  <span
                    className={`font-bold text-sm ${
                      isCurrent ? "text-green-800" : "text-gray-700"
                    }`}
                  >
                    {surah.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isPast && (
                    <CheckCircle size={14} className="text-gray-400" />
                  )}
                  {isOpen ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </div>
              </button>

              {/* Only show days for CURRENT Surah */}
              {isOpen && isCurrent && (
                <div className="bg-green-50/50 p-2 space-y-1 border-t border-green-100">
                  {currentSurahDays.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadReview(day)}
                      disabled={day.isCurrent}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition ${
                        day.isCurrent
                          ? "bg-white text-green-700 border border-green-200 cursor-default shadow-sm font-bold"
                          : "text-gray-600 hover:bg-white hover:text-green-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {day.isCompleted ? (
                          <CheckCircle size={12} className="text-green-500" />
                        ) : (
                          <PlayCircle size={12} className="text-blue-500" />
                        )}
                        <span className="font-medium">
                          Day {day.dayNum}{" "}
                          <span className="text-[10px] text-gray-400">
                            ({day.startAyah}-{day.endAyah})
                          </span>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {isOpen && !isCurrent && (
                <div className="p-3 text-xs text-center text-gray-400 bg-gray-50 border-t border-gray-100">
                  {isPast ? "Marked as Passed" : "Not started yet"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Menu Footer with User Info */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 md:hidden flex flex-col gap-3">
        {isSignedIn ? (
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border">
            <UserButton />
            <div className="flex-1">
              {/* 👇 FIXED: Safely accessing user.fullName */}
              <p className="text-xs font-bold text-gray-800">
                {user?.fullName || "User"}
              </p>
              <button
                onClick={() => signOut()}
                className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1"
              >
                <LogOut size={10} /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => openSignIn()}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2"
          >
            <LogIn size={14} /> Login to Save
          </button>
        )}

        <button
          onClick={() => setIsResetModalOpen(true)}
          className="w-full text-red-500 text-xs font-bold flex items-center justify-center gap-2 p-2 hover:bg-red-50 rounded-lg"
        >
          <Trash2 size={14} /> Reset Data
        </button>
      </div>
    </div>
  );

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans overflow-hidden">
      {/* ---------------- MOBILE MENU ---------------- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-600 z-50"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ---------------- LEFT SIDEBAR (DESKTOP) ---------------- */}
      <aside className="w-full md:w-80 bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0 z-30">
        <SidebarContent />
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="flex-1 w-full p-4 md:p-8 pb-48 h-screen overflow-y-auto scroll-smooth">
        {/* HEADER */}
        <header className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 mb-6 relative">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden absolute top-4 left-4 p-2 bg-gray-100 rounded-lg text-gray-700"
          >
            <Menu size={24} />
          </button>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 md:mt-0">
            <div className="text-center md:text-left w-full md:w-auto">
              <div className="flex justify-center md:justify-start items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {reviewDay ? "Review" : "Current Lesson"}
                </span>
                {progress && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded">
                    Day {progress.dayNumber}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 font-amiri">
                {getSurahName(progress?.currentSurahId || 1)}
              </h1>

              {!loading && verses.length > 0 && (
                <p className="text-sm text-gray-500 font-medium">
                  Ayats {verses[0].verse_key.split(":")[1]} -{" "}
                  {verses[verses.length - 1].verse_key.split(":")[1]}
                </p>
              )}
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={reciter}
                onChange={(e) => setReciter(e.target.value)}
                className="p-2 border rounded-lg text-sm outline-none font-bold text-gray-700 bg-gray-50 flex-1 md:flex-none"
              >
                {Object.entries(RECITERS).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name.split("_")[0]}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsTooltipMode(!isTooltipMode)}
                className="p-2 border rounded-lg hover:bg-gray-100 text-gray-700"
              >
                {isTooltipMode ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* VERSES LIST */}
        <div className="space-y-6 mb-8">
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <Loader2 className="animate-spin text-green-600 mb-2" /> Loading
              Lesson...
            </div>
          ) : verses.length > 0 ? (
            verses.map((verse) => (
              <VerseCard
                key={verse.id}
                verse={verse}
                reciterKey={reciter}
                isTooltipMode={isTooltipMode}
                onTest={(v) => {
                  setTestVerses([v]);
                  setIsTestModalOpen(true);
                }}
              />
            ))
          ) : (
            <div className="text-center py-10 text-gray-400">
              No verses loaded. Try reloading.
            </div>
          )}
        </div>

        {/* ACTION BAR (Inline, not sticky) */}
        <div className="w-full flex justify-center pb-10">
          {reviewDay ? (
            <button
              onClick={loadData}
              className="w-full max-w-lg bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition flex justify-center gap-2"
            >
              <PlayCircle size={20} /> Return to Current
            </button>
          ) : (
            <button
              onClick={() => {
                setTestVerses(verses);
                setIsTestModalOpen(true);
              }}
              disabled={loading || verses.length === 0}
              className="w-full max-w-lg bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition flex justify-center gap-2 disabled:opacity-70"
            >
              <CheckCircle size={20} /> Complete & Test
            </button>
          )}
        </div>
      </main>

      {/* ---------------- RIGHT SIDEBAR (Quick Links & Jumper & User) ---------------- */}
      <aside className="w-full md:w-80 bg-white border-l border-gray-200 p-6 hidden md:flex flex-col h-screen sticky top-0 z-30">
        {/* User Profile */}
        <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center text-center gap-3">
          {isSignedIn ? (
            <>
              <UserButton showName />
              <p className="text-xs text-gray-500 font-bold">Welcome back!</p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <Calendar size={20} className="text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">Guest Mode</p>
              <button
                onClick={() => openSignIn()}
                className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
              >
                <LogIn size={14} /> Login to Save
              </button>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="mb-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
              <Search size={14} /> Jump to Surah
            </h2>
            <select
              value={progress?.currentSurahId || 1}
              onChange={changeSurah}
              disabled={loading}
              className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
            >
              {SURAH_LIST.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}. {s.name}
                </option>
              ))}
            </select>
          </div>

          <h2 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
            Quick Links
          </h2>
          <div className="grid gap-3">
            <Link
              href="/dashboard"
              className="p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50 transition block shadow-sm"
            >
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <LayoutDashboard size={18} className="text-blue-500" />{" "}
                Dashboard
              </h3>
            </Link>
            <Link
              href="/exam"
              className="p-4 rounded-xl border border-gray-100 bg-white hover:border-purple-200 hover:bg-purple-50 transition block shadow-sm"
            >
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                <BrainCircuit size={18} className="text-purple-500" />{" "}
                Vocabulary Exam
              </h3>
            </Link>
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="w-full flex justify-center gap-2 text-red-500 hover:bg-red-50 p-3 rounded-xl text-sm font-bold border border-transparent hover:border-red-100 transition"
          >
            <Trash2 size={16} /> Reset All Progress
          </button>
        </div>
      </aside>

      {/* MODALS */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-red-600 text-lg mb-2">
              Reset All Progress?
            </h3>
            <input
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
              className="w-full p-2 border rounded mb-4 text-black"
              placeholder='Type "reset"'
            />
            <button
              onClick={handleReset}
              disabled={resetInput !== "reset"}
              className="w-full py-2 bg-red-600 text-white rounded font-bold disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="w-full py-2 text-gray-500 mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isTestModalOpen && testVerses.length > 0 && (
        <DragTestModal
          verses={testVerses}
          onPass={handleTestPass}
          onCancel={() => setIsTestModalOpen(false)}
        />
      )}
    </div>
  );
}
