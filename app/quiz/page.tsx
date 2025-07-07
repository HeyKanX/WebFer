"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, User, Heart, Trophy, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase, type Question, type QuestionAlternative, formatDatePeru } from "@/lib/supabase"

interface GameSession {
  questionId: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  timestamp: Date
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentUser, setCurrentUser] = useState("")
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [gameMode, setGameMode] = useState<"menu" | "playing" | "results">("menu")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [gameResults, setGameResults] = useState<GameSession[]>([])
  const [loading, setLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    alternatives: [
      { id: "a", text: "" },
      { id: "b", text: "" },
      { id: "c", text: "" },
      { id: "d", text: "" },
    ] as QuestionAlternative[],
    correctAnswerId: "a",
  })
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/")
      return
    }
    setCurrentUser(user)
    loadQuestions()

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel("questions")
      .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, () => {
        loadQuestions()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase.from("questions").select("*").order("timestamp", { ascending: false })

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error("Error loading questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = async () => {
    if (!newQuestion.question.trim()) return

    // Verificar que al menos 2 alternativas tengan texto
    const validAlternatives = newQuestion.alternatives.filter((alt) => alt.text.trim())
    if (validAlternatives.length < 2) {
      alert("Debes agregar al menos 2 alternativas")
      return
    }

    // Verificar que la respuesta correcta tenga texto
    const correctAlternative = newQuestion.alternatives.find((alt) => alt.id === newQuestion.correctAnswerId)
    if (!correctAlternative?.text.trim()) {
      alert("La alternativa marcada como correcta debe tener texto")
      return
    }

    const question: Omit<Question, "id" | "created_at"> = {
      question: newQuestion.question,
      answer: correctAlternative.text, // Para compatibilidad
      alternatives: validAlternatives,
      correct_answer_id: newQuestion.correctAnswerId,
      created_by: currentUser,
      attempts: 0,
      correct_guesses: 0,
      timestamp: new Date().toISOString(),
    }

    try {
      const { error } = await supabase.from("questions").insert([question])

      if (error) throw error

      setNewQuestion({
        question: "",
        alternatives: [
          { id: "a", text: "" },
          { id: "b", text: "" },
          { id: "c", text: "" },
          { id: "d", text: "" },
        ],
        correctAnswerId: "a",
      })
      setShowAddQuestion(false)
    } catch (error) {
      console.error("Error adding question:", error)
      alert("Error al agregar pregunta")
    }
  }

  const deleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase.from("questions").delete().eq("id", questionId).eq("created_by", currentUser)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting question:", error)
      alert("Error al eliminar pregunta")
    }
  }

  const startGame = () => {
    const partnerQuestions = questions.filter((q) => q.created_by !== currentUser)
    if (partnerQuestions.length === 0) {
      alert("Tu pareja aún no ha creado preguntas para ti")
      return
    }

    const randomQuestion = partnerQuestions[Math.floor(Math.random() * partnerQuestions.length)]
    setCurrentQuestion(randomQuestion)
    setGameMode("playing")
    setSelectedAnswer("")
  }

  const submitAnswer = async () => {
    if (!currentQuestion || !selectedAnswer) return

    const isCorrect = selectedAnswer === currentQuestion.correct_answer_id
    const correctAlternative = currentQuestion.alternatives.find((alt) => alt.id === currentQuestion.correct_answer_id)
    const selectedAlternative = currentQuestion.alternatives.find((alt) => alt.id === selectedAnswer)

    // Actualizar estadísticas de la pregunta
    try {
      const { error } = await supabase
        .from("questions")
        .update({
          attempts: currentQuestion.attempts + 1,
          correct_guesses: currentQuestion.correct_guesses + (isCorrect ? 1 : 0),
        })
        .eq("id", currentQuestion.id)

      if (error) throw error
    } catch (error) {
      console.error("Error updating question stats:", error)
    }

    // Guardar resultado del juego
    const session: GameSession = {
      questionId: currentQuestion.id,
      userAnswer: selectedAlternative?.text || "",
      correctAnswer: correctAlternative?.text || "",
      isCorrect,
      timestamp: new Date(),
    }

    const newResults = [...gameResults, session]
    setGameResults(newResults)
    setGameMode("results")
  }

  const playAgain = () => {
    setGameMode("menu")
    setCurrentQuestion(null)
    setSelectedAnswer("")
  }

  const getUserDisplayName = (user: string) => {
    return user === "fernanda" ? "Fernanda" : "Heykan"
  }

  const getPartnerName = () => {
    return currentUser === "fernanda" ? "Heykan" : "Fernanda"
  }

  const updateAlternative = (index: number, text: string) => {
    const updatedAlternatives = [...newQuestion.alternatives]
    updatedAlternatives[index].text = text
    setNewQuestion({ ...newQuestion, alternatives: updatedAlternatives })
  }

  const myQuestions = questions.filter((q) => q.created_by === currentUser)
  const partnerQuestions = questions.filter((q) => q.created_by !== currentUser)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-lg">Cargando preguntas... 💜</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-500/30 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
              <User className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-bold text-white">Conóceme Más</h1>
            </div>
          </div>
          {gameMode === "menu" && (
            <Button onClick={() => setShowAddQuestion(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Pregunta
            </Button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Add Question Modal */}
        {showAddQuestion && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl bg-black/80 border-purple-500/30 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Nueva Pregunta con Alternativas 🤔</CardTitle>
                  <Button
                    onClick={() => setShowAddQuestion(false)}
                    variant="ghost"
                    size="sm"
                    className="text-purple-200 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Textarea
                  placeholder="Escribe una pregunta sobre ti..."
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  rows={3}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300"
                />

                <div>
                  <h3 className="text-white font-bold mb-4">Alternativas de respuesta:</h3>
                  <div className="space-y-3">
                    {newQuestion.alternatives.map((alternative, index) => (
                      <div key={alternative.id} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={alternative.id}
                          checked={newQuestion.correctAnswerId === alternative.id}
                          onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswerId: e.target.value })}
                          className="w-4 h-4 text-purple-600"
                        />
                        <div className="flex-1">
                          <Input
                            placeholder={`Alternativa ${alternative.id.toUpperCase()}`}
                            value={alternative.text}
                            onChange={(e) => updateAlternative(index, e.target.value)}
                            className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300"
                          />
                        </div>
                        <span className="text-purple-300 text-sm w-8">{alternative.id.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-purple-300 text-sm mt-2">
                    💡 Marca con el círculo cuál es la respuesta correcta. Puedes dejar alternativas vacías.
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={addQuestion} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    Agregar Pregunta 💜
                  </Button>
                  <Button
                    onClick={() => setShowAddQuestion(false)}
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

        {/* Game Menu */}
        {gameMode === "menu" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">🎯 ¿Qué tanto nos conocemos? 🎯</h2>
              <p className="text-purple-200 text-lg">
                Crea preguntas con alternativas múltiples y adivina las respuestas de tu pareja
              </p>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-center">
                <CardContent className="p-6">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                  <div className="text-2xl font-bold text-white mb-2">
                    {gameResults.filter((r) => r.isCorrect).length}
                  </div>
                  <div className="text-purple-200">Respuestas Correctas</div>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-center">
                <CardContent className="p-6">
                  <User className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                  <div className="text-2xl font-bold text-white mb-2">{myQuestions.length}</div>
                  <div className="text-purple-200">Mis Preguntas</div>
                </CardContent>
              </Card>

              <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm text-center">
                <CardContent className="p-6">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-pink-400" />
                  <div className="text-2xl font-bold text-white mb-2">{partnerQuestions.length}</div>
                  <div className="text-purple-200">Preguntas de {getPartnerName()}</div>
                </CardContent>
              </Card>
            </div>

            {/* Play Button */}
            <div className="text-center">
              <Button
                onClick={startGame}
                disabled={partnerQuestions.length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3"
              >
                {partnerQuestions.length === 0 ? "Esperando preguntas de tu pareja..." : "🎮 ¡Jugar Ahora!"}
              </Button>
            </div>

            {/* My Questions */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Mis Preguntas ({myQuestions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {myQuestions.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 mx-auto mb-4 text-purple-400 opacity-50" />
                    <p className="text-purple-300">Aún no has creado preguntas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myQuestions.map((q) => (
                      <div key={q.id} className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-white mb-3">{q.question}</h3>
                            <div className="space-y-2 mb-3">
                              {q.alternatives?.map((alt) => (
                                <div key={alt.id} className="flex items-center space-x-2">
                                  <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      alt.id === q.correct_answer_id
                                        ? "bg-green-500 text-white"
                                        : "bg-purple-700 text-purple-200"
                                    }`}
                                  >
                                    {alt.id.toUpperCase()}
                                  </span>
                                  <span className="text-purple-200">{alt.text}</span>
                                  {alt.id === q.correct_answer_id && <span className="text-green-400">✓</span>}
                                </div>
                              ))}
                            </div>
                            <div className="text-sm text-purple-300">
                              Intentos: {q.attempts} | Aciertos: {q.correct_guesses}
                              {q.attempts > 0 && (
                                <span className="ml-2">
                                  ({Math.round((q.correct_guesses / q.attempts) * 100)}% de acierto)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-purple-400 mt-1">Creada: {formatDatePeru(q.timestamp)}</div>
                          </div>
                          <Button
                            onClick={() => deleteQuestion(q.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Playing Mode */}
        {gameMode === "playing" && currentQuestion && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-center text-2xl">
                  Pregunta de {getUserDisplayName(currentQuestion.created_by)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🤔</div>
                  <h3 className="text-xl text-white mb-6">{currentQuestion.question}</h3>

                  <div className="space-y-3">
                    {currentQuestion.alternatives?.map((alternative) => (
                      <Button
                        key={alternative.id}
                        onClick={() => setSelectedAnswer(alternative.id)}
                        variant={selectedAnswer === alternative.id ? "default" : "outline"}
                        className={`w-full p-4 text-left justify-start ${
                          selectedAnswer === alternative.id
                            ? "bg-purple-600 text-white"
                            : "border-purple-500/50 text-purple-200 hover:bg-purple-900/30 bg-transparent"
                        }`}
                      >
                        <span className="font-bold mr-3">{alternative.id.toUpperCase()})</span>
                        {alternative.text}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={submitAnswer}
                    disabled={!selectedAnswer}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-lg py-3"
                  >
                    Responder 💜
                  </Button>
                  <Button
                    onClick={() => setGameMode("menu")}
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

        {/* Results Mode */}
        {gameMode === "results" && currentQuestion && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-center text-2xl">
                  {gameResults[gameResults.length - 1]?.isCorrect ? "🎉 ¡Correcto!" : "😅 Incorrecto"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <div>
                  <h3 className="text-lg text-white mb-4">{currentQuestion.question}</h3>

                  <div className="space-y-3">
                    {currentQuestion.alternatives?.map((alternative) => {
                      const isSelected = selectedAnswer === alternative.id
                      const isCorrect = alternative.id === currentQuestion.correct_answer_id

                      return (
                        <div
                          key={alternative.id}
                          className={`p-3 rounded-lg border ${
                            isCorrect
                              ? "bg-green-900/30 border-green-500/50 text-green-200"
                              : isSelected
                                ? "bg-red-900/30 border-red-500/50 text-red-200"
                                : "bg-purple-900/20 border-purple-500/20 text-purple-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">{alternative.id.toUpperCase()})</span>
                              <span>{alternative.text}</span>
                            </div>
                            <div className="flex space-x-2">
                              {isCorrect && <span className="text-green-400">✓ Correcta</span>}
                              {isSelected && !isCorrect && <span className="text-red-400">Tu respuesta</span>}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={startGame} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    Otra Pregunta 🎯
                  </Button>
                  <Button
                    onClick={playAgain}
                    variant="outline"
                    className="border-purple-500/50 text-purple-200 hover:bg-purple-900/30 bg-transparent"
                  >
                    Volver al Menú
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
