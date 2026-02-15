import React from "react";
import { FileItem } from "./types";

interface Props {
  active: FileItem | null;
  code: string;
  setCode: (c: string) => void;
}

export default function EditorPanel({ active, code, setCode }: Props) {
  if (!active)
    return (
      <div className="flex-1 flex items-center justify-center">No file</div>
    );

  return (
    <textarea
      className="
      w-full
      h-full
      resize-none
      bg-[#0f1117]
      text-gray-200
      font-mono
      text-sm
      p-4
      outline-none
    "
      value={code}
      onChange={(e) => setCode(e.target.value)}
    />
  );
}
