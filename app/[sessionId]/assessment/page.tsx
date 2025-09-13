"use client";
import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle, CircleCheck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useInterviewStore } from "@/lib/store/interviewStore";
import { useParams, useRouter } from "next/navigation";
import { useFormStore } from "@/lib/store/formStore";
import { submitFinalInterviewAPI } from "@/lib/api";
import { downloadFeedbackPdf } from "@/lib/downloadAssessment";
import Image from "next/image";
import { ConfirmDialog } from "../ConfirmDialog";
import Lottie from "lottie-react";
import feedbackLoading from "@/public/assets/lottie/feedback-loading.json";

function FinalAssessment() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const { resetForm: resetInterviewSetup, formData } = useFormStore();
  const {
    overallFeedback,
    resetStore: resetInterviewStore,
    setOverallFeedback,
    setInterviewComplete,
    setInterviewStarted,
    questionCount,
    maxQuestions,
    stopSpeaking,
  } = useInterviewStore();
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const getFinalAssessment = useCallback(async () => {
    if (!sessionId) {
      console.error("Session ID not found.");
      setLoading(false);
      return;
    }

    try {
      const overallData = await submitFinalInterviewAPI(sessionId);

      if (
        !overallData?.overallFeedback ||
        (overallData.status && overallData.status === "error")
      ) {
        console.error("Error fetching final assessment data:", overallData);
        return;
      }

      console.log("final assessment data", overallData);
      setInterviewComplete(true);
      setOverallFeedback(overallData?.overallFeedback);
      setLoading(false);
    } catch (error) {
      console.log("Error getting next question:", error);
      setLoading(false);
    }
  }, [sessionId, setInterviewComplete, setOverallFeedback, setLoading]);

  useEffect(() => {
    getFinalAssessment();
  }, [getFinalAssessment]);

  const startNewInterview = async () => {
    resetInterviewStore();
    resetInterviewSetup();
    setInterviewStarted(false);
    stopSpeaking();
    router.replace("/");
  };

  const handleDownload = () => {
    downloadFeedbackPdf(overallFeedback, formData);
  };

  useEffect(() => {
    history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      setOpenDialog(true);
      history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-[#F5F8FF] flex flex-col items-center h-full w-screen pt-32">
        <Lottie
          animationData={feedbackLoading}
          loop
          autoplay
          className="w-[480px] h-[480px]"
        />
        <p className="text-sm sm:text-base font-medium leading-relaxed text-[#4A5A75]">
          Generating your final assessment...
        </p>
        <p className="text-sm sm:text-base font-medium leading-relaxed text-[#4A5A75]">
          please wait a few seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F8FF] flex flex-col items-center w-screen pt-4 sm:pt-32 p-2">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center sm:justify-between">
          <div className="flex  items-center space-x-2">
            <Image
              src="/assets/svg/Checklist.svg"
              alt="Wave SVG"
              width={32}
              height={32}
            />
            <h1 className="text-xl sm:text-3xl">Interview Assessment</h1>
          </div>
          <div className="flex items-center space-x-2">
            <CircleCheck className="w-6 h-6 text-white fill-[#47B881]" />
            <h1 className="text-base sm:text-xl font-medium">
              Progress: Question {questionCount} of {maxQuestions}
            </h1>
          </div>
        </div>

        <div className="border-2 border-[#E2E8F0] bg-white py-3 sm:py-9 px-2 sm:px-4 rounded-3xl">
          <div className="px-4 flex items-center justify-between">
            <p className="text-xl leading-relaxed">
              <span className="text-[#2E2E2E] text-sm sm:text-base">
                Overall Score:{" "}
              </span>
              <span className="text-[#3B64F6] text-sm sm:text-base">
                {overallFeedback?.overall_score}/100%
              </span>
            </p>
            {overallFeedback?.level && (
              <div className="text-sm sm:text-base text-center flex items-center juctify-center font-medium text-[#47B881] border border-[#47B881] rounded-full px-2 sm:px-3.5 space-x-2">
                <span className="text-3xl">•</span>
                <p>{overallFeedback?.level}</p>
              </div>
            )}
          </div>

          <div className="bg-[#F7F9FC] rounded-2xl px-4 mt-2 sm:mt-9 mb-2 sm:mb-6">
            <p className="text-sm sm:text-lg font-bold leading-relaxed text-[#4A5A75]">
              Summary:{" "}
              <span className="text-sm sm:text-base font-medium leading-relaxed text-[#4A5A75]">
                {overallFeedback?.summary}
              </span>
            </p>
          </div>

          <div className="px-4 space-y-2 sm:space-y-4">
            <p className="text-sm sm:text-base font-medium leading-relaxed text-[#2E2E2E]">
              💡 Clarity of Motivation:{" "}
              <span className="text-[#3B64F6] text-sm sm:text-base">
                {overallFeedback?.coaching_scores?.clarity_of_motivation}/5
              </span>
            </p>
            <p className="text-sm sm:text-base font-medium leading-relaxed text-[#2E2E2E]">
              🎯 Career Goal Alignment:{" "}
              <span className="text-[#3B64F6] text-sm sm:text-base">
                {overallFeedback?.coaching_scores?.career_goal_alignment}/5
              </span>
            </p>
            <p className="text-sm sm:text-base font-medium leading-relaxed text-[#2E2E2E]">
              📖 Specificity of Learning:{" "}
              <span className="text-[#3B64F6] text-sm sm:text-base">
                {overallFeedback?.coaching_scores?.specificity_of_learning}/5
              </span>
            </p>
          </div>
        </div>

        <div className="border-2 border-[#E2E8F0] bg-white pt-3 sm:py-9 px-2 sm:px-8 rounded-3xl">
          <div className="border-b border-[#E2E8F0] border-dashed  sm:pb-4">
            <p className="text-lg sm:text-xl leading-relaxed text-[#2E2E2E] text-center">
              📋 Question-wise Feedback
            </p>
          </div>

          <div className="space-y-4">
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="0"
            >
              {(overallFeedback?.questions_analysis || []).map(
                (section, index) => {
                  return (
                    <AccordionItem
                      value={index.toString()}
                      key={index}
                      className="bg-[#F7F9FC] mt-2 sm:mt-6 rounded-3xl px-2 sm:px-6"
                    >
                      <AccordionTrigger className="text-sm font-medium">
                        Q{index + 1}: {section.question}
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-2 sm:gap-4 text-balance">
                        <div className="flex items-start space-x-3">
                          <p className="text-sm leading-relaxed text-[#2E2E2E]">
                            <span className="font-semibold">
                              🗨️ Your Answer:&nbsp;
                            </span>
                            {section.response}
                          </p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <p className="text-sm leading-relaxed text-[#FF6652]">
                            <span className="font-semibold">🧠 Feedback:</span>{" "}
                            {section.feedback}
                          </p>
                        </div>
                        {section.strengths.length > 0 && (
                          <div className="flex items-start space-x-3 mb-2">
                            <p>✅ Strengths: </p>
                            <div className="flex flex-wrap gap-2">
                              {section.strengths?.map(
                                (item: string, idx: number) => (
                                  <span
                                    key={`strength-${idx}`}
                                    className="bg-green-100 text-green-800 sm:px-3 py-1 text-xs rounded-full font-medium"
                                  >
                                    {item}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {section.improvements.length > 0 && (
                          <div className="flex items-start space-x-3 mb-2">
                            <p className="text-nowrap">⚠️ Improvements: </p>
                            <div className="flex flex-wrap gap-2">
                              {section.improvements?.map(
                                (item: string, idx: number) => (
                                  <span
                                    key={`improvement-${idx}`}
                                    className=" text-red-800 sm:px-3 py-1 text-xs font-medium"
                                  >
                                    {item}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        <div className="flex items-start space-x-3">
                          <div className="flex items-start space-x-3 bg-[#E0ECFD] px-3.5 py-1.5 rounded-full">
                            <p className="text-sm leading-relaxed text-[#3B64F6]">
                              <span className="text-[#2E2E2E] font-semibold">
                                📊 Score:{" "}
                              </span>
                              {section.score}/10
                            </p>
                          </div>
                          <div className="flex items-start space-x-3 bg-[#E0ECFD] px-3.5 py-1.5 rounded-full">
                            <p className="text-sm leading-relaxed text-[#3B64F6]">
                              <span className="text-[#2E2E2E] font-semibold">
                                🎓 Depth:{" "}
                              </span>
                              {section.response_depth}
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                }
              )}
            </Accordion>
          </div>
        </div>

        <div className="border-2 border-[#E2E8F0] bg-white py-3 sm:py-9 px-2 sm:px-8 rounded-3xl">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
            <p className="text-sm leading-relaxed">
              {overallFeedback?.closure_message}
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto w-full py-3 my-2 flex justify-between space-x-6 ">
        <button
          onClick={handleDownload}
          className="py-2 w-full bg-white hover:text-[#3B57F6] text-[#3B64F6] rounded-md cursor-pointer border border-[#3B64F6]"
        >
          Download Report
        </button>
        <button
          onClick={startNewInterview}
          className="py-2 w-full bg-[#3B64F6] hover:bg-[#3B57F6] text-white rounded-md cursor-pointer"
        >
          Start New Interview
        </button>
      </div>
      <ConfirmDialog openDialogue={openDialog} setOpenDialog={setOpenDialog} />
    </div>
  );
}

export default FinalAssessment;
