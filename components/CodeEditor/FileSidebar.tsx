import React from "react";
import { FileItem } from "./types";

interface Props {
  files: FileItem[];
  active: FileItem | null;
  onSelect: (f: FileItem) => void;
  onCreate: () => void;
  onCreateFolder: () => void;
  onDelete: (f: FileItem) => void;
  onMove: (fileId: string, parentId: string | null) => void;
  onOpenFolder: (id: string | null) => void;
}

export default function FileSidebar({
  files,
  active,
  onSelect,
  onCreate,
  onCreateFolder,
  onDelete,
  onMove,
  onOpenFolder,
}: Props) {

  const folders = files.filter((f) => f.is_folder);
  
  return (
    <div className="w-64 h-full bg-[#161a23] border-r border-gray-700 flex flex-col">
      
      {/* HEADER */}
      <div className="p-2 border-b flex justify-between">
        <span className="font-semibold">Files</span>

        <div className="flex gap-2">
          <button onClick={onCreate}>📄</button>
          <button onClick={onCreateFolder}>📁</button>
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-auto">

        {/* GO UP */}
        <div
          className="px-3 py-2 text-xs text-gray-400 cursor-pointer hover:bg-[#1d2230]"
          onClick={() => onOpenFolder(null)}
        >
          ⬅ Root
        </div>

        {files.map((f) => (
          <div
            key={f.id}
            className={`px-3 py-2 text-sm flex justify-between items-center cursor-pointer transition ${
              active?.id === f.id
                ? "bg-[#2a2f3a]"
                : "hover:bg-[#1d2230]"
            }`}
            onClick={() =>
              f.is_folder
                ? onOpenFolder(f.id)
                : onSelect(f)
            }
          >
            {/* NAME */}
            <span>
              {f.is_folder ? "📁" : "📄"} {f.name}
            </span>

            {/* ACTIONS */}
            {!f.is_folder && (
              <div className="flex gap-1">

                {/* MOVE */}
                <select
                  onChange={(e) =>
                    onMove(f.id, e.target.value || null)
                  }
                  className="bg-[#0f1117] text-xs"
                >
                  <option value="">Move</option>

                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>

                {/* DELETE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(f);
                  }}
                >
                  🗑
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
