import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to match frontend format
    const formattedProfile = profile ? {
      id: profile.id,
      userId: profile.user_id,
      age: profile.age,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      fitnessGoal: profile.fitness_goal,
      fitnessLevel: profile.fitness_level,
      weeklyWorkouts: profile.weekly_workouts,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    } : null

    return NextResponse.json(formattedProfile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { age, gender, height, weight, fitnessGoal, fitnessLevel, weeklyWorkouts } = body

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    let result

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          age,
          gender,
          height,
          weight,
          fitness_goal: fitnessGoal,
          fitness_level: fitnessLevel,
          weekly_workouts: weeklyWorkouts,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      result = data
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          age,
          gender,
          height,
          weight,
          fitness_goal: fitnessGoal,
          fitness_level: fitnessLevel,
          weekly_workouts: weeklyWorkouts
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json({ 
      success: true,
      profile: {
        id: result.id,
        userId: result.user_id,
        age: result.age,
        gender: result.gender,
        height: result.height,
        weight: result.weight,
        fitnessGoal: result.fitness_goal,
        fitnessLevel: result.fitness_level,
        weeklyWorkouts: result.weekly_workouts,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      }
    })
  } catch (error) {
    console.error('Error saving profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
