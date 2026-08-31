export type DecisionStatus = 'open' | 'resolved';

export type BeliefUpdate = {
  id: string;
  decisionId: string;
  probability: number;
  evidence: string;
  createdAt: string;
  baseline?: boolean;
};

export type Decision = {
  id: string;
  title: string;
  question: string;
  successCriteria: string;
  deadline: string;
  selectedOption: string;
  expectedValue: number;
  reversibility: number;
  probability: number;
  reversalTrigger: string;
  status: DecisionStatus;
  outcome: boolean | null;
  outcomeNote: string | null;
  outcomeMetric: string | null;
  createdAt: string;
  updatedAt: string;
  updates?: BeliefUpdate[];
};

export type DecisionInsights = {
  total: number;
  open: number;
  resolved: number;
  averageConfidence: number;
  brierScore: number | null;
  calibrationScore: number | null;
  updateRate: number;
  strongestHabit: string;
  growthEdge: string;
};
