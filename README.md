# sketch2prompt

**Freeze your intent before AI starts guessing.**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)

<p align="center">
  <img src="public/loop_sketch2prompt.gif" alt="sketch2prompt demo" width="700" />
</p>

---

## The Problem

AI coding assistants are powerful, but they're working blind. Give them a vague prompt and they'll hallucinate architecture, invent inconsistent conventions, and create sprawl that's painful to refactor. The issue isn't the AI—it's underspecified intent.

sketch2prompt fixes this by letting you define your system's structure *before* a single line of code gets written. You sketch components, assign responsibilities, pick your stack—and export specifications that tell AI exactly what to build and what boundaries to respect.

**When it works:**
- Follow-up prompts get shorter, not longer
- Refactors feel safer instead of scarier
- New features slot into existing structure instead of creating more sprawl
- Your codebase feels like it has rules

---

## What You Get

The export creates a ZIP containing structured specifications your AI assistant can follow:

| File | Purpose |
|------|---------|
| `START.md` | Bootstrap protocol—AI confirms understanding before proceeding |
| `PROJECT_RULES.md` | System constitution with version-anchored dependencies |
| `AGENT_PROTOCOL.md` | Workflow guidance and implementation phases |
| `specs/*.md` | Component specifications with responsibilities and boundaries |
| `README.md` | Project overview for humans |
| `diagram.json` | Re-importable diagram state |

Drop these into your project root. Point your AI assistant at `START.md`. Watch it stop guessing.

### What the Output Prevents

| Guardrail | What It Stops |
|-----------|---------------|
| **Version anchoring** | Hallucinated package versions—the #1 cause of AI code rot |
| **Library-first policy** | Reinventing wheels when dependencies already exist |
| **Modularity constraints** | God functions, 1000-line files, deep nesting |
| **Explicit boundaries** | Components bleeding into each other's responsibilities |

---

## Quick Start

```bash
git clone https://github.com/jmassengille/sketch2prompt.git
cd sketch2prompt
npm install
npm run dev
```

Open http://localhost:5173

### How It Works

1. **Wizard** — Answer a few questions: platform, stack, capabilities
2. **Canvas** — Adjust components, add notes, define responsibilities
3. **Generate** — Export your specification as a ZIP

That's it. No account required, no API calls, everything runs locally.

---

## What This Is (and Isn't)

**This is:**
- A system definition tool that captures architectural intent
- A constraint generator for AI coding assistants
- A way to freeze decisions before entropy sets in

**This is not:**
- A code generator
- A diagramming tool for documentation
- A framework that tells you how to build things

Its job ends once structure and intent are clear. Everything else is downstream.

---

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run test     # Run tests
npm run lint     # ESLint check
```

### Tech Stack

React 19, TypeScript, Vite 7, React Flow, Tailwind CSS 4, Zustand, Zod

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
