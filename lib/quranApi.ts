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

// Map IDs to specific reciter audio paths (from EveryAyah or similar)
export const RECITERS = {
  alafasy: "Alafasy_128kbps",
  sudais: "Abdurrahmaan_As-Sudais_192kbps",
  shatri: "Abu_Bakr_Ash-Shaatree_128kbps",
  husary: "Husary_128kbps",
};

export async function getDailyVerses(
  surahId: number,
  startVerse: number,
  count: number = 2
) {
  const params = new URLSearchParams({
    language: "bn", // Meta language
    words: "true",
    word_fields: "text_uthmani,translation,audio_url",
    word_translation_language: "bn", // <--- THIS GETS BANGLA WORDS
    translations: "161", // 161 = Muhiuddin Khan. Try 213 for Taisirul if available.
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
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      versesData.push(data.verse);
    } catch (e) {
      console.error(`Error fetching verse ${key}:`, e);
    }
  }

  return versesData;
}
