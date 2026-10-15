# Mahi — Full Stack Developer Portfolio

This GitHub Pages site uses the single-file portfolio design supplied for the project. The published home page is `index.html`; its layout, CSS, JavaScript, background visuals and preview thumbnails are bundled into that file, so it does not depend on extra local image assets.

## Included
- About, featured projects, skills, internships, education, journey, achievements/certifications, toolkit and contact sections
- Dark/light theme toggle with local preference persistence
- Keyboard-accessible section/project search palette (Ctrl/Cmd+K)
- Project case-file overlays with project-specific source links and live links where verified
- Optional canvas smoke trail, back-to-top control and responsive layouts
- Seven featured projects, including Crop Yield Predictor
- Resume open/download controls, plus the original hosted PDF file at `Mahendra_Resume_Python_Updated_v6.pdf`

## Featured source repositories
- [Averis](https://github.com/mahitech580/averis)
- [CYRUS](https://github.com/mahitech580/CYRUS-Autonomous-Agentic-Intelligence-System)
- [VoxGenAI](https://github.com/mahitech580/VoxGen-AI)
- [Deepfake Video Detection](https://github.com/mahitech580/deepfake-video-detection)
- [TripPilot](https://github.com/mahitech580/TripPilot-Travel-Planner)
- [ORBIT Platform](https://github.com/mahitech580/ORBIT-Platform)
- [Crop Yield Predictor](https://github.com/mahitech580/crop-yield-predictor)

## Local preview
Run `python -m http.server 4173` in the repository root and open `http://127.0.0.1:4173`.

## Automated checks
GitHub Actions runs a Playwright browser smoke suite covering project case files, palette navigation, theme state, resume open/download behavior, smoke toggle, reduced motion and six viewport widths.

## Résumé
Open [`resume.html`](./resume.html) to view the résumé in the browser. The page includes a **Print / Save as PDF** control. The Toolkit, Journey, Experience, Education and Certifications panels use self-hosted SVG backdrop artwork.
