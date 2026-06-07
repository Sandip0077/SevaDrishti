from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
import json
import math
import httpx

app = FastAPI(title="SevaDrishti AI Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Config =====
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyDpEyDy377b6-EaKfCSFZ9D1K0Mvzh34ZY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# ===== Pydantic Models =====
class VolunteerInfo(BaseModel):
    id: str
    name: str
    skills: List[str] = []
    languages: List[str] = []
    fatigue: float = 0
    zone: Optional[str] = None
    fitnessLevel: str = "MEDIUM"
    latitude: float = 0
    longitude: float = 0
    hoursWorked: float = 0
    shiftsCompleted: int = 0

class ZoneInfo(BaseModel):
    id: str
    name: str
    type: str = ""
    required: int = 0
    current: int = 0
    latitude: float = 25.4358
    longitude: float = 81.8463
    crowdDensity: float = 0

class SkillMatchRequest(BaseModel):
    volunteerId: str = ""
    volunteerName: str = ""
    skills: List[str] = []
    languages: List[str] = []
    fitnessLevel: str = "MEDIUM"
    zones: List[ZoneInfo] = []

class SuggestTagsRequest(BaseModel):
    text: str

class OptimizeRequest(BaseModel):
    zones: List[ZoneInfo]
    volunteers: List[VolunteerInfo]

class FatigueRequest(BaseModel):
    volunteerId: str = ""
    volunteerName: str = ""
    hoursWorked: float = 0
    shiftsCompleted: int = 0
    taskIntensity: str = "MEDIUM"
    restHours: float = 8
    consecutiveDays: int = 1

class IncidentResponderRequest(BaseModel):
    incidentId: str = ""
    zoneId: str = ""
    zoneName: str = ""
    type: str = ""
    severity: str = "MEDIUM"
    description: str = ""
    zoneLatitude: float = 25.4358
    zoneLongitude: float = 81.8463
    volunteers: List[VolunteerInfo] = []

class RebalanceRequest(BaseModel):
    zones: List[ZoneInfo]
    volunteers: List[VolunteerInfo]

class GeminiAnalysisRequest(BaseModel):
    prompt: str
    context: dict = {}

# ===== Skill-Zone Intelligence Map =====
ZONE_SKILL_MAP = {
    "GHAT": {
        "required": ["Crowd Management", "Navigation & Guides", "Water Distribution", "Security", "First Aid"],
        "preferred": ["Translation", "Elder Care", "Communication"],
        "weight": 1.3,  # High importance zones
    },
    "CAMP": {
        "required": ["Logistics", "Cooking & Food Distribution", "Sanitation"],
        "preferred": ["Communication", "Child Care"],
        "weight": 1.0,
    },
    "MEDICAL": {
        "required": ["Medical Care", "First Aid"],
        "preferred": ["Elder Care", "Child Care", "Communication"],
        "weight": 1.5,  # Critical zones
    },
    "TRANSIT": {
        "required": ["Traffic Management", "Navigation & Guides", "Communication"],
        "preferred": ["Crowd Management", "Translation"],
        "weight": 1.1,
    },
    "FOOD_COURT": {
        "required": ["Cooking & Food Distribution", "Logistics", "Sanitation"],
        "preferred": ["Communication"],
        "weight": 0.9,
    },
    "PARKING": {
        "required": ["Traffic Management", "Security"],
        "preferred": ["Communication"],
        "weight": 0.8,
    },
    "ENTRY_GATE": {
        "required": ["Security", "Crowd Management", "Communication", "Translation"],
        "preferred": ["Navigation & Guides"],
        "weight": 1.2,
    },
    "OTHER": {
        "required": ["Communication", "Logistics"],
        "preferred": [],
        "weight": 0.7,
    },
}

INCIDENT_SKILL_MAP = {
    "Medical Emergency": {"skills": ["Medical Care", "First Aid"], "urgency": 2.0},
    "Crowd Surge": {"skills": ["Crowd Management", "Security", "Communication"], "urgency": 1.8},
    "Fire": {"skills": ["First Aid", "Security", "Logistics"], "urgency": 2.0},
    "Stampede Risk": {"skills": ["Crowd Management", "Security", "First Aid", "Communication"], "urgency": 2.5},
    "Lost Person": {"skills": ["Navigation & Guides", "Communication", "Translation"], "urgency": 1.0},
    "Infrastructure Damage": {"skills": ["Logistics", "Tech Support", "Security"], "urgency": 1.3},
    "Security Threat": {"skills": ["Security", "Communication"], "urgency": 1.8},
    "Weather Alert": {"skills": ["Logistics", "Communication", "Crowd Management"], "urgency": 1.5},
    "Other": {"skills": ["Communication", "Logistics"], "urgency": 1.0},
}

# ===== Gemini AI Helper =====
async def call_gemini(prompt: str) -> str:
    """Call Google Gemini API for intelligent analysis."""
    if not GEMINI_API_KEY:
        return ""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{GEMINI_URL}?key={GEMINI_API_KEY}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1024},
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"Gemini API error: {e}")
    return ""

# ===== Core AI Algorithms =====
def compute_skill_score(volunteer_skills: List[str], zone_type: str) -> tuple:
    """Advanced skill-demand scoring with weighted matching."""
    zone_config = ZONE_SKILL_MAP.get(zone_type, ZONE_SKILL_MAP["OTHER"])
    required = zone_config["required"]
    preferred = zone_config["preferred"]
    weight = zone_config["weight"]

    if not volunteer_skills:
        return 10.0, [], weight

    required_matched = list(set(volunteer_skills) & set(required))
    preferred_matched = list(set(volunteer_skills) & set(preferred))

    required_score = (len(required_matched) / max(len(required), 1)) * 70
    preferred_score = (len(preferred_matched) / max(len(preferred), 1)) * 20
    base = 10  # Everyone gets a base score

    total = min(100, round((required_score + preferred_score + base) * weight, 1))
    all_matched = required_matched + preferred_matched
    return total, all_matched, weight

def compute_fatigue_score(hours: float, shifts: int, intensity: str, rest: float, consecutive_days: int) -> dict:
    """ML-inspired fatigue prediction with multiple factors."""
    intensity_factor = {"LOW": 0.5, "MEDIUM": 1.0, "HIGH": 1.6}.get(intensity, 1.0)
    rest_factor = max(0.2, 1.2 - (rest / 8))
    consecutive_factor = 1 + (max(0, consecutive_days - 2) * 0.15)

    # Weighted fatigue formula
    work_fatigue = hours * 2.0 * intensity_factor
    shift_fatigue = shifts * 4.0
    recovery_deficit = (8 - min(rest, 8)) * 3.0 * rest_factor
    cumulative = consecutive_factor * 5

    raw = work_fatigue + shift_fatigue + recovery_deficit + cumulative
    score = min(100, max(0, round(raw, 1)))

    if score < 30:
        risk = "LOW"
        suggestion = "Volunteer is well-rested. Can take on regular or high-intensity tasks."
        color = "#22C55E"
    elif score < 55:
        risk = "MODERATE"
        suggestion = "Moderate fatigue detected. Recommend standard shifts with regular breaks."
        color = "#F59E0B"
    elif score < 75:
        risk = "HIGH"
        suggestion = "High fatigue risk. Assign lighter duties or shorter shifts. Consider rotation."
        color = "#F97316"
    else:
        risk = "CRITICAL"
        suggestion = "Critical burnout risk! Immediate rest required. Remove from active duty."
        color = "#EF4444"

    return {
        "fatigueScore": score,
        "riskLevel": risk,
        "suggestion": suggestion,
        "color": color,
        "breakdown": {
            "workFatigue": round(work_fatigue, 1),
            "shiftFatigue": round(shift_fatigue, 1),
            "recoveryDeficit": round(recovery_deficit, 1),
            "cumulativeStress": round(cumulative, 1),
        },
    }

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in km."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

# ===== API Endpoints =====

@app.get("/")
def root():
    return {
        "service": "SevaDrishti AI",
        "status": "running",
        "version": "2.0.0",
        "gemini": "connected" if GEMINI_API_KEY else "not configured",
        "pillars": ["Smart Matching", "Geo-Deployment", "Workload Optimization", "Incident Response"],
    }

# ===== PILLAR 1: AI Smart Matching & Recruitment =====

@app.post("/ai/skill-match")
async def skill_match(req: SkillMatchRequest):
    """AI Smart Matching: Match volunteer skills to best zones with scoring."""
    results = []
    for zone in req.zones:
        score, matched, weight = compute_skill_score(req.skills, zone.type)

        # Factor in zone urgency (understaffed zones get priority boost)
        gap = max(0, zone.required - zone.current)
        urgency_boost = min(15, gap * 3) if gap > 0 else 0
        final_score = min(100, score + urgency_boost)

        # Fitness compatibility
        fitness_modifier = 0
        if req.fitnessLevel == "HIGH" and zone.type in ["GHAT", "ENTRY_GATE", "TRANSIT"]:
            fitness_modifier = 5
        elif req.fitnessLevel == "LOW" and zone.type in ["GHAT", "ENTRY_GATE"]:
            fitness_modifier = -10

        final_score = max(0, min(100, final_score + fitness_modifier))

        results.append({
            "zoneId": zone.id,
            "zoneName": zone.name,
            "zoneType": zone.type,
            "score": round(final_score, 1),
            "matchedSkills": matched,
            "gap": gap,
            "urgency": "HIGH" if gap > zone.required * 0.5 else "MEDIUM" if gap > 0 else "LOW",
            "recommendation": "Strongly Recommended" if final_score >= 75 else "Good Fit" if final_score >= 50 else "Possible",
        })

    results.sort(key=lambda x: (-x["score"], -x["gap"]))

    # Get Gemini AI insight if available
    ai_insight = ""
    if GEMINI_API_KEY and req.skills:
        prompt = f"""You are a volunteer deployment AI for Mahakumbh (a massive Hindu pilgrimage event).
A volunteer named {req.volunteerName or 'Unknown'} has skills: {', '.join(req.skills)}.
Languages: {', '.join(req.languages) if req.languages else 'Not specified'}.
Fitness level: {req.fitnessLevel}.

Top matching zones: {json.dumps(results[:3], default=str)}

In 2-3 sentences, provide a personalized deployment recommendation. Be specific about which zone and why.
Do not use markdown formatting."""
        ai_insight = await call_gemini(prompt)

    return {
        "matches": results,
        "aiInsight": ai_insight,
        "totalZones": len(results),
    }

@app.post("/ai/suggest-tags")
async def suggest_tags(req: SuggestTagsRequest):
    """NLP-based skill tag extraction using Gemini AI."""
    text = req.text.strip()
    if not text:
        return {"tags": [], "confidence": 0, "source": "none"}

    # First: Use Gemini for intelligent extraction
    if GEMINI_API_KEY:
        prompt = f"""Extract volunteer skills from this text. Return ONLY a JSON array of skill tags.
Use ONLY these valid tags: "First Aid", "Medical Care", "Crowd Management", "Navigation & Guides", 
"Translation", "Tech Support", "Logistics", "Communication", "Cooking & Food Distribution", 
"Sanitation", "Security", "Water Distribution", "Child Care", "Elder Care", "Traffic Management", 
"Event Coordination", "Photography", "Social Media"

Text: "{text}"

Return ONLY the JSON array, nothing else. Example: ["First Aid", "Medical Care"]"""

        result = await call_gemini(prompt)
        if result:
            try:
                # Parse JSON from response
                clean = result.strip()
                if clean.startswith("```"):
                    clean = clean.split("\n", 1)[1].rsplit("```", 1)[0].strip()
                tags = json.loads(clean)
                if isinstance(tags, list) and len(tags) > 0:
                    return {"tags": tags, "confidence": 0.92, "source": "gemini-ai"}
            except:
                pass

    # Fallback: Keyword-based extraction
    SKILL_KEYWORDS = {
        "medical": ["Medical Care", "First Aid"], "doctor": ["Medical Care"],
        "nurse": ["Medical Care", "First Aid"], "first aid": ["First Aid"],
        "crowd": ["Crowd Management"], "traffic": ["Traffic Management"],
        "cook": ["Cooking & Food Distribution"], "food": ["Cooking & Food Distribution"],
        "translate": ["Translation"], "language": ["Translation"],
        "tech": ["Tech Support"], "computer": ["Tech Support"],
        "security": ["Security"], "guard": ["Security"],
        "logistics": ["Logistics"], "manage": ["Event Coordination"],
        "photo": ["Photography"], "social media": ["Social Media"],
        "elderly": ["Elder Care"], "child": ["Child Care"],
        "water": ["Water Distribution"], "clean": ["Sanitation"],
        "guide": ["Navigation & Guides"], "navigate": ["Navigation & Guides"],
        "communicate": ["Communication"], "speak": ["Communication"],
    }

    text_lower = text.lower()
    tags = set()
    for keyword, skills in SKILL_KEYWORDS.items():
        if keyword in text_lower:
            tags.update(skills)

    if not tags:
        tags.add("Communication")

    return {"tags": list(tags), "confidence": 0.65, "source": "keyword-nlp"}

# ===== PILLAR 2: Geo-Deployment & Dynamic Reallocation =====

@app.post("/ai/optimize-allocation")
async def optimize_allocation(req: OptimizeRequest):
    """AI-powered optimal allocation with constraint satisfaction."""
    available = [v for v in req.volunteers if not v.zone or v.zone == ""]
    understaffed = sorted(
        [z for z in req.zones if z.current < z.required],
        key=lambda z: z.current / max(z.required, 1)  # Most critical first
    )

    recommendations = []
    assigned_ids = set()

    for zone in understaffed:
        needed = zone.required - zone.current
        candidates = []

        for v in available:
            if v.id in assigned_ids:
                continue

            # Multi-factor scoring
            skill_score, matched, _ = compute_skill_score(v.skills, zone.type)

            # Fatigue penalty (tired volunteers scored lower)
            fatigue_penalty = v.fatigue * 0.4

            # Proximity bonus (closer volunteers preferred)
            dist = haversine_distance(v.latitude, v.longitude, zone.latitude, zone.longitude)
            proximity_bonus = max(0, 10 - dist * 2)  # Bonus for being close

            # Fitness match
            fitness_bonus = 0
            if v.fitnessLevel == "HIGH" and zone.type in ["GHAT", "ENTRY_GATE", "TRANSIT"]:
                fitness_bonus = 8
            elif v.fitnessLevel == "LOW" and zone.type in ["MEDICAL", "FOOD_COURT"]:
                fitness_bonus = 5

            final = max(0, min(100, skill_score - fatigue_penalty + proximity_bonus + fitness_bonus))

            candidates.append({
                "volunteerId": v.id,
                "volunteerName": v.name,
                "zoneId": zone.id,
                "zoneName": zone.name,
                "score": round(final, 1),
                "matchedSkills": matched,
                "distance": round(dist, 2),
                "fatigue": v.fatigue,
                "reasoning": f"Skill match: {round(skill_score)}%, Fatigue: {round(v.fatigue)}%, Distance: {round(dist, 1)}km",
            })

        candidates.sort(key=lambda x: -x["score"])
        for c in candidates[:needed]:
            recommendations.append(c)
            assigned_ids.add(c["volunteerId"])

    # Get Gemini summary if available
    ai_summary = ""
    if GEMINI_API_KEY and recommendations:
        zone_names = list(set(r["zoneName"] for r in recommendations))
        prompt = f"""You are a volunteer deployment AI for Mahakumbh.
{len(recommendations)} allocation recommendations were generated for zones: {', '.join(zone_names)}.
Total available volunteers: {len(available)}, Understaffed zones: {len(understaffed)}.

In 2-3 sentences, summarize the allocation strategy and highlight any concerns (e.g., zones still understaffed). No markdown."""
        ai_summary = await call_gemini(prompt)

    return {
        "recommendations": recommendations,
        "totalRecommendations": len(recommendations),
        "unassignedVolunteers": len(available) - len(assigned_ids),
        "zonesStillUnderstaffed": len(understaffed) - len(set(r["zoneId"] for r in recommendations)),
        "aiSummary": ai_summary,
    }

@app.post("/ai/rebalance-zones")
async def rebalance_zones(req: RebalanceRequest):
    """AI auto-rebalancing: Detect imbalances and suggest redistribution."""
    overstaffed = [z for z in req.zones if z.required > 0 and z.current > z.required]
    understaffed = [z for z in req.zones if z.required > 0 and z.current < z.required]
    balanced = [z for z in req.zones if z.required > 0 and z.current == z.required]

    moves = []
    alerts = []

    # Detect critical zones
    for z in understaffed:
        ratio = z.current / max(z.required, 1)
        if ratio < 0.3:
            alerts.append({
                "zoneId": z.id,
                "zoneName": z.name,
                "level": "CRITICAL",
                "message": f"{z.name} has only {z.current}/{z.required} volunteers ({round(ratio*100)}%)",
            })
        elif ratio < 0.6:
            alerts.append({
                "zoneId": z.id,
                "zoneName": z.name,
                "level": "WARNING",
                "message": f"{z.name} is understaffed: {z.current}/{z.required} ({round(ratio*100)}%)",
            })

    # Generate moves
    for us in sorted(understaffed, key=lambda z: z.current / max(z.required, 1)):
        gap = us.required - us.current
        for os in overstaffed:
            surplus = os.current - os.required
            if surplus <= 0:
                continue
            transfer = min(gap, surplus)
            moves.append({
                "fromZoneId": os.id,
                "fromZone": os.name,
                "toZoneId": us.id,
                "toZone": us.name,
                "count": transfer,
                "priority": "HIGH" if (us.current / max(us.required, 1)) < 0.5 else "MEDIUM",
                "reason": f"Move {transfer} from {os.name} (surplus: {surplus}) to {us.name} (gap: {gap})",
            })
            gap -= transfer
            os.current -= transfer
            if gap <= 0:
                break

    # Gemini AI analysis
    ai_analysis = ""
    if GEMINI_API_KEY and (moves or alerts):
        prompt = f"""You are a workforce optimization AI for Mahakumbh volunteer deployment.
Current status: {len(overstaffed)} overstaffed zones, {len(understaffed)} understaffed zones, {len(balanced)} balanced.
Alerts: {json.dumps(alerts, default=str)}
Suggested moves: {json.dumps(moves[:5], default=str)}

In 3-4 sentences, analyze the situation and provide strategic recommendations. Mention specific zones. No markdown."""
        ai_analysis = await call_gemini(prompt)

    return {
        "moves": moves,
        "alerts": alerts,
        "summary": {
            "overstaffedZones": len(overstaffed),
            "understaffedZones": len(understaffed),
            "balancedZones": len(balanced),
            "totalMoves": len(moves),
        },
        "aiAnalysis": ai_analysis,
    }

# ===== PILLAR 3: Workload Optimization & Fatigue Prevention =====

@app.post("/ai/predict-fatigue")
async def predict_fatigue(req: FatigueRequest):
    """AI fatigue prediction with breakdown and recommendations."""
    result = compute_fatigue_score(
        req.hoursWorked, req.shiftsCompleted, req.taskIntensity,
        req.restHours, req.consecutiveDays
    )

    # Gemini personalized advice
    if GEMINI_API_KEY and result["fatigueScore"] > 40:
        prompt = f"""A Mahakumbh volunteer named {req.volunteerName or 'Unknown'} has:
- Hours worked: {req.hoursWorked}
- Shifts completed: {req.shiftsCompleted}
- Task intensity: {req.taskIntensity}
- Rest hours (last 24h): {req.restHours}
- Consecutive working days: {req.consecutiveDays}
- Fatigue score: {result['fatigueScore']}% ({result['riskLevel']})

In 2 sentences, give a specific, actionable wellness recommendation for this volunteer. No markdown."""
        ai_advice = await call_gemini(prompt)
        if ai_advice:
            result["aiAdvice"] = ai_advice

    return result

@app.post("/ai/bulk-fatigue")
async def bulk_fatigue(volunteers: List[VolunteerInfo]):
    """Predict fatigue for multiple volunteers at once."""
    results = []
    at_risk = 0
    for v in volunteers:
        r = compute_fatigue_score(v.hoursWorked, v.shiftsCompleted, "MEDIUM", 8, 1)
        r["volunteerId"] = v.id
        r["volunteerName"] = v.name
        results.append(r)
        if r["riskLevel"] in ["HIGH", "CRITICAL"]:
            at_risk += 1

    results.sort(key=lambda x: -x["fatigueScore"])
    return {
        "predictions": results,
        "totalVolunteers": len(volunteers),
        "atRisk": at_risk,
        "avgFatigue": round(sum(r["fatigueScore"] for r in results) / max(len(results), 1), 1),
    }

# ===== PILLAR 4: Incident Response & Emergency Mobilization =====

@app.post("/ai/incident-responders")
async def find_responders(req: IncidentResponderRequest):
    """AI-prioritized emergency responder finder: proximity + skill + fatigue."""
    incident_config = INCIDENT_SKILL_MAP.get(req.type, INCIDENT_SKILL_MAP["Other"])
    needed_skills = incident_config["skills"]
    urgency = incident_config["urgency"]

    severity_mult = {"LOW": 0.8, "MEDIUM": 1.0, "HIGH": 1.4, "CRITICAL": 2.0}.get(req.severity, 1.0)

    responders = []
    for v in req.volunteers:
        # Skill match (40% weight)
        matched = list(set(v.skills) & set(needed_skills))
        skill_score = (len(matched) / max(len(needed_skills), 1)) * 40

        # Fatigue inverse (25% weight) - less tired = better
        fatigue_score = ((100 - v.fatigue) / 100) * 25

        # Proximity (25% weight) - closer = better
        dist = haversine_distance(v.latitude, v.longitude, req.zoneLatitude, req.zoneLongitude)
        proximity_score = max(0, 25 - (dist * 5))

        # Fitness bonus (10% weight)
        fitness_score = {"HIGH": 10, "MEDIUM": 6, "LOW": 3}.get(v.fitnessLevel, 6)

        total = round((skill_score + fatigue_score + proximity_score + fitness_score) * severity_mult * urgency, 1)
        total = min(100, total)

        responders.append({
            "id": v.id,
            "name": v.name,
            "score": total,
            "skills": matched,
            "allSkills": v.skills,
            "fatigue": v.fatigue,
            "distance": round(dist, 2),
            "fitnessLevel": v.fitnessLevel,
            "breakdown": {
                "skillMatch": round(skill_score, 1),
                "fatigueBonus": round(fatigue_score, 1),
                "proximityBonus": round(proximity_score, 1),
                "fitnessBonus": round(fitness_score, 1),
            },
        })

    responders.sort(key=lambda x: -x["score"])
    top_responders = responders[:10]

    # Gemini tactical advice
    ai_tactical = ""
    if GEMINI_API_KEY and top_responders:
        prompt = f"""Emergency at Mahakumbh!
Incident: {req.type} (Severity: {req.severity})
Zone: {req.zoneName}
Description: {req.description or 'Not provided'}
Top {min(3, len(top_responders))} responders identified with scores: {', '.join(f"{r['name']}({r['score']}%)" for r in top_responders[:3])}

In 2-3 sentences, provide tactical deployment instructions for these responders. Be specific and action-oriented. No markdown."""
        ai_tactical = await call_gemini(prompt)

    return {
        "responders": top_responders,
        "totalCandidates": len(responders),
        "incidentType": req.type,
        "severity": req.severity,
        "aiTactical": ai_tactical,
    }

# ===== Gemini General Analysis =====
@app.post("/ai/analyze")
async def general_analysis(req: GeminiAnalysisRequest):
    """General-purpose Gemini AI analysis for dashboards and reports."""
    if not GEMINI_API_KEY:
        return {"analysis": "AI analysis requires Gemini API key", "source": "none"}

    result = await call_gemini(req.prompt)
    return {"analysis": result, "source": "gemini-ai"}

@app.get("/health")
def health():
    return {"status": "healthy", "gemini": bool(GEMINI_API_KEY)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
