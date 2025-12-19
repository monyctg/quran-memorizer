export default function AyatCard({ verse }) {
  return (
    <div className="border-b p-6 hover:bg-slate-50">
      {/* Action Bar: Play Audio, Save, Bookmark */}
      <div className="flex justify-between text-slate-400 mb-4">
        <span>{verse.verse_key}</span>
        <button>Play Audio</button>
      </div>

      {/* Arabic Text - Right to Left */}
      <div className="flex flex-wrap flex-row-reverse gap-3 text-3xl font-amiri leading-loose mb-6">
        {verse.words.map((word) => (
          <div key={word.id} className="group relative text-center">
            <span className="cursor-pointer hover:text-green-600">
              {word.text_uthmani}
            </span>
            {/* Tooltip for Word by Word */}
            <span className="absolute hidden group-hover:block -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white p-1 rounded">
              {word.translation.text}
            </span>
          </div>
        ))}
      </div>

      {/* Translation */}
      <p className="text-lg text-gray-700">
        {verse.translations[0].text}{" "}
        {/* Ensure you fetch with translation resource */}
      </p>
    </div>
  );
}
