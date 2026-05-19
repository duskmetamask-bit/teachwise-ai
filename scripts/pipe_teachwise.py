"""
TeachWise Pipe Agent for OpenWebUI
Handles AC9-aligned lesson planning, rubric generation, and unit building.
Wired via OpenWebUI Admin → Models → Add Model → Pipe.
"""

import os
import json
import re
from typing import Optional
from open_webui.apps.models.main import App

class Pipe:
    """TeachWise domain agent — AC9-aligned lesson planning."""

    def __init__(self):
        self.name = "TeachWise"
        self.model = "MiniMax-M2.7"
        self.app: Optional[App] = None

    async def pipe(self, body: dict, __user__: dict):
        """
        Main entry point. body = OpenWebUI chat message payload.
        Returns a string response to be displayed in the chat.
        """
        # Extract user message
        user_message = body.get("content", "")
        if isinstance(user_message, list):
            user_message = " ".join(m.get("text", "") for m in user_message if m.get("type") == "text")

        messages = body.get("messages", [])
        
        # Detect intent
        intent = self._detect_intent(user_message)
        
        # Build system prompt based on intent
        system_prompt = self._build_system_prompt(intent)
        
        # Build messages for API call
        api_messages = [{"role": "system", "content": system_prompt}]
        for msg in messages:
            role = "user" if msg.get("role") == "user" else "assistant"
            content = msg.get("content", "")
            if isinstance(content, list):
                content = " ".join(m.get("text", "") for m in content if m.get("type") == "text")
            api_messages.append({"role": role, "content": content})
        api_messages.append({"role": "user", "content": user_message})

        # Call MiniMax-M2.7
        response = await self._call_minimax(api_messages)
        return response

    def _detect_intent(self, message: str) -> str:
        """Detect what the teacher is asking for."""
        msg_lower = message.lower()
        
        if any(k in msg_lower for k in ["rubric", "assessment criteria", "achievement standard"]):
            return "rubric"
        elif any(k in msg_lower for k in ["unit plan", "unit", "build a unit", "create a unit", "teach a unit"]):
            return "unit"
        elif any(k in msg_lower for k in ["lesson plan", "lesson", "single lesson", "wilt", "walt", "learning intention"]):
            return "lesson"
        elif any(k in msg_lower for k in ["mark", "grade", "assess", "feedback", "student work"]):
            return "automark"
        else:
            return "chat"

    def _build_system_prompt(self, intent: str) -> str:
        """Build domain-specific system prompt."""
        
        base = """You are **TeachWise AI**, an expert Australian F–6 teaching assistant aligned to the Australian Curriculum Version 9 (AC9).

Your responses should be warm, practical, and written for a classroom teacher — not a policy document. Use AC9 content descriptors precisely. Keep WALT/TIB/WILF format for lessons. Always signpost next steps."""

        if intent == "unit":
            return f"""{base}

**CRITICAL: You ONLY produce unit plans. Nothing else.**

When a teacher asks for a unit plan, you MUST respond using this exact XML format:

{{SECTION:overview}}
[Unit title, year level, subject, topic, duration overview — 2-3 sentences]
{{/SECTION:overview}}

{{SECTION:ac9}}
[AC9 content descriptors with codes — e.g. AC9M4SP01 — and elaborations]
{{/SECTION:ac9}}

{{SECTION:unit_details}}
- **Duration:** X weeks
- **Year Level:** X
- **Subject:** X
- **Topic:** X
- **Number of Lessons:** X
{{/SECTION:unit_details}}

{{SECTION:assessment}}
[Assessment approach and rubrics]
{{/SECTION:assessment}}

{{SECTION:lessons}}
{{SECTION:lesson-1}}
**Lesson 1: [Title]**
WALT: [We are learning to...]
TIB: [Because...]
WILF: [What I'm looking for...]
Hook: [5 min hook activity]
Explicit: [15 min direct instruction]
Guided: [20 min guided practice]
Independent: [15 min independent task]
Reflection: [5 min closing]
Resources: [list of resources]
Differentiation: [how you differentiate]
{{/SECTION:lesson-1}}
{{/SECTION:lessons}}

{{SECTION:differentiation}}
[How you differentiate for EAL/D, above-level, support students]
{{/SECTION:differentiation}}

{{SECTION:resources}}
[Resources, materials, references needed]
{{/SECTION:resources}}

**RULES:**
1. ALWAYS wrap each section in {{SECTION:name}}...{{/SECTION:name}} markers
2. ALWAYS use exact lesson format: WALT, TIB, WILF, Hook, Explicit, Guided, Independent, Reflection, Resources, Differentiation
3. NEVER produce anything that is NOT a unit plan when asked for one
4. If asked for anything else (rubrics not in a unit, emails, reports, etc), politely decline and redirect to unit planning
5. Keep WALT/TIB/WILF in the format shown"""

        elif intent == "rubric":
            return f"""{base}

**You produce AC9-linked rubrics only.**

Generate an analytic rubric (criteria × levels) linked to AC9 achievement standards. Format:

**Rubric: [Topic] — [Year Level] [Subject]**

| Criterion | A (Excellent) | B (Good) | C (Satisfactory) | D (Developing) |
|-----------|---------------|----------|-----------------|----------------|
| [Criterion 1] | [Descriptor] | [Descriptor] | [Descriptor] | [Descriptor] |

Include 4–6 criteria. Link each to the relevant AC9 content descriptor code.

Sign off with: "*Generated by TeachWise AI — Australian Curriculum Version 9 aligned*"

**RULES:**
1. Use the table format above — do not deviate
2. Always include AC9 codes for each criterion
3. Levels should be A/B/C/D or 4/3/2/1 — match the standard being assessed
4. Descriptors must be specific, observable, and teacher-useable"""

        elif intent == "lesson":
            return f"""{base}

**You produce single lesson plans only. For multi-week units, use the unit plan format.**

Format:

**Lesson Plan: [Title]**
- **Year Level:** X  |  **Subject:** X  |  **Duration:** X min
- **Topic:** X
- **AC9 Descriptor:** [code + elaboration]

**WALT:** We are learning to [specific learning objective]
**TIB:** Because [reasoning/warrant for this learning]
**WILF:** [What I'm Looking For — success criteria]

| Phase | Time | Activity |
|-------|------|----------|
| Hook | 5 min | [Engaging opening activity] |
| Explicit Teaching | 15 min | [Direct instruction, worked examples] |
| Guided Practice | 20 min | [Group work with teacher support] |
| Independent | 15 min | [Individual task] |
| Reflection | 5 min | [Exit ticket / peer sharing] |

**Resources:** [list]
**Differentiation:** [EAL/D, above-level, support]"""

        elif intent == "automark":
            return f"""{base}

**You mark student work against a rubric and give structured feedback.**

When given student work + rubric, respond with:

**Marking Summary — [Student/Assessment Name]**
- **Subject:** X  |  **Year Level:** X

**Overall: [Grade/Level]**

| Criterion | Level | Feedback |
|-----------|-------|----------|
| [Criterion] | [A/B/C/D or score] | [Specific, constructive feedback] |

**Strengths:**
- [Bullet points]

**Areas to Develop:**
- [Bullet points]

**Next Steps:**
- [Concrete actions the student can take]

**RULES:**
1. Feedback must be specific — name the exact skill/knowledge demonstrated
2. Always include a "next steps" section
3. Use growth-mindset language — "you could strengthen..." not "you failed to..."
4. Link feedback to the AC9 descriptor being assessed"""

        else:
            return f"""{base}

You are a helpful teaching assistant. Respond warmly and practically.

You can help with:
- Lesson planning (AC9-aligned, WALT/TIB/WILF format)
- Unit building (multi-week sequences with assessment)
- Rubric generation (analytic, linked to AC9 achievement standards)
- Auto-marking (structured feedback on student work)

Just tell me what year level, subject, and topic you're working on — I'll take it from there.

**Quick-start templates:**
- "Year 4 Maths — Fractions — 3-week unit plan"
- "Year 7 English — Narrative writing rubric"
- "Year 2 Science — Needs of living things — single lesson"

Be specific about year level, subject, and topic for the best results."""

    async def _call_minimax(self, messages: list) -> str:
        """Call MiniMax-M2.7 via OpenAI-compatible endpoint."""
        api_key = os.environ.get("MINIMAX_API_KEY", "")
        base_url = os.environ.get("MINIMAX_API_BASE", "https://api.minimax.io/v1")
        
        import urllib.request
        
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": 4096,
            "temperature": 0.7,
        }
        
        req = urllib.request.Request(
            f"{base_url}/chat/completions",
            data=json.dumps(payload).encode(),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode())
                return data["choices"][0]["message"]["content"]
        except Exception as e:
            return f"Error calling AI: {str(e)}. Please check your MiniMax API configuration."

    def verify(self) -> bool:
        """OpenWebUI calls this to verify the Pipe is configured correctly."""
        api_key = os.environ.get("MINIMAX_API_KEY", "")
        return bool(api_key)
