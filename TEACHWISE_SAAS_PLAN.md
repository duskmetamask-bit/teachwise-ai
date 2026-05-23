# TeachWise SaaS Plan

## Goal
Turn TeachWise into a polished multi-tenant SaaS product for teachers and schools, with durable data, premium workflows, exports, billing, and a clean workspace experience.

## Product Shape

TeachWise should feel like a focused teacher operating system:
- One workspace for class context, generation, exports, and history.
- Fast command-driven workflows for reports, email, rubrics, sub plans, and alignment checks.
- Persistent outputs and logs tied to a user and school/workspace.
- Premium UI that is calm, dense, and easy to scan.

## Core Principles

1. Make the first successful task easy.
2. Keep important data server-side, not in browser storage.
3. Make every visible control do real work.
4. Optimize for teacher speed, clarity, and repeat use.
5. Keep the interface premium, restrained, and highly legible.

## Recommended Stack

- Frontend: Next.js App Router
- Styling: Tailwind CSS v4 + CSS custom properties
- Motion: Framer Motion
- Auth: Supabase Auth or equivalent
- Database: Supabase Postgres
- Storage: Supabase Storage or object storage
- AI: MiniMax via the existing `/anthropic/v1/messages` gateway
- Exports: `docx`, `pdf-lib`, `pptxgenjs`
- Observability: server logs + analytics + error tracking

## Data Model

### Users and Access
- `users`
- `workspaces`
- `workspace_members`
- `schools`
- `roles`

### Teaching Data
- `class_contexts`
- `students`
- `saved_templates`
- `recent_subjects`
- `favorites`

### Generated Content
- `outputs`
- `output_versions`
- `exports`
- `generation_requests`
- `generation_events`

### Email and Compliance
- `email_action_logs`
- `email_drafts`
- `email_intents`
- `audit_events`

### Billing and Usage
- `plans`
- `subscriptions`
- `usage_events`
- `feature_entitlements`

## Phase 1: SaaS Foundation

### Outcomes
- User authentication works.
- Workspaces are persisted.
- Class context is stored server-side.
- The app can restore state after refresh or new device sign-in.

### Build Tasks
- Add login and signup.
- Create workspace ownership and membership.
- Move class context from local storage to the database.
- Persist recent subjects, templates, and saved outputs.
- Add a server-side user profile record.
- Add a clean onboarding flow with first-run defaults.

### Definition of Done
- A user can sign in, return later, and see the same workspace state.
- No core workflow depends on browser storage.

## Phase 2: Core Workflow Persistence

### Outcomes
- Every generated output is saved.
- History is searchable and reusable.
- Email action logs are durable and exportable.

### Build Tasks
- Save Report Writer outputs as structured records.
- Save Email Router outputs with intent, tone, and action checklist state.
- Save exports with timestamps and file metadata.
- Add version history for edited outputs.
- Add a history sidebar or library view.
- Add CSV export for email logs and selected output sets.

### Definition of Done
- Outputs survive refresh, logout, and new device login.
- Users can revisit and reuse old work without recreating it.

## Phase 3: Premium Workflow System

### Outcomes
- Command bar becomes the primary entry point.
- Report Writer and Email Router feel like flagship products.
- Sub plans, rubrics, newsletter, and alignment tools are coherent siblings.

### Build Tasks
- Make `/commands` universal across the app.
- Add smart paste detection across composer surfaces.
- Add stronger output states: streaming, saved, regenerated, exported, copied.
- Add real edit flows for report comments and email drafts.
- Add bulk generation for class lists.
- Add reusable template packs by year level and subject.

### Definition of Done
- The app can handle the most common teacher tasks in under a minute each.
- The interface feels like one system, not several different tools.

## Phase 4: Exports and Documents

### Outcomes
- DOCX, PDF, and PPTX exports are reliable, branded, and consistent.
- Exports are generated server-side where needed.

### Build Tasks
- Build dedicated document templates for:
  - Report comments
  - Unit plans
  - Sub plans
  - Rubrics
  - Newsletters
- Add branded headers, footers, page numbers, and school-ready styling.
- Add export job tracking and retry behavior.
- Add download history and export status.

### Definition of Done
- Exported files open cleanly and match the product quality bar.

## Phase 5: Billing and Limits

### Outcomes
- The app can be monetized.
- Usage is metered and understandable.
- Free and paid plans are clearly different.

### Build Tasks
- Add subscription tiers.
- Add free trial or freemium limits.
- Gate expensive features by plan.
- Add usage tracking per generation and export.
- Add billing portal access.
- Add school/team pricing if needed.

### Definition of Done
- A user can subscribe, upgrade, and understand what they get.
- The app can enforce fair usage without feeling punitive.

## Phase 6: UX Polish

### Outcomes
- The app feels premium and calm.
- The layout works on common laptop sizes and smaller screens.
- Empty, loading, and error states feel intentional.

### Build Tasks
- Refine spacing, type, and layout rhythm across all pages.
- Make the shell visually consistent on every route.
- Improve loading and streaming states.
- Tighten keyboard shortcuts and focus behavior.
- Add polished empty states and first-use guidance.
- Make mobile usable, even if desktop is the primary target.

### Definition of Done
- The product feels deliberate and professionally edited.

## Phase 7: Trust and Ops

### Outcomes
- The app is supportable.
- Failures are visible and diagnosable.
- You can measure activation and retention.

### Build Tasks
- Add analytics for activation, output creation, export success, and retention.
- Add error tracking and server logs.
- Add audit logs for critical actions.
- Add admin views for support and usage review.
- Add tests for the most important workflows.

### Definition of Done
- You can tell what users are doing and where the product is breaking.

## Suggested Build Order

1. Auth and workspace model
2. Persistent class context and outputs
3. Report Writer and Email Router server persistence
4. Export jobs and document templates
5. Billing and usage limits
6. UI refinement across all routes
7. Analytics, logging, and support tooling

## Immediate Next Sprint

If we start building this properly, the next sprint should do these four things:

1. Add auth and workspace persistence.
2. Persist generated outputs and email logs in Supabase.
3. Make Report Writer the first flagship server-backed workflow.
4. Add a saved output library and history view.

## Risks To Watch

- Letting browser storage remain the source of truth too long.
- Building too many tools before one or two workflows feel excellent.
- Shipping exports that look decent in-browser but weak in Word/PDF.
- Making the app feel like a generic chat wrapper instead of a teacher workspace.

## Success Criteria

TeachWise is ready to behave like a real SaaS when:
- Users can sign in and keep working across devices.
- Generated work is stored, edited, and exported reliably.
- Report Writer and Email Router feel genuinely premium.
- Billing and limits are in place.
- The product feels coherent, fast, and trustworthy.
