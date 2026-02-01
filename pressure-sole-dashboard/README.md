# Pressure Sole Analytics Dashboard

A comprehensive React + TypeScript dashboard for visualizing pressure sole analytics from bowling sessions.

## Features

- **Session Summary**: Athlete profile, session metadata, and statistics
- **Delivery Analysis**: Expandable cards for each delivery with detailed phase breakdowns
- **Phase Analysis**: 
  - What's Going Well (positive patterns)
  - What's Costing You (issues and impacts)
  - What to Do Next (actionable recommendations)
- **Training Focus**: Day-by-day training plans with specific drills
- **Raw Data Viewer**: Collapsible JSON display with copy functionality

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The dashboard will be available at `http://localhost:5173/`

## Loading Data

Place your `pressure_report.json` file in the `public` folder. The dashboard will automatically load it on startup.

## Color Scheme

Uses the ForgeOn brand colors:
- Primary Orange: `#FF6B35`
- Success Green: `#4CAF50`
- Warning Red: `#F44336`
- Info Blue: `#2196F3`

## Tech Stack

- React 18 + TypeScript
- Vite for fast development
- CSS Custom Properties for theming
- Inter font for typography

## Project Structure

```
src/
├── components/       # React components
├── types/           # TypeScript interfaces
├── utils/           # Formatters and helpers
├── styles/          # Global CSS
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Human-Readable Labels

All technical metrics are converted to understandable language:
- `ct_s` → Contact Time (ms)
- `impulse_proxy` → Force Output
- `BFC` → Back-Foot Contact
- `FFC` → Front-Foot Contact

Performance bands are color-coded from red (very low) to green (elite) to blue (very high).
