import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  description: "GSC quick wins runs on pipeline examples via run_pipeline_script.",
  async test(t) {
    await t.send(
      'Use run-pipeline-script with script gsc_analyze.py and args ["examples/gsc_current.csv", "--previous", "examples/gsc_previous.csv", "--out", "/tmp/smoke-gsc-out.xlsx"]. Summarize exit code in one sentence.',
    );
    t.succeeded();
    t.calledTool("run-pipeline-script");
  },
});