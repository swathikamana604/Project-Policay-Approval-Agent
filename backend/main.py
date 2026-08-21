import json
import os
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from rule_engine import RuleEngine

app = FastAPI(
    title="Policy-Driven Approval Agent API",
    description="Deterministic rule evaluation and plain-English policy management engine for enterprise expense claims.",
    version="2.0.0"
)

# Allow CORS for React Frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLAIMS_FILE_PATH = os.path.join(os.path.dirname(__file__), "data", "claims.json")

def load_claims() -> List[Dict[str, Any]]:
    if os.path.exists(CLAIMS_FILE_PATH):
        try:
            with open(CLAIMS_FILE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading claims: {e}")
    return []

def save_claims(claims: List[Dict[str, Any]]):
    os.makedirs(os.path.dirname(CLAIMS_FILE_PATH), exist_ok=True)
    with open(CLAIMS_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(claims, f, indent=2)

# Global Rule Engine instance
engine = RuleEngine()

class RulePromptRequest(BaseModel):
    prompt: str

class ClaimModel(BaseModel):
    employeeName: str
    department: str
    category: str
    amount: float
    currency: Optional[str] = "USD"
    hasReceipt: bool = True
    vendor: Optional[str] = ""
    description: Optional[str] = ""

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Policy-Driven Approval Agent Backend API",
        "version": "2.0.0",
        "active_rules_count": len(engine.get_rules())
    }

@app.get("/api/claims")
def get_claims():
    raw_claims = load_claims()
    evaluated_claims = engine.evaluate_all(raw_claims)
    return {
        "success": True,
        "count": len(evaluated_claims),
        "claims": evaluated_claims
    }

@app.post("/api/claims")
def create_claim(claim_data: ClaimModel):
    claims = load_claims()
    new_id = f"CLM-{8001 + len(claims)}"
    
    new_claim = claim_data.dict()
    new_claim["id"] = new_id
    new_claim["submissionDate"] = "2026-08-21"
    new_claim["riskScore"] = "HIGH" if new_claim["amount"] > 2000 else ("MEDIUM" if new_claim["amount"] > 500 else "LOW")

    claims.append(new_claim)
    save_claims(claims)

    eval_result = engine.evaluate_claim(new_claim)
    new_claim["evaluation"] = eval_result
    new_claim["status"] = eval_result["status"]

    return {
        "success": True,
        "message": f"Claim {new_id} submitted and evaluated successfully.",
        "claim": new_claim
    }

@app.get("/api/rules")
def get_rules():
    return {
        "success": True,
        "rules": engine.get_rules()
    }

@app.post("/api/rules")
def add_rule(rule_data: Dict[str, Any] = Body(...)):
    if "prompt" in rule_data and rule_data["prompt"]:
        rule = engine.parse_natural_language_prompt(rule_data["prompt"])
    else:
        rule = rule_data
    
    added = engine.add_rule(rule)
    return {
        "success": True,
        "rule": added,
        "message": "Policy rule added successfully."
    }

@app.post("/api/parse-rule")
def parse_rule_prompt(req: RulePromptRequest):
    ast_rule = engine.parse_natural_language_prompt(req.prompt)
    return {
        "success": True,
        "prompt": req.prompt,
        "ast": ast_rule
    }

@app.put("/api/rules/reorder")
def reorder_rules(rules: List[Dict[str, Any]] = Body(...)):
    for idx, r in enumerate(rules):
        r["priority"] = idx + 1
    engine.set_rules(rules)
    return {
        "success": True,
        "rules": engine.get_rules(),
        "message": "Rules priority order updated."
    }

@app.put("/api/rules/{rule_id}/toggle")
def toggle_rule(rule_id: str):
    rules = engine.get_rules()
    target = None
    for r in rules:
        if r["id"] == rule_id:
            r["enabled"] = not r.get("enabled", True)
            target = r
            break
    if not target:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    engine.set_rules(rules)
    return {
        "success": True,
        "rule": target,
        "message": f"Rule {rule_id} enabled status set to {target['enabled']}"
    }

@app.delete("/api/rules/{rule_id}")
def delete_rule(rule_id: str):
    rules = [r for r in engine.get_rules() if r["id"] != rule_id]
    engine.set_rules(rules)
    return {
        "success": True,
        "message": f"Rule {rule_id} removed."
    }

@app.post("/api/evaluate")
def evaluate_all_claims():
    raw_claims = load_claims()
    evaluated = engine.evaluate_all(raw_claims)
    return {
        "success": True,
        "claims": evaluated
    }

@app.get("/api/stats")
def get_stats():
    raw_claims = load_claims()
    evaluated = engine.evaluate_all(raw_claims)

    total_claims = len(evaluated)
    approved = [c for c in evaluated if c["status"] == "APPROVE"]
    rejected = [c for c in evaluated if c["status"] == "REJECT"]
    escalated = [c for c in evaluated if c["status"] == "ESCALATE"]

    total_value = sum(c.get("amount", 0) for c in evaluated)
    approved_value = sum(c.get("amount", 0) for c in approved)
    rejected_value = sum(c.get("amount", 0) for c in rejected)
    escalated_value = sum(c.get("amount", 0) for c in escalated)

    dept_summary = {}
    for c in evaluated:
        dept = c.get("department", "Other")
        if dept not in dept_summary:
            dept_summary[dept] = {"total": 0, "approved": 0, "value": 0}
        dept_summary[dept]["total"] += 1
        dept_summary[dept]["value"] += c.get("amount", 0)
        if c["status"] == "APPROVE":
            dept_summary[dept]["approved"] += 1

    return {
        "success": True,
        "metrics": {
            "totalClaims": total_claims,
            "totalValue": total_value,
            "approvedCount": len(approved),
            "approvedValue": approved_value,
            "rejectedCount": len(rejected),
            "rejectedValue": rejected_value,
            "escalatedCount": len(escalated),
            "escalatedValue": escalated_value,
            "approvalRate": round((len(approved) / total_claims * 100), 1) if total_claims > 0 else 0,
            "departmentBreakdown": dept_summary
        }
    }
