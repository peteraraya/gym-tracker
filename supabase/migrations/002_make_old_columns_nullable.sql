-- Hacer las columnas antiguas opcionales (nullable)
-- Ya que ahora usamos sets_data en lugar de sets/reps/weight

ALTER TABLE exercises 
  ALTER COLUMN sets DROP NOT NULL,
  ALTER COLUMN reps DROP NOT NULL;

-- La columna weight ya debería ser nullable, pero por si acaso:
ALTER TABLE exercises 
  ALTER COLUMN weight DROP NOT NULL;
