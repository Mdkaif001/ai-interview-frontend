import { FormState, InterviewSetupData } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const defaultFormData: InterviewSetupData = {
  companyName: "",
  jobRole: "",
  interviewCategory: "",
  domain: "",
  jobDescription: "",
  inputType: "skills-based",
  skills: [],
  interviewType: "",
};

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      formData: defaultFormData,

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      saveFormData: (data: InterviewSetupData) =>
        set(() => ({
          formData: { ...data },
        })),

      resetForm: () =>
        set(() => ({
          formData: defaultFormData,
        })),
    }),
    {
      name: "form-storage",
    }
  )
);
