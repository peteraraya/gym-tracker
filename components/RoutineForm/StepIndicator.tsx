"use client";

import React from "react";

interface StepIndicatorProps {
  currentStep: "basic" | "exercises" | "review";
  canProceedToExercises: boolean;
  canProceedToReview: boolean;
  onStepClick: (step: "basic" | "exercises" | "review") => void;
}

const STEPS = [
  { key: "basic", label: "Información", icon: "📝" },
  { key: "exercises", label: "Ejercicios", icon: "💪" },
  { key: "review", label: "Revisar", icon: "✓" },
] as Array<{
  key: "basic" | "exercises" | "review";
  label: string;
  icon: string;
}>;

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  canProceedToExercises,
  canProceedToReview,
  onStepClick,
}) => {
  return (
    <div className="mb-6 sm:mb-8">
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
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 p-3 sm:p-4 rounded-xl transition-all ${
                currentStep === step.key
                  ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
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
              <span className="text-2xl sm:text-xl">{step.icon}</span>
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
