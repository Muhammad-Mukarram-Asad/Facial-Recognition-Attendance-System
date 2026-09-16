@AGENTS.md

# Architecture: feature-first

All new work follows a feature-first driven architecture, built in this order:

1. **Route first** — create the route/API endpoint for the feature before anything else.
2. **UI components next** — build the feature's components under its own feature folder (e.g. `src/features/<feature>/`), not scattered across shared directories.
3. **Wire up last** — import the feature's components into the respective `page.tsx`.

Keep everything a feature owns (components, hooks, server logic, types) colocated within that feature.
