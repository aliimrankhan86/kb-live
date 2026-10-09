# Routes and UX

- **/** — Landing. Hero with HAJJ / UMRAH CTAs. Header (logo, Get a Quote, Operator Dashboard, Kanban, Login). Responsive: CTAs stack; 360px breakpoint.
- **/umrah**: Umrah preferences form. Submit → `/packages` with query params: `type`, `season`, `budgetMin`, `budgetMax`, `adults`. Form is GET so works without JS. Responsive: quick picks 1 col; 360px padding/title.
- **/packages**: the one package list (UX-08, batch 2; `/search/packages` answers 308 here with the query kept). Query params: `type`, `season`, `budgetMin`, `budgetMax`, `adults`. Shortlist (localStorage), Compare (2 to 3, modal). Responsive: header/controls wrap; cards 1 col; modal scrollable (max-h 90vh, table area scrolls). Do not rename routes or param names without updating this doc and 03_SHORTLIST_COMPARE_SPEC.
