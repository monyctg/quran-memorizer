"use server";

import { db } from "@/db";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { getDailyVerses, getSurahInfo } from "@/lib/quranApi";

// ... [Keep getUserProgress and getVersesForDay as they were] ...

export async function getUserProgress() {
  const { userId } = await auth();
  if (!userId) return null;
  try {
    const progress = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    if (progress.length === 0) {
      const newEntry = {
        userId: userId,
        learningMode: "sequential" as const,
        currentSurahId: 1,
        currentAyah: 1,
        completedAyahsToday: 0,
        dayNumber: 1,
      };
      await db.insert(userProgress).values(newEntry);
      return newEntry;
    }
    return progress[0];
  } catch (error) {
    console.error("Database Error:", error);
    return null;
  }
}

// ... [Keep updateProgress as is from the previous robust version] ...
export async function updateProgress(
  mode: "next_verse" | "complete_day" | "set_surah",
  payload?: any
) {
  const { userId } = await auth();
  if (!userId) return { success: false };

  try {
    const currentProgress = await getUserProgress();
    if (!currentProgress) return { success: false };

    // Manual Set
    if (mode === "set_surah" && payload) {
      await db
        .update(userProgress)
        .set({
          currentSurahId: payload.surahId,
          currentAyah: payload.ayah,
          completedAyahsToday: 0,
          lastUpdated: new Date(),
        })
        .where(eq(userProgress.userId, userId));
      revalidatePath("/");
      return { success: true };
    }

    // Calculation Logic
    let nextAyah = currentProgress.currentAyah;
    let nextSurah = currentProgress.currentSurahId;
    let nextDay = currentProgress.dayNumber;

    // Check limits
    const surahInfo = await getSurahInfo(nextSurah);
    const totalVerses = surahInfo?.verses_count || 300;

    if (mode === "complete_day") {
      nextDay++;
      nextAyah += 2;
    } else {
      nextAyah += 2;
    }

    // If passed end of Surah, go to next
    if (nextAyah > totalVerses) {
      nextSurah++;
      nextAyah = 1;
      if (nextSurah > 114) nextSurah = 1;
    }

    await db
      .update(userProgress)
      .set({
        currentSurahId: nextSurah,
        currentAyah: nextAyah,
        dayNumber: nextDay,
        completedAyahsToday: 0,
        lastUpdated: new Date(),
      })
      .where(eq(userProgress.userId, userId));

    revalidatePath("/");
    return { success: true, nextAyah, nextDay, nextSurah };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false };
  }
}

// 👇 NEW: RESET FUNCTION
export async function resetUserProgress() {
  const { userId } = await auth();
  if (!userId) return { success: false };

  try {
    // Delete the entry completely
    await db.delete(userProgress).where(eq(userProgress.userId, userId));
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Reset Error:", error);
    return { success: false };
  }
}

// Helpers
export async function getVersesForDay(day: number) {
  const progress = await getUserProgress();
  if (!progress) return [];
  return await getDailyVerses(progress.currentSurahId, progress.currentAyah, 2);
}
