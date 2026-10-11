// AI hints: explains what's wrong with a student's query without giving away the answer.
// Uses Groq. Needs GROQ_API_KEY on the server. Without it, GET reports { enabled: false } and
// the "Ask AI" button is hidden.
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { connection } from "next/server";
import { problemBySlug } from "@/lib/content/problems";
import { datasets } from "@/lib/datasets";

// openai/gpt-oss-120b is Groq's flagship production model (fast and cheap). Override with
// GROQ_MODEL, e.g. "llama-3.3-70b-versatile". See https://console.groq.com/docs/models
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
// Reasoning models take reasoning settings; other models reject them.
const IS_REASONING_MODEL = MODEL.startsWith("openai/gpt-oss");
const MAX_QUERY_CHARS = 4000;
const MAX_FEEDBACK_CHARS = 2500;

// Simple per-account limit so a public deployment can't run up the API bill.
const RATE_LIMIT = 8; // requests
const RATE_WINDOW_MS = 60_000;
const recent = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  recent.set(key, hits);
  return hits.length > RATE_LIMIT;
}

const SYSTEM_PROMPT = `You are a friendly, encouraging SQL tutor on a PostgreSQL practice website for beginners.
A student is working on a practice problem and asked for a hint. You'll see the problem, the database schema, the official solution (for your reference only), the student's current query, and what happened when it ran.

Write ONE short hint, 2 to 4 sentences, that helps the student find the problem themselves:
- Point at the specific part of their query that is wrong or missing, and name the SQL concept or keyword that fixes it.
- Never write out the full corrected query, and never reveal the official solution. You may quote a small fragment of the student's own query.
- If their query has an error, explain in plain words what the error means.
- Only suggest a direction that leads to the correct result. Don't suggest a quick fix that silences an error but gives wrong rows (for example, adding columns to GROUP BY when the problem needs one row per group). Use the official solution to judge which approach works.
- If the query looks correct already, say so and suggest what might differ (row order, extra columns, rounding).
- Plain text only. You may use \`backticks\` for SQL keywords, column or table names. No headings or lists.`;

/** Only the CREATE TABLE statements: enough for the model to know the tables and columns. */
function schemaOf(sql: string) {
  return sql.slice(0, sql.indexOf("INSERT INTO")).trim();
}

let client: Groq | null = null;
function getClient() {
  client ??= new Groq(); // reads GROQ_API_KEY
  return client;
}

export async function GET() {
  await connection(); // decide per request, not at build time
  return Response.json({ enabled: Boolean(process.env.GROQ_API_KEY) });
}

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json({ error: "AI hints aren't set up on this server." }, { status: 503 });
  }
  // Only signed-in users can spend the Groq quota.
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Sign in to ask the AI tutor." }, { status: 401 });
  }

  // Per account, so classmates sharing one network don't use up each other's limit.
  if (rateLimited(userId)) {
    return Response.json({ error: "You're asking for hints very quickly. Take a breath and try again in a minute!" }, { status: 429 });
  }

  let body: { slug?: unknown; query?: unknown; feedback?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const problem = typeof body.slug === "string" ? problemBySlug.get(body.slug) : undefined;
  if (!problem || typeof body.query !== "string") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const query = body.query.slice(0, MAX_QUERY_CHARS).trim();
  const feedback = typeof body.feedback === "string" ? body.feedback.slice(0, MAX_FEEDBACK_CHARS) : "";
  const onlyComments = query.split("\n").every((line) => !line.trim() || line.trim().startsWith("--"));
  if (onlyComments) {
    return Response.json({ error: "Write a query first, then ask for a hint about it." }, { status: 400 });
  }

  const prompt = `## Problem: ${problem.title} (${problem.difficulty}, topic: ${problem.topic})
${problem.description}
${problem.check ? "\nThis problem is graded by the state of the data after the statement runs, using this check query:\n" + problem.check + "\n" : ""}
## Database schema (${datasets[problem.dataset].name})
${schemaOf(datasets[problem.dataset].sql)}

## Official solution (for your reference only. Do NOT reveal it.)
${problem.solution}

## Student's current query
${query}

## What happened when it ran
${feedback || "The student hasn't run it yet."}`;

  try {
    const completion = await getClient().chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      // Room for the model's (hidden) reasoning plus a short hint.
      max_completion_tokens: 4000,
      ...(IS_REASONING_MODEL
        ? // A hint is a short, focused answer: low effort keeps it fast; only the final answer is returned.
          { reasoning_effort: "low" as const, include_reasoning: false }
        : { temperature: 0.4 }),
    });

    const choice = completion.choices[0];
    const hint = choice?.message.content?.trim();
    if (!hint) {
      const reason = choice?.finish_reason === "length" ? " (it ran out of space)" : "";
      return Response.json({ error: `The AI returned an empty hint${reason}. Please try again.` }, { status: 502 });
    }
    return Response.json({ hint });
  } catch (error) {
    if (error instanceof Groq.RateLimitError) {
      return Response.json({ error: "The AI is busy right now. Please try again in a moment." }, { status: 503 });
    }
    if (error instanceof Groq.AuthenticationError) {
      console.error("AI hint: invalid GROQ_API_KEY");
      return Response.json({ error: "AI hints are misconfigured on this server." }, { status: 503 });
    }
    if (error instanceof Groq.NotFoundError || error instanceof Groq.BadRequestError) {
      console.error(`AI hint: request rejected for model "${MODEL}"`, error.message);
      return Response.json({ error: "AI hints are misconfigured on this server." }, { status: 503 });
    }
    if (error instanceof Groq.APIError) {
      console.error(`AI hint: API error ${error.status}`, error.message);
      return Response.json({ error: "The AI hint service had a problem. Please try again." }, { status: 502 });
    }
    console.error("AI hint failed", error);
    return Response.json({ error: "Couldn't reach the AI hint service." }, { status: 502 });
  }
}
