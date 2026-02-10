"use client"

import { useState } from "react"

export default function NewFileModal({open,onCreate,onClose}:any){

  const [name,setName]=useState("")

  if(!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-150">

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl w-96 shadow-2xl border border-slate-700/50 animate-in zoom-in-95 duration-150">

        <div className="mb-5 flex items-center gap-2">
          <span className="text-2xl">📄</span>
          <h2 className="text-xl font-bold text-slate-100">
            Create New File
          </h2>
        </div>

        <input
          className="w-full px-3 py-2 bg-slate-950 border border-slate-700/50 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-100 placeholder-slate-500 transition-all duration-150"
          placeholder="example.js"
          autoFocus
          onChange={e=>setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onCreate(name);
              setName('');
            }
          }}
        />

        <div className="flex justify-end gap-3 mt-6">

          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-colors duration-150 font-medium"
          >
            Cancel
          </button>

          <button
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
            onClick={()=>{
              onCreate(name)
              setName("")
            }}
          >
            Create File
          </button>

        </div>

      </div>
    </div>
  )
}
