import { generateObject } from "ai"
import { getModel } from "@/lib/ai/client"
import {
  structuredQuestionSchema,
  type StructuredQuestion,
} from "./schema"

const SYSTEM_PROMPT = `You are a rigorous forecast question editor for FutureOS, an AI-powered probabilistic forecasting platform.

Your job: Transform vague questions about the future into precise, verifiable, binary (yes/no) forecast questions.

CRITICAL RULES:
1. Output must be a BINARY (yes/no) question that can be clearly resolved.
2. The question must have a specific time bound. If the user doesn't provide one, suggest a reasonable deadline.
3. Resolution criteria MUST be specific about what evidence would confirm "yes" and what would confirm "no".
4. Do NOT predict the outcome. Do NOT give probabilities.
5. Do NOT search for or reference external evidence or facts.
6. Do NOT expand beyond the user's core intent.
7. Do NOT create questions that are impossible to verify (e.g., subjective opinions, unmeasurable concepts).
8. For questions that cannot be made forecastable, set isForecastable to false and explain why.
9. For forecastable questions that need more detail, list requiredClarifications.
10. deadlineSuggestion should be a clear date or time range (e.g., "2027-06-13", "within 3 months").

EXAMPLES:

Bad input: "Will Bitcoin go up?"
Good structuredQuestion: "Will the price of Bitcoin exceed $100,000 USD at any point before December 31, 2026?"

Bad input: "Will AI become amazing?"
▶ isForecastable: false, notForecastableReason: "'Amazing' is subjective and cannot be verified. Consider a specific measurable event."

Bad input: "Will the world change?"
▶ isForecastable: false, notForecastableReason: "Too vague. Specify what type of change (political, economic, technological) and a measurable indicator."

Remember: You are an editor, not a fortune teller. Your output must be precise, verifiable, and structured. Always output valid JSON.`

export async function structureQuestion(input: {
  originalQuestion: string
  domain: string
}): Promise<StructuredQuestion> {
  const prompt = `Domain: ${input.domain}

User's original question:
"${input.originalQuestion}"

Please structure this into a verifiable forecast question.

Output a JSON object with these exact fields:
- "structuredQuestion" (string): A verifiable yes/no question with time bound
- "forecastType" (string): Always "BINARY"
- "deadlineSuggestion" (string): Suggested resolution date
- "resolutionCriteria" (string): Verifiable criteria for YES/NO
- "requiredClarifications" (string[]): Questions to make this more precise
- "isForecastable" (boolean): true if the question can be verified
- "notForecastableReason" (string, optional): Explain why not forecastable if false`

  const { object } = await generateObject({
    model: getModel(),
    output: "no-schema",
    system: SYSTEM_PROMPT,
    prompt,
    temperature: 0.3,
  })

  const parsed = structuredQuestionSchema.safeParse(object)
  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")
    throw new Error(`AI returned invalid structure: ${errors}`)
  }

  return parsed.data
}