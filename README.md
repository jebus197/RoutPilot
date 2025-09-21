**RoutePilot 5.6.1** 

Rationale, Release Notes & Install Guide (Chrome + Firefox)
Overview
RoutePilot is a lightweight browser extension that surfaces ChatGPT “routing” controls and best‑practice meta prompts directly inside the ChatGPT web UI. 
It adds a compact, draggable panel that can automatically prepend a structured meta line—and, optionally, a private self‑reflection rubric—to every message while keeping a local log of which options were injected. 
The result: consistent reasoning depth, complexity, verbosity and push‑back without manual copy‑paste.
Why it matters
•	Consistency at scale — Preset routing options remove human error and persist across sessions.
•	Transparency & attribution — The View log tab shows what was injected and when, supporting reproducibility.
•	Friction‑free iteration — One‑click push‑back and reusable rubric improve answer quality without clutter.
•	Local & private — No servers, no analytics. Data lives only in browser storage.
Key features
•	Routing selectors: reasoning effort, complexity, verbosity, tool‑call budget, push‑back level.
•	Auto‑prepend meta line at send time.
•	Optional self‑reflection rubric (private).
•	Persistent settings in local storage.
•	In‑panel log with timestamp and optional Score (0‑100).
•	“Log even if not injecting” preserves attribution during tests.
•	“Test log” button verifies the panel is active.
•	Robust hooks for Enter, Send button and SPA redraws.
How it works (brief)
A small content script injects on ChatGPT pages. On send it assembles the selected meta header 
(e.g., [meta reasoning_effort=high; complexity=complex; verbosity=medium]) and, if enabled, a push‑back policy and rubric. 
If a header already exists, injection is skipped. A local log records timestamp, options and an optional user score. 
All processing is local; the extension never calls external servers.
Privacy & permissions
•	Local‑only storage — settings & log never leave the browser.
•	No external calls — zero telemetry.
•	Minimal permissions — storage + scripting limited to ChatGPT domains.
Beginner‑friendly install
Chrome (unpacked)
1.	1. Download RoutePilot_5.6.1_chrome.zip from the Releases page.
2.	2. Unzip to a folder.
3.	3. Open chrome://extensions and enable Developer mode.
4.	4. Click “Load unpacked” and select the folder containing manifest.json.
5.	5. Open ChatGPT – the panel appears bottom‑right.
6.	6. Verify: View log → Test log; send a message and confirm the log row.
Firefox (signed XPI)
7.	1. Download RoutePilot_5.6.1_firefox.xpi and open with Firefox → Add.
8.	2. If unsigned add‑ons are blocked, use about:debugging → Load Temporary Add‑on…
9.	3. Reload ChatGPT – the panel appears.
10.	4. Verify using View log and Test log.
Quick troubleshooting
•	No panel: refresh page; ensure domain is chat.openai.com or chatgpt.com; extension enabled.
•	Log empty: turn on Auto‑prepend and “Log even if not injecting”, click Test log, then send a prompt.
Release notes (v5.6.1)
•	Collapse now responds to a light tap on “Hide” (Chrome & Firefox).
•	Bundled one‑tap ZIP / XPI for each browser.
•	UI polish and accessibility labels.
•	Fixed race conditions on SPA redraw.
Intended audience
Researchers, engineers, reviewers—anyone who needs consistent, traceable prompting.
Security & store readiness
•	Strict host‑permissions (ChatGPT only).
•	Clean uninstall; no data outside profile.
