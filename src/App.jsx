import { useState, useRef } from "react";

const C = {
  indigo: "#1B1F3B", purple: "#6C3FA0", violet: "#8B5CF6",
  lavender: "#C4B5FD", orange: "#F97316", amber: "#F59E0B",
  cream: "#FAFAF5", white: "#FFF", dark: "#1B1F3B",
  med: "#4B5563", light: "#9CA3AF", teal: "#0D9488", green: "#10B981",
};

const auditTasks = [
  { task: "Sorting & filing invoices/receipts", category: "Finance", hrs: "4-6 hrs/week" },
  { task: "GST reconciliation & return prep", category: "Compliance", hrs: "4-6 hrs/month" },
  { task: "Drafting repetitive emails/follow-ups", category: "Communication", hrs: "5-8 hrs/week" },
  { task: "Organizing files across folders", category: "Admin", hrs: "2-3 hrs/week" },
  { task: "Creating reports from scattered data", category: "Reporting", hrs: "3-5 hrs/week" },
  { task: "Scheduling & calendar management", category: "Admin", hrs: "2-3 hrs/week" },
  { task: "Social media content creation", category: "Marketing", hrs: "3-5 hrs/week" },
  { task: "Employee onboarding paperwork", category: "HR", hrs: "5+ hrs/hire" },
  { task: "Meeting minutes & action items", category: "Admin", hrs: "2-3 hrs/week" },
  { task: "Vendor/customer data entry", category: "Operations", hrs: "3-4 hrs/week" },
  { task: "Inventory tracking updates", category: "Operations", hrs: "2-3 hrs/week" },
  { task: "Price comparison research", category: "Procurement", hrs: "3+ hrs/week" },
];

const promptLibrary = [
  {
    cat: "Finance & GST",
    prompts: [
      { title: "Invoice to Spreadsheet", prompt: "Read all PDF invoices in my 'Invoices' folder and create an Excel spreadsheet with vendor name, invoice number, date, amount, and GST details. Flag any duplicates.", saves: "4+ hrs/week" },
      { title: "GST Reconciliation", prompt: "Match my sales invoices against purchase records in the 'GST' folder. Create a reconciliation spreadsheet highlighting mismatches between GSTR-1 and GSTR-2B.", saves: "5+ hrs/month" },
      { title: "Expense Report", prompt: "Scan all receipt images in my 'Receipts' folder. Extract vendor, date, amount, and category. Create a formatted expense report in Excel sorted by category with totals.", saves: "3+ hrs/week" },
    ],
  },
  {
    cat: "File Management",
    prompts: [
      { title: "Downloads Cleanup", prompt: "Organize my Downloads folder: move PDFs to 'Documents', images to 'Images', spreadsheets to 'Finance'. Rename each file with a date prefix. Delete files older than 90 days.", saves: "2+ hrs/week" },
      { title: "Project File Organizer", prompt: "Scan all files in my 'Projects' folder. Create subfolders by client name. Move files into the right client folder based on filename and content. Create an index document.", saves: "3+ hrs/month" },
    ],
  },
  {
    cat: "Communication",
    prompts: [
      { title: "Daily Business Brief", prompt: "Every morning at 8 AM, scan my email inbox and Slack messages, then create a one-page brief with: urgent items, pending decisions, follow-ups needed, and today's meetings.", saves: "1 hr/day" },
      { title: "Client Follow-Up Batch", prompt: "Check my 'Proposals Sent' folder. For any proposal older than 5 days without a response file in 'Responses', draft a polite follow-up email for each client. Save as drafts.", saves: "2+ hrs/week" },
    ],
  },
  {
    cat: "Documents & Reports",
    prompts: [
      { title: "Client Proposal Generator", prompt: "Using project details in 'brief.docx', create a professional proposal in Word with executive summary, scope, timeline, pricing table, and terms. Use our company letterhead template.", saves: "3+ hrs/proposal" },
      { title: "Monthly Business Report", prompt: "Analyze Excel files in 'Monthly_Data' folder. Create a PowerPoint with: revenue trends, expense breakdown, top customers, cash flow chart, and 3 key insights.", saves: "6+ hrs/month" },
      { title: "Meeting Minutes", prompt: "Read the meeting transcript in 'meeting_notes.txt'. Create formatted minutes with: attendees, key discussion points, decisions made, action items with owners and deadlines.", saves: "1+ hr/meeting" },
    ],
  },
  {
    cat: "Marketing & Content",
    prompts: [
      { title: "Social Media Batch", prompt: "From my last 10 blog posts in 'Content' folder, create a spreadsheet with 30 social media posts: 10 for LinkedIn, 10 for X/Twitter, 10 for Instagram. Include hashtags and posting schedule.", saves: "4+ hrs/week" },
      { title: "Competitor Price Monitor", prompt: "Browse these 5 competitor websites, extract pricing for [product category], create a comparison spreadsheet with our prices side-by-side. Highlight where we are more expensive.", saves: "3+ hrs/week" },
    ],
  },
  {
    cat: "HR & Operations",
    prompts: [
      { title: "Onboarding Pack", prompt: "Create an employee onboarding pack: offer letter, NDA, company policy summary, IT setup checklist, and first-week schedule. Use details from 'new_hire.csv'.", saves: "5+ hrs/hire" },
      { title: "Attendance Report", prompt: "Read the attendance CSV files in 'HR' folder for this month. Create a summary report showing: days present, absent, late arrivals, overtime hours for each employee.", saves: "3+ hrs/month" },
    ],
  },
];

const processSteps = [
  { num: "1", title: "Open Cowork", desc: "Launch Claude Desktop app. Click the 'Cowork' tab next to Chat. Select the folder you want Claude to access.", color: C.purple },
  { num: "2", title: "Describe Task", desc: "Type what you need in plain language. Focus on the outcome, not the steps. Example: 'Create an expense report from my receipts.'", color: C.violet },
  { num: "3", title: "Review Plan", desc: "Claude shows a step-by-step plan before acting. You can approve, modify, or cancel. Always take 30 seconds to review.", color: C.orange },
  { num: "4", title: "Execute", desc: "Claude works in a sandboxed VM. It can coordinate multiple sub-agents for complex tasks. Watch progress in real-time.", color: C.amber },
  { num: "5", title: "Get Output", desc: "Finished files appear in your folder. Documents, spreadsheets, organized files — ready to use. Review and refine if needed.", color: C.teal },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [checkedTasks, setCheckedTasks] = useState({});
  const [expandedCat, setExpandedCat] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(null);
  const [roiHrs, setRoiHrs] = useState(15);
  const [roiRate, setRoiRate] = useState(500);
  const [pollVote, setPollVote] = useState(null);
  const [pollResults, setPollResults] = useState({ invoices: 28, emails: 22, files: 18, reports: 20, gst: 12 });
  const [actionPlan, setActionPlan] = useState({ task: "", prompt: "", timeline: "", result: "" });
  const topRef = useRef(null);

  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "audit", label: "Task Audit", icon: "📋" },
    { id: "flow", label: "How It Works", icon: "⚡" },
    { id: "prompts", label: "Prompts", icon: "🤖" },
    { id: "roi", label: "ROI Calc", icon: "💰" },
    { id: "poll", label: "Live Poll", icon: "📊" },
    { id: "action", label: "Action Plan", icon: "🚀" },
  ];

  const toggleTask = (i) => setCheckedTasks(p => ({ ...p, [i]: !p[i] }));
  const checkedCount = Object.values(checkedTasks).filter(Boolean).length;

  const copyPrompt = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopiedPrompt(idx);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const handlePoll = (opt) => {
    if (pollVote) return;
    setPollVote(opt);
    setPollResults(p => ({ ...p, [opt]: p[opt] + 1 }));
  };

  const monthlySaving = roiHrs * 4 * roiRate;
  const yearlySaving = monthlySaving * 12;
  const coworkCost = 1700 * 12;
  const netROI = yearlySaving - coworkCost;

  return (
    <div ref={topRef} style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: C.cream, minHeight: "100vh", maxWidth: 480, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`, padding: "20px 20px 16px", color: "white" }}>
        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7, marginBottom: 4 }}>Workshop Companion</div>
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>Automating Low<br/>Value Tasks</div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>Prof. Sanjay Fuloria | IFHE, Hyderabad</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", overflowX: "auto", background: "white", borderBottom: `2px solid ${C.purple}`, padding: "0 2px", gap: 1 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); topRef.current?.scrollIntoView({ behavior: "smooth" }); }}
            style={{
              flex: "0 0 auto", padding: "8px 10px", border: "none", cursor: "pointer",
              background: tab === t.id ? C.purple : "transparent",
              color: tab === t.id ? "white" : C.med,
              fontSize: 10, fontWeight: 600, borderRadius: "6px 6px 0 0",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
            <span style={{ fontSize: 14 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 16px 80px" }}>

        {/* HOME */}
        {tab === "home" && (
          <div>
            <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.dark, marginBottom: 8 }}>Welcome! ⚡</div>
              <p style={{ color: C.med, lineHeight: 1.6, fontSize: 14, margin: 0 }}>
                This toolkit helps you identify which low-value tasks are eating your time, shows you how Claude Cowork automates them, and gives you copy-paste prompts to start immediately.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { icon: "📋", title: "Task Audit", desc: "Find your biggest time wasters", t: "audit" },
                { icon: "⚡", title: "How It Works", desc: "Cowork 5-step process flow", t: "flow" },
                { icon: "🤖", title: "Prompt Library", desc: "15+ copy-paste prompts", t: "prompts" },
                { icon: "💰", title: "ROI Calculator", desc: "Calculate your savings", t: "roi" },
              ].map(c => (
                <button key={c.t} onClick={() => setTab(c.t)}
                  style={{ background: "white", borderRadius: 10, padding: 16, border: "none", cursor: "pointer", textAlign: "left", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: C.light }}>{c.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ background: `linear-gradient(135deg, ${C.purple}, ${C.violet})`, borderRadius: 12, padding: 20, marginTop: 16, color: "white" }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>💡 The Core Idea</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, opacity: 0.95 }}>
                MSME owners lose 15-25 hours every week on tasks AI can handle. Claude Cowork is not a chatbot — it is a desktop agent that reads your files, executes multi-step tasks, and delivers finished work. Today you will learn how to use it.
              </p>
            </div>
          </div>
        )}

        {/* TASK AUDIT */}
        {tab === "audit" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.dark }}>Low-Value Task Audit</div>
                <div style={{ fontSize: 13, color: C.light }}>Check the tasks that eat your time</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: checkedCount > 6 ? "#EF4444" : C.purple }}>{checkedCount}</div>
                <div style={{ fontSize: 10, color: C.light }}>Tasks identified</div>
              </div>
            </div>
            {auditTasks.map((t, i) => (
              <label key={i} style={{
                display: "flex", alignItems: "center", padding: "12px 16px", marginBottom: 8,
                background: checkedTasks[i] ? "#FFF7ED" : "white", borderRadius: 10,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)", cursor: "pointer",
                borderLeft: `4px solid ${checkedTasks[i] ? C.orange : "#E5E7EB"}`,
              }}>
                <input type="checkbox" checked={!!checkedTasks[i]} onChange={() => toggleTask(i)}
                  style={{ marginRight: 12, width: 18, height: 18, accentColor: C.orange }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{t.task}</div>
                  <div style={{ fontSize: 11, color: C.light }}>{t.category}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.orange }}>{t.hrs}</div>
              </label>
            ))}
            {checkedCount > 0 && (
              <div style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.amber})`, borderRadius: 10, padding: 16, marginTop: 12, color: "white" }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>You identified {checkedCount} automatable tasks!</div>
                <div style={{ fontSize: 12 }}>Head to the Prompts tab to find ready-to-use Cowork prompts for each one.</div>
              </div>
            )}
          </div>
        )}

        {/* PROCESS FLOW */}
        {tab === "flow" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.dark, marginBottom: 4 }}>Claude Cowork: How It Works</div>
            <div style={{ fontSize: 13, color: C.light, marginBottom: 16 }}>5-step process from task to finished output</div>
            {processSteps.map((st, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: "0 0 auto" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%", background: st.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 800, fontSize: 18,
                  }}>{st.num}</div>
                  {i < 4 && <div style={{ width: 2, height: 24, background: "#E5E7EB", margin: "4px auto 0" }} />}
                </div>
                <div style={{ background: "white", borderRadius: 10, padding: 14, flex: 1, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: st.color, marginBottom: 4 }}>{st.title}</div>
                  <div style={{ fontSize: 13, color: C.med, lineHeight: 1.5 }}>{st.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ background: C.indigo, borderRadius: 10, padding: 16, color: "white" }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>🔒 Safety Features</div>
              <div style={{ fontSize: 12, lineHeight: 1.6, opacity: 0.9 }}>
                Files run in a sandboxed VM. Claude can only access folders you explicitly grant. Deletion requires your permission. Your files stay on your computer, not uploaded to cloud.
              </div>
            </div>
          </div>
        )}

        {/* PROMPTS */}
        {tab === "prompts" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.dark, marginBottom: 4 }}>Cowork Prompt Library</div>
            <div style={{ fontSize: 13, color: C.light, marginBottom: 16 }}>Tap any category, then copy prompts directly</div>
            {promptLibrary.map((cat, ci) => (
              <div key={ci} style={{ marginBottom: 12 }}>
                <button onClick={() => setExpandedCat(expandedCat === ci ? null : ci)}
                  style={{
                    width: "100%", padding: "14px 16px", border: "none", cursor: "pointer", borderRadius: 10,
                    background: expandedCat === ci ? C.purple : "white",
                    color: expandedCat === ci ? "white" : C.dark,
                    fontSize: 14, fontWeight: 700, textAlign: "left",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                  {cat.cat}
                  <span style={{ fontSize: 12, opacity: 0.7 }}>{cat.prompts.length} prompts {expandedCat === ci ? "▲" : "▼"}</span>
                </button>
                {expandedCat === ci && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                    {cat.prompts.map((p, pi) => {
                      const key = `${ci}-${pi}`;
                      return (
                        <div key={pi} style={{ background: "white", borderRadius: 10, padding: 14, borderLeft: `4px solid ${C.purple}`, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>{p.title}</div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: C.teal, background: "#F0FDF4", padding: "2px 8px", borderRadius: 12 }}>{p.saves}</div>
                          </div>
                          <div style={{ fontSize: 12, color: C.med, lineHeight: 1.5, marginBottom: 10, fontStyle: "italic" }}>"{p.prompt}"</div>
                          <button onClick={() => copyPrompt(p.prompt, key)}
                            style={{
                              padding: "8px 16px", border: "none", borderRadius: 6, cursor: "pointer",
                              background: copiedPrompt === key ? C.teal : C.purple,
                              color: "white", fontSize: 12, fontWeight: 600,
                            }}>
                            {copiedPrompt === key ? "✓ Copied!" : "📋 Copy Prompt"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ROI CALCULATOR */}
        {tab === "roi" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.dark, marginBottom: 4 }}>Automation ROI Calculator</div>
            <div style={{ fontSize: 13, color: C.light, marginBottom: 16 }}>See how much you save with Claude Cowork</div>
            <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 8 }}>Hours spent on low-value tasks per week: <span style={{ color: C.orange, fontSize: 18 }}>{roiHrs}</span></div>
                <input type="range" min="5" max="40" value={roiHrs} onChange={e => setRoiHrs(Number(e.target.value))}
                  style={{ width: "100%", accentColor: C.purple }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.light }}><span>5 hrs</span><span>40 hrs</span></div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.dark, marginBottom: 8 }}>Your hourly value (Rs.): <span style={{ color: C.orange, fontSize: 18 }}>{roiRate}</span></div>
                <input type="range" min="200" max="2000" step="100" value={roiRate} onChange={e => setRoiRate(Number(e.target.value))}
                  style={{ width: "100%", accentColor: C.purple }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.light }}><span>Rs. 200</span><span>Rs. 2,000</span></div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
              <div style={{ background: "white", borderRadius: 10, padding: 16, textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 10, color: C.light, marginBottom: 4 }}>MONTHLY SAVINGS</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.teal }}>Rs. {monthlySaving.toLocaleString()}</div>
              </div>
              <div style={{ background: "white", borderRadius: 10, padding: 16, textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 10, color: C.light, marginBottom: 4 }}>YEARLY SAVINGS</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.teal }}>Rs. {yearlySaving.toLocaleString()}</div>
              </div>
              <div style={{ background: "white", borderRadius: 10, padding: 16, textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 10, color: C.light, marginBottom: 4 }}>COWORK COST/YEAR</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.orange }}>Rs. {coworkCost.toLocaleString()}</div>
              </div>
              <div style={{ background: `linear-gradient(135deg, ${C.purple}, ${C.violet})`, borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: C.lavender, marginBottom: 4 }}>NET ROI / YEAR</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "white" }}>Rs. {netROI.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ background: C.indigo, borderRadius: 10, padding: 14, marginTop: 12, textAlign: "center" }}>
              <span style={{ color: C.amber, fontWeight: 700, fontSize: 14 }}>
                {Math.round(yearlySaving / coworkCost)}x return on your Cowork subscription
              </span>
            </div>
          </div>
        )}

        {/* POLL */}
        {tab === "poll" && (
          <div>
            <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.dark, marginBottom: 4 }}>Live Audience Poll</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.dark, marginBottom: 16, lineHeight: 1.4 }}>
                Which low-value task wastes the most of your time?
              </div>
              {[
                { id: "invoices", label: "Sorting invoices & receipts", emoji: "🧾" },
                { id: "emails", label: "Drafting repetitive emails", emoji: "📧" },
                { id: "files", label: "Organizing files & folders", emoji: "📁" },
                { id: "reports", label: "Creating reports & presentations", emoji: "📊" },
                { id: "gst", label: "GST filing & reconciliation", emoji: "📋" },
              ].map(opt => {
                const total = Object.values(pollResults).reduce((a, b) => a + b, 0);
                const pct = Math.round((pollResults[opt.id] / total) * 100);
                return (
                  <button key={opt.id} onClick={() => handlePoll(opt.id)}
                    style={{
                      width: "100%", padding: "14px 16px", border: `2px solid ${pollVote === opt.id ? C.purple : "#E5E7EB"}`,
                      borderRadius: 10, cursor: pollVote ? "default" : "pointer", marginBottom: 10,
                      background: pollVote === opt.id ? "#F3F0FF" : "white", textAlign: "left",
                      position: "relative", overflow: "hidden",
                    }}>
                    {pollVote && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: pollVote === opt.id ? `${C.purple}20` : "#F5F5F5", transition: "width 0.5s" }} />}
                    <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: C.dark }}>{opt.emoji} {opt.label}</span>
                      {pollVote && <span style={{ fontSize: 14, fontWeight: 700, color: C.purple }}>{pct}%</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ACTION PLAN */}
        {tab === "action" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.dark, marginBottom: 4 }}>Your Automation Action Plan</div>
            <div style={{ fontSize: 13, color: C.light, marginBottom: 16 }}>Fill this out before you leave today</div>
            {[
              { key: "task", label: "My #1 Time-Wasting Task", placeholder: "e.g., I spend 5 hours every week sorting invoices into spreadsheets", icon: "🎯" },
              { key: "prompt", label: "My First Cowork Prompt", placeholder: "e.g., Read all PDFs in my Invoices folder and create an Excel with vendor, date, amount, GST", icon: "🤖" },
              { key: "timeline", label: "When I'll Try It", placeholder: "e.g., This Saturday morning, I'll install Claude Desktop and run my first task", icon: "📅" },
              { key: "result", label: "Expected Outcome", placeholder: "e.g., Save 4+ hours per week, zero invoice sorting by hand", icon: "🏆" },
            ].map(f => (
              <div key={f.key} style={{ background: "white", borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8 }}>{f.icon} {f.label}</div>
                <textarea value={actionPlan[f.key]} onChange={e => setActionPlan(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} rows={2}
                  style={{ width: "100%", padding: 12, border: "2px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: C.dark, resize: "none", fontFamily: "inherit", boxSizing: "border-box", outline: "none" }}
                  onFocus={e => e.target.style.borderColor = C.purple}
                  onBlur={e => e.target.style.borderColor = "#E5E7EB"} />
              </div>
            ))}
            <div style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`, borderRadius: 12, padding: 20, color: "white" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>💡 Remember</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
                Stop doing the work AI can do. Start doing the work only you can do. One task, one prompt, one automation — that is all it takes to begin.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
