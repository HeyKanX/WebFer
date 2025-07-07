"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Loader2 } from "lucide-react"

interface ImageUploadProps {
  onUploadComplete: (url: string) => void
  className?: string
}

export default function ImageUpload({ onUploadComplete, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleUpload = async (file: File) => {
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        onUploadComplete(data.url)
      } else {
        alert(data.error || "Error al subir imagen")
      }
    } catch (error) {
      alert("Error al subir imagen")
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      handleUpload(file)
    }
  }

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? "border-purple-400 bg-purple-900/20" : "border-purple-500/50 hover:border-purple-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
            <p className="text-purple-200">Subiendo imagen...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <Upload className="h-12 w-12 text-purple-400" />
            <div>
              <p className="text-purple-200 mb-2">Arrastra una imagen aquí o haz clic para seleccionar</p>
              <p className="text-purple-400 text-sm">Formatos: JPG, PNG, GIF (máximo 5MB)</p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-purple-500/50 text-purple-200 hover:bg-purple-900/30 bg-transparent"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              Seleccionar Archivo
            </Button>
          </div>
        )}
      </div>

      <Input id="file-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  )
}
