"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Send, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase, type Message, formatTimePeru } from "@/lib/supabase"

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUser, setCurrentUser] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/")
      return
    }
    setCurrentUser(user)
    loadMessages()

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel("messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new as Message
        setMessages((prev) => [...prev, newMsg])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase.from("messages").select("*").order("timestamp", { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const message: Omit<Message, "id" | "created_at"> = {
      username: currentUser,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
    }

    try {
      const { error } = await supabase.from("messages").insert([message])

      if (error) throw error
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Error al enviar mensaje")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  }

  const getUserDisplayName = (user: string) => {
    return user === "fernanda" ? "Fernanda" : "Heykan"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-lg">Cargando mensajes... 💜</div>
      </div>
    )
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
                  <div
                    key={msg.id}
                    className={`flex ${msg.username === currentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                        msg.username === currentUser
                          ? "bg-purple-600 text-white"
                          : "bg-purple-900/50 text-purple-100 border border-purple-500/30"
                      }`}
                    >
                      <div className="text-xs opacity-70 mb-1">{getUserDisplayName(msg.username)}</div>
                      <div className="text-sm sm:text-base break-words">{msg.message}</div>
                      <div className="text-xs opacity-50 mt-1">{formatTimePeru(msg.timestamp)}</div>
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
