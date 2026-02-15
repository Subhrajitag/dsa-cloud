"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { supabase } from "../lib/supabase";
import { SiJavascript, SiTypescript } from "react-icons/si";
import { FaFile } from "react-icons/fa";
import CommandBar from "./CommandBar";

/* ---------- Icon ---------- */
function getIcon(name: string) {
  const ext = name.split(".").pop();
  if (ext === "js") return <SiJavascript color="#f7df1e" />;
  if (ext === "ts") return <SiTypescript color="#3178c6" />;
  return <FaFile />;
}

export default function CloudEditor() {
  const [files, setFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [original, setOriginal] = useState("");
  const [output, setOutput] = useState("");

  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);

  const [newName, setNewName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const [context, setContext] = useState<any>(null);
  const [question, setQuestion] = useState("");

  const unsaved =
    active &&
    (active.code !== original || question !== (active.question || ""));

  /* ---------------- LOAD ---------------- */

  async function loadAll() {
    const { data: f1 } = await supabase.from("files").select("*");
    const { data: f2 } = await supabase.from("folders").select("*");

    setFiles(f1 || []);
    setFolders(f2 || []);

    if (f1?.length && !active) {
      setActive(f1[0]);
      setOriginal(f1[0].code);
      setQuestion(f1[0].question || "");
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  /* ---------------- CREATE FILE ---------------- */

  async function createFile() {
    if (!newName.trim()) return;

    await supabase.from("files").insert({
      name: newName,
      code: "// new file",
      question: "",
      folder_id: selectedFolder,
    });

    setCreating(false);
    setNewName("");
    loadAll();
  }

  /* ---------------- CREATE FOLDER ---------------- */

  async function createFolder() {
    if (!newName.trim()) return;

    await supabase.from("folders").insert({
      name: newName,
      parent_id: selectedFolder,
    });

    setCreatingFolder(false);
    setNewName("");
    loadAll();
  }

  /* ---------------- SAVE ---------------- */

  async function save() {
    if (!active) return;

    setSaving(true);

    await supabase
      .from("files")
      .update({ code: active.code, question })
      .eq("id", active.id);

    setOriginal(active.code);
    setActive({ ...active, question });
    setSaving(false);
  }

  /* ---------------- DELETE ---------------- */

  async function deleteFile(file: any) {
    if (!confirm("Delete file?")) return;

    await supabase.from("files").delete().eq("id", file.id);

    if (active?.id === file.id) {
      setActive(null);
      setQuestion("");
    }

    loadAll();
  }

  /* ---------------- RUN ---------------- */

  function runCode() {
    try {
      const logs: any[] = [];
      const orig = console.log;
      console.log = (...a) => logs.push(a.join(" "));
      eval(active.code);
      console.log = orig;
      setOutput(logs.join("\n"));
    } catch (e: any) {
      setOutput(e.toString());
    }
  }

  /* ---------------- TREE BUILD ---------------- */

  function buildTree() {
    const map: any = {};
    const roots: any[] = [];

    folders.forEach((f) => (map[f.id] = { ...f, children: [], files: [] }));

    folders.forEach((f) => {
      if (f.parent_id) map[f.parent_id]?.children.push(map[f.id]);
      else roots.push(map[f.id]);
    });

    files.forEach((file) => {
      if (file.folder_id && map[file.folder_id])
        map[file.folder_id].files.push(file);
      else roots.push(file);
    });

    return roots;
  }

  function renderNode(node: any, depth = 0) {
    const pad = { paddingLeft: depth * 14 };

    /* FILE */
    if (node.code !== undefined)
      return (
        <div
          key={node.id}
          style={pad}
          onClick={() => {
            setActive(node);
            setOriginal(node.code);
            setQuestion(node.question || "");
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContext({ x: e.clientX, y: e.clientY, file: node });
          }}
          className={`flex items-center gap-2 py-1 cursor-pointer
          ${active?.id === node.id && "bg-blue-600/30"}
          hover:bg-slate-800`}
        >
          {getIcon(node.name)}
          {node.name}
        </div>
      );

    /* FOLDER */
    return (
      <div key={node.id}>
        <div
          style={pad}
          onClick={() => setSelectedFolder(node.id)}
          className="font-semibold text-slate-300 cursor-pointer hover:text-white"
        >
          📁 {node.name}
        </div>

        {node.children.map((c: any) => renderNode(c, depth + 1))}
        {node.files.map((f: any) => renderNode(f, depth + 1))}
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="flex h-screen bg-slate-950 text-white">

      {/* SIDEBAR */}
      <div className="w-64 p-3 border-r border-slate-700 flex flex-col">

        <div className="flex gap-2 mb-2">
          <button
            onClick={() => {
              setCreating(true);
              setCreatingFolder(false);
            }}
            className="text-xs text-blue-400"
          >
            + File
          </button>

          <button
            onClick={() => {
              setCreatingFolder(true);
              setCreating(false);
            }}
            className="text-xs text-yellow-400"
          >
            + Folder
          </button>
        </div>

        {(creating || creatingFolder) && (
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                creating ? createFile() : createFolder();
            }}
            className="mb-2 p-2 bg-slate-800 rounded"
            placeholder={creating ? "file.js" : "folder"}
          />
        )}

        <div className="flex-1 overflow-y-auto">
          {buildTree().map((n) => renderNode(n))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">

        {/* TOP */}
        <div className="p-3 border-b border-slate-700 flex flex-col gap-2">
          <div className="flex justify-between">

            <span>{active?.name}</span>

            <div className="flex gap-2">
              <button onClick={save}>
                {saving ? "Saving..." : "Save"}
              </button>

              <button onClick={runCode}>Run</button>
            </div>
          </div>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="bg-slate-800 p-2 rounded"
            placeholder="Question for this file"
          />
        </div>

        {/* EDITOR */}
        <div className="flex-1">
          <Editor
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={active?.code || ""}
            onChange={(v) => setActive({ ...active, code: v })}
          />
        </div>

        {/* OUTPUT */}
        <div className="h-32 border-t border-slate-700 p-2 text-sm">
          {output}
        </div>
      </div>

      {/* CONTEXT */}
      {context && (
        <div
          style={{ top: context.y, left: context.x }}
          className="fixed bg-slate-800 p-2"
          onMouseLeave={() => setContext(null)}
        >
          <div onClick={() => deleteFile(context.file)}>Delete</div>
        </div>
      )}

      <CommandBar
        files={files}
        onSelect={(f: any) => {
          setActive(f);
          setOriginal(f.code);
          setQuestion(f.question || "");
        }}
      />
    </div>
  );
}
