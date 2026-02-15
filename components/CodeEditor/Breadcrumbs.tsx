import React from "react";
import { FileItem } from "./types";

interface Props {
  files: FileItem[];
  currentFolder: string | null;
  setCurrentFolder: (id: string | null) => void;
}

export default function Breadcrumbs({
  files,
  currentFolder,
  setCurrentFolder,
}: Props) {
  const buildPath = () => {
    const path: FileItem[] = [];
    let cur = currentFolder;

    while (cur) {
      const f: any = files.find((x) => x.id === cur);
      if (!f) break;
      path.unshift(f);
      cur = f.parent_id || null;
    }

    return path;
  };

  const path = buildPath();

  return (
    <div className="px-3 py-2 bg-[#161a23] border-b border-gray-700 text-sm flex gap-2 items-center">
      <span
        className="cursor-pointer text-blue-400"
        onClick={() => setCurrentFolder(null)}
      >
        Root
      </span>

      {path.map((p) => (
        <React.Fragment key={p.id}>
          <span>/</span>
          <span
            className="cursor-pointer text-blue-400"
            onClick={() => setCurrentFolder(p.id)}
          >
            {p.name}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
