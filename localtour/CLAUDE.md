# CLAUDE.md — LocalTour

## Project Overview

LocalTour is an AI-powered tourism brochure platform under SH@W Labs. Each city deployment (localtour.us, gatlinburg.life, michigancity.life, etc.) serves as a curated local guide with business directory, AI concierge, and affiliate deals.

This repo is the reference implementation and scaffold for all city sites.

## Tech Stack

- **Framework:** React 19 + TypeScript (strict mode)
- **Build:** Vite 6
- **Styling:** Tailwind CSS 3
- **Routing:** React Router 7
- **Deployment:** Netlify

## Conventions

- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`)
- **Versioning:** Semantic versioning (MAJOR.MINOR.PATCH)
- **Branches:** `main` (production), `feat/*`, `fix/*`
- **Components:** Functional components with hooks, default exports
- **Types:** Colocate types in `src/types/`, import explicitly

## File Structure

```
src/
  components/   — Reusable UI components
  pages/        — Route-level page components
  assets/       — Static assets (images, fonts)
  utils/        — Helper functions
  types/        — TypeScript type definitions
public/         — Static files served as-is
docs/           — Project documentation
```

## Contact

- Repo owner: Aaron Shaw (aaron@shaw-labs.com)
- Subsidiary email: localtour@shaw-labs.com
