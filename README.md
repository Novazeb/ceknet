# ceknet

ceknet is a web-based internet network performance diagnostic and data transfer speed measurement tool. The application integrates a React-based user interface with an Express backend to provide accurate and efficient evaluations of physical connection throughput.

## Overview

Designed with an emphasis on minimalism, performance, and resource efficiency, all latency and bandwidth metrics are processed directly with native SVG path visualizations, avoiding heavy third-party charting libraries.

Connection measurements leverage Cloudflare public edge CDN endpoints for genuine wide-area network evaluation, with automatic fallback to the local server if external connections are unavailable.

## Key Features

- Latency and Jitter Measurement: Round-trip time (RTT) and latency stability variance evaluated across consecutive samples.
- Download Throughput Testing: Continuous streaming transfer rate measurement with exponential smoothing for stable readouts.
- Upload Throughput Testing: Incremental binary payload transmission to verify upstream throughput.
- Lightweight Real-Time Visualization: Dynamic SVG sparkline graph rendering bandwidth variations without browser overhead.
- Network and ISP Inspection: Identification of public IP addresses, Internet Service Providers (ISP), Autonomous System Numbers (ASN), and geographic server locations.
- Activity Suitability Analysis: Automated classification of network quality for competitive gaming, 4K video streaming, and video conferencing scenarios.
- Local Diagnostic History: Diagnostic records persisted in browser localStorage with CSV export capability.

## Directory Structure

```
ceknet/
├── client/                 # Frontend interface (React + Vite)
│   ├── src/
│   │   ├── components/     # UI components (Header, SpeedHero, MetricsPanel, TestHistory)
│   │   ├── services/       # Network testing engine (speedTestEngine.js)
│   │   ├── App.jsx         # Root component and diagnostic test flow
│   │   ├── index.css       # Tailwind CSS configuration and theme styling
│   │   └── main.jsx        # React application entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Backend service (Node.js + Express)
│   ├── index.js            # Ping, download, upload, and GeoIP endpoints
│   └── package.json
├── package.json            # Root configuration and monorepo orchestration scripts
└── README.md
```

## System Requirements

- Node.js version 18.0.0 or later
- npm version 9.0.0 or later

## Installation

1. Install dependencies across client and server directories:

```bash
cd client && npm install
cd ../server && npm install
cd ..
```

2. Alternatively, install via npm workspace flags:

```bash
npm install --prefix client
npm install --prefix server
```

## Running the Application

### Development Mode

To start both the backend API server and frontend development server concurrently:

```bash
npm run dev
```

Default addresses:
- Frontend application: `http://localhost:5173`
- Backend API server: `http://localhost:5000`

### Running Services Separately

Run the backend server:
```bash
npm run server
```

Run the frontend development server:
```bash
npm run client
```

### Production Build

To generate an optimized production build for the frontend:

```bash
npm run build
```

Compiled assets will be output to `client/dist/`.

## License

This project is distributed under the MIT License.
