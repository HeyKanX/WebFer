"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, User, Heart, Trophy, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface Question {
  id: string
  question: string
  answer: string
  createdBy: string
  attempts: number
  correctGuesses: number
}

interface GameSession {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timestamp: Date
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentUser, setCurrentUser] = useState("")
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [gameMode, setGameMode] = useState<"menu" | "playing" | "results">("menu")
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [userAnswer, setUserAnswer] = useState("")
  const [gameResults, setGameResults] = useState<GameSession[]>([])
  const [newQuestion, setNewQuestion] = useState({ question: "", answer: "" })
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/")
      return
    }
    setCurrentUser(user)

    // Cargar preguntas del localStorage
    const savedQuestions = localStorage.getItem("loveQuestions")
    if (savedQuestions) {
      setQuestions(JSON.parse(savedQuestions))
    }
  }, [router])

  const addQuestion = () => {
    if (!newQuestion.question.trim() || !newQuestion.answer.trim()) return

    const question: Question = {
      id: Date.now().toString(),
      question: newQuestion.question,
      answer: newQuestion.answer,
      createdBy: currentUser,
      attempts: 0,
      correctGuesses: 0,
    }

    const updatedQuestions = [...questions, question]
    setQuestions(updatedQuestions)
    localStorage.setItem("loveQuestions", JSON.stringify(updatedQuestions))

    setNewQuestion({ question: "", answer: "" })
    setShowAddQuestion(false)
  }

  const deleteQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== questionId)
    setQuestions(updatedQuestions)
    localStorage.setItem("loveQuestions", JSON.stringify(updatedQuestions))
  }

  const startGame = () => {
    const partnerQuestions = questions.filter((q) => q.createdBy !== currentUser)
    if (partnerQuestions.length === 0) {
      alert("Tu pareja aún no ha creado preguntas para ti")
      return
    }

    const randomQuestion = partnerQuestions[Math.floor(Math.random() * partnerQuestions.length)]
    setCurrentQuestion(randomQuestion)
    setGameMode("playing")
    setUserAnswer("")
  }

  const submitAnswer = () => {
    if (!currentQuestion || !userAnswer.trim()) return

    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim()

    // Actualizar estadísticas de la pregunta
    const updatedQuestions = questions.map((q) =>
      q.id === currentQuestion.id
        ? { ...q, attempts: q.attempts + 1, correctGuesses: q.correctGuesses + (isCorrect ? 1 : 0) }
        : q,
    )
    setQuestions(updatedQuestions)
    localStorage.setItem("loveQuestions", JSON.stringify(updatedQuestions))

    // Guardar resultado del juego
    const session: GameSession = {
      questionId: currentQuestion.id,
      userAnswer,
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
    setUserAnswer("")
  }

  const getUserDisplayName = (user: string) => {
    return user === "fernanda" ? "Fernanda" : "Heykan"
  }

  const getPartnerName = () => {
    return currentUser === "fernanda" ? "Heykan" : "Fernanda"
  }

  const myQuestions = questions.filter((q) => q.createdBy === currentUser)
  const partnerQuestions = questions.filter((q) => q.createdBy !== currentUser)

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
            <Card className="w-full max-w-md bg-black/80 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Nueva Pregunta 🤔</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Escribe una pregunta sobre ti..."
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  rows={3}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300"
                />
                <Input
                  placeholder="La respuesta correcta"
                  value={newQuestion.answer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300"
                />
                <div className="flex space-x-2">
                  <Button onClick={addQuestion} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    Agregar 💜
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
              <p className="text-purple-200 text-lg">Crea preguntas sobre ti y adivina las respuestas de tu pareja</p>
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
                            <h3 className="font-bold text-white mb-2">{q.question}</h3>
                            <p className="text-purple-200 mb-2">Respuesta: {q.answer}</p>
                            <div className="text-sm text-purple-300">
                              Intentos: {q.attempts} | Aciertos: {q.correctGuesses}
                              {q.attempts > 0 && (
                                <span className="ml-2">
                                  ({Math.round((q.correctGuesses / q.attempts) * 100)}% de acierto)
                                </span>
                              )}
                            </div>
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
                  Pregunta de {getUserDisplayName(currentQuestion.createdBy)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🤔</div>
                  <h3 className="text-xl text-white mb-6">{currentQuestion.question}</h3>

                  <Input
                    placeholder="Tu respuesta..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && submitAnswer()}
                    className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300 text-center text-lg"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim()}
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

                  <div className="space-y-2">
                    <div className="p-3 bg-purple-900/30 rounded-lg">
                      <span className="text-purple-200">Tu respuesta: </span>
                      <span className="text-white font-bold">{userAnswer}</span>
                    </div>

                    <div className="p-3 bg-green-900/30 rounded-lg border border-green-500/30">
                      <span className="text-green-200">Respuesta correcta: </span>
                      <span className="text-white font-bold">{currentQuestion.answer}</span>
                    </div>
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
