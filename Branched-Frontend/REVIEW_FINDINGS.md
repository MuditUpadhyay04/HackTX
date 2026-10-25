# Un-Said Branched-Frontend review findings

Process (rule 13): after each phase and every meaningful change, all 10 Haiku reviewer subagents (`.claude/agents/`) run in parallel. Every finding, however small, is logged here as `P<phase>-R<round>-<n>` with status OPEN; the owning Opus builder fixes it (FIXED); all 10 reviewers re-run, and a finding is VERIFIED when its reviewer no longer reports it. The loop repeats until all 10 report CLEAN in the same round.

| ID | Reviewer | Severity | File / route | Issue | Fix | Status |
|---|---|---|---|---|---|---|
