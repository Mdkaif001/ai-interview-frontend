import {
  InterviewSetupData,
  InterviewStartResponse,
  OverallFeedback,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050";

export async function startInterviewAPI(
  setupData: InterviewSetupData
): Promise<InterviewStartResponse> {
  const {
    companyName,
    jobRole,
    jobDescription,
    domain,
    interviewCategory,
    inputType,
    skills,
    interviewType,
  } = setupData;

  const body =
    interviewCategory === "domain-specific"
      ? {
          companyName,
          jobRole,
          jobDescription,
          domain,
          interviewType: interviewCategory,
          inputType,
          skills,
        }
      : {
          companyName,
          interviewType: interviewCategory,
          hrRoundType: interviewType.toLowerCase(),
        };

  const response = await fetch(`${BASE_URL}/api/interviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to start interview. Please try again.");
  }

  const data = await response.json();
  return data;
}

export async function submitAnswerAPI(
  sessionId: string,
  answer: string
): Promise<{
  feedback: string;
  nextQuestion?: string;
}> {
  const response = await fetch(
    `${BASE_URL}/api/interviews/${sessionId}/answers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answer }),
    }
  );

  if (!response.ok) throw new Error("Failed to submit answer");

  return response.json();
}

export async function getNextQuestionAPI(
  sessionId: string
): Promise<{ question: string }> {
  const response = await fetch(
    `${BASE_URL}/api/interviews/${sessionId}/questions`
  );

  if (!response.ok) throw new Error("Failed to get next answer");

  return response.json();
}

export async function reviseAnswerAPI(
  sessionId: string
): Promise<{ question: string }> {
  const response = await fetch(
    `${BASE_URL}/api/interviews/${sessionId}/revise`
  );

  if (!response.ok) throw new Error("Failed to revise answer");

  return response.json();
}

export async function submitFinalInterviewAPI(sessionId: string): Promise<{
  status: string;
  overallFeedback: OverallFeedback;
}> {
  const response = await fetch(
    `${BASE_URL}/api/interviews/${sessionId}/submit`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to submit final interview");

  return response.json();
}

export async function getSkills({
  domain,
  jobRole,
}: {
  domain: string;
  jobRole: string;
}): Promise<{
  skills: string[];
  success: boolean;
}> {
  const response = await fetch(`${BASE_URL}/api/skills`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ domain, jobRole }),
  });

  if (!response.ok) throw new Error("Failed to submit final interview");

  return response.json();
}
