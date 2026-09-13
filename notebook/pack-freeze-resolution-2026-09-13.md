Amparo v2.29.2–v2.29.4 incident, resolved 2026-09-13.
v2.29.2 removed the scroll intro from /pack to reduce funnel friction.
v2.29.3 added a native state dropdown mirrored by the map. A backtick-wrapped
word required in an HTML comment embedded in a JavaScript template literal
terminated the string early and made the entire boot script fail to parse.
Users saw the cream splash indefinitely. A partial rollback was left locally.
On September 13 the working tree was restored to ce18ed3, only the two backticks
were removed, all executable inline scripts were parsed, and the /app content
extractor plus verifier ran. After fetching and rebasing the fix onto cron
updates, commit beb6756 and annotated tag v2.29.4 were pushed successfully.
Production browser verification confirmed splash dismissal, wizard rendering,
the dropdown and map, and a successful Texas selection with Continue enabled.
The dropdown remains above the map, matching v2.29.3. The obsolete untracked
ship-fix.cmd, ship-rollback.cmd and ship-docs.cmd files were removed. Normal git
execution is working. Regression lesson: parse-check every inline executable
script before pushing and verify the deployed /pack flow in a real browser.
No substantive legal text changed. This record belongs in the growth notebook
because the build notebook was reported full in the handoff.
