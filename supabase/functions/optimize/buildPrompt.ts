import { SqlStructure } from './parseSql.ts';
import { DetectedPattern } from './detectPatterns.ts';

interface PromptInput {
  query: string;
  db: string;
  structure: SqlStructure;
  patterns: DetectedPattern[];
  schema?: string;
  executionPlan?: string;
}

export function buildPrompt(input: PromptInput): string {
  const { query, db, structure, patterns, schema, executionPlan } = input;

  let prompt = `You are an AI SQL Query Advisor.
You analyze query structure, detect logical performance issues,
and propose safer rewrites (CTE decomposition, DISTINCT fixes,
index recommendations, avoiding join explosion).

Database engine: ${db}

Here is the SQL query:
${query}

Here is the extracted structure:
${JSON.stringify(structure, null, 2)}

Here are the detected patterns:
${JSON.stringify(patterns, null, 2)}`;

  if (schema) {
    prompt += `

Table Schema (provided by user):
${schema}

Use this schema information to provide more accurate index recommendations and query optimizations.`;
  }

  if (executionPlan) {
    prompt += `

Execution Plan (EXPLAIN output):
${executionPlan}

Analyze this execution plan to identify performance bottlenecks, missing indexes, and inefficient operations.`;
  }

  prompt += `

Return VALID JSON with this structure:
{
  "analysis": "... detailed explanation of the query structure and issues ...",
  "warnings": ["...", "...", "..."],
  "rewrittenQuery": "... safer rewritten SQL query ...",
  "recommendedIndexes": "... CREATE INDEX statements or index recommendations ...",
  "notes": "... additional notes, best practices, or recommendations ..."
}

Focus on:
- JOIN explosion and row multiplication
- COUNT(*) overcounting due to JOINs
- Missing DISTINCT in aggregations with multiple JOINs
- Incorrect or missing GROUP BY clauses
- Non-sargable filters (LIKE %, OR conditions, LOWER()/UPPER())
- WordPress meta_query patterns (wp_postmeta JOINs)
- Proper aggregation placement
- Safer query rewrites using CTEs, correlated subqueries, or derived tables
- Index recommendations based on WHERE, JOIN, and ORDER BY clauses

If the query is already well-optimized, explain why and provide minimal suggestions.
Keep the rewritten query executable and maintain the original semantics.`;
}
