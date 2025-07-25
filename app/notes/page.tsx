"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Heart, StickyNote, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase, type Note } from "@/lib/supabase"

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [currentUser, setCurrentUser] = useState("")
  const [showNewNote, setShowNewNote] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/")
      return
    }
    setCurrentUser(user)
    loadNotes()

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel("notes")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, () => {
        loadNotes()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase.from("notes").select("*").order("timestamp", { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error("Error loading notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPartner = (user: string) => {
    return user === "fernanda" ? "heykan" : "fernanda"
  }

  const createNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return

    const note: Omit<Note, "id" | "created_at"> = {
      from_user: currentUser,
      to_user: getPartner(currentUser),
      title: newNoteTitle,
      content: newNoteContent,
      read: false,
      timestamp: new Date().toISOString(),
    }

    try {
      const { error } = await supabase.from("notes").insert([note])

      if (error) throw error

      setNewNoteTitle("")
      setNewNoteContent("")
      setShowNewNote(false)
    } catch (error) {
      console.error("Error creating note:", error)
      alert("Error al crear la nota")
    }
  }

  const markAsRead = async (noteId: string) => {
    try {
      const { error } = await supabase.from("notes").update({ read: true }).eq("id", noteId).eq("to_user", currentUser)

      if (error) throw error
    } catch (error) {
      console.error("Error marking note as read:", error)
    }
  }

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", noteId).eq("from_user", currentUser)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting note:", error)
      alert("Error al eliminar la nota")
    }
  }

  // Notas que recibió el usuario actual
  const receivedNotes = notes.filter((note) => note.to_user === currentUser)
  // Notas que envió el usuario actual
  const sentNotes = notes.filter((note) => note.from_user === currentUser)

  const getUserDisplayName = (user: string) => {
    return user === "fernanda" ? "Fernanda" : "Heykan"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-lg">Cargando notas... 💜</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              size="sm"
              className="text-purple-200 hover:text-white hover:bg-purple-900/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center space-x-2">
              <StickyNote className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-bold text-white">Notas de Amor</h1>
            </div>
          </div>
          <Button onClick={() => setShowNewNote(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Nota
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* New Note Modal */}
        {showNewNote && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-black/80 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Nueva Nota de Amor 💌</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Título de la nota"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300"
                />
                <Textarea
                  placeholder="Escribe tu mensaje de amor..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={4}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300"
                />
                <div className="flex space-x-2">
                  <Button onClick={createNote} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    Enviar Nota 💜
                  </Button>
                  <Button
                    onClick={() => setShowNewNote(false)}
                    variant="outline"
                    className="border-purple-500/50 text-purple-200 hover:bg-purple-900/30"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notas Recibidas */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Heart className="h-6 w-6 text-purple-400 mr-2" />
              Notas para ti ({receivedNotes.filter((n) => !n.read).length} nuevas)
            </h2>

            {receivedNotes.length === 0 ? (
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="text-center py-8">
                  <StickyNote className="h-12 w-12 mx-auto mb-4 text-purple-400 opacity-50" />
                  <p className="text-purple-300">Aún no tienes notas de amor</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {receivedNotes.map((note) => (
                  <Card
                    key={note.id}
                    className={`bg-black/50 border-purple-500/30 backdrop-blur-sm ${
                      !note.read ? "ring-2 ring-purple-400/50" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">
                          {note.title}
                          {!note.read && <span className="ml-2 text-purple-400">✨ Nueva</span>}
                        </CardTitle>
                        <div className="text-purple-300 text-sm">De: {getUserDisplayName(note.from_user)}</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-purple-100 mb-4">{note.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400 text-sm">{new Date(note.timestamp).toLocaleDateString()}</span>
                        {!note.read && (
                          <Button
                            onClick={() => markAsRead(note.id)}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Marcar como leída
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Notas Enviadas */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <StickyNote className="h-6 w-6 text-purple-400 mr-2" />
              Notas que enviaste ({sentNotes.length})
            </h2>

            {sentNotes.length === 0 ? (
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-purple-400 opacity-50" />
                  <p className="text-purple-300">Aún no has enviado notas de amor</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sentNotes.map((note) => (
                  <Card key={note.id} className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">{note.title}</CardTitle>
                        <Button
                          onClick={() => deleteNote(note.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-purple-100 mb-4">{note.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400 text-sm">Para: {getUserDisplayName(note.to_user)}</span>
                        <span className="text-purple-400 text-sm">{new Date(note.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-2">
                        <span className={`text-sm ${note.read ? "text-green-400" : "text-yellow-400"}`}>
                          {note.read ? "✓ Leída" : "⏳ Pendiente"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
