"use client";

import { useState } from "react";

type TraitScores = {
  [key: string]: number;
};

// 🎨 Dynamic colors per trait
const traitColors: Record<string, string> = {
  confidence: "linear-gradient(90deg,#4f46e5,#818cf8)",
  dominance: "linear-gradient(90deg,#dc2626,#f87171)",
  attractiveness: "linear-gradient(90deg,#ec4899,#f9a8d4)",
  style: "linear-gradient(90deg,#0ea5e9,#38bdf8)",
  sharpness: "linear-gradient(90deg,#22c55e,#86efac)",
  clarity: "linear-gradient(90deg,#f59e0b,#fde68a)",
  attitude: "linear-gradient(90deg,#7c3aed,#c4b5fd)",
};

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scores, setScores] = useState<TraitScores | null>(null);
  const [loading, setLoading] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch(
  "https://web-production-ff11c.up.railway.app/predict",
  {
    method: "POST",
    body: formData,
  }
);

      const text = await res.text();
      if (!text) throw new Error("Empty response");

      const data = JSON.parse(text);

      const formattedScores: TraitScores = {};
      for (const key in data.scores) {
        formattedScores[key] = Math.round(data.scores[key]);
      }

      setScores(formattedScores);
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // 🔢 Overall personality score
  const overall =
    scores
      ? Math.round(
          Object.values(scores).reduce((a, b) => a + b, 0) /
            Object.values(scores).length
        )
      : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 px-4 py-8">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-8">

        {/* TITLE */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-6">
          AI Personality Visual Analyzer
        </h1>

        {/* IMAGE PREVIEW */}
        {imagePreview && (
          <div className="flex justify-center mb-6 animate-fadeIn">
            <img
              src={imagePreview}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-300 shadow"
            />
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5 text-center">

          {/* FILE INPUT */}
          <label className="inline-block cursor-pointer bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition">
            Choose Image
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* SUBMIT */}
          <div>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-8 py-2 rounded-full hover:bg-indigo-700 hover:scale-105 transition"
            >
              {loading ? "Analyzing..." : "Analyze Personality"}
            </button>
          </div>
        </form>

        {/* RESULTS */}
        {scores && (
          <div className="mt-10 animate-slideUp">

            {/* 🔵 OVERALL RING */}
            <div className="flex justify-center mb-10">
              <div
                className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(
                    #4f46e5 ${overall * 3.6}deg,
                    #e5e7eb 0deg
                  )`,
                }}
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
                  <p className="text-3xl font-extrabold text-gray-900">
                    {overall}%
                  </p>
                  <p className="text-xs text-gray-600">
                    Overall Score
                  </p>
                </div>
              </div>
            </div>

            {/* 📊 TRAIT BARS */}
            <div className="space-y-5">
              {Object.entries(scores).map(([trait, value]) => (
                <div key={trait}>
                  <div className="flex justify-between mb-1">
                    <span className="capitalize font-semibold text-gray-900">
                      {trait}
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {value}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${value}%`,
                        background:
                          traitColors[trait] ||
                          "linear-gradient(90deg,#6366f1,#22d3ee)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <p className="text-xs text-gray-600 text-center mt-10">
          AI-based visual personality estimation.  
          Not a psychological diagnosis.
        </p>
      </div>
    </main>
  );
}
