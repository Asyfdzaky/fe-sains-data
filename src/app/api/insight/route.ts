import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { cluster, recency, frequency, monetary, total, label } =
      await req.json();

    const apiKey = "AIzaSyDWBqG3JtXmo1CogfFJzhA-4dss4CI-KUg";

    if (!apiKey) {
      return NextResponse.json(
        { message: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const prompt = `
        Role: Marketing Expert. Task: Analyze customer segment.
        Stats:
        - Label: "${label}"
        - Avg Recency: ${Number(recency).toFixed(1)} days
        - Avg Frequency: ${Number(frequency).toFixed(1)} txns
        - Avg Monetary: $${Number(monetary).toLocaleString("en-US")}
        - Population: ${total}

        Output JSON only:
        {
          "insight": "1-sentence behavioral reason for these stats",
          "strategy": "2-sentence strategy to improve metrics",
          "action": "1 concrete action item"
        }
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      return NextResponse.json(
        { message: "Failed to fetch from Gemini API", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Clean up markdown code blocks if any (defensive coding)
    const cleanText = generatedText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", cleanText);
      // Fallback or partial text
      jsonResponse = {
        insight: cleanText,
        strategy: "Could not parse specific strategy.",
        action: "Review raw output.",
      };
    }

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("Insight API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
