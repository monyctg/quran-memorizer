// lib/quranApi.ts

const BASE_URL = "https://api.quran.com/api/v4";

export interface Word {
  id: number;
  position: number;
  audio_url: string;
  char_type_name: string;
  text_uthmani: string;
  translation: { text: string };
}

export interface Verse {
  id: number;
  verse_key: string;
  words: Word[];
  translations: { text: string }[];
  audio: { url: string };
}

export const RECITERS = {
  alafasy: "Alafasy_128kbps",
  sudais: "Abdurrahmaan_As-Sudais_192kbps",
  shatri: "Abu_Bakr_Ash-Shaatree_128kbps",
  husary: "Husary_128kbps",
};

// 👇 NEW: Helper to get Surah Details (Name, Total Verses)
export async function getSurahInfo(surahId: number) {
  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/chapters/${surahId}?language=en`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.chapter; // { name_simple, verses_count, id, ... }
  } catch (error) {
    console.error("Failed to fetch surah info", error);
    return null;
  }
}

export async function getDailyVerses(
  surahId: number,
  startVerse: number,
  count: number = 2
) {
  const params = new URLSearchParams({
    language: "bn", // Bengali
    words: "true",
    word_fields: "text_uthmani,translation,audio_url",
    word_translation_language: "bn",
    translations: "161",
    audio: "1",
    per_page: count.toString(),
    page: "1",
  });

  const versesData: Verse[] = [];

  for (let i = 0; i < count; i++) {
    const verseNum = startVerse + i;
    const key = `${surahId}:${verseNum}`;

    try {
      const res = await fetch(
        `${BASE_URL}/verses/by_key/${key}?${params.toString()}`
      );

      // 👇 FIX: If verse doesn't exist (404), stop loop gracefully
      if (!res.ok) {
        console.warn(`Verse ${key} not found (End of Surah?)`);
        break;
      }

      const data = await res.json();
      versesData.push(data.verse);
    } catch (e) {
      console.error(`Error fetching verse ${key}:`, e);
    }
  }

  return versesData;
}
