"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Camera, Heart, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase, type Photo } from "@/lib/supabase"

export default function AlbumPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [currentUser, setCurrentUser] = useState("")
  const [showAddPhoto, setShowAddPhoto] = useState(false)
  const [newPhotoUrl, setNewPhotoUrl] = useState("")
  const [newPhotoTitle, setNewPhotoTitle] = useState("")
  const [newPhotoNote, setNewPhotoNote] = useState("")
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/")
      return
    }
    setCurrentUser(user)
    loadPhotos()

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel("photos")
      .on("postgres_changes", { event: "*", schema: "public", table: "photos" }, () => {
        loadPhotos()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase.from("photos").select("*").order("timestamp", { ascending: false })

      if (error) throw error
      setPhotos(data || [])
    } catch (error) {
      console.error("Error loading photos:", error)
    } finally {
      setLoading(false)
    }
  }

  const addPhoto = async () => {
    if (!newPhotoUrl.trim() || !newPhotoTitle.trim()) return

    const photo: Omit<Photo, "id" | "created_at"> = {
      url: newPhotoUrl,
      title: newPhotoTitle,
      note: newPhotoNote,
      uploaded_by: currentUser,
      timestamp: new Date().toISOString(),
    }

    try {
      const { error } = await supabase.from("photos").insert([photo])

      if (error) throw error

      setNewPhotoUrl("")
      setNewPhotoTitle("")
      setNewPhotoNote("")
      setShowAddPhoto(false)
    } catch (error) {
      console.error("Error adding photo:", error)
      alert("Error al agregar foto")
    }
  }

  const deletePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase.from("photos").delete().eq("id", photoId)

      if (error) throw error
      setSelectedPhoto(null)
    } catch (error) {
      console.error("Error deleting photo:", error)
      alert("Error al eliminar foto")
    }
  }

  const getUserDisplayName = (user: string) => {
    return user === "fernanda" ? "Fernanda" : "Heykan"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-lg">Cargando álbum... 💜</div>
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
              <Camera className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-bold text-white">Álbum de Recuerdos</h1>
            </div>
          </div>
          <Button onClick={() => setShowAddPhoto(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Foto
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Add Photo Modal */}
        {showAddPhoto && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-black/80 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Agregar Nuevo Recuerdo 📸</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="URL de la imagen"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300"
                />
                <Input
                  placeholder="Título del recuerdo"
                  value={newPhotoTitle}
                  onChange={(e) => setNewPhotoTitle(e.target.value)}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300"
                />
                <Textarea
                  placeholder="Nota especial sobre este momento..."
                  value={newPhotoNote}
                  onChange={(e) => setNewPhotoNote(e.target.value)}
                  rows={3}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300"
                />
                <div className="flex space-x-2">
                  <Button onClick={addPhoto} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    Agregar 💜
                  </Button>
                  <Button
                    onClick={() => setShowAddPhoto(false)}
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

        {/* Photo Detail Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl bg-black/90 border-purple-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{selectedPhoto.title}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => deletePhoto(selectedPhoto.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setSelectedPhoto(null)}
                      variant="ghost"
                      size="sm"
                      className="text-purple-200 hover:text-white"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <img
                  src={selectedPhoto.url || "/placeholder.svg"}
                  alt={selectedPhoto.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <p className="text-purple-100 mb-4">{selectedPhoto.note}</p>
                <div className="flex items-center justify-between text-sm text-purple-300">
                  <span>Por: {getUserDisplayName(selectedPhoto.uploaded_by)}</span>
                  <span>{new Date(selectedPhoto.timestamp).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Photos Grid */}
        {photos.length === 0 ? (
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Camera className="h-16 w-16 mx-auto mb-4 text-purple-400 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">Aún no hay recuerdos</h3>
              <p className="text-purple-300 mb-6">Comienza a crear vuestro álbum de momentos especiales</p>
              <Button onClick={() => setShowAddPhoto(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Foto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">💕 Nuestros Momentos Especiales 💕</h2>
              <p className="text-purple-200">
                {photos.length} {photos.length === 1 ? "recuerdo guardado" : "recuerdos guardados"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <Card
                  key={photo.id}
                  className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:bg-black/60 transition-all cursor-pointer group"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={photo.url || "/placeholder.svg"}
                        alt={photo.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-t-lg flex items-center justify-center">
                        <Heart className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-white mb-2">{photo.title}</h3>
                      <p className="text-purple-200 text-sm mb-3 line-clamp-2">{photo.note || "Sin nota"}</p>
                      <div className="flex items-center justify-between text-xs text-purple-300">
                        <span>{getUserDisplayName(photo.uploaded_by)}</span>
                        <span>{new Date(photo.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
