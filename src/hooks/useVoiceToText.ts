import { useState, useEffect, useRef, useCallback } from "react";

interface UseVoiceToTextOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useVoiceToText(options: UseVoiceToTextOptions = {}) {
  const {
    continuous = false,
    interimResults = true,
    lang = typeof navigator !== "undefined" ? navigator.language || "en-US" : "en-US",
    onTranscript,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const callbackRef = useRef(onTranscript);
  callbackRef.current = onTranscript;
  const errorCallbackRef = useRef(onError);
  errorCallbackRef.current = onError;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        (window as any).mozSpeechRecognition ||
        (window as any).msSpeechRecognition;

      setIsSupported(Boolean(SpeechRecognition));
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const startListening = useCallback(
    (customOnTranscript?: (text: string, isFinal: boolean) => void) => {
      setError(null);

      if (typeof window === "undefined") {
        setError("Browser environment required for Speech Recognition.");
        return;
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        (window as any).mozSpeechRecognition ||
        (window as any).msSpeechRecognition;

      if (!SpeechRecognition) {
        const msg = "Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.";
        setError(msg);
        if (errorCallbackRef.current) errorCallbackRef.current(msg);
        return;
      }

      // Stop any existing instance
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = lang;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: any) => {
          let currentFinal = "";
          let currentInterim = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptPiece = event.results[i][0]?.transcript || "";
            if (event.results[i].isFinal) {
              currentFinal += transcriptPiece;
            } else {
              currentInterim += transcriptPiece;
            }
          }

          if (currentFinal) {
            setTranscript((prev) => (prev ? `${prev} ${currentFinal}` : currentFinal));
            if (customOnTranscript) {
              customOnTranscript(currentFinal.trim(), true);
            } else if (callbackRef.current) {
              callbackRef.current(currentFinal.trim(), true);
            }
          }

          setInterimTranscript(currentInterim);
          if (currentInterim && (customOnTranscript || callbackRef.current)) {
            const cb = customOnTranscript || callbackRef.current;
            cb?.(currentInterim.trim(), false);
          }
        };

        recognition.onerror = (event: any) => {
          let errorMsg = "Voice recognition error occurred.";
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            errorMsg = "Microphone permission was denied. Please allow microphone access in your browser.";
          } else if (event.error === "no-speech") {
            errorMsg = "No speech detected. Please speak closer to your microphone.";
          } else if (event.error === "audio-capture") {
            errorMsg = "No microphone was found on this device.";
          } else if (event.error === "network") {
            errorMsg = "Network error during speech recognition.";
          }
          setError(errorMsg);
          setIsListening(false);
          if (errorCallbackRef.current) {
            errorCallbackRef.current(errorMsg);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript("");
          recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        console.error("SpeechRecognition error:", err);
        const errMsg = err?.message || "Failed to initialize microphone.";
        setError(errMsg);
        setIsListening(false);
        if (errorCallbackRef.current) {
          errorCallbackRef.current(errMsg);
        }
      }
    },
    [continuous, interimResults, lang]
  );

  const toggleListening = useCallback(
    (customOnTranscript?: (text: string, isFinal: boolean) => void) => {
      if (isListening) {
        stopListening();
      } else {
        startListening(customOnTranscript);
      }
    },
    [isListening, startListening, stopListening]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript: () => {
      setTranscript("");
      setInterimTranscript("");
    },
  };
}
