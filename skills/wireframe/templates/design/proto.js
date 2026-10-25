// Runtime compartido por wireframes y prototipos:
// - muestra la pantalla y el estado de la URL (#P1/estado),
// - dibuja la barra de revisión,
// - permite seleccionar componentes y dejar comentarios para que el agente itere.
// No contiene lógica de ningún requerimiento.
//
// La página declara <body data-rf="RF-001" data-fase="wireframe|prototipo">.
// #app es un contenedor CSS llamado "app": las reglas responsivas deben usar
// @container app (...) y no @media, para que la vista móvil de la barra las active.
// Los comentarios se guardan en .vd/RF-NNN/review/comments.json si la página se sirve con
// review-server.mjs; si se abre con file://, se guardan en este navegador y se exportan.
(function () {
  const rf = () => document.body.dataset.rf || 'RF-000';
  const fase = () => document.body.dataset.fase || 'prototipo';
  const screens = () => Array.from(document.querySelectorAll('[data-screen]'));
  const statesOf = (el) => (el.dataset.states || 'inicial').trim().split(/\s+/);
  const visibleScreen = () => screens().find((el) => !el.hidden);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  let current = { screen: null, state: null };

  function parseHash() {
    const [screen, state] = decodeURIComponent(location.hash.slice(1)).split('/');
    return { screen, state };
  }

  function render() {
    const all = screens();
    if (all.length === 0) return;
    const { screen, state } = parseHash();
    const target = all.find((el) => el.dataset.screen === screen) || all[0];
    const states = statesOf(target);
    const active = states.includes(state) ? state : states[0];

    all.forEach((el) => { el.hidden = el !== target; });
    target.dataset.state = active;
    target.querySelectorAll('[data-show-in]').forEach((el) => {
      el.hidden = !el.dataset.showIn.trim().split(/\s+/).includes(active);
    });
    current = { screen: target.dataset.screen, state: active };
    document.title = `${rf()} ${current.screen} ${target.dataset.title || ''} — ${active}`;

    renderToolbar();
    renderPins();
    document.dispatchEvent(new CustomEvent('proto:show', {
      detail: { screen: current.screen, state: active, element: target },
    }));
  }

  window.proto = {
    /** Navega a una pantalla (y opcionalmente a uno de sus estados). */
    go(screen, state) {
      location.hash = state ? `${screen}/${state}` : screen;
    },
    /** Cambia el estado de la pantalla visible sin añadir una entrada al historial. */
    setState(state) {
      const visible = visibleScreen();
      if (!visible) return;
      history.replaceState(null, '', `#${visible.dataset.screen}/${state}`);
      render();
    },
    /** Simula la latencia de una llamada al servidor. */
    delay(ms = 900) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    /** Lo activa la barra de revisión para simular errores del sistema. */
    forceError: false,
  };

  // ---------------------------------------------------------------- Comentarios

  const store = {
    mode: 'local', // 'servidor' cuando hay review-server.mjs
    comments: [],
    api(id) {
      const params = new URLSearchParams({ rf: rf() });
      if (id) params.set('id', id);
      return `/__comments?${params}`;
    },
    localKey() { return `vd-comments:${rf()}`; },
    readLocal() {
      try { return JSON.parse(localStorage.getItem(this.localKey())) || []; } catch { return []; }
    },
    writeLocal() {
      try { localStorage.setItem(this.localKey(), JSON.stringify(this.comments)); } catch { /* sin almacenamiento */ }
    },
    async init() {
      if (location.protocol.startsWith('http')) {
        try {
          const res = await fetch(this.api());
          if (res.ok) {
            this.mode = 'servidor';
            this.comments = await res.json();
            this.poll = setInterval(() => this.refresh(), 4000);
            return;
          }
        } catch { /* sin servidor de revisión */ }
      }
      this.comments = this.readLocal();
    },
    async refresh() {
      if (this.mode !== 'servidor') return;
      try {
        const res = await fetch(this.api());
        if (!res.ok) return;
        this.failures = 0;
        const next = await res.json();
        if (JSON.stringify(next) !== JSON.stringify(this.comments)) {
          this.comments = next;
          renderToolbar();
          renderPins();
        }
      } catch {
        // Servidor detenido: tras varios intentos se deja de consultar hasta recargar.
        this.failures = (this.failures || 0) + 1;
        if (this.failures >= 3) clearInterval(this.poll);
      }
    },
    async add(comment) {
      if (this.mode === 'servidor') {
        const res = await fetch(this.api(), {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(comment),
        });
        this.comments.push(await res.json());
      } else {
        this.comments.push(comment);
        this.writeLocal();
      }
    },
    async update(id, patch) {
      const item = this.comments.find((c) => c.id === id);
      if (!item) return;
      Object.assign(item, patch);
      if (this.mode === 'servidor') {
        await fetch(this.api(id), {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
        });
      } else {
        this.writeLocal();
      }
    },
    async remove(id) {
      this.comments = this.comments.filter((c) => c.id !== id);
      if (this.mode === 'servidor') await fetch(this.api(id), { method: 'DELETE' });
      else this.writeLocal();
    },
  };

  const commentsOfPhase = () => store.comments.filter((c) => c.fase === fase());
  const elementId = (el) => el.dataset.id || el.dataset.screen;
  const elementLabel = (el) => (el.getAttribute('aria-label') || el.innerText || el.value || '')
    .trim().replace(/\s+/g, ' ').slice(0, 80);

  // El componente comentable es el [data-id] más cercano; si no hay, la pantalla completa.
  function commentTarget(node) {
    const screen = visibleScreen();
    if (!screen || !(node instanceof Element) || !screen.contains(node)) return null;
    return node.closest('[data-id]') || screen;
  }

  function findElement(id) {
    const screen = visibleScreen();
    if (!screen) return null;
    if (id === screen.dataset.screen) return screen;
    return screen.querySelector(`[data-id="${CSS.escape(id)}"]`);
  }

  // ---------------------------------------------------------------- Modo comentario

  let commenting = false;
  const highlight = document.createElement('div');
  highlight.className = 'proto-ui proto-highlight';
  highlight.hidden = true;

  function setCommenting(value) {
    commenting = value;
    document.body.classList.toggle('proto-commenting', value);
    highlight.hidden = true;
    renderToolbar();
  }

  function outline(el) {
    const r = el.getBoundingClientRect();
    Object.assign(highlight.style, {
      left: `${r.left - 3}px`, top: `${r.top - 3}px`, width: `${r.width + 6}px`, height: `${r.height + 6}px`,
    });
    highlight.dataset.label = elementId(el);
    highlight.hidden = false;
  }

  document.addEventListener('mousemove', (e) => {
    if (!commenting || e.target.closest?.('.proto-ui')) return;
    const target = commentTarget(e.target);
    if (target) outline(target);
    else highlight.hidden = true;
  });

  // Captura el clic antes que la página para que no navegue ni envíe formularios.
  document.addEventListener('click', (e) => {
    if (!commenting || e.target.closest('.proto-ui')) return;
    const target = commentTarget(e.target);
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    openEditor(target);
  }, true);

  const editor = document.createElement('form');
  editor.className = 'proto-ui proto-editor';
  editor.hidden = true;

  function openEditor(el) {
    const r = el.getBoundingClientRect();
    editor.dataset.target = elementId(el);
    editor.dataset.label = elementLabel(el);
    editor.innerHTML = `
      <strong>Comentar <code>${esc(elementId(el))}</code></strong>
      <span class="proto-muted">${esc(current.screen)} · ${esc(current.state)}</span>
      <textarea required rows="4" placeholder="¿Qué debería cambiar?"></textarea>
      <div class="proto-row">
        <button type="submit">Guardar</button>
        <button type="button" data-action="cancel">Cancelar</button>
        <span class="proto-muted">Ctrl+Enter</span>
      </div>`;
    editor.hidden = false;
    const top = Math.min(r.bottom + 8, window.innerHeight - editor.offsetHeight - 8);
    const left = Math.min(Math.max(8, r.left), window.innerWidth - editor.offsetWidth - 8);
    Object.assign(editor.style, { top: `${Math.max(8, top)}px`, left: `${left}px` });
    editor.querySelector('textarea').focus();
  }

  function closeEditor() {
    editor.hidden = true;
  }

  editor.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = editor.querySelector('textarea').value.trim();
    if (!text) return;
    await store.add({
      id: `c-${Date.now().toString(36)}`,
      rf: rf(),
      fase: fase(),
      pantalla: current.screen,
      estado_pantalla: current.state,
      elemento: editor.dataset.target,
      texto_elemento: editor.dataset.label,
      comentario: text,
      estado: 'abierto',
      respuesta: '',
      creado: new Date().toISOString(),
    });
    closeEditor();
    renderToolbar();
    renderPins();
  });
  editor.addEventListener('click', (e) => {
    if (e.target.dataset.action === 'cancel') closeEditor();
  });
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) editor.requestSubmit();
    if (e.key === 'Escape') closeEditor();
  });

  // ---------------------------------------------------------------- Marcadores

  const pins = document.createElement('div');
  pins.className = 'proto-ui proto-pins';

  function renderPins() {
    if (!document.body.contains(pins)) return;
    const open = commentsOfPhase().filter((c) => c.pantalla === current.screen && c.estado === 'abierto');
    const byElement = new Map();
    open.forEach((c) => byElement.set(c.elemento, (byElement.get(c.elemento) || 0) + 1));
    pins.innerHTML = '';
    byElement.forEach((count, id) => {
      const el = findElement(id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'proto-pin';
      pin.textContent = count;
      pin.title = `${count} comentario(s) abierto(s) en ${id}`;
      pin.dataset.element = id;
      pin.style.left = `${r.right + window.scrollX - 10}px`;
      pin.style.top = `${r.top + window.scrollY - 10}px`;
      pins.appendChild(pin);
    });
  }

  pins.addEventListener('click', (e) => {
    const id = e.target.dataset.element;
    if (!id) return;
    setOpen(true);
    toolbar.querySelector(`[data-comment-of="${CSS.escape(id)}"]`)?.scrollIntoView({ block: 'nearest' });
  });

  // ---------------------------------------------------------------- Barra de revisión

  const toolbar = document.createElement('aside');
  toolbar.className = 'proto-ui proto-toolbar';
  toolbar.setAttribute('aria-label', 'Barra de revisión');
  const toggle = document.createElement('button');
  toggle.className = 'proto-ui proto-toggle';
  toggle.type = 'button';
  toggle.title = 'Barra de revisión (tecla ?)';
  toggle.textContent = '◧';

  let open = false;
  let viewport = 'escritorio';

  function renderToolbar() {
    if (!document.body.contains(toolbar)) return;
    toolbar.hidden = !open;
    const pending = commentsOfPhase().filter((c) => c.estado === 'abierto').length;
    toggle.dataset.count = pending || '';
    if (!open) return;

    const list = screens().map((el) => {
      const id = el.dataset.screen;
      const links = statesOf(el).map((s) => {
        const active = id === current.screen && s === current.state ? ' aria-current="true"' : '';
        return `<a href="#${id}/${s}"${active}>${esc(s)}</a>`;
      }).join('');
      const count = commentsOfPhase().filter((c) => c.pantalla === id && c.estado === 'abierto').length;
      const badge = count ? ` <span class="proto-badge">${count}</span>` : '';
      return `<li><strong>${esc(id)}</strong> ${esc(el.dataset.title || '')}${badge}<div>${links}</div></li>`;
    }).join('');

    const here = commentsOfPhase().filter((c) => c.pantalla === current.screen);
    const comments = here.length === 0
      ? '<p class="proto-muted">Sin comentarios en esta pantalla.</p>'
      : here.map((c) => `
        <li class="proto-comment is-${esc(c.estado)}" data-comment-of="${esc(c.elemento)}">
          <div><code>${esc(c.elemento)}</code> <span class="proto-muted">${esc(c.estado_pantalla)} · ${esc(c.estado)}</span></div>
          <p>${esc(c.comentario)}</p>
          ${c.respuesta ? `<p class="proto-answer">↳ ${esc(c.respuesta)}</p>` : ''}
          <div class="proto-row">
            ${c.estado === 'abierto'
              ? `<button type="button" data-action="delete" data-id="${esc(c.id)}">Eliminar</button>`
              : `<button type="button" data-action="reopen" data-id="${esc(c.id)}">Reabrir</button>`}
          </div>
        </li>`).join('');

    const storage = store.mode === 'servidor'
      ? `<p class="proto-muted">Se guardan en <code>.vd/${esc(rf())}/review/comments.json</code>.</p>`
      : `<p class="proto-muted">Solo en este navegador. Exporta el archivo a
           <code>.vd/${esc(rf())}/review/comments.json</code> o copia y pega en el chat.</p>
         <div class="proto-row">
           <button type="button" data-action="export">Exportar</button>
           <button type="button" data-action="copy">Copiar</button>
         </div>`;

    toolbar.innerHTML = `
      <header>${esc(rf())} · ${esc(fase())}</header>
      <ul class="proto-screens">${list}</ul>
      <div class="proto-row">
        <button type="button" data-action="comment" aria-pressed="${commenting}">
          ${commenting ? 'Salir de comentar' : '✎ Comentar'}</button>
        <span class="proto-muted">tecla C</span>
      </div>
      ${fase() === 'prototipo' ? `<label><input type="checkbox" data-proto="error"${window.proto.forceError ? ' checked' : ''}>
        Simular error del sistema</label>` : ''}
      <label>Vista
        <select data-proto="viewport">
          <option${viewport === 'escritorio' ? ' selected' : ''}>escritorio</option>
          <option${viewport === 'movil' ? ' selected' : ''}>movil</option>
        </select>
      </label>
      <h3>Comentarios · ${esc(current.screen)} <span class="proto-muted">(${pending} abiertos en total)</span></h3>
      <ul class="proto-comments">${comments}</ul>
      ${storage}`;
  }

  function asMarkdown() {
    return commentsOfPhase().filter((c) => c.estado === 'abierto').map((c) =>
      `- **${c.pantalla} / ${c.estado_pantalla} / \`${c.elemento}\`**: ${c.comentario}`).join('\n');
  }

  toolbar.addEventListener('click', async (e) => {
    const { action, id } = e.target.dataset;
    if (action === 'comment') setCommenting(!commenting);
    if (action === 'delete') await store.remove(id);
    if (action === 'reopen') await store.update(id, { estado: 'abierto' });
    if (action === 'export') {
      const blob = new Blob([JSON.stringify(store.comments, null, 2)], { type: 'application/json' });
      const link = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob), download: 'comments.json',
      });
      link.click();
      URL.revokeObjectURL(link.href);
    }
    if (action === 'copy') await navigator.clipboard?.writeText(asMarkdown());
    if (['delete', 'reopen'].includes(action)) {
      renderToolbar();
      renderPins();
    }
  });

  toolbar.addEventListener('change', (e) => {
    if (e.target.dataset.proto === 'error') window.proto.forceError = e.target.checked;
    if (e.target.dataset.proto === 'viewport') {
      viewport = e.target.value;
      document.body.classList.toggle('proto-movil', viewport === 'movil');
      renderPins();
    }
  });

  function setOpen(value) {
    open = value;
    renderToolbar();
  }
  toggle.addEventListener('click', () => setOpen(!open));

  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    if (e.key === 'Escape' && commenting) setCommenting(false);
    if (typing) return;
    if (e.key === '?') setOpen(!open);
    if (e.key === 'c' || e.key === 'C') setCommenting(!commenting);
  });

  const style = document.createElement('style');
  style.textContent = `
    .proto-toggle { position: fixed; right: 12px; bottom: 12px; z-index: 1001; width: 40px; height: 40px;
      border-radius: 50%; border: 0; background: #111827; color: #fff; font-size: 18px; cursor: pointer; }
    .proto-toggle[data-count]:not([data-count=""])::after { content: attr(data-count); position: absolute;
      top: -4px; right: -4px; min-width: 18px; height: 18px; border-radius: 9px; background: #f59e0b;
      color: #111827; font: 600 11px/18px system-ui, sans-serif; }
    .proto-toolbar { position: fixed; right: 12px; bottom: 60px; z-index: 1000; width: 300px;
      max-height: 75vh; overflow: auto; padding: 12px; border-radius: 8px; background: #111827;
      color: #e5e7eb; font: 13px/1.4 system-ui, sans-serif; box-shadow: 0 8px 24px rgb(0 0 0 / .3); }
    .proto-toolbar header { font-weight: 600; margin-bottom: 8px; }
    .proto-toolbar h3 { font-size: 13px; margin: 12px 0 6px; }
    .proto-toolbar ul { list-style: none; margin: 0 0 8px; padding: 0; }
    .proto-screens li { margin-bottom: 8px; }
    .proto-screens li div { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
    .proto-toolbar a { color: #93c5fd; padding: 1px 6px; border: 1px solid #374151; border-radius: 4px;
      text-decoration: none; }
    .proto-toolbar a[aria-current] { background: #2563eb; color: #fff; border-color: #2563eb; }
    .proto-toolbar label { display: flex; gap: 6px; align-items: center; margin-top: 6px; }
    .proto-ui button { font: inherit; cursor: pointer; border-radius: 4px; border: 1px solid #4b5563;
      background: #1f2937; color: #e5e7eb; padding: 2px 8px; }
    .proto-ui button[aria-pressed="true"] { background: #f59e0b; color: #111827; border-color: #f59e0b; }
    .proto-ui code { font-size: 12px; color: #fcd34d; }
    .proto-muted { color: #9ca3af; font-size: 12px; }
    .proto-row { display: flex; gap: 6px; align-items: center; margin-top: 6px; }
    .proto-badge { background: #f59e0b; color: #111827; border-radius: 8px; padding: 0 6px; font-size: 11px; }
    .proto-comment { border-top: 1px solid #374151; padding: 6px 0; }
    .proto-comment p { margin: 4px 0; white-space: pre-wrap; }
    .proto-comment.is-resuelto p { color: #9ca3af; text-decoration: line-through; }
    .proto-comment .proto-answer, .proto-comment.is-resuelto .proto-answer { color: #86efac; text-decoration: none; }
    .proto-highlight { position: fixed; z-index: 999; pointer-events: none; border: 2px solid #f59e0b;
      border-radius: 4px; background: rgb(245 158 11 / .08); }
    .proto-highlight::before { content: attr(data-label); position: absolute; top: -20px; left: -2px;
      padding: 1px 6px; border-radius: 4px; background: #f59e0b; color: #111827;
      font: 600 11px/16px system-ui, sans-serif; white-space: nowrap; }
    body.proto-commenting #app, body.proto-commenting #app * { cursor: crosshair !important; }
    .proto-editor { position: fixed; z-index: 1002; width: 280px; display: flex; flex-direction: column;
      gap: 6px; padding: 10px; border-radius: 8px; background: #111827; color: #e5e7eb;
      font: 13px/1.4 system-ui, sans-serif; box-shadow: 0 8px 24px rgb(0 0 0 / .35); }
    .proto-editor textarea { font: inherit; resize: vertical; border-radius: 4px; border: 1px solid #4b5563;
      background: #0b1220; color: #e5e7eb; padding: 6px; }
    .proto-pins { position: absolute; top: 0; left: 0; z-index: 998; }
    .proto-pin { position: absolute; width: 20px; height: 20px; padding: 0 !important; border-radius: 50% !important;
      border: 2px solid #fff !important; background: #f59e0b !important; color: #111827 !important;
      font: 600 11px/16px system-ui, sans-serif !important; box-shadow: 0 1px 4px rgb(0 0 0 / .3); }
    #app { container: app / inline-size; }
    body.proto-movil #app { max-width: 390px; margin: 0 auto; min-height: 100vh;
      outline: 1px dashed #94a3b8; overflow-x: hidden; }`;

  window.addEventListener('hashchange', render);
  window.addEventListener('resize', renderPins);
  document.addEventListener('DOMContentLoaded', async () => {
    document.head.appendChild(style);
    document.body.append(pins, highlight, editor, toolbar, toggle);
    render();
    await store.init();
    renderToolbar();
    renderPins();
    new ResizeObserver(() => renderPins()).observe(document.body);
  });
})();
