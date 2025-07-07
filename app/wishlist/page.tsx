"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Star, Heart, Check, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase, type WishItem } from "@/lib/supabase"

const categories = [
  { value: "travel", label: "✈️ Viajes", color: "bg-blue-500" },
  { value: "activity", label: "🎯 Actividades", color: "bg-green-500" },
  { value: "gift", label: "🎁 Regalos", color: "bg-pink-500" },
  { value: "experience", label: "✨ Experiencias", color: "bg-purple-500" },
  { value: "goal", label: "🏆 Metas", color: "bg-yellow-500" },
]

const priorities = [
  { value: "low", label: "Baja", color: "text-gray-400" },
  { value: "medium", label: "Media", color: "text-yellow-400" },
  { value: "high", label: "Alta", color: "text-red-400" },
]

export default function WishlistPage() {
  const [wishes, setWishes] = useState<WishItem[]>([])
  const [currentUser, setCurrentUser] = useState("")
  const [showAddWish, setShowAddWish] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [newWish, setNewWish] = useState({
    title: "",
    description: "",
    category: "experience" as WishItem["category"],
    priority: "medium" as WishItem["priority"],
  })
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/")
      return
    }
    setCurrentUser(user)
    loadWishes()

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel("wishlist")
      .on("postgres_changes", { event: "*", schema: "public", table: "wishlist" }, () => {
        loadWishes()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const loadWishes = async () => {
    try {
      const { data, error } = await supabase.from("wishlist").select("*").order("timestamp", { ascending: false })

      if (error) throw error
      setWishes(data || [])
    } catch (error) {
      console.error("Error loading wishes:", error)
    } finally {
      setLoading(false)
    }
  }

  const addWish = async () => {
    if (!newWish.title.trim()) return

    const wish: Omit<WishItem, "id" | "created_at"> = {
      title: newWish.title,
      description: newWish.description,
      category: newWish.category,
      priority: newWish.priority,
      completed: false,
      created_by: currentUser,
      timestamp: new Date().toISOString(),
    }

    try {
      const { error } = await supabase.from("wishlist").insert([wish])

      if (error) throw error

      setNewWish({ title: "", description: "", category: "experience", priority: "medium" })
      setShowAddWish(false)
    } catch (error) {
      console.error("Error adding wish:", error)
      alert("Error al agregar deseo")
    }
  }

  const toggleCompleted = async (wishId: string, completed: boolean) => {
    try {
      const updateData: any = {
        completed: !completed,
      }

      if (!completed) {
        updateData.completed_date = new Date().toISOString()
      } else {
        updateData.completed_date = null
      }

      const { error } = await supabase.from("wishlist").update(updateData).eq("id", wishId)

      if (error) throw error
    } catch (error) {
      console.error("Error updating wish:", error)
      alert("Error al actualizar deseo")
    }
  }

  const deleteWish = async (wishId: string) => {
    try {
      const { error } = await supabase.from("wishlist").delete().eq("id", wishId)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting wish:", error)
      alert("Error al eliminar deseo")
    }
  }

  const getUserDisplayName = (user: string) => {
    return user === "fernanda" ? "Fernanda" : "Heykan"
  }

  const getCategoryInfo = (category: string) => {
    return categories.find((cat) => cat.value === category)
  }

  const getPriorityInfo = (priority: string) => {
    return priorities.find((p) => p.value === priority)
  }

  const filteredWishes = wishes.filter((wish) => {
    const statusMatch =
      filter === "all" || (filter === "pending" && !wish.completed) || (filter === "completed" && wish.completed)

    const categoryMatch = categoryFilter === "all" || wish.category === categoryFilter

    return statusMatch && categoryMatch
  })

  const completedCount = wishes.filter((w) => w.completed).length
  const totalCount = wishes.length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-lg">Cargando lista de deseos... 💜</div>
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
              <Star className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-bold text-white">Lista de Deseos</h1>
            </div>
          </div>
          <Button onClick={() => setShowAddWish(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Deseo
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Add Wish Modal */}
        {showAddWish && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-black/80 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Nuevo Deseo ⭐</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="¿Qué deseas hacer juntos?"
                  value={newWish.title}
                  onChange={(e) => setNewWish({ ...newWish, title: e.target.value })}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300"
                />

                <Textarea
                  placeholder="Describe tu deseo (opcional)"
                  value={newWish.description}
                  onChange={(e) => setNewWish({ ...newWish, description: e.target.value })}
                  rows={3}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-purple-200 text-sm mb-2 block">Categoría</label>
                    <select
                      value={newWish.category}
                      onChange={(e) => setNewWish({ ...newWish, category: e.target.value as WishItem["category"] })}
                      className="w-full p-2 bg-purple-900/30 border border-purple-500/50 text-white rounded-md"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-purple-200 text-sm mb-2 block">Prioridad</label>
                    <select
                      value={newWish.priority}
                      onChange={(e) => setNewWish({ ...newWish, priority: e.target.value as WishItem["priority"] })}
                      className="w-full p-2 bg-purple-900/30 border border-purple-500/50 text-white rounded-md"
                    >
                      {priorities.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={addWish} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    Agregar 💜
                  </Button>
                  <Button
                    onClick={() => setShowAddWish(false)}
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-center">
            <CardContent className="p-6">
              <Star className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
              <div className="text-2xl font-bold text-white mb-2">{totalCount}</div>
              <div className="text-purple-200">Deseos Totales</div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-center">
            <CardContent className="p-6">
              <Check className="h-12 w-12 mx-auto mb-4 text-green-400" />
              <div className="text-2xl font-bold text-white mb-2">{completedCount}</div>
              <div className="text-purple-200">Cumplidos</div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-center">
            <CardContent className="p-6">
              <Heart className="h-12 w-12 mx-auto mb-4 text-purple-400" />
              <div className="text-2xl font-bold text-white mb-2">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </div>
              <div className="text-purple-200">Progreso</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex space-x-2">
                <Button
                  onClick={() => setFilter("all")}
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  className={filter === "all" ? "bg-purple-600" : "border-purple-500/50 text-purple-200"}
                >
                  Todos
                </Button>
                <Button
                  onClick={() => setFilter("pending")}
                  variant={filter === "pending" ? "default" : "outline"}
                  size="sm"
                  className={filter === "pending" ? "bg-purple-600" : "border-purple-500/50 text-purple-200"}
                >
                  Pendientes
                </Button>
                <Button
                  onClick={() => setFilter("completed")}
                  variant={filter === "completed" ? "default" : "outline"}
                  size="sm"
                  className={filter === "completed" ? "bg-purple-600" : "border-purple-500/50 text-purple-200"}
                >
                  Cumplidos
                </Button>
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="p-2 bg-purple-900/30 border border-purple-500/50 text-white rounded-md text-sm"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Wishes Grid */}
        {filteredWishes.length === 0 ? (
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Star className="h-16 w-16 mx-auto mb-4 text-purple-400 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">
                {wishes.length === 0 ? "Aún no hay deseos" : "No hay deseos que coincidan con los filtros"}
              </h3>
              <p className="text-purple-300 mb-6">
                {wishes.length === 0
                  ? "Comienza a crear vuestra lista de sueños y metas juntos"
                  : "Prueba con otros filtros para ver más deseos"}
              </p>
              {wishes.length === 0 && (
                <Button onClick={() => setShowAddWish(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Deseo
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWishes.map((wish) => {
              const categoryInfo = getCategoryInfo(wish.category)
              const priorityInfo = getPriorityInfo(wish.priority)

              return (
                <Card
                  key={wish.id}
                  className={`bg-black/50 border-purple-500/30 backdrop-blur-sm transition-all ${
                    wish.completed ? "opacity-75" : "hover:bg-black/60"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs text-white ${categoryInfo?.color}`}>
                            {categoryInfo?.label}
                          </span>
                          <span className={`text-xs ${priorityInfo?.color}`}>{priorityInfo?.label}</span>
                        </div>
                        <CardTitle className={`text-white ${wish.completed ? "line-through" : ""}`}>
                          {wish.title}
                        </CardTitle>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          onClick={() => toggleCompleted(wish.id, wish.completed)}
                          size="sm"
                          variant="ghost"
                          className={`${
                            wish.completed
                              ? "text-green-400 hover:text-green-300"
                              : "text-purple-400 hover:text-purple-300"
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => deleteWish(wish.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {wish.description && <p className="text-purple-200 mb-4">{wish.description}</p>}

                    <div className="flex items-center justify-between text-sm text-purple-300">
                      <span>Por: {getUserDisplayName(wish.created_by)}</span>
                      <span>{new Date(wish.timestamp).toLocaleDateString()}</span>
                    </div>

                    {wish.completed && wish.completed_date && (
                      <div className="mt-2 text-sm text-green-400">
                        ✅ Cumplido el {new Date(wish.completed_date).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
