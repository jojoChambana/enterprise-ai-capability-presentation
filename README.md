# Enterprise AI Capability Presentation

A static, self-contained presentation app built with Vite + React + TypeScript. Includes a built-in slide editor, slide deck view, article view, and one-click GitHub Pages deployment.

---

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v3** for styling
- **Prism.js** for syntax-highlighted code blocks
- **React Router v7** (HashRouter — works on GitHub Pages without redirect hacks)
- **gh-pages** for deployment

---

## Setup

```bash
git clone <repo-url>
cd enterprise-ai-capability-presentation
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

---

## Running Locally

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run type-check` | Run TypeScript without emitting files |
| `npm run deploy` | Build and publish to `gh-pages` branch |

---

## Presentation Features

### Slide View (default at `/`)
- Full-screen dark-mode slide deck
- **Keyboard navigation**: `←` / `→` or `↑` / `↓` arrow keys
- Previous / Next buttons with slide counter
- **Speaker Notes** toggle (hidden from audience, visible to presenter)
- **Article View** button to switch to scroll mode

### Article View
- All slides rendered sequentially as a long-form page
- Speaker notes shown as amber callout blocks per slide
- Good for sharing as a document or for print

---

## Editor

Navigate to `/#/editor` (or click **Edit** in the header).

### What you can do
- **Add / remove / reorder slides** — up/down buttons in the left sidebar
- **Edit slide title and speaker notes**
- **Add content blocks** to each slide: Heading, Paragraph, Bullet List, Code Block, Image, Embed
- **Edit each block** inline — each type gets its own appropriate form controls
- **Reorder and remove blocks** within a slide
- **Live preview** — right panel shows the slide rendered in dark mode as you type

### Export and redeploy

1. Make your edits in the editor
2. Click **Export JSON** — downloads `slides.json` to your machine
3. Replace `src/data/slides.json` with the downloaded file
4. Run `npm run deploy` to rebuild and publish

### Import

Click **Import JSON** to load any previously exported `slides.json` back into the editor. The current in-memory state is replaced immediately.

> **Note:** Editor changes are in-memory only and do not persist across page refreshes. Always export before closing.

---

## Slide Data Format

All content lives in `src/data/slides.json`. Schema:

```typescript
interface SlideContentBlock {
  id: string;
  type: 'heading' | 'bullets' | 'code' | 'image' | 'embed' | 'paragraph';
  level?: 1 | 2 | 3;       // heading
  text?: string;            // heading
  items?: string[];         // bullets
  language?: string;        // code
  code?: string;            // code
  src?: string;             // image
  alt?: string;             // image
  caption?: string;         // image
  url?: string;             // embed
  content?: string;         // paragraph
}

interface Slide {
  id: string;
  title: string;
  speakerNotes?: string;
  blocks: SlideContentBlock[];
}

interface PresentationData {
  title: string;
  author: string;
  date: string;
  slides: Slide[];
}
```

---

## GitHub Pages Deployment

### First-time setup

1. Push this repo to GitHub
2. Run `npm run deploy` — builds the app and pushes `dist/` to the `gh-pages` branch
3. In your repo → **Settings → Pages**, set source to **Deploy from a branch**, select `gh-pages` / `root`
4. Site will be live at:
   ```
   https://<your-username>.github.io/enterprise-ai-capability-presentation/
   ```

### Subsequent deploys

```bash
# After editing slides.json or making any code changes:
npm run deploy
```

`vite.config.ts` sets `base: '/enterprise-ai-capability-presentation/'` so all assets resolve correctly under the GitHub Pages sub-path.

---

## Project Structure

```
src/
  components/
    BlockRenderer.tsx       # Shared block renderer (used by all views)
    SlideViewer.tsx         # Full-screen slide deck view
    ArticleViewer.tsx       # Scrollable article view
    Editor/
      EditorPanel.tsx       # Main editor layout (sidebar + editor + preview)
      SlideEditor.tsx       # Per-slide editor (title, notes, blocks)
      BlockEditor.tsx       # Per-block inline editor (type-specific controls)
  context/
    PresentationContext.tsx # Global state + all CRUD operations
  data/
    slides.json             # Seed data — replace this to change the presentation
  types/
    presentation.ts         # All TypeScript interfaces
  App.tsx                   # Router + providers
  main.tsx                  # React entry point
index.html
vite.config.ts              # base path set for GitHub Pages
tailwind.config.ts
postcss.config.js
```
