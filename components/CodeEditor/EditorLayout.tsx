"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import FileSidebar from "./FileSidebar";
import EditorPanel from "./EditorPanel";
import QuestionPanel from "./QuestionPanel";
import SaveBar from "./SaveBar";
import { FileItem, FolderItem } from "./types";
import Breadcrumbs from "./Breadcrumbs";

export default function EditorLayout() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [active, setActive] = useState<FileItem | null>(null);
  const [output, setOutput] = useState("");

  const [code, setCode] = useState("");
  const [question, setQuestion] = useState("");

  const [original, setOriginal] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const dirty =
    active &&
    (code !== original ||
      (question?.trim() || "") !== (active.question?.trim() || ""));

  // Load files
  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [code]);

  async function loadFiles() {
    const { data: f } = await supabase.from("files").select("*");

    setFiles(f || []);
  }

  function selectFile(f: FileItem) {
    setActive(f);
    setCode(f.code);
    setOriginal(f.code);
    setQuestion(f.question || "");
  }

  async function createFile() {
    const name = prompt("File name?");
    if (!name) return;

    const { data } = await supabase
      .from("files")
      .insert({
        name,
        code: "// new file",
        question: "",
        parent_id: currentFolder,
        is_folder: false,
      })
      .select()
      .single();

    if (data) {
      setFiles((prev) => [...prev, data]);
    }
  }

  async function createFolder() {
    const name = prompt("Folder name?");
    if (!name) return;

    const { data } = await supabase
      .from("files")
      .insert({
        name,
        is_folder: true,
        parent_id: currentFolder,
      })
      .select()
      .single();

    if (data) {
      setFiles((prev) => [...prev, data]);
    }
  }

  async function deleteFile(file: FileItem) {
    const ok = window.confirm(`Delete "${file.name}"?`);

    if (!ok) return;

    await supabase.from("files").delete().eq("id", file.id);

    setFiles(files.filter((f) => f.id !== file.id));

    if (active?.id === file.id) {
      setActive(null);
      setCode("");
      setQuestion("");
    }
  }

  async function save() {
    if (!active) return;

    setSaving(true);

    const payload: any = {
      code,
    };

    // Only include question if user typed something
    if (question?.trim()) {
      payload.question = question.trim();
    }

    await supabase.from("files").update(payload).eq("id", active.id);

    setOriginal(code);

    setActive({
      ...active,
      code,
      question: payload.question ?? active.question,
    });

    setSaving(false);
  }

  function runCode() {
    if (!code) return;

    try {
      const logs: string[] = [];
      const originalLog = console.log;

      console.log = (...args) => {
        logs.push(args.join(" "));
      };

      eval(code);

      console.log = originalLog;
      setOutput(logs.join("\n"));
    } catch (e: any) {
      setOutput(e.toString());
    }
  }

  async function moveFile(fileId: string, parentId: string | null) {
    await supabase.from("files").update({ parent_id: parentId }).eq("id", fileId);

    setFiles((f) =>
      f.map((x) => (x?.id === fileId ? { ...x, parent_id: parentId } : x)),
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0f1117] text-white flex overflow-hidden">
      {/* Sidebar */}
      <div className="h-full shrink-0">
        <FileSidebar
          files={files.filter(
            (f: any): f is FileItem =>
              !!f && (f.parent_id ?? null) === currentFolder,
          )}
          active={active}
          onSelect={selectFile}
          onCreate={createFile}
          onCreateFolder={createFolder}
          onDelete={deleteFile}
          onMove={moveFile}
          onOpenFolder={(id) => setCurrentFolder(id)}
        />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-full">
        <div className="bg-[#161a23] border-t border-gray-700">
          <Breadcrumbs
            files={files}
            currentFolder={currentFolder}
            setCurrentFolder={setCurrentFolder}
          />

          <QuestionPanel question={question} setQuestion={setQuestion} />

          <SaveBar
            dirty={!!dirty}
            saving={saving}
            onSave={save}
            onRun={runCode}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <EditorPanel active={active} code={code} setCode={setCode} />
          </div>

          <div className="h-32 bg-black border-t border-gray-800 p-3 text-sm font-mono overflow-auto">
            {output || (
              <span className="text-gray-500">Run code to see output...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
