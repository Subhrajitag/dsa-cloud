import React from "react";

interface Props {
  question: string;
  setQuestion: (q: string) => void;
}

export default function QuestionPanel({ question, setQuestion }: Props) {
  return (
    <div className="p-3">
      <div className="text-xs text-gray-400 mb-1">Question for this file</div>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="
      w-full
      bg-[#0f1117]
      border border-gray-600
      rounded
      px-3 py-2
      text-sm
      outline-none
      focus:border-purple-500
    "
      />
    </div>
  );
}
