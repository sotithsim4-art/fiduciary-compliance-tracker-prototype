/* Fiduciary Compliance Tracker (prototype). Plain JS, no dependencies. Example data only. */
(function () {
  "use strict";
  var KEY = "fct.prototype.v1";
  var STATUSES = ["Compliant", "At Risk", "Overdue", "Not Started"];
  var SCOLOR = { "Compliant": "#1b8a5a", "At Risk": "#d99a00", "Overdue": "#c0392b", "Not Started": "#7a8699" };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var regById = function (id) { return window.REGS.filter(function (r) { return r.id === id; })[0]; };
  var regName = function (id) { var r = regById(id); return r ? r.short : id; };

  /* ---------- state ---------- */
  var S;
  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) { var p = JSON.parse(raw); if (p && p.obligations) return p; } } catch (e) {}
    return window.seedData();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("Could not save to localStorage"); } }
  S = load();

  /* ---------- helpers ---------- */
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function slug(s) { return String(s).replace(/\s+/g, "-"); }
  function today() { var t = new Date(); t.setHours(0, 0, 0, 0); return t; }
  function parse(s) { if (!s) return null; var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function daysUntil(s) { var d = parse(s); return d ? Math.round((d - today()) / 86400000) : null; }
  function fmt(s) { var d = parse(s); return d ? d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : ""; }
  function chip(label) { return '<span class="chip s-' + slug(esc(label)) + '">' + esc(label) + "</span>"; }
  function verifyTag(v) { return v ? '<span class="verify" title="Interpretation or applicability not confirmed">verify with Compliance/Legal</span>' : ""; }
  function daysLabel(n, done) {
    if (done) return '<span class="days mute">Done</span>';
    if (n === null) return "";
    if (n < 0) return '<span class="days bad">' + Math.abs(n) + " days overdue</span>";
    if (n === 0) return '<span class="days bad">Due today</span>';
    var cls = n <= 14 ? "bad" : n <= 30 ? "warn" : n <= 90 ? "ok" : "mute";
    return '<span class="days ' + cls + '">' + n + " days left</span>";
  }
  function nextId(prefix, arr) {
    var max = 0; arr.forEach(function (x) { var m = /(\d+)$/.exec(x.id); if (m) max = Math.max(max, +m[1]); });
    return prefix + "-" + String(max + 1).padStart(3, "0");
  }
  function toast(msg) {
    var t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2200);
  }
  function evidenceCount(controlId) { return S.docs.filter(function (d) { return d.controlId === controlId; }).length; }
  function approvedCount(controlId) { return S.docs.filter(function (d) { return d.controlId === controlId && d.reviewStatus === "Approved"; }).length; }
  function ctl(id) { return S.controls.filter(function (c) { return c.id === id; })[0]; }
  function today0() { return today(); }
  function dateISO(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  /* ---------- CSV ---------- */
  function csvCell(v) { v = String(v == null ? "" : v); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; }
  function downloadCSV(name, cols, rows) {
    var out = [cols.map(function (c) { return csvCell(c[0]); }).join(",")];
    rows.forEach(function (r) { out.push(cols.map(function (c) { return csvCell(c[1](r)); }).join(",")); });
    var blob = new Blob(["\ufeff" + out.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name + "-" + dateISO(new Date()) + ".csv";
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast("Exported " + name + ".csv");
  }
  var EXPORTS = {
    obligations: ["obligations", [["ID", function (r) { return r.id; }], ["Regulation", function (r) { return regName(r.regId); }], ["Requirement", function (r) { return r.requirement; }], ["Owner", function (r) { return r.owner; }], ["Control ID", function (r) { return r.controlId; }], ["Due date", function (r) { return r.due; }], ["Status", function (r) { return r.status; }], ["Evidence count", function (r) { return evidenceCount(r.controlId); }], ["Verify with Compliance/Legal", function (r) { return r.verify ? "Yes" : ""; }], ["Notes", function (r) { return r.notes; }]], function () { return S.obligations; }],
    controls: ["control-map", [["Control ID", function (r) { return r.id; }], ["Control", function (r) { return r.name; }], ["Owner", function (r) { return r.owner; }]].concat(window.REGS.map(function (g) { return [g.short, function (r) { return r.regs.indexOf(g.id) >= 0 ? "X" : ""; }]; })), function () { return S.controls; }],
    calendar: ["reporting-calendar", [["ID", function (r) { return r.id; }], ["Item", function (r) { return r.title; }], ["Regulation", function (r) { return regName(r.regId); }], ["Type", function (r) { return r.kind; }], ["Date", function (r) { return r.date; }], ["Days remaining", function (r) { return r.done ? "" : daysUntil(r.date); }], ["Owner", function (r) { return r.owner; }], ["Done", function (r) { return r.done ? "Yes" : "No"; }]], function () { return S.events; }],
    evidence: ["evidence-register", [["ID", function (r) { return r.id; }], ["Name", function (r) { return r.name; }], ["Type", function (r) { return r.type; }], ["Control ID", function (r) { return r.controlId; }], ["Date", function (r) { return r.date; }], ["Reviewer", function (r) { return r.reviewer; }], ["Review status", function (r) { return r.reviewStatus; }], ["File name", function (r) { return r.fileName; }]], function () { return S.docs; }],
    issues: ["issues-log", [["ID", function (r) { return r.id; }], ["Issue", function (r) { return r.title; }], ["Control ID", function (r) { return r.controlId; }], ["Severity", function (r) { return r.severity; }], ["Found", function (r) { return r.found; }], ["Remediation due", function (r) { return r.remediationDue; }], ["Owner", function (r) { return r.owner; }], ["Status", function (r) { return r.status; }], ["Notes", function (r) { return r.notes; }]], function () { return S.issues; }]
  };
  function exportKey(k) { var e = EXPORTS[k]; downloadCSV(e[0], e[1], e[2]()); }

  /* ---------- entity config for forms ---------- */
  function regOpts() { return window.REGS.map(function (r) { return [r.id, r.name]; }); }
  function ctlOpts() { return S.controls.map(function (c) { return [c.id, c.id + " " + c.name]; }); }
  function opts(a) { return a.map(function (x) { return [x, x]; }); }
  var ENT = {
    obl: { arr: "obligations", prefix: "OB", label: "Obligation", fields: function () { return [
      { k: "regId", l: "Regulation", t: "select", o: regOpts() },
      { k: "requirement", l: "Requirement summary", t: "textarea", req: 1 },
      { k: "owner", l: "Owner", t: "text", req: 1 },
      { k: "controlId", l: "Control", t: "select", o: ctlOpts() },
      { k: "due", l: "Due date", t: "date", req: 1 },
      { k: "status", l: "Status", t: "select", o: opts(STATUSES) },
      { k: "verify", l: "Flag: verify with Compliance/Legal", t: "check" },
      { k: "notes", l: "Notes", t: "text" }]; }, blank: function () { return { regId: "ERISA", requirement: "", owner: "", controlId: S.controls[0] ? S.controls[0].id : "", due: dateISO(today0()), status: "Not Started", verify: false, notes: "" }; } },
    ctl: { arr: "controls", prefix: "C", label: "Control", fields: function (isNew) { return [
      { k: "id", l: "Control ID", t: "text", req: 1, ro: !isNew, hint: "Example: C-IR-04" },
      { k: "name", l: "Control name", t: "text", req: 1 },
      { k: "owner", l: "Owner", t: "text", req: 1 }]; }, blank: function () { return { id: "", name: "", owner: "", regs: [] }; } },
    evt: { arr: "events", prefix: "EVT", label: "Calendar item", fields: function () { return [
      { k: "title", l: "Filing or attestation", t: "text", req: 1 },
      { k: "regId", l: "Regulation", t: "select", o: regOpts() },
      { k: "kind", l: "Type", t: "select", o: opts(["Filing", "Attestation", "Review", "Training/Test"]) },
      { k: "date", l: "Date", t: "date", req: 1 },
      { k: "owner", l: "Owner", t: "text", req: 1 },
      { k: "done", l: "Completed", t: "check" },
      { k: "verify", l: "Flag: verify with Compliance/Legal", t: "check" }]; }, blank: function () { return { title: "", regId: "SEC10K", kind: "Review", date: dateISO(today0()), owner: "", done: false, verify: false }; } },
    doc: { arr: "docs", prefix: "DOC", label: "Document", fields: function () { return [
      { k: "name", l: "Document name", t: "text", req: 1 },
      { k: "type", l: "Type", t: "select", o: opts(["Policy", "Procedure", "Test Result", "Attestation", "Report", "Meeting Minutes", "Vendor Assessment", "Other"]) },
      { k: "controlId", l: "Linked control", t: "select", o: ctlOpts() },
      { k: "date", l: "Document date", t: "date", req: 1 },
      { k: "reviewer", l: "Reviewer", t: "text", req: 1 },
      { k: "reviewStatus", l: "Review status", t: "select", o: opts(["Pending", "In Review", "Approved", "Rejected"]) },
      { k: "fileName", l: "File name", t: "file", hint: "Only the file name is recorded. Nothing is uploaded." }]; }, blank: function () { return { name: "", type: "Policy", controlId: S.controls[0] ? S.controls[0].id : "", date: dateISO(today0()), reviewer: "", reviewStatus: "Pending", fileName: "" }; } },
    iss: { arr: "issues", prefix: "ISS", label: "Issue", fields: function () { return [
      { k: "title", l: "Issue or exception", t: "text", req: 1 },
      { k: "controlId", l: "Control tested", t: "select", o: ctlOpts() },
      { k: "severity", l: "Severity", t: "select", o: opts(["Low", "Medium", "High", "Critical"]) },
      { k: "found", l: "Date found", t: "date", req: 1 },
      { k: "remediationDue", l: "Remediation due", t: "date", req: 1 },
      { k: "owner", l: "Owner", t: "text", req: 1 },
      { k: "status", l: "Status", t: "select", o: opts(["Open", "In Progress", "Closed"]) },
      { k: "notes", l: "Notes", t: "text" }]; }, blank: function () { return { title: "", controlId: S.controls[0] ? S.controls[0].id : "", severity: "Medium", found: dateISO(today0()), remediationDue: dateISO(new Date(today0().getTime() + 30 * 86400000)), owner: "", status: "Open", notes: "" }; } }
  };

  /* ---------- modal form ---------- */
  function openForm(type, id) {
    var cfg = ENT[type], isNew = !id, rec = isNew ? cfg.blank() : Object.assign({}, S[cfg.arr].filter(function (x) { return x.id === id; })[0]);
    var fields = cfg.fields(isNew);
    var html = '<div class="box" role="dialog" aria-modal="true" aria-label="' + esc(cfg.label) + '"><h2>' + (isNew ? "Add " : "Edit ") + esc(cfg.label.toLowerCase()) + '</h2><form class="frm" id="entform" novalidate>';
    fields.forEach(function (f) {
      var v = rec[f.k], lab = esc(f.l);
      if (f.t === "check") { html += '<label class="cb"><input type="checkbox" name="' + f.k + '"' + (v ? " checked" : "") + "> " + lab + "</label>"; return; }
      html += "<label>" + lab;
      if (f.t === "select") html += '<select name="' + f.k + '">' + f.o.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === v ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>";
      else if (f.t === "textarea") html += '<textarea name="' + f.k + '">' + esc(v) + "</textarea>";
      else if (f.t === "file") html += '<input type="text" name="' + f.k + '" value="' + esc(v) + '" placeholder="example-file.pdf"><input type="file" id="filepick" aria-label="Pick a file to record its name">';
      else html += '<input type="' + f.t + '" name="' + f.k + '" value="' + esc(v) + '"' + (f.ro ? " readonly" : "") + ">";
      if (f.hint) html += '<span class="hint">' + esc(f.hint) + "</span>";
      html += "</label>";
    });
    html += '<div class="err" id="formerr" role="alert"></div><div class="row"><button class="btn" type="submit">' + (isNew ? "Add" : "Save changes") + '</button><button class="btn ghost" type="button" data-act="closemodal">Cancel</button></div></form></div>';
    var m = $("#modal"); m.innerHTML = html; m.hidden = false;
    var first = m.querySelector("input:not([readonly]),select,textarea"); if (first) first.focus();
    var fp = $("#filepick"); if (fp) fp.addEventListener("change", function () { if (fp.files[0]) m.querySelector('[name="fileName"]').value = fp.files[0].name; });
    $("#entform").addEventListener("submit", function (e) {
      e.preventDefault();
      var out = Object.assign({}, rec), err = "";
      fields.forEach(function (f) {
        var el = e.target.elements[f.k]; if (!el) return;
        var val = f.t === "check" ? el.checked : el.value.trim();
        if (f.req && !val) err = f.l + " is required.";
        out[f.k] = val;
      });
      if (!err && type === "ctl" && isNew && S.controls.some(function (c) { return c.id === out.id; })) err = "That control ID already exists.";
      if (!err && type === "iss" && out.remediationDue < out.found) err = "Remediation due cannot be before the date found.";
      if (err) { $("#formerr").textContent = err; return; }
      if (isNew) { if (type !== "ctl") out.id = nextId(cfg.prefix, S[cfg.arr]); S[cfg.arr].push(out); }
      else { var i = S[cfg.arr].findIndex(function (x) { return x.id === id; }); S[cfg.arr][i] = out; }
      save(); closeModal(); render(); toast(cfg.label + (isNew ? " added" : " updated"));
    });
  }
  function closeModal() { var m = $("#modal"); m.hidden = true; m.innerHTML = ""; }
  function delRecord(type, id) {
    var cfg = ENT[type];
    if (type === "ctl") {
      var used = S.obligations.filter(function (o) { return o.controlId === id; }).length + S.docs.filter(function (o) { return o.controlId === id; }).length + S.issues.filter(function (o) { return o.controlId === id; }).length;
      if (used) { alert("Control " + id + " is still linked to " + used + " obligation, document or issue records. Re-link or delete those first."); return; }
    }
    if (!confirm("Delete " + cfg.label.toLowerCase() + " " + id + "? This cannot be undone (use Reset sample data to restore the examples).")) return;
    S[cfg.arr] = S[cfg.arr].filter(function (x) { return x.id !== id; }); save(); render(); toast(cfg.label + " deleted");
  }

  /* ---------- table sorting/filtering ---------- */
  var UI = { sort: { obl: { k: "due", d: 1 }, doc: { k: "date", d: -1 }, iss: { k: "remediationDue", d: 1 } }, f: { obl: { q: "", reg: "", status: "", owner: "" }, doc: { q: "", status: "", type: "" }, iss: { q: "", sev: "", status: "" } } };
  function sortRows(rows, key, getters) {
    var s = UI.sort[key], g = getters[s.k] || function (r) { return r[s.k]; };
    return rows.slice().sort(function (a, b) { var x = g(a), y = g(b); if (typeof x === "string") { x = x.toLowerCase(); y = String(y).toLowerCase(); } return (x < y ? -1 : x > y ? 1 : 0) * s.d; });
  }
  function th(key, k, label) {
    var s = UI.sort[key], arrow = s.k === k ? (s.d === 1 ? " \u25B2" : " \u25BC") : "";
    return '<th class="sortable" data-sort="' + key + ":" + k + '" tabindex="0" role="button" aria-label="Sort by ' + esc(label) + '">' + esc(label) + arrow + "</th>";
  }
  function acts(type, id, extra) {
    return '<td class="act">' + (extra || "") + '<button class="btn ghost sm" data-act="edit" data-type="' + type + '" data-id="' + id + '">Edit</button><button class="btn danger sm" data-act="del" data-type="' + type + '" data-id="' + id + '">Delete</button></td>';
  }

  /* ---------- charts ---------- */
  function donut(counts) {
    var total = STATUSES.reduce(function (a, s) { return a + counts[s]; }, 0), r = 62, c = 2 * Math.PI * r, off = 0, segs = "";
    STATUSES.forEach(function (s) {
      if (!counts[s]) return;
      var len = counts[s] / total * c;
      segs += '<circle r="' + r + '" cx="90" cy="90" fill="none" stroke="' + SCOLOR[s] + '" stroke-width="26" stroke-dasharray="' + len + " " + (c - len) + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 90 90)"><title>' + s + ": " + counts[s] + "</title></circle>"; off += len;
    });
    var legend = STATUSES.map(function (s, i) { return '<g transform="translate(190,' + (46 + i * 26) + ')"><rect width="12" height="12" rx="3" fill="' + SCOLOR[s] + '"/><text x="19" y="11" font-size="13" fill="#1c2733">' + s + ": " + counts[s] + "</text></g>"; }).join("");
    return '<svg viewBox="0 0 360 180" width="100%" role="img" aria-label="Obligations by status">' + (total ? segs : '<circle r="62" cx="90" cy="90" fill="none" stroke="#e1e6ec" stroke-width="26"/>') + '<text x="90" y="88" text-anchor="middle" font-size="28" font-weight="700" fill="#1c2733">' + total + '</text><text x="90" y="108" text-anchor="middle" font-size="12" fill="#5d6b7b">obligations</text>' + legend + "</svg>";
  }
  function barsByReg() {
    var rows = window.REGS.map(function (g) { var c = {}; STATUSES.forEach(function (s) { c[s] = S.obligations.filter(function (o) { return o.regId === g.id && o.status === s; }).length; }); return { g: g, c: c, t: STATUSES.reduce(function (a, s) { return a + c[s]; }, 0) }; });
    var max = Math.max.apply(null, rows.map(function (r) { return r.t; }).concat([1])), W = 230, svg = "";
    rows.forEach(function (r, i) {
      var y = 8 + i * 26, x = 110;
      svg += '<text x="104" y="' + (y + 13) + '" text-anchor="end" font-size="12" fill="#1c2733">' + esc(r.g.short) + "</text>";
      STATUSES.forEach(function (s) { var w = r.c[s] / max * W; if (w > 0) { svg += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="18" fill="' + SCOLOR[s] + '"><title>' + esc(r.g.short) + " " + s + ": " + r.c[s] + "</title></rect>"; x += w; } });
      svg += '<text x="' + (x + 6) + '" y="' + (y + 13) + '" font-size="12" fill="#5d6b7b">' + r.t + "</text>";
    });
    return '<svg viewBox="0 0 380 ' + (rows.length * 26 + 14) + '" width="100%" role="img" aria-label="Obligations by regulation and status">' + svg + "</svg>";
  }
  function bucketBars(b) {
    var items = [["Next 30 days", b[0], "#c0392b"], ["31 to 60 days", b[1], "#d99a00"], ["61 to 90 days", b[2], "#2e7d9a"]], max = Math.max.apply(null, items.map(function (i) { return i[1]; }).concat([1])), svg = "";
    items.forEach(function (it, i) { var h = it[1] / max * 90, x = 30 + i * 105; svg += '<rect x="' + x + '" y="' + (110 - h) + '" width="70" height="' + h + '" rx="4" fill="' + it[2] + '"><title>' + it[0] + ": " + it[1] + '</title></rect><text x="' + (x + 35) + '" y="' + (104 - h) + '" text-anchor="middle" font-size="14" font-weight="700" fill="#1c2733">' + it[1] + '</text><text x="' + (x + 35) + '" y="128" text-anchor="middle" font-size="12" fill="#5d6b7b">' + it[0] + "</text>"; });
    return '<svg viewBox="0 0 340 140" width="100%" role="img" aria-label="Open deadlines by window">' + svg + "</svg>";
  }

  /* ---------- data derivations ---------- */
  function counts() { var c = {}; STATUSES.forEach(function (s) { c[s] = S.obligations.filter(function (o) { return o.status === s; }).length; }); return c; }
  function upcoming() {
    var items = [];
    S.obligations.forEach(function (o) { if (o.status !== "Compliant") items.push({ title: o.requirement, sub: "Obligation " + o.id + " | " + regName(o.regId), date: o.due, owner: o.owner, verify: o.verify, kind: "Obligation", status: o.status }); });
    S.events.forEach(function (e) { if (!e.done) items.push({ title: e.title, sub: e.kind + " | " + regName(e.regId), date: e.date, owner: e.owner, verify: e.verify, kind: e.kind }); });
    S.issues.forEach(function (i) { if (i.status !== "Closed") items.push({ title: "Remediate: " + i.title, sub: "Issue " + i.id + " | " + i.severity, date: i.remediationDue, owner: i.owner, kind: "Issue", status: i.severity }); });
    items.forEach(function (i) { i.days = daysUntil(i.date); });
    return items.sort(function (a, b) { return a.days - b.days; });
  }

  /* ---------- views ---------- */
  var V = {};
  function head(title, sub, btns) { return '<div class="head"><div><h1>' + esc(title) + '</h1><p class="sub">' + esc(sub) + '</p></div><div class="row noprint">' + (btns || "") + "</div></div>"; }
  function exportBtn(k) { return '<button class="btn ghost" data-act="export" data-key="' + k + '">Export CSV</button>'; }

  V.dashboard = function () {
    var c = counts(), up = upcoming(), fut = up.filter(function (i) { return i.days >= 0; });
    var b = [0, 0, 0]; fut.forEach(function (i) { if (i.days <= 30) b[0]++; else if (i.days <= 60) b[1]++; else if (i.days <= 90) b[2]++; });
    var overdueItems = up.filter(function (i) { return i.days < 0; });
    var openIssues = S.issues.filter(function (i) { return i.status !== "Closed"; });
    var h = head("Dashboard", "Example data only. Status, deadlines and open issues at a glance.", '<button class="btn" data-act="goto" data-v="report">Printable report</button>');
    h += '<div class="grid g4">' +
      '<div class="card stat ok"><div class="n">' + c["Compliant"] + '</div><div class="l">Compliant</div></div>' +
      '<div class="card stat warn"><div class="n">' + c["At Risk"] + '</div><div class="l">At Risk</div></div>' +
      '<div class="card stat bad"><div class="n">' + c["Overdue"] + '</div><div class="l">Overdue</div></div>' +
      '<div class="card stat"><div class="n">' + c["Not Started"] + '</div><div class="l">Not Started</div></div>' +
      '<div class="card stat brand"><div class="n">' + openIssues.length + '</div><div class="l">Open issues</div></div></div>';
    h += '<div class="grid g4" style="margin-top:14px">' +
      [["Next 30 days", 30], ["Next 60 days", 60], ["Next 90 days", 90]].map(function (w) { var n = fut.filter(function (i) { return i.days <= w[1]; }).length; return '<div class="card stat brand"><div class="n">' + n + '</div><div class="l">Deadlines due in the ' + w[0].toLowerCase() + "</div></div>"; }).join("") +
      '<div class="card stat bad"><div class="n">' + overdueItems.length + '</div><div class="l">Past-due items (obligations, filings, issues)</div></div></div>';
    h += '<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Obligations by status</h2>' + donut(c) + '</div><div class="card"><h2>Open deadlines by window (separate buckets)</h2>' + bucketBars(b) + "</div></div>";
    h += '<div class="card quick" style="margin-top:14px"><h2>Quick links</h2><ul class="links"><li><a href="https://sotithsim4-art.github.io/" target="_blank" rel="noopener noreferrer">Sotith\'s portfolio</a> <span class="muted small">(opens in a new tab)</span></li></ul></div>';
    h += '<div class="card" style="margin-top:14px"><h2>Status by regulation</h2><div style="max-width:620px">' + barsByReg() + '</div>' + "</div>";
    h += '<div class="card" style="margin-top:14px"><h2>Next deadlines and past-due items</h2>';
    var list = overdueItems.slice(-4).concat(fut.slice(0, 8));
    h += list.length ? '<div class="tablewrap" style="border:0"><table><thead><tr><th>Due</th><th>When</th><th>Item</th><th>Owner</th></tr></thead><tbody>' + list.map(function (i) { return "<tr><td>" + fmt(i.date) + "</td><td>" + daysLabel(i.days) + "</td><td>" + esc(i.title) + '<br><span class="muted small">' + esc(i.sub) + "</span> " + verifyTag(i.verify) + "</td><td>" + esc(i.owner) + "</td></tr>"; }).join("") + "</tbody></table></div>" : '<div class="empty">Nothing upcoming.</div>';
    return h + "</div>";
  };

  V.obligations = function () {
    var f = UI.f.obl, owners = Array.from(new Set(S.obligations.map(function (o) { return o.owner; }))).sort();
    var rows = S.obligations.filter(function (o) {
      var q = f.q.toLowerCase();
      return (!f.reg || o.regId === f.reg) && (!f.status || o.status === f.status) && (!f.owner || o.owner === f.owner) &&
        (!q || (o.requirement + " " + o.owner + " " + o.controlId + " " + o.id + " " + regName(o.regId)).toLowerCase().indexOf(q) >= 0);
    });
    rows = sortRows(rows, "obl", { regId: function (r) { return regName(r.regId); }, evidence: function (r) { return evidenceCount(r.controlId); } });
    var h = head("Obligations register", "Add, edit, delete and mark obligations complete. Changes are saved in this browser.", '<button class="btn" data-act="add" data-type="obl">Add obligation</button>' + exportBtn("obligations"));
    h += '<div class="filters noprint"><input id="f-q" type="search" placeholder="Search requirement, owner, control" value="' + esc(f.q) + '" aria-label="Search obligations">' +
      '<select id="f-reg" aria-label="Filter by regulation"><option value="">All regulations</option>' + window.REGS.map(function (r) { return '<option value="' + r.id + '"' + (f.reg === r.id ? " selected" : "") + ">" + esc(r.short) + "</option>"; }).join("") + "</select>" +
      '<select id="f-status" aria-label="Filter by status"><option value="">All statuses</option>' + STATUSES.map(function (s) { return '<option' + (f.status === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select>" +
      '<select id="f-owner" aria-label="Filter by owner"><option value="">All owners</option>' + owners.map(function (s) { return '<option' + (f.owner === s ? " selected" : "") + ">" + esc(s) + "</option>"; }).join("") + "</select>" +
      '<span class="muted small" style="align-self:center">' + rows.length + " of " + S.obligations.length + " shown</span></div>";
    h += '<div class="tablewrap"><table><thead><tr>' + th("obl", "id", "ID") + th("obl", "regId", "Regulation") + th("obl", "requirement", "Requirement summary") + th("obl", "owner", "Owner") + th("obl", "controlId", "Control") + th("obl", "due", "Due") + th("obl", "status", "Status") + th("obl", "evidence", "Evidence") + "<th>Actions</th></tr></thead><tbody>";
    h += rows.length ? rows.map(function (o) {
      var n = daysUntil(o.due);
      return "<tr><td>" + o.id + "</td><td>" + esc(regName(o.regId)) + '</td><td class="req">' + esc(o.requirement) + (o.notes ? '<br><span class="muted small">Note: ' + esc(o.notes) + "</span>" : "") + "<br>" + verifyTag(o.verify) + "</td><td>" + esc(o.owner) + "</td><td>" + esc(o.controlId) + "</td><td>" + fmt(o.due) + "<br>" + (o.status === "Compliant" ? "" : daysLabel(n)) + "</td><td>" + chip(o.status) + "</td><td>" + evidenceCount(o.controlId) + ' <span class="muted small">(' + approvedCount(o.controlId) + " approved)</span></td>" +
        acts("obl", o.id, o.status === "Compliant" ? "" : '<button class="btn ok sm" data-act="complete" data-id="' + o.id + '" title="Mark complete">Mark complete</button>') + "</tr>";
    }).join("") : '<tr><td colspan="9" class="empty">No obligations match the filters.</td></tr>';
    return h + "</tbody></table></div>";
  };

  V.controls = function () {
    var h = head("Control to regulation map", "One control can satisfy several regulations. Tick a box to map or unmap. Red cells mark a regulation with no mapped control.", '<button class="btn" data-act="add" data-type="ctl">Add control</button>' + exportBtn("controls"));
    var cover = {}; window.REGS.forEach(function (g) { cover[g.id] = S.controls.filter(function (c) { return c.regs.indexOf(g.id) >= 0; }).length; });
    h += '<div class="tablewrap"><table class="matrix"><thead><tr><th>Control</th><th>Owner</th>' + window.REGS.map(function (g) { return '<th class="reg" title="' + esc(g.name) + '">' + esc(g.short) + "</th>"; }).join("") + "<th>Maps</th><th>Actions</th></tr></thead><tbody>";
    h += S.controls.map(function (c) {
      return "<tr><td><b>" + esc(c.id) + "</b><br>" + esc(c.name) + "</td><td>" + esc(c.owner) + "</td>" + window.REGS.map(function (g) { return '<td class="c"><input type="checkbox" data-map="' + esc(c.id) + ":" + g.id + '"' + (c.regs.indexOf(g.id) >= 0 ? " checked" : "") + ' aria-label="' + esc(c.id + " maps to " + g.short) + '"></td>'; }).join("") + '<td class="c">' + c.regs.length + "</td>" + acts("ctl", c.id) + "</tr>";
    }).join("");
    h += '</tbody><tfoot><tr><th colspan="2">Controls per regulation</th>' + window.REGS.map(function (g) { return '<th class="reg ' + (cover[g.id] ? "" : "gap") + '">' + cover[g.id] + "</th>"; }).join("") + "<th></th><th></th></tr></tfoot></table></div>";
    h += '<p class="muted small">Example mapping only. Real control-to-regulation mappings must be confirmed by Compliance/Legal.</p>';
    return h;
  };

  V.calendar = function () {
    var ev = S.events.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    var open = ev.filter(function (e) { return !e.done; });
    var due7 = open.filter(function (e) { var n = daysUntil(e.date); return n >= 0 && n <= 7; }).length, late = open.filter(function (e) { return daysUntil(e.date) < 0; }).length, d30 = open.filter(function (e) { var n = daysUntil(e.date); return n >= 0 && n <= 30; }).length;
    var h = head("Regulatory reporting calendar", "Filings, attestations and reviews with reminders flagged by days remaining. Change a date inline.", '<button class="btn" data-act="add" data-type="evt">Add item</button>' + exportBtn("calendar"));
    h += '<div class="row" style="margin-bottom:10px"><span class="chip s-Overdue">' + late + ' overdue</span><span class="chip s-At-Risk">' + due7 + ' due within 7 days</span><span class="chip s-Not-Started">' + d30 + ' due within 30 days</span><span class="muted small">Colors: red 14 days or less or overdue, amber up to 30, green up to 90.</span></div>';
    var lastMonth = "";
    ev.forEach(function (e) {
      var d = parse(e.date), m = d ? d.toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "No date", n = daysUntil(e.date);
      if (m !== lastMonth) { h += '<div class="month">' + esc(m) + "</div>"; lastMonth = m; }
      var cls = e.done ? "done mute" : n < 0 || n <= 14 ? "bad" : n <= 30 ? "warn" : n <= 90 ? "ok" : "mute";
      h += '<div class="remind ' + cls + '"><input type="checkbox" data-evtdone="' + e.id + '"' + (e.done ? " checked" : "") + ' aria-label="Mark ' + esc(e.title) + ' done"><div class="t"><b>' + esc(e.title) + '</b><span class="muted small">' + esc(e.kind) + " | " + esc(regName(e.regId)) + " | Owner: " + esc(e.owner) + "</span> " + verifyTag(e.verify) + '</div><input type="date" value="' + esc(e.date) + '" data-evtdate="' + e.id + '" aria-label="Date for ' + esc(e.title) + '"><div style="min-width:110px;text-align:right">' + daysLabel(n, e.done) + '</div><div class="act noprint"><button class="btn ghost sm" data-act="edit" data-type="evt" data-id="' + e.id + '">Edit</button><button class="btn danger sm" data-act="del" data-type="evt" data-id="' + e.id + '">Delete</button></div></div>';
    });
    if (!ev.length) h += '<div class="card empty">No calendar items yet.</div>';
    return h;
  };

  V.evidence = function () {
    var f = UI.f.doc;
    var rows = S.docs.filter(function (d) { var q = f.q.toLowerCase(); return (!f.status || d.reviewStatus === f.status) && (!f.type || d.type === f.type) && (!q || (d.name + " " + d.reviewer + " " + d.controlId + " " + d.fileName).toLowerCase().indexOf(q) >= 0); });
    rows = sortRows(rows, "doc", {});
    var types = Array.from(new Set(S.docs.map(function (d) { return d.type; }))).sort();
    var h = head("Evidence and document register", "Metadata only. Pick a file to record its name; nothing is uploaded or stored.", '<button class="btn" data-act="add" data-type="doc">Add document</button>' + exportBtn("evidence"));
    h += '<div class="filters noprint"><input id="d-q" type="search" placeholder="Search name, reviewer, control" value="' + esc(f.q) + '" aria-label="Search documents"><select id="d-status" aria-label="Filter by review status"><option value="">All review statuses</option>' + ["Pending", "In Review", "Approved", "Rejected"].map(function (s) { return "<option" + (f.status === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + '</select><select id="d-type" aria-label="Filter by type"><option value="">All types</option>' + types.map(function (s) { return "<option" + (f.type === s ? " selected" : "") + ">" + esc(s) + "</option>"; }).join("") + "</select></div>";
    h += '<div class="tablewrap"><table><thead><tr>' + th("doc", "id", "ID") + th("doc", "name", "Document") + th("doc", "type", "Type") + th("doc", "controlId", "Linked control") + th("doc", "date", "Date") + th("doc", "reviewer", "Reviewer") + th("doc", "reviewStatus", "Review") + "<th>File name</th><th>Actions</th></tr></thead><tbody>";
    h += rows.length ? rows.map(function (d) { return "<tr><td>" + d.id + "</td><td>" + esc(d.name) + "</td><td>" + esc(d.type) + "</td><td>" + esc(d.controlId) + "</td><td>" + fmt(d.date) + "</td><td>" + esc(d.reviewer) + "</td><td>" + chip(d.reviewStatus) + '</td><td class="small">' + esc(d.fileName) + "</td>" + acts("doc", d.id) + "</tr>"; }).join("") : '<tr><td colspan="9" class="empty">No documents match.</td></tr>';
    return h + "</tbody></table></div>";
  };

  V.issues = function () {
    var f = UI.f.iss, sevRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    var rows = S.issues.filter(function (i) { var q = f.q.toLowerCase(); return (!f.sev || i.severity === f.sev) && (!f.status || i.status === f.status) && (!q || (i.title + " " + i.owner + " " + i.controlId).toLowerCase().indexOf(q) >= 0); });
    rows = sortRows(rows, "iss", { severity: function (r) { return sevRank[r.severity]; } });
    var h = head("Issues and exceptions log", "Findings from control testing, with severity and remediation due dates.", '<button class="btn" data-act="add" data-type="iss">Add issue</button>' + exportBtn("issues"));
    h += '<div class="filters noprint"><input id="i-q" type="search" placeholder="Search issue, owner, control" value="' + esc(f.q) + '" aria-label="Search issues"><select id="i-sev" aria-label="Filter by severity"><option value="">All severities</option>' + ["Critical", "High", "Medium", "Low"].map(function (s) { return "<option" + (f.sev === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + '</select><select id="i-status" aria-label="Filter by status"><option value="">All statuses</option>' + ["Open", "In Progress", "Closed"].map(function (s) { return "<option" + (f.status === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></div>";
    h += '<div class="tablewrap"><table><thead><tr>' + th("iss", "id", "ID") + th("iss", "title", "Issue") + th("iss", "controlId", "Control") + th("iss", "severity", "Severity") + th("iss", "found", "Found") + th("iss", "remediationDue", "Remediation due") + th("iss", "owner", "Owner") + th("iss", "status", "Status") + "<th>Actions</th></tr></thead><tbody>";
    h += rows.length ? rows.map(function (i) {
      return "<tr><td>" + i.id + "</td><td>" + esc(i.title) + (i.notes ? '<br><span class="muted small">' + esc(i.notes) + "</span>" : "") + "</td><td>" + esc(i.controlId) + "</td><td>" + chip(i.severity) + "</td><td>" + fmt(i.found) + "</td><td>" + fmt(i.remediationDue) + "<br>" + daysLabel(daysUntil(i.remediationDue), i.status === "Closed") + "</td><td>" + esc(i.owner) + "</td><td>" + chip(i.status) + "</td>" +
        acts("iss", i.id, i.status === "Closed" ? "" : '<button class="btn ok sm" data-act="closeissue" data-id="' + i.id + '">Close</button>') + "</tr>";
    }).join("") : '<tr><td colspan="9" class="empty">No issues match.</td></tr>';
    return h + "</tbody></table></div>";
  };

  V.report = function () {
    var c = counts(), up = upcoming().filter(function (i) { return i.days <= 90; });
    var open = S.issues.filter(function (i) { return i.status !== "Closed"; });
    var rank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    open.sort(function (a, b) { return rank[b.severity] - rank[a.severity]; });
    var h = head("Compliance summary report", "Generated " + new Date().toLocaleString() + ". Example data only.", '<button class="btn" data-act="print">Print or save as PDF</button>' + ["obligations", "calendar", "evidence", "issues", "controls"].map(function (k) { return '<button class="btn ghost" data-act="export" data-key="' + k + '">CSV: ' + k + "</button>"; }).join(""));
    h += '<div class="report"><div class="card"><b>Prototype with example data, not an official tool. Not legal advice.</b> Items marked "verify with Compliance/Legal" are unconfirmed interpretations.</div>';
    h += "<h2>1. Status overview</h2><div class=\"grid g4\">" + STATUSES.map(function (s) { return '<div class="card stat"><div class="n">' + c[s] + '</div><div class="l">' + s + "</div></div>"; }).join("") + '<div class="card stat"><div class="n">' + open.length + '</div><div class="l">Open issues</div></div></div>';
    h += "<h2>2. Obligations needing attention</h2>";
    var att = S.obligations.filter(function (o) { return o.status !== "Compliant"; }).sort(function (a, b) { return a.due < b.due ? -1 : 1; });
    h += '<div class="tablewrap"><table><thead><tr><th>ID</th><th>Regulation</th><th>Requirement</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>' + att.map(function (o) { return "<tr><td>" + o.id + "</td><td>" + esc(regName(o.regId)) + "</td><td>" + esc(o.requirement) + "</td><td>" + esc(o.owner) + "</td><td>" + fmt(o.due) + "</td><td>" + chip(o.status) + "</td></tr>"; }).join("") + "</tbody></table></div>";
    h += "<h2>3. Deadlines in the next 90 days (and past due)</h2>";
    h += '<div class="tablewrap"><table><thead><tr><th>Date</th><th>When</th><th>Item</th><th>Owner</th></tr></thead><tbody>' + up.map(function (i) { return "<tr><td>" + fmt(i.date) + "</td><td>" + daysLabel(i.days) + "</td><td>" + esc(i.title) + '<br><span class="muted small">' + esc(i.sub) + "</span></td><td>" + esc(i.owner) + "</td></tr>"; }).join("") + "</tbody></table></div>";
    h += "<h2>4. Open issues and exceptions</h2>";
    h += '<div class="tablewrap"><table><thead><tr><th>ID</th><th>Issue</th><th>Severity</th><th>Remediation due</th><th>Owner</th></tr></thead><tbody>' + (open.length ? open.map(function (i) { return "<tr><td>" + i.id + "</td><td>" + esc(i.title) + "</td><td>" + chip(i.severity) + "</td><td>" + fmt(i.remediationDue) + "</td><td>" + esc(i.owner) + "</td></tr>"; }).join("") : '<tr><td colspan="5" class="empty">No open issues.</td></tr>') + "</tbody></table></div>";
    h += "<h2>5. Evidence review status</h2><p>" + ["Approved", "In Review", "Pending", "Rejected"].map(function (s) { return chip(s) + " " + S.docs.filter(function (d) { return d.reviewStatus === s; }).length; }).join(" &nbsp; ") + "</p></div>";
    return h;
  };

  V.about = function () {
    return head("About this prototype", "Read before sharing.") + '<div class="card about"><h2>Prototype with example data, not an official tool</h2>' +
      "<p>The Fiduciary Compliance Tracker is a demonstration of what a small internal compliance app can look like. It is not a product of any asset manager and does not use any firm's real data. Every obligation, control, document, issue and filing shown is synthetic example data.</p>" +
      "<p><b>Not legal advice.</b> The regulation summaries are short, simplified descriptions for demonstration. Rules change, have exceptions and apply differently by entity. Items marked <span class=\"verify\">verify with Compliance/Legal</span> are ones where applicability, timing or interpretation was not confirmed. Always check primary sources and confirm with Compliance and Legal before relying on anything here.</p>" +
      "<h2>Regulatory facts used in the examples</h2><ul>" +
      "<li><b>SEC Form 8-K Item 1.05:</b> disclose a material cybersecurity incident within four business days after determining it is material.</li>" +
      "<li><b>SEC Form 10-K Item 1C:</b> annual disclosure of cyber risk management and governance.</li>" +
      "<li><b>SEC Regulation S-P amendments:</b> written incident response program, service providers to notify the firm within 72 hours, customer notice within 30 days. Compliance dates vary by firm size.</li>" +
      "<li><b>DORA:</b> applies since January 17, 2025. Major ICT incident reporting: initial within 4 hours of classification (and within 24 hours of awareness), intermediate within 72 hours, final within one month.</li>" +
      "<li><b>NYDFS 23 NYCRR Part 500:</b> 72 hour notice of cybersecurity events and an annual certification by April 15.</li>" +
      "<li><b>ERISA section 404:</b> fiduciary duties of prudence, loyalty, diversification, and following plan documents.</li></ul>" +
      "<h2>How your data is handled</h2><p>Everything you enter is saved only in this browser using localStorage. There is no server, no account and no tracking. Clearing site data or pressing Reset sample data removes your changes. Documents record file names only; files are never uploaded.</p>" +
      '<p class="noprint"><button class="btn danger" data-act="reset">Reset sample data</button></p></div>';
  };

  /* ---------- render and routing ---------- */
  function render() {
    var v = (location.hash || "#dashboard").slice(1); if (!V[v]) v = "dashboard";
    document.querySelectorAll("#nav a").forEach(function (a) { a.classList.toggle("active", a.dataset.v === v); });
    $("#view").innerHTML = V[v]();
  }
  window.addEventListener("hashchange", function () { render(); window.scrollTo(0, 0); });

  document.addEventListener("click", function (e) {
    var th_ = e.target.closest("[data-sort]");
    if (th_) { var p = th_.dataset.sort.split(":"), s = UI.sort[p[0]]; if (s.k === p[1]) s.d = -s.d; else { s.k = p[1]; s.d = 1; } render(); return; }
    var el = e.target.closest("[data-act]"); if (!el) return;
    var a = el.dataset.act, t = el.dataset.type, id = el.dataset.id;
    if (a === "add") openForm(t);
    else if (a === "edit") openForm(t, id);
    else if (a === "del") delRecord(t, id);
    else if (a === "closemodal") closeModal();
    else if (a === "export") exportKey(el.dataset.key);
    else if (a === "print") window.print();
    else if (a === "goto") location.hash = el.dataset.v;
    else if (a === "complete") { S.obligations.forEach(function (o) { if (o.id === id) o.status = "Compliant"; }); save(); render(); toast(id + " marked complete"); }
    else if (a === "closeissue") { S.issues.forEach(function (o) { if (o.id === id) o.status = "Closed"; }); save(); render(); toast(id + " closed"); }
    else if (a === "reset") { if (confirm("Reset all data to the original example data? Your changes will be lost.")) { S = window.seedData(); save(); render(); toast("Sample data restored"); } }
  });
  $("#modal").addEventListener("mousedown", function (e) { if (e.target.id === "modal") closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !$("#modal").hidden) closeModal();
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("th[data-sort]")) { e.preventDefault(); e.target.click(); }
  });
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.dataset.map) { var p = t.dataset.map.split(":"), c = ctl(p[0]); var i = c.regs.indexOf(p[1]); if (t.checked && i < 0) c.regs.push(p[1]); if (!t.checked && i >= 0) c.regs.splice(i, 1); save(); render(); return; }
    if (t.dataset.evtdone) { S.events.forEach(function (x) { if (x.id === t.dataset.evtdone) x.done = t.checked; }); save(); render(); return; }
    if (t.dataset.evtdate) { if (!t.value) return; S.events.forEach(function (x) { if (x.id === t.dataset.evtdate) x.date = t.value; }); save(); render(); toast("Date updated"); return; }
    var map = { "f-reg": ["obl", "reg"], "f-status": ["obl", "status"], "f-owner": ["obl", "owner"], "d-status": ["doc", "status"], "d-type": ["doc", "type"], "i-sev": ["iss", "sev"], "i-status": ["iss", "status"] };
    if (map[t.id]) { UI.f[map[t.id][0]][map[t.id][1]] = t.value; render(); }
  });
  document.addEventListener("input", function (e) {
    var map = { "f-q": "obl", "d-q": "doc", "i-q": "iss" }, k = map[e.target.id];
    if (k) { UI.f[k].q = e.target.value; var pos = e.target.selectionStart; render(); var n = document.getElementById(e.target.id); n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} }
  });

  window.__fct = { state: function () { return S; } };
  render();
})();
