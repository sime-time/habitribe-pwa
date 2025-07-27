# HabitTribe Project Overview

This project is a full-stack application designed to help users track their habits. It's structured as a monorepo with a Vue.js PWA frontend and a Cloudflare Workers backend.

## Project Structure

-   `pwa/`: Contains the Vue.js progressive web application.
-   `backend/`: Contains the Cloudflare Worker serverless backend.

Both packages use `pnpm` for package management.

## Tech Stack

### Frontend (`pwa/`)

-   **Framework:** Vue.js 3
-   **Build Tool:** Vite (using the Rolldown bundler)
-   **Language:** TypeScript
-   **UI:** Tailwind CSS with the DaisyUI component library.
-   **Routing:** Vue Router
-   **State Management:** Pinia
-   **Charting:** Chart.js via `vue-chartjs`
-   **Validation:** Zod
-   **Linting/Formatting:** Biome
-   **PWA:** Enabled via `vite-plugin-pwa`.

### Backend (`backend/`)

-   **Runtime:** Cloudflare Workers
-   **Framework:** Hono.js
-   **Language:** TypeScript
-   **ORM:** Drizzle ORM (for Cloudflare D1)
-   **Authentication:** `better-auth`
-   **Transactional Emails:** Resend
-   **Validation:** Zod

## Key Commands

To run these commands, first `cd` into the appropriate directory (`pwa` or `backend`). The primary dependency installation command is `pnpm install`.

### Frontend (`pwa/`)

-   **Run development server:** `pnpm dev`
-   **Build for production:** `pnpm build`
-   **Format code:** `pnpm biome`
-   **Deploy to Cloudflare:** `pnpm deploy`

### Backend (`backend/`)

-   **Run development server:** `pnpm dev`
-   **Deploy to Cloudflare:** `pnpm deploy`
-   **Generate Drizzle migrations:** `pnpm d1:generate`
-   **Execute SQL file locally:** `pnpm d1:local <your-file.sql>`
-   **Execute SQL file on remote D1:** `pnpm d1:remote <your-file.sql>`
