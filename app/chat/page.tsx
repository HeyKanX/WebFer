"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Send, Heart } from "lucide-react"
import { useRouter } from "next/navigation"

interface Message {
  id: string
  user: string
  message: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/")
      return
    }
    setCurrentUser(user)

    // Cargar mensajes del localStorage
    const savedMessages = localStorage.getItem("chatMessages")
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      user: currentUser,
      message: newMessage,
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)
    localStorage.setItem("chatMessages", JSON.stringify(updatedMessages))
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  const getUserDisplayName = (user: string) => {
    return user === "fernanda" ? "Fernanda" : "Heykan"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-purple-500/30 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-2 sm:space-x-4">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            size="sm"
            className="text-purple-200 hover:text-white hover:bg-purple-900/30 text-xs sm:text-sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Volver
          </Button>
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400 animate-pulse" />
            <h1 className="text-lg sm:text-xl font-bold text-white">Chat de Amor</h1>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-3 sm:p-4 h-[calc(100vh-80px)] flex flex-col">
        <Card className="flex-1 bg-black/50 border-purple-500/30 backdrop-blur-sm flex flex-col">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-white text-center text-sm sm:text-base lg:text-lg">
              💜 Conversación Privada 💜
            </CardTitle>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 flex flex-col p-3 sm:p-6 pt-0">
            <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4 max-h-[50vh] sm:max-h-[60vh]">
              {messages.length === 0 ? (
                <div className="text-center text-purple-300 py-6 sm:py-8">
                  <Heart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-purple-400" />
                  <p className="text-sm sm:text-base">¡Comienza nuestra conversación de amor! 💕</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.user === currentUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                        msg.user === currentUser
                          ? "bg-purple-600 text-white"
                          : "bg-purple-900/50 text-purple-100 border border-purple-500/30"
                      }`}
                    >
                      <div className="text-xs opacity-70 mb-1">{getUserDisplayName(msg.user)}</div>
                      <div className="text-sm sm:text-base break-words">{msg.message}</div>
                      <div className="text-xs opacity-50 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje de amor..."
                className="flex-1 bg-purple-900/30 border-purple-500/50 text-white placeholder:text-purple-300 text-sm sm:text-base"
              />
              <Button onClick={sendMessage} className="bg-purple-600 hover:bg-purple-700 px-3 sm:px-4" size="sm">
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
