"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { supabase } from "../lib/supabase";
import { SiJavascript, SiTypescript } from "react-icons/si";
import { FaFile } from "react-icons/fa";
import CommandBar from "./CommandBar";

/* ---------- File Icon Helper ---------- */
function getIcon(name: string) {
  const ext = name.split(".").pop();

  switch (ext) {
    case "js":
      return <SiJavascript color="#f7df1e" />;
    case "ts":
      return <SiTypescript color="#3178c6" />;
    default:
      return <FaFile />;
  }
}

export default function CloudEditor() {
  const [files, setFiles] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [original, setOriginal] = useState("");
  const [output, setOutput] = useState("");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [context, setContext] = useState<any>(null);

  const unsaved = active && active.code !== original;

  /* ---------- Load Files ---------- */
  async function loadFiles() {
    const { data } = await supabase.from("files").select("*");
    setFiles(data?.reverse() || []);

    if (data?.length && !active) {
      setActive(data[0]);
      setOriginal(data[0].code);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  /* ---------- Create File ---------- */
  async function createFile() {
    if (!newName.trim()) return;

    // Check if file with same name already exists
    const duplicateFile = files.find(f => f.name.toLowerCase() === newName.trim().toLowerCase());
    if (duplicateFile) {
      alert(`File "${newName}" already exists!`);
      return;
    }

    const { data } = await supabase
      .from("files")
      .insert({ name: newName, code: "// new file" })
      .select();

    const created = data?.[0];

    setCreating(false);
    setNewName("");

    await loadFiles();

    if (created) {
      setActive(created);
      setOriginal(created.code);
    }
  }

  /* ---------- Save ---------- */
  async function save() {
    if (!active) return;

    setSaving(true);

    await supabase
      .from("files")
      .update({ code: active.code })
      .eq("id", active.id);

    setOriginal(active.code);
    setSaving(false);
  }

  /* ---------- Rename ---------- */
  async function renameFile(file: any) {
    const name = prompt("Rename file", file.name);
    if (!name) return;

    // Check if file with same name already exists (excluding current file)
    const duplicateFile = files.find(f => 
      f.id !== file.id && f.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicateFile) {
      alert(`File "${name}" already exists!`);
      return;
    }

    await supabase.from("files").update({ name }).eq("id", file.id);
    loadFiles();
  }

  /* ---------- Delete ---------- */
  async function deleteFile(file: any) {
    if (!confirm("Delete file?")) return;

    await supabase.from("files").delete().eq("id", file.id);

    if (active?.id === file.id) setActive(null);

    loadFiles();
  }

  /* ---------- Ctrl+S ---------- */
  useEffect(() => {
    const handler = (e: any) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        save();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  /* ---------- Run JS ---------- */
  function runCode() {
    try {
      const logs: any[] = [];
      const originalLog = console.log;

      console.log = (...args) => logs.push(args.join(" "));
      eval(active.code);
      console.log = originalLog;

      setOutput(logs.join("\n"));
    } catch (e: any) {
      setOutput(e.toString());
    }
  }

  /* ---------- UI ---------- */
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <div className="w-56 bg-gray-900 p-3 border-r border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">Files</span>

          <button className="text-sm" onClick={() => setCreating(true)}>
            + Add
          </button>
        </div>

        {/* Inline Create Input */}
        {creating && (
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") createFile();
              if (e.key === "Escape") setCreating(false);
            }}
            className="w-full mb-2 p-1 bg-gray-800 outline-none"
            placeholder="filename.js"
          />
        )}

        {/* File List */}
        {files.map((f) => (
          <div
            key={f.id}
            onClick={() => {
              setActive(f);
              setOriginal(f.code);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setContext({ x: e.clientX, y: e.clientY, file: f });
            }}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer
              ${active?.id === f.id ? "bg-gray-700" : "hover:bg-gray-800"}`}
          >
            {getIcon(f.name)}
            {f.name}.js
          </div>
        ))}
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex justify-between items-center bg-gray-900 px-4 py-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{active?.name || "No File"}</span>

            {unsaved && <span className="text-yellow-400">● Unsaved</span>}
          </div>

          <div className="flex gap-3">
            <button className="bg-green-600 px-3 py-1 rounded" onClick={save}>
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              className="bg-purple-600 px-3 py-1 rounded"
              onClick={runCode}
            >
              Run
            </button>
          </div>
        </div>

        {/* Editor */}
        <Editor
          height="65%"
          language="javascript"
          theme="vs-dark"
          value={active?.code || ""}
          onChange={(v) => setActive({ ...active, code: v })}
        />

        {/* Console */}
        <div className="bg-black text-green-400 p-3 h-40 overflow-auto font-mono">
          {output}
        </div>
      </div>

      {/* Context Menu */}
      {context && (
        <div
          style={{ top: context.y, left: context.x }}
          className="fixed bg-gray-800 shadow-lg rounded text-sm"
          onMouseLeave={() => setContext(null)}
        >
          <div
            className="p-2 hover:bg-gray-700 cursor-pointer"
            onClick={() => {
              renameFile(context.file);
              setContext(null);
            }}
          >
            Rename
          </div>

          <div
            className="p-2 hover:bg-red-600 cursor-pointer"
            onClick={() => {
              deleteFile(context.file);
              setContext(null);
            }}
          >
            Delete
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandBar
        files={files}
        onSelect={(f: any) => {
          setActive(f);
          setOriginal(f.code);
        }}
      />
    </div>
  );
}
