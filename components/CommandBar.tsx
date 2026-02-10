"use client"

import { useEffect, useState } from "react"

export default function CommandBar({files,onSelect}:any){

  const [open,setOpen] = useState(false)
  const [query,setQuery] = useState("")

  useEffect(()=>{

    const handler=(e:any)=>{
      if((e.ctrlKey || e.metaKey) && e.key==="p"){
        e.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener("keydown",handler)
    return ()=>window.removeEventListener("keydown",handler)

  },[])

  if(!open) return null

  const filtered = files.filter((f:any)=>
    f.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center pt-32 z-50 animate-in fade-in duration-150">

      <div className="bg-gradient-to-b from-slate-800 to-slate-900 w-96 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden animate-in zoom-in-95 duration-150">

        <div className="p-4 border-b border-slate-700/30 bg-gradient-to-r from-slate-800 to-slate-800/50">
          <input
            autoFocus
            className="w-full px-3 py-2 bg-slate-950 border border-slate-700/50 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-slate-100 placeholder-slate-500 transition-all duration-150"
            placeholder="🔍 Search files (Ctrl+P to close)..."
            onChange={e=>setQuery(e.target.value)}
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No files found
            </div>
          ) : (
            filtered.map((f:any, idx:any)=>(
              <div
                key={f.id}
                onClick={()=>{
                  onSelect(f)
                  setOpen(false)
                }}
                className="px-4 py-3 hover:bg-blue-600/20 cursor-pointer transition-colors duration-100 border-b border-slate-700/20 last:border-b-0 hover:border-blue-500/30 flex items-center gap-3"
              >
                <span className="text-slate-500 text-xs font-medium opacity-50">file</span>
                <span className="flex-1 text-slate-200 font-medium">{f.name}</span>
                {idx === 0 && <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded">Suggested</span>}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
