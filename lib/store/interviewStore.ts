import { create } from "zustand";
import { persist } from "zustand/middleware";
import { InterviewStoreState } from "@/types";

const initialState = {
  conversation: [],
  overallFeedback: {
    overall_score: 0,
    response_depth: "",
    summary: "",
    questions_analysis: [],
    coaching_scores: {
      clarity_of_motivation: 0,
      specificity_of_learning: 0,
      career_goal_alignment: 0,
    },
    recommendations: [],
    closure_message: "",
    level: "",
  },
  interviewComplete: false,
  interviewStarted: false,
  questionCount: 0,
  maxQuestions: 5,
  interviewStartTime: null,
  isAISpeaking: false,
  audioInstance: null,
  browserUtterance: null,
  ttsAbortController: null as AbortController | null,
};

export const useInterviewStore = create<InterviewStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addMessage: (message) =>
        set((state) => ({
          conversation: [...state.conversation, message],
        })),

      resetConversation: () =>
        set(() => ({
          conversation: [],
        })),

      setOverallFeedback: (feedback) => set({ overallFeedback: feedback }),

      setInterviewComplete: (complete) => set({ interviewComplete: complete }),

      incrementQuestionCount: () =>
        set((state) => ({
          questionCount: state.questionCount + 1,
        })),

      resetQuestionCount: () =>
        set(() => ({
          questionCount: 0,
        })),

      setInterviewStarted: (started: boolean) =>
        set({ interviewStarted: started }),

      setInterviewStartTime: (time) => set({ interviewStartTime: time }),

      setIsAISpeaking: (value: boolean) => set({ isAISpeaking: value }),

      setAudioInstance: (audio) => set({ audioInstance: audio }),

      setBrowserUtterance: (utterance) => set({ browserUtterance: utterance }),

      setTTSAbortController: (controller: AbortController | null) =>
        set({ ttsAbortController: controller }),

      abortTTS: () => {
        const { ttsAbortController } = get();
        if (ttsAbortController) {
          ttsAbortController.abort();
          set({ ttsAbortController: null });
        }
      },

      stopSpeaking: () => {
        const { audioInstance, browserUtterance, ttsAbortController } = get();

        if (ttsAbortController instanceof AbortController) {
          ttsAbortController.abort();
          set({ ttsAbortController: null });
        } else {
          set({ ttsAbortController: null });
        }

        if (audioInstance instanceof HTMLAudioElement) {
          audioInstance.pause();
          audioInstance.currentTime = 0;
          set({ audioInstance: null });
        } else {
          set({ audioInstance: null });
        }

        if (browserUtterance) {
          speechSynthesis.cancel();
          set({ browserUtterance: null });
        }

        set({ isAISpeaking: false });
      },

      resetStore: () => {
        set({ ...initialState });
      },
    }),
    {
      name: "interview-storage",
    }
  )
);
