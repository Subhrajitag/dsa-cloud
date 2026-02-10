"use client"

import { useState } from "react"

export default function NewFileModal({open,onCreate,onClose}:any){

  const [name,setName]=useState("")

  if(!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

      <div className="bg-gray-900 p-6 rounded w-80">

        <div className="mb-3 font-semibold">
          New File
        </div>

        <input
          className="w-full p-2 bg-gray-800"
          placeholder="example.js"
          onChange={e=>setName(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">

          <button onClick={onClose}>
            Cancel
          </button>

          <button
            className="bg-blue-600 px-3 py-1 rounded"
            onClick={()=>{
              onCreate(name)
              setName("")
            }}
          >
            Create
          </button>

        </div>

      </div>
    </div>
  )
}
