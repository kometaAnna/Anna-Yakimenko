import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineAgent } from "@grok/agent-sdk";

const agentRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export default defineAgent({
  local: { cwd: agentRoot },
  model: {
    id: "composer-2.5",
    params: [{ id: "reasoning_effort", value: "high" }],
  },
});