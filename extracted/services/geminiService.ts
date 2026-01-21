import { GoogleGenAI, Type } from "@google/genai";
import { GenerateAIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateOPRContent = async (
  aktiviti: string,
  objektif: string,
  kekuatan: string,
  kelemahan: string
): Promise<GenerateAIResponse> => {
  try {
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
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            penambahbaikan: { type: Type.STRING },
            refleksi: { type: Type.STRING }
          },
          required: ["penambahbaikan", "refleksi"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Tiada respon dari AI");
    
    return JSON.parse(resultText) as GenerateAIResponse;

  } catch (error) {
    console.error("Gemini AI Error:", error);
    return {
      penambahbaikan: "Gagal menjana cadangan penambahbaikan. Sila isi secara manual.",
      refleksi: "Gagal menjana refleksi. Sila isi secara manual."
    };
  }
};