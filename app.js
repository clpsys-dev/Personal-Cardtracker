/* =============================================================================
 *  TCG Inventory & Value Tracker  —  app logic
 *  Reads every tab of a Google Sheet via the Sheets API and renders one
 *  view ("tab") per friend with live inventory / sold / value totals.
 * ===========================================================================*/

(() => {
  "use strict";

  const state = {
    friends: [],     // [{ name, rows: [...], metrics: {...} }]
    activeTab: 0,
    search: "",
    filter: "all",   // all | stock | sold
    sort: { key: null, dir: 1 },
  };

  const $ = (sel) => document.querySelector(sel);
  const els = {
    tabs: $("#tabs"),
    content: $("#content"),
    refresh: $("#refresh-btn"),
    lastUpdated: $("#last-updated"),
  };

  const fmtMoney = (n) =>
    new Intl.NumberFormat(CONFIG.LOCALE, {
      style: "currency",
      currency: CONFIG.CURRENCY,
    }).format(isFinite(n) ? n : 0);

  const fmtInt = (n) => new Intl.NumberFormat(CONFIG.LOCALE).format(n || 0);

  // Normalise a header for fuzzy matching: lowercase, strip non-alphanumerics.
  const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  // Parse a money-ish string ("$1,234.50", "1234.5", "") into a number.
  const parseMoney = (v) => {
    if (v == null) return 0;
    const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
    return isFinite(n) ? n : 0;
  };

  // ---------------------------------------------------------------------------
  //  Data fetching
  // ---------------------------------------------------------------------------
  async function fetchAll() {
    // Preview mode: build friends straight from the bundled sample data.
    if (CONFIG.USE_SAMPLE) {
      return Object.entries(CONFIG.SAMPLE || {}).map(([name, dataRows]) => {
        const header = [
          "Product Name", "Game", "Set", "Product Number",
          "Inventory Date", "Value Sold", "Sold Date", "Transcation Complete",
        ];
        const rows = parseSheet([header, ...dataRows]);
        return { name, rows, metrics: computeMetrics(rows) };
      });
    }

    const id = CONFIG.SPREADSHEET_ID;
    const friends = CONFIG.FRIENDS || [];
    if (!id || id.includes("PASTE_") || !friends.length) {
      throw new ConfigError();
    }

    // Read each friend's tab as CSV via the public gviz endpoint (no API key).
    // Runs in parallel; a failed tab shows an error row rather than killing all.
    const results = await Promise.all(friends.map(async (f) => {
      const url =
        `https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}` +
        `/gviz/tq?tqx=out:csv&gid=${encodeURIComponent(f.gid)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Couldn't load tab "${f.name}" (HTTP ${res.status}).`);
      const text = await res.text();
      const values = parseCSV(text);
      const rows = parseSheet(values);
      return { name: f.name, rows, metrics: computeMetrics(rows) };
    }));
    return results;
  }

  // Minimal RFC-4180 CSV parser: handles quoted fields, embedded commas,
  // newlines, and "" escaped quotes. Returns a 2D array of strings.
  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += c;
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field); field = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); rows.push(row); row = []; field = "";
      } else field += c;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function ConfigError() {
    const e = new Error("Not configured");
    e.isConfig = true;
    return e;
  }

  // ---------------------------------------------------------------------------
  //  Parsing a single sheet's 2D array into typed row objects
  // ---------------------------------------------------------------------------
  function parseSheet(values) {
    if (!values.length) return [];
    const header = values[0];

    // Build header-index -> field-name map from CONFIG.COLUMNS aliases.
    const idx = {};
    Object.entries(CONFIG.COLUMNS).forEach(([field, aliases]) => {
      const wanted = aliases.map(norm);
      const found = header.findIndex((h) => wanted.includes(norm(h)));
      if (found !== -1) idx[field] = found;
    });

    const soldField = CONFIG.SOLD_FIELD;

    return values.slice(1)
      .filter((r) => r.some((c) => String(c).trim() !== "")) // skip blank rows
      .map((r) => {
        const get = (f) => (idx[f] != null ? (r[idx[f]] ?? "") : "");
        const valueSold = parseMoney(get("valueSold"));
        const soldRaw = String(get(soldField)).trim();
        const sold = soldRaw !== "";
        return {
          productName:   get("productName"),
          game:          get("game"),
          setCode:       get("setCode"),
          set:           get("set"),
          cardNumber:    get("cardNumber"),
          inventoryDate: get("inventoryDate"),
          valueSold,
          dateSold:      get("dateSold"),
          txnComplete:   get("txnComplete"),
          sold,
        };
      });
  }

  function computeMetrics(rows) {
    let inStock = 0, sold = 0, soldValue = 0;
    for (const row of rows) {
      if (row.sold) { sold++; soldValue += row.valueSold; }
      else inStock++;
    }
    return { total: rows.length, inStock, sold, soldValue };
  }

  // ---------------------------------------------------------------------------
  //  Rendering
  // ---------------------------------------------------------------------------
  function renderTabs() {
    els.tabs.innerHTML = "";
    state.friends.forEach((f, i) => {
      const b = document.createElement("button");
      b.className = "tab" + (i === state.activeTab ? " active" : "");
      b.textContent = `${f.name} (${f.metrics.total})`;
      b.onclick = () => { state.activeTab = i; state.search = ""; state.filter = "all"; render(); };
      els.tabs.appendChild(b);
    });
  }

  function render() {
    renderTabs();
    const friend = state.friends[state.activeTab];
    if (!friend) { els.content.innerHTML = `<div class="empty">No data.</div>`; return; }

    const m = friend.metrics;
    let rows = friend.rows.slice();

    // filter
    if (state.filter === "stock") rows = rows.filter((r) => !r.sold);
    if (state.filter === "sold") rows = rows.filter((r) => r.sold);

    // search
    const q = norm(state.search);
    if (q) {
      rows = rows.filter((r) =>
        norm([r.productName, r.game, r.setCode, r.set, r.cardNumber].join(" ")).includes(q)
      );
    }

    // sort
    if (state.sort.key) {
      const k = state.sort.key, dir = state.sort.dir;
      rows.sort((a, b) => {
        let av = a[k], bv = b[k];
        if (k === "valueSold") { av = +av; bv = +bv; return (av - bv) * dir; }
        if (k === "gameCode") { av = a.game || a.setCode; bv = b.game || b.setCode; }
        return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
      });
    }

    const cols = [
      ["productName", "Product"],
      ["gameCode", "Game / Code"],
      ["set", "Set"],
      ["cardNumber", "Number"],
      ["inventoryDate", "Inventory Date"],
      ["status", "Status"],
      ["valueSold", "Value Sold"],
      ["dateSold", "Date Sold"],
    ];

    const arrow = (key) =>
      state.sort.key === key ? `<span class="arrow">${state.sort.dir > 0 ? "▲" : "▼"}</span>` : "";

    els.content.innerHTML = `
      <section class="summary">
        <div class="card accent">
          <div class="label">In Inventory</div>
          <div class="value">${fmtInt(m.inStock)}</div>
          <div class="sub">cards not yet sold</div>
        </div>
        <div class="card good">
          <div class="label">Cards Sold</div>
          <div class="value">${fmtInt(m.sold)}</div>
          <div class="sub">of ${fmtInt(m.total)} total products</div>
        </div>
        <div class="card warn">
          <div class="label">Total Sale Value</div>
          <div class="value">${fmtMoney(m.soldValue)}</div>
          <div class="sub">sum of all "Value Sold"</div>
        </div>
      </section>

      <div class="toolbar">
        <input class="search" id="search" type="text" placeholder="Search product, set, card #…" value="${escapeHtml(state.search)}" />
        <div class="filter-group">
          ${["all", "stock", "sold"].map((f) =>
            `<button class="chip ${state.filter === f ? "active" : ""}" data-filter="${f}">${
              f === "all" ? "All" : f === "stock" ? "In Stock" : "Sold"
            }</button>`).join("")}
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead><tr>
            ${cols.map(([k, label]) =>
              `<th data-sort="${k}" class="${k === "valueSold" ? "num" : ""}">${label} ${arrow(k)}</th>`
            ).join("")}
          </tr></thead>
          <tbody>
            ${rows.length ? rows.map(rowHtml).join("") :
              `<tr><td colspan="${cols.length}" class="empty">No matching cards.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;

    // wire up controls
    const searchEl = $("#search");
    searchEl.oninput = (e) => { state.search = e.target.value; render(); placeCaretEnd(searchEl); };
    document.querySelectorAll(".chip").forEach((c) => {
      c.onclick = () => { state.filter = c.dataset.filter; render(); };
    });
    document.querySelectorAll("thead th[data-sort]").forEach((th) => {
      th.onclick = () => {
        const key = th.dataset.sort === "status" ? "sold" : th.dataset.sort;
        if (state.sort.key === key) state.sort.dir *= -1;
        else state.sort = { key, dir: 1 };
        render();
      };
    });
  }

  function rowHtml(r) {
    const status = r.sold
      ? `<span class="badge sold">Sold</span>`
      : `<span class="badge stock">In Stock</span>`;
    return `<tr>
      <td>${escapeHtml(r.productName)}</td>
      <td>${escapeHtml(r.game || r.setCode)}</td>
      <td>${escapeHtml(r.set)}</td>
      <td>${escapeHtml(r.cardNumber)}</td>
      <td>${escapeHtml(r.inventoryDate)}</td>
      <td>${status}</td>
      <td class="num">${r.sold ? fmtMoney(r.valueSold) : "—"}</td>
      <td>${escapeHtml(r.dateSold)}</td>
    </tr>`;
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function placeCaretEnd(input) {
    const v = input.value; input.focus(); input.value = ""; input.value = v;
  }

  function showError(err) {
    els.tabs.innerHTML = "";
    if (err.isConfig) {
      els.content.innerHTML = `
        <div class="error-box">
          <h2>⚙️ Almost there — add your spreadsheet details</h2>
          <p>Open <code>config.js</code> and fill in:</p>
          <ol>
            <li><code>SPREADSHEET_ID</code> — the long id from your sheet's URL.</li>
            <li><code>FRIENDS</code> — one <code>{ name, gid }</code> entry per tab.</li>
          </ol>
          <p>Also make sure the sheet is shared as <strong>"Anyone with the link can view."</strong>
             See <code>README.md</code> for step-by-step setup.</p>
        </div>`;
    } else {
      els.content.innerHTML = `
        <div class="error-box">
          <h2>Couldn't load the spreadsheet</h2>
          <p>${escapeHtml(err.message)}</p>
          <ol>
            <li>Is the sheet shared as <strong>"Anyone with the link can view"</strong>?</li>
            <li>Is the <code>SPREADSHEET_ID</code> correct?</li>
            <li>Are the <code>gid</code> numbers in <code>FRIENDS</code> correct?</li>
          </ol>
        </div>`;
    }
  }

  // ---------------------------------------------------------------------------
  //  Boot
  // ---------------------------------------------------------------------------
  async function load() {
    els.refresh.disabled = true;
    els.content.innerHTML = `
      <div class="loader"><div class="spinner"></div><p>Loading from Google Sheets…</p></div>`;
    try {
      state.friends = await fetchAll();
      if (state.activeTab >= state.friends.length) state.activeTab = 0;
      els.lastUpdated.textContent = CONFIG.USE_SAMPLE
        ? "⚠ Preview mode — sample data"
        : "Updated " + new Date().toLocaleTimeString(CONFIG.LOCALE);
      render();
    } catch (err) {
      console.error(err);
      showError(err);
    } finally {
      els.refresh.disabled = false;
    }
  }

  els.refresh.onclick = load;
  load();
})();
