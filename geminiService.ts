
import { GoogleGenAI, Type } from "@google/genai";
import { Feedback, Session, AIInsight, EVALUATION_QUESTIONS } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateSessionReport(session: Session, feedbacks: Feedback[]): Promise<AIInsight> {
  const getAvg = (cat: string) => {
    const vals = feedbacks.flatMap(f => f.scores.filter(s => s.category === cat).map(s => s.score));
    if (vals.length === 0) return "0.00";
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
  };

  const avgScores = {
    material: getAvg('material'),
    presenter: getAvg('presenter'),
    engagement: getAvg('engagement'),
    outcomes: getAvg('outcomes'),
    logistics: getAvg('logistics'),
    overall: getAvg('overall'),
  };

  const commentsText = feedbacks.map(f => `"${f.comments}"`).filter(c => c.length > 5).join('\n');

  const prompt = `
    Conduct a comprehensive training session analysis for: "${session.title}" led by ${session.presenterName} at ${session.location}.
    
    QUANTITATIVE DATA (Average scores 1-5 across metrics):
    - Material Quality (Structure, Relevance, Depth): ${avgScores.material}
    - Presenter Competence (Clarity, Interaction, Time Mgmt): ${avgScores.presenter}
    - Engagement Index (Methods, Pace): ${avgScores.engagement}
    - Learning Outcomes (Application, Knowledge Gain): ${avgScores.outcomes}
    - Logistics (Timing, Environment): ${avgScores.logistics}
    - Overall Rating: ${avgScores.overall}

    QUALITATIVE FEEDBACK (Participant Comments):
    ${commentsText}

    REQUIRED OUTPUT:
    For EACH of the 6 categories (Material, Presenter, Engagement, Outcomes, Logistics, Overall), provide:
    1. A specific analysis based on the scores and comments.
    2. A detailed recommendation to improve that specific area.
    
    Also provide:
    - Top 3 General Strengths.
    - Top 3 General Weaknesses.
    - An executive summary.
    - Future improvement plans for Material, Delivery, and Engagement.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sessionId: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          overallSummary: { type: Type.STRING },
          categoryAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                score: { type: Type.STRING },
                analysis: { type: Type.STRING },
                detailedRecommendation: { type: Type.STRING }
              },
              required: ["category", "score", "analysis", "detailedRecommendation"]
            }
          },
          futureImprovements: {
            type: Type.OBJECT,
            properties: {
              material: { type: Type.STRING },
              delivery: { type: Type.STRING },
              engagement: { type: Type.STRING }
            },
            required: ["material", "delivery", "engagement"]
          }
        },
        required: ["sessionId", "strengths", "weaknesses", "recommendations", "overallSummary", "categoryAnalysis", "futureImprovements"]
      }
    }
  });

  const result = JSON.parse(response.text || '{}');
  return { ...result, sessionId: session.id };
}
