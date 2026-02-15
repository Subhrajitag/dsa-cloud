import React from "react";

type Props = {
  dirty: boolean
  saving: boolean
  onSave: () => void
  onRun: () => void
}

export default function SaveBar({
  dirty,
  saving,
  onSave,
  onRun,
}: Props) {

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-gray-700">

      {/* LEFT */}
      <div className="text-sm text-gray-400">
        {dirty && "Unsaved changes"}
      </div>

      {/* RIGHT */}
      <div className="flex gap-2">

        <button
          onClick={onRun}
          className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500"
        >
          ▶ Run
        </button>

        <button
          onClick={onSave}
          disabled={!dirty || saving}
          className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save"}
        </button>

      </div>
    </div>
  );
}

