// Runs every problem solution and lesson example against its dataset to catch broken SQL.
// Every statement runs inside BEGIN ... ROLLBACK, so INSERT/UPDATE/DELETE examples don't
// affect the checks that follow.
import { PGlite } from "@electric-sql/pglite";
import { datasets } from "../src/lib/datasets";
import { problems } from "../src/lib/content/problems";
import { lessons } from "../src/lib/content/lessons";

type Rows = unknown[][];

async function main() {
  const dbs = new Map<string, PGlite>();
  for (const d of Object.values(datasets)) {
    const db = new PGlite();
    await db.exec(d.sql);
    dbs.set(d.id, db);
  }

  async function isolated(dataset: string, sql: string, check?: string): Promise<Rows> {
    const db = dbs.get(dataset)!;
    await db.exec("BEGIN");
    try {
      const res = await db.exec(sql, { rowMode: "array" });
      if (check) {
        // Same as the app's worker: checks may be several statements; the last SELECT counts.
        const results = await db.exec(check, { rowMode: "array" });
        return ([...results].reverse().find((r) => r.fields.length > 0)?.rows ?? []) as Rows;
      }
      return res[res.length - 1].rows as Rows;
    } finally {
      await db.exec("ROLLBACK");
    }
  }

  let failed = 0;
  const fail = (msg: string) => {
    failed++;
    console.log(`ERR ${msg}`);
  };

  for (const p of problems) {
    try {
      const rows = await isolated(p.dataset, p.solution, p.check);
      if (p.check) {
        // The solution must change what the check sees, or the problem can't tell right from wrong.
        // Behavior checks (e.g. INSERTs into a table that doesn't exist yet) may fail before the
        // solution runs. That still counts as a different result.
        const before = await isolated(p.dataset, "SELECT 1", p.check).catch(() => null);
        if (JSON.stringify(before) === JSON.stringify(rows)) fail(`problem ${p.slug}: solution doesn't change the check result`);
        else console.log(`ok  ${p.topic.padEnd(16)} ${p.difficulty.padEnd(6)} ${p.slug} (check: ${before ? before.length : "error"} → ${rows.length} rows)`);
      } else {
        console.log(`ok  ${p.topic.padEnd(16)} ${p.difficulty.padEnd(6)} ${p.slug} (${rows.length} rows)`);
      }
    } catch (e) {
      fail(`problem ${p.slug}: ${(e as Error).message}`);
    }
  }

  for (const l of lessons) {
    try {
      await isolated(l.dataset, l.tryIt);
    } catch (e) {
      fail(`lesson ${l.slug} tryIt: ${(e as Error).message}`);
    }
    // A lesson's examples build on each other (e.g. CREATE TABLE, then a table referencing it),
    // so they run in order, inside one transaction.
    const examples = l.body.flatMap((b) => (b.type === "code" ? [b.sql] : []));
    const db = dbs.get(l.dataset)!;
    await db.exec("BEGIN");
    try {
      for (const [i, sql] of examples.entries()) {
        try {
          await db.exec(sql);
        } catch (e) {
          fail(`lesson ${l.slug} example #${i + 1}: ${(e as Error).message}`);
          break;
        }
      }
    } finally {
      await db.exec("ROLLBACK");
    }
  }

  console.log(`\nLesson order: ${lessons.map((l) => l.slug).join(" → ")}`);
  console.log(failed ? `${failed} failure(s)` : `All content SQL runs (${problems.length} problems, ${lessons.length} lessons).`);
  process.exit(failed ? 1 : 0);
}
main();
