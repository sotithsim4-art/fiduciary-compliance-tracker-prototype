# Fiduciary Compliance Tracker (Prototype)

**Prototype with example data, not an official tool. Not legal advice.**

A small, self-contained web app that shows what a regulatory support or compliance team might track: obligations, control mappings, reporting deadlines, evidence, and issues from control testing. It is a demo of a vibe-coded internal tool. It is not a product of any asset manager, it uses no real firm data, and every record is synthetic example data.

## Run it

No build step and no dependencies.

```bash
cd fiduciary-compliance-app
python3 -m http.server 8000
# then open http://localhost:8000
```

You can also open `index.html` directly in a browser.

## Features

- **Dashboard:** counts by status (Compliant, At Risk, Overdue, Not Started), deadlines due in the next 30, 60 and 90 days, past-due items, and inline SVG charts.
- **Obligations register:** sortable, filterable and searchable table. Add, edit, delete and one-click "Mark complete". Evidence count comes from documents linked to the control.
- **Control map:** a matrix where one control maps to many regulations. Tick boxes to change the mapping. Gaps are highlighted.
- **Reporting calendar:** filings, attestations and reviews grouped by month, flagged by days remaining. Edit the date inline, tick items done, add, edit or delete.
- **Evidence register:** document entries (name, type, linked control, date, reviewer, review status). File name only; nothing is uploaded.
- **Issues log:** findings from control testing with severity, remediation due date and status.
- **Exports and report:** CSV export for every dataset, and a printable summary report (use the browser print dialog to save as PDF).
- **Reset sample data** button restores the seed data. Everything else is saved in the browser's localStorage under the key `fct.prototype.v1`.

## Seed data

27 obligations, 20 controls, 17 documents, 8 issues and 15 calendar items, all synthetic. Dates are generated relative to today so the dashboard always has upcoming and overdue examples. Items whose applicability or interpretation is uncertain carry a "verify with Compliance/Legal" badge.

Regulatory facts used in the examples (simplified, check primary sources):

- SEC Form 8-K Item 1.05: disclose a material cyber incident within four business days after determining materiality.
- SEC Form 10-K Item 1C: annual cyber risk management and governance disclosure.
- SEC Regulation S-P amendments: incident response program, service provider notice within 72 hours, customer notice within 30 days.
- DORA: applies since January 17, 2025. Major incident reports: initial within 4 hours of classification (and within 24 hours of awareness), intermediate within 72 hours, final within one month.
- NYDFS 23 NYCRR Part 500: 72 hour notice of cybersecurity events, annual certification by April 15.
- ERISA section 404: prudence, loyalty, diversification, and following plan documents.

## Files

- `index.html`: page shell
- `styles.css`: styling and print rules
- `data.js`: regulation list and the seed data generator
- `app.js`: all app logic (views, forms, storage, charts, CSV)

## Extend it

- Add a regulation: append to `window.REGS` in `data.js`; it appears in filters, the matrix and exports automatically.
- Add a field: add it to the entity's `fields()` list in `ENT` (in `app.js`) and to the table renderer.
- Swap storage: `load()` and `save()` in `app.js` are the only persistence points, so a real API can replace localStorage.

## Ideas for next steps

- An AI summarizer that turns new regulation text or rule releases into plain-language obligation drafts for human review.
- Auto-suggest control mappings from requirement text.
- Email or calendar reminders for upcoming deadlines.
- Role-based access, audit trail of changes, and approval workflow.
- Import obligations and controls from CSV or a GRC system export.

## Limits

Single-user and browser-local. No authentication, no server, no audit trail. Not for real compliance decisions.
