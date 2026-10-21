import type { WorkoutSession } from "@/types";

/**
 * Aggregates workout session data into meaningful progress metrics
 * for display in the Progress Dashboard
 */

export interface ProgressMetrics {
  monthlyVolume: number;           // Total volume lifted this month (kg)
  monthlyVolumeChange: number;     // Percentage change vs last month
  wilksScore: number;              // Current Wilks score
  wilksScoreChange: number;        // Percentage change vs last month
  workoutDensity: number;          // Volume per minute (kg/min)
  workoutDensityChange: number;    // Percentage change vs last month
  estimated1RMProgress: Record<string, number[]>; // Exercise ID -> [historical 1RM values]
  trainingConsistency: number;     // Workouts per week average
  strengthTrend: 'up' | 'down' | 'stable'; // Overall strength direction
}

/**
 * Calculate volume for a single session (Σ reps × weight)
 */
function calculateSessionVolume(session: WorkoutSession): number {
  return session.exercises.reduce((total, exercise) => {
    const reps = exercise.actualReps || [];
    const weights = exercise.actualWeight || [];
    
    let exerciseVolume = 0;
    reps.forEach((rep, index) => {
      exerciseVolume += rep * (weights[index] || 0);
    });
    
    return total + exerciseVolume;
  }, 0);
}

/**
 * Estimate 1RM using Epley formula (most common)
 */
function estimate1RM(weight: number, reps: number): number {
  if (reps === 0) return 0;
  if (reps === 1) return weight;
  // Epley formula: weight × (1 + reps/30)
  return weight * (1 + reps / 30);
}

/**
 * Calculate Wilks score for a session
 * Note: This is simplified - actual Wilks requires specific lifts
 */
function estimateWilksScore(session: WorkoutSession, bodyWeightKg: number = 75, isMale: boolean = true): number {
  // For simplicity, we'll use total volume as proxy for strength
  // In a real implementation, we'd need specific squat/bench/deadlift data
  const volume = calculateSessionVolume(session);
  // This is a simplified approximation - real Wilks is more complex
  return volume * (isMale ? 0.8 : 0.9) / Math.sqrt(bodyWeightKg);
}

/**
 * Get sessions within a specific date range
 */
function filterSessionsByDateRange(
  sessions: WorkoutSession[], 
  startDate: Date, 
  endDate: Date
): WorkoutSession[] {
  return sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= startDate && sessionDate <= endDate;
  });
}

/**
 * Get the first day of the month n months ago
 */
function getMonthStartDate(monthsAgo: number = 0): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get the last day of the month n months ago
 */
function getMonthEndDate(monthsAgo: number = 0): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo + 1);
  date.setDate(0); // Last day of previous month
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * Main function to calculate progress metrics from sessions
 */
export function calculateProgressMetrics(
  sessions: WorkoutSession[],
  userWeightKg: number = 75,
  userGender: 'male' | 'female' = 'male'
): ProgressMetrics {
  if (sessions.length === 0) {
    return {
      monthlyVolume: 0,
      monthlyVolumeChange: 0,
      wilksScore: 0,
      wilksScoreChange: 0,
      workoutDensity: 0,
      workoutDensityChange: 0,
      estimated1RMProgress: {},
      trainingConsistency: 0,
      strengthTrend: 'stable'
    };
  }

  // Sort sessions by date (oldest first)
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Current month data
  const currentMonthStart = getMonthStartDate(0);
  const currentMonthEnd = getMonthEndDate(0);
  const currentMonthSessions = filterSessionsByDateRange(
    sortedSessions, 
    currentMonthStart, 
    currentMonthEnd
  );

  // Previous month data for comparison
  const prevMonthStart = getMonthStartDate(1);
  const prevMonthEnd = getMonthEndDate(1);
  const prevMonthSessions = filterSessionsByDateRange(
    sortedSessions, 
    prevMonthStart, 
    prevMonthEnd
  );

  // Calculate monthly volume
  const monthlyVolume = currentMonthSessions.reduce(
    (total, session) => total + calculateSessionVolume(session), 
    0
  );

  const prevMonthVolume = prevMonthSessions.reduce(
    (total, session) => total + calculateSessionVolume(session), 
    0
  );

  const monthlyVolumeChange = prevMonthVolume === 0 
    ? (monthlyVolume > 0 ? 100 : 0) 
    : ((monthlyVolume - prevMonthVolume) / prevMonthVolume) * 100;

  // Calculate Wilks score (using most recent session)
  const mostRecentSession = sortedSessions[sortedSessions.length - 1];
  const currentWilks = estimateWilksScore(mostRecentSession, userWeightKg, userGender === 'male');
  
  // Previous month Wilks (most recent session from last month)
  const prevMonthMostRecent = prevMonthSessions[prevMonthSessions.length - 1] || null;
  const prevWilks = prevMonthMostRecent 
    ? estimateWilksScore(prevMonthMostRecent, userWeightKg, userGender === 'male') 
    : 0;

  const wilksScoreChange = prevWilks === 0 
    ? (currentWilks > 0 ? 100 : 0) 
    : ((currentWilks - prevWilks) / prevWilks) * 100;

  // Calculate workout density (volume per minute)
  const totalDurationMinutes = currentMonthSessions.reduce(
    (total, session) => total + (session.totalDuration || 0) / 60, 
    0
  );
  
  const workoutDensity = totalDurationMinutes > 0 
    ? monthlyVolume / totalDurationMinutes 
    : 0;

  const prevTotalDurationMinutes = prevMonthSessions.reduce(
    (total, session) => total + (session.totalDuration || 0) / 60, 
    0
  );
  
  const prevWorkoutDensity = prevTotalDurationMinutes > 0 
    ? prevMonthVolume / prevTotalDurationMinutes 
    : 0;

  const workoutDensityChange = prevWorkoutDensity === 0 
    ? (workoutDensity > 0 ? 100 : 0) 
    : ((workoutDensity - prevWorkoutDensity) / prevWorkoutDensity) * 100;

  // Calculate estimated 1RM progress by exercise
  const estimated1RMProgress: Record<string, number[]> = {};
  
  sortedSessions.forEach(session => {
    session.exercises.forEach(exercise => {
      if (!exercise.actualReps || !exercise.actualWeight) return;
      
      // Find max weight lifted in this session for this exercise
      let maxWeightLifted = 0;
      let maxRepsAtMaxWeight = 0;
      
      exercise.actualReps.forEach((reps, index) => {
        const weight = exercise.actualWeight[index] || 0;
        const volume = reps * weight;
        if (volume > maxWeightLifted) {
          maxWeightLifted = volume;
          maxRepsAtMaxWeight = reps;
        }
      });
      
      // Estimate 1RM from the heaviest set
      if (maxWeightLifted > 0 && maxRepsAtMaxWeight > 0) {
        const estimated1RM = estimate1RM(
          Math.sqrt(maxWeightLifted / maxRepsAtMaxWeight), // Approximate weight
          maxRepsAtMaxWeight
        );
        
        if (!estimated1RMProgress[exercise.exerciseId]) {
          estimated1RMProgress[exercise.exerciseId] = [];
        }
        estimated1RMProgress[exercise.exerciseId].push(estimated1RM);
      }
    });
  });

  // Calculate training consistency (workouts per week)
  const dateRange = new Date().getTime() - new Date(sortedSessions[0].date).getTime();
  const weeksElapsed = Math.max(dateRange / (1000 * 60 * 60 * 24 * 7), 1);
  const trainingConsistency = sortedSessions.length / weeksElapsed;

  // Determine strength trend (comparing last 4 weeks vs previous 4 weeks)
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  
  const recentSessions = sortedSessions.filter(
    session => new Date(session.date) >= eightWeeksAgo
  );
  
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  const lastFourWeeks = recentSessions.filter(
    session => new Date(session.date) >= fourWeeksAgo
  );
  
  const prevFourWeeks = recentSessions.filter(
    session => new Date(session.date) < fourWeeksAgo
  );

  const recentVolume = lastFourWeeks.reduce(
    (total, session) => total + calculateSessionVolume(session), 
    0
  );
  
  const prevVolume = prevFourWeeks.reduce(
    (total, session) => total + calculateSessionVolume(session), 
    0
  );

  let strengthTrend: 'up' | 'down' | 'stable' = 'stable';
  if (prevVolume > 0) {
    const change = ((recentVolume - prevVolume) / prevVolume) * 100;
    if (change > 5) strengthTrend = 'up';
    else if (change < -5) strengthTrend = 'down';
  }

  return {
    monthlyVolume,
    monthlyVolumeChange: Number(monthlyVolumeChange.toFixed(1)),
    wilksScore: Number(currentWilks.toFixed(1)),
    wilksScoreChange: Number(wilksScoreChange.toFixed(1)),
    workoutDensity: Number(workoutDensity.toFixed(1)),
    workoutDensityChange: Number(workoutDensityChange.toFixed(1)),
    estimated1RMProgress,
    trainingConsistency: Number(trainingConsistency.toFixed(2)),
    strengthTrend
  };
}

export default {
  calculateProgressMetrics,
  calculateSessionVolume,
  estimate1RM,
  estimateWilksScore
};