"use client";

import React from "react";
import { Info, Dumbbell, Check } from '@/components/icons/lucide';

interface StepIndicatorProps {
  currentStep: "basic" | "exercises" | "review";
  canProceedToExercises: boolean;
  canProceedToReview: boolean;
  onStepClick: (step: "basic" | "exercises" | "review") => void;
}

const STEPS = [
  { key: "basic", label: "Información", icon: <Info className="w-5 h-5" /> },
  { key: "exercises", label: "Ejercicios", icon: <Dumbbell className="w-5 h-5" /> },
  { key: "review", label: "Revisar", icon: <Check className="w-5 h-5" /> },
] as Array<{
  key: "basic" | "exercises" | "review";
  label: string;
  icon: React.ReactNode;
}>;

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  canProceedToExercises,
  canProceedToReview,
  onStepClick,
}) => {
  return (
    <div className="mb-0">
      <div className="flex items-center justify-between mb-4">
        {STEPS.map((step, index) => (
          <React.Fragment key={step.key}>
            <button
              type="button"
              onClick={() => {
                if (
                  step.key === "basic" ||
                  (step.key === "exercises" && canProceedToExercises) ||
                  (step.key === "review" && canProceedToReview)
                ) {
                  onStepClick(step.key);
                }
              }}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-3 p-4 sm:p-5 rounded-xl transition-all ${
                currentStep === step.key
                  ? "bg-linear-to-r from-indigo-600 to-blue-600 text-white shadow-lg scale-105 ring-2 ring-white/20"
                  : step.key === "exercises" && !canProceedToExercises
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                    : step.key === "review" && !canProceedToReview
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              }`}
              disabled={
                (step.key === "exercises" && !canProceedToExercises) ||
                (step.key === "review" && !canProceedToReview)
              }
            >
              <span className={`text-2xl sm:text-xl ${currentStep === step.key ? 'text-white' : 'text-gray-500'}`}>{step.icon}</span>
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm font-semibold">
                  {step.label}
                </div>
                <div className="text-[10px] sm:text-xs opacity-75">
                  Paso {index + 1}
                </div>
              </div>
            </button>
            {index < 2 && (
              <div
                className={`hidden sm:block w-8 h-0.5 mx-2 ${
                  (index === 0 &&
                    (currentStep === "exercises" ||
                      currentStep === "review")) ||
                  (index === 1 && currentStep === "review")
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
