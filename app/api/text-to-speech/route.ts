import { OpenAI } from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: Request) {
  try {
    const { text, voice = "nova", model = "tts-1" } = await req.json()

    if (!text) {
      return Response.json({ error: "Text is required" }, { status: 400 })
    }

    const response = await openai.audio.speech.create({
      model,
      voice,
      input: text,
    })

    const audioStream = await response.arrayBuffer()

    return new Response(audioStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioStream.byteLength.toString(),
      },
    })
  } catch (err) {
    console.error("TTS error:", err)
    return Response.json({ error: "Failed to synthesize speech" }, { status: 500 })
  }
}
