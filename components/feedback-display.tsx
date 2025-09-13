import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import { useInterviewStore } from "@/lib/store/interviewStore";

export function FeedbackDisplay({
  feedback,
  isLastMessage,
}: {
  feedback: string;
  isLastMessage: boolean;
}) {
  const { stopSpeaking, isAISpeaking, audioInstance } = useInterviewStore();
  return (
    <div className=" w-fit max-w-[90%]">
      <div className="flex items-center gap-2 mb-1">
        <div className="sm:w-8 sm:h-8 w-6 h-6 flex items-center justify-center bg-[#FEFBED] rounded-sm">
          <Image
            src="/assets/images/bulb.png"
            alt="bulb"
            width={24}
            height={24}
            className="sm:w-6 sm:h-6 w-4 h-4"
          />
        </div>
        <p className="text-sm sm:text-base font-semibold">Immediate Feedback</p>

        {isLastMessage && isAISpeaking && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 py-1 h-fit text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition cursor-pointer"
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
                <div className="absolute w-4 h-4 sm:w-6 sm:h-6 bg-[#3B64F6] opacity-50 rounded-full animate-ping" />
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
      <div
        className={`px-3 py-2 sm:p-6  border-l-4 border-[#FFC342] rounded-2xl text-sm  leading-relaxed bg-[#FFF5EA]`}
      >
        <ReactMarkdown>{feedback}</ReactMarkdown>
      </div>
    </div>
  );
}
