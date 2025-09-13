import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { jobDescription } = await req.json()

    const { text } = await generateText({
      model: openai("gpt-4"),
      system: `You are an experienced HR interviewer. You will conduct a professional job interview based on the provided job description. 

Rules:
1. Start with a warm greeting and brief introduction
2. Ask relevant questions based on the job requirements
3. Keep questions conversational and professional
4. Ask one question at a time
5. Be encouraging and supportive

Job Description: ${jobDescription}`,
      prompt:
        "Generate the first interview question. Start with a greeting and then ask an opening question about the candidate's background or interest in the role.",
    })

    return Response.json({
      firstQuestion: text,
      status: "started",
    })
  } catch (error) {
    console.error("Error starting interview:", error)
    return Response.json({ error: "Failed to start interview" }, { status: 500 })
  }
}
