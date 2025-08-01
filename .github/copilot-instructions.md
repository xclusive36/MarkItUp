# Copilot Instructions for MarkItUp

## Project Overview
- **MarkItUp** is a Next.js 15 + TypeScript markdown editor with live preview, file management, and theme support.
- Markdown files are stored server-side in `/markdown` and managed via API routes in `src/app/api/files/`.
- The UI is built with reusable components in `src/components/` and uses Tailwind CSS (with custom theming) for styling.
- Theme switching (light/dark) is handled via React context in `src/contexts/` and custom CSS in `src/app/`.

## Key Architectural Patterns
- **App Directory Structure:**
  - `src/app/` contains Next.js app routes and API endpoints.
  - `src/app/api/files/route.ts` and `src/app/api/files/[filename]/route.ts` handle file CRUD for markdown files.
  - `src/components/` holds all UI components; keep components stateless where possible.
  - `src/contexts/ThemeContext.tsx` and `SimpleThemeContext.tsx` provide theme state and toggling.
- **Markdown Handling:**
  - Markdown files are read/written from `/markdown` on the server.
  - Syntax highlighting and markdown rendering are handled client-side.
- **Styling:**
  - Tailwind CSS is configured in `tailwind.config.js` with dark mode via the `class` strategy.
  - Custom theme variables and fallback manual theming are in `src/app/globals.css` and `manual-theme.css`.

## Developer Workflows
- **Start Dev Server:**
  - `npm run dev` (Next.js dev server at `localhost:3000`)
- **Build for Production:**
  - `npm run build` then `npm start`
- **Dockerized Workflow:**
  - `docker compose up -d` (uses `docker-compose.yml` and `Dockerfile`)
- **Markdown File Management:**
  - Place `.md` files in `/markdown` for server-side access.
  - API endpoints auto-discover and serve files from this directory.

## Project Conventions
- **File Naming:** Use kebab-case for files, PascalCase for React components.
- **Component Structure:** Keep UI logic in `src/components/`, avoid business logic in components.
- **Theme Handling:** Always wrap pages in the appropriate ThemeProvider from `src/contexts/`.
- **API Design:** All file operations go through `/api/files` endpoints; do not access `/markdown` directly from the client.

## Integration Points
- **External:**
  - Uses `@tailwindcss/typography` for markdown styling.
  - Google Fonts via Next.js font loader in `src/app/layout.tsx`.
- **Internal:**
  - Theme context is required for all pages/components using theme-aware styles.
  - File API endpoints are the only way to interact with markdown files from the UI.

## Examples
- See `src/app/layout.tsx` for app-wide providers and font setup.
- See `src/app/api/files/route.ts` for file list/create logic.
- See `src/app/api/files/[filename]/route.ts` for file read/update/delete logic.
- See `src/contexts/SimpleThemeContext.tsx` for theme context pattern.

---

For any new features, follow the above conventions and reference the README for additional context. When in doubt, prefer server-side file access and context-driven theming.
