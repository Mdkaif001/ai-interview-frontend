import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { jobDescription, conversation, questionCount, maxQuestions } = await req.json()

    // Get the last user response for feedback
    const lastUserResponse = conversation[conversation.length - 1]?.content || ""

    // Generate immediate feedback for the user's response
    const { text: feedback } = await generateText({
      model: openai("gpt-4"),
      system: `You are an experienced HR interviewer providing constructive feedback. 

Job Description: ${jobDescription}

Analyze the candidate's response and provide:
1. Brief positive acknowledgment (1-2 sentences)
2. Specific strengths in their answer
3. One gentle suggestion for improvement (if applicable)
4. Encouragement for the next question

Keep feedback concise, constructive, and encouraging. Start with "Great response!" or "Good answer!" or similar positive phrase.`,
      prompt: `The candidate just answered: "${lastUserResponse}"

Provide immediate constructive feedback on this response in 2-3 sentences.`,
    })

    // Check if interview should end
    const shouldEnd = questionCount >= maxQuestions

    if (shouldEnd) {
      // Generate overall interview feedback
      const conversationSummary = conversation
        .filter((msg: { role: string, content: string }) => msg.role === "user")
        .map((msg: { role: string, content: string }, index: number) => `Q${index + 1}: ${msg.content}`)
        .join("\n")

      const { text: overallFeedback } = await generateText({
        model: openai("gpt-4"),
        system: `You are an experienced HR interviewer providing comprehensive interview feedback.

Job Description: ${jobDescription}

Provide detailed feedback covering:
1. Overall performance summary
2. Key strengths demonstrated
3. Areas for improvement
4. Specific examples from their responses
5. Recommendations for career development
6. Overall interview rating (Strong/Good/Needs Improvement)

Be constructive, specific, and encouraging while being honest about areas for growth.`,
        prompt: `Based on this complete interview conversation, provide comprehensive feedback:

${conversationSummary}

Give detailed overall interview feedback and assessment.`,
      })

      return Response.json({
        feedback,
        overallFeedback,
        isComplete: true,
        status: "completed",
      })
    }

    // Generate next question
    const conversationContext = conversation
      .map((msg: { role: string, content: string }) => `${msg.role === "ai" ? "Interviewer" : "Candidate"}: ${msg.content}`)
      .join("\n")

    const { text: nextQuestion } = await generateText({
      model: openai("gpt-4"),
      system: `You are conducting a job interview. This is question ${questionCount + 1} of ${maxQuestions}.

Job Description: ${jobDescription}

Previous conversation:
${conversationContext}

Generate the next interview question that:
1. Builds on previous responses
2. Covers different aspects: technical skills, experience, problem-solving, cultural fit
3. Is appropriate for the role level
4. Maintains conversational flow
5. Is specific and engaging

Question areas to cover across the interview:
- Background and experience
- Technical/role-specific skills
- Problem-solving scenarios
- Team collaboration
- Career goals and motivation
- Handling challenges
- Cultural fit questions`,
      prompt: `Generate the next interview question (${questionCount + 1}/${maxQuestions}). Make it relevant to the job and build on their previous responses.`,
    })

    return Response.json({
      feedback,
      nextQuestion,
      isComplete: false,
      status: "continuing",
      questionCount: questionCount + 1,
    })
  } catch (error) {
    console.error("Error continuing interview:", error)
    return Response.json({ error: "Failed to continue interview" }, { status: 500 })
  }
}
