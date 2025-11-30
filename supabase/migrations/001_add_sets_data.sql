-- Migration: Add sets_data column and migrate existing data
-- Date: 2025-11-30
-- Description: Migrates from separate sets/reps/weight columns to a JSONB sets_data column

-- Step 1: Add new column for sets data
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS sets_data JSONB;

-- Step 2: Add equipment column if it doesn't exist
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS equipment TEXT;

-- Step 3: Migrate existing data to new format
DO $$
DECLARE
  exercise_record RECORD;
  sets_array JSONB;
BEGIN
  FOR exercise_record IN 
    SELECT id, sets, reps, weight 
    FROM public.exercises 
    WHERE sets_data IS NULL AND sets IS NOT NULL AND reps IS NOT NULL
  LOOP
    -- Build array of sets with the same reps/weight for each
    SELECT jsonb_agg(
      jsonb_build_object(
        'reps', exercise_record.reps,
        'weight', COALESCE(exercise_record.weight, 0)
      )
    ) INTO sets_array
    FROM generate_series(1, exercise_record.sets);
    
    -- Update the exercise with the new sets_data
    UPDATE public.exercises
    SET sets_data = sets_array
    WHERE id = exercise_record.id;
  END LOOP;
END $$;

-- Step 4: Make sets_data NOT NULL after migration
-- (Commented out - run this after verifying migration succeeded)
-- ALTER TABLE public.exercises 
-- ALTER COLUMN sets_data SET NOT NULL;

-- Step 5 (Optional): Remove old columns after verifying migration
-- (Commented out - keep old columns for backward compatibility initially)
-- ALTER TABLE public.exercises DROP COLUMN IF EXISTS sets;
-- ALTER TABLE public.exercises DROP COLUMN IF EXISTS reps;
-- ALTER TABLE public.exercises DROP COLUMN IF EXISTS weight;

-- Verification query - check migration results
-- SELECT 
--   id,
--   name,
--   sets as old_sets,
--   reps as old_reps,
--   weight as old_weight,
--   sets_data as new_sets_data
-- FROM public.exercises
-- LIMIT 10;
