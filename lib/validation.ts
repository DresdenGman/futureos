import { z } from 'zod';

export const createDecisionSchema = z.object({
  title: z.string().trim().min(4).max(120),
  question: z.string().trim().min(12).max(600),
  successCriteria: z.string().trim().min(8).max(500),
  deadline: z.iso.date(),
  selectedOption: z.string().trim().min(2).max(140),
  expectedValue: z.number().int().min(0).max(1_000_000_000),
  reversibility: z.number().int().min(0).max(100),
  probability: z.number().int().min(1).max(99),
  reversalTrigger: z.string().trim().min(8).max(500),
});

export const updateBeliefSchema = z.object({
  probability: z.number().int().min(1).max(99),
  evidence: z.string().trim().min(4).max(500),
});

export const resolveDecisionSchema = z.object({
  outcome: z.boolean(),
  outcomeMetric: z.string().trim().min(1).max(100),
  outcomeNote: z.string().trim().min(4).max(500),
});

export const publicEventSchema = z.object({
  eventName: z.enum(['tool_started', 'tool_completed', 'share_clicked']),
  tool: z.enum(['decision_quality', 'calibration']),
  source: z
    .enum([
      'direct',
      'producthunt',
      'hackernews',
      'reddit',
      'linkedin',
      'x',
      'lesswrong',
      'metaculus',
      'github',
      'other',
    ])
    .default('direct'),
});
