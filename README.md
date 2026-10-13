# Mahi — Software, with intent.

A responsive, static developer portfolio built around project evidence, case studies, accessible controls and a distinctive interactive system-map hero.

## Design choices

The portfolio uses a restrained editorial dark theme, acid-lime accent, original CSS project illustrations, constellation-like hero animation, subtle motion, and responsive project cards. It adopts useful general patterns from modern developer portfolios—clear positioning, projects up front, case-study context, source/live links, categorized skills, contact access—without copying another person's site.

## Features

- Interactive hero system map with skill-jump buttons
- Reduced-cost canvas particle field that pauses while offscreen and respects reduced-motion
- Responsive navigation and active section cue
- Seven project cards with category filters and detailed case-study dialogs
- Keyboard-operable technical skill tabs
- Search/command palette via button or \`Ctrl/Cmd + K\`
- Persistent dark/light theme
- Live public GitHub repository/follower/star lookups with a graceful API-failure fallback
- Copy GitHub and email controls
- Contact form that creates a \`mailto:\` draft; it does not pretend to send messages through a server
- Print / Save as PDF profile via browser print dialog
- Semantic controls, visible focus styles and mobile layouts

## Project evidence

Each source link goes to an existing repository. Live demo links are included only when a public demo exists. Descriptions avoid presenting unverified performance figures, testimonials or fabricated employment history as facts.

## Run locally

Open \`index.html\` or serve this folder with any static server. No package install or build step is required. Google Fonts and live GitHub statistics are optional; source links and the primary layout remain available without them.

## Deployment

GitHub Pages deploys the repository root using \`.github/workflows/pages.yml\` on pushes to \`main\`.
