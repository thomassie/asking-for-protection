/* Europe's Divides: "Asking for Protection" (project name Flight Paths; D3 v7), drawn into one element:

     <div id="asylum-europe" data-base="https://<data host>/"></div>

   data-base       where data/*.json live (default: next to the page)
   data-header     "false" leaves out the built-in title (when the host page has its own)
   data-layout     "standalone" adds the page's own width and side gutters

   Reads data/*.json, written by pipeline/run.py from mart.asy_* (MotherDuck), and data/world.topo.json (GISCO
   Countries 2024). No database access here. Every number in the text is computed here from the same files as the
   charts. Styles: asy.css (scoped under .asy); colours come from the host's tokens or theme.css.
   One meaning per colour: ink = Eurostat's EU total, red = the selection (Switzerland, or the citizenship picked
   on the map), as the site's accent on its other pages; blue = Germany, the third place to compare; grey = the rest.
   Red and blue differ by hue only, so each also has a second cue: a name in the key and tooltips, a swatch shape.
   Words: applications and applicants, never "migrants" or "arrivals"; bands link citizenship and country of
   application, never travel routes. */
(function () {
  'use strict';

  const root = document.getElementById('asylum-europe');
  if (!root || typeof d3 === 'undefined') return;
  const BASE = root.dataset.base ? root.dataset.base.replace(/\/?$/, '/') : '';
  root.classList.add('asy');
  if (root.dataset.layout === 'standalone') root.classList.add('asy--standalone');

  const DOT = '<svg class="title-dot" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><circle cx="5" cy="5" r="5"/></svg>';
  root.innerHTML = `
<div class="masthead wrap"${root.dataset.header === 'false' ? ' hidden' : ''}>
  <div class="masthead__text">
    <p class="eyebrow">Europe&rsquo;s Divides</p>
    <h1>Asking for Protection${DOT}</h1>
    <p class="lede">Who asks for asylum in the EU and Switzerland, which citizenship they hold and in which country they apply: every month since 2014, from Eurostat&rsquo;s official statistics.</p>
  </div>
</div>
<div class="wrap">
  <section class="hero" aria-label="The latest month">
    <div class="hero__item">
      <p class="hero__label"><i class="asy-sw asy-sw--eu"></i><span id="asy-hero-eu-label">European Union</span></p>
      <p class="hero__figure" id="asy-hero-eu">&nbsp;</p>
      <p class="hero__text" id="asy-hero-eu-text"></p>
      <div class="asy-spark" id="asy-spark-eu"></div>
      <p class="note" id="asy-hero-eu-note"></p>
    </div>
    <div class="hero__item">
      <p class="hero__label"><i class="asy-sw asy-sw--ch"></i><span id="asy-hero-ch-label">Switzerland</span></p>
      <p class="hero__figure" id="asy-hero-ch">&nbsp;</p>
      <p class="hero__text" id="asy-hero-ch-text"></p>
      <div class="asy-spark" id="asy-spark-ch"></div>
      <p class="note" id="asy-hero-ch-note"></p>
    </div>
    <div class="hero__item">
      <p class="hero__label"><i class="asy-sw asy-sw--de"></i><span id="asy-hero-de-label">Germany</span></p>
      <p class="hero__figure" id="asy-hero-de">&nbsp;</p>
      <p class="hero__text" id="asy-hero-de-text"></p>
      <div class="asy-spark" id="asy-spark-de"></div>
      <p class="note" id="asy-hero-de-note"></p>
    </div>
  </section>

  <section class="block" aria-labelledby="asy-h-near">
    <div class="block__rail">
      <h2 id="asy-h-near">Most refugees live in neighbouring countries${DOT}</h2>
      <p>Applications are one part of the picture. UNHCR, the UN Refugee Agency, counts the people who have fled their country and live in another at the end of each year: a number of people at one moment, not the applications made during a year.</p>
      <p id="asy-near-text"></p>
      <p class="note" id="asy-near-note"></p>
    </div>
    <div class="block__body">
      <div class="asy-key" id="asy-near-key"></div>
      <div class="chart asy-world" id="asy-near"></div>
      <details class="tableview"><summary>Table: every host country</summary><div class="tablewrap" id="asy-near-table"></div></details>
    </div>
  </section>

  <section class="block" aria-labelledby="asy-h-pulse">
    <div class="block__rail">
      <h2 id="asy-h-pulse">Month by month${DOT}</h2>
      <p>First-time asylum applicants who are not EU citizens, every month since January 2014. &ldquo;First time&rdquo; means first time in that country: someone who applies in two countries is counted in both.</p>
      <p id="asy-pulse-text"></p>
      <p class="note" id="asy-pulse-note"></p>
    </div>
    <div class="block__body">
      <div class="filters"><div class="seg" id="asy-pulse-mode" role="group" aria-label="Measure"></div></div>
      <div class="asy-key" id="asy-pulse-key"></div>
      <div class="chart" id="asy-pulse"></div>
      <details class="tableview"><summary>Table: every month</summary><div class="tablewrap" id="asy-pulse-table"></div></details>
    </div>
  </section>

  <section class="block" aria-labelledby="asy-h-top">
    <div class="block__rail">
      <h2 id="asy-h-top">The ten largest groups${DOT}</h2>
      <p>The ten citizenships with the most first-time applicants in the last twelve months reported, and their applicants every month back to 2014.</p>
      <p id="asy-top-text"></p>
      <p class="note" id="asy-top-note"></p>
    </div>
    <div class="block__body">
      <div class="filters">
        <div class="seg asy-scope" id="asy-top-scope" role="group" aria-label="Where"></div>
        <div class="seg" id="asy-top-scale" role="group" aria-label="Scale"></div>
      </div>
      <div class="asy-panelgrid" id="asy-panels"></div>
    </div>
  </section>

  <section class="block" aria-labelledby="asy-h-flow">
    <div class="block__rail">
      <h2 id="asy-h-flow">Who applies where${DOT}</h2>
      <p>Each band links a citizenship to the country where its first-time applicants applied, in one year. The width is the number of applicants. The bands show where people applied, not the routes they travelled.</p>
      <p id="asy-flow-text"></p>
      <p class="note" id="asy-flow-note"></p>
    </div>
    <div class="block__body">
      <div class="filters">
        <div class="asy-slider" id="asy-flow-year"></div>
      </div>
      <div class="chart" id="asy-sankey"></div>
      <details class="tableview"><summary>Table: every band</summary><div class="tablewrap" id="asy-flow-table"></div></details>
    </div>
  </section>

  <section class="block" aria-labelledby="asy-h-map">
    <div class="block__rail">
      <h2 id="asy-h-map">By citizenship${DOT}</h2>
      <p>First-time applicants by the citizenship they hold, in one year (not where they travelled from). Pick a country on the map, or find a citizenship by name, to see where its citizens applied.</p>
      <p id="asy-map-text"></p>
      <p class="note" id="asy-map-note"></p>
    </div>
    <div class="block__body">
      <div class="filters">
        <div class="asy-slider" id="asy-map-year"></div>
        <div class="seg asy-scope" id="asy-map-scope" role="group" aria-label="Applied in"></div>
      </div>
      <div class="asy-tools">
        <label class="asy-find" for="asy-find"><svg class="asy-mag" viewBox="0 0 16 16" aria-hidden="true"><circle cx="6.5" cy="6.5" r="4.75"/><line x1="10" y1="10" x2="14.5" y2="14.5"/></svg><span>Find a citizenship</span>
          <input id="asy-find" type="search" list="asy-names" autocomplete="off" placeholder="e.g. Eritrea"></label>
        <datalist id="asy-names"></datalist>
      </div>
      <div class="asy-key" id="asy-world-key"></div>
      <div class="chart asy-world" id="asy-world"></div>
      <p class="note" id="asy-offmap"></p>
      <h3 class="asy-sub" id="asy-pick-title"></h3>
      <p class="asy-picktext" id="asy-pick-text"></p>
      <div class="asy-pick">
        <div class="chart asy-europe" id="asy-europe"></div>
        <div class="tablewrap asy-hosts" id="asy-hosts"></div>
      </div>
    </div>
  </section>

  <section class="block" aria-labelledby="asy-h-war">
    <div class="block__rail">
      <h2 id="asy-h-war">Organised violence and applications${DOT}</h2>
      <p>The Uppsala Conflict Data Program (UCDP) counts the people killed in organised violence: fighting between governments and armed groups, fighting between armed groups, and their attacks on civilians. Here these deaths are set beside first-time applications by citizens of the same country. Deaths are counted where they happened, applicants by the citizenship they hold: the two can move together without one explaining the other.</p>
      <p>For context in time, each panel shades the years in which UCDP counts a war in the country and numbers a few events, each dated by a UN record and listed under the panel with its source: a selection made for this page, by the kinds of event set out in the note.</p>
      <p id="asy-war-text"></p>
      <p class="note" id="asy-war-note"></p>
    </div>
    <div class="block__body">
      <div class="asy-key" id="asy-war-key"></div>
      <div class="chart" id="asy-war-share"></div>
      <h3 class="asy-sub" id="asy-war-sub"></h3>
      <div class="filters">
        <div class="seg asy-scope" id="asy-war-scope" role="group" aria-label="Applied in"></div>
        <div class="seg" id="asy-war-scale" role="group" aria-label="Scale for deaths"></div>
      </div>
      <div class="asy-key" id="asy-war-pkey"></div>
      <div class="asy-panelgrid" id="asy-war-panels"></div>
      <details class="tableview"><summary>Table: every month</summary><div class="tablewrap" id="asy-war-table"></div></details>
    </div>
  </section>

  <section class="block" aria-labelledby="asy-h-dec">
    <div class="block__rail">
      <h2 id="asy-h-dec">What happens to an application${DOT}</h2>
      <p>An administrative or judicial body examines the application and takes a first decision, which can be appealed; the final decision may differ. Eurostat counts these first-instance decisions by outcome: refugee status, subsidiary protection, humanitarian status under national law, or rejection. Temporary protection granted at first instance is a separate category and not part of these figures.</p>
      <p id="asy-dec-text"></p>
      <p class="note" id="asy-dec-note"></p>
    </div>
    <div class="block__body">
      <div class="asy-proc" role="img" aria-label="Where each statistic sits in the asylum procedure">
        <div class="asy-step asy-step--key"><b>Asylum application</b><span>first-time or subsequent; counted when lodged, from July 2026 when registered</span><code>migr_asyappctzm · monthly</code></div>
        <div class="asy-arrow" aria-hidden="true"></div>
        <div class="asy-step"><b>First-instance decision</b><span>by an administrative or judicial body</span><code>migr_asydcfstq · quarterly</code></div>
        <div class="asy-arrow" aria-hidden="true"></div>
        <div class="asy-branch">
          <div class="asy-step"><b>Protection granted</b><span>refugee status, subsidiary protection or humanitarian status under national law</span></div>
          <div class="asy-step"><b>Rejected</b><span>including applications found inadmissible; can be appealed. Final decisions on appeal (migr_asydcfina) are not shown here.</span></div>
        </div>
        <div class="asy-step asy-step--apart"><b>Temporary protection: a separate procedure</b><span>people fleeing the war in Ukraine; counted as people holding it at month-end, never added to applications</span><code>migr_asytpsm · monthly</code></div>
      </div>
      <div class="filters">
        <div class="asy-slider" id="asy-dec-year"></div>
        <div class="seg asy-scope" id="asy-dec-scope" role="group" aria-label="Decided in"></div>
      </div>
      <div class="asy-key" id="asy-dec-key"></div>
      <div class="chart asy-dec" id="asy-dec"></div>
      <details class="tableview"><summary>Table: decisions by citizenship</summary><div class="tablewrap" id="asy-dec-table"></div></details>
      <h3 class="asy-subhead" id="asy-dect-head"></h3>
      <p class="asy-dect-text" id="asy-dect-text"></p>
      <div class="chart asy-dect" id="asy-dect"></div>
      <p class="note" id="asy-dect-note"></p>
      <details class="tableview"><summary>Table: every year</summary><div class="tablewrap" id="asy-dect-table"></div></details>
    </div>
  </section>

  <section class="block" aria-labelledby="asy-h-tp">
    <div class="block__rail">
      <h2 id="asy-h-tp">A different door: temporary protection${DOT}</h2>
      <p>Since March 2022, people fleeing the war in Ukraine can receive temporary protection in the EU, and protection status S in Switzerland, without applying for asylum. This chart counts the people holding it at the end of each month: a number of people at one moment, on its own scale, never added to the applications above.</p>
      <p id="asy-tp-text"></p>
      <p class="note" id="asy-tp-note"></p>
    </div>
    <div class="block__body">
      <div class="filters"><div class="seg" id="asy-tp-mode" role="group" aria-label="Measure"></div></div>
      <div class="asy-key" id="asy-tp-key"></div>
      <div class="chart" id="asy-tp"></div>
      <details class="tableview"><summary>Table: every month</summary><div class="tablewrap" id="asy-tp-table"></div></details>
    </div>
  </section>

  <section class="foot glossary" aria-labelledby="asy-h-how">
    <div><h2 id="asy-h-how">Method and sources${DOT}</h2></div>
    <div>
      <dl id="asy-glossary"></dl>
      <p class="credit" id="asy-credit"></p>
    </div>
  </section>
</div>`;

  // ---------- helpers ----------
  const $ = (sel) => root.querySelector(sel.replace(/#([\w-]+)/g, '#asy-$1'));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = d3.format(',');
  const f1 = d3.format(',.1f');
  const f2 = d3.format(',.2f');
  const pctOf = (a, b) => (b ? Math.round((100 * a) / b) : null);
  const share = (a, b) => { const p = (100 * a) / b; return p < 0.05 ? '<0.1%' : f1(p) + '%'; };
  const rate = (v) => (v == null ? '–' : v >= 10 ? f1(v) : f2(v));
  const parseM = d3.timeParse('%Y-%m');
  const monthName = d3.timeFormat('%B %Y');
  const monthShort = d3.timeFormat('%b %Y');
  const mName = (m) => monthName(parseM(m));
  const mShort = (m) => monthShort(parseM(m));
  const andList = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
  const dayOf = (t) => d3.timeFormat('%-d %B %Y')(d3.timeParse('%Y-%m-%d %H:%M')(t));
  // Eurostat marks two names with an asterisk; its footnotes, word for word
  const FOOT = {
    XK: 'Kosovo*: this designation is without prejudice to positions on status, and is in line with UNSCR 1244/1999 and the ICJ Opinion on the Kosovo Declaration of Independence.',
    PS: 'Palestine*: this designation shall not be construed as recognition of a State of Palestine and is without prejudice to the individual positions of the Member States on this issue.',
  };
  const footFor = (codes) => [...new Set(codes)].filter((c) => FOOT[c]).map((c) => ' ' + FOOT[c]).join('');
  const UKRAINE = 'Since March 2022, people fleeing the war in Ukraine can receive temporary protection in the EU (protection status S in Switzerland) without applying for asylum; receiving it is not counted as an asylum application.';
  // Eurostat's method notes (migr_asytp_esms, 15.2): until these months, figures of these countries included people whose temporary protection was no longer valid
  const TP_BREAKS = { '2023-01': 'the Netherlands', '2024-02': 'Bulgaria', '2024-07': 'Germany', '2025-06': 'Italy' };
  const TP_META = 'https://ec.europa.eu/eurostat/cache/metadata/EN/migr_asytp_esms.htm';
  const SEM_URL = 'https://www.admin.ch/de/newnsb/iiAHV0k5TFjK';
  const PUBLISHED = '2026-11-12';   // the day the page went public (Method and sources, Changes)
  const BREAK = '2026-07';          // Eurostat counts registered instead of lodged applications from this month
  const TRANSITION = '2026-06';
  const DEF_WORD = { lodged: 'lodged applications', transition: 'transition month', registered: 'registered applications' };
  const state = { pulse: 'n', topScope: 'EU27_2020', topScale: 'own', year: null, mapScope: '31', cit: null, decScope: 'EU27_2020', tpMode: 'n', flowYear: null, decYear: null, decCit: 'EXT_EU27_2020', warScope: 'EU27_2020', warScale: 'own' };

  async function getJSON(path) {
    const r = await fetch(BASE + path + '?m=' + Math.floor(Date.now() / 60000), { cache: 'no-cache' });
    if (!r.ok) throw new Error('Could not load ' + BASE + path + ' (' + r.status + ').');
    return r.json();
  }

  function onWidth(el, draw) {
    let last = -1;
    const run = () => { const w = Math.round(el.clientWidth); if (w && w !== last) { last = w; draw(); } };
    if ('ResizeObserver' in window) new ResizeObserver(() => requestAnimationFrame(run)).observe(el);
    else window.addEventListener('resize', run);
    run();
    return () => { last = -1; run(); };
  }

  function tooltip(container) {
    const tip = document.createElement('div');
    tip.className = 'tooltip';
    tip.hidden = true;
    tip.setAttribute('role', 'status');
    container.appendChild(tip);
    return {
      el: tip,                                                    // re-attached after each redraw empties the chart
      show(html, x, y) {
        tip.innerHTML = html;
        tip.hidden = false;
        const cw = container.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
        let left = x + 14;
        if (left + tw > cw) left = Math.max(0, x - tw - 14);
        let top = y - th - 12;
        if (top < 0) top = y + 16;
        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
      },
      hide() { tip.hidden = true; },
    };
  }

  // hover for a small-multiple panel: a focus line, a dot on the line, the tooltip in the panel grid
  function panelHover(svg, grid, tip, x, w, yTop, yBottom, at) {
    const focus = svg.append('line').attr('class', 'asy-focus').attr('y1', yTop).attr('y2', yBottom).style('display', 'none');
    const dot = svg.append('circle').attr('r', 3).style('display', 'none');
    const off = () => { tip.hide(); focus.style('display', 'none'); dot.style('display', 'none'); };
    svg.append('rect').attr('class', 'overlay').attr('x', 0).attr('y', 0).attr('width', w).attr('height', yBottom)
      .on('pointermove click', (ev) => {
        const m = d3.timeFormat('%Y-%m')(d3.timeMonth.round(x.invert(d3.pointer(ev)[0])));
        const hit = at(m);
        if (!hit) { off(); return; }
        const fx = x(parseM(m));
        focus.style('display', null).attr('x1', fx).attr('x2', fx);
        if (hit.y != null) dot.attr('class', hit.cls).attr('cx', fx).attr('cy', hit.y).style('display', null); else dot.style('display', 'none');
        const [px, py] = d3.pointer(ev, grid);
        tip.show(hit.html, px, py);
      })
      .on('pointerleave', off);
  }

  const LISTENERS = { pulse: [], topScope: [], topScale: [], year: [], mapScope: [], cit: [], decScope: [], tpMode: [], flowYear: [], decYear: [], decCit: [], warScope: [], warScale: [] };
  function fillSeg(el, items, key) {
    el.innerHTML = '';
    items.forEach(([v, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.dataset.v = v;
      b.dataset.key = key;
      b.setAttribute('aria-pressed', String(String(state[key]) === String(v)));
      b.addEventListener('click', () => setState(key, typeof state[key] === 'number' ? +v : v));
      el.appendChild(b);
    });
  }
  // a year slider (Bauhaus: one rule, a red dot as the handle, a tick and a label per year): keeps its width as years are added.
  // A native range input underneath, so keys, touch and screen readers work as they do everywhere.
  function fillSlider(el, years, key, label) {
    const n = years.length, at = (i) => (n > 1 ? (100 * i) / (n - 1) : 0);
    el.innerHTML = `<input type="range" min="0" max="${n - 1}" step="1" data-key="${key}" aria-label="${label}">` +
      `<div class="asy-slider__ticks" aria-hidden="true">${years.map((y, i) => `<span class="asy-slider__tick" data-v="${y}" style="left:${at(i)}%">${y}</span>`).join('')}</div>`;
    const input = el.querySelector('input');
    el._years = years;
    input.value = String(Math.max(0, years.indexOf(state[key])));
    let raf = 0;
    input.addEventListener('input', () => {
      markSlider(el, years[+input.value]);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setState(key, years[+input.value]));
    });
    markSlider(el, state[key]);
    // years too close for every label: only the first, the last and the chosen one are written
    onWidth(el, () => el.classList.toggle('is-dense', n > 1 && (el.clientWidth - 12) / (n - 1) < 44));
  }
  function markSlider(el, y) {
    const input = el.querySelector('input');
    input.setAttribute('aria-valuetext', String(y));
    const ticks = [...el.querySelectorAll('.asy-slider__tick')], i = ticks.findIndex((t) => String(t.dataset.v) === String(y));
    // when labels are sparse, the chosen year's label would touch a neighbouring end label: that one steps aside
    ticks.forEach((t, k) => t.classList.toggle('is-on', k === i));
    ticks.forEach((t, k) => t.classList.toggle('is-hide', (k === 0 && i === 1) || (k === ticks.length - 1 && i === ticks.length - 2)));
  }
  function setState(key, v) {
    if (state[key] === v) return;
    state[key] = v;
    root.querySelectorAll(`.seg button[data-key="${key}"]`)
      .forEach((b) => b.setAttribute('aria-pressed', String(String(b.dataset.v) === String(v))));
    root.querySelectorAll(`.asy-slider input[data-key="${key}"]`).forEach((input) => {
      const el = input.parentNode, i = el._years.indexOf(v);
      if (i >= 0 && +input.value !== i) input.value = String(i);
      markSlider(el, v);
    });
    LISTENERS[key].forEach((fn) => fn());
  }
  const on = (keys, fn) => keys.forEach((k) => LISTENERS[k].push(fn));

  function topoReader(topo) {
    const t = topo.transform;
    const arcs = topo.arcs.map((a) => {
      if (!t) return a;
      let x = 0, y = 0;
      return a.map(([dx, dy]) => { x += dx; y += dy; return [x * t.scale[0] + t.translate[0], y * t.scale[1] + t.translate[1]]; });
    });
    const arc = (i) => (i < 0 ? arcs[~i].slice().reverse() : arcs[i]);
    const ring = (ids) => { const pts = []; ids.forEach((i, k) => { const a = arc(i); pts.push(...(k ? a.slice(1) : a)); }); return pts; };
    const polys = (g) => (g.type === 'Polygon' ? [g.arcs] : g.type === 'MultiPolygon' ? g.arcs : []);
    // d3-geo wants polygons wound clockwise; one wound the other way would cover the rest of the globe
    const wind = (p) => (d3.geoArea({ type: 'Polygon', coordinates: p }) > 2 * Math.PI ? p.map((r) => r.slice().reverse()) : p);
    return {
      features(obj) {
        return obj.geometries.filter((g) => g.arcs).map((g) => ({
          type: 'Feature', id: g.properties.id, properties: g.properties || {},
          geometry: { type: 'MultiPolygon', coordinates: polys(g).map((p) => wind(p.map(ring))) },
        }));
      },
    };
  }
  // the point to put a circle on: the centroid of a country's largest part (so France's sits in France)
  function anchor(f) {
    let best = null, area = -1;
    f.geometry.coordinates.forEach((p) => {
      const a = d3.geoArea({ type: 'Polygon', coordinates: p });
      if (a > area) { area = a; best = p; }
    });
    return d3.geoCentroid({ type: 'Polygon', coordinates: best });
  }

  // ---------- data ----------
  let MONTHLY = [], TOP = [], YEARS = [], FLOWS = [], ORIGINS = [], META = [], REGIMES = [], REPORTERS = [], WORLD = [], DECISIONS = [], TP = [], UNHCR_HOSTS = [], UNHCR_WORLD = [], CONFLICT = [], SHARE = [], UCDP_META = [], WAR_YEARS = [], EVENTS = [], EVENT_REVIEWS = [], CHANGES = [], DEC_YEARS = [];
  const HOSTS = new Map();
  const REPORTER = new Map();
  const REP31 = new Set(), EU27 = new Set();   // the 31 countries of application; the EU member states among them
  async function hosts(year) {
    if (!HOSTS.has(year)) HOSTS.set(year, await getJSON(`data/hosts_${year}.json`));
    return HOSTS.get(year);
  }
  const series = (g) => MONTHLY.filter((r) => r.g === g);
  const lastOf = (g) => { const s = series(g); return s[s.length - 1]; };
  const rowAt = (g, m) => MONTHLY.find((r) => r.g === g && r.m === m);
  const yearRow = (y) => YEARS.find((r) => r.y === y);
  const changeWord = (a, b) => {
    const p = Math.round((100 * (a - b)) / b);
    return p === 0 ? 'about as many as' : Math.abs(p) + (p < 0 ? '% fewer than' : '% more than');
  };
  const crossesBreak = (m0, m1) => m0 < BREAK && m1 >= TRANSITION;
  // the places to compare: Eurostat's EU total (ink), Switzerland (red) and Germany (blue)
  const placeName = (g) => (g === 'CH' ? 'Switzerland' : g === 'DE' ? 'Germany' : 'the EU');
  const placeShort = (g) => (g === 'EU27_2020' ? 'EU' : placeName(g));
  const placeMod = (g) => (g === 'CH' ? '--ch' : g === 'DE' ? '--de' : '');
  const lineCls = (g, more = '') => 'asy-line' + (placeMod(g) ? ' asy-line' + placeMod(g) : '') + more;
  const dotCls = (g) => 'asy-dot' + (placeMod(g) ? ' asy-dot' + placeMod(g) : '');

  // ---------- hero ----------
  function drawHero() {
    const eu = lastOf('EU27_2020'), ch = lastOf('CH');
    $('#hero-eu-label').textContent = 'European Union, ' + mName(eu.m);
    $('#hero-eu').textContent = num(eu.v);
    $('#hero-eu-text').innerHTML = `First-time asylum applicants who are not EU citizens, in the 27 member states${eu.p ? ' (provisional)' : ''}: ` +
      `${f1(eu.r)} per 100,000 inhabitants.`;
    $('#hero-eu-note').textContent = 'Last 24 months.' + (eu.m >= BREAK ? ' Dashed: July 2026, when Eurostat began counting registered instead of lodged applications; months before and after are not directly comparable.' : '');
    $('#hero-ch-label').textContent = 'Switzerland, ' + mName(ch.m);
    $('#hero-ch').textContent = num(ch.v);
    const chSame = rowAt('CH', eu.m);
    $('#hero-ch-text').innerHTML = `First-time applicants who are not EU citizens${ch.p ? ' (provisional)' : ''}: ${f1(ch.r)} per 100,000 inhabitants.` +
      (ch.m !== eu.m && chSame ? ` In ${mName(eu.m)}, the latest month with an EU total: ${f1(chSame.r)}, against ${f1(eu.r)} in the EU.` : '');
    $('#hero-ch-note').textContent = 'Last 24 months.' + (ch.m >= BREAK ? ' Dashed: July 2026, Eurostat\u2019s change of definition (see Method and sources).' : '');
    // Germany, the largest EU country of application, for comparison (blue, as everywhere on the page)
    const de = lastOf('DE'), deSame = rowAt('DE', eu.m);
    $('#hero-de-label').textContent = 'Germany, ' + mName(de.m);
    $('#hero-de').textContent = num(de.v);
    $('#hero-de-text').innerHTML = `First-time applicants who are not EU citizens${de.p ? ' (provisional)' : ''}: ${f1(de.r)} per 100,000 inhabitants.` +
      (de.m !== eu.m && deSame ? ` In ${mName(eu.m)}, the latest month with an EU total: ${f1(deSame.r)}, against ${f1(eu.r)} in the EU.` : '');
    $('#hero-de-note').textContent = 'Last 24 months.' + (de.m >= BREAK ? ' Dashed: July 2026, Eurostat\u2019s change of definition (see Method and sources).' : '');
    spark($('#spark-eu'), 'EU27_2020');
    spark($('#spark-ch'), 'CH');
    spark($('#spark-de'), 'DE');
  }
  function spark(el, g) {
    onWidth(el, () => {
      const s = series(g).slice(-24), W = el.clientWidth, H = 44;
      const x = d3.scaleLinear().domain([0, s.length - 1]).range([2, W - 2]);
      const y = d3.scaleLinear().domain([0, d3.max(s, (d) => d.v)]).nice().range([H - 2, 4]);
      const svg = d3.select(el).html('').append('svg').attr('width', W).attr('height', H + 16)
        .attr('role', 'img').attr('aria-label', `Last 24 months, ${mName(s[0].m)} to ${mName(s[s.length - 1].m)}`);
      const bi = s.findIndex((d) => d.m >= BREAK);
      if (bi > 0) svg.append('line').attr('class', 'asy-break').attr('x1', x(bi - 0.5)).attr('x2', x(bi - 0.5)).attr('y1', 0).attr('y2', H);
      svg.append('path').attr('class', lineCls(g)).attr('d', d3.line().x((d, i) => x(i)).y((d) => y(d.v))(s));
      svg.append('text').attr('x', 2).attr('y', H + 13).text(mShort(s[0].m));
      svg.append('text').attr('x', W - 2).attr('y', H + 13).attr('text-anchor', 'end').text(mShort(s[s.length - 1].m));
      // a simple tooltip: the month under the pointer, its number and rate
      const item = el.parentNode, tip = item._tip || (item._tip = tooltip(item));
      item.appendChild(tip.el);
      const focus = svg.append('line').attr('class', 'asy-focus').attr('y1', 0).attr('y2', H).style('display', 'none');
      const dot = svg.append('circle').attr('class', dotCls(g)).attr('r', 3).style('display', 'none');
      const off = () => { tip.hide(); focus.style('display', 'none'); dot.style('display', 'none'); };
      svg.append('rect').attr('class', 'overlay').attr('width', W).attr('height', H)
        .on('pointermove click', (ev) => {
          const i = Math.max(0, Math.min(s.length - 1, Math.round(x.invert(d3.pointer(ev)[0])))), d = s[i];
          focus.style('display', null).attr('x1', x(i)).attr('x2', x(i));
          dot.style('display', null).attr('cx', x(i)).attr('cy', y(d.v));
          const [px, py] = d3.pointer(ev, item);
          tip.show(`<div class="tt__meta">${mName(d.m)}</div><dl class="tt__rows">` +
            `<div><dt>First-time applicants</dt><dd>${num(d.v)}</dd></div><div><dt>per 100,000 inhabitants</dt><dd>${f1(d.r)}</dd></div></dl>` +
            (d.p ? '<p class="tt__note">Provisional.</p>' : '') +
            (d.m >= BREAK ? '<p class="tt__note">Registered applications (Eurostat&rsquo;s definition from July 2026).</p>' : d.m >= TRANSITION ? '<p class="tt__note">Transition month between the two definitions.</p>' : ''), px, py);
        })
        .on('pointerleave', off);
    });
  }

  // ---------- most refugees live in neighbouring countries (UNHCR, a stock at year-end) ----------
  const GT_URL = 'https://www.unhcr.org/sites/default/files/2026-06/global-trends-report-2025.pdf';
  function drawNear() {
    const el = $('#near');
    const tip = el._tip || (el._tip = tooltip(el));
    const w = UNHCR_WORLD[UNHCR_WORLD.length - 1], year = w.y;
    const hosts = UNHCR_HOSTS.filter((r) => r.y === year);
    const byIso = new Map(WORLD.filter((f) => f.properties.iso3).map((f) => [f.properties.iso3, f]));
    const at = new Map(WORLD.map((f) => [f.id, anchor(f)]));
    const val = (r) => r.v;
    const render = () => {
      const W = el.clientWidth, H = Math.round(W * 0.5);
      const proj = d3.geoEqualEarth().fitExtent([[2, 2], [W - 2, H - 2]], { type: 'Sphere' });
      const path = d3.geoPath(proj);
      const svg = d3.select(el).html('').append('svg').attr('width', W).attr('height', H).attr('role', 'img')
        .attr('aria-label', `World map: refugees and others in need of international protection by country where they live, end of ${year}`);
      el.appendChild(tip.el);
      svg.append('path').attr('class', 'asy-sphere').attr('d', path({ type: 'Sphere' }));
      svg.append('g').selectAll('path').data(WORLD).join('path').attr('d', path)
        .attr('class', (f) => 'asy-land' + (REP31.has(f.id) ? ' asy-land--rep' : ''));
      const max = d3.max(hosts, (r) => r.v);
      const rad = d3.scaleSqrt().domain([0, max]).range([0, Math.max(14, W / 26)]);
      const shown = hosts.filter((r) => byIso.has(r.h) && val(r) > 0).sort((a, b) => val(b) - val(a));
      svg.append('g').selectAll('circle').data(shown).join('circle').attr('class', 'asy-stock')
        .attr('r', (r) => Math.max(1, rad(val(r))))
        .attr('cx', (r) => proj(at.get(byIso.get(r.h).id))[0]).attr('cy', (r) => proj(at.get(byIso.get(r.h).id))[1])
        .on('pointermove click', (ev, r) => {
          const [px, py] = d3.pointer(ev, el);
          tip.show(`<div class="tt__meta">End of ${year}</div><div class="tt__title">${esc(r.n)}</div>
            <dl class="tt__rows"><div><dt>Refugees and others in need</dt><dd>${num(r.v)}</dd></div>
            ${r.ua > 0 ? `<div><dt>of them from Ukraine</dt><dd>${num(r.ua)}</dd></div>` : ''}</dl>` +
            (r.o && r.o.length ? `<p class="tt__note">Largest groups by origin: ${r.o.map(([n, v]) => `${esc(n)} ${num(+v)}`).join('; ')}.</p>` : ''), px, py);
        })
        .on('pointerleave', () => tip.hide());
      const sizes = [500000, 1000000, 2500000].filter((v) => v <= max);
      $('#near-key').innerHTML = '<span class="asy-sizes">' + sizes.map((v) => { const d = 2 * rad(v);
          return `<svg width="${Math.ceil(d) + 2}" height="${Math.ceil(d) + 2}" aria-hidden="true"><circle class="asy-stock" cx="${d / 2 + 1}" cy="${d / 2 + 1}" r="${d / 2}"/></svg>${v >= 1e6 ? f1(v / 1e6).replace('.0', '') + ' million' : num(v)}`; }).join('') +
        '</span><span>Circle area: refugees and others in need of international protection living in the country</span>' +
        '<span><i class="asy-sw asy-sw--rep"></i>One of the 31 countries of application</span>';
    };
    onWidth(el, render);
    // the claims: Europe's share, with and without Ukrainians, and the largest hosts (all from UNHCR's data)
    const top = hosts.slice().sort((a, b) => b.v - a.v).slice(0, 5);
    const pct1 = (a, b) => f1((100 * a) / b);
    $('#near-text').innerHTML = `At the end of ${year}, UNHCR counted ${num(w.v)} refugees and others in need of international protection under its mandate. ` +
      `The 31 countries hosted ${num(w.e)} of them (${pct1(w.e, w.v)}%), ${num(w.eua)} from Ukraine; without Ukrainians, their share was ${pct1(w.e - w.eua, w.v - w.ua)}%. ` +
      `The largest hosts: ${top.map((r) => `${esc(r.n)} (${num(r.v)})`).join(', ')}.` +
      (year === 2025 ? ` UNHCR&rsquo;s <a href="${GT_URL}">Global Trends 2025</a> report puts 65% of refugees in countries neighbouring their own, and 68% of refugees and others in need in low- and middle-income countries.` : '');
    const off = hosts.filter((r) => !byIso.has(r.h) && r.v > 0).sort((a, b) => b.v - a.v);
    $('#near-note').innerHTML = `Source: UNHCR Refugee Population Statistics Database, end-${year} figures (fetched ${dayOf(w.fetched)}); a number of people at one moment, not applications. ` +
      `Not counted here: Palestine refugees under the mandate of UNRWA, and people displaced inside their own country. Asylum-seekers awaiting a decision are a separate count: ${num(w.as)} at the end of ${year}. ` +
      'The Ukrainians in UNHCR\u2019s figures for the 31 countries are largely the same people as Eurostat\u2019s holders of temporary protection further down: two sources, not two groups, so the figures are not added. ' +
      (off.length ? `Hosts without an area on this map: ${off.map((r) => `${esc(r.n)} ${num(r.v)}`).join('; ')}.` : '');
    $('#near-table').innerHTML = `<table><thead><tr><th>Country where they live</th><th class="num">Refugees and others in need</th><th class="num">of them from Ukraine</th><th class="num">Share of the world</th></tr></thead><tbody>` +
      hosts.slice().sort((a, b) => b.v - a.v).map((r) => `<tr><td>${esc(r.n)}${r.e ? ' ·' : ''}</td><td class="num">${num(r.v)}</td><td class="num">${num(r.ua)}</td><td class="num">${share(r.v, w.v)}</td></tr>`).join('') +
      '</tbody></table><p class="note asy-tnote">· = one of the 31 countries of application.</p>';
  }

  // ---------- month by month ----------
  function drawPulse() {
    const el = $('#pulse');
    fillSeg($('#pulse-mode'), [['n', 'Number, EU'], ['r', 'Per 100,000 inhabitants']], 'pulse');
    const tip = el._tip || (el._tip = tooltip(el));
    const key = $('#pulse-key');
    const render = () => {
      const rate = state.pulse === 'r';
      key.innerHTML = '<span><i class="asy-ln"></i>European Union (Eurostat&rsquo;s total)</span>' +
        (rate ? '<span><i class="asy-ln asy-ln--ch"></i>Switzerland</span><span><i class="asy-ln asy-ln--de"></i>Germany</span>' : '') +
        '<span><i class="asy-sw asy-sw--break"></i>July 2026: Eurostat&rsquo;s change of definition</span>';
      const W = el.clientWidth, H = Math.max(260, Math.min(400, Math.round(W * 0.48)));
      const M = { t: 18, r: 14, b: 26, l: rate ? 40 : 58 };
      const eu = series('EU27_2020'), ch = series('CH'), de = series('DE');
      const all = rate ? eu.concat(ch, de) : eu;
      const get = (d) => (rate ? d.r : d.v);
      const x = d3.scaleTime().domain([parseM(eu[0].m), d3.max(all, (d) => parseM(d.m))]).range([M.l, W - M.r]);
      const y = d3.scaleLinear().domain([0, d3.max(all, get)]).nice().range([H - M.b, M.t]);
      const svg = d3.select(el).html('').append('svg').attr('width', W).attr('height', H).attr('role', 'img')
        .attr('aria-label', rate ? 'First-time applicants per 100,000 inhabitants per month, EU, Switzerland and Germany' : 'First-time applicants per month in the EU');
      el.appendChild(tip.el);
      svg.append('g').attr('class', 'grid').selectAll('line').data(y.ticks(5)).join('line')
        .attr('x1', M.l).attr('x2', W - M.r).attr('y1', y).attr('y2', y);
      svg.append('g').attr('class', 'axis axis--y').attr('transform', `translate(${M.l},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(rate ? d3.format(',') : d3.format('~s')).tickSize(0)).call((g) => g.select('.domain').remove());
      svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - M.b})`)
        .call(d3.axisBottom(x).ticks(d3.timeYear.every(W > 620 ? 1 : 2)).tickFormat(d3.timeFormat('%Y')).tickSizeOuter(0));
      // the definition change: June 2026 as a band, July 2026 as a line
      const xt = x(parseM(TRANSITION)), xb = x(parseM(BREAK));
      if (xb <= W - M.r) {
        svg.append('rect').attr('class', 'asy-transition').attr('x', xt).attr('width', Math.max(1, xb - xt)).attr('y', M.t).attr('height', H - M.b - M.t);
        svg.append('line').attr('class', 'asy-break').attr('x1', xb).attr('x2', xb).attr('y1', M.t - 6).attr('y2', H - M.b);
      }
      const line = d3.line().defined((d) => get(d) != null).x((d) => x(parseM(d.m))).y((d) => y(get(d)));
      svg.append('path').attr('class', 'asy-line').attr('d', line(eu));
      if (rate) {
        svg.append('path').attr('class', lineCls('DE')).attr('d', line(de));
        svg.append('path').attr('class', lineCls('CH')).attr('d', line(ch));
      }
      // the highest month of each line shown, labelled from the data
      const mark = (sr, cls, label) => {
        const pk = sr.reduce((a, d) => (get(d) > get(a) ? d : a), sr[0]);
        const px = x(parseM(pk.m)), left = px > W - 200;
        svg.append('circle').attr('class', cls).attr('r', 3).attr('cx', px).attr('cy', y(get(pk)));
        svg.append('text').attr('class', 'asy-label').attr('x', left ? px - 7 : px + 7).attr('y', y(get(pk)) + 4).attr('text-anchor', left ? 'end' : 'start')
          .text(`${label}${mShort(pk.m)}: ${rate ? f1(get(pk)) : num(get(pk))}`);
      };
      mark(eu, 'asy-dot', rate ? 'EU, ' : '');
      if (rate) { mark(ch, dotCls('CH'), 'Switzerland, '); mark(de, dotCls('DE'), 'Germany, '); }
      // hover
      const focus = svg.append('line').attr('class', 'asy-focus').attr('y1', M.t).attr('y2', H - M.b).style('display', 'none');
      svg.append('rect').attr('class', 'overlay').attr('x', M.l).attr('y', M.t).attr('width', W - M.l - M.r).attr('height', H - M.t - M.b)
        .on('pointermove', (ev) => {
          const [px] = d3.pointer(ev);
          const m = d3.timeFormat('%Y-%m')(d3.timeMonth.round(x.invert(px)));
          const e = rowAt('EU27_2020', m), c = rowAt('CH', m), dd = rowAt('DE', m);
          if (!e && !c && !dd) { tip.hide(); focus.style('display', 'none'); return; }
          focus.style('display', null).attr('x1', x(parseM(m))).attr('x2', x(parseM(m)));
          const row = (lab, d) => (d ? `<div><dt>${lab}</dt><dd>${rate ? f1(d.r) : num(d.v)}${d.p ? ' p' : ''}</dd></div>` : `<div><dt>${lab}</dt><dd>not yet reported</dd></div>`);
          const def = (e || c || dd).d;
          tip.show(`<div class="tt__meta">${mName(m)} · Eurostat: ${DEF_WORD[def]}</div>
            <dl class="tt__rows">${row('EU', e)}${rate ? row('Switzerland', c) + row('Germany', dd) : ''}</dl>
            <p class="tt__note">${rate ? 'Per 100,000 inhabitants.' : 'First-time applicants, not EU citizens.'}${[e, c, dd].some((d) => d && d.p) ? ' p = provisional.' : ''}</p>`, px, d3.pointer(ev)[1]);
        })
        .on('pointerleave', () => { tip.hide(); focus.style('display', 'none'); });
    };
    onWidth(el, render);
    on(['pulse'], render);
    // the claim: the latest full year against the one before (Eurostat's annual figures)
    const y1 = YEARS[YEARS.length - 1], y0 = YEARS[YEARS.length - 2];
    const prov = (y1.pg || []).map((g) => REPORTER.get(g)).filter(Boolean);
    $('#pulse-text').innerHTML = `In ${y1.y}, ${num(y1.eu)} first-time applicants who are not EU citizens applied in EU countries, ${changeWord(y1.eu, y0.eu)} in ${y0.y} (${num(y0.eu)}). ` +
      `In Switzerland: ${num(y1.ch)}, ${changeWord(y1.ch, y0.ch)} in ${y0.y}; in Germany: ${num(y1.de)}, ${changeWord(y1.de, y0.de)} in ${y0.y}. ` +
      `Per 1,000 inhabitants: ${f1(y1.chr)} in Switzerland, ${f1(y1.der)} in Germany, ${f1(y1.eur)} in the EU.` +
      (prov.length ? ` ${prov.join(', ')}: ${y1.y} figure${prov.length > 1 ? 's' : ''} provisional.` : '');
    const eu = lastOf('EU27_2020');
    const chL = lastOf('CH'), deL = lastOf('DE');
    const ann = META.find((r) => r.ds === 'migr_asyappctza');
    $('#pulse-note').innerHTML = `EU total through ${mName(eu.m)}, Switzerland through ${mName(chL.m)}, Germany through ${mName(deL.m)}: countries report to Eurostat at different times. ` +
      'From July 2026 Eurostat counts registered instead of lodged applications (EU Pact on Migration and Asylum); June 2026 is a transition month. ' +
      `Eurostat rounds every figure to the nearest 5 and revises figures: the yearly ones here are from its update of ${dayOf(ann.upd)}, so they can differ slightly from its earlier news releases.` +
      (y1.y === 2025 ? ` Switzerland&rsquo;s State Secretariat for Migration (SEM) counts differently: all asylum applications, among them 5,481 for births, family reunification, repeat applications and people already living in Switzerland; 25,781 in 2025, 7.1% fewer than in 2024 (<a href="${SEM_URL}">press release of 19 February 2026</a>). Its figures and Eurostat&rsquo;s are not directly comparable.` : '');
    // table
    const rows = [...new Set(MONTHLY.map((d) => d.m))].sort(d3.descending)
      .map((m) => ({ m, e: rowAt('EU27_2020', m), c: rowAt('CH', m), dd: rowAt('DE', m) }));
    const cells = (d) => `<td class="num">${d ? num(d.v) + (d.p ? ' p' : '') : '–'}</td><td class="num">${d && d.r != null ? f2(d.r) : '–'}</td>`;
    $('#pulse-table').innerHTML = `<table><thead><tr><th>Month</th><th class="num">EU</th><th class="num">EU per 100,000</th><th class="num">Switzerland</th><th class="num">CH per 100,000</th><th class="num">Germany</th><th class="num">DE per 100,000</th><th>Eurostat definition</th></tr></thead><tbody>` +
      rows.map((r) => `<tr><td class="date">${r.m}</td>${cells(r.e)}${cells(r.c)}${cells(r.dd)}<td>${DEF_WORD[(r.e || r.c || r.dd).d]}</td></tr>`).join('') + '</tbody></table>';
  }

  // ---------- the ten largest groups ----------
  function drawTop() {
    fillSeg($('#top-scope'), [['EU27_2020', 'European Union'], ['CH', 'Switzerland'], ['DE', 'Germany']], 'topScope');
    fillSeg($('#top-scale'), [['own', 'Each on its own scale'], ['same', 'Same scale for all']], 'topScale');
    const el = $('#panels');
    const tip = el._tip || (el._tip = tooltip(el));
    const render = () => {
      const g = state.topScope;
      const rows = TOP.filter((r) => r.g === g);
      const cits = d3.groups(rows, (r) => r.c).map(([c, rs]) => ({ c, n: rs[0].n, k: rs[0].k, l: rs[0].l, rs })).sort((a, b) => a.k - b.k);
      const last = series(g), m1 = last[last.length - 1].m, m0 = last[Math.max(0, last.length - 12)].m;
      const W = el.clientWidth, cols = W > 900 ? 5 : W > 560 ? 3 : 2, gap = 18;
      const pw = Math.floor((W - gap * (cols - 1)) / cols), ph = 92;
      const t0 = parseM(series(g)[0].m), t1 = parseM(m1);
      const x = d3.scaleTime().domain([t0, t1]).range([0, pw]);
      const own = state.topScale === 'own';
      const yOf = (rs) => d3.scaleLinear().domain([0, d3.max(rs, (r) => r.v)]).nice(3).range([ph - 14, 12]);
      const yAll = yOf(rows);
      el.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
      el.innerHTML = '';
      el.appendChild(tip.el);
      cits.forEach((ct) => {
        const p = document.createElement('div');
        p.className = 'asy-panel';
        p.innerHTML = `<div class="asy-panel__name">${esc(ct.n)}</div><div class="asy-panel__sub">${num(ct.l)} in 12 months</div>`;
        el.appendChild(p);
        const svg = d3.select(p).append('svg').attr('width', pw).attr('height', ph).attr('role', 'img')
          .attr('aria-label', `${ct.n}: first-time applicants per month since ${monthName(t0)}`);
        const y = own ? yOf(ct.rs) : yAll, top = y.domain()[1];
        svg.append('line').attr('class', 'asy-gridline').attr('x1', 0).attr('x2', pw).attr('y1', y(top)).attr('y2', y(top));
        svg.append('text').attr('x', 0).attr('y', y(top) - 3).text(num(top));
        const xb = x(parseM(BREAK));
        if (xb <= pw) svg.append('line').attr('class', 'asy-break').attr('x1', xb).attr('x2', xb).attr('y1', 0).attr('y2', ph - 14);
        svg.append('path').attr('class', lineCls(g, ' asy-line--thin'))
          .attr('d', d3.line().x((d) => x(parseM(d.m))).y((d) => y(d.v))(ct.rs));
        svg.append('text').attr('x', 0).attr('y', ph - 1).text(d3.timeFormat('%Y')(t0));
        svg.append('text').attr('x', pw).attr('y', ph - 1).attr('text-anchor', 'end').text(d3.timeFormat('%Y')(t1));
        panelHover(svg, el, tip, x, pw, 4, ph - 14, (m) => {
          const r = ct.rs.find((d) => d.m === m);
          return r && { y: y(r.v), cls: dotCls(g),
            html: `<div class="tt__meta">${mName(m)} · applied in ${placeName(g)}</div><div class="tt__title">${esc(ct.n)}</div>
              <dl class="tt__rows"><div><dt>First-time applicants</dt><dd>${num(r.v)}</dd></div></dl>` +
              (m >= TRANSITION ? `<p class="tt__note">Eurostat: ${DEF_WORD[m >= BREAK ? 'registered' : 'transition']}.</p>` : '') };
        });
      });
      const where = placeName(g);
      const lead = cits[0], second = cits[1];
      const peak = rows.reduce((a, b) => (b.v > a.v ? b : a));
      $('#top-text').innerHTML = `In ${where}, from ${mName(m0)} to ${mName(m1)}, the largest group was ${esc(lead.n)} (${num(lead.l)}), followed by ${esc(second.n)} (${num(second.l)}). ` +
        `The highest month for any of the ten since 2014: ${esc(peak.n)}, ${num(peak.v)} in ${mName(peak.m)}.`;
      $('#top-note').textContent = (own ? 'Each panel has its own scale (its top line is labelled), so the heights are not comparable between panels. ' : 'All panels share one scale (its top line is labelled). ') +
        (crossesBreak(m0, m1) ? 'These twelve months include July 2026, when Eurostat\u2019s definition changed (see Method and sources). ' : '') +
        'Twelve-month totals are sums of monthly figures, each rounded to the nearest 5.';
    };
    onWidth(el, render);
    on(['topScope', 'topScale'], render);
  }

  // ---------- who applies where ----------
  function drawFlows() {
    const years = YEARS.map((r) => r.y);
    fillSlider($('#flow-year'), years, 'flowYear', 'Year of the flow chart');
    const el = $('#sankey');
    const tip = el._tip || (el._tip = tooltip(el));
    const render = () => {
      const year = state.flowYear;
      const rows = FLOWS.filter((r) => r.y === year);
      const byGeo = d3.rollups(rows, (v) => d3.sum(v, (r) => r.v), (r) => r.g).sort((a, b) => d3.descending(a[1], b[1]));
      const W = el.clientWidth, narrow = W < 560;
      const nGeo = narrow ? 6 : 8;
      let shown = byGeo.slice(0, nGeo).map((d) => d[0]);
      ['CH', 'DE'].forEach((g) => { if (!shown.includes(g)) shown.push(g); });   // Switzerland and Germany always have their own node
      shown.sort((a, b) => d3.descending(byGeo.find((d) => d[0] === a)[1], byGeo.find((d) => d[0] === b)[1]));
      const rightOf = (g) => (shown.includes(g) ? g : 'OTHER_G');
      const cits = d3.groups(rows, (r) => r.c).map(([c, rs]) => ({ c, n: rs[0].n, k: rs[0].k, v: d3.sum(rs, (r) => r.v) })).sort((a, b) => a.k - b.k);
      const rights = shown.map((g) => ({ g, n: REPORTER.get(g) || g })).concat([{ g: 'OTHER_G', n: 'Other countries' }]);
      rights.forEach((r) => { r.v = d3.sum(rows.filter((d) => rightOf(d.g) === r.g), (d) => d.v); });
      const links = d3.rollups(rows, (v) => d3.sum(v, (r) => r.v), (r) => r.c, (r) => rightOf(r.g))
        .flatMap(([c, gs]) => gs.map(([g, v]) => ({ c, g, v }))).filter((l) => l.v > 0);
      const total = d3.sum(rows, (r) => r.v);
      const labW = narrow ? 112 : 168, H = narrow ? 440 : 500, gap = 6, nodeW = 10;
      const x0 = labW, x1 = W - labW - nodeW;
      const k = (H - gap * Math.max(cits.length, rights.length)) / total;
      let yy = 0; cits.forEach((c) => { c.y = yy; c.h = c.v * k; yy += c.h + gap; });
      yy = 0; rights.forEach((r) => { r.y = yy; r.h = r.v * k; yy += r.h + gap; });
      const lo = new Map(cits.map((c) => [c.c, c.y])), ro = new Map(rights.map((r) => [r.g, r.y]));
      const order = new Map(rights.map((r, i) => [r.g, i])), corder = new Map(cits.map((c, i) => [c.c, i]));
      links.sort((a, b) => corder.get(a.c) - corder.get(b.c) || order.get(a.g) - order.get(b.g));
      links.forEach((l) => { l.sy = lo.get(l.c); lo.set(l.c, l.sy + l.v * k); });
      links.slice().sort((a, b) => order.get(a.g) - order.get(b.g) || corder.get(a.c) - corder.get(b.c))
        .forEach((l) => { l.ty = ro.get(l.g); ro.set(l.g, l.ty + l.v * k); });
      const svg = d3.select(el).html('').append('svg').attr('width', W).attr('height', H + 4).attr('role', 'img')
        .attr('aria-label', `First-time applicants in ${year}, from citizenship to country of application`);
      el.appendChild(tip.el);
      const xm = (x0 + nodeW + x1) / 2;
      const band = (l) => { const a = x0 + nodeW, h = l.v * k;
        return `M${a},${l.sy}C${xm},${l.sy} ${xm},${l.ty} ${x1},${l.ty}L${x1},${l.ty + h}C${xm},${l.ty + h} ${xm},${l.sy + h} ${a},${l.sy + h}Z`; };
      const bands = svg.append('g').selectAll('path').data(links).join('path').attr('d', band)
        .attr('class', (l) => 'asy-band' + (l.c === 'OTHER' ? ' asy-band--other' : ''));
      const nodesL = svg.append('g').selectAll('g').data(cits).join('g');
      nodesL.append('rect').attr('class', 'asy-node').attr('x', x0).attr('y', (d) => d.y).attr('width', nodeW).attr('height', (d) => Math.max(1, d.h));
      nodesL.append('text').attr('class', 'asy-nodelabel').attr('x', x0 - 6).attr('y', (d) => d.y + d.h / 2 + 4).attr('text-anchor', 'end')
        .html((d) => (narrow ? esc(d.n.replace('All other citizenships', 'All others')) : `${esc(d.n)} <tspan class="asy-v">${num(d.v)}</tspan>`));
      const nodesR = svg.append('g').selectAll('g').data(rights).join('g');
      nodesR.append('rect').attr('class', 'asy-node').attr('x', x1).attr('y', (d) => d.y).attr('width', nodeW).attr('height', (d) => Math.max(1, d.h));
      nodesR.append('text').attr('class', 'asy-nodelabel').attr('x', x1 + nodeW + 6).attr('y', (d) => d.y + d.h / 2 + 4)
        .html((d) => (narrow ? esc(d.n.replace('Other countries', 'Others')) : `${esc(d.n)} <tspan class="asy-v">${num(d.v)}</tspan>`));
      const showBand = (ev, l) => {
        const c = cits.find((d) => d.c === l.c), r = rights.find((d) => d.g === l.g);
        const [px, py] = d3.pointer(ev, el);
        tip.show(`<div class="tt__meta">${year}</div><div class="tt__title">${esc(c.n)} &rarr; ${esc(r.n)}</div>
          <dl class="tt__rows"><div><dt>First-time applicants</dt><dd>${num(l.v)}</dd></div>
          <div><dt>Share of ${esc(c.n === 'All other citizenships' ? 'the rest' : c.n)}</dt><dd>${pctOf(l.v, c.v)}%</dd></div></dl>`, px, py);
      };
      // hover: the bands in question and the hovered country (or a band's two ends) turn red, the rest dims
      const hiNode = (pred, c, g) => {
        bands.classed('is-on', (l) => pred(l)).classed('is-dim', (l) => !pred(l));
        nodesL.select('rect').classed('is-on', (d) => d.c === c);
        nodesR.select('rect').classed('is-on', (d) => d.g === g);
      };
      const clear = () => { bands.classed('is-on', false).classed('is-dim', false); svg.selectAll('.asy-node').classed('is-on', false); };
      bands.on('pointermove click', (ev, l) => { hiNode((d) => d === l, l.c, l.g); showBand(ev, l); })
        .on('pointerleave', () => { clear(); tip.hide(); });
      nodesL.on('pointerenter', (ev, d) => hiNode((l) => l.c === d.c, d.c, null)).on('pointerleave', clear);
      nodesR.on('pointerenter', (ev, d) => hiNode((l) => l.g === d.g, null, d.g)).on('pointerleave', clear);
      // claim: the most and the least concentrated of the ten
      const named = cits.filter((c) => c.c !== 'OTHER').map((c) => {
        const r = d3.rollups(rows.filter((d) => d.c === c.c), (v) => d3.sum(v, (d) => d.v), (d) => d.g).sort((a, b) => d3.descending(a[1], b[1]))[0];
        return { ...c, g: r[0], share: r[1] / c.v };
      });
      const most = named.reduce((a, b) => (b.share > a.share ? b : a)), least = named.reduce((a, b) => (b.share < a.share ? b : a));
      const big = named[0];
      const ch = rights.find((r) => r.g === 'CH');
      $('#flow-text').innerHTML = `In ${year}, the 31 countries counted ${num(total)} first-time applicants who are not EU citizens. The largest group: ${esc(big.n)}, ${num(big.v)}. ` +
        `The most concentrated of the ten: ${esc(most.n)}, ${Math.round(100 * most.share)}% of them in ${esc(REPORTER.get(most.g))}. The most spread out: ${esc(least.n)}; the largest share of them, ${Math.round(100 * least.share)}%, applied in ${esc(REPORTER.get(least.g))}. ` +
        `Switzerland: ${num(ch.v)} (${f1((100 * ch.v) / total)}%).`;
      const yr = yearRow(year), prov = (yr.pg || []).map((g) => REPORTER.get(g)).filter(Boolean);
      $('#flow-note').textContent = 'The 31 countries: the 27 EU member states, Iceland, Liechtenstein, Norway and Switzerland. Totals are sums of country figures, each rounded to the nearest 5; a person who applied in two countries is counted in both.' +
        (prov.length ? ` Provisional for ${year}: ${prov.join(', ')}.` : '') + (cits.some((c) => c.c === 'UA') ? ' ' + UKRAINE : '') + footFor(cits.map((c) => c.c));
      $('#flow-table').innerHTML = `<table><thead><tr><th>Citizenship</th><th>Country of application</th><th class="num">Applicants</th></tr></thead><tbody>` +
        rows.slice().sort((a, b) => a.k - b.k || d3.descending(a.v, b.v)).filter((r) => r.v > 0)
          .map((r) => `<tr><td>${esc(r.n)}</td><td>${esc(r.r)}</td><td class="num">${num(r.v)}</td></tr>`).join('') + '</tbody></table>';
    };
    onWidth(el, render);
    on(['flowYear'], render);
  }

  // ---------- where applicants come from ----------
  // classes by count; Switzerland alone gets a finer scale, since its counts are far smaller
  const SCALES = {
    '31': [1, 500, 2000, 5000, 20000, 50000],
    CH: [1, 25, 100, 250, 500, 1000],
    DE: [1, 100, 500, 2000, 5000, 15000],
  };
  const binOf = (v, bins) => (!v ? 0 : d3.bisectRight(bins, v));
  const binLabels = (bins) => bins.map((b, i) => (i < bins.length - 1 ? `${num(b)}–${num(bins[i + 1] - 1)}` : `${num(b)} or more`));
  function drawMap() {
    const years = YEARS.map((r) => r.y);
    fillSlider($('#map-year'), years, 'year', 'Year of the map');
    fillSeg($('#map-scope'), [['31', 'Applied in the 31 countries'], ['CH', 'Applied in Switzerland'], ['DE', 'Applied in Germany']], 'mapScope');
    const el = $('#world');
    const tip = el._tip || (el._tip = tooltip(el));
    const ids = new Set(WORLD.map((f) => f.id));
    const valOf = (o) => (!o ? 0 : state.mapScope === 'CH' ? o.ch || 0 : state.mapScope === 'DE' ? o.de || 0 : o.v);
    const render = () => {
      const year = state.year, rows = ORIGINS.filter((r) => r.y === year), by = new Map(rows.map((r) => [r.c, r]));
      const bins = SCALES[state.mapScope];
      $('#world-key').innerHTML = '<div class="asy-ramp" aria-label="First-time applicants">' +
        binLabels(bins).map((l, i) => `<span><i class="asy-c${i + 1}"></i>${l}</span>`).join('') + '</div>' +
        '<span><i class="asy-sw asy-sw--none"></i>None</span><span><i class="asy-sw asy-sw--rep"></i>One of the 31 countries of application</span>';
      const W = el.clientWidth, H = Math.round(W * 0.5);
      const proj = d3.geoEqualEarth().fitExtent([[2, 2], [W - 2, H - 2]], { type: 'Sphere' });
      const path = d3.geoPath(proj);
      const svg = d3.select(el).html('').append('svg').attr('width', W).attr('height', H).attr('role', 'img')
        .attr('aria-label', `World map of first-time asylum applicants by citizenship, ${year}`);
      el.appendChild(tip.el);
      svg.append('path').attr('class', 'asy-sphere').attr('d', path({ type: 'Sphere' }));
      const shapes = svg.append('g').selectAll('path').data(WORLD).join('path').attr('d', path)
        .attr('class', (f) => 'asy-country ' + (REP31.has(f.id) ? 'asy-rep' : 'asy-c' + binOf(valOf(by.get(f.id)), bins)) + (f.id === state.cit ? ' is-sel' : ''));
      const show = (ev, f) => {
        const o = by.get(f.id), [px, py] = d3.pointer(ev, el);
        const name = o ? o.n : f.properties.name;
        const eu = EU27.has(f.id);
        tip.show(`<div class="tt__meta">${year}</div><div class="tt__title">${esc(name)}</div>` + (eu
          ? '<p class="tt__note">EU member state: this page counts applicants who are not EU citizens.</p>'
          : `<dl class="tt__rows"><div><dt>Applied in the 31 countries</dt><dd>${num(o ? o.v : 0)}</dd></div>
             <div><dt>Applied in Switzerland</dt><dd>${num(o ? o.ch || 0 : 0)}</dd></div>
             <div><dt>Applied in Germany</dt><dd>${num(o ? o.de || 0 : 0)}</dd></div></dl>` +
            (o && o.v > 0 ? '<p class="tt__note">Click to see where they applied.</p>' : '')), px, py);
      };
      shapes.on('pointermove', (ev, f) => { if (ev.pointerType === 'mouse') show(ev, f); })
        .on('pointerleave', () => tip.hide())
        .on('click', (ev, f) => { const o = by.get(f.id); if (o && o.v > 0 && !EU27.has(f.id)) { tip.hide(); setState('cit', f.id); } else show(ev, f); });
      // the claim, and what the map cannot show
      const scopeName = state.mapScope === '31' ? 'the 31 countries' : placeName(state.mapScope);
      const has = rows.filter((r) => valOf(r) > 0);
      const lands = has.filter((r) => r.t === 'country' || r.t === 'territory');
      const ranked = lands.slice().sort((a, b) => d3.descending(valOf(a), valOf(b)));
      const top3 = ranked.slice(0, 3), sum = d3.sum(has, valOf);
      const stl = has.find((r) => r.t === 'stateless'), unk = d3.sum(has.filter((r) => r.t === 'unknown'), valOf);
      $('#map-text').innerHTML = `In ${year}, first-time applicants in ${scopeName} held the citizenship of ${ranked.length} countries and territories` +
        (stl ? `; ${num(valOf(stl))} were stateless` : '') + (unk ? `; for ${num(unk)} it was unknown` : '') + '. ' +
        `The three largest groups, ${top3.map((r) => `${esc(r.n)} (${num(valOf(r))})`).join(', ')}, were ${pctOf(d3.sum(top3, valOf), sum)}% of all.`;
      const off = has.filter((r) => !ids.has(r.c)).sort((a, b) => d3.descending(valOf(a), valOf(b)));
      $('#offmap').textContent = off.length ? 'Not on the map: ' + off.map((r) => `${r.n} ${num(valOf(r))}`).join('; ') + '.' +
        (off.some((r) => r.c === 'XK') ? ' Kosovo has no area of its own on the GISCO map used here.' : '') + footFor(has.map((r) => r.c)) : footFor(has.map((r) => r.c)).trim();
      $('#map-note').textContent = 'Applicants in the 31 countries are a sum of country figures, each rounded to the nearest 5. ' +
        'Boundaries: GISCO, the European Commission’s geographic service; they imply no opinion on the legal status of any territory.';
      $('#names').innerHTML = rows.filter((r) => r.v > 0).sort((a, b) => d3.ascending(a.n, b.n)).map((r) => `<option value="${esc(r.n)}">`).join('');
    };
    onWidth(el, render);
    on(['year', 'mapScope'], render);
    on(['cit'], () => d3.select(el).selectAll('.asy-country').classed('is-sel', (f) => f.id === state.cit));
    const find = $('#find');
    const pick = () => {
      const q = find.value.trim().toLowerCase();
      const r = ORIGINS.find((o) => o.y === state.year && o.v > 0 && o.n.toLowerCase() === q);
      if (r) { setState('cit', r.c); find.value = ''; find.blur(); }
    };
    find.addEventListener('change', pick);
    find.addEventListener('input', pick);
    drawPick();
  }

  // the chosen citizenship: where its applicants applied
  function drawPick() {
    const el = $('#europe');
    const tip = el._tip || (el._tip = tooltip(el));
    // what the Europe map has to show: corners and edge midpoints of the area, from Iceland to Cyprus
    const box = { type: 'MultiPoint', coordinates: [[-24.5, 34.5], [-24.5, 71], [35, 71], [35, 34.5], [5, 71], [5, 34.5], [-24.5, 52], [35, 52]] };
    let token = 0;
    const render = async () => {
      const year = state.year, c = state.cit, mine = ++token;
      const o = ORIGINS.find((r) => r.y === year && r.c === c);
      const rows = (await hosts(year)).filter((r) => r.c === c).sort((a, b) => d3.descending(a.v, b.v) || d3.ascending(a.g, b.g));
      if (mine !== token) return;                                  // a newer choice is already drawing
      const total = d3.sum(rows, (r) => r.v);
      const t = o ? o.t : 'country';
      const group = !o ? 'This citizenship' : t === 'stateless' ? 'Stateless applicants' : t === 'unknown' ? 'Applicants of unknown citizenship'
        : t === 'recognised non-citizen' ? 'Recognised non-citizens' : `Citizens of ${o.n}`;
      const who = !o ? '' : t === 'stateless' ? 'who are stateless' : t === 'unknown' ? 'whose citizenship is unknown'
        : t === 'recognised non-citizen' ? 'who are recognised non-citizens' : `with the citizenship of ${esc(o.n)}`;
      $('#pick-title').textContent = o && total ? `${group}: where they applied, ${year}` : `${group}: no first-time applicants in ${year}`;
      const W = el.clientWidth, H = Math.round(Math.min(W * 0.95, 520));
      const proj = d3.geoAzimuthalEqualArea().rotate([-10, -52]).fitExtent([[6, 6], [W - 6, H - 6]], box);
      const path = d3.geoPath(proj);
      const svg = d3.select(el).html('').append('svg').attr('width', W).attr('height', H).attr('role', 'img')
        .attr('aria-label', o ? `Map of Europe: where ${group.toLowerCase()} applied in ${year}` : 'Map of Europe');
      el.appendChild(tip.el);
      svg.append('defs').append('clipPath').attr('id', 'asy-eclip').append('rect').attr('width', W).attr('height', H);
      const g = svg.append('g').attr('clip-path', 'url(#asy-eclip)');
      g.selectAll('path').data(WORLD).join('path').attr('d', path).attr('class', (f) => 'asy-land' + (REP31.has(f.id) ? ' asy-land--rep' : ''));
      const max = d3.max(rows, (r) => r.v) || 1;
      const rad = d3.scaleSqrt().domain([0, max]).range([0, Math.min(34, W / 16)]);
      const at = new Map(WORLD.map((f) => [f.id, anchor(f)]));
      const dots = g.selectAll('circle').data(rows.filter((r) => at.has(r.g))).join('circle').attr('class', 'asy-bubble')
        .attr('r', (r) => Math.max(1.5, rad(r.v))).attr('cx', (r) => proj(at.get(r.g))[0]).attr('cy', (r) => proj(at.get(r.g))[1]);
      dots.on('pointermove click', (ev, r) => {
        const [px, py] = d3.pointer(ev, el);
        tip.show(`<div class="tt__meta">${year} · ${esc(o.n)}</div><div class="tt__title">${esc(REPORTER.get(r.g))}</div>
          <dl class="tt__rows"><div><dt>First-time applicants</dt><dd>${num(r.v)}${r.p ? ' p' : ''}</dd></div>
          <div><dt>Per 100,000 inhabitants</dt><dd>${r.r == null ? '–' : f2(r.r)}</dd></div></dl>`, px, py);
      }).on('pointerleave', () => tip.hide());
      $('#hosts').innerHTML = rows.length ? `<table><thead><tr><th>Country of application</th><th class="num">Applicants</th><th class="num">Share</th><th class="num">Per 100,000 inhabitants</th></tr></thead><tbody>` +
        rows.map((r) => `<tr><td>${esc(REPORTER.get(r.g))}</td><td class="num">${num(r.v)}${r.p ? ' p' : ''}</td><td class="num">${share(r.v, total)}</td><td class="num">${r.r == null ? '–' : f2(r.r)}</td></tr>`).join('') +
        '</tbody></table>' : '';
      const ptxt = $('#pick-text');
      if (o && rows.length) {
        const withRate = rows.filter((r) => r.r != null);
        const maxR = d3.max(withRate, (r) => r.r);
        const topR = withRate.filter((r) => r.r === maxR);                 // ties are named together
        const firsts = rows.filter((r) => r.v === rows[0].v);
        const names = (rs) => rs.map((r) => esc(REPORTER.get(r.g))).join(rs.length > 2 ? ', ' : ' and ');
        const chRow = rows.find((r) => r.g === 'CH'), deRow = rows.find((r) => r.g === 'DE');
        ptxt.innerHTML = `${num(total)} first-time applicants ${who} applied in ${rows.length} of the 31 countries (counted in each country where they applied); ` +
          `${firsts.length > 1 ? `the most, ${share(rows[0].v, total)} each, in ${names(firsts)}` : `${share(rows[0].v, total)} of them in ${names(firsts)}`}. ` +
          (topR.length ? `Relative to population, ${names(topR)} received the most: ${rate(maxR)} per 100,000 inhabitants${topR.length > 1 ? ' each' : ''}. ` : '') +
          `${chRow ? `Switzerland: ${num(chRow.v)}` : 'None in Switzerland'}; ${deRow ? `Germany: ${num(deRow.v)}` : 'none in Germany'}.` +
          (rows.some((r) => r.p) ? ' p = provisional.' : '') + ' Circle areas are proportional to the number of applicants in this group only.' +
          (c === 'UA' ? ' ' + UKRAINE : '') + footFor([c]);
      } else ptxt.textContent = '';
    };
    onWidth(el, render);
    on(['year', 'cit'], render);
  }

  // ---------- what happens to an application ----------
  // four outcomes, in the order of the bar; ink shades for protection, grey for rejection
  const OUTCOMES = [['rs', 'Refugee status'], ['sp', 'Subsidiary protection'], ['hs', 'Humanitarian status'], ['neg', 'Rejected']];
  const pc = (a, b) => (b ? (100 * a) / b : 0);
  const pct0 = (a, b) => `${Math.round(pc(a, b))}%`;
  function drawDecisions() {
    fillSlider($('#dec-year'), YEARS.map((r) => r.y), 'decYear', 'Year of the decisions');
    fillSeg($('#dec-scope'), [['EU27_2020', 'Decided in the EU'], ['CH', 'Decided in Switzerland'], ['DE', 'Decided in Germany']], 'decScope');
    $('#dec-key').innerHTML = OUTCOMES.map(([k, l], i) => `<span><i class="asy-sw asy-o${i + 1}"></i>${l}</span>`).join('');
    const el = $('#dec');
    const tip = el._tip || (el._tip = tooltip(el));
    const render = () => {
      const year = state.decYear, g = state.decScope;
      const rows = DECISIONS.filter((r) => r.y === year && r.g === g).sort((a, b) => a.k - b.k);
      const all = rows.find((r) => r.k === 0);
      if (!all) {
        d3.select(el).html('').append('p').attr('class', 'note').text(`No complete year of decisions for ${year}.`);
        el.appendChild(tip.el);
        $('#dec-text').textContent = '';
        return;
      }
      const W = el.clientWidth, narrow = W < 560, labW = narrow ? 112 : 190, valW = narrow ? 44 : 64;
      const rowH = 26, gap = 7, top = 4, H = top + rows.length * (rowH + gap) + 8;
      const x = d3.scaleLinear().domain([0, 1]).range([labW, W - valW]);
      const svg = d3.select(el).html('').append('svg').attr('width', W).attr('height', H).attr('role', 'img')
        .attr('aria-label', `First-instance decisions in ${year} by outcome, ${placeShort(g)}, all citizenships and the twelve with the most decisions`);
      el.appendChild(tip.el);
      rows.forEach((r, i) => {
        const y0 = top + i * (rowH + gap) + (r.k === 0 ? 0 : 6);
        const picked = r.c === state.decCit;
        const gRow = svg.append('g').attr('class', 'asy-decrow' + (r.k === 0 ? ' is-all' : '') + (picked ? ' is-picked' : ''));
        gRow.append('text').attr('class', 'asy-declabel').attr('x', labW - 8).attr('y', y0 + rowH / 2 + 4).attr('text-anchor', 'end')
          .text(r.k === 0 ? (narrow ? 'Total' : 'All citizenships') : r.n);
        let acc = 0;
        const parts = d3.sum(OUTCOMES, ([k]) => r[k]);                 // the four outcomes, each rounded to 5, fill the bar
        OUTCOMES.forEach(([k], j) => {
          const w = r[k] / parts;
          gRow.append('rect').attr('class', `asy-o${j + 1}`).attr('x', x(acc)).attr('y', y0).attr('height', rowH)
            .attr('width', Math.max(0, x(Math.min(1, acc + w)) - x(acc)));
          acc += w;
        });
        gRow.append('text').attr('class', 'asy-decval').attr('x', W - valW + 6).attr('y', y0 + rowH / 2 + 4).text(pct0(r.pos, r.t));
        if (picked) gRow.append('rect').attr('class', 'asy-decpick').attr('x', x(0) - 0.5).attr('y', y0 - 0.5).attr('width', x(1) - x(0) + 1).attr('height', rowH + 1);
        // a click (or Enter) on a row shows that citizenship's outcomes over time below; again, or on the total, all together
        const pick = () => setState('decCit', r.k === 0 || picked ? 'EXT_EU27_2020' : r.c);
        gRow.append('rect').attr('class', 'overlay').attr('x', 0).attr('y', y0).attr('width', W).attr('height', rowH)
          .attr('tabindex', 0).attr('role', 'button').attr('aria-pressed', String(picked))
          .attr('aria-label', `${r.k === 0 ? 'All citizenships' : r.n}: show outcomes over time`)
          .on('click.pick', pick)
          .on('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); } })
          .on('pointermove click', (ev) => {
            const [px, py] = d3.pointer(ev, el);
            tip.show(`<div class="tt__meta">${year} · ${placeShort(g)}</div><div class="tt__title">${esc(r.k === 0 ? 'All citizenships' : r.n)}</div>
              <dl class="tt__rows"><div><dt>First-instance decisions</dt><dd>${num(r.t)}</dd></div>
              ${OUTCOMES.map(([k, l]) => `<div><dt>${l}</dt><dd>${num(r[k])} (${pct0(r[k], r.t)})</dd></div>`).join('')}</dl>
              <p class="tt__note">Protection granted: ${num(r.pos)} (${pct0(r.pos, r.t)}).</p><p class="tt__note">Click for its outcomes over time.</p>`, px, py);
          })
          .on('pointerleave', () => tip.hide());
      });
      // the claim: the year's shares, and the range among the twelve
      const where = (geo) => (geo === 'EU27_2020' ? 'EU countries' : placeName(geo));
      const line = (r, geo) => `${where(geo)} took ${num(r.t)} first-instance decisions on applicants who are not EU citizens; ${pct0(r.pos, r.t)} granted protection ` +
        `(refugee status ${pct0(r.rs, r.t)}, subsidiary protection ${pct0(r.sp, r.t)}, humanitarian status ${pct0(r.hs, r.t)}).`;
      const other = DECISIONS.find((r) => r.y === year && r.k === 0 && r.g === (g === 'EU27_2020' ? 'CH' : 'EU27_2020'));   // the EU beside a country; Switzerland beside the EU
      const named = rows.filter((r) => r.k > 0);
      const shown = (r) => Math.round(pc(r.pos, r.t));
      const hiV = d3.max(named, shown), loV = d3.min(named, shown);
      const who = (v) => named.filter((r) => shown(r) === v).map((r) => esc(r.n)).join(', ').replace(/, ([^,]*)$/, ' and $1');
      $('#dec-text').innerHTML = `In ${year}, ${line(all, g)} ` + (other ? line(other, other.g) + ' ' : '') +
        `Among the twelve groups by citizenship with the most decisions${g === 'EU27_2020' ? '' : ' in ' + placeName(g)}, the share granted ranged from ${loV}% (${who(loV)}) to ${hiV}% (${who(hiV)}).`;
      const prov = (all.pg || []).map((c) => REPORTER.get(c) || c);
      $('#dec-note').textContent = `Decisions in ${year} can concern applications from earlier years, so they are not compared with the year\u2019s applications. ` +
        'Yearly figures are sums of four quarterly figures, each rounded to the nearest 5; Eurostat\u2019s own yearly table can differ slightly. Percentages are rounded, so the parts may not add up exactly. ' +
        'Eurostat counts applications found inadmissible as rejected. Eurostat\u2019s notes for Switzerland say its figures include decisions to transfer applicants to another country under the Dublin rules (re-included for 2008\u20132024 in May 2025); they do not say whether every EU country counts these in the same way. ' +
        (prov.length ? `Provisional for ${year}: ${prov.join(', ')}. ` : '') + 'Bars: the four outcomes; the figure on the right is the share granting protection. Click a bar for its outcomes over time, below.';
      $('#dec-table').innerHTML = `<table><thead><tr><th>Citizenship</th><th class="num">Decisions</th>${OUTCOMES.map(([, l]) => `<th class="num">${l}</th>`).join('')}<th class="num">Granted</th></tr></thead><tbody>` +
        rows.map((r) => `<tr><td>${esc(r.k === 0 ? 'All citizenships' : r.n)}</td><td class="num">${num(r.t)}</td>${OUTCOMES.map(([k]) => `<td class="num">${num(r[k])}</td>`).join('')}<td class="num">${pct0(r.pos, r.t)}</td></tr>`).join('') +
        '</tbody></table>';
    };
    onWidth(el, render);
    on(['decYear', 'decScope', 'decCit'], render);
    drawDecisionsOverTime();
  }

  // outcomes over time: the shares of each year's first-instance decisions, all citizenships or the one clicked in the
  // bars, the bars' year marked. Shares of decisions, never of the year's applications (a decision can concern an
  // application from an earlier year). Years with fewer than 100 decisions are left out: each quarter is rounded to 5.
  const DEC_MIN = 100;
  function drawDecisionsOverTime() {
    const el = $('#dect');
    const tip = el._tip || (el._tip = tooltip(el));
    const render = () => {
      const g = state.decScope;
      if (state.decCit !== 'EXT_EU27_2020' && !DEC_YEARS.some((r) => r.g === g && r.c === state.decCit)) { setState('decCit', 'EXT_EU27_2020'); return; }
      const c = state.decCit, all = c === 'EXT_EU27_2020';
      const rows = DEC_YEARS.filter((r) => r.g === g && r.c === c).sort((a, b) => a.y - b.y);
      const yearsAll = YEARS.map((r) => r.y).filter((y) => DEC_YEARS.some((r) => r.g === g && r.y === y));
      const name = all ? 'All citizenships' : (rows[0] ? rows[0].n : c);
      const byYear = new Map(rows.map((r) => [r.y, r]));
      const pts = yearsAll.map((y) => {
        const r = byYear.get(y), parts = r ? d3.sum(OUTCOMES, ([k]) => r[k]) : 0;
        return { y, r, ok: !!r && r.t >= DEC_MIN && parts > 0, sh: OUTCOMES.map(([k]) => (r && parts ? r[k] / parts : 0)) };
      });
      $('#dect-head').textContent = `${name}: outcomes over time, decided in ${placeName(g) === 'the EU' ? 'the EU' : placeName(g)}`;
      const W = el.clientWidth, H = 200, mL = 34, mR = 8, mT = 10, mB = 22;
      const x = d3.scalePoint().domain(yearsAll).range([mL + 6, W - mR - 6]);
      const yS = d3.scaleLinear().domain([0, 1]).range([H - mB, mT]);
      const svg = d3.select(el).html('').append('svg').attr('width', W).attr('height', H).attr('role', 'img')
        .attr('aria-label', `${name}, decided in ${placeShort(g)}: shares of first-instance decisions by outcome, ${yearsAll[0]} to ${yearsAll[yearsAll.length - 1]}`);
      el.appendChild(tip.el);
      // grid first; the stack: refugee status at the bottom, rejected (the empty part, see-through) on top, as in the bars
      [0, 0.5, 1].forEach((v) => svg.append('line').attr('class', 'asy-gridline').attr('x1', mL).attr('x2', W - mR).attr('y1', yS(v)).attr('y2', yS(v)));
      OUTCOMES.forEach(([k], j) => {
        const lo = (p) => d3.sum(p.sh.slice(0, j)), hi = (p) => d3.sum(p.sh.slice(0, j + 1));
        svg.append('path').attr('class', `asy-o${j + 1} asy-dect-area`)
          .attr('d', d3.area().defined((p) => p.ok).x((p) => x(p.y)).y0((p) => yS(lo(p))).y1((p) => yS(hi(p)))(pts));
      });
      [0, 0.5, 1].forEach((v) => svg.append('text').attr('class', 'asy-axis').attr('x', mL - 6).attr('y', yS(v) + 4).attr('text-anchor', 'end').text(`${v * 100}%`));
      // the share granting protection, as a line on the stack's boundary with the rejected part
      svg.append('path').attr('class', 'asy-dect-pos')
        .attr('d', d3.line().defined((p) => p.ok).x((p) => x(p.y)).y((p) => yS(1 - p.sh[3]))(pts));
      // the year chosen for the bars
      const yc = state.decYear;
      if (x(yc) != null) {
        svg.append('line').attr('class', 'asy-dect-year').attr('x1', x(yc)).attr('x2', x(yc)).attr('y1', mT - 4).attr('y2', H - mB);
      }
      const every = W < 420 ? 3 : W < 640 ? 2 : 1;
      yearsAll.forEach((y, i) => {
        if (y !== yc && i % every && i !== yearsAll.length - 1) return;
        svg.append('text').attr('class', 'asy-axis' + (y === yc ? ' is-on' : '')).attr('x', x(y)).attr('y', H - 6).attr('text-anchor', 'middle').text(y);
      });
      pts.filter((p) => !p.ok && p.r).forEach((p) => svg.append('text').attr('class', 'asy-axis').attr('x', x(p.y)).attr('y', yS(0.5) + 4).attr('text-anchor', 'middle').text('few'));
      // tooltip: the nearest year, marked by a vertical line and a dot on the share granting protection
      // over the dark layers a thin line needs a paper halo to stay visible
      const focus = svg.append('g').style('display', 'none');
      focus.append('line').attr('class', 'asy-focus-halo').attr('y1', mT).attr('y2', H - mB);
      focus.append('line').attr('class', 'asy-focus').attr('y1', mT).attr('y2', H - mB);
      const dot = svg.append('circle').attr('class', 'asy-dot').attr('r', 3).style('display', 'none');
      svg.append('rect').attr('class', 'overlay').attr('x', mL).attr('y', mT).attr('width', W - mL - mR).attr('height', H - mT - mB)
        .on('pointermove click', (ev) => {
          const px0 = d3.pointer(ev)[0];
          const p = d3.least(pts, (q) => Math.abs(x(q.y) - px0));
          focus.style('display', null).selectAll('line').attr('x1', x(p.y)).attr('x2', x(p.y));
          if (p.ok) dot.style('display', null).attr('cx', x(p.y)).attr('cy', yS(1 - p.sh[3])); else dot.style('display', 'none');
          const [px, py] = d3.pointer(ev, el);
          if (!p.r) { tip.show(`<div class="tt__meta">${p.y} · ${placeShort(g)}</div><div class="tt__title">${esc(name)}</div><p class="tt__note">No first-instance decisions published.</p>`, px, py); return; }
          const r = p.r;
          tip.show(`<div class="tt__meta">${p.y} · ${placeShort(g)}</div><div class="tt__title">${esc(name)}</div>
            <dl class="tt__rows"><div><dt>First-instance decisions</dt><dd>${num(r.t)}</dd></div>
            ${OUTCOMES.map(([k, l]) => `<div><dt>${l}</dt><dd>${num(r[k])} (${pct0(r[k], r.t)})</dd></div>`).join('')}</dl>
            <p class="tt__note">Protection granted: ${pct0(r.pos, r.t)}.${r.p ? ' Includes provisional figures.' : ''}${p.ok ? '' : ` Fewer than ${DEC_MIN} decisions: not drawn.`}</p>`, px, py);
        })
        .on('pointerleave', () => { tip.hide(); focus.style('display', 'none'); dot.style('display', 'none'); });
      // the claim: the share granted in the first and the last year drawn, and the bars' year
      const drawn = pts.filter((p) => p.ok);
      const gr = (p) => pct0(p.r.pos, p.r.t);
      const at = drawn.find((p) => p.y === yc);
      $('#dect-text').innerHTML = drawn.length < 2 ? '' :
        `Of the first-instance decisions on ${all ? 'applicants who are not EU citizens' : 'citizens of ' + esc(name)} in ${placeName(g)}, ${gr(drawn[0])} granted protection in ${drawn[0].y} and ${gr(drawn[drawn.length - 1])} in ${drawn[drawn.length - 1].y}` +
        (at && at !== drawn[0] && at !== drawn[drawn.length - 1] ? `; ${gr(at)} in ${yc}, the year of the bars above.` : '.');
      $('#dect-note').textContent = 'Shares of each year\u2019s first-instance decisions, not of that year\u2019s applicants: a decision can concern an application made in an earlier year, and appeals are not counted. ' +
        `Years with fewer than ${DEC_MIN} decisions are left out (each quarterly figure is rounded to the nearest 5). The line marks the share granting protection; the vertical line, the year chosen above.` +
        (all ? ' Click a bar above to see one citizenship.' : ' Click the bar again, or All citizenships, to see all together.');
      $('#dect-table').innerHTML = `<table><thead><tr><th>Year</th><th class="num">Decisions</th>${OUTCOMES.map(([, l]) => `<th class="num">${l}</th>`).join('')}<th class="num">Granted</th></tr></thead><tbody>` +
        rows.map((r) => `<tr><td class="date">${r.y}</td><td class="num">${num(r.t)}</td>${OUTCOMES.map(([k]) => `<td class="num">${pct0(r[k], r.t)}</td>`).join('')}<td class="num">${pct0(r.pos, r.t)}</td></tr>`).join('') +
        '</tbody></table>';
    };
    onWidth(el, render);
    on(['decYear', 'decScope', 'decCit'], render);
  }

  // ---------- organised violence (UCDP) beside applications ----------
  // Deaths where they happened, applicants by citizenship: timing only, never a cause. The threshold (1,000 deaths
  // in the twelve months before the month of application) is computed in mart.asy_conflict_share.
  const UCDP_PAGE = 'https://ucdp.uu.se/downloads/';
  const pc1 = (s) => f1(100 * s) + '%';
  const DEAD_FLOOR = 1000;
  // an event's number on a red disc, drawn in SVG in the list as on the chart: the baseline sits half a digit's
  // height below the centre (digits are 0.71 em tall in Google Sans Code), so the number is centred whatever the
  // browser makes of the font's line metrics
  const NUM_DY = '0.355em';
  const evBadge = (n) => `<svg class="asy-n" viewBox="0 0 18 18" role="img" aria-label="Event ${n}"><circle cx="9" cy="9" r="9"/>` +
    `<text x="9" y="9" dy="${NUM_DY}" text-anchor="middle">${n}</text></svg>`;
  const citName = (c) => { const r = ORIGINS.find((o) => o.c === c) || CONFLICT.find((o) => o.c === c); return r ? esc(r.n) : c; };
  // the largest single step among the ten: a citizenship whose deaths in the twelve months before cross 1,000, by
  // its part of that month's applicants (the same rule as mart.asy_conflict_share, from conflict.json)
  function warStep(g, cits) {
    let best = null;
    cits.forEach((ct) => {
      const rs = ct.rs, sum = (a, b) => (rs.slice(a, b).some((r) => r.d == null) ? null : d3.sum(rs.slice(a, b), (r) => r.d));
      for (let i = 13; i < rs.length; i++) {
        const now = sum(i - 12, i), before = sum(i - 13, i - 1), sh = SHARE.find((x) => x.g === g && x.m === rs[i].m);
        if (now == null || before == null || !rs[i].v || !sh || (now >= 1000) === (before >= 1000)) continue;
        const frac = rs[i].v / sh.v;
        if (!best || frac > best.frac) best = { n: ct.n, m: rs[i].m, up: now >= 1000, frac };
      }
    });
    return best;
  }
  function warTen(g) {
    const rows = CONFLICT.filter((r) => r.g === g);
    const apps = series(g), m1 = apps[apps.length - 1].m, m0 = apps[Math.max(0, apps.length - 12)].m;
    const cits = d3.groups(rows, (r) => r.c).map(([c, rs]) => {
      const w = rs.filter((r) => r.m >= m0 && r.m <= m1);
      return { c, n: rs[0].n, k: rs[0].k, rs, apps12: d3.sum(w, (r) => r.v || 0), dead12: d3.sum(w, (r) => r.d || 0),
        lo12: d3.sum(w, (r) => r.dl || 0), hi12: d3.sum(w, (r) => r.dh || 0), known: w.every((r) => r.d != null),
        lastDead: d3.max(rs.filter((r) => r.d != null), (r) => r.m), prelim: w.some((r) => r.p) };
    }).sort((a, b) => a.k - b.k);
    return { rows, cits, m0, m1 };
  }
  function drawWar() {
    fillSeg($('#war-scope'), [['EU27_2020', 'Applied in the EU'], ['CH', 'Applied in Switzerland'], ['DE', 'Applied in Germany']], 'warScope');
    fillSeg($('#war-scale'), [['own', 'Each on its own scale'], ['same', 'Same scale for all']], 'warScale');
    const ged = UCDP_META.find((r) => r.ds === 'ged'), cand = UCDP_META.find((r) => r.ds === 'candidate'), acd = UCDP_META.find((r) => r.ds === 'acd');
    const shareOf = (g) => SHARE.filter((r) => r.g === g && r.m <= lastOf(g).m);   // months with applicants
    const anyPrelim = SHARE.some((r) => r.p);
    // the share, both places on one scale (a share of each place's own applicants)
    const el = $('#war-share');
    const tip = el._tip || (el._tip = tooltip(el));
    tip.el.classList.add('tooltip--wide');                          // a small table: four columns of figures
    $('#war-key').innerHTML = '<span><i class="asy-ln"></i>Applied in the EU</span><span><i class="asy-ln asy-ln--ch"></i>Applied in Switzerland</span><span><i class="asy-ln asy-ln--de"></i>Applied in Germany</span>' +
      (anyPrelim ? '<span><i class="asy-ln asy-ln--prelim"></i>Deaths partly from UCDP&rsquo;s preliminary data</span>' : '') +
      '<span><i class="asy-sw asy-sw--break"></i>July 2026: Eurostat&rsquo;s change of definition</span>';
    const renderShare = () => {
      const W = el.clientWidth, H = Math.max(220, Math.min(320, Math.round(W * 0.4)));
      const M = { t: 16, r: 14, b: 26, l: 44 };
      const eu = shareOf('EU27_2020'), ch = shareOf('CH'), de = shareOf('DE'), all = eu.concat(ch, de);
      const x = d3.scaleTime().domain([d3.min(all, (d) => parseM(d.m)), d3.max(all, (d) => parseM(d.m))]).range([M.l, W - M.r]);
      const y = d3.scaleLinear().domain([0, 1]).range([H - M.b, M.t]);
      const svg = d3.select(el).html('').append('svg').attr('width', W).attr('height', H).attr('role', 'img')
        .attr('aria-label', 'Share of first-time applicants whose citizenship is that of a country with at least 1,000 deaths from organised violence in the twelve months before, per month, EU, Switzerland and Germany');
      el.appendChild(tip.el);
      svg.append('g').attr('class', 'grid').selectAll('line').data([0, 0.25, 0.5, 0.75, 1]).join('line')
        .attr('x1', M.l).attr('x2', W - M.r).attr('y1', y).attr('y2', y);
      svg.append('g').attr('class', 'axis axis--y').attr('transform', `translate(${M.l},0)`)
        .call(d3.axisLeft(y).tickValues([0, 0.25, 0.5, 0.75, 1]).tickFormat(d3.format('.0%')).tickSize(0)).call((g) => g.select('.domain').remove());
      svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${H - M.b})`)
        .call(d3.axisBottom(x).ticks(d3.timeYear.every(W > 620 ? 1 : 2)).tickFormat(d3.timeFormat('%Y')).tickSizeOuter(0));
      const xb = x(parseM(BREAK));
      if (xb <= W - M.r) svg.append('line').attr('class', 'asy-break').attr('x1', xb).attr('x2', xb).attr('y1', M.t - 6).attr('y2', H - M.b);
      const line = d3.line().x((d) => x(parseM(d.m))).y((d) => y(d.s));
      [eu, de, ch].forEach((sr) => {
        if (!sr.length) return;
        const cls = lineCls(sr[0].g);
        const fin = sr.filter((d) => !d.p), pre = sr.filter((d) => d.p);
        if (fin.length) svg.append('path').attr('class', cls).attr('d', line(fin));
        if (pre.length) svg.append('path').attr('class', cls + ' asy-line--prelim').attr('d', line(fin.slice(-1).concat(pre)));
      });
      const focus = svg.append('line').attr('class', 'asy-focus').attr('y1', M.t).attr('y2', H - M.b).style('display', 'none');
      svg.append('rect').attr('class', 'overlay').attr('x', M.l).attr('y', M.t).attr('width', W - M.l - M.r).attr('height', H - M.t - M.b)
        .on('pointermove', (ev) => {
          const m = d3.timeFormat('%Y-%m')(d3.timeMonth.round(x.invert(d3.pointer(ev)[0])));
          const e = eu.find((d) => d.m === m), c = ch.find((d) => d.m === m), dd = de.find((d) => d.m === m);
          if (!e && !c && !dd) { tip.hide(); focus.style('display', 'none'); return; }
          focus.style('display', null).attr('x1', x(parseM(m))).attr('x2', x(parseM(m)));
          // one row per place, figures in columns: the share, the share with UCDP's low estimates, the applicants counted and all
          const places = [['EU', eu, e], ['Switzerland', ch, c], ['Germany', de, dd]];
          const row = ([lab, , d]) => (d ? `<tr><th>${lab}</th><td>${pc1(d.s)}</td><td>${pc1(d.sl)}</td><td>${num(d.w)}</td><td>${num(d.v)}</td></tr>`
            : `<tr><th>${lab}</th><td colspan="4">not yet reported</td></tr>`);
          // which citizenships crossed 1,000 since the month before (the share moves in steps when a large group crosses),
          // grouped by citizenship: each with the places where it starts or stops being counted
          const moves = (dir) => {
            const at = new Map();
            places.forEach(([lab, sr, d]) => {
              const i = sr.indexOf(d), p = i > 0 ? sr[i - 1] : null;
              if (!d || !p) return;
              const now = d.cs || [], before = p.cs || [];
              (dir === 'in' ? now.filter((x) => !before.includes(x)) : before.filter((x) => !now.includes(x)))
                .forEach((x) => at.set(x, (at.get(x) || []).concat(lab)));
            });
            const groups = new Map();
            [...at].forEach(([x, labs]) => { const k = andList(labs); groups.set(k, (groups.get(k) || []).concat(citName(x))); });
            return [...groups].sort((a, b) => b[0].length - a[0].length).map(([k, xs]) => `${andList(xs.sort())} (${k})`).join('; ');
          };
          const inn = moves('in'), out = moves('out');
          const [px, py] = d3.pointer(ev, el);
          tip.show(`<div class="tt__meta">${mName(m)}${(e || c || dd).p ? ' · deaths partly preliminary' : ''}</div>
            <table class="tt__tab tt__tab--share"><thead><tr><th></th><th>Share</th><th>Low</th><th>Counted</th><th>Applicants</th></tr></thead>
            <tbody>${places.map(row).join('')}</tbody></table>
            <p class="tt__note">Counted: first-time applicants whose citizenship is that of a country with at least 1,000 deaths in the twelve months before (UCDP best estimate). Share: counted, of all applicants; low: the same with UCDP&rsquo;s low estimates.</p>` +
            (inn ? `<p class="tt__note"><b>Counted from this month:</b> ${inn}.</p>` : '') +
            (out ? `<p class="tt__note"><b>No longer counted:</b> ${out}.</p>` : ''), px, py);
        })
        .on('pointerleave', () => { tip.hide(); focus.style('display', 'none'); });
    };
    onWidth(el, renderShare);
    // the ten largest groups: deaths in the country above, applicants below, from January 2014
    const pel = $('#war-panels');
    const ptip = pel._tip || (pel._tip = tooltip(pel));
    const deathsWord = (v) => (v > 0 && v < 0.5 ? 'less than 1' : num(Math.round(v)));
    $('#war-pkey').innerHTML = '<span><i class="asy-sw asy-sw--dead"></i>Deaths in the country, per month (UCDP best estimate)</span>' +
      (anyPrelim ? '<span><i class="asy-sw asy-sw--dead asy-sw--prelim"></i>preliminary</span>' : '') +
      '<span><i class="asy-ln"></i>First-time applicants with that citizenship, per month</span>' +
      `<span><i class="asy-sw asy-sw--war"></i>Year at war level (UCDP)</span><span>${evBadge(1)}Event, from a UN record</span>`;
    // context: years at war level (UCDP/PRIO Armed Conflict Dataset) and events dated by UN records (content/asy_events.csv)
    const parseD = d3.timeParse('%Y-%m-%d');
    const evDate = (e) => (e.p === 'month' ? mName(e.d.slice(0, 7)) : d3.timeFormat('%-d %B %Y')(parseD(e.d)));
    const evAt = (e) => (e.p === 'month' ? d3.timeDay.offset(parseD(e.d), 14) : parseD(e.d));   // month only: mid-month
    const eventsOf = (c) => EVENTS.filter((e) => e.c === c).sort((a, b) => d3.ascending(a.d, b.d)).map((e, i) => ({ ...e, n: i + 1 }));
    const warOf = (c) => WAR_YEARS.filter((w) => w.c === c);
    const renderPanels = () => {
      const g = state.warScope, own = state.warScale === 'own';
      const { rows, cits, m0, m1 } = warTen(g);
      $('#war-sub').textContent = `The ten largest groups in ${placeName(g)}, ${mName(m0)} to ${mName(m1)}`;
      // one column: each panel carries its events, listed under it, and gets the full width; taller where it is wide
      const W = pel.clientWidth, cols = 1, gap = 28;
      const B = W >= 560 ? 152 : 106;                                // baseline of the applicants' line
      const dB = Math.round(14 + 0.4 * (B - 14)), aT = Math.round(B - 0.39 * (B - 14));   // deaths' baseline, applicants' top
      const pw = Math.floor((W - gap * (cols - 1)) / cols);
      const t0 = d3.min(rows, (r) => parseM(r.m)), t1 = d3.max(rows, (r) => parseM(r.m));
      const x = d3.scaleTime().domain([t0, t1]).range([0, pw]);
      // own scales start at 1,000 deaths a month, so that a few deaths never fill a panel; the top line is labelled
      const dMax = (rs) => Math.max(DEAD_FLOOR, d3.max(rs, (r) => r.d || 0)), aMax = (rs) => Math.max(10, d3.max(rs, (r) => r.v || 0));
      const dAll = dMax(rows), aAll = aMax(rows);
      pel.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
      pel.style.columnGap = gap + 'px';
      pel.innerHTML = '';
      pel.appendChild(ptip.el);
      cits.forEach((ct) => {
        const p = document.createElement('div');
        p.className = 'asy-panel';
        p.innerHTML = `<div class="asy-panel__name">${esc(ct.n)}</div>` +
          `<div class="asy-panel__sub">${ct.dead12 >= 0.5 ? num(Math.round(ct.dead12)) + ' deaths' : 'No deaths recorded'}${ct.known ? '' : ` to ${mShort(ct.lastDead)}`}<br>${num(ct.apps12)} applicants</div>`;
        pel.appendChild(p);
        // events inside the time axis get a numbered badge above the chart; a badge moves down a row when the one
        // before it in its row is closer than its width
        const evs = eventsOf(ct.c), wars = warOf(ct.c);
        const rowEnd = [];
        const marks = evs.filter((e) => evAt(e) >= t0 && evAt(e) <= d3.timeMonth.offset(t1, 1)).map((e) => {
          const mx = x(evAt(e)), bx = Math.max(7, Math.min(pw - 7, mx));
          let row = rowEnd.findIndex((end) => bx - end >= 17);
          if (row < 0) { row = rowEnd.length; rowEnd.push(0); }
          rowEnd[row] = bx;
          return { ...e, mx, bx, row };
        });
        const lift = marks.length ? rowEnd.length * 16 + 4 : 0, ph = B + 18 + lift;
        const svg = d3.select(p).append('svg').attr('width', pw).attr('height', ph).attr('role', 'img')
          .attr('aria-label', `${ct.n}: deaths from organised violence in the country and first-time applicants with this citizenship, per month since ${monthName(t0)}` +
            (wars.length ? `; years at war level: ${wars.map((w) => w.y).join(', ')}` : '') + (marks.length ? `; ${marks.length} numbered event${marks.length > 1 ? 's' : ''}, listed below` : ''));
        // years at war level, behind everything (a calendar year, clipped to the time axis)
        wars.forEach((w) => {
          const a = Math.max(0, x(new Date(w.y, 0, 1))), b = Math.min(pw, x(new Date(w.y + 1, 0, 1)));
          if (b > a) svg.append('rect').attr('class', 'asy-war').attr('x', a).attr('width', b - a).attr('y', lift + 8).attr('height', B - 8);
        });
        // layers, back to front: years at war level, grid, reference lines (events, the 2026 break), data, labels and badges
        const yD = d3.scaleLinear().domain([0, own ? dMax(ct.rs) : dAll]).nice(3).range([lift + dB, lift + 14]);
        const yA = d3.scaleLinear().domain([0, own ? aMax(ct.rs) : aAll]).nice(3).range([lift + B, lift + aT]);
        const dTop = yD.domain()[1], aTop = yA.domain()[1];
        [[yD, dTop], [yA, aTop]].forEach(([yy, top]) => {
          svg.append('line').attr('class', 'asy-gridline').attr('x1', 0).attr('x2', pw).attr('y1', yy(top)).attr('y2', yy(top));
          svg.append('line').attr('class', 'asy-gridline').attr('x1', 0).attr('x2', pw).attr('y1', yy(0)).attr('y2', yy(0));
        });
        marks.forEach((e) => {
          const by = 9 + e.row * 16;
          svg.append('line').attr('class', 'asy-mk').attr('x1', e.mx).attr('x2', e.mx).attr('y1', by + 7).attr('y2', lift + B);
          if (e.bx !== e.mx) svg.append('line').attr('class', 'asy-mk').attr('x1', e.bx).attr('x2', e.mx).attr('y1', by + 7).attr('y2', by + 7);
        });
        const xb = x(parseM(BREAK));
        if (xb <= pw) svg.append('line').attr('class', 'asy-break').attr('x1', xb).attr('x2', xb).attr('y1', lift + aT - 10).attr('y2', lift + B);
        const area = d3.area().x((r) => x(parseM(r.m))).y0(yD(0)).y1((r) => yD(r.d));
        const fin = ct.rs.filter((r) => r.d != null && !r.p), pre = ct.rs.filter((r) => r.d != null && r.p);
        if (fin.length) svg.append('path').attr('class', 'asy-dead').attr('d', area(fin));
        if (pre.length) svg.append('path').attr('class', 'asy-dead asy-dead--prelim').attr('d', area(fin.slice(-1).concat(pre)));
        svg.append('path').attr('class', lineCls(g, ' asy-line--thin'))
          .attr('d', d3.line().defined((r) => r.v != null).x((r) => x(parseM(r.m))).y((r) => yA(r.v))(ct.rs));
        [[yD, dTop, 'deaths'], [yA, aTop, 'applicants']].forEach(([yy, top, word]) =>
          svg.append('text').attr('class', 'asy-plabel').attr('x', 0).attr('y', yy(top) - 3).text(`${num(top)} ${word}`));
        svg.append('text').attr('x', 0).attr('y', ph - 1).text(d3.timeFormat('%Y')(t0));
        svg.append('text').attr('x', pw).attr('y', ph - 1).attr('text-anchor', 'end').text(d3.timeFormat('%Y')(t1));
        marks.forEach((e) => {
          const by = 9 + e.row * 16;
          svg.append('circle').attr('class', 'asy-badge').attr('cx', e.bx).attr('cy', by).attr('r', 7);
          svg.append('text').attr('class', 'asy-badge__n').attr('x', e.bx).attr('y', by).attr('dy', NUM_DY).text(e.n);
        });
        const rv = EVENT_REVIEWS.find((r) => r.c === ct.c);
        const list = document.createElement('div');
        list.className = 'asy-events';
        list.innerHTML = (evs.length ? `<ol class="asy-marks">${evs.map((e) => `<li>${evBadge(e.n)}<span><span class="asy-when">${evDate(e)}</span> ${esc(e.e)} <span class="asy-when">(<a href="${esc(e.u)}">${esc(e.s)}</a>)</span></span></li>`).join('')}</ol>` : '') +
          (!rv || !rv.ok ? '<p class="asy-none">Events for this citizenship have not yet been reviewed.</p>'
            : rv.t ? `<p class="asy-none">${esc(rv.t)}</p>` : evs.length ? '' : '<p class="asy-none">None marked since 2014.</p>');
        p.appendChild(list);
        panelHover(svg, pel, ptip, x, pw, lift + 10, lift + B, (m) => {
          const r = ct.rs.find((d) => d.m === m);
          const w = wars.find((d) => String(d.y) === m.slice(0, 4)), em = evs.filter((e) => e.d.slice(0, 7) === m);
          return r && { y: r.v != null ? yA(r.v) : null, cls: dotCls(g),
            html: `<div class="tt__meta">${mName(m)}</div><div class="tt__title">${esc(ct.n)}</div>
              <dl class="tt__rows"><div><dt>Deaths in the country (UCDP)</dt><dd>${r.d == null ? 'not yet covered' : deathsWord(r.d)}</dd></div>` +
              (r.d != null && Math.round(r.dl) !== Math.round(r.dh) ? `<div><dt>low to high estimate</dt><dd>${deathsWord(r.dl)} to ${deathsWord(r.dh)}</dd></div>` : '') +
              `<div><dt>First-time applicants, ${placeShort(g)}</dt><dd>${r.v == null ? 'not yet published' : num(r.v)}</dd></div></dl>` +
              (r.p ? '<p class="tt__note">Deaths from UCDP&rsquo;s preliminary data.</p>' : '') +
              (w ? `<p class="tt__note">${m.slice(0, 4)} is a year at war level (UCDP): ${esc(w.w.join('; '))}.</p>` : '') +
              em.map((e) => `<p class="tt__note">${e.n}. ${evDate(e)}: ${esc(e.e)}</p>`).join('') };
        });
      });
    };
    onWidth(pel, renderPanels);
    // the claims, from the same files
    const renderText = () => {
      const g = state.warScope, where = placeName(g);
      const sr = shareOf(g), last12 = sr.slice(-12), a = last12[0].m, b = last12[last12.length - 1].m;
      const s12 = d3.sum(last12, (r) => r.w) / d3.sum(last12, (r) => r.v), s12lo = d3.sum(last12, (r) => r.wl) / d3.sum(last12, (r) => r.v);
      const years = d3.groups(sr, (r) => r.m.slice(0, 4)).filter(([, rs]) => rs.length === 12)
        .map(([y, rs]) => ({ y, s: d3.sum(rs, (r) => r.w) / d3.sum(rs, (r) => r.v) }));
      const hi = years.reduce((p, q) => (q.s > p.s ? q : p), years[0]), lo = years.reduce((p, q) => (q.s < p.s ? q : p), years[0]);
      const { cits, m0, m1 } = warTen(g);
      const step = warStep(g, cits);
      const few = cits.filter((c) => Math.round(c.dead12) < 1000), many = cits.filter((c) => Math.round(c.dead12) >= 1000);   // as the panels show them
      const names = (xs) => andList(xs.map((c) => esc(c.n)));
      const near = cits.filter((c) => Math.round(c.lo12) < 1000 && Math.round(c.hi12) >= 1000);
      const WORD = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
      $('#war-text').innerHTML = `From ${mName(a)} to ${mName(b)}, ${pc1(s12)} of first-time applicants in ${where} held the citizenship of a country where UCDP counted at least 1,000 deaths from organised violence in the twelve months before they applied (${pc1(s12lo)} with UCDP&rsquo;s low estimates). ` +
        (years.length > 1 ? `For a whole calendar year, the share ranged from ${pc1(lo.s)} in ${lo.y} to ${pc1(hi.s)} in ${hi.y}. ` : '') +
        `Of the ten largest citizenships from ${mName(m0)} to ${mName(m1)}, ` +
        (few.length && many.length ? `${WORD[many.length]} are those of countries where UCDP counted at least 1,000 deaths in the same months (${names(many)}), ${WORD[few.length]} of countries with fewer (${names(few)}).`
          : `all ten are those of countries where UCDP counted ${few.length ? 'fewer than' : 'at least'} 1,000 deaths in the same months.`) +
        (near.length ? ` For ${andList(near.map((c) => esc(c.n)))}, UCDP&rsquo;s low and high estimates lie on either side of 1,000 (${near.map((c) => `${near.length > 1 ? esc(c.n) + ': ' : ''}${num(Math.round(c.lo12))} to ${num(Math.round(c.hi12))}`).join('; ')}).` : '');
      $('#war-note').innerHTML = `Source: UCDP Georeferenced Event Dataset (GED) Global ${esc(ged.v)}, final, to ${mName(ged.thru)}` +
        (cand ? `, and UCDP Candidate Events Dataset ${esc(cand.v)}, ${mName(cand.f)} to ${mName(cand.thru)}: preliminary until UCDP&rsquo;s next yearly release, and marked so (fetched ${dayOf(cand.fetched)})` : '') + '. ' +
        'Deaths are UCDP&rsquo;s best estimates for all three kinds of organised violence it counts (see Method and sources). ' +
        (step ? `The threshold is a line, so the share moves in steps when a large group crosses it. In ${mName(step.m)}, the deaths UCDP counted in ${esc(step.n)} in the twelve months before ${step.up ? 'reached' : 'fell below'} 1,000, and its citizens were ${pc1(step.frac)} of that month&rsquo;s applicants in ${where}. The chart&rsquo;s tooltip names the citizenships that cross. ` : '') +
        (state.warScale === 'own' ? 'On their own scales, the panels&rsquo; deaths start from a top of 1,000 a month, so that a few deaths never fill a panel; every top line is labelled. ' : 'On the same scale, every panel&rsquo;s top line is the highest month of any of the ten. ') +
        'UCDP places events in the Gaza Strip and the West Bank in Israel; here they count for Palestine*, the rest for Israel. ' +
        (acd ? `Shaded on the panels: the calendar years in which UCDP counts at least one armed conflict between a government and another party located in the country as a war, with 1,000 or more battle-related deaths in the year (UCDP/PRIO Armed Conflict Dataset ${esc(acd.v)}, to ${acd.thru.slice(0, 4)}, so the months after have no shading yet); a war between states is located in both. ` : '') +
        'Numbered on the panels: a selection of events of the following kinds, made for this page, each dated by a UN record and linked to it. In the country (for a war between states, in either of them): a change in who governs by force, after mass protests or by suspending parliament, or an attempt by force; the start or an escalation of large-scale organised violence, the end of a major battle, or an agreement to end a war; a disaster that struck a large part of the population. ' +
        'Where the UN record gives only the month, the event is placed in the middle of it. The events say when something happened, not why any one person applied; notes under a panel name what readers might look for that is not an event with a date. ' +
        'Applicants are matched by the citizenship they hold, not by the country they left or lived in. Stateless applicants and those of unknown citizenship count in the total, never as citizens of a country with deaths. ' +
        'The threshold of 1,000 deaths in twelve months is this page&rsquo;s own; UCDP calls an armed conflict between a government and another party a war when its battle-related deaths reach 1,000 in a calendar year, a narrower count. ' +
        'UCDP counts deaths, not persecution or other serious harm; the asylum procedure examines each case on its own (next chapter). ' +
        'Most people who fled the war in Ukraine hold temporary protection (further down), which is not an asylum application. ' +
        (crossesBreak(a, b) ? 'These twelve months include July 2026, when Eurostat&rsquo;s definition changed (see Method and sources). ' : '') +
        footFor(['PS']).trim();
    };
    renderText();
    on(['warScope', 'warScale'], renderPanels);
    on(['warScope', 'warScale'], renderText);
    // table: the share per month, both places
    const months = [...new Set(SHARE.map((r) => r.m))].sort().reverse();
    const cell = (d) => (d ? `<td class="num">${num(d.v)}</td><td class="num">${num(d.w)}</td><td class="num">${pc1(d.s)}</td><td class="num">${pc1(d.sl)}</td>` : '<td class="num">–</td>'.repeat(4));
    const head = (w) => `<th class="num">${w}</th><th class="num">from countries with 1,000+ deaths</th><th class="num">Share</th><th class="num">Share, low estimate</th>`;
    $('#war-table').innerHTML = `<table><thead><tr><th>Month</th>${head('EU applicants')}${head('Switzerland')}${head('Germany')}<th>UCDP data</th></tr></thead><tbody>` +
      months.map((m) => { const at = (g) => SHARE.find((d) => d.g === g && d.m === m), e = at('EU27_2020'), c = at('CH'), dd = at('DE');
        return `<tr><td class="date">${m}</td>${cell(e)}${cell(c)}${cell(dd)}<td>${(e || c || dd).p ? 'partly preliminary' : 'final'}</td></tr>`; }).join('') +
      '</tbody></table><p class="note asy-tnote">Deaths in the country of the citizenship in the twelve months before the month of application.</p>';
  }

  // ---------- temporary protection ----------
  function drawTP() {
    fillSeg($('#tp-mode'), [['n', 'Number of people'], ['r', 'Per 1,000 inhabitants']], 'tpMode');
    const el = $('#tp');
    const tip = el._tip || (el._tip = tooltip(el));
    const eu = TP.filter((r) => r.g === 'EU27_2020'), ch = TP.filter((r) => r.g === 'CH'), de = TP.filter((r) => r.g === 'DE');
    // breaks: flagged in the data or described in Eurostat's notes (Germany's own correction of July 2024 included)
    const isBrk = (d) => (d.g === 'EU27_2020' ? Boolean(d.b || TP_BREAKS[d.m]) : d.g === 'DE' ? Boolean(d.b || TP_BREAKS[d.m] === 'Germany') : false);
    const breaks = eu.concat(de).filter(isBrk);
    const render = () => {
      const rate = state.tpMode === 'r';
      $('#tp-key').innerHTML = '<span><i class="asy-ln"></i>European Union (Eurostat&rsquo;s total, from August 2022)</span><span><i class="asy-ln asy-ln--ch"></i>Switzerland</span><span><i class="asy-ln asy-ln--de"></i>Germany</span>' +
        (breaks.length ? '<span><i class="asy-sw asy-sw--brk"></i>Break in Eurostat&rsquo;s series</span>' : '');
      const W = el.clientWidth;
      // numbers: one panel each, own scale (millions and thousands do not share an axis); rates: one chart
      const panels = rate ? [{ s: [eu, de, ch], label: '' }] : [{ s: [eu], label: 'European Union' }, { s: [ch], label: 'Switzerland' }, { s: [de], label: 'Germany' }];
      const t0 = d3.min(TP, (r) => parseM(r.m)), t1 = d3.max(TP, (r) => parseM(r.m));
      d3.select(el).html('');
      el.appendChild(tip.el);
      const cols = rate ? 1 : W >= 900 ? 3 : W >= 620 ? 2 : 1;
      const pw = Math.floor((W - 24 * (cols - 1)) / cols), ph = rate ? Math.max(240, Math.min(340, Math.round(W * 0.42))) : 220;
      const wrap = d3.select(el).append('div').attr('class', 'asy-tpgrid' + (cols > 1 ? ' is-side' : '')).style('grid-template-columns', cols > 1 ? `repeat(${cols}, minmax(0, 1fr))` : null);
      panels.forEach((pn) => {
        const box = wrap.append('div').attr('class', 'asy-tppanel');
        if (pn.label) box.append('div').attr('class', 'asy-panel__name').text(pn.label);
        const get = (d) => (rate ? d.r : d.v);
        const M = { t: 14, r: 12, b: 24, l: rate ? 34 : 52 };
        const x = d3.scaleTime().domain([t0, t1]).range([M.l, pw - M.r]);
        const y = d3.scaleLinear().domain([0, d3.max(pn.s.flat(), get)]).nice().range([ph - M.b, M.t]);
        const svg = box.append('svg').attr('width', pw).attr('height', ph).attr('role', 'img')
          .attr('aria-label', rate ? 'People holding temporary protection per 1,000 inhabitants, EU, Switzerland and Germany' : `People holding temporary protection, ${pn.label}`);
        svg.append('g').attr('class', 'grid').selectAll('line').data(y.ticks(4)).join('line').attr('x1', M.l).attr('x2', pw - M.r).attr('y1', y).attr('y2', y);
        svg.append('g').attr('class', 'axis axis--y').attr('transform', `translate(${M.l},0)`)
          .call(d3.axisLeft(y).ticks(4).tickFormat(rate ? d3.format(',') : d3.format('~s')).tickSize(0)).call((g) => g.select('.domain').remove());
        svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${ph - M.b})`)
          .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat('%Y')).tickSizeOuter(0));
        pn.s.forEach((sr) => {
          if (!sr.length) return;
          svg.append('path').attr('class', lineCls(sr[0].g)).attr('d', d3.line().x((d) => x(parseM(d.m))).y((d) => y(get(d)))(sr));
          sr.filter(isBrk).forEach((d) => svg.append('line').attr('class', 'asy-brk')
            .attr('x1', x(parseM(d.m))).attr('x2', x(parseM(d.m))).attr('y1', y(get(d)) - 7).attr('y2', y(get(d)) + 7));
        });
        const focus = svg.append('line').attr('class', 'asy-focus').attr('y1', M.t).attr('y2', ph - M.b).style('display', 'none');
        svg.append('rect').attr('class', 'overlay').attr('x', M.l).attr('y', M.t).attr('width', pw - M.l - M.r).attr('height', ph - M.t - M.b)
          .on('pointermove', (ev) => {
            const m = d3.timeFormat('%Y-%m')(d3.timeMonth.round(x.invert(d3.pointer(ev)[0])));
            const rs = pn.s.map((sr) => sr.find((d) => d.m === m)).filter(Boolean);
            if (!rs.length) { tip.hide(); focus.style('display', 'none'); return; }
            focus.style('display', null).attr('x1', x(parseM(m))).attr('x2', x(parseM(m)));
            const [px, py] = d3.pointer(ev, el);
            tip.show(`<div class="tt__meta">End of ${mName(m)}</div><dl class="tt__rows">` +
              rs.map((d) => `<div><dt>${placeShort(d.g)}</dt><dd>${rate ? f1(d.r) + ' per 1,000' : num(d.v)}${d.p ? ' p' : ''}</dd></div>` +
                (rate ? '' : `<div><dt>of them Ukrainians</dt><dd>${num(d.ua)}</dd></div>`)).join('') + '</dl>' +
              (rs.some(isBrk) ? '<p class="tt__note">Break in Eurostat&rsquo;s series this month (see the note).</p>' : ''), px, py);
          })
          .on('pointerleave', () => { tip.hide(); focus.style('display', 'none'); });
      });
    };
    onWidth(el, render);
    on(['tpMode'], render);
    const e1 = eu[eu.length - 1], c1 = ch[ch.length - 1], d1 = de[de.length - 1];
    $('#tp-text').innerHTML = `At the end of ${mName(e1.m)}, ${num(e1.v)} people held temporary protection in the EU, ${num(e1.ua)} of them citizens of Ukraine (${f1(pc(e1.ua, e1.v))}%); ` +
      `${f1(e1.r)} per 1,000 inhabitants. ` +
      `Switzerland, end of ${mName(c1.m)}: ${num(c1.v)}, ${num(c1.ua)} of them Ukrainians; ${f1(c1.r)} per 1,000 inhabitants. ` +
      (d1 ? `Germany, end of ${mName(d1.m)}: ${num(d1.v)}, ${num(d1.ua)} of them Ukrainians; ${f1(d1.r)} per 1,000 inhabitants.` : '');
    const metaBreaks = Object.keys(TP_BREAKS).filter((m) => eu.some((d) => d.m === m));
    const flagOnly = eu.filter((d) => d.b && !TP_BREAKS[d.m]);
    $('#tp-note').innerHTML = 'People holding temporary protection at the end of the month, rounded to the nearest 5. Eurostat&rsquo;s EU total starts in August 2022. ' +
      (metaBreaks.length ? `<a href="${TP_META}">Eurostat&rsquo;s notes</a> describe breaks in the EU series in ${andList(metaBreaks.map(mName))}: until then, the figures for ` +
        `${andList(metaBreaks.map((m) => TP_BREAKS[m]))} included some people whose temporary protection was no longer valid, so the drops in those months correct the count` +
        (Object.values(TP_BREAKS).includes('Germany') && de.length ? ' (Germany&rsquo;s own series is marked in the same month)' : '') + '. ' : '') +
      (flagOnly.length ? `Eurostat&rsquo;s data also flag ${flagOnly.map((d) => mName(d.m)).join(' and ')} as breaks. ` : '') +
      'Being granted temporary protection is not counted as an asylum application. Holders can still apply for asylum; those applications are counted with all others.';
    const months = [...new Set(TP.map((r) => r.m))].sort().reverse();
    const tcells = (d) => (d ? `<td class="num">${num(d.v)}${isBrk(d) ? ' b' : ''}</td><td class="num">${num(d.ua)}</td><td class="num">${f2(d.r)}</td>` : '<td class="num">–</td>'.repeat(3));
    $('#tp-table').innerHTML = `<table><thead><tr><th>Month</th><th class="num">EU</th><th class="num">of them Ukrainians</th><th class="num">EU per 1,000</th><th class="num">Switzerland</th><th class="num">of them Ukrainians</th><th class="num">CH per 1,000</th><th class="num">Germany</th><th class="num">of them Ukrainians</th><th class="num">DE per 1,000</th></tr></thead><tbody>` +
      months.map((m) => `<tr><td class="date">${m}</td>${tcells(eu.find((d) => d.m === m))}${tcells(ch.find((d) => d.m === m))}${tcells(de.find((d) => d.m === m))}</tr>`).join('') +
      '</tbody></table><p class="note asy-tnote">b = break in Eurostat’s series.</p>';
  }

  // ---------- method and sources ----------
  function drawHow() {
    const ds = new Map(META.map((r) => [r.ds, r]));
    const m = ds.get('migr_asyappctzm'), a = ds.get('migr_asyappctza'), p = ds.get('demo_gind'), dq = ds.get('migr_asydcfstq'), tq = ds.get('migr_asytpsm');
    const un = UNHCR_WORLD[UNHCR_WORLD.length - 1];
    const ug = UCDP_META.find((r) => r.ds === 'ged'), uc = UCDP_META.find((r) => r.ds === 'candidate'), ua = UCDP_META.find((r) => r.ds === 'acd');
    const dayName = (d) => d3.timeFormat('%-d %B %Y')(d3.timeParse('%Y-%m-%d')(d));
    const CHANGE_KIND = { method: 'method', source: 'sources', events: 'list of events' };
    const corrections = CHANGES.filter((r) => r.k === 'correction'), changes = CHANGES.filter((r) => r.k !== 'correction');
    const link = (r, label) => (r ? `<a href="${esc(r.url)}">${label}</a>` : label);
    const stamp = (r) => (r ? `Eurostat update of ${dayOf(r.upd)}, fetched ${dayOf(r.fetched)}` : '');
    const first = d3.min(META, (r) => r.first);
    const apart = REPORTERS.filter((r) => r.r === 'apart');
    const regUrl = REGIMES.length ? REGIMES[REGIMES.length - 1].url : null;
    const eu = lastOf('EU27_2020');
    const items = [
      ['What is counted', 'First-time asylum applicants: people who apply for international protection for the first time in a country. Because &ldquo;first time&rdquo; is per country, someone who applies in two countries is counted in both, and totals over several countries can be higher than the number of people. An applicant is not yet a refugee: whether someone receives protection is decided after the application.'],
      ['Not EU citizens', 'Every figure counts applicants who are not citizens of an EU member state, the group Eurostat uses for its EU total, so that the EU, Switzerland and the other countries are counted in the same way.'],
      ['The 31 countries', `The 27 EU member states, Iceland, Liechtenstein, Norway and Switzerland: one fixed set, shown for the years in which all of them report (${YEARS[0].y} to ${YEARS[YEARS.length - 1].y}). ` +
        `The EU total is Eurostat&rsquo;s own figure, shown from ${mName(series('EU27_2020')[0].m)}.` +
        (apart.length ? ` ${apart.map((r) => `${esc(r.n)} also reports (from ${mName(r.f)})`).join('; ')} and is not part of the set.` : '')],
      ['What changed in 2026', 'Eurostat collects these statistics under Regulation (EC) No 862/2007. Until May 2026 they referred to lodged applications, under guidelines applied from January 2014 and, revised, from January 2021. ' +
        'From July 2026, after the EU Pact on Migration and Asylum, Eurostat counts registered applicants (2026 Asylum Manual); June 2026 is a transition month. ' +
        'Charts mark the 2026 change (not the guideline revision of 2021); the texts compare no figures across it. ' +
        `Eurostat&rsquo;s notes do not say how the change applies to Iceland, Liechtenstein, Norway and Switzerland; their months from July 2026 are marked the same way. ${regUrl ? `<a href="${esc(regUrl)}">Eurostat&rsquo;s method notes</a>.` : ''}`],
      ['Temporary protection', UKRAINE + ' Eurostat counts the people holding it at the end of each month (migr_asytpsm); a number of people at one moment, shown on its own scale.'],
      ['Decisions', 'First-instance decisions by outcome, quarterly (migr_asydcfstq); a year here is the sum of its four quarters. Decisions in a year can concern applications from earlier years, so the page never divides them by the same year&rsquo;s applications. Final decisions on appeal are not shown.'],
      ['Organised violence', 'UCDP counts deaths in three kinds of organised violence: armed conflict in which a government is one side (state-based), fighting between armed groups (non-state) and attacks by a government or an armed group on civilians (one-sided). Its event data cover violence by the conflicts and groups that have reached UCDP&rsquo;s threshold of 25 deaths in a year; every event counted has at least one death. Crime outside such groups, and deaths from hunger or disease, are not counted. ' +
        'UCDP dates some events to a span of days; the page spreads their deaths evenly over those days, so a month gets the part that falls in it. ' +
        'Deaths are counted where the violence happened, applicants by the citizenship they hold: setting them side by side shows timing, not a cause. ' +
        'UCDP&rsquo;s Armed Conflict Dataset counts armed conflicts in which a government is one side, by conflict and calendar year; a year with 1,000 or more battle-related deaths in one conflict is at war level, the shading on the panels.'],
      ['Events on the panels', 'A short list kept by hand in the project&rsquo;s files: for each citizenship shown, events of the kinds named in the chapter&rsquo;s note, each with the UN record that dates it (UN News, statements, briefings and documents). The list is a selection, reviewed citizenship by citizenship; a panel says when a citizenship has not been reviewed yet. Quality checks refuse an event without a date, a kind or a link to a UN record.'],
      ['Applications and people who live somewhere', 'Applications are counted as they are made, month by month: a flow. UNHCR&rsquo;s refugees and Eurostat&rsquo;s temporary protection holders are people living in a country at one moment: a stock. The page never adds one to the other or puts them on one scale.'],
      ['Switzerland&rsquo;s own count', `The State Secretariat for Migration (SEM) publishes Switzerland&rsquo;s own asylum statistics. They count all asylum applications, including those for births, family reunification and repeat applications, so they differ from Eurostat&rsquo;s first-time applicants who are not EU citizens (<a href="${SEM_URL}">SEM, 2025</a>).`],
      ['Rounding and revisions', 'Eurostat rounds every figure to the nearest 5, so parts may not add up exactly to totals, and it revises figures. ' +
        (first ? `Since ${dayOf(first)} the project has kept every version of every figure it fetched from Eurostat, so each figure shown can be traced to the release it came from.` : '')],
      ['Rates', 'Per 100,000 inhabitants (applications by month and by country) or per 1,000 (applications by year, temporary protection), using the population on 1 January of the same year (Eurostat, demo_gind).'],
      ['Sources', `Eurostat: ${link(m, 'migr_asyappctzm')} (monthly, here through ${mName(eu.m)} for the EU; ${stamp(m)}), ${link(a, 'migr_asyappctza')} (yearly; ${stamp(a)}), ${link(p, 'demo_gind')} (population; ${stamp(p)}), ${link(dq, 'migr_asydcfstq')} (decisions; ${stamp(dq)}) and ${link(tq, 'migr_asytpsm')} (temporary protection; ${stamp(tq)}). ` +
        `UNHCR Refugee Population Statistics Database, end-${un.y} figures (fetched ${dayOf(un.fetched)}), used under UNHCR&rsquo;s <a href="https://www.unhcr.org/terms-use-datasets">Terms of Use for Datasets</a> (CC BY 4.0). ` +
        (ug ? `UCDP Georeferenced Event Dataset (GED) Global ${esc(ug.v)} (fetched ${dayOf(ug.fetched)})${uc ? ` and UCDP Candidate Events Dataset ${esc(uc.v)} (preliminary; fetched ${dayOf(uc.fetched)})` : ''}, <a href="${UCDP_PAGE}">ucdp.uu.se</a>, under CC BY 4.0: ` +
          'Davies, Pettersson and &Ouml;berg (2026), &ldquo;Organized violence 1989&ndash;2025, and violent political protests&rdquo;, <i>Journal of Peace Research</i> 63(4), <a href="https://doi.org/10.1093/jopres/xjag046">doi:10.1093/jopres/xjag046</a>; ' +
          'Sundberg and Melander (2013), &ldquo;Introducing the UCDP Georeferenced Event Dataset&rdquo;, <i>Journal of Peace Research</i> 50(4), <a href="https://doi.org/10.1177/0022343313484347">doi:10.1177/0022343313484347</a>; ' +
          'Hegre, Croicu, Eck and H&ouml;gbladh (2020), &ldquo;Introducing the UCDP Candidate Events Dataset&rdquo;, <i>Research &amp; Politics</i> 7(3), <a href="https://doi.org/10.1177/2053168020935257">doi:10.1177/2053168020935257</a>. ' : '') +
        (ua ? `UCDP/PRIO Armed Conflict Dataset ${esc(ua.v)} (fetched ${dayOf(ua.fetched)}), under CC BY 4.0: ` +
          'Gleditsch, Wallensteen, Eriksson, Sollenberg and Strand (2002), &ldquo;Armed Conflict 1946&ndash;2001: A New Dataset&rdquo;, <i>Journal of Peace Research</i> 39(5), <a href="https://doi.org/10.1177/0022343302039005007">doi:10.1177/0022343302039005007</a>, and Davies, Pettersson and &Ouml;berg (2026). ' : '') +
        'Events: the UN records linked beside each. ' +
        'Eurostat data reused with credit under the <a href="https://ec.europa.eu/eurostat/help/copyright-notice">Eurostat copyright notice</a>. Map: GISCO Countries 2024, derived from EuroGeographics, Turkstat and UN-FAO data; &copy; EuroGeographics for the administrative boundaries.'],
      ['Names', `Citizenships and countries are named as Eurostat names them, also beside UCDP&rsquo;s deaths; in the UNHCR chapter, as UNHCR names them.${footFor(['XK', 'PS'])}`],
      ['Corrections', corrections.length ? corrections.map((r) => `${dayName(r.d)}: ${esc(r.t)}`).join(' ') : 'None so far. Any correction will be listed here with its date, with what the page said before.'],
      ['Changes', `First published on ${dayName(PUBLISHED)}. ` + (changes.length ? changes.map((r) => `${dayName(r.d)} (${CHANGE_KIND[r.k]}): ${esc(r.t)}`).join(' ') : 'No changes since. Changes to the method, the sources or the list of events will be listed here with their date; data refreshes and new versions of a source are not changes (the sources above name their versions).')],
      ['The data', `Every number on this page is in the files it reads: <a href="${BASE}data/monthly.json">monthly</a>, <a href="${BASE}data/top.json">largest groups</a>, <a href="${BASE}data/years.json">years</a>, <a href="${BASE}data/flows.json">flows</a>, <a href="${BASE}data/origins.json">citizenships</a>, per year countries of application (<a href="${BASE}data/hosts_${YEARS[YEARS.length - 1].y}.json">${YEARS[YEARS.length - 1].y}</a>), <a href="${BASE}data/decisions.json">decisions</a>, <a href="${BASE}data/tp.json">temporary protection</a>, deaths beside applications (<a href="${BASE}data/conflict.json">ten largest groups</a>, <a href="${BASE}data/conflict_share.json">share by month</a>, <a href="${BASE}data/ucdp_meta.json">UCDP files</a>, <a href="${BASE}data/war_years.json">years at war level</a>, <a href="${BASE}data/events.json">events</a>, <a href="${BASE}data/event_reviews.json">reviews</a>), <a href="${BASE}data/changes.json">corrections and changes</a>, and UNHCR&rsquo;s <a href="${BASE}data/unhcr_world.json">world totals</a> and <a href="${BASE}data/unhcr_hosts.json">host countries</a>.`],
    ];
    $('#glossary').innerHTML = items.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join('');
    $('#credit').textContent = 'Europe’s Divides · Data: Eurostat, UNHCR, UCDP · Built by Thomas Massie';
  }

  // ---------- go ----------
  (async () => {
    try {
      let topo;
      [MONTHLY, TOP, YEARS, FLOWS, ORIGINS, META, REGIMES, REPORTERS, topo, DECISIONS, TP, UNHCR_HOSTS, UNHCR_WORLD, CONFLICT, SHARE, UCDP_META, WAR_YEARS, EVENTS, EVENT_REVIEWS, CHANGES, DEC_YEARS] = await Promise.all(
        ['monthly', 'top', 'years', 'flows', 'origins', 'meta', 'regimes', 'reporters', 'world.topo', 'decisions', 'tp', 'unhcr_hosts', 'unhcr_world', 'conflict', 'conflict_share', 'ucdp_meta', 'war_years', 'events', 'event_reviews', 'changes', 'decisions_years'].map((f) => getJSON(`data/${f}.json`)));
      REPORTERS.forEach((r) => { REPORTER.set(r.g, r.n); if (r.r === 'europe31') { REP31.add(r.g); if (r.eu) EU27.add(r.g); } });
      WORLD = topoReader(topo).features(topo.objects.countries);
      state.year = state.flowYear = state.decYear = YEARS[YEARS.length - 1].y;   // each chapter keeps its own year
      state.cit = ORIGINS.filter((r) => r.y === state.year).sort((a, b) => a.k - b.k)[0].c;
      drawHero();
      drawNear();
      drawPulse();
      drawTop();
      drawFlows();
      drawMap();
      drawWar();
      drawDecisions();
      drawTP();
      drawHow();
    } catch (e) {
      const p = document.createElement('p');
      p.className = 'error wrap';
      p.textContent = 'The data could not be loaded. ' + e.message;
      root.appendChild(p);
      console.error(e);
    }
  })();
})();
