# TallyBuilder: AI-Powered Form Engine

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Prisma](https://img.shields.io/badge/Prisma-ORM-teal)
![Redis](https://img.shields.io/badge/Redis-Queue-red)

## Description

TallyBuilder is an open-source, high-performance form builder modeled after modern canvas interfaces like Tally and Typeform. It features a live drag-and-drop editor supported by an in-memory auto-saving system, real-time responsive breakpoint previewers, and a secure JWT dual-token authentication pipeline with 15-minute access expiration limits.

The core application architecture leverages an asynchronous background execution engine to process incoming user responses. By entirely decoupling high-overhead LLM data analysis tasks from user-facing threads, TallyBuilder ensures blazing-fast, static-speed UI rendering while delivering deep, instantaneous automated insights directly to the form creator's dashboard.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

## Features

- **Drag-and-Drop Form Canvas:** An intuitive visual editor allowing creators to seamlessly construct forms using custom UI components (buttons, text inputs, selectors) with real-time feedback.
- **High-Performance Auto-Saving:** Drafts are pushed immediately to a Redis cache for instantaneous UI updates, then asynchronously synchronized to the PostgreSQL database to prevent data loss without blocking the user.
- **Responsive Form Previews:** Built-in device simulators to test form layouts and responsive design across desktop, tablet, and mobile breakpoints before publishing.
- **Robust Authentication Engine:** Secure JWT-based access and refresh token architecture featuring automatic 15-minute access token rotation for seamless, uninterrupted user sessions.
- **Zero-Latency AI Analytics:** Background generation of single-form summaries and global dashboard metrics. The architecture completely decouples heavy LLM generation from the main thread so the app always feels instantaneous.

## Tech Stack

- **Framework:** Next.js (App Router, Server Actions)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Background Processing:** Redis
- **AI Integration:** Groq
- **UI Components:** Aura UI Design System, Framer Motion

## Architecture

TallyBuilder relies on a decoupled, event-driven architecture to ensure maximum performance. Here is how the core systems interact:

1. **Authentication Flow**
   - **Session Lifecycle:** When a user logs in, the server provisions a short-lived Access Token (15-minute expiration) and a secure, HttpOnly Refresh Token.
   - **Silent Regeneration:** Before an Access Token expires, client-side interceptors use the Refresh Token to silently request a new Access Token in the background, keeping the user securely authenticated without forced logouts.

2. **Editor & Auto-Save Pipeline**
   - **User Interaction:** The creator drags and drops a component onto the canvas. React state updates immediately.
   - **Instant Cache (Redis):** The new form state is fired directly to Redis. Because Redis is an in-memory datastore, this write happens in milliseconds, resulting in a lightning-fast "Saved" indicator for the user.
   - **Persistent Sync (PostgreSQL):** A background worker quietly pulls the state from Redis and commits it to the PostgreSQL database for permanent, reliable storage.

3. **Form Publishing & Ingestion**
   - **Preview & Publish:** Creators can preview the form across simulated screen sizes. Once marked as "Published," the form becomes publicly accessible via a unique URL.
   - **Data Capture:** A respondent submits the public form. The Next.js Server Action catches the payload and writes the raw matrix data safely into the Postgres `Response` table.

4. **Asynchronous AI Analytics Loop**
   - **Event Trigger:** Immediately after saving a respondent's data, the `/submit` endpoint drops a non-blocking `process-submission` payload into the Redis Queue.
   - **The Engine Room:** A background Redis Worker picks up the job, maps the new data against the form schema, and securely pings the AI Adapter (e.g., Google Gemini).
   - **Dashboard Render:** The worker writes the generated AI summary directly to the `formInsights` Postgres table. When the creator opens their dashboard, the pre-calculated metrics load instantly without waiting on an LLM API response.

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL instance
- Redis server instance

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ansh-dS/tally.git
   cd tallybuilder
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   ```
3. **Configure environment variables:**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   REDIS_URL="redis://localhost:6379"
   Groq_API_KEY="your_groq_api_key"
   DATABASE_URL="postgresql://user:password@localhost:55432/tallydb?schema=public"
   JWT_ACCESS_TOKEN_SECRET=""
   JWT_REFRESH_TOKEN_SECRET=""
   REDIS_PASSWORD=""
   POSTGRES_USER=""
   POSTGRES_PASSWORD=""
   HOST="https://localhost/"
   NEXT_PUBLIC_SHAREURL="http://localhost:3000/f/"
   ```
4. **Run database migrations:**
   ```bash
   pnpm prisma migrate dev
   pnpm prisma generate
   ```
5. **Start the application:**
   ```bash
   pnpm run dev
   ```

## Usage

Once your local environment configuration is complete and the development server is actively running, open your web browser and navigate to `http://localhost:3000` or `HostURl` to interact with the platform layout:

- **Construct via Canvas:** Use the workspace panel to drag and drop customizable UI layout components (inputs, selection grids, custom action buttons) into place while watching your progress auto-save instantly to the Redis cluster.
- **Simulate Breakpoints:** Toggle through the integrated viewport testing system to preview exactly how your layout renders across desktop, tablet, and mobile device screen configurations.
- **Publish & Ingest:** Lock in your configuration by marking the project as "Published" to generate a live, public submission route (e.g., `/f/[formId]`) where visitors can securely enter respondent metrics.
- **Extract Analytics:** Access your centralized user dashboard to review auto-generated single-form summaries and aggregated data insights, calculated quietly in the background without causing a single millisecond of layout freeze.

## Contributing

Contributions make the open-source community an incredible place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.

## License

Distributed under the MIT License. See LICENSE for more information.

## Author

Anshdeep Singh B.Sc. (Hons.) in Computer Science & Data Analytics (CSDA) at IIT Patna.

Actively sharpening technical capabilities through Cohort 2.0 (development track) and rigorous DSA preparation via Striver. Passionate about software engineering, system designing and actively seeking top-tier internships and early placement opportunities.
