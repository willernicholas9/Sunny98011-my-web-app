import React, { useState } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { useVoiceToText } from "../hooks/useVoiceToText";

interface VoiceInputButtonProps {
  onTranscript: (spokenText: string, isFinal: boolean) => void;
  className?: string;
  size?: "xs" | "sm" | "md";
  title?: string;
  variant?: "ghost" | "pill" | "icon";
  continuous?: boolean;
}

export const VoiceInputButton = React.memo(function VoiceInputButton({
  onTranscript,
  className = "",
  size = "sm",
  title = "Voice-to-text (Web Speech API)",
  variant = "ghost",
  continuous = false,
}: VoiceInputButtonProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { isSupported, isListening, toggleListening, stopListening, error } = useVoiceToText({
    continuous,
    interimResults: true,
    onTranscript: (text, isFinal) => {
      onTranscript(text, isFinal);
    },
    onError: (err) => {
      setToastMessage(err);
      setTimeout(() => setToastMessage(null), 4000);
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSupported) {
      setToastMessage("Voice recognition is supported in Chrome, Edge, and Safari.");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    toggleListening((text, isFinal) => {
      onTranscript(text, isFinal);
    });
  };

  const sizeClasses = {
    xs: "p-1 text-xs",
    sm: "p-1.5 text-xs",
    md: "p-2 text-sm",
  }[size];

  const iconSizes = {
    xs: "w-3.5 h-3.5",
    sm: "w-4 h-4",
    md: "w-4 h-4",
  }[size];

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleClick}
        className={`group relative flex items-center justify-center rounded-xl transition duration-150 cursor-pointer select-none ${sizeClasses} ${
          isListening
            ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-400 ring-offset-1 ring-offset-white animate-pulse"
            : variant === "pill"
            ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 border border-zinc-200"
            : "text-zinc-400 hover:text-amber-600 hover:bg-amber-50"
        } ${className}`}
        title={
          isListening
            ? "Listening... Speak now. Click to stop."
            : isSupported
            ? title
            : "Voice recognition available in Chrome/Safari/Edge"
        }
        aria-label={isListening ? "Stop voice dictation" : "Start voice dictation"}
      >
        {isListening ? (
          <>
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            <Mic className={`${iconSizes} animate-bounce`} />
          </>
        ) : (
          <Mic className={`${iconSizes} transition-transform group-hover:scale-110`} />
        )}
      </button>

      {/* Ephemeral Feedback Toast */}
      {toastMessage && (
        <div
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap bg-zinc-900 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xl border border-zinc-700 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
          role="status"
        >
          <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
});

export default VoiceInputButton;
