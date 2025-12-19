// lib/api.ts
const BASE_URL = "https://api.quran.com/api/v4";

export async function getAyats(
  surahId: number,
  start: number,
  limit: number = 2
) {
  // Logic to fetch verses based on Surah and Ayat number
  // We use 'verses/by_chapter' with pagination to simulate ranges
  const res = await fetch(
    `${BASE_URL}/verses/by_chapter/${surahId}?language=en&words=true&per_page=${limit}&page=${Math.ceil(
      start / limit
    )}`
  );
  const data = await res.json();
  return data;
  // Note: You will need to filter/map the specific verses exactly as Quran.com logic can be tricky with pagination.
}
