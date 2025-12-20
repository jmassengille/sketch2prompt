# sketch2prompt

Define your system architecture before AI starts building.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)

## What it does

You draw boxes representing your system components. You label them with responsibilities and technologies. You click Generate. You get structured files that tell AI coding assistants exactly what to build and what boundaries to respect.

**The problem it solves:** AI agents hallucinate architecture when given vague prompts. They invent inconsistent conventions and create sprawl. sketch2prompt freezes your intent into explicit specifications before the first line of code.

## Quick start

```bash
git clone https://github.com/jmassengille/sketch2prompt.git
cd sketch2prompt
npm install
npm run dev
```

Open http://localhost:5173

## How to use it

1. **Quick Start wizard** - Answer a few questions about your project (platform, stack, capabilities)
2. **Canvas** - Drag components around, adjust labels, add notes
3. **Generate** - Click the Generate button to export your specification

## What you get

The export creates a ZIP with:

- `PROJECT_RULES.md` - System constitution for your AI assistant
- `AGENT_PROTOCOL.md` - Workflow guidance and phase definitions
- `specs/*.yaml` - Component specifications with responsibilities and boundaries
- `diagram.json` - Re-importable diagram state

Paste these into your project root. Point your AI assistant at them. Watch it stop guessing.

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run test     # Run tests
npm run lint     # ESLint check
```

## Tech stack

- React 19 + TypeScript
- Vite 7
- React Flow (canvas)
- Tailwind CSS 4
- Zustand (state)
- Zod (validation)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
