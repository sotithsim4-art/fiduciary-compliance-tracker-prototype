/* Synthetic EXAMPLE data only. Nothing here is real firm data. */
window.REGS = [
  { id: "ERISA", short: "ERISA 404", name: "ERISA Section 404 Fiduciary Duties" },
  { id: "SEC8K", short: "SEC 8-K 1.05", name: "SEC Form 8-K Item 1.05" },
  { id: "SEC10K", short: "SEC 10-K 1C", name: "SEC Form 10-K Item 1C" },
  { id: "REGSP", short: "Reg S-P", name: "SEC Regulation S-P" },
  { id: "REGSID", short: "Reg S-ID", name: "SEC Regulation S-ID" },
  { id: "NYDFS", short: "NYDFS 500", name: "NYDFS 23 NYCRR Part 500" },
  { id: "DORA", short: "DORA", name: "EU DORA (Reg. 2022/2554)" },
  { id: "NIST", short: "NIST CSF 2.0", name: "NIST Cybersecurity Framework 2.0" },
  { id: "CRI", short: "CRI Profile", name: "CRI Profile (CSF-based)" }
];

window.seedData = function () {
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const d = (n) => { const x = new Date(t); x.setDate(x.getDate() + n);
    return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };

  const controls = [
    ["C-GOV-01", "Cyber governance charter and policy framework", "Governance Office", ["SEC10K", "NIST", "CRI", "NYDFS"]],
    ["C-GOV-02", "Board and management cyber oversight reporting", "Governance Office", ["SEC10K", "NIST", "CRI", "NYDFS"]],
    ["C-IR-01", "Incident response plan and playbooks", "Security Operations", ["REGSP", "NYDFS", "DORA", "NIST", "CRI"]],
    ["C-IR-02", "Incident materiality assessment procedure", "Legal and Compliance", ["SEC8K", "SEC10K", "NIST", "CRI"]],
    ["C-IR-03", "Regulator and customer notification workflow", "Legal and Compliance", ["SEC8K", "REGSP", "NYDFS", "DORA"]],
    ["C-TPR-01", "Third-party risk assessment and oversight", "Vendor Risk", ["REGSP", "DORA", "NYDFS", "NIST", "CRI"]],
    ["C-TPR-02", "Service provider breach notice terms (72 hours)", "Vendor Risk", ["REGSP", "DORA"]],
    ["C-IAM-01", "Multi-factor authentication coverage", "Identity and Access", ["NYDFS", "NIST", "CRI"]],
    ["C-IAM-02", "Privileged access recertification", "Identity and Access", ["NYDFS", "NIST", "CRI", "REGSID"]],
    ["C-AST-01", "Asset inventory and classification", "IT Operations", ["NYDFS", "NIST", "CRI", "DORA"]],
    ["C-VUL-01", "Vulnerability management and penetration testing", "Security Engineering", ["NYDFS", "NIST", "CRI", "DORA"]],
    ["C-DAT-01", "Customer information inventory and safeguards", "Privacy Office", ["REGSP", "NYDFS", "NIST"]],
    ["C-IDT-01", "Identity theft red flags program", "Operations Risk", ["REGSID"]],
    ["C-RES-01", "Operational resilience and threat-led testing", "Resilience Team", ["DORA", "NIST", "CRI"]],
    ["C-TRN-01", "Security awareness training", "Security Operations", ["NYDFS", "NIST", "CRI", "REGSP"]],
    ["C-REC-01", "Backup and recovery testing", "IT Operations", ["NYDFS", "DORA", "NIST", "CRI"]],
    ["C-FID-01", "Investment prudence process documentation", "Fiduciary Oversight", ["ERISA"]],
    ["C-FID-02", "Conflict of interest and loyalty review", "Fiduciary Oversight", ["ERISA"]],
    ["C-FID-03", "Plan document conformance check", "Fiduciary Oversight", ["ERISA"]],
    ["C-FID-04", "Diversification review of plan investments", "Fiduciary Oversight", ["ERISA"]]
  ].map(c => ({ id: c[0], name: c[1], owner: c[2], regs: c[3] }));

  // [regId, requirement, owner, controlId, dueOffsetDays, status, verify]
  const O = [
    ["ERISA", "Act with prudence: document the process used to select and monitor plan investments (ERISA 404(a)(1)(B)).", "Fiduciary Oversight", "C-FID-01", 45, "Compliant", false],
    ["ERISA", "Act solely in the interest of participants and beneficiaries, for the exclusive purpose of providing benefits (ERISA 404(a)(1)(A)).", "Fiduciary Oversight", "C-FID-02", 20, "At Risk", false],
    ["ERISA", "Diversify plan investments to minimize the risk of large losses unless clearly prudent not to (ERISA 404(a)(1)(C)).", "Fiduciary Oversight", "C-FID-04", 60, "Not Started", false],
    ["ERISA", "Follow plan documents, to the extent consistent with ERISA (ERISA 404(a)(1)(D)).", "Fiduciary Oversight", "C-FID-03", -5, "Overdue", false],
    ["ERISA", "Obtain and review service provider fee and compensation disclosures (ERISA 408(b)(2)). Scope of application: verify with Compliance/Legal.", "Fiduciary Oversight", "C-FID-01", 75, "Not Started", true],
    ["SEC8K", "Determine the materiality of a cybersecurity incident without unreasonable delay after discovery.", "Legal and Compliance", "C-IR-02", 30, "Compliant", false],
    ["SEC8K", "File Form 8-K Item 1.05 within four business days after determining an incident is material. Delay exceptions: verify with Compliance/Legal.", "Legal and Compliance", "C-IR-03", 90, "Compliant", true],
    ["SEC10K", "Describe processes for assessing, identifying and managing material cybersecurity risks in the annual 10-K (Item 1C).", "Governance Office", "C-GOV-01", 50, "At Risk", false],
    ["SEC10K", "Describe board oversight of cyber risk and management's role in assessing and managing it (Item 1C).", "Governance Office", "C-GOV-02", 50, "Compliant", false],
    ["REGSP", "Maintain a written incident response program to detect, respond to and recover from unauthorized access to customer information. Compliance dates by firm size: verify with Compliance/Legal.", "Security Operations", "C-IR-01", 14, "Compliant", true],
    ["REGSP", "Notify affected individuals as soon as practicable, and no later than 30 days after becoming aware of unauthorized access to sensitive customer information.", "Legal and Compliance", "C-IR-03", 25, "At Risk", false],
    ["REGSP", "Oversee service providers and require them to notify the firm as soon as possible, and no later than 72 hours after becoming aware of a breach.", "Vendor Risk", "C-TPR-02", -12, "Overdue", false],
    ["REGSP", "Keep a customer information inventory and records of the safeguards program. Recordkeeping detail: verify with Compliance/Legal.", "Privacy Office", "C-DAT-01", 70, "Not Started", true],
    ["REGSID", "Maintain an identity theft red flags program with board or senior management approval, staff training and service provider oversight.", "Operations Risk", "C-IDT-01", 40, "Compliant", false],
    ["REGSID", "Periodically update the program and report to the board or senior management on its effectiveness. Reporting frequency: verify with Compliance/Legal.", "Operations Risk", "C-IDT-01", 100, "Not Started", true],
    ["NYDFS", "Submit the annual certification of compliance (or acknowledgment of noncompliance) to DFS by April 15. Applicability: verify with Compliance/Legal.", "Governance Office", "C-GOV-01", 85, "At Risk", true],
    ["NYDFS", "Notify DFS within 72 hours after determining that a cybersecurity event has occurred.", "Legal and Compliance", "C-IR-03", 30, "Compliant", false],
    ["NYDFS", "Require multi-factor authentication for all individuals accessing information systems.", "Identity and Access", "C-IAM-01", 10, "At Risk", false],
    ["NYDFS", "Maintain and update an asset inventory of information systems.", "IT Operations", "C-AST-01", 35, "Compliant", false],
    ["NYDFS", "Conduct annual penetration testing and automated vulnerability scans.", "Security Engineering", "C-VUL-01", -3, "Overdue", false],
    ["DORA", "Classify ICT incidents and report major ones: initial notification within 4 hours of classification (and no later than 24 hours from awareness), intermediate report within 72 hours, final report within one month. Applies only to in-scope EU entities: verify with Compliance/Legal.", "Security Operations", "C-IR-03", 22, "At Risk", true],
    ["DORA", "Maintain a register of information on all ICT third-party arrangements. Scope: verify with Compliance/Legal.", "Vendor Risk", "C-TPR-01", 55, "Not Started", true],
    ["DORA", "Perform digital operational resilience testing, including threat-led penetration testing for in-scope entities. Frequency: verify with Compliance/Legal.", "Resilience Team", "C-RES-01", 80, "Not Started", true],
    ["NIST", "Govern: establish cybersecurity risk management strategy, roles, responsibilities and policy (CSF 2.0 GV function).", "Governance Office", "C-GOV-01", 28, "Compliant", false],
    ["NIST", "Respond and Recover: execute and test incident response and recovery plans (CSF 2.0 RS and RC functions).", "IT Operations", "C-REC-01", 42, "At Risk", false],
    ["NIST", "Protect: provide awareness and training to personnel (CSF 2.0 PR.AT).", "Security Operations", "C-TRN-01", 18, "Compliant", false],
    ["CRI", "Map the control library to CRI Profile diagnostic statements and track coverage gaps. Mapping accuracy: verify with Compliance/Legal.", "Governance Office", "C-GOV-02", 65, "Not Started", true]
  ].map((o, i) => ({ id: "OB-" + String(i + 1).padStart(3, "0"), regId: o[0], requirement: o[1], owner: o[2], controlId: o[3], due: d(o[4]), status: o[5], verify: o[6], notes: "" }));

  // [name, type, controlId, dateOffset, reviewer, reviewStatus, fileName]
  const D = [
    ["Incident Response Plan v4.2", "Policy", "C-IR-01", -60, "A. Rivera", "Approved", "IRP_v4.2_EXAMPLE.pdf"],
    ["Cyber Governance Charter", "Policy", "C-GOV-01", -120, "J. Okafor", "Approved", "Governance_Charter_EXAMPLE.pdf"],
    ["Materiality Assessment Procedure", "Procedure", "C-IR-02", -90, "M. Chen", "Approved", "Materiality_Procedure_EXAMPLE.docx"],
    ["Tabletop Exercise Results Q3", "Test Result", "C-IR-01", -35, "A. Rivera", "In Review", "Tabletop_Q3_EXAMPLE.xlsx"],
    ["Notification Decision Tree", "Procedure", "C-IR-03", -48, "M. Chen", "Approved", "Notification_Tree_EXAMPLE.pdf"],
    ["Vendor Security Assessment, Example Vendor A", "Vendor Assessment", "C-TPR-01", -22, "S. Patel", "Approved", "VendorA_Assessment_EXAMPLE.pdf"],
    ["Service Provider Contract Clause Review", "Report", "C-TPR-02", -9, "S. Patel", "In Review", "Contract_Clause_Review_EXAMPLE.xlsx"],
    ["MFA Coverage Report", "Report", "C-IAM-01", -14, "D. Brooks", "Pending", "MFA_Coverage_EXAMPLE.csv"],
    ["Privileged Access Recertification", "Attestation", "C-IAM-02", -30, "D. Brooks", "Approved", "PAM_Recert_EXAMPLE.pdf"],
    ["Penetration Test Summary", "Test Result", "C-VUL-01", -75, "L. Novak", "Rejected", "PenTest_Summary_EXAMPLE.pdf"],
    ["Asset Inventory Extract", "Report", "C-AST-01", -18, "L. Novak", "Approved", "Asset_Inventory_EXAMPLE.csv"],
    ["Cyber Committee Minutes", "Meeting Minutes", "C-GOV-02", -40, "J. Okafor", "Approved", "Cyber_Committee_Minutes_EXAMPLE.pdf"],
    ["Investment Committee Minutes", "Meeting Minutes", "C-FID-01", -55, "R. Gomez", "Approved", "Invest_Committee_Minutes_EXAMPLE.pdf"],
    ["Annual Conflict of Interest Attestations", "Attestation", "C-FID-02", -70, "R. Gomez", "Pending", "COI_Attestations_EXAMPLE.xlsx"],
    ["Plan Document Conformance Checklist", "Procedure", "C-FID-03", -26, "R. Gomez", "In Review", "Plan_Conformance_EXAMPLE.docx"],
    ["Backup Restore Test Log", "Test Result", "C-REC-01", -33, "T. Alvarez", "Approved", "Restore_Test_Log_EXAMPLE.pdf"],
    ["Red Flags Program Annual Report", "Report", "C-IDT-01", -80, "K. Wright", "Approved", "RedFlags_Report_EXAMPLE.pdf"]
  ].map((x, i) => ({ id: "DOC-" + String(i + 1).padStart(3, "0"), name: x[0], type: x[1], controlId: x[2], date: d(x[3]), reviewer: x[4], reviewStatus: x[5], fileName: x[6] }));

  // [title, controlId, severity, foundOffset, remediationOffset, owner, status, notes]
  const I = [
    ["Penetration test scope omitted two internal applications", "C-VUL-01", "High", -40, 21, "Security Engineering", "Open", "Re-scope and retest."],
    ["Three vendor contracts lack the 72 hour breach notice clause", "C-TPR-02", "High", -30, 30, "Vendor Risk", "In Progress", "Amendments in negotiation."],
    ["MFA exception remains on a legacy admin console", "C-IAM-01", "Medium", -20, 14, "Identity and Access", "Open", "Compensating control documented."],
    ["Restore test not run for one tier 2 system", "C-REC-01", "Medium", -25, 45, "IT Operations", "In Progress", ""],
    ["Two privileged access approvals completed late", "C-IAM-02", "Low", -35, -5, "Identity and Access", "Open", "Past remediation date."],
    ["About 40 cloud assets missing from the inventory", "C-AST-01", "Medium", -15, 60, "IT Operations", "Open", ""],
    ["Customer notice template lacks sensitive data trigger language", "C-IR-03", "Critical", -6, 7, "Legal and Compliance", "Open", "Priority fix."],
    ["Late conflict of interest attestations from two reviewers", "C-FID-02", "Low", -50, -20, "Fiduciary Oversight", "Closed", "Reminders added to the calendar."]
  ].map((x, i) => ({ id: "ISS-" + String(i + 1).padStart(3, "0"), title: x[0], controlId: x[1], severity: x[2], found: d(x[3]), remediationDue: d(x[4]), owner: x[5], status: x[6], notes: x[7] }));

  // [title, regId, kind, dayOffset, owner, done, verify]
  const E = [
    ["Annual penetration test completion", "NYDFS", "Review", 3, "Security Engineering", false, false],
    ["Quarterly control owner attestation sign-off", "NIST", "Attestation", 9, "Governance Office", false, false],
    ["Reg S-P incident response program annual review", "REGSP", "Review", 14, "Security Operations", false, false],
    ["ERISA 404 investment committee fiduciary review", "ERISA", "Review", 20, "Fiduciary Oversight", false, false],
    ["Form 8-K Item 1.05 readiness drill (four business day clock)", "SEC8K", "Training/Test", 26, "Legal and Compliance", false, false],
    ["Service provider breach notice test (72 hour)", "REGSP", "Training/Test", 33, "Vendor Risk", false, false],
    ["10-K Item 1C cyber governance draft review", "SEC10K", "Review", 35, "Governance Office", false, false],
    ["Reg S-ID annual report to senior management", "REGSID", "Attestation", 48, "Operations Risk", false, true],
    ["DORA register of information update", "DORA", "Filing", 55, "Vendor Risk", false, true],
    ["NIST CSF 2.0 profile refresh", "NIST", "Review", 62, "Governance Office", false, false],
    ["Form 5500 extension check for plan year", "ERISA", "Filing", 72, "Fiduciary Oversight", false, true],
    ["NYDFS annual certification of compliance (April 15 deadline)", "NYDFS", "Filing", 85, "Governance Office", false, true],
    ["CRI Profile mapping review", "CRI", "Review", 90, "Governance Office", false, false],
    ["Annual fiduciary conflict of interest attestations", "ERISA", "Attestation", -4, "Fiduciary Oversight", false, false],
    ["Q3 tabletop exercise report to committee", "NIST", "Review", -30, "Security Operations", true, false]
  ].map((x, i) => ({ id: "EVT-" + String(i + 1).padStart(3, "0"), title: x[0], regId: x[1], kind: x[2], date: d(x[3]), owner: x[4], done: x[5], verify: x[6] }));

  return { obligations: O, controls, docs: D, issues: I, events: E };
};
