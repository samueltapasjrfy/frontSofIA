"use client"

interface Step {
  id: string
  name: string
  status: "wait" | "process" | "finish" | "error"
}

const STEP_STATUS_COLOR = {
  wait: "bg-gray-200",
  process: "bg-[#0146cf]",
  finish: "bg-[#0d6efd]",
  error: "bg-red-500",
}

const STEP_STATUS_TEXT_COLOR = {
  wait: "text-gray-500",
  process: "text-gray-500",
  finish: "text-white",
  error: "text-gray-500",
}

const STEP_STATUS_BORDER_COLOR = {
  wait: "#e5e7eb",
  process: "#A1A1A1",
  finish: "#0d6efd",
  error: "#ef4444",
}

interface ModalImportFormStepperProps {
  steps: Step[]
  currentStep: string
}

export function ModalImportFormStepper({ steps, currentStep }: ModalImportFormStepperProps) {
  return (
    <div className="relative mt-6">
      <div className="absolute left-0 top-2/4 h-[1px] w-full -translate-y-2/4 bg-gray-200" />
      <div className="relative z-10 flex justify-between">
        {steps.map((step, index) => {
          const isCurrent = currentStep === step.id
          const isCompleted = step.status === "finish"

          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isCurrent || isCompleted ? STEP_STATUS_COLOR.finish : STEP_STATUS_COLOR.wait
                }`}
                style={{
                  border: `1px solid ${STEP_STATUS_BORDER_COLOR[step.status] }`,
                }}
              >
                <span className={`text-sm font-medium ${STEP_STATUS_TEXT_COLOR[step.status]}`}>
                  {step.status === "finish" ? "✓" : index + 1}
                </span>
              </div>
              <span className="text-sm font-medium">{step.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
} 