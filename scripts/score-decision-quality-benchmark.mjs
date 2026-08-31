import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const projectRoot = resolve(import.meta.dirname, '..');
const benchmarkPath = resolve(
  projectRoot,
  'public/research/decision-quality-benchmark-v0.1.json',
);
const defaultPredictionsPath = resolve(
  projectRoot,
  'research/decision-quality-benchmark/predictions.baseline.json',
);

const args = process.argv.slice(2);
const requirePerfect = args.includes('--require-perfect');
const predictionArg = args.find((arg) => !arg.startsWith('--'));
const predictionsPath = predictionArg
  ? resolve(process.cwd(), predictionArg)
  : defaultPredictionsPath;

const [benchmark, submission] = await Promise.all([
  readJson(benchmarkPath),
  readJson(predictionsPath),
]);

validateBenchmark(benchmark);
validateSubmission(submission);

if (submission.benchmark_version !== benchmark.version) {
  throw new Error(
    `Submission targets benchmark ${submission.benchmark_version}; expected ${benchmark.version}.`,
  );
}

const predictionMap = new Map(
  submission.predictions.map((prediction) => [prediction.id, prediction.value]),
);
const knownIds = new Set(benchmark.cases.map((testCase) => testCase.id));
const byType = new Map();
const results = [];

for (const testCase of benchmark.cases) {
  const expected = solve(testCase);
  assertAnswerKey(testCase, expected, benchmark.scoring.numeric_tolerance);

  const submitted = predictionMap.get(testCase.id);
  const correct = valuesMatch(
    submitted,
    expected,
    benchmark.scoring.numeric_tolerance,
  );

  const typeResult = byType.get(testCase.task_type) ?? {
    correct: 0,
    total: 0,
  };
  typeResult.total += 1;
  if (correct) typeResult.correct += 1;
  byType.set(testCase.task_type, typeResult);

  results.push({
    id: testCase.id,
    task_type: testCase.task_type,
    correct,
    expected,
    submitted: submitted ?? null,
  });
}

const correct = results.filter((result) => result.correct).length;
const extraIds = submission.predictions
  .map((prediction) => prediction.id)
  .filter((id) => !knownIds.has(id));
const missingIds = results
  .filter((result) => result.submitted === null)
  .map((result) => result.id);

const report = {
  benchmark: benchmark.name,
  benchmark_version: benchmark.version,
  submission: submission.name ?? predictionsPath,
  score: correct,
  maximum_score: benchmark.cases.length,
  accuracy: round(correct / benchmark.cases.length),
  by_task_type: Object.fromEntries(
    [...byType.entries()].map(([taskType, value]) => [
      taskType,
      { ...value, accuracy: round(value.correct / value.total) },
    ]),
  ),
  missing_ids: missingIds,
  extra_ids: extraIds,
  incorrect: results.filter((result) => !result.correct),
  claim_boundary: benchmark.claim_boundary,
};

console.log(JSON.stringify(report, null, 2));

if (requirePerfect && correct !== benchmark.cases.length) {
  process.exitCode = 1;
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to read JSON at ${path}: ${error.message}`);
  }
}

function validateBenchmark(value) {
  if (!value || !Array.isArray(value.cases) || value.cases.length === 0) {
    throw new Error('Benchmark must contain at least one case.');
  }
  if (value.case_count !== value.cases.length) {
    throw new Error(
      `case_count=${value.case_count} does not match ${value.cases.length} cases.`,
    );
  }
  const ids = value.cases.map((testCase) => testCase.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('Benchmark case IDs must be unique.');
  }
}

function validateSubmission(value) {
  if (!value || !Array.isArray(value.predictions)) {
    throw new Error('Submission must contain a predictions array.');
  }
  const ids = value.predictions.map((prediction) => prediction.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('Submission prediction IDs must be unique.');
  }
}

function solve(testCase) {
  switch (testCase.task_type) {
    case 'expected_utility':
      return solveExpectedUtility(testCase.inputs);
    case 'bayesian_revision':
      return solveBayesianRevision(testCase.inputs);
    case 'binary_brier_score':
      return solveBinaryBrier(testCase.inputs);
    case 'option_value':
      return solveOptionValue(testCase.inputs);
    default:
      throw new Error(`Unsupported task type: ${testCase.task_type}`);
  }
}

function solveExpectedUtility(inputs) {
  assertProbabilitiesSumToOne(inputs.states);
  const ranked = inputs.actions.map((action) => ({
    id: action.id,
    value: inputs.states.reduce(
      (sum, state) => sum + state.probability * action.utilities[state.id],
      0,
    ),
  }));
  return uniqueMaximum(ranked, 'expected utility').id;
}

function solveBayesianRevision(inputs) {
  const numerator = inputs.prior_h * inputs.likelihood_e_given_h;
  const denominator =
    numerator +
    (1 - inputs.prior_h) * inputs.likelihood_e_given_not_h;
  if (denominator === 0) {
    throw new Error('Bayesian case has zero evidence probability.');
  }
  return round(numerator / denominator, 6);
}

function solveBinaryBrier(inputs) {
  return round((inputs.probability - inputs.outcome) ** 2, 6);
}

function solveOptionValue(inputs) {
  const ranked = inputs.actions.map((action) => ({
    id: action.id,
    value:
      action.immediate_value +
      action.preserved_option_value -
      action.delay_cost,
  }));
  return uniqueMaximum(ranked, 'option value').id;
}

function uniqueMaximum(ranked, label) {
  const sorted = ranked.toSorted((a, b) => b.value - a.value);
  if (sorted.length < 2 || sorted[0].value !== sorted[1].value) {
    return sorted[0];
  }
  throw new Error(`Benchmark contains an unresolved ${label} tie.`);
}

function assertProbabilitiesSumToOne(states) {
  const total = states.reduce((sum, state) => sum + state.probability, 0);
  if (Math.abs(total - 1) > 1e-9) {
    throw new Error(`State probabilities must sum to 1; got ${total}.`);
  }
}

function assertAnswerKey(testCase, computed, tolerance) {
  if (!valuesMatch(testCase.answer.value, computed, tolerance)) {
    throw new Error(
      `Answer key mismatch for ${testCase.id}: stored=${testCase.answer.value}, computed=${computed}.`,
    );
  }
}

function valuesMatch(actual, expected, tolerance) {
  if (typeof expected === 'number') {
    return typeof actual === 'number' && Math.abs(actual - expected) <= tolerance;
  }
  return actual === expected;
}

function round(value, digits = 4) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}
