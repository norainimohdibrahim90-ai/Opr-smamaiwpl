import { GenerateAIResponse } from "../types";

export const generateOPRContent = async (
  aktiviti: string,
  objektif: string,
  kekuatan: string,
  kelemahan: string
): Promise<GenerateAIResponse> => {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error("Supabase environment variables not configured");
    }

    const apiUrl = `${supabaseUrl}/functions/v1/generate-opr-ai`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aktiviti,
        objektif,
        kekuatan,
        kelemahan,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      return {
        penambahbaikan: "Gagal menjana cadangan penambahbaikan. Sila isi secara manual.",
        refleksi: "Gagal menjana refleksi. Sila isi secara manual."
      };
    }

    return data as GenerateAIResponse;

  } catch (error) {
    console.error("Generate OPR Content Error:", error);
    return {
      penambahbaikan: "Gagal menjana cadangan penambahbaikan. Sila isi secara manual.",
      refleksi: "Gagal menjana refleksi. Sila isi secara manual."
    };
  }
};