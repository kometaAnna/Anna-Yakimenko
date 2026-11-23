import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { pipelineRoot, scriptsDir } from "../lib/pipeline";

const ALLOWED = new Set([
  "ai_review.py",
  "analytics_pipeline.py",
  "anchor_plan.py",
  "brands_from_competitor.py",
  "build_minus.py",
  "cluster_gaps.py",
  "coverage_check.py",
  "dataforseo_api.py",
  "gsc_analyze.py",
  "link_risk.py",
  "semantic_core.py",
  "serp_check.py",
  "serpstat_api.py",
  "variant_dedupe.py",
]);

function runPython(
  scriptPath: string,
  args: string[],
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn("python3", [scriptPath, ...args], {
      cwd: pipelineRoot,
      env: { ...process.env, PYTHONUTF8: "1" },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ exitCode: code ?? 1, stdout, stderr });
    });
  });
}

export default defineTool({
  description: `Run a deterministic Python script from pipeline/scripts/.
Use for arithmetic, API pulls, clustering, GSC, anchors — never estimate in prose.
Script names: ${[...ALLOWED].sort().join(", ")}.
Paths in args are relative to pipeline/ (e.g. examples/gsc_current.csv).`,
  inputSchema: z.object({
    script: z.string().describe("Basename of the script, e.g. gsc_analyze.py"),
    args: z
      .array(z.string())
      .default([])
      .describe("CLI arguments after the script name"),
  }),
  effect: ({ args }) =>
    args.some((a) => a === "--dry-run" || a === "--help" || a === "-h")
      ? "read"
      : "write",
  async execute({ script, args }) {
    if (!ALLOWED.has(script)) {
      return {
        ok: false,
        error: `Unknown script. Allowed: ${[...ALLOWED].join(", ")}`,
      };
    }
    const scriptPath = path.join(scriptsDir, script);
    try {
      await access(scriptPath);
    } catch {
      return { ok: false, error: `Script not found: ${script}` };
    }
    const { exitCode, stdout, stderr } = await runPython(scriptPath, args);
    const trimmedOut = stdout.length > 80_000 ? `${stdout.slice(0, 80_000)}…` : stdout;
    const trimmedErr = stderr.length > 20_000 ? `${stderr.slice(0, 20_000)}…` : stderr;
    return {
      ok: exitCode === 0,
      exitCode,
      stdout: trimmedOut,
      stderr: trimmedErr,
    };
  },
});