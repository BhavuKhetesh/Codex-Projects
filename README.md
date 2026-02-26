# Immersive Teacher Presentation Agent System

A lightweight, extensible prototype for an **agentic presentation builder** designed for teachers.

## What this system provides

- **Conversation-first planning**: teacher enters a topic, then a master agent asks dynamic follow-up questions.
- **Agent orchestration**: master agent decomposes work, spawns specialist sub-agents, and coordinates generation.
- **Continuous immersive output**: presentation is rendered as a flowing HTML/CSS scene inside a canvas-like stage (not fixed slide cards).
- **Change-on-demand editing**: teacher can request partial changes; only targeted sections are regenerated.
- **Verifier layer**: verifier agents review coherence, quality, pedagogy, and accessibility before release.
- **Token efficiency controls**: short-context planning, patch-based updates, and structured artifacts to avoid full regeneration.
- **Live transparency**: UI shows what each agent is doing in real time.

## Project structure

- `index.html` — app shell: chat, stage, and agent telemetry panels.
- `styles.css` — layout and visual styling.
- `app.js` — UI interactions and state wiring.
- `agents.js` — agent system simulation, orchestration flow, token strategy, and model call placeholders.

## Run locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Where to add your model API

All model integration points are intentionally centralized in `agents.js`:

- `ModelGateway.callModel(...)` for LLM calls.
- `AssetTooling.generateImage(...)` for image generation tools.
- `AssetTooling.generateChartSpec(...)` for chart/table generation tools.

You can plug in your preferred provider later (OpenAI, Anthropic, self-hosted, etc.) without changing the app flow.

## Agent design overview

### 1) Master Agent

Responsibilities:
- Understand topic + constraints.
- Ask dynamic clarification questions.
- Produce an outline and execution graph.
- Spawn and coordinate sub-agents.
- Route edit requests to minimal affected nodes.

### 2) Specialist Sub-Agents

Examples:
- Narrative Agent (story arc)
- Visual Design Agent (layout, motion, palette)
- Content Agent (explanations, analogies, examples)
- Media Agent (images/video ideas)
- Data Agent (graphs/tables)
- Interaction Agent (prompts/checkpoints/quizzes)

### 3) Verifier Agent Cluster

Parallel validators:
- Pedagogy verifier
- Visual coherence verifier
- Accessibility verifier
- Timing/density verifier
- Fact consistency verifier

Outputs are merged into a review summary and optional auto-fix patches.

## Token efficiency strategy

- **State graph + IDs**: each section has stable IDs for surgical updates.
- **Patch protocol**: edits operate on target IDs instead of regenerating whole deck.
- **Compact memory**: long conversation is compressed into evolving summary + constraints.
- **Two-pass generation**: coarse structure first, then deepening only where needed.
- **Verifier short prompts**: verifiers evaluate scoped fragments, not entire presentation each time.

## Notes

This is a functional prototype with realistic orchestration behavior and interfaces.
Production hardening would add:
- persistent storage,
- auth/multi-tenant support,
- robust queue/workers,
- richer media rendering pipeline,
- full model/tool adapters.
