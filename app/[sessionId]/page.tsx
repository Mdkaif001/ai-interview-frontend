"use client";

import { useEffect, useRef, useState } from "react";
import { FeedbackDisplay } from "@/components/feedback-display";
import { VideoCall } from "@/components/video-call";
import { AudioRecorder } from "@/components/audio-recorder";
import { ResponseInput } from "@/components/response-input";
import { useParams } from "next/navigation";
import { submitAnswerAPI } from "@/lib/api";
import { useFormStore } from "@/lib/store/formStore";
import { useInterviewStore } from "@/lib/store/interviewStore";
import { speakTextWithTTS } from "@/lib/audioApi";
import { ConfirmDialog } from "./ConfirmDialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TabLabels = [
  {
    value: "video",
    label: "Video Call",
  },
  {
    value: "chat",
    label: "Conversation",
  },
];

export default function AIInterviewSystem() {
  const { formData: interviewSetup } = useFormStore();
  const {
    conversation,
    addMessage: setConversation,
    overallFeedback,
    interviewComplete,
    isAISpeaking,
    questionCount,
    maxQuestions,
    stopSpeaking,
    audioInstance,
  } = useInterviewStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [textResponse, setTextResponse] = useState("");

  const { startRecording, stopRecording } = AudioRecorder({
    onTranscription: (text) => {
      setTextResponse((prev) => prev + text);
      setIsTranscribing(false);
    },
    isRecording,
    onRecordingStart: () => setIsRecording(true),
    onRecordingStop: () => {
      setIsRecording(false);
      setIsTranscribing(true);
    },
  });

  const handleUserResponse = async (userResponse: string) => {
    if (!interviewSetup) return;

    if (!sessionId) {
      console.error("Session ID not found.");
      return;
    }

    const newConversation = { role: "user" as const, content: userResponse };
    setConversation(newConversation);
    setIsWaiting(true);

    try {
      const data = await submitAnswerAPI(sessionId, userResponse);

      setConversation({ role: "ai", content: data.feedback, isFeedback: true });
      await speakTextWithTTS(data.feedback);
    } catch (error) {
      console.error("Error getting AI response:", error);
    } finally {
      setIsWaiting(false);
    }
  };

  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, overallFeedback]);

  // TODO: default browser popup on refresh
  useEffect(() => {
    history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      setOpenDialog(true);
      history.pushState(null, "", window.location.href);
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();

      setOpenDialog(true);
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="w-full flex-1 flex flex-col sm:block bg-[#F5F8FF] py-2 sm:pt-24 md:pt-24 px-3 xl:px-0">
      {/* progress bar for small screens */}
      <div className=" p-1 sm:p-2 md:py-4 md:px-5 rounded-2xl bg-[#fff] flex md:hidden flex-row items-center gap-1 sm:gap-2 mb-2 h-fit">
        <Image
          src="/assets/svg/question.svg"
          alt="question_logo"
          width={20}
          height={20}
        />

        <div className="flex-1 flex items-center justify-between gap-2 px-1.5">
          {[...Array(maxQuestions)].map((_, index) => (
            <div
              key={index}
              className={`w-full h-2  rounded-sm ${
                index < questionCount ? "bg-[#47B881]" : "bg-[#CDD8E8]"
              }`}
            />
          ))}
        </div>
        <p className="text=lg sm:text-xl font-medium">
          {questionCount}/{maxQuestions}
        </p>
        <div className="w-[2px] h-full bg-[#E2E8F0] mx-2" />
        <Button
          className="bg-[#FF4343] py-3 px-4 rounded-full cursor-pointer hover:opacity-95 h-fit"
          onClick={() => setOpenDialog(true)}
        >
          <Image
            src="/assets/svg/call.svg"
            alt="AI"
            width={100}
            height={100}
            className="w-6"
          />
        </Button>
      </div>

      {/* main screens with video */}
      <div className="w-full xl:w-7xl h-full mx-auto flex flex-col md:grid-cols-[2fr_5fr] gap-2 lg:gap-4 md:grid ">
        {/* video screens */}
        <div className="hidden sm:flex gap-4 w-full sm:w-[80%] md:w-full h-fit mx-auto md:mx-0">
          <VideoCall />
        </div>

        {/* chat screens */}
        <div className="flex-1 md:h-[85vh] rounded-3xl overflow-hidden bg-[#FFFFFF] border sborder-[#E2E8F0] hidden sm:flex flex-col pb-2 sm:pb-0">
          {/* progress bar for larger screens */}
          <div className="py-4 px-5 m-2 rounded-tl-2xl rounded-tr-2xl bg-[#F7F9FC] hidden md:flex flex-row items-center gap-2 ">
            <Image
              src="/assets/svg/question.svg"
              alt="question_logo"
              width={20}
              height={20}
            />
            <p className="text-xl font-medium">Question</p>

            <div className="flex-1 flex items-center justify-between gap-2 px-1.5">
              {[...Array(maxQuestions)].map((_, index) => (
                <div
                  key={index}
                  className={`w-full h-2  rounded-sm ${
                    index < questionCount ? "bg-[#47B881]" : "bg-[#CDD8E8]"
                  }`}
                />
              ))}
            </div>
            <p className="text-xl font-medium">
              {questionCount}/{maxQuestions}
            </p>
            <div className="w-[2px] h-full bg-[#E2E8F0] mx-2" />
            <Button
              className="bg-[#FF4343] w-12 rounded-full cursor-pointer hover:opacity-95"
              onClick={() => setOpenDialog(true)}
            >
              <Image
                src="/assets/svg/call.svg"
                alt="AI"
                width={24}
                height={24}
              />
            </Button>
          </div>

          {/* divider */}
          <div className="w-full h-[1px] bg-[#E2E8F0] hidden md:block" />

          {/* conversation display */}
          <div className="flex-1 max-h-[60vh] sm:max-h-[49vh] md:max-h-full overflow-y-scroll px-2 sm:px-6 ">
            <div className="flex flex-col sm:space-y-4">
              {conversation.map((message, index) => {
                const isLastMessage = index === conversation.length - 1;

                if (message?.isFeedback) {
                  return (
                    <FeedbackDisplay
                      key={index}
                      feedback={message.content}
                      isLastMessage={isLastMessage}
                    />
                  );
                }

                return (
                  <div
                    key={index}
                    className={`p-2 w-fit max-w-[90%] flex flex-col ${
                      message.role === "ai" ? "self-start" : "self-end"
                    }`}
                  >
                    <div className="flex flex-col gap-1 ">
                      {message.role === "ai" ? (
                        <div className="flex items-center gap-2">
                          <Image
                            src="/assets/svg/interviewAi.svg"
                            alt="AI"
                            width={24}
                            height={24}
                            className="sm:w-6 sm:h-6 w-4 h-4"
                          />
                          <p className="text-sm sm:text-base font-semibold">
                            AI Interviewer
                          </p>

                          {isLastMessage && isAISpeaking && (
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                className="flex items-center gap-2 px-1 py-0 sm:px-2 sm:py-1 h-fit text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition cursor-pointer"
                                onClick={stopSpeaking}
                              >
                                <div className="relative w-4 h-4 flex items-center justify-center">
                                  <Image
                                    src="/assets/svg/pause.svg"
                                    alt="Pause AI Audio"
                                    width={16}
                                    height={16}
                                    className="sm:w-4 sm:h-4 w-3 h-3 z-10"
                                  />
                                  <div className="absolute sm:w-6 sm:h-6 w-4 h-4 bg-[#3B64F6] opacity-50 rounded-full animate-ping duration-300" />
                                </div>
                                <span>Skip Audio</span>
                              </Button>
                              {!audioInstance && (
                                <p className="text-sm text-muted-foreground italic hidden sm:flex">
                                  Generating audio...
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-row-reverse items-center gap-2">
                          <Image
                            src="/assets/images/maleAvatar.jpg"
                            alt="AI"
                            width={24}
                            height={24}
                            className="sm:w-6 sm:h-6 w-4 h-4 rounded-full"
                          />
                          <p className="text-sm sm:text-base font-semibold">
                            You
                          </p>
                        </div>
                      )}

                      <p
                        className={`px-3 py-2 sm:p-6  border  rounded-2xl text-sm font-normal sm:font-medium ${
                          message.role === "ai"
                            ? "border-[#8692A633]"
                            : "border-[#F4F3FF] bg-[#E2E8FF]"
                        }`}
                      >
                        {message.content}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>
          </div>

          <div className="pb-1 sm:px-5 border-t border-[#E2E8F0] hidden sm:block">
            {!interviewComplete && (
              <ResponseInput
                onSubmitText={handleUserResponse}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                isTranscribing={isTranscribing}
                isRecording={isRecording}
                isAISpeaking={isAISpeaking}
                isWaiting={isWaiting}
                speakTextWithTTS={speakTextWithTTS}
                isLatestFeedback={
                  conversation.length > 0
                    ? conversation[conversation.length - 1]?.isFeedback ?? false
                    : false
                }
                textResponse={textResponse}
                setTextResponse={setTextResponse}
              />
            )}
          </div>
        </div>

        {/* tabs for mobile screen */}
        <Tabs
          defaultValue="chat"
          className="w-full flex-1 flex flex-col sm:hidden"
        >
          <TabsList className="w-full">
            {TabLabels.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="video" className="flex-1 flex">
            <div className="sm:hidden gap-4 w-full sm:w-[80%] md:w-full h-fit mx-auto md:mx-0">
              <VideoCall />
            </div>
          </TabsContent>
          <TabsContent value="chat" className="flex">
            <div className="h-[75vh] rounded-3xl overflow-hidden bg-[#FFFFFF] border sborder-[#E2E8F0] sm:hidden flex flex-col pb-2 sm:pb-0">
              {/* progress bar for larger screens */}
              <div className="py-4 px-5 m-2 rounded-tl-2xl rounded-tr-2xl bg-[#F7F9FC] hidden md:flex flex-row items-center gap-2 ">
                <Image
                  src="/assets/svg/question.svg"
                  alt="question_logo"
                  width={20}
                  height={20}
                />
                <p className="text-xl font-medium">Question</p>

                <div className="flex-1 flex items-center justify-between gap-2 px-1.5">
                  {[...Array(maxQuestions)].map((_, index) => (
                    <div
                      key={index}
                      className={`w-full h-2  rounded-sm ${
                        index < questionCount ? "bg-[#47B881]" : "bg-[#CDD8E8]"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xl font-medium">
                  {questionCount}/{maxQuestions}
                </p>
                <div className="w-[2px] h-full bg-[#E2E8F0] mx-2" />
                <Button
                  className="bg-[#FF4343] w-12 rounded-full cursor-pointer hover:opacity-95"
                  onClick={() => setOpenDialog(true)}
                >
                  <Image
                    src="/assets/svg/call.svg"
                    alt="AI"
                    width={24}
                    height={24}
                  />
                </Button>
              </div>

              {/* divider */}
              <div className="w-full h-[1px] bg-[#E2E8F0] hidden md:block" />

              {/* conversation display */}
              <div className="h-full pb-20 sm:pb-0 sm:max-h-[49vh] md:max-h-full overflow-y-scroll px-2 sm:px-6 ">
                <div className="flex flex-col sm:space-y-4">
                  {conversation.map((message, index) => {
                    const isLastMessage = index === conversation.length - 1;

                    if (message?.isFeedback) {
                      return (
                        <FeedbackDisplay
                          key={index}
                          feedback={message.content}
                          isLastMessage={isLastMessage}
                        />
                      );
                    }

                    return (
                      <div
                        key={index}
                        className={`p-2 w-fit max-w-[90%] flex flex-col ${
                          message.role === "ai" ? "self-start" : "self-end"
                        }`}
                      >
                        <div className="flex flex-col gap-1 ">
                          {message.role === "ai" ? (
                            <div className="flex items-center gap-2">
                              <Image
                                src="/assets/svg/interviewAi.svg"
                                alt="AI"
                                width={24}
                                height={24}
                                className="sm:w-6 sm:h-6 w-4 h-4"
                              />
                              <p className="text-sm sm:text-base font-semibold">
                                AI Interviewer
                              </p>

                              {isLastMessage && isAISpeaking && (
                                <div className="flex items-center gap-1.5">
                                  <Button
                                    variant="ghost"
                                    className="flex items-center gap-2 px-1 py-0 sm:px-2 sm:py-1 h-fit text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition cursor-pointer"
                                    onClick={stopSpeaking}
                                  >
                                    <div className="relative w-4 h-4 flex items-center justify-center">
                                      <Image
                                        src="/assets/svg/pause.svg"
                                        alt="Pause AI Audio"
                                        width={16}
                                        height={16}
                                        className="sm:w-4 sm:h-4 w-3 h-3 z-10"
                                      />
                                      <div className="absolute sm:w-6 sm:h-6 w-4 h-4 bg-[#3B64F6] opacity-50 rounded-full animate-ping duration-300" />
                                    </div>
                                    <span>Skip Audio</span>
                                  </Button>
                                  {!audioInstance && (
                                    <p className="text-sm text-muted-foreground italic hidden sm:flex">
                                      Generating audio...
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-row-reverse items-center gap-2">
                              <Image
                                src="/assets/images/maleAvatar.jpg"
                                alt="AI"
                                width={24}
                                height={24}
                                className="sm:w-6 sm:h-6 w-4 h-4 rounded-full"
                              />
                              <p className="text-sm sm:text-base font-semibold">
                                You
                              </p>
                            </div>
                          )}

                          <p
                            className={`px-3 py-2 sm:p-6  border  rounded-2xl text-sm font-normal sm:font-medium ${
                              message.role === "ai"
                                ? "border-[#8692A633]"
                                : "border-[#F4F3FF] bg-[#E2E8FF]"
                            }`}
                          >
                            {message.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              </div>

              <div className="pb-1 sm:px-5 border-t border-[#E2E8F0] hidden sm:block">
                {!interviewComplete && (
                  <ResponseInput
                    onSubmitText={handleUserResponse}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                    isTranscribing={isTranscribing}
                    isRecording={isRecording}
                    isAISpeaking={isAISpeaking}
                    isWaiting={isWaiting}
                    speakTextWithTTS={speakTextWithTTS}
                    isLatestFeedback={
                      conversation.length > 0
                        ? conversation[conversation.length - 1]?.isFeedback ??
                          false
                        : false
                    }
                    textResponse={textResponse}
                    setTextResponse={setTextResponse}
                  />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pb-1 px-3 sm:px-5 absolute bottom-0 left-0 right-0 sm:hidden">
          {!interviewComplete && (
            <ResponseInput
              onSubmitText={handleUserResponse}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              isTranscribing={isTranscribing}
              isRecording={isRecording}
              isAISpeaking={isAISpeaking}
              isWaiting={isWaiting}
              speakTextWithTTS={speakTextWithTTS}
              isLatestFeedback={
                conversation.length > 0
                  ? conversation[conversation.length - 1]?.isFeedback ?? false
                  : false
              }
              textResponse={textResponse}
              setTextResponse={setTextResponse}
            />
          )}
        </div>
      </div>

      <ConfirmDialog openDialogue={openDialog} setOpenDialog={setOpenDialog} />
    </div>
  );
}
