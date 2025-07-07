"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Heart, Calendar, Clock, Edit } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TimerPage() {
  const [relationshipStart, setRelationshipStart] = useState<Date | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [dateInput, setDateInput] = useState("")
  const [timeElapsed, setTimeElapsed] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/")
      return
    }

    // Cargar fecha de inicio de la relación
    const savedDate = localStorage.getItem("relationshipStartDate")
    if (savedDate) {
      setRelationshipStart(new Date(savedDate))
    }
  }, [router])

  useEffect(() => {
    if (!relationshipStart) return

    const updateTimer = () => {
      const now = new Date()
      const diff = now.getTime() - relationshipStart.getTime()

      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365))
      const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))
      const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeElapsed({ years, months, days, hours, minutes, seconds })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [relationshipStart])

  const saveDate = () => {
    if (!dateInput) return

    const date = new Date(dateInput)
    setRelationshipStart(date)
    localStorage.setItem("relationshipStartDate", date.toISOString())
    setIsEditing(false)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
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
            <Clock className="h-6 w-6 text-purple-400" />
            <h1 className="text-xl font-bold text-white">Tiempo Juntos</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Date Setup */}
        {!relationshipStart || isEditing ? (
          <Card className="mb-8 bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                {relationshipStart ? "Editar Fecha de Inicio" : "Configura el Inicio de Nuestra Historia"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-purple-200 mb-4">¿Cuándo comenzó nuestra hermosa historia de amor?</p>
                <div className="flex items-center space-x-4 justify-center">
                  <Input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="bg-purple-900/30 border-purple-500/50 text-white"
                  />
                  <Button onClick={saveDate} className="bg-purple-600 hover:bg-purple-700">
                    Guardar 💜
                  </Button>
                  {relationshipStart && (
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="border-purple-500/50 text-purple-200 hover:bg-purple-900/30"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Main Timer Display */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">💕 Nuestro Tiempo de Amor 💕</h2>
              <p className="text-purple-200 text-lg mb-2">Desde el {formatDate(relationshipStart)}</p>
              <Button
                onClick={() => {
                  setIsEditing(true)
                  setDateInput(relationshipStart.toISOString().split("T")[0])
                }}
                variant="ghost"
                size="sm"
                className="text-purple-300 hover:text-white hover:bg-purple-900/30"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar fecha
              </Button>
            </div>

            {/* Time Counter Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{timeElapsed.years}</div>
                  <div className="text-purple-200 text-sm">{timeElapsed.years === 1 ? "Año" : "Años"}</div>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{timeElapsed.months}</div>
                  <div className="text-purple-200 text-sm">{timeElapsed.months === 1 ? "Mes" : "Meses"}</div>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{timeElapsed.days}</div>
                  <div className="text-purple-200 text-sm">{timeElapsed.days === 1 ? "Día" : "Días"}</div>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{timeElapsed.hours}</div>
                  <div className="text-purple-200 text-sm">{timeElapsed.hours === 1 ? "Hora" : "Horas"}</div>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{timeElapsed.minutes}</div>
                  <div className="text-purple-200 text-sm">{timeElapsed.minutes === 1 ? "Minuto" : "Minutos"}</div>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-center">
                <CardContent className="p-4">
                  <div className="text-3xl font-bold text-purple-400 mb-2 animate-pulse">{timeElapsed.seconds}</div>
                  <div className="text-purple-200 text-sm">{timeElapsed.seconds === 1 ? "Segundo" : "Segundos"}</div>
                </CardContent>
              </Card>
            </div>

            {/* Love Messages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-center">
                    <Heart className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                    Momentos Vividos
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <p className="text-purple-200">
                    <span className="font-bold text-purple-400">
                      {Math.floor((new Date().getTime() - relationshipStart.getTime()) / (1000 * 60 * 60 * 24))}
                    </span>{" "}
                    días de amor
                  </p>
                  <p className="text-purple-200">
                    <span className="font-bold text-purple-400">
                      {Math.floor((new Date().getTime() - relationshipStart.getTime()) / (1000 * 60 * 60))}
                    </span>{" "}
                    horas de felicidad
                  </p>
                  <p className="text-purple-200">
                    <span className="font-bold text-purple-400">
                      {Math.floor((new Date().getTime() - relationshipStart.getTime()) / (1000 * 60))}
                    </span>{" "}
                    minutos de sonrisas
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-center">
                    <Heart className="h-6 w-6 mx-auto mb-2 text-purple-400 animate-pulse" />
                    Nuestro Amor Crece
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-purple-200 text-lg leading-relaxed">
                    "Cada segundo que pasa es un segundo más de amor que construimos juntos. Nuestro tiempo no se mide
                    solo en números, sino en sonrisas, abrazos, besos y momentos que quedarán para siempre en nuestros
                    corazones."
                  </p>
                  <div className="mt-4 text-purple-400 text-2xl">💕✨💜✨💕</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
