import React, { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import VoiceInputButton from "./VoiceInputButton";

interface KeywordSearchInputProps {
  placeholder?: string;
  initialValue?: string;
  onSearchChange: (value: string) => void;
  className?: string;
  id?: string;
}

export const KeywordSearchInput = React.memo(function KeywordSearchInput({
  placeholder = "Search matching lawn, gutters, TVs, glazing...",
  initialValue = "",
  onSearchChange,
  className = "",
  id = "keyword-forum-filter-input",
}: KeywordSearchInputProps) {
  const [value, setValue] = useState(initialValue);

  // Sync if initialValue is cleared from outside (e.g. Reset Filters button)
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Debounced notification to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value, onSearchChange]);

  const handleVoiceTranscript = useCallback((spokenText: string, isFinal: boolean) => {
    if (!spokenText.trim()) return;
    setValue((prev) => {
      // If previous value already ends with spoken text, don't duplicate
      if (prev.endsWith(spokenText)) return prev;
      return prev ? `${prev} ${spokenText}` : spokenText;
    });
  }, []);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full bg-zinc-50 hover:bg-white focus:bg-white border border-zinc-200 hover:border-zinc-300 focus:border-amber-500 rounded-xl pl-9 pr-16 py-2 text-xs text-zinc-900 focus:outline-hidden transition shadow-2xs placeholder:text-zinc-400"
      />
      <div className="absolute right-2 top-1.5 flex items-center gap-1">
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded text-xs cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <VoiceInputButton
          onTranscript={handleVoiceTranscript}
          size="xs"
          title="Click to speak (Voice Search)"
        />
      </div>
    </div>
  );
});

export default KeywordSearchInput;

