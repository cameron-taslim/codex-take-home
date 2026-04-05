# VIZ_DESIGN_TASKS.md

## Purpose
This document is the visual design handoff for agents working on the UI refresh of Experiment Lab.

Use it to keep all design work aligned to one shared aesthetic and one shared page structure.

This is a visual redesign only. Do not expand product scope beyond the approved plans.

## Required Source Documents
Before making any UI changes, read these in order:

1. `AGENTS.md`
2. `plans/project-overview.md`
3. every file in `plans/shared/`
4. the relevant page plan in `plans/pages/`
5. this file

If this file conflicts with the shared plans, follow the shared plans and report the conflict.

## Scope
The app is already functionally built. The goal now is to redesign the UI so it looks intentional, credible, and demo-ready.

Do not add:

- new product features
- fake backend capabilities
- new routes beyond the approved flow, except using `/` as the landing page and `/login` as the auth page
- arbitrary code rendering for previews

Do improve:

- visual hierarchy
- information density
- layout structure
- navigation
- preview presentation
- status treatment
- generation action styling

## Primary Visual References
These local reference images are the strongest source of truth for the desired visual feel:

- `ideas/landing_page.png`
- `ideas/experiment_editor.png`

These images establish the target more precisely than the earlier text references.

### What the images clearly imply
- dark-first product UI
- indigo or violet-highlighted accent moments
- strong left sidebar on product screens
- dense, card-based experiment review layout
- large centered hero on the landing page
- crisp borders instead of soft glassmorphism
- high-contrast typography
- compact, operator-style controls

## Approved Visual Direction
The app should feel like:

- `Linear` for sidebar density and status signaling
- `PostHog` for experiment workflow composition
- `Raycast` for landing-page hero polish
- `Resend` for the generation-action UX
- `Vercel Design` for token discipline
- `Eppo` for experiment-result framing

But the final look should bias toward the local images in `ideas/`, not toward a direct clone of those websites.

## Answer To The Reference Question
Yes, the redesign should look meaningfully closer to the images in `ideas/` than the app does today.

More specifically:

- the landing page should resemble `ideas/landing_page.png` in composition, tone, density, and emphasis
- the authenticated builder/detail experience should resemble `ideas/experiment_editor.png` in shell layout, contrast, and preview structure

It does not need to match those mockups pixel-for-pixel, but it should clearly belong to the same design family.

## Design Language
Use a dark-first, high-contrast, experiment-console aesthetic.

### Product personality
- serious
- technical
- premium
- efficient
- not playful
- not generic SaaS

### What to avoid
- beige or airy light-theme surfaces
- large soft glass cards
- oversized rounded corners
- generic startup gradients everywhere
- sparse layouts with too much empty space
- bland form-only pages

## Visual Agreement Rules
All agents must agree on these design constants:

### 1. Accent system
Use a deep indigo-violet accent as the primary visual highlight.

This is a refinement from the earlier amber discussion because the local reference images clearly center violet/indigo, and that should win.

Use accent color for:

- primary buttons
- active navigation
- highlighted labels
- progress bars
- focused states
- selected experiment state

Secondary support color may be green for positive experiment outcomes and amber only for transitional states like generating.

### 2. App tone
The authenticated app should be utilitarian with premium polish.

That means:

- dense, structured layouts
- restrained decorative effects
- clear operational hierarchy
- elegant typography and spacing
- limited but intentional glow/gradient use

### 3. Contrast model
All authenticated pages are dark-first.

Landing page is also dark-first, but may use more atmospheric gradients and centered marketing composition than the product pages.

### 4. Shape language
- crisp panels
- small-to-medium radii
- thin borders
- subtle depth
- no heavy blur

### 5. Status language
Status must be visible through both color and structure.

Use:

- `Draft`: muted gray dot/badge
- `Generating`: amber dot/badge
- `Generated` or `Live`: green dot/badge
- `Failed`: red dot/badge

Status dots are preferred over oversized pills when used in dense lists.

## Tokens
Agents should implement a semantic token system in global styles.

Recommended token groups:

- `--bg-app`
- `--bg-canvas`
- `--bg-panel`
- `--bg-panel-strong`
- `--border-subtle`
- `--border-strong`
- `--text-primary`
- `--text-secondary`
- `--text-tertiary`
- `--accent-primary`
- `--accent-primary-strong`
- `--accent-primary-soft`
- `--success`
- `--warning`
- `--danger`
- `--radius-sm`
- `--radius-md`
- `--radius-lg`

Recommended visual values:

- backgrounds should live in near-black, graphite, and charcoal ranges
- accent should live in indigo/violet ranges
- text should be cool off-white, not pure white everywhere

## Typography
The typography should feel sharper and more product-led than the current UI.

Rules:

- use one display-capable sans or grotesk for headings
- use one clean UI sans for body and form text
- use one mono face for IDs, timestamps, utility metadata
- keep headings tight and high-contrast
- use lighter secondary copy than the current implementation

Do not make the product feel editorial-luxury. It should still read as software.

## Page-Level Visual Specs

### Landing Page `/`
Purpose:
- sell the product
- preview the workflow
- establish the design language before sign-in

Required structure:
- top nav
- hero
- workflow/value section
- product preview section
- final CTA

Hero requirements:
- centered or near-centered headline
- eyebrow badge above headline
- short supporting copy
- primary CTA and secondary CTA
- dark atmospheric background with subtle indigo glow

Hero composition should feel close to `ideas/landing_page.png`:
- compact top nav
- large center headline
- strong primary CTA
- supporting metric or capability cards underneath

Product-preview area:
- show mock product surfaces or framed UI panels
- avoid stock illustrations

### Login Page `/login`
Purpose:
- be a focused auth page, separate from marketing

Requirements:
- compact auth panel
- minimal supporting copy
- same dark token system
- clear input and error states
- optional link back to landing page

This page should be quieter than the landing page.

### Dashboard `/dashboard`
Purpose:
- feel like an experiment command center

Required structure:
- page header
- primary create action
- experiment list or row-based panel

Visual direction:
- prefer dense rows over loose cards
- use status dots
- show experiment name, page type, status, updated time clearly
- stronger active/hover states than current implementation

If a sidebar recent-experiment list is introduced, keep the main list complementary rather than duplicative.

### Builder `/experiments/new`
Purpose:
- feel like preparing and launching a generation run

Required structure:
- two-panel layout
- left side: brief form
- right side: guidance, run context, preview placeholder
- prominent generation action area

Visual direction:
- group form fields into distinct sections
- use darker structured panels
- make `Generate Variants` the visual anchor
- create a `Resend`-style action rail rather than two disconnected default buttons

### Detail `/experiments/[id]`
Purpose:
- be the strongest product screen
- showcase generated variants and run history

Required structure:
- summary strip or summary panel
- variant comparison area
- generation history area
- rerun action

Visual direction should feel close to `ideas/experiment_editor.png`:
- left sidebar in shell
- large preview cards for variants
- right-side utility rail for suggestions/history/stats-like support panels
- compact dense controls at top

The app does not have real analytics in scope. Do not invent production metrics. But you may use layout framing inspired by experiment-analysis tools as long as the visible data still comes from the approved model.

## Shared Component Redesign Priorities
Agents should redesign these primitives first before polishing pages:

1. app shell
2. sidebar item
3. status dot and status badge
4. page header
5. panel/card system
6. button hierarchy
7. input and textarea styles
8. empty state
9. error banner
10. variant preview card
11. generation action rail

If these components are coherent, the rest of the product will align faster.

## Implementation Order
Recommended order for agents:

1. global tokens and typography
2. app shell and sidebar
3. shared primitives
4. landing page
5. login page
6. dashboard
7. builder
8. detail page

## Handoff Rules For Parallel Agents
If multiple agents work in parallel:

- one agent should own global tokens and shared primitives
- page agents should not redefine colors, spacing, radii, or status styles
- page agents must consume the shared shell and primitive library
- any deviation from the agreed accent, density, or status treatment should be treated as a design regression

## Definition Of Done For Visual Work
Visual redesign is complete only when:

- the app clearly matches the dark-first design family from `ideas/landing_page.png` and `ideas/experiment_editor.png`
- the landing page, login page, dashboard, builder, and detail page feel like one product
- the sidebar, status treatment, and panel hierarchy are consistent
- builder and detail pages feel preview-first, not form-first
- the implementation still follows all approved planning documents
- relevant tests are updated if visible UI text or structure affects them

## Deliverables Expected From An Implementation Agent
After finishing visual work, the agent should report:

- files changed
- which shared primitives were updated
- which pages were updated
- tests run
- browser checks run
- any deviations from this document or from the planning docs
