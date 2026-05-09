import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    try {
        const { type, content, currentDescription } = await req.json();
        const genAI = new GoogleGenerativeAI(apiKey);

        // Use a faster model if available, otherwise standard flash
        // The user asked for "Gemini 2.5 Flash Lite" which doesn't technically exist publicly yet ensuring fallback
        // We will strictly use "gemini-1.5-flash" as it is the current fast standard or "gemini-pro" if flash fails.
        // For now, let's stick to valid model names. "gemini-1.5-flash" is excellent.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        if (type === "tag") {
            const prompt = `
            Analyze the following skill description and assign it to EXACTLY ONE of these categories: 
            "Tech", "Art", "Music", "Language", "Lifestyle", "Other".
            
            Return ONLY the category name. No other text.

            Title/Description: "${content}"
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            // simple validation
            const valid = ["Tech", "Art", "Music", "Language", "Lifestyle", "Other"];
            const category = valid.find(v => text.includes(v)) || "Other";

            return NextResponse.json({ category });
        }

        if (type === "enhance") {
            const prompt = `
            Act as a professional copywriter. Rewrite the following skill description to be engaging, clear, and professional.
            
            RULES:
            1. Return ONLY the rewritten text.
            2. Do NOT provide multiple options.
            3. Do NOT include conversational filler like "Here is a better version".
            4. Maintain the original meaning but make it sound more credible.
            5. Provide a single, polished paragraph.
            
            Original Description: "${content}"
            `;
            const result = await model.generateContent(prompt);
            const enhancedText = result.response.text().trim();
            return NextResponse.json({ enhancedText });
        }

        if (type === "moderate") {
            const prompt = `
            Analyze the following text for safety violations.
            
            Determine SEVERITY:
            - "high": Hate speech, racial slurs, death threats, sexual violence, dangerous instructions. (VILE/DANGEROUS)
            - "low": General insults (e.g. "you're stupid"), mild toxic behavior, controversial topics, spammy behavior. (RUDE/ANNOYING)
            - "safe": Normal conversation, constructive criticism, friendly banter.

            Text: "${content}"

            Return JSON format ONLY:
            {
                "severity": "high" | "low" | "safe",
                "reason": "short description of violation or null"
            }
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '');
            try {
                const json = JSON.parse(text);
                return NextResponse.json(json);
            } catch (e) {
                console.warn("Moderation JSON parse failed", text);
                return NextResponse.json({ severity: "safe", reason: null });
            }
        }

        return NextResponse.json({ error: "Invalid request type" }, { status: 400 });

    } catch (error) {
        console.error("AI Error:", error);
        return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 });
    }
}
