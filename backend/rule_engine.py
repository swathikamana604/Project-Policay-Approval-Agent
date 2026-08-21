import json
import re
from typing import List, Dict, Any, Optional

DEFAULT_RULES = [
    {
        "id": "RULE-101",
        "name": "Missing Receipt Policy for High Expenses",
        "description": "Reject any claim over $100 that does not have an attached receipt",
        "priority": 1,
        "enabled": True,
        "conditions": [
            {"field": "amount", "operator": ">", "value": 100},
            {"field": "hasReceipt", "operator": "==", "value": False}
        ],
        "logicalOperator": "AND",
        "action": "REJECT",
        "rationale": "Financial compliance requires digital receipt verification for expenses exceeding $100."
    },
    {
        "id": "RULE-102",
        "name": "Executive High-Value Board Escalation",
        "description": "Escalate all claims over $2,000 for executive review",
        "priority": 2,
        "enabled": True,
        "conditions": [
            {"field": "amount", "operator": ">=", "value": 2000}
        ],
        "logicalOperator": "AND",
        "action": "ESCALATE",
        "rationale": "High-value corporate disbursements exceeding $2,000 require CFO / Board level escalation."
    },
    {
        "id": "RULE-103",
        "name": "Standard Sales Travel Fast-Track Approval",
        "description": "Auto-approve Sales travel expenses under $500 with receipt",
        "priority": 3,
        "enabled": True,
        "conditions": [
            {"field": "department", "operator": "==", "value": "Sales"},
            {"field": "category", "operator": "==", "value": "Travel"},
            {"field": "amount", "operator": "<=", "value": 500},
            {"field": "hasReceipt", "operator": "==", "value": True}
        ],
        "logicalOperator": "AND",
        "action": "APPROVE",
        "rationale": "Routine field sales travel expenses within $500 budget cap with receipt are pre-approved."
    },
    {
        "id": "RULE-104",
        "name": "Developer Software & Cloud Infrastructure Fast-Track",
        "description": "Auto-approve Engineering software and SaaS under $1,500 with receipt",
        "priority": 4,
        "enabled": True,
        "conditions": [
            {"field": "department", "operator": "==", "value": "Engineering"},
            {"field": "category", "operator": "==", "value": "Software"},
            {"field": "amount", "operator": "<=", "value": 1500},
            {"field": "hasReceipt", "operator": "==", "value": True}
        ],
        "logicalOperator": "AND",
        "action": "APPROVE",
        "rationale": "Approved dev tool subscriptions under $1,500 are pre-authorized for engineering velocity."
    },
    {
        "id": "RULE-105",
        "name": "Unverified Client Entertainment Cap",
        "description": "Reject client entertainment expenses exceeding $300 without manager note",
        "priority": 5,
        "enabled": True,
        "conditions": [
            {"field": "category", "operator": "==", "value": "Client Entertainment"},
            {"field": "amount", "operator": ">", "value": 300}
        ],
        "logicalOperator": "AND",
        "action": "REJECT",
        "rationale": "Client entertainment over $300 violates standard baseline policy without prior manager authorization."
    }
]

class RuleEngine:
    def __init__(self, rules: Optional[List[Dict[str, Any]]] = None):
        self.rules = rules if rules is not None else list(DEFAULT_RULES)

    def get_rules(self) -> List[Dict[str, Any]]:
        return sorted(self.rules, key=lambda r: r.get("priority", 999))

    def set_rules(self, rules: List[Dict[str, Any]]):
        self.rules = rules

    def add_rule(self, rule: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in rule or not rule["id"]:
            rule["id"] = f"RULE-{len(self.rules) + 101}"
        if "priority" not in rule:
            rule["priority"] = len(self.rules) + 1
        if "enabled" not in rule:
            rule["enabled"] = True
        self.rules.append(rule)
        return rule

    def parse_natural_language_prompt(self, prompt: str) -> Dict[str, Any]:
        """
        Parses a plain-English approval rule string into a structured Rule AST object.
        """
        p_lower = prompt.lower()
        
        # Action determination
        action = "APPROVE"
        if "reject" in p_lower or "deny" in p_lower or "decline" in p_lower:
            action = "REJECT"
        elif "escalate" in p_lower or "review" in p_lower or "flag" in p_lower:
            action = "ESCALATE"

        conditions = []

        # Department extraction
        depts = ["Sales", "Engineering", "Marketing", "Executive", "HR", "Finance"]
        for dept in depts:
            if dept.lower() in p_lower:
                conditions.append({"field": "department", "operator": "==", "value": dept})
                break

        # Category extraction
        cats = ["Travel", "Meals", "Software", "Client Entertainment", "Office Supplies"]
        for cat in cats:
            if cat.lower() in p_lower:
                conditions.append({"field": "category", "operator": "==", "value": cat})
                break

        # Amount extraction
        amount_match = re.search(r'(\$|₹|USD|INR)?\s*(\d+(?:\.\d{1,2})?)', prompt)
        if amount_match:
            val = float(amount_match.group(2))
            op = "<="
            if "over" in p_lower or "exceed" in p_lower or "more than" in p_lower or ">" in p_lower:
                op = ">"
            elif "under" in p_lower or "less than" in p_lower or "below" in p_lower or "<" in p_lower:
                op = "<="
            conditions.append({"field": "amount", "operator": op, "value": val})

        # Receipt requirement
        if "without receipt" in p_lower or "no receipt" in p_lower or "missing receipt" in p_lower:
            conditions.append({"field": "hasReceipt", "operator": "==", "value": False})
        elif "with receipt" in p_lower or "has receipt" in p_lower or "receipt attached" in p_lower:
            conditions.append({"field": "hasReceipt", "operator": "==", "value": True})

        # Default fallback condition if none detected
        if not conditions:
            conditions.append({"field": "amount", "operator": "<=", "value": 500})

        rule_name = f"{action.capitalize()} Policy ({', '.join([c['field'] for c in conditions])})"

        parsed_ast = {
            "id": f"RULE-{len(self.rules) + 101}",
            "name": rule_name,
            "description": prompt,
            "priority": len(self.rules) + 1,
            "enabled": True,
            "conditions": conditions,
            "logicalOperator": "AND",
            "action": action,
            "rationale": f"Rule generated automatically from policy prompt: '{prompt}'"
        }

        return parsed_ast

    def evaluate_condition(self, condition: Dict[str, Any], claim: Dict[str, Any]) -> tuple[bool, str]:
        field = condition.get("field")
        op = condition.get("operator")
        target_val = condition.get("value")
        actual_val = claim.get(field)

        if actual_val is None:
            return False, f"Field '{field}' is missing in claim"

        matched = False
        if op == "==":
            matched = (str(actual_val).lower() == str(target_val).lower())
        elif op == "!=":
            matched = (str(actual_val).lower() != str(target_val).lower())
        elif op == ">":
            matched = float(actual_val) > float(target_val)
        elif op == ">=":
            matched = float(actual_val) >= float(target_val)
        elif op == "<":
            matched = float(actual_val) < float(target_val)
        elif op == "<=":
            matched = float(actual_val) <= float(target_val)
        elif op == "contains":
            matched = str(target_val).lower() in str(actual_val).lower()

        detail = f"{field} ({actual_val}) {op} {target_val} => {'PASS' if matched else 'FAIL'}"
        return matched, detail

    def evaluate_claim(self, claim: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates a single claim against active rules in priority order.
        """
        sorted_active_rules = [r for r in self.get_rules() if r.get("enabled", True)]
        
        audit_trail = []
        matching_rules = []
        decision_status = "PENDING"
        decision_rule = None
        warnings = []

        # Edge case / validation guardrail
        if not claim.get("hasReceipt") and float(claim.get("amount", 0)) > 200:
            warnings.append("Missing receipt for expense over $200")

        if not claim.get("employeeName") or claim.get("employeeName").strip() == "":
            warnings.append("Incomplete claim payload: missing employee name")

        for rule in sorted_active_rules:
            rule_id = rule.get("id")
            rule_name = rule.get("name")
            logic_op = rule.get("logicalOperator", "AND")
            conditions = rule.get("conditions", [])

            cond_results = []
            all_pass = True if logic_op == "AND" else False

            for cond in conditions:
                passed, detail = self.evaluate_condition(cond, claim)
                cond_results.append({"condition": cond, "passed": passed, "detail": detail})

                if logic_op == "AND" and not passed:
                    all_pass = False
                elif logic_op == "OR" and passed:
                    all_pass = True

            rule_evaluation = {
                "ruleId": rule_id,
                "ruleName": rule_name,
                "priority": rule.get("priority"),
                "action": rule.get("action"),
                "passed": all_pass,
                "conditionTrace": cond_results
            }
            audit_trail.append(rule_evaluation)

            if all_pass:
                matching_rules.append(rule)
                if decision_status == "PENDING":
                    decision_status = rule.get("action")
                    decision_rule = rule

        # Conflict Detection: check if matching rules have conflicting actions
        actions = set(r.get("action") for r in matching_rules)
        if len(actions) > 1:
            warnings.append(f"Rule Conflict Detected: Multiple active rules matched with opposing actions ({', '.join(actions)}). Enforced highest priority rule '{decision_rule.get('name') if decision_rule else ''}'.")

        # Fallback if no rule matched
        if decision_status == "PENDING":
            decision_status = "ESCALATE"
            rationale = "No explicit matching policy rule was found; flagged for manual manager review."
        else:
            rationale = decision_rule.get("rationale") if decision_rule else "Policy evaluation completed."

        return {
            "claimId": claim.get("id"),
            "status": decision_status,
            "matchedRuleId": decision_rule.get("id") if decision_rule else None,
            "matchedRuleName": decision_rule.get("name") if decision_rule else "Default Escalation Fallback",
            "rationale": rationale,
            "matchingRulesCount": len(matching_rules),
            "warnings": warnings,
            "auditTrail": audit_trail,
            "evaluatedAt": "2026-08-21T18:40:00Z"
        }

    def evaluate_all(self, claims: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        results = []
        for c in claims:
            eval_res = self.evaluate_claim(c)
            c_copy = dict(c)
            c_copy["evaluation"] = eval_res
            c_copy["status"] = eval_res["status"]
            results.append(c_copy)
        return results
