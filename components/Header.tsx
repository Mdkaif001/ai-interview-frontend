"use client";
import { useFormStore } from "@/lib/store/formStore";
import { useInterviewStore } from "@/lib/store/interviewStore";
import { useEffect, useState } from "react";

export default function Header() {
  const { formData } = useFormStore();
  const { interviewStarted } = useInterviewStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out h-20 bg-transparent cursor-default `}
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-full px-4">
        {interviewStarted ? (
          <h1
            className={`truncate font-thin text-sm sm:text-xl transition-colors duration-300 text-white`}
          >
            {formData.companyName} - {formData.jobRole} Interview
          </h1>
        ) : (
          <h1
            className={`font-thin uppercase text-xl sm:text-2xl transition-colors duration-300 cursor-default`}
          >
            <span className={`transition-colors duration-300 text-white `}>
              HireReady AI
            </span>
          </h1>
        )}
      </div>
    </header>
  );
}
