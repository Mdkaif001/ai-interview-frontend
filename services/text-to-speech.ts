export interface TTSOptions {
  text: string;
  voice?: string;
  model?: string;
}

export async function generateSpeech(
  { text, voice = "nova", model = "tts-1" }: TTSOptions,
  signal?: AbortSignal
): Promise<ArrayBuffer> {
  const response = await fetch(`/api/text-to-speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      voice,
      model,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`TTS API error: ${response.status}`);
  }

  return await response.arrayBuffer();
}

export function playAudioFromArrayBuffer(
  audioData: ArrayBuffer
): Promise<void> {
  return new Promise((resolve) => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    audioContext.decodeAudioData(audioData, (buffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);

      source.onended = () => {
        resolve();
      };
    });
  });
}
