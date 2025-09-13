"use client";
import { useFormStore } from "@/lib/store/formStore";
import { useInterviewStore } from "@/lib/store/interviewStore";
import Image from "next/image";

export default function Header() {
  const { formData } = useFormStore();
  const { interviewStarted } = useInterviewStore();

  return (
    <header className="sm:fixed h-fit top-0 left-0 right-0 bg-white shadow-md z-50 border-[#E2E8F0] border-b">
      <div className="w-full xl:w-7xl mx-auto flex flex-row items-center justify-between py-3 px-3 xl:px-0">
        {interviewStarted ? (
          <div className="max-w-[70%] sm:max-w-none">
            <h1 className="text-sm sm:text-2xl font-medium capitalize w-full truncate overflow-hidden whitespace-nowrap">
              {formData.companyName} - {formData.jobRole} Interview
            </h1>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Image
              src="/AI-Interviewer.png"
              alt="AI Interviewer"
              width={56}
              height={56}
              className="rounded-full border-2 border-[#C5DAFF] bg-[#D9D9D9] w-8 sm:w-14"
            />
            <h1 className="text-xl sm:text-2xl font-medium capitalize">
              <span className="text-blue-600">AI </span>Interview Preparation
            </h1>
          </div>
        )}
      </div>
    </header>
  );
}
