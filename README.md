**ChatGPT RoutePilot — Rationale, Release Notes & Install Guide (v5.6.1 · Chrome & Firefox)**

---

### **Overview**

ChatGPT’s back-end includes a hidden *router* that tweaks reasoning effort, complexity, verbosity, push-back, etc. Because those flags aren’t exposed, power-users paste clunky meta headers (“`[meta reasoning_effort=high …]`”) into every message. **RoutePilot** adds a small panel inside ChatGPT: pick your defaults once, turn on **Auto-prepend meta**, and every message gets a clean, reproducible header. An optional self-reflection rubric lets ChatGPT critique its own draft, and a local log records what was injected and when.

---

### **Why it matters**

* **Consistency at scale** – repeatable routing beats ad-hoc prompting for research, policy, coding, QA.
* **Transparency & attribution** – *View Log* tab shows the exact header (or `[no-inject]`).
* **Frictionless iteration** – toggle push-back level & rubric without cluttering the chat.
* **Non-intrusive** – no servers, no accounts, no analytics; everything stays in local storage.

---

### **Key features**

* Routing dropdowns (reasoning, complexity, verbosity, push-back, tool budget)
* **Auto-prepend meta** (one click; skipped if you already pasted a meta line)
* Optional **self-reflection rubric** (private; never appears in the final answer)
* Local, timestamped log + user score field (0-100)
* **Log even if not injecting** (ON by default)
* **Test log** button (instant sanity check)
* Hide ↔ draggable “R” floating button; light-tap on **Hide** collapses, click FAB re-opens

---

### **Privacy & permissions**

Local storage only · no external requests · minimal perms (`storage`, `scripting`/`browser.*`, host match *chatgpt.com*).

---

### **Download & install**

| Browser                        | Binary                         | Quick install                                                                                           |
| ------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **Chrome / Edge (unpacked)**   | `RoutePilot_5.6.1_chrome.zip`  | 1. Download  2. Unzip  3. `chrome://extensions` → Developer mode ON → **Load unpacked** → select folder |
| **Firefox (temporary add-on)** | `RoutePilot_5.6.1_firefox.zip` | 1. Download  2. `about:debugging` → *This Firefox* → **Load Temporary Add-on** → pick ZIP               |

Grab the ZIPs from GitHub `/dist`:

* [https://github.com/jebus197/RoutPilot/raw/main/dist/RoutePilot\_5.6.1\_chrome.zip](https://github.com/jebus197/RoutPilot/raw/main/dist/RoutePilot_5.6.1_chrome.zip)
* [https://github.com/jebus197/RoutPilot/raw/main/dist/RoutePilot\_5.6.1\_firefox.zip](https://github.com/jebus197/RoutPilot/raw/main/dist/RoutePilot_5.6.1_firefox.zip)
  *(Signed XPI for AMO is pending; use the temporary load for now.)*

---

### **First-run checklist**

1. Open ChatGPT – panel appears bottom-right.
2. Leave **Auto-prepend meta** ON.
3. Click **Test log** → a row appears.
4. Send a short message → meta header auto-injected, log updated.
5. Collapse panel with a light tap on **Hide**; drag the floating **R** wherever.

---

### **Release notes (v5.6.1)**

* Unified Chrome v3 / Firefox codebase.
* Fixed header click: light-tap collapses; header still draggable.
* Added binaries to `/dist` for direct linking.
* Docs refreshed; SHA-256 hashes removed (GitHub blobs are immutable).
* **Chime**: experimental sound disabled by default (cross-browser WAV/OGG quirks remain).

---

### **Road-map / help wanted**

* Cross-platform pleasant end-of-response chime (Web Audio fallback?)
* Optional result-cache to smooth ChatGPT latency spikes.
* AMO & Chrome Web Store submissions.
  PRs, issues, and real-world testing welcome!

---

### **Philosophical note**

OpenAI’s GPT-5 Thinking brief teased “fine-grained personal auto-routing.” In practice it means hidden flags ChatGPT can read but you can’t set. **RoutePilot** surfaces those knobs so anyone—from policy researchers to hobbyists—can run structured prompting with *accuracy and repeatability* instead of hoping the model guesses intent. Think of it as a tiny lab notebook stapled to ChatGPT.

*Happy routing, and let us know what breaks!*
