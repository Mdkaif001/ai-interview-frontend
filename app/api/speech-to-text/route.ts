import type { NextRequest } from "next/server"
import { OpenAI } from "openai"
import { writeFile } from "fs/promises"
import { tmpdir } from "os"
import path from "path"
import { createReadStream } from "fs"

// Polyfill globalThis.File for OpenAI SDK in Node.js < 20
import { File as NodeFile } from "node:buffer";
if (typeof globalThis.File === "undefined") {
  // @ts-expect-error: NodeFile is being polyfilled for environments below Node 20
  globalThis.File = NodeFile;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return Response.json({ error: "Audio file is required" }, { status: 400 })
    }

    // Convert File to Buffer for OpenAI API
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create a temporary file for OpenAI API
    const tempFilePath = path.join(tmpdir(), `speech-${Date.now()}.webm`)
    await writeFile(tempFilePath, buffer)

    // Use OpenAI's Whisper API for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(tempFilePath),
      model: "whisper-1",
      language: "en",
    })

    return Response.json({ transcript: transcription.text })
  } catch (error) {
    console.error("Speech-to-text error:", error)
    return Response.json({ error: "Failed to transcribe speech" }, { status: 500 })
  }
}
