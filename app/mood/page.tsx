"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Heart, Smile, Meh } from "lucide-react"
import { useRouter } from "next/navigation"

interface MoodEntry {
  id: string
  user: string
  mood: "happy" | "love" | "sad" | "excited" | "calm" | "stressed"
  note: string
  date: string
  timestamp: Date
}

const moodOptions = [
  { value: "happy", emoji: "😊", label: "Feliz", color: "bg-yellow-500" },
  { value: "love", emoji: "😍", label: "Enamorado/a", color: "bg-pink-500" },
  { value: "excited", emoji: "🤩", label: "Emocionado/a", color: "bg-orange-500" },
  { value: "calm", emoji: "😌", label: "Tranquilo/a", color: "bg-blue-500" },
  { value: "sad", emoji: "😢", label: "Triste", color: "bg-gray-500" },
  { value: "stressed", emoji: "😰", label: "Estresado/a", color: "bg-red-500" },
]

export default function MoodPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [currentUser, setCurrentUser] = useState("")
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [moodNote, setMoodNote] = useState("")
  const [showAddMood, setShowAddMood] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/")
      return
    }
    setCurrentUser(user)

    // Cargar estados de ánimo del localStorage
    const savedMoods = localStorage.getItem("loveMoods")
    if (savedMoods) {
      setMoods(JSON.parse(savedMoods))
    }
  }, [router])

  const addMoodEntry = () => {
    if (!selectedMood) return

    const today = new Date().toISOString().split("T")[0]
    const existingTodayEntry = moods.find((m) => m.user === currentUser && m.date === today)

    if (existingTodayEntry) {
      // Actualizar entrada existente
      const updatedMoods = moods.map((m) =>
        m.id === existingTodayEntry.id
          ? { ...m, mood: selectedMood as MoodEntry["mood"], note: moodNote, timestamp: new Date() }
          : m,
      )
      setMoods(updatedMoods)
      localStorage.setItem("loveMoods", JSON.stringify(updatedMoods))
    } else {
      // Crear nueva entrada
      const moodEntry: MoodEntry = {
        id: Date.now().toString(),
        user: currentUser,
        mood: selectedMood as MoodEntry["mood"],
        note: moodNote,
        date: today,
        timestamp: new Date(),
      }

      const updatedMoods = [...moods, moodEntry]
      setMoods(updatedMoods)
      localStorage.setItem("loveMoods", JSON.stringify(updatedMoods))
    }

    setSelectedMood("")
    setMoodNote("")
    setShowAddMood(false)
  }

  const getTodayMood = (user: string) => {
    const today = new Date().toISOString().split("T")[0]
    return moods.find((m) => m.user === user && m.date === today)
  }

  const getUserDisplayName = (user: string) => {
    return user === "fernanda" ? "Fernanda" : "Heykan"
  }

  const getPartner = () => {
    return currentUser === "fernanda" ? "heykan" : "fernanda"
  }

  const getMoodOption = (moodValue: string) => {
    return moodOptions.find((option) => option.value === moodValue)
  }

  const getRecentMoods = (user: string, days = 7) => {
    const userMoods = moods.filter((m) => m.user === user)
    return userMoods.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, days)
  }

  const myTodayMood = getTodayMood(currentUser)
  const partnerTodayMood = getTodayMood(getPartner())
  const myRecentMoods = getRecentMoods(currentUser)
  const partnerRecentMoods = getRecentMoods(getPartner())

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
              <Smile className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-bold text-white">Estado de Ánimo</h1>
            </div>
          </div>
          <Button onClick={() => setShowAddMood(true)} className="bg-purple-600 hover:bg-purple-700">
            {myTodayMood ? "Actualizar Ánimo" : "Registrar Ánimo"} 😊
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Add/Update Mood Modal */}
        {showAddMood && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-black/80 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">
                  {myTodayMood ? "Actualizar mi ánimo de hoy" : "¿Cómo te sientes hoy?"} 💜
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {moodOptions.map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => setSelectedMood(option.value)}
                      variant={selectedMood === option.value ? "default" : "outline"}
                      className={`h-16 flex flex-col space-y-1 ${
                        selectedMood === option.value
                          ? `${option.color} text-white`
                          : "border-purple-500/50 text-purple-200 hover:bg-purple-900/30"
                      }`}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  ))}
                </div>

                <Textarea
                  placeholder="¿Qué te hace sentir así hoy? (opcional)"
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  rows={3}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300"
                />

                <div className="flex space-x-2">
                  <Button
                    onClick={addMoodEntry}
                    disabled={!selectedMood}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {myTodayMood ? "Actualizar" : "Registrar"} 💜
                  </Button>
                  <Button
                    onClick={() => setShowAddMood(false)}
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

        {/* Today's Mood */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* My Mood Today */}
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-center">Tu ánimo de hoy</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {myTodayMood ? (
                <div>
                  <div className="text-6xl mb-4">{getMoodOption(myTodayMood.mood)?.emoji}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{getMoodOption(myTodayMood.mood)?.label}</h3>
                  {myTodayMood.note && <p className="text-purple-200 mb-4">"{myTodayMood.note}"</p>}
                  <p className="text-purple-300 text-sm">
                    Registrado a las {new Date(myTodayMood.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-6xl mb-4 opacity-50">🤔</div>
                  <p className="text-purple-300">Aún no has registrado tu ánimo de hoy</p>
                  <Button onClick={() => setShowAddMood(true)} className="mt-4 bg-purple-600 hover:bg-purple-700">
                    Registrar ahora
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Partner's Mood Today */}
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-center">Ánimo de {getUserDisplayName(getPartner())} hoy</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {partnerTodayMood ? (
                <div>
                  <div className="text-6xl mb-4">{getMoodOption(partnerTodayMood.mood)?.emoji}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{getMoodOption(partnerTodayMood.mood)?.label}</h3>
                  {partnerTodayMood.note && <p className="text-purple-200 mb-4">"{partnerTodayMood.note}"</p>}
                  <p className="text-purple-300 text-sm">
                    Registrado a las {new Date(partnerTodayMood.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-6xl mb-4 opacity-50">❓</div>
                  <p className="text-purple-300">
                    {getUserDisplayName(getPartner())} aún no ha registrado su ánimo de hoy
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Moods History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Recent Moods */}
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Tus últimos estados de ánimo</CardTitle>
            </CardHeader>
            <CardContent>
              {myRecentMoods.length === 0 ? (
                <div className="text-center py-8">
                  <Meh className="h-12 w-12 mx-auto mb-4 text-purple-400 opacity-50" />
                  <p className="text-purple-300">Aún no has registrado estados de ánimo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRecentMoods.map((mood) => {
                    const moodOption = getMoodOption(mood.mood)
                    return (
                      <div key={mood.id} className="flex items-center space-x-4 p-3 bg-purple-900/20 rounded-lg">
                        <div className="text-2xl">{moodOption?.emoji}</div>
                        <div className="flex-1">
                          <div className="font-bold text-white">{moodOption?.label}</div>
                          {mood.note && <div className="text-purple-200 text-sm">"{mood.note}"</div>}
                          <div className="text-purple-400 text-xs">
                            {new Date(mood.date).toLocaleDateString("es-ES", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Partner's Recent Moods */}
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Estados de ánimo de {getUserDisplayName(getPartner())}</CardTitle>
            </CardHeader>
            <CardContent>
              {partnerRecentMoods.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-purple-400 opacity-50" />
                  <p className="text-purple-300">
                    {getUserDisplayName(getPartner())} aún no ha registrado estados de ánimo
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {partnerRecentMoods.map((mood) => {
                    const moodOption = getMoodOption(mood.mood)
                    return (
                      <div key={mood.id} className="flex items-center space-x-4 p-3 bg-purple-900/20 rounded-lg">
                        <div className="text-2xl">{moodOption?.emoji}</div>
                        <div className="flex-1">
                          <div className="font-bold text-white">{moodOption?.label}</div>
                          {mood.note && <div className="text-purple-200 text-sm">"{mood.note}"</div>}
                          <div className="text-purple-400 text-xs">
                            {new Date(mood.date).toLocaleDateString("es-ES", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
