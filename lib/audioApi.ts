import { useInterviewStore } from "./store/interviewStore";
import { generateSpeech } from "@/services/text-to-speech";

export const speakTextWithTTS = async (text: string) => {
  const store = useInterviewStore.getState();
  store.setIsAISpeaking(true);

  if (store.ttsAbortController) {
    store.ttsAbortController.abort();
  }

  const controller = new AbortController();
  store.setTTSAbortController(controller);

  try {
    const audioData = await generateSpeech({ text }, controller.signal);

    if (controller.signal.aborted) return;

    const audio = new Audio(URL.createObjectURL(new Blob([audioData])));
    store.setAudioInstance(audio);

    audio.onended = () => {
      store.setIsAISpeaking(false);
      store.setAudioInstance(null);
      store.setTTSAbortController(null);
    };

    audio.play();
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      console.log("TTS fetch aborted");
    } else {
      console.error("Error with TTS:", error);
      speakTextWithBrowser(text);
    }
    store.setIsAISpeaking(false);
    store.setTTSAbortController(null);
  }
};

const speakTextWithBrowser = (text: string) => {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    useInterviewStore.getState().setIsAISpeaking(true);
    useInterviewStore.getState().setBrowserUtterance(utterance);

    utterance.onend = () => {
      useInterviewStore.getState().setIsAISpeaking(false);
      useInterviewStore.getState().setBrowserUtterance(null);
    };

    speechSynthesis.speak(utterance);
  }
};
