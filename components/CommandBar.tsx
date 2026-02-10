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
    <div className="fixed inset-0 bg-black/50 flex justify-center pt-40">

      <div className="bg-gray-900 w-96 rounded shadow-lg">

        <input
          autoFocus
          className="w-full p-3 bg-gray-800 outline-none"
          placeholder="Type file name..."
          onChange={e=>setQuery(e.target.value)}
        />

        {filtered.map((f:any)=>(
          <div
            key={f.id}
            onClick={()=>{
              onSelect(f)
              setOpen(false)
            }}
            className="p-2 hover:bg-gray-700 cursor-pointer"
          >
            {f.name}
          </div>
        ))}

      </div>
    </div>
  )
}
