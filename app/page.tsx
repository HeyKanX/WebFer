"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, MessageCircle, StickyNote, Calendar, Timer, User, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [currentUser, setCurrentUser] = useState("")
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      setIsLoggedIn(true)
      setCurrentUser(user)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Credenciales personalizadas
    const validUsers = {
      fernanda: "fer07",
      heykan: "heykan07",
    }

    if (validUsers[username as keyof typeof validUsers] === password) {
      localStorage.setItem("currentUser", username)
      setCurrentUser(username)
      setIsLoggedIn(true)
    } else {
      alert("Credenciales incorrectas")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    setIsLoggedIn(false)
    setCurrentUser("")
  }

  const getUserDisplayName = (user: string) => {
    return user === "fernanda" ? "Fernanda" : "Heykan"
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-sm sm:max-w-md bg-black/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400 animate-pulse" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-white">Nuestro Espacio ❤️</CardTitle>
            <CardDescription className="text-purple-200 text-sm sm:text-base">
              Un lugar especial solo para nosotros dos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Usuario (fernanda o heykan)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300 text-sm sm:text-base"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300 text-sm sm:text-base"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base py-2 sm:py-3"
              >
                Entrar a nuestro mundo 💜
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-500/30 p-3 sm:p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Nuestro Amor</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-purple-200 text-xs sm:text-sm lg:text-base hidden sm:inline">
              Hola, {getUserDisplayName(currentUser)} 💕
            </span>
            <span className="text-purple-200 text-xs sm:hidden">{getUserDisplayName(currentUser)} 💕</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-purple-500/50 text-purple-200 hover:bg-purple-900/30 bg-transparent text-xs sm:text-sm"
            >
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        {/* Welcome Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">
            Bienvenid@ a nuestro espacio especial ✨
          </h2>
          <p className="text-purple-200 text-sm sm:text-base lg:text-lg px-4">
            Aquí guardamos todos nuestros momentos, recuerdos y amor
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Chat */}
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:bg-black/60 transition-all cursor-pointer group">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 group-hover:scale-110 transition-transform" />
                <div>
                  <CardTitle className="text-white text-sm sm:text-base lg:text-lg">Chat de Amor</CardTitle>
                  <CardDescription className="text-purple-200 text-xs sm:text-sm">
                    Conversemos en tiempo real
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-purple-300 text-xs sm:text-sm mb-4">
                Nuestro chat privado para hablar cuando queramos
              </p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                onClick={() => router.push("/chat")}
              >
                Abrir Chat 💬
              </Button>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:bg-black/60 transition-all cursor-pointer group">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <StickyNote className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 group-hover:scale-110 transition-transform" />
                <div>
                  <CardTitle className="text-white text-sm sm:text-base lg:text-lg">Notas de Amor</CardTitle>
                  <CardDescription className="text-purple-200 text-xs sm:text-sm">
                    Dejémonos mensajes dulces
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-purple-300 text-xs sm:text-sm mb-4">
                Sorprende con notas especiales que aparecerán al iniciar sesión
              </p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                onClick={() => router.push("/notes")}
              >
                Ver Notas 💌
              </Button>
            </CardContent>
          </Card>

          {/* Know Me More */}
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:bg-black/60 transition-all cursor-pointer group">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 group-hover:scale-110 transition-transform" />
                <div>
                  <CardTitle className="text-white text-sm sm:text-base lg:text-lg">Conóceme Más</CardTitle>
                  <CardDescription className="text-purple-200 text-xs sm:text-sm">
                    Juego de preguntas y respuestas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-purple-300 text-xs sm:text-sm mb-4">
                Descubre qué tanto nos conocemos con preguntas divertidas
              </p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                onClick={() => router.push("/quiz")}
              >
                Jugar 🎯
              </Button>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:bg-black/60 transition-all cursor-pointer group">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 group-hover:scale-110 transition-transform" />
                <div>
                  <CardTitle className="text-white text-sm sm:text-base lg:text-lg">Calendario del Amor</CardTitle>
                  <CardDescription className="text-purple-200 text-xs sm:text-sm">Fechas importantes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-purple-300 text-xs sm:text-sm mb-4">
                Aniversarios, citas especiales y momentos que no queremos olvidar
              </p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                onClick={() => router.push("/calendar")}
              >
                Ver Calendario 📅
              </Button>
            </CardContent>
          </Card>

          {/* Timer */}
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:bg-black/60 transition-all cursor-pointer group">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <Timer className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 group-hover:scale-110 transition-transform" />
                <div>
                  <CardTitle className="text-white text-sm sm:text-base lg:text-lg">Tiempo Juntos</CardTitle>
                  <CardDescription className="text-purple-200 text-xs sm:text-sm">
                    Contador de nuestra relación
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-purple-300 text-xs sm:text-sm mb-4">
                Cuánto tiempo llevamos creando momentos hermosos juntos
              </p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                onClick={() => router.push("/timer")}
              >
                Ver Tiempo ⏰
              </Button>
            </CardContent>
          </Card>

          {/* Mood Tracker */}
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:bg-black/60 transition-all cursor-pointer group">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 group-hover:scale-110 transition-transform" />
                <div>
                  <CardTitle className="text-white text-sm sm:text-base lg:text-lg">Estado de Ánimo</CardTitle>
                  <CardDescription className="text-purple-200 text-xs sm:text-sm">
                    Cómo nos sentimos hoy
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-purple-300 text-xs sm:text-sm mb-4">Registra cómo te sientes cada día y compártelo</p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                onClick={() => router.push("/mood")}
              >
                Registrar Ánimo 😊
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Extra Features */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* Wishlist */}
          <Card className="bg-black/50 border-purple-500/30 backdrop-blur-sm hover:bg-black/60 transition-all cursor-pointer group">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400 group-hover:scale-110 transition-transform" />
                <div>
                  <CardTitle className="text-white text-sm sm:text-base lg:text-lg">Lista de Deseos</CardTitle>
                  <CardDescription className="text-purple-200 text-xs sm:text-sm">
                    Cosas que queremos hacer juntos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <p className="text-purple-300 text-xs sm:text-sm mb-4">Planes, sueños y aventuras que queremos vivir</p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                onClick={() => router.push("/wishlist")}
              >
                Ver Deseos ⭐
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
