import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { agentRoot, clientsDir, skillsDir } from "../lib/pipeline";

const MARKER = "## Уроки приймань";

export default defineTool({
  description: `Persist team-lead feedback after acceptance.
Project-specific rule → clients/<project>/lessons.md.
General rule for a workflow → bot/skills/<skill>.md under "${MARKER}".`,
  inputSchema: z.object({
    lesson: z.string().min(1).describe("What to remember next time"),
    project: z
      .string()
      .regex(/^[a-z0-9][a-z0-9._-]*$/i)
      .optional()
      .describe("Client folder slug, e.g. shop.example"),
    skill: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .optional()
      .describe("Skill id, e.g. semantic-clustering"),
  }),
  effect: "write",
  async execute({ lesson, project, skill }) {
    const date = new Date().toISOString().slice(0, 10);
    const line = `- (${date}) ${lesson.trim()}\n`;

    if (project) {
      const projectDir = path.join(clientsDir, project);
      await mkdir(projectDir, { recursive: true });
      const lessonsPath = path.join(projectDir, "lessons.md");
      let prefix = "";
      try {
        await readFile(lessonsPath, "utf8");
      } catch {
        prefix = `# Уроки приймань — ${project}\n\n`;
      }
      await appendFile(lessonsPath, prefix ? `${prefix}${line}` : line, "utf8");
      return {
        ok: true,
        wrote: lessonsPath.replace(`${agentRoot}/`, ""),
        scope: "project",
      };
    }

    if (skill) {
      const skillPath = path.join(skillsDir, `${skill}.md`);
      let body: string;
      try {
        body = await readFile(skillPath, "utf8");
      } catch {
        return { ok: false, error: `Skill file not found: ${skill}.md` };
      }
      if (!body.includes(MARKER)) {
        body = `${body.trimEnd()}\n\n${MARKER}\n\n`;
      }
      const updated = `${body.trimEnd()}\n${line}\n`;
      await writeFile(skillPath, updated, "utf8");
      return {
        ok: true,
        wrote: `bot/skills/${skill}.md`,
        scope: "skill",
      };
    }

    return {
      ok: false,
      error: "Provide project or skill to store the lesson.",
    };
  },
});