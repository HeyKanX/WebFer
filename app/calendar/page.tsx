"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, CalendarIcon, Heart, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase, type Event } from "@/lib/supabase"

const categories = [
  { value: "anniversary", label: "💕 Aniversario", color: "bg-pink-500" },
  { value: "date", label: "💜 Cita", color: "bg-purple-500" },
  { value: "special", label: "✨ Momento Especial", color: "bg-blue-500" },
  { value: "reminder", label: "⏰ Recordatorio", color: "bg-yellow-500" },
]

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [currentUser, setCurrentUser] = useState("")
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    type: "special" as Event["type"],
  })
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/")
      return
    }
    setCurrentUser(user)
    loadEvents()

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel("events")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => {
        loadEvents()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*").order("date", { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error("Error loading events:", error)
    } finally {
      setLoading(false)
    }
  }

  const addEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date) return

    const event: Omit<Event, "id" | "created_at"> = {
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      type: newEvent.type,
      created_by: currentUser,
      timestamp: new Date().toISOString(),
    }

    try {
      const { error } = await supabase.from("events").insert([event])

      if (error) throw error

      setNewEvent({ title: "", description: "", date: "", type: "special" })
      setShowAddEvent(false)
    } catch (error) {
      console.error("Error adding event:", error)
      alert("Error al agregar evento")
    }
  }

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("Error al eliminar evento")
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (dateStr: string) => {
    return events.filter((event) => event.date === dateStr)
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getEventTypeColor = (type: Event["type"]) => {
    const category = categories.find((cat) => cat.value === type)
    return category?.color || "bg-purple-500"
  }

  const getEventTypeEmoji = (type: Event["type"]) => {
    switch (type) {
      case "anniversary":
        return "💕"
      case "date":
        return "💜"
      case "special":
        return "✨"
      case "reminder":
        return "⏰"
      default:
        return "💜"
    }
  }

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayEvents = getEventsForDate(dateStr)
      const isToday = dateStr === formatDateForInput(new Date())

      days.push(
        <div
          key={day}
          className={`h-24 border border-purple-500/20 p-1 cursor-pointer hover:bg-purple-900/20 transition-all ${
            isToday ? "bg-purple-600/30 border-purple-400" : ""
          }`}
          onClick={() => {
            setNewEvent({ ...newEvent, date: dateStr })
            setShowAddEvent(true)
          }}
        >
          <div className="font-bold text-white text-sm mb-1">{day}</div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`text-xs px-1 py-0.5 rounded text-white truncate ${getEventTypeColor(event.type)}`}
                title={event.title}
              >
                {getEventTypeEmoji(event.type)} {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && <div className="text-xs text-purple-300">+{dayEvents.length - 2} más</div>}
          </div>
        </div>,
      )
    }

    return days
  }

  const getUserDisplayName = (user: string) => {
    return user === "fernanda" ? "Fernanda" : "Heykan"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-lg">Cargando calendario... 💜</div>
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
              <CalendarIcon className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-bold text-white">Calendario del Amor</h1>
            </div>
          </div>
          <Button onClick={() => setShowAddEvent(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Add Event Modal */}
        {showAddEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-black/80 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Nuevo Evento Especial 💕</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Título del evento"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300"
                />
                <Textarea
                  placeholder="Descripción (opcional)"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={3}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300"
                />
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="bg-purple-900/30 border-purple-500/50 text-white"
                />
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as Event["type"] })}
                  className="w-full p-2 bg-purple-900/30 border border-purple-500/50 text-white rounded-md"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="flex space-x-2">
                  <Button onClick={addEvent} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    Agregar 💜
                  </Button>
                  <Button
                    onClick={() => setShowAddEvent(false)}
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

        {/* Calendar Header */}
        <Card className="mb-6 bg-black/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                onClick={prevMonth}
                variant="ghost"
                size="sm"
                className="text-purple-200 hover:text-white hover:bg-purple-900/30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-white text-2xl">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <Button
                onClick={nextMonth}
                variant="ghost"
                size="sm"
                className="text-purple-200 hover:text-white hover:bg-purple-900/30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Calendar Grid */}
        <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                <div key={day} className="text-center text-purple-300 font-bold py-2">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Heart className="h-6 w-6 text-purple-400 mr-2" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-purple-400 opacity-50" />
                <p className="text-purple-300">Aún no hay eventos programados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 bg-purple-900/20 rounded-lg border border-purple-500/20"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg">{getEventTypeEmoji(event.type)}</span>
                          <h3 className="font-bold text-white">{event.title}</h3>
                        </div>
                        {event.description && <p className="text-purple-200 text-sm mb-2">{event.description}</p>}
                        <div className="flex items-center space-x-4 text-xs text-purple-300">
                          <span>
                            {new Date(event.date).toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <span>Por: {getUserDisplayName(event.created_by)}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => deleteEvent(event.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
