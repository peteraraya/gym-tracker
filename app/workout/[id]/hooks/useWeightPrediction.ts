import { useEffect, useState } from 'react';
import { predictWeight, validateWeight } from '../utils/weightPrediction';
import { generateWeightSuggestion } from '@/lib/weightSuggestions';

interface UseWeightPredictionProps {
  currentExercise: any;
  currentSet: number;
  sessions: any[];
  actualWeights: Record<string, number[]>;
  isInitialized: boolean;
}

export function useWeightPrediction({
  currentExercise,
  currentSet,
  sessions,
  actualWeights,
  isInitialized
}: UseWeightPredictionProps) {
  const [weightSuggestion, setWeightSuggestion] = useState<any>(null);
  const [dismissedWeightSuggestion, setDismissedWeightSuggestion] = useState(false);
  
  // Reset dismissed state when exercise changes
  useEffect(() => {
    setDismissedWeightSuggestion(false);
  }, [currentExercise?.id]);
  
  // Generate weight suggestions
  useEffect(() => {
    if (!currentExercise || sessions.length === 0) {
      setWeightSuggestion(null);
      return;
    }

    const suggestion = generateWeightSuggestion(
      currentExercise.name,
      sessions,
      currentExercise.sets[currentSet - 1]?.reps || 10
    );

    setWeightSuggestion(suggestion);
  }, [currentExercise, currentSet, sessions]);
  
  // Predict weight for current set
  const predictWeightForSet = (currentWeight: number): { weight: number; reasoning?: string } => {
    if (!currentExercise || !isInitialized) {
      return { weight: currentWeight };
    }
    
    const exerciseId = currentExercise.id;
    const setIndex = currentSet - 1;
    
    // Skip if user has already edited this set
    const hasEditedValue = actualWeights[exerciseId]?.[setIndex];
    if (hasEditedValue !== undefined && hasEditedValue !== 0) {
      return { weight: currentWeight };
    }
    
    // Predict weight
    const prediction = predictWeight({
      exerciseName: currentExercise.name,
      currentSet,
      sessions,
      currentExercise,
      actualWeights,
      exerciseId
    });
    
    const validatedWeight = validateWeight(prediction.predictedWeight);
    
    return {
      weight: validatedWeight,
      reasoning: prediction.confidence === 'high' && prediction.source !== 'routine_default' 
        ? prediction.reasoning 
        : undefined
    };
  };
  
  return {
    weightSuggestion: dismissedWeightSuggestion ? null : weightSuggestion,
    dismissedWeightSuggestion,
    setDismissedWeightSuggestion,
    predictWeightForSet
  };
}
