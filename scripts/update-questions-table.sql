-- Agregar columna para alternativas en la tabla questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS alternatives JSONB;

-- Actualizar preguntas existentes para que tengan el nuevo formato
UPDATE questions 
SET alternatives = jsonb_build_array(
  jsonb_build_object('id', 'a', 'text', answer),
  jsonb_build_object('id', 'b', 'text', 'Opción B'),
  jsonb_build_object('id', 'c', 'text', 'Opción C')
)
WHERE alternatives IS NULL;

-- Agregar columna para la respuesta correcta (ID de la alternativa)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answer_id TEXT DEFAULT 'a';
