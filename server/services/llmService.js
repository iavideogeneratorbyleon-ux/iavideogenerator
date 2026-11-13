// server/services/llmService.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Toma el MasterVideoPayload inicial, genera un título comercial atractivo
 * y estructura las escenas respetando la duración máxima del plan del usuario.
 */
export async function generateStructuredScript(masterPayload) {
  const { userInputs, llmDirective, visualConfig } = masterPayload;
  const maxDuration = llmDirective.maxDurationSeconds;
  const targetLangName = llmDirective.targetLanguage === "en" ? "English" : "Spanish";

  const targetSceneCount = maxDuration <= 30 ? "4 to 5" : "8 to 10";

  const systemPrompt = `
You are an expert viral short-form video director and scriptwriter for Cempai.ai.
Your task is to transform the user's input into a structured, high-retention video script broken down into timed scenes.

STRICT RULES:
1. Total video duration MUST NOT exceed ${maxDuration} seconds. Aim for ${targetSceneCount} cohesive scenes.
2. Generate a catchy, concise, commercial video title in ${targetLangName} (max 50 characters) suitable for a user's project dashboard.
3. All "voiceoverText" MUST be written in ${targetLangName}, adopting this tone: "${llmDirective.toneInstruction}".
4. Keep voiceover pacing natural (~2.2 words per second so it fits comfortably inside each scene's durationSeconds).
5. All "visualPrompt" fields MUST be written in English, describing concrete visual imagery (no text overlays, no watermarks) that blends seamlessly with this style modifier: "${visualConfig.stylePromptModifier}".
6. Mode instruction: ${
    llmDirective.task === "segment_existing_script"
      ? "The user provided an exact script. Segment it into scenes without altering their core message, adjusting pacing to fit within the max duration."
      : "The user provided a raw idea. Expand it into an engaging hook, body, and strong closing."
  }

You MUST respond ONLY with a valid JSON object matching this exact schema:
{
  "title": "Catchy Video Title",
  "totalDurationSeconds": 28,
  "scenes": [
    {
      "sceneNumber": 1,
      "durationSeconds": 6,
      "voiceoverText": "Narration text in target language...",
      "visualPrompt": "Detailed visual description in English..."
    }
  ]
}
`;

  const userPrompt = `
User Input (${userInputs.mode}):
"${userInputs.rawContent}"
Aspect Ratio: ${visualConfig.aspectRatio}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const rawJson = response.choices[0].message.content;
    const parsedScript = JSON.parse(rawJson);

    let accumulatedTime = 0;
    const safeScenes = [];

    for (const scene of parsedScript.scenes || []) {
      if (accumulatedTime + scene.durationSeconds <= maxDuration) {
        safeScenes.push({
          ...scene,
          visualAssetUrl: null,
        });
        accumulatedTime += scene.durationSeconds;
      } else {
        break;
      }
    }

    return {
      ...masterPayload,
      meta: {
        ...masterPayload.meta,
        status: "processing",
      },
      llmDirective: {
        ...masterPayload.llmDirective,
        structuredScript: {
          title: parsedScript.title || masterPayload.llmDirective.structuredScript?.title,
          totalDurationSeconds: accumulatedTime,
          scenes: safeScenes,
        },
      },
    };
  } catch (error) {
    console.error("❌ Error en generateStructuredScript:", error);
    throw new Error("Failed to generate structured script via LLM.");
  }
}
