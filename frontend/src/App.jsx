import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  PlusCircle, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Power, 
  FileText, 
  Layers, 
  Search, 
  Filter, 
  BarChart3, 
  Download, 
  RefreshCw, 
  Info, 
  Check, 
  Eye, 
  Sliders,
  DollarSign,
  Briefcase,
  User,
  Tag,
  Calendar,
  Terminal,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

const BACKEND_URL = 'http://127.0.0.1:8000';

const INITIAL_CLAIMS = [
  {
    id: "CLM-8001",
    employeeName: "Sarah Jenkins",
    department: "Sales",
    category: "Travel",
    amount: 420.00,
    currency: "USD",
    submissionDate: "2026-08-20",
    hasReceipt: true,
    vendor: "Delta Air Lines",
    description: "Flight ticket for Midwest client visit",
    riskScore: "LOW"
  },
  {
    id: "CLM-8002",
    employeeName: "David Chen",
    department: "Engineering",
    category: "Software",
    amount: 1250.00,
    currency: "USD",
    submissionDate: "2026-08-19",
    hasReceipt: true,
    vendor: "AWS Web Services",
    description: "Monthly Cloud infrastructure staging server subscription",
    riskScore: "LOW"
  },
  {
    id: "CLM-8003",
    employeeName: "Michael Scott",
    department: "Executive",
    category: "Client Entertainment",
    amount: 2850.00,
    currency: "USD",
    submissionDate: "2026-08-18",
    hasReceipt: false,
    vendor: "Morton's Steakhouse",
    description: "VIP Executive quarterly dinner with prospective investors",
    riskScore: "HIGH"
  },
  {
    id: "CLM-8004",
    employeeName: "Elena Rostova",
    department: "Marketing",
    category: "Meals",
    amount: 185.50,
    currency: "USD",
    submissionDate: "2026-08-20",
    hasReceipt: false,
    vendor: "Bistro Deluxe",
    description: "Team lunch strategy meeting for product launch",
    riskScore: "MEDIUM"
  },
  {
    id: "CLM-8005",
    employeeName: "James Wilson",
    department: "Sales",
    category: "Travel",
    amount: 950.00,
    currency: "USD",
    submissionDate: "2026-08-17",
    hasReceipt: true,
    vendor: "Marriott Hotels",
    description: "3-night stay for annual TechCon Expo",
    riskScore: "MEDIUM"
  },
  {
    id: "CLM-8006",
    employeeName: "Anita Patel",
    department: "HR",
    category: "Office Supplies",
    amount: 75.00,
    currency: "USD",
    submissionDate: "2026-08-21",
    hasReceipt: true,
    vendor: "Staples",
    description: "New hire welcome kits and stationary",
    riskScore: "LOW"
  },
  {
    id: "CLM-8007",
    employeeName: "Marcus Brody",
    department: "Executive",
    category: "Travel",
    amount: 4500.00,
    currency: "USD",
    submissionDate: "2026-08-15",
    hasReceipt: true,
    vendor: "Emirates Airlines",
    description: "First class flight for international partner summit",
    riskScore: "HIGH"
  },
  {
    id: "CLM-8008",
    employeeName: "Priya Sharma",
    department: "Engineering",
    category: "Software",
    amount: 49.00,
    currency: "USD",
    submissionDate: "2026-08-21",
    hasReceipt: true,
    vendor: "GitHub Inc.",
    description: "Copilot Enterprise developer license monthly",
    riskScore: "LOW"
  }
];

const INITIAL_RULES = [
  {
    id: "RULE-101",
    name: "Missing Receipt Policy for High Expenses",
    description: "Reject any claim over $100 that does not have an attached receipt",
    priority: 1,
    enabled: true,
    conditions: [
      { field: "amount", operator: ">", value: 100 },
      { field: "hasReceipt", operator: "==", value: false }
    ],
    logicalOperator: "AND",
    action: "REJECT",
    rationale: "Financial compliance requires digital receipt verification for expenses exceeding $100."
  },
  {
    id: "RULE-102",
    name: "Executive High-Value Board Escalation",
    description: "Escalate all claims over $2,000 for executive review",
    priority: 2,
    enabled: true,
    conditions: [
      { field: "amount", operator: ">=", value: 2000 }
    ],
    logicalOperator: "AND",
    action: "ESCALATE",
    rationale: "High-value corporate disbursements exceeding $2,000 require CFO / Board level escalation."
  },
  {
    id: "RULE-103",
    name: "Standard Sales Travel Fast-Track Approval",
    description: "Auto-approve Sales travel expenses under $500 with receipt",
    priority: 3,
    enabled: true,
    conditions: [
      { field: "department", operator: "==", value: "Sales" },
      { field: "category", operator: "==", value: "Travel" },
      { field: "amount", operator: "<=", value: 500 },
      { field: "hasReceipt", operator: "==", value: true }
    ],
    logicalOperator: "AND",
    action: "APPROVE",
    rationale: "Routine field sales travel expenses within $500 budget cap with receipt are pre-approved."
  },
  {
    id: "RULE-104",
    name: "Developer Software & Cloud Infrastructure Fast-Track",
    description: "Auto-approve Engineering software and SaaS under $1,500 with receipt",
    priority: 4,
    enabled: true,
    conditions: [
      { field: "department", operator: "==", value: "Engineering" },
      { field: "category", operator: "==", value: "Software" },
      { field: "amount", operator: "<=", value: 1500 },
      { field: "hasReceipt", operator: "==", value: true }
    ],
    logicalOperator: "AND",
    action: "APPROVE",
    rationale: "Approved dev tool subscriptions under $1,500 are pre-authorized for engineering velocity."
  },
  {
    id: "RULE-105",
    name: "Unverified Client Entertainment Cap",
    description: "Reject client entertainment expenses exceeding $300 without manager note",
    priority: 5,
    enabled: true,
    conditions: [
      { field: "category", operator: "==", value: "Client Entertainment" },
      { field: "amount", operator: ">", value: 300 }
    ],
    logicalOperator: "AND",
    action: "REJECT",
    rationale: "Client entertainment over $300 violates standard baseline policy without prior manager authorization."
  }
];

// Helper functions for client-side deterministic evaluation fallback
function evaluateCondition(cond, claim) {
  const actual = claim[cond.field];
  if (actual === undefined || actual === null) return { passed: false, detail: `Field '${cond.field}' missing` };
  
  let passed = false;
  const target = cond.value;

  if (cond.operator === "==") passed = String(actual).toLowerCase() === String(target).toLowerCase();
  else if (cond.operator === "!=") passed = String(actual).toLowerCase() !== String(target).toLowerCase();
  else if (cond.operator === ">") passed = Number(actual) > Number(target);
  else if (cond.operator === ">=") passed = Number(actual) >= Number(target);
  else if (cond.operator === "<") passed = Number(actual) < Number(target);
  else if (cond.operator === "<=") passed = Number(actual) <= Number(target);

  return {
    passed,
    detail: `${cond.field} (${actual}) ${cond.operator} ${target} => ${passed ? 'PASS' : 'FAIL'}`
  };
}

function evaluateClaimLocal(claim, rules) {
  const activeRules = [...rules].filter(r => r.enabled).sort((a, b) => a.priority - b.priority);
  const auditTrail = [];
  const matchingRules = [];
  let decisionStatus = "PENDING";
  let decisionRule = null;
  const warnings = [];

  if (!claim.hasReceipt && claim.amount > 200) {
    warnings.push("Missing receipt for expense over $200");
  }

  for (const rule of activeRules) {
    const condResults = [];
    let allPass = rule.logicalOperator === "AND";

    for (const cond of rule.conditions) {
      const res = evaluateCondition(cond, claim);
      condResults.push({ condition: cond, passed: res.passed, detail: res.detail });
      if (rule.logicalOperator === "AND" && !res.passed) allPass = false;
      else if (rule.logicalOperator === "OR" && res.passed) allPass = true;
    }

    auditTrail.push({
      ruleId: rule.id,
      ruleName: rule.name,
      priority: rule.priority,
      action: rule.action,
      passed: allPass,
      conditionTrace: condResults
    });

    if (allPass) {
      matchingRules.push(rule);
      if (decisionStatus === "PENDING") {
        decisionStatus = rule.action;
        decisionRule = rule;
      }
    }
  }

  const actions = new Set(matchingRules.map(r => r.action));
  if (actions.size > 1) {
    warnings.push(`Rule Conflict: Multiple rules matched with opposing actions (${[...actions].join(', ')}). Enforcing highest priority rule '${decisionRule?.name}'.`);
  }

  if (decisionStatus === "PENDING") {
    decisionStatus = "ESCALATE";
  }

  return {
    claimId: claim.id,
    status: decisionStatus,
    matchedRuleId: decisionRule?.id || null,
    matchedRuleName: decisionRule?.name || "Default Escalation Fallback",
    rationale: decisionRule?.rationale || "No matching explicit policy rule found; flagged for manual review.",
    matchingRulesCount: matchingRules.length,
    warnings,
    auditTrail
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'claims' | 'analytics' | 'config'
  const [rules, setRules] = useState(INITIAL_RULES);
  const [claims, setClaims] = useState(INITIAL_CLAIMS);
  const [evaluatedClaims, setEvaluatedClaims] = useState([]);
  const [backendConnected, setBackendConnected] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [parsingPrompt, setParsingPrompt] = useState(false);
  const [parsedAST, setParsedAST] = useState(null);
  const [selectedAuditClaim, setSelectedAuditClaim] = useState(null);
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false);

  // Filters for claims matrix
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Form state for new claim modal
  const [newClaimForm, setNewClaimForm] = useState({
    employeeName: '',
    department: 'Sales',
    category: 'Travel',
    amount: '',
    hasReceipt: true,
    vendor: '',
    description: ''
  });

  // Test connection to FastAPI backend on load
  useEffect(() => {
    checkBackendConnection();
  }, []);

  // Whenever rules or claims change, trigger evaluation
  useEffect(() => {
    runBatchEvaluation();
  }, [rules, claims, backendConnected]);

  const checkBackendConnection = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'online') {
          setBackendConnected(true);
          fetchBackendRules();
          fetchBackendClaims();
          return;
        }
      }
    } catch (err) {
      console.log('Backend not reachable, operating in browser local rule engine mode.');
    }
    setBackendConnected(false);
  };

  const fetchBackendRules = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/rules`);
      if (res.ok) {
        const data = await res.json();
        if (data.rules) setRules(data.rules);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBackendClaims = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/claims`);
      if (res.ok) {
        const data = await res.json();
        if (data.claims) setEvaluatedClaims(data.claims);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const runBatchEvaluation = () => {
    if (backendConnected) {
      fetchBackendClaims();
    } else {
      const results = claims.map(claim => {
        const evaluation = evaluateClaimLocal(claim, rules);
        return {
          ...claim,
          status: evaluation.status,
          evaluation
        };
      });
      setEvaluatedClaims(results);
    }
  };

  const handleParsePrompt = async (e) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setParsingPrompt(true);

    if (backendConnected) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/parse-rule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptInput })
        });
        if (res.ok) {
          const data = await res.json();
          setParsedAST(data.ast);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Local parsing heuristic
      const pLower = promptInput.toLowerCase();
      let action = "APPROVE";
      if (pLower.includes("reject") || pLower.includes("deny")) action = "REJECT";
      else if (pLower.includes("escalate") || pLower.includes("flag")) action = "ESCALATE";

      const conds = [];
      const depts = ["Sales", "Engineering", "Marketing", "Executive", "HR"];
      for (const d of depts) {
        if (pLower.includes(d.toLowerCase())) conds.push({ field: "department", operator: "==", value: d });
      }

      const cats = ["Travel", "Meals", "Software", "Client Entertainment", "Office Supplies"];
      for (const c of cats) {
        if (pLower.includes(c.toLowerCase())) conds.push({ field: "category", operator: "==", value: c });
      }

      const amtMatch = promptInput.match(/(\$|₹)?\s*(\d+(?:\.\d+)?)/);
      if (amtMatch) {
        const val = parseFloat(amtMatch[2]);
        let op = "<=";
        if (pLower.includes("over") || pLower.includes("exceed") || pLower.includes(">")) op = ">";
        conds.push({ field: "amount", operator: op, value: val });
      }

      if (pLower.includes("without receipt") || pLower.includes("no receipt")) {
        conds.push({ field: "hasReceipt", operator: "==", value: false });
      } else if (pLower.includes("with receipt") || pLower.includes("has receipt")) {
        conds.push({ field: "hasReceipt", operator: "==", value: true });
      }

      if (conds.length === 0) conds.push({ field: "amount", operator: "<=", value: 500 });

      const ast = {
        id: `RULE-${101 + rules.length}`,
        name: `Natural Language Rule (${action})`,
        description: promptInput,
        priority: rules.length + 1,
        enabled: true,
        conditions: conds,
        logicalOperator: "AND",
        action: action,
        rationale: `Generated from policy statement: "${promptInput}"`
      };
      setParsedAST(ast);
    }
    setParsingPrompt(false);
  };

  const handleAddParsedRule = async () => {
    if (!parsedAST) return;

    if (backendConnected) {
      try {
        await fetch(`${BACKEND_URL}/api/rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsedAST)
        });
        fetchBackendRules();
      } catch (err) {
        console.error(err);
      }
    } else {
      setRules([...rules, parsedAST]);
    }

    setPromptInput('');
    setParsedAST(null);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const handleToggleRule = async (ruleId) => {
    if (backendConnected) {
      try {
        await fetch(`${BACKEND_URL}/api/rules/${ruleId}/toggle`, { method: 'PUT' });
        fetchBackendRules();
      } catch (e) {
        console.error(e);
      }
    } else {
      setRules(rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
    }
  };

  const handleMoveRule = (index, direction) => {
    const newRules = [...rules];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newRules.length) return;

    const temp = newRules[index];
    newRules[index] = newRules[targetIdx];
    newRules[targetIdx] = temp;

    // re-assign priorities
    newRules.forEach((r, idx) => { r.priority = idx + 1; });

    if (backendConnected) {
      fetch(`${BACKEND_URL}/api/rules/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRules)
      }).then(() => fetchBackendRules());
    } else {
      setRules(newRules);
    }
  };

  const handleDeleteRule = (ruleId) => {
    if (backendConnected) {
      fetch(`${BACKEND_URL}/api/rules/${ruleId}`, { method: 'DELETE' }).then(() => fetchBackendRules());
    } else {
      setRules(rules.filter(r => r.id !== ruleId));
    }
  };

  const handleCreateNewClaim = async (e) => {
    e.preventDefault();
    if (!newClaimForm.employeeName || !newClaimForm.amount) return;

    const payload = {
      employeeName: newClaimForm.employeeName,
      department: newClaimForm.department,
      category: newClaimForm.category,
      amount: parseFloat(newClaimForm.amount),
      currency: "USD",
      hasReceipt: newClaimForm.hasReceipt,
      vendor: newClaimForm.vendor || "N/A",
      description: newClaimForm.description || "Submitted via web portal"
    };

    if (backendConnected) {
      try {
        await fetch(`${BACKEND_URL}/api/claims`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        fetchBackendClaims();
      } catch (err) {
        console.error(err);
      }
    } else {
      const newClaim = {
        ...payload,
        id: `CLM-${8001 + claims.length}`,
        submissionDate: new Date().toISOString().split('T')[0],
        riskScore: payload.amount > 2000 ? "HIGH" : payload.amount > 500 ? "MEDIUM" : "LOW"
      };
      setClaims([...claims, newClaim]);
    }

    setIsNewClaimOpen(false);
    setNewClaimForm({
      employeeName: '',
      department: 'Sales',
      category: 'Travel',
      amount: '',
      hasReceipt: true,
      vendor: '',
      description: ''
    });
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  // Metrics computation
  const totalCount = evaluatedClaims.length;
  const approvedList = evaluatedClaims.filter(c => c.status === 'APPROVE');
  const rejectedList = evaluatedClaims.filter(c => c.status === 'REJECT');
  const escalatedList = evaluatedClaims.filter(c => c.status === 'ESCALATE');
  const totalVal = evaluatedClaims.reduce((acc, c) => acc + (c.amount || 0), 0);
  const approvedVal = approvedList.reduce((acc, c) => acc + (c.amount || 0), 0);
  const approvalRate = totalCount ? Math.round((approvedList.length / totalCount) * 100) : 0;

  // Filtered claims for table
  const filteredClaims = evaluatedClaims.filter(c => {
    const matchesSearch = (c.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.vendor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesDept = deptFilter === 'ALL' || c.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-soft-pulse">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Policy Approval Agent</h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.0 Autonomous
                </span>
              </div>
              <p className="text-xs text-slate-400">Deterministic Compliance & Natural Language Policy Compiler</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/60 text-slate-300 flex items-center gap-1.5">
              <span className="text-slate-400">Total:</span>
              <strong className="text-white font-mono">{totalCount}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Approved:</span>
              <strong className="font-mono text-emerald-400">{approvedList.length}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-rose-950/50 text-rose-300 border border-rose-500/20 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Rejected:</span>
              <strong className="font-mono text-rose-400">{rejectedList.length}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-amber-950/50 text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Escalated:</span>
              <strong className="font-mono text-amber-400">{escalatedList.length}</strong>
            </div>
          </div>

          {/* Actions & Connection Indicator */}
          <div className="flex items-center gap-3">
            <button 
              onClick={checkBackendConnection}
              title={backendConnected ? "Connected to FastAPI Python Backend" : "Operating in In-Browser Deterministic Engine Mode"}
              className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                backendConnected 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
              <span>{backendConnected ? 'FastAPI Connected' : 'Browser Engine'}</span>
              <RefreshCw className="w-3 h-3 text-slate-400 hover:rotate-180 transition-transform" />
            </button>

            <button
              onClick={() => setIsNewClaimOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Claim</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'studio' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Rule Studio ({rules.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('claims')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'claims' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Claims Matrix ({evaluatedClaims.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'analytics' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & Audit</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
              Approval Rate: <strong className="text-emerald-400">{approvalRate}%</strong>
            </span>
            <span className="font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
              Approved Vol: <strong className="text-white">${approvedVal.toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* TAB 1: RULE STUDIO */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            
            {/* Plain-English AI Policy Prompt Compiler */}
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden border border-indigo-500/20">
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Plain-English Policy Rule Compiler</h2>
                    <p className="text-xs text-slate-400">Type approval rules in natural English (e.g. "Auto-approve Sales travel under $500 with receipt")</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-800">
                  Zero Code / AST Generator
                </span>
              </div>

              <form onSubmit={handleParsePrompt} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="e.g. Reject any client entertainment expense over $400 without attached receipt"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                  />
                  <button
                    type="submit"
                    disabled={parsingPrompt || !promptInput.trim()}
                    className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    {parsingPrompt ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>Compile AST</span>
                  </button>
                </div>

                {/* Preset Prompt Suggestions */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-500 text-[11px]">Try Preset Rules:</span>
                  <button
                    type="button"
                    onClick={() => setPromptInput("Auto-approve Sales travel under $500 with receipt")}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[11px] transition-colors"
                  >
                    "Sales travel &lt; $500 with receipt"
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromptInput("Escalate any claim over $3000 for board approval")}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[11px] transition-colors"
                  >
                    "Escalate claims &gt; $3,000"
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromptInput("Reject meals over $150 without receipt")}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-[11px] transition-colors"
                  >
                    "Reject meals &gt; $150 no receipt"
                  </button>
                </div>
              </form>

              {/* AST Preview Panel */}
              {parsedAST && (
                <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Compiled Rule Abstract Syntax Tree (AST)</h4>
                    </div>
                    <button
                      onClick={handleAddParsedRule}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md transition-all"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add to Active Rules</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">RULE NAME</span>
                      <strong className="text-white font-semibold">{parsedAST.name}</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">DETERMINISTIC ACTION</span>
                      <span className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded mt-0.5 ${
                        parsedAST.action === 'APPROVE' ? 'badge-approve' : parsedAST.action === 'REJECT' ? 'badge-reject' : 'badge-escalate'
                      }`}>
                        {parsedAST.action}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">PRIORITY RANK</span>
                      <strong className="text-indigo-400 font-mono">#{parsedAST.priority}</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">LOGIC OPERATOR</span>
                      <strong className="text-purple-400 font-mono">{parsedAST.logicalOperator}</strong>
                    </div>
                  </div>

                  {/* Conditions Breakdown */}
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Parsed Conditions Matrix:</span>
                    <div className="flex flex-wrap gap-2">
                      {parsedAST.conditions.map((cond, idx) => (
                        <span key={idx} className="font-mono text-xs bg-slate-950 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-md">
                          {cond.field} <span className="text-indigo-400">{cond.operator}</span> {String(cond.value)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Active Policy Rules List */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>Configured Business Rules (Priority Ordered)</span>
                  </h3>
                  <p className="text-xs text-slate-400">Rules are evaluated sequentially from Priority #1 downwards</p>
                </div>
                <span className="text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg text-slate-300">
                  Active: {rules.filter(r => r.enabled).length} / {rules.length}
                </span>
              </div>

              {/* Rules Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                    <tr>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Rule Name & Description</th>
                      <th className="px-4 py-3">Evaluated Conditions</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3 text-right">Reorder / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                    {rules.map((rule, index) => (
                      <tr key={rule.id} className={`hover:bg-slate-900/60 transition-colors ${!rule.enabled ? 'opacity-45' : ''}`}>
                        
                        <td className="px-4 py-3.5 font-mono font-bold text-indigo-400">
                          #{rule.priority}
                        </td>

                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => handleToggleRule(rule.id)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              rule.enabled 
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                                : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}
                            title={rule.enabled ? "Rule is Enabled" : "Rule is Disabled"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </td>

                        <td className="px-4 py-3.5 max-w-xs">
                          <div className="font-semibold text-white">{rule.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{rule.description}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {rule.conditions?.map((c, i) => (
                              <span key={i} className="font-mono text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                                {c.field} {c.operator} {String(c.value)}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`inline-block font-mono font-bold text-[11px] px-2.5 py-1 rounded-md ${
                            rule.action === 'APPROVE' ? 'badge-approve' : rule.action === 'REJECT' ? 'badge-reject' : 'badge-escalate'
                          }`}>
                            {rule.action}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right space-x-1">
                          <button
                            disabled={index === 0}
                            onClick={() => handleMoveRule(index, -1)}
                            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={index === rules.length - 1}
                            onClick={() => handleMoveRule(index, 1)}
                            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1 rounded bg-rose-950/60 border border-rose-800/40 text-rose-400 hover:bg-rose-900"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CLAIMS MATRIX */}
        {activeTab === 'claims' && (
          <div className="space-y-6">
            
            {/* Search & Filters Header */}
            <div className="glass-panel rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Employee, Vendor or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Status:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="APPROVE">Approved Only</option>
                  <option value="REJECT">Rejected Only</option>
                  <option value="ESCALATE">Escalated Only</option>
                </select>

                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Sales">Sales</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Executive">Executive</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                </select>

                <button
                  onClick={runBatchEvaluation}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Re-Evaluate Batch</span>
                </button>
              </div>
            </div>

            {/* Claims Table */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                    <tr>
                      <th className="px-4 py-3">Claim ID</th>
                      <th className="px-4 py-3">Employee / Dept</th>
                      <th className="px-4 py-3">Vendor / Category</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Receipt</th>
                      <th className="px-4 py-3">Decision Status</th>
                      <th className="px-4 py-3">Matched Rule Policy</th>
                      <th className="px-4 py-3 text-right">Audit Trace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                    {filteredClaims.map((claim) => {
                      const evalData = claim.evaluation;
                      const hasWarnings = evalData?.warnings && evalData.warnings.length > 0;

                      return (
                        <tr key={claim.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-bold text-slate-200">
                            {claim.id}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-white">{claim.employeeName}</div>
                            <div className="text-[11px] text-indigo-400">{claim.department}</div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="text-slate-200 font-medium">{claim.vendor}</div>
                            <div className="text-[11px] text-slate-400">{claim.category}</div>
                          </td>

                          <td className="px-4 py-3.5 font-mono font-bold text-white">
                            ${claim.amount?.toFixed(2)}
                          </td>

                          <td className="px-4 py-3.5">
                            {claim.hasReceipt ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                                <Check className="w-3.5 h-3.5" /> Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                                <XCircle className="w-3.5 h-3.5" /> No
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className={`inline-block font-mono font-bold text-[11px] px-2.5 py-1 rounded-md ${
                                claim.status === 'APPROVE' ? 'badge-approve' : claim.status === 'REJECT' ? 'badge-reject' : 'badge-escalate'
                              }`}>
                                {claim.status}
                              </span>
                              {hasWarnings && (
                                <span title={evalData.warnings[0]}>
                                  <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 max-w-xs">
                            <div className="text-xs text-slate-300 font-medium truncate">
                              {evalData?.matchedRuleName || "Default Escalation"}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {evalData?.rationale}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => setSelectedAuditClaim(claim)}
                              className="bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Trace</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: ANALYTICS & AUDIT */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl space-y-2">
                <span className="text-xs text-slate-400 font-medium">Total Disbursement Requested</span>
                <div className="text-2xl font-bold text-white font-mono">${totalVal.toLocaleString()}</div>
                <div className="text-[11px] text-slate-500">{totalCount} total claims submitted</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-emerald-500">
                <span className="text-xs text-emerald-400 font-medium">Auto-Approved Total</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono">${approvedVal.toLocaleString()}</div>
                <div className="text-[11px] text-emerald-500/80">{approvedList.length} claims passed compliance</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-rose-500">
                <span className="text-xs text-rose-400 font-medium">Policy Rejected Value</span>
                <div className="text-2xl font-bold text-rose-400 font-mono">
                  ${rejectedList.reduce((acc, c) => acc + c.amount, 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-rose-500/80">{rejectedList.length} claims blocked</div>
              </div>

              <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-amber-500">
                <span className="text-xs text-amber-400 font-medium">Escalated for Manual Review</span>
                <div className="text-2xl font-bold text-amber-400 font-mono">
                  ${escalatedList.reduce((acc, c) => acc + c.amount, 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-amber-500/80">{escalatedList.length} claims flagged</div>
              </div>
            </div>

            {/* Department Compliance Breakdown */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white">Departmental Compliance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["Sales", "Engineering", "Executive", "Marketing", "HR"].map(dept => {
                  const deptClaims = evaluatedClaims.filter(c => c.department === dept);
                  const deptApproved = deptClaims.filter(c => c.status === 'APPROVE').length;
                  const deptVal = deptClaims.reduce((a, c) => a + c.amount, 0);
                  const pct = deptClaims.length ? Math.round((deptApproved / deptClaims.length) * 100) : 0;

                  return (
                    <div key={dept} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-white">{dept}</span>
                        <span className="text-indigo-400 font-mono">{pct}% Compliance</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                        <span>Claims: {deptClaims.length}</span>
                        <span>Total: ${deptVal.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL 1: STEP-BY-STEP AUDIT TRACE MODAL */}
      {selectedAuditClaim && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-2xl border border-indigo-500/30 p-6 space-y-5 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Execution Audit Trace</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-400">
                    {selectedAuditClaim.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Deterministic condition-by-condition compliance evaluation matrix</p>
              </div>
              <button 
                onClick={() => setSelectedAuditClaim(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Claim Quick Facts */}
            <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">EMPLOYEE</span>
                <strong className="text-white">{selectedAuditClaim.employeeName}</strong> ({selectedAuditClaim.department})
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">AMOUNT / RECEIPT</span>
                <strong className="text-white font-mono">${selectedAuditClaim.amount}</strong> ({selectedAuditClaim.hasReceipt ? 'Receipt Yes' : 'Receipt NO'})
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">FINAL STATUS</span>
                <span className={`inline-block font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                  selectedAuditClaim.status === 'APPROVE' ? 'badge-approve' : selectedAuditClaim.status === 'REJECT' ? 'badge-reject' : 'badge-escalate'
                }`}>
                  {selectedAuditClaim.status}
                </span>
              </div>
            </div>

            {/* Warning Flags */}
            {selectedAuditClaim.evaluation?.warnings?.length > 0 && (
              <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Compliance Warning Flag</strong>
                  <span>{selectedAuditClaim.evaluation.warnings[0]}</span>
                </div>
              </div>
            )}

            {/* Evaluated Rules Sequence */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Evaluated Rule Hierarchy</h4>
              
              {selectedAuditClaim.evaluation?.auditTrail?.map((trace, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 ${
                    trace.passed 
                      ? 'bg-slate-900/90 border-indigo-500/40' 
                      : 'bg-slate-950 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-400 font-bold">#{trace.priority}</span>
                      <strong className="text-white font-semibold">{trace.ruleName}</strong>
                    </div>
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                      trace.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {trace.passed ? `MATCH -> ${trace.action}` : 'NO MATCH'}
                    </span>
                  </div>

                  {/* Conditions Breakdown */}
                  <div className="space-y-1 pl-3 border-l-2 border-slate-800">
                    {trace.conditionTrace?.map((ct, cIdx) => (
                      <div key={cIdx} className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">{ct.detail}</span>
                        {ct.passed ? (
                          <span className="text-emerald-400 font-bold">PASS</span>
                        ) : (
                          <span className="text-rose-400 font-bold">FAIL</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedAuditClaim(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl"
              >
                Close Audit View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: NEW CLAIM SUBMISSION MODAL */}
      {isNewClaimOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-indigo-500/30 p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Submit New Expense Claim</h3>
              <button onClick={() => setIsNewClaimOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateNewClaim} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Employee Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={newClaimForm.employeeName}
                  onChange={e => setNewClaimForm({ ...newClaimForm, employeeName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <select
                    value={newClaimForm.department}
                    onChange={e => setNewClaimForm({ ...newClaimForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Executive">Executive</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={newClaimForm.category}
                    onChange={e => setNewClaimForm({ ...newClaimForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Meals">Meals</option>
                    <option value="Software">Software</option>
                    <option value="Client Entertainment">Client Entertainment</option>
                    <option value="Office Supplies">Office Supplies</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="450.00"
                    value={newClaimForm.amount}
                    onChange={e => setNewClaimForm({ ...newClaimForm, amount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Vendor</label>
                  <input
                    type="text"
                    placeholder="e.g. Uber, AWS, Delta"
                    value={newClaimForm.vendor}
                    onChange={e => setNewClaimForm({ ...newClaimForm, vendor: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hasReceipt"
                  checked={newClaimForm.hasReceipt}
                  onChange={e => setNewClaimForm({ ...newClaimForm, hasReceipt: e.target.checked })}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="hasReceipt" className="text-slate-300">Attached Digital Receipt</label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewClaimOpen(false)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl shadow-md"
                >
                  Submit & Evaluate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
