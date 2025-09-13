"use client";

import { useRef } from "react";
import { toast } from "sonner";

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  isRecording: boolean;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
}

export function AudioRecorder({
  onTranscription,
  isRecording,
  onRecordingStart,
  onRecordingStop,
}: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const silent = await isMostlySilent(audioBlob);
        if (silent) {
          console.warn("Skipped transcription: mostly silent audio");
          onTranscription("");
          toast("⚠️ Silence Detected", {
            description: (
              <p className="text-yellow-900 font-semibold text-xs">
                Skipped transcription: mostly silent audio.
              </p>
            ),
            className: "bg-yellow-50 border border-yellow-400 text-yellow-900",
          });
          return;
        }

        await sendAudioForTranscription(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      onRecordingStart();
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      onRecordingStop();
    }
  };

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.transcript) {
        onTranscription(data.transcript);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }
  };

  return { startRecording, stopRecording };
}

const isMostlySilent = async (blob: Blob): Promise<boolean> => {
  const audioContext = new AudioContext();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const rawData = audioBuffer.getChannelData(0);
  const samples = 1000;
  const blockSize = Math.floor(rawData.length / samples);
  let sum = 0;

  for (let i = 0; i < samples; i++) {
    const blockStart = blockSize * i;
    let blockSum = 0;
    for (let j = 0; j < blockSize; j++) {
      blockSum += Math.abs(rawData[blockStart + j]);
    }
    sum += blockSum / blockSize;
  }

  const averageVolume = sum / samples;

  return averageVolume < 0.01;
};
