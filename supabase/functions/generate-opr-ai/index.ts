import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  aktiviti: string;
  objektif: string;
  kekuatan: string;
  kelemahan: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { aktiviti, objektif, kekuatan, kelemahan }: RequestBody = await req.json();

    if (!aktiviti || !objektif || !kelemahan) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `
      Bertindak sebagai pakar dokumentasi pendidikan sekolah Malaysia.
      Sila jana dua bahagian laporan berdasarkan input berikut:

      INPUT:
      1. Objektif Program: ${objektif}
      2. Ringkasan Aktiviti: ${aktiviti}
      3. Kekuatan: ${kekuatan}
      4. Kelemahan: ${kelemahan}

      TUGASAN:
      1. Jana "Penambahbaikan": Cadangan konstruktif dan profesional berdasarkan Kelemahan dan Aktiviti. (Maksimum 50 patah perkataan)
      2. Jana "Refleksi": Rumusan impak program berdasarkan Objektif dan Pelaksanaan sama ada tercapai atau tidak. (Maksimum 50 patah perkataan)

      Gaya Bahasa: Bahasa Melayu Baku, Formal, Profesional (Laras bahasa pentadbiran sekolah).

      Respond with ONLY valid JSON in this format:
      {
        "penambahbaikan": "text here",
        "refleksi": "text here"
      }
    `;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              penambahbaikan: { type: "string" },
              refleksi: { type: "string" },
            },
            required: ["penambahbaikan", "refleksi"],
          },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API Error:", errorData);
      return new Response(
        JSON.stringify({
          error: "AI generation failed",
          penambahbaikan: "Gagal menjana cadangan penambahbaikan. Sila isi secara manual.",
          refleksi: "Gagal menjana refleksi. Sila isi secara manual."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      return new Response(
        JSON.stringify({
          error: "Empty response from AI",
          penambahbaikan: "Gagal menjana cadangan penambahbaikan. Sila isi secara manual.",
          refleksi: "Gagal menjana refleksi. Sila isi secara manual."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(resultText);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        penambahbaikan: "Gagal menjana cadangan penambahbaikan. Sila isi secara manual.",
        refleksi: "Gagal menjana refleksi. Sila isi secara manual."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
