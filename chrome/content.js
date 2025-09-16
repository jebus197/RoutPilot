
(() => {
  // Guard: single inject
  if (window.__routepilot_injected) return;
  window.__routepilot_injected = true;

  const QS = (s,p=document)=>p.querySelector(s);
  const QSA = (s,p=document)=>Array.from(p.querySelectorAll(s));
  const storage = {
    get: (keys)=>new Promise(r=>chrome.storage.local.get(keys, r)),
    set: (obj)=>new Promise(r=>chrome.storage.local.set(obj, r))
  };

  const DEFAULTS = {
    reasoning:'high', complexity:'complex', verbosity:'medium', pushback:'medium',
    autoPrepend:true, silent:true, gpt5Only:true, chime:true,
    metaTemplate:'[meta reasoning_effort={{reasoning}}; complexity={{complexity}}; verbosity={{verbosity}}; push_back={{pushback}}]',
    panelPos:{right:16,bottom:108}, fabPos:{right:18,bottom:18}, hidden:false, log:[]
  };

  // Insert base UI
  function html() {
    return `
    <div id="rp-panel" style="right:${state.panelPos.right}px;bottom:${state.panelPos.bottom}px;">
      <div id="rp-header">
        <div id="rp-title"><div class="rp-dot">R</div> RoutePilot</div>
        <div>
          <button id="rp-hide" title="Hide panel">Hide</button>
        </div>
      </div>
      <div id="rp-tabs" role="tablist">
        <button data-tab="main" aria-selected="true">RoutePilot</button>
        <button data-tab="log">View log</button>
        <button data-tab="about">About</button>
      </div>
      <div id="rp-body">
        <section data-pane="main">
          <div id="rp-row">
            <label>Reasoning effort</label>
            <select id="rp-reasoning">
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>
          <div id="rp-row">
            <label>Complexity</label>
            <select id="rp-complexity">
              <option value="simple">simple</option>
              <option value="complex" selected>complex</option>
            </select>
          </div>
          <div id="rp-row">
            <label>Verbosity</label>
            <select id="rp-verbosity">
              <option value="low">low</option>
              <option value="medium" selected>medium</option>
              <option value="high">high</option>
            </select>
          </div>
          <div id="rp-row">
            <label>Push-back</label>
            <select id="rp-push">
              <option value="low">low</option>
              <option value="medium" selected>medium</option>
              <option value="high">high</option>
            </select>
          </div>
          <div class="rp-check"><input type="checkbox" id="rp-autoprep"><label for="rp-autoprep">Auto-prepend meta</label></div>
          <div class="rp-check"><input type="checkbox" id="rp-silent"><label for="rp-silent">Silent (flash) injection</label></div>
          <div class="rp-check"><input type="checkbox" id="rp-gpt5"><label for="rp-gpt5">Only on GPT-5 sessions</label></div>
          <div class="rp-check"><input type="checkbox" id="rp-chime"><label for="rp-chime">Chime on response completion</label></div>
          <div id="rp-row">
            <label>Custom meta template</label>
            <textarea id="rp-meta" rows="3"></textarea>
            <div class="rp-note">Placeholders: {{reasoning}}, {{complexity}}, {{verbosity}}, {{pushback}}</div>
          </div>
        </section>
        <section data-pane="log" class="rp-hidden">
          <div id="rp-log" style="white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:12px"></div>
        </section>
        <section data-pane="about" class="rp-hidden">
          <div class="rp-note">
            RoutePilot adds quick routing controls for ChatGPT-5: reasoning effort, complexity,
            verbosity and push-back, silent meta injection, logging, and an optional completion chime.
            Not affiliated with OpenAI.
          </div>
        </section>
      </div>
      <div id="rp-actions">
        <button id="rp-recenter">Recenter</button>
        <button id="rp-reset">Reset</button>
        <button id="rp-save" class="primary">Save</button>
      </div>
    </div>
    <div id="rp-fab" title="Open RoutePilot" style="right:${state.fabPos.right}px;bottom:${state.fabPos.bottom}px" class="${state.hidden?'':'rp-hidden'}"><b>R</b></div>
    `;
  }

  // State
  let state = {...DEFAULTS};

  // Apply persisted state
  async function loadState(){
    const got = await storage.get(Object.keys(DEFAULTS));
    state = {...DEFAULTS, ...got};
  }
  function persist(part){ return storage.set(part); }

  // Render panel
  function mount(){
    const existing = QS('#rp-panel');
    if(existing) existing.remove();
    const existingFab = QS('#rp-fab');
    if(existingFab) existingFab.remove();
    document.body.insertAdjacentHTML('beforeend', html());
    bind();
    fill();
    renderLog();
  }

  function bind(){
    // Tabs
    QSA('#rp-tabs button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        QSA('#rp-tabs button').forEach(b=>b.setAttribute('aria-selected','false'));
        btn.setAttribute('aria-selected','true');
        const t = btn.dataset.tab;
        QSA('#rp-body [data-pane]').forEach(p=>p.classList.toggle('rp-hidden', p.dataset.pane!==t));
      });
    });

    // Drag only on header/title
    const header = QS('#rp-header');
    let drag=false,startX=0,startY=0, startRight=0,startBottom=0;
    header.addEventListener('pointerdown',(e)=>{
      drag=true; header.setPointerCapture(e.pointerId);
      startX=e.clientX; startY=e.clientY;
      const rect = QS('#rp-panel').getBoundingClientRect();
      startRight = window.innerWidth - rect.right;
      startBottom = window.innerHeight - rect.bottom;
    });
    header.addEventListener('pointermove',(e)=>{
      if(!drag) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const right = Math.max(8, startRight - dx);
      const bottom = Math.max(80, startBottom - dy);
      Object.assign(QS('#rp-panel').style,{right:right+'px',bottom:bottom+'px'});
    });
    header.addEventListener('pointerup', async (e)=>{
      drag=false;
      const rect = QS('#rp-panel').getBoundingClientRect();
      state.panelPos = { right: Math.round(window.innerWidth-rect.right), bottom: Math.round(window.innerHeight-rect.bottom) };
      await persist({panelPos:state.panelPos});
    });

    // Hide -> show FAB
    QS('#rp-hide').addEventListener('click', async ()=>{
      QS('#rp-panel').classList.add('rp-hidden');
      const fab = QS('#rp-fab'); fab.classList.remove('rp-hidden');
      state.hidden = true; await persist({hidden:true});
    });
    // FAB click -> open
    const fab = QS('#rp-fab');
    fab.addEventListener('click', async ()=>{
      QS('#rp-panel').classList.remove('rp-hidden');
      fab.classList.add('rp-hidden');
      state.hidden = false; await persist({hidden:false});
    });
    // FAB drag
    let fdrag=false, fx=0, fy=0, fsr=0, fsb=0;
    fab.addEventListener('pointerdown',(e)=>{
      fdrag=true; fab.setPointerCapture(e.pointerId); fx=e.clientX; fy=e.clientY;
      const r = fab.getBoundingClientRect();
      fsr = Math.round(window.innerWidth - r.right);
      fsb = Math.round(window.innerHeight - r.bottom);
    });
    fab.addEventListener('pointermove', (e)=>{
      if(!fdrag) return;
      const dx=e.clientX-fx, dy=e.clientY-fy;
      const right = Math.max(8, fsr - dx);
      const bottom = Math.max(8, fsb - dy);
      Object.assign(fab.style,{right:right+'px',bottom:bottom+'px'});
    });
    fab.addEventListener('pointerup', async (e)=>{
      fdrag=false;
      const r=fab.getBoundingClientRect();
      state.fabPos = { right: Math.round(window.innerWidth-r.right), bottom: Math.round(window.innerHeight-r.bottom) };
      await persist({fabPos:state.fabPos});
    });

    // Actions
    QS('#rp-recenter').addEventListener('click', async()=>{
      Object.assign(QS('#rp-panel').style,{right:'16px',bottom:'108px'});
      Object.assign(QS('#rp-fab').style,{right:'18px',bottom:'18px'});
      state.panelPos={right:16,bottom:108}; state.fabPos={right:18,bottom:18};
      await persist({panelPos:state.panelPos,fabPos:state.fabPos});
    });
    QS('#rp-reset').addEventListener('click', async()=>{
      state={...DEFAULTS, panelPos:state.panelPos, fabPos:state.fabPos, hidden:state.hidden, log:state.log};
      await persist({
        reasoning:state.reasoning, complexity:state.complexity, verbosity:state.verbosity, pushback:state.pushback,
        autoPrepend:state.autoPrepend, silent:state.silent, gpt5Only:state.gpt5Only, chime:state.chime, metaTemplate:state.metaTemplate
      });
      fill();
    });
    QS('#rp-save').addEventListener('click', saveSettings);

    // Key listeners for injection + completion
    document.addEventListener('keydown', keyHandler, true);
    const sendBtn = () => QS('button[aria-label="Send"], button[data-testid="send-button"]');
    document.addEventListener('click', (e)=>{
      if(sendBtn() && (e.target===sendBtn() || sendBtn().contains(e.target))){
        handleSend();
      }
    }, true);

    // Make audio context only on first real user gesture
    const resume = ()=>{
      if(!audio.ac){
        audio.ac = new (window.AudioContext||window.webkitAudioContext)();
      } else if (audio.ac.state==='suspended') audio.ac.resume();
      window.removeEventListener('pointerdown', resume, true);
      window.removeEventListener('keydown', resume, true);
    };
    window.addEventListener('pointerdown', resume, true);
    window.addEventListener('keydown', resume, true);

    // Observe conversation to detect completion settles
    observeCompletion();
  }

  function fill(){
    QS('#rp-reasoning').value=state.reasoning;
    QS('#rp-complexity').value=state.complexity;
    QS('#rp-verbosity').value=state.verbosity;
    QS('#rp-push').value=state.pushback;
    QS('#rp-autoprep').checked=state.autoPrepend;
    QS('#rp-silent').checked=state.silent;
    QS('#rp-gpt5').checked=state.gpt5Only;
    QS('#rp-chime').checked=state.chime;
    QS('#rp-meta').value=state.metaTemplate;
    // Pane selection
    QSA('#rp-tabs button').forEach(b=>b.setAttribute('aria-selected', b.dataset.tab==='main' ? 'true':'false'));
    QSA('#rp-body [data-pane]').forEach(p=>p.classList.toggle('rp-hidden', p.dataset.pane!=='main'));
    // Visibility
    QS('#rp-panel').classList.toggle('rp-hidden', state.hidden);
    QS('#rp-fab').classList.toggle('rp-hidden', !state.hidden);
  }

  async function saveSettings(){
    state.reasoning = QS('#rp-reasoning').value;
    state.complexity = QS('#rp-complexity').value;
    state.verbosity = QS('#rp-verbosity').value;
    state.pushback  = QS('#rp-push').value;
    state.autoPrepend = QS('#rp-autoprep').checked;
    state.silent = QS('#rp-silent').checked;
    state.gpt5Only = QS('#rp-gpt5').checked;
    state.chime  = QS('#rp-chime').checked;
    state.metaTemplate = QS('#rp-meta').value.trim() || DEFAULTS.metaTemplate;
    await persist({
      reasoning:state.reasoning, complexity:state.complexity, verbosity:state.verbosity, pushback:state.pushback,
      autoPrepend:state.autoPrepend, silent:state.silent, gpt5Only:state.gpt5Only, chime:state.chime, metaTemplate:state.metaTemplate
    });
    log('settings saved');
  }

  // Logging
  function log(s){
    const ts = new Date().toISOString();
    state.log = (state.log || []).slice(-9);
    state.log.push(`${ts} ${s}`);
    persist({log:state.log});
    renderLog();
  }
  function renderLog(){
    const el = QS('#rp-log');
    if(!el) return;
    el.textContent = (state.log||[]).join('\n');
  }

  // Meta injection
  function buildMeta(){
    let t = state.metaTemplate;
    return t.replace('{{reasoning}}', state.reasoning)
            .replace('{{complexity}}', state.complexity)
            .replace('{{verbosity}}', state.verbosity)
            .replace('{{pushback}}', state.pushback);
  }
  function insertMeta(){
    const ta = QS('textarea, [contenteditable="true"]');
    if(!ta) return false;
    const meta = buildMeta();
    // If already present at start, don't duplicate
    const existing = (ta.value||ta.innerText||'').trimStart();
    if(existing.startsWith(meta)) return false;
    if(ta.value!==undefined){
      ta.value = state.silent ? `${meta}\n\n${ta.value}` : `${meta}\n\n${ta.value}`;
    } else {
      ta.innerText = state.silent ? `${meta}\n\n${ta.innerText}` : `${meta}\n\n${ta.innerText}`;
    }
    return true;
  }

  let pendingSend = false;
  function keyHandler(e){
    if(e.key==='Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey){
      handleSend();
    }
  }
  function handleSend(){
    if(state.gpt5Only){
      // crude model check from the model label; if not visible, assume allowed
      const label = QS('header,nav')?.innerText || '';
      if(!/GPT[-\s]?5/i.test(label)) {
        log('skipped: not GPT-5 session');
        return;
      }
    }
    if(state.autoPrepend){
      const injected = insertMeta();
      log(`meta ${injected?'applied':'skipped'}`);
    }
    pendingSend = true;
    lastChange = Date.now();
  }

  // Completion detection
  let lastChange = Date.now();
  const observer = new MutationObserver(()=>{ lastChange = Date.now(); });
  function observeCompletion(){
    const root = document.body;
    observer.observe(root, {childList:true, subtree:true, characterData:true});
    // check loop
    setInterval(()=>{
      if(!pendingSend) return;
      const idle = Date.now() - lastChange;
      if(idle > 1200){ // 1.2s of quiet
        pendingSend=false;
        if(state.chime) playChime();
        log('completion detected');
      }
    }, 500);
  }

  // Audio (no click beeps; only on completion). Context created/resumed on first user gesture.
  const audio = {ac:null};
  function playChime(){
    try{
      if(!audio.ac) return; // user gesture not yet occurred
      const ac = audio.ac;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type='sine'; o.frequency.value=880;
      o.connect(g); g.connect(ac.destination);
      const now = ac.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.15, now+0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now+0.22);
      o.start(now);
      o.stop(now+0.25);
    }catch(e){/* ignore */}
  }

  // Init
  (async () => {
    await loadState();
    mount();
    log('panel active'); // ensures first-prompt log presence
  })();

})();
