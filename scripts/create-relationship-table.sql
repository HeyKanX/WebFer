-- Crear tabla para el timer de la relación
CREATE TABLE IF NOT EXISTS relationship_timer (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE relationship_timer ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones
CREATE POLICY "Allow all operations" ON relationship_timer FOR ALL USING (true);
