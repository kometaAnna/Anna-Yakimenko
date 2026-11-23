import path from "node:path";
import { fileURLToPath } from "node:url";

const botDir = path.dirname(fileURLToPath(import.meta.url));
export const agentRoot = path.resolve(botDir, "..", "..");
export const pipelineRoot = path.join(agentRoot, "pipeline");
export const scriptsDir = path.join(pipelineRoot, "scripts");
export const clientsDir = path.join(agentRoot, "clients");
export const skillsDir = path.join(agentRoot, "bot", "skills");