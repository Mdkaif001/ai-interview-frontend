"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { InterviewSetupForm } from "@/components/interview-setup-form";
import { useFormStore } from "@/lib/store/formStore";
import { useInterviewStore } from "@/lib/store/interviewStore";
import { startInterviewAPI } from "@/lib/api";
import { speakTextWithTTS } from "@/lib/audioApi";
import { InterviewSetupData } from "@/types";
import Image from "next/image";

export default function AIInterviewSetup() {
  const router = useRouter();
  const { setFormData } = useFormStore();
  const {
    addMessage: setConversation,
    incrementQuestionCount,
    setInterviewStartTime,
    resetStore: resetInterviewStore,
  } = useInterviewStore();
  const [loading, setLoading] = useState(false);

  const handleSetupSubmit = (data: InterviewSetupData) => {
    setFormData(data);
    startInterview(data);
  };

  const startInterview = async (setupData: InterviewSetupData) => {
    if (loading) return;

    setLoading(true);
    resetInterviewStore();
    setInterviewStartTime(new Date());

    const {
      companyName,
      jobRole,
      interviewCategory,
      interviewType,
      domain,
      inputType,
      skills,
      jobDescription,
    } = setupData;

    if (interviewCategory === "domain-specific") {
      if (!companyName || !jobRole || !domain) {
        alert("Please fill in all required fields.");
        setLoading(false);
        return;
      }
      if (inputType === "job-description" && !jobDescription) {
        alert("Job Description is required.");
        setLoading(false);
        return;
      }
      if (inputType === "skills-based" && skills.length <= 0) {
        alert("Skills is required.");
        setLoading(false);
        return;
      }
    }
    if (interviewCategory === "HR" && !interviewType) {
      alert("Interview Type is required.");
      setLoading(false);
      return;
    }

    try {
      const data = await startInterviewAPI(setupData);

      if (!data.success || !data.sessionId || !data.question) {
        throw new Error("Failed to start interview. Please try again.");
      }

      incrementQuestionCount();
      setConversation({
        role: "ai",
        content: data.question,
        isFeedback: data.isFeedback ?? false,
      });

      router.replace(`/${data.sessionId}`);
      speakTextWithTTS(data.question);
    } catch (error) {
      console.error("Error starting interview:", error);
    }
  };

  return (
    <div className="relative h-full bg-white flex justify-center">
      <InterviewSetupForm onSubmit={handleSetupSubmit} loading={loading} />
      <Image
        src="/assets/svg/wave.svg"
        alt="Wave SVG"
        width={100}
        height={100}
        className="absolute left-0 right-0 bottom-0 w-full z-0 h-44 md:h-fit object-cover"
      />
    </div>
  );
}
