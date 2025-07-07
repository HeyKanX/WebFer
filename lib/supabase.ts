import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Función para formatear fechas en zona horaria de Perú
export const formatDatePeru = (dateString: string, includeTime = true) => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/Lima", // Zona horaria de Perú
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  }
  return date.toLocaleString("es-PE", options)
}

export const formatTimePeru = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString("es-PE", {
    timeZone: "America/Lima",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export const formatDateOnlyPeru = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-PE", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Tipos para la base de datos
export interface Message {
  id: string
  username: string
  message: string
  timestamp: string
  created_at?: string
}

export interface Note {
  id: string
  from_user: string
  to_user: string
  title: string
  content: string
  read: boolean
  timestamp: string
  created_at?: string
}

export interface MoodEntry {
  id: string
  username: string
  mood: string
  note: string
  date: string
  timestamp: string
  created_at?: string
}

export interface WishItem {
  id: string
  title: string
  description: string
  category: string
  priority: string
  completed: boolean
  created_by: string
  completed_date?: string
  timestamp: string
  created_at?: string
}

export interface Event {
  id: string
  title: string
  description: string
  date: string
  type: string
  created_by: string
  timestamp: string
  created_at?: string
}

export interface QuestionAlternative {
  id: string
  text: string
}

export interface Question {
  id: string
  question: string
  answer: string // Mantener para compatibilidad
  alternatives: QuestionAlternative[]
  correct_answer_id: string
  created_by: string
  attempts: number
  correct_guesses: number
  timestamp: string
  created_at?: string
}

export interface Photo {
  id: string
  url: string
  title: string
  note: string
  uploaded_by: string
  timestamp: string
  created_at?: string
}

export interface RelationshipTimer {
  id: string
  username: string
  start_date: string
  timestamp: string
  created_at?: string
}
