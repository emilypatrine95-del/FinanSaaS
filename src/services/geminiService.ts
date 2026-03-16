import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeFinances(transactions: Transaction[]): Promise<AIAnalysis> {
  const model = "gemini-3.1-flash-lite-preview";
  
  const transactionData = transactions.map(t => ({
    type: t.type,
    amount: t.amount,
    category: t.category,
    date: t.date,
    description: t.description
  }));

  const prompt = `Analise os seguintes dados financeiros e forneça um resumo estruturado em JSON:
  ${JSON.stringify(transactionData)}
  
  O resumo deve incluir:
  1. Um resumo geral da situação financeira.
  2. Dicas práticas de economia.
  3. Identificação de padrões de gastos.
  4. Uma previsão simples para o próximo mês baseada na média.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            savingsTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            patterns: { type: Type.STRING },
            forecast: { type: Type.STRING }
          },
          required: ["summary", "savingsTips", "patterns", "forecast"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response");
    return JSON.parse(text) as AIAnalysis;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      summary: "Não foi possível gerar a análise no momento.",
      savingsTips: ["Tente novamente mais tarde."],
      patterns: "Dados insuficientes.",
      forecast: "Indisponível."
    };
  }
}
