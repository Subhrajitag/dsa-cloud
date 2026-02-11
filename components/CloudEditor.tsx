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
  const [question, setQuestion] = useState("");

  const unsaved =
    active &&
    (active.code !== original || question !== (active.question || ""));

  /* ---------- Load Files ---------- */
  async function loadFiles() {
    const { data } = await supabase.from("files").select("*");
    setFiles(data?.reverse() || []);

    if (data?.length && !active) {
      setActive(data[0]);
      setOriginal(data[0].code);
      setQuestion(data[0].question || "");
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  /* ---------- Create File ---------- */
  async function createFile() {
    if (!newName.trim()) return;

    // Check if file with same name already exists
    const duplicateFile = files.find(
      (f) => f.name.toLowerCase() === newName.trim().toLowerCase(),
    );
    if (duplicateFile) {
      alert(`File "${newName}" already exists!`);
      return;
    }

    const { data } = await supabase
      .from("files")
      .insert({
        name: newName,
        code: "// new file",
        question: "",
      })
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
      .update({
        code: active.code,
        question: question,
      })
      .eq("id", active.id);

    setOriginal(active.code);
    setActive({
      ...active,
      question: question,
    });
    setSaving(false);
  }

  /* ---------- Rename ---------- */
  async function renameFile(file: any) {
    const name = prompt("Rename file", file.name);
    if (!name) return;

    // Check if file with same name already exists (excluding current file)
    const duplicateFile = files.find(
      (f) =>
        f.id !== file.id && f.name.toLowerCase() === name.trim().toLowerCase(),
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

    if (active?.id === file.id) {
      setActive(null);
      setQuestion("");
    }

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
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-950 p-4 border-r border-slate-700/50 flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700/30">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Files
          </span>

          <button
            className="text-sm font-semibold px-2 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 hover:cursor-pointer"
            onClick={() => setCreating(true)}
          >
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
            className="w-full mb-3 p-2 bg-slate-800 border border-blue-500/40 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all duration-150"
            placeholder="filename.js"
          />
        )}

        {/* File List */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {files.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No files yet. Create one to get started!
            </div>
          ) : (
            files.map((f) => (
              <div
                key={f.id}
                onClick={() => {
                  setActive(f);
                  setOriginal(f.code);
                  setQuestion(f.question || "");
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContext({ x: e.clientX, y: e.clientY, file: f });
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 group
                  ${
                    active?.id === f.id
                      ? "bg-blue-600/30 border border-blue-500/50 text-blue-100 shadow-lg shadow-blue-500/10"
                      : "hover:bg-slate-800/60 text-slate-300 hover:text-slate-100"
                  }`}
                title="Right-click for options"
              >
                <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">
                  {getIcon(f.name)}
                </span>
                <span className="flex-1 truncate text-sm font-medium">
                  {f.name}
                </span>
                {active?.id === f.id && (
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        {/* Top Bar */}
        <div className="flex flex-col gap-3 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-3 border-b border-slate-700/50 shadow-md">
          {/* Row 1 — File + Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-lg text-slate-100">
                {active?.name || "No File Selected"}
              </span>

              {unsaved && (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-medium">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                  Unsaved
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 active:scale-95 hover:cursor-pointer"
                onClick={save}
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </button>

              <button
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30 active:scale-95 hover:cursor-pointer"
                onClick={runCode}
              >
                ▶ Run
              </button>
            </div>
          </div>

          {/* Row 2 — Question Section */}
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none"
            rows={2}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 bg-slate-950">
          <Editor
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={active?.code || ""}
            onChange={(v) => setActive({ ...active, code: v })}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Console */}
        <div className="bg-slate-950 border-t border-slate-700/50 p-4 h-40 overflow-auto font-mono text-sm flex flex-col">
          <div className="text-slate-500 text-xs mb-2 uppercase tracking-wider font-semibold">
            Output
          </div>
          <div
            className={`flex-1 font-mono text-sm ${
              output.includes("Error") || output.includes("error")
                ? "text-red-400"
                : output
                  ? "text-green-400"
                  : "text-slate-500"
            }`}
          >
            {output || (
              <span className="text-slate-600">
                Run your code to see output...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {context && (
        <div
          style={{ top: context.y, left: context.x }}
          className="fixed bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl rounded-lg overflow-hidden border border-slate-700/50 z-50 animate-in fade-in zoom-in-95 duration-100"
          onMouseLeave={() => setContext(null)}
        >
          <div
            className="px-3 py-2 hover:bg-blue-600/30 cursor-pointer transition-colors duration-150 text-sm font-medium"
            onClick={() => {
              renameFile(context.file);
              setContext(null);
            }}
          >
            ✏️ Rename
          </div>

          <div className="border-t border-slate-700/30"></div>

          <div
            className="px-3 py-2 hover:bg-red-600/30 cursor-pointer transition-colors duration-150 text-sm font-medium text-red-400"
            onClick={() => {
              deleteFile(context.file);
              setContext(null);
            }}
          >
            🗑️ Delete
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
