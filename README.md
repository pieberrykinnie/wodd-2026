# WinLocate (WODD 2026)

**Winnipeg Open Data Datathon 2026**

WinLocate is a full-stack data platform designed to prove why companies should relocate to Winnipeg. Built for the Winnipeg Open Data Datathon 2026, the application leverages open data (via Socrata) and AI to provide city comparisons, interactive zoning maps, budget calculators, and comprehensive relocation planning.

## 🚀 Features

* **Interactive Relocation Intelligence:** Compare Winnipeg with other reference cities using live data and analytics.
* **Geospatial Visualization:** Interactive maps featuring zones, commute data, and city hotspots.
* **Budget & Cost Calculators:** Tools to estimate relocation costs, simulate budgets, and visualize savings using interactive charts.
* **Data Export & Reporting:** Generate downloadable financial tables and PDF reports.
* **AI-Powered Planning:** Integrates with Groq to provide intelligent onboarding and tailored relocation plans.

## 💻 Tech Stack

### Frontend

* **Framework:** Next.js 16 (React 19)
* **Styling & UI:** TailwindCSS v4, Radix UI, Framer Motion, Lucide React
* **Maps & Charts:** Mapbox GL, React Map GL, Chart.js
* **State Management:** Zustand
* **Utilities:** jsPDF, PapaParse, XLSX, DOMPurify

### Backend

* **Framework:** FastAPI (Python 3.12+)
* **LLM Integration:** Groq
* **Data & Web Scraping:** BeautifulSoup4, lxml, HTTPX
* **Document Parsing:** PyPDF, python-docx
* **Configuration:** Pydantic Settings

## 📂 Project Structure

* `/frontend` - The Next.js web application.
* `/backend` - The Python/FastAPI server handling data processing, open data integration (Socrata), and API routes.
* `/notebook` - Data science scripts, deploy scripts, and Jupyter notebooks for initial exploration.

## 🛠 Getting Started

### Prerequisites

* Node.js (v20+)
* Python (v3.12+)
* [uv](https://github.com/astral-sh/uv) (Python package manager, recommended based on project locks)

### 1. Running the Backend

The backend pre-fetches open data from Socrata on startup and serves the APIs required by the frontend.

```bash
# Navigate to the backend directory
cd backend

# Install dependencies and run the server using uv
uv sync
uv run fastapi dev
```

*The backend server will typically start at `http://127.0.0.1:8000`.*
*You can view the interactive API documentation at `http://127.0.0.1:8000/docs`.*

### 2. Running the Frontend

The frontend is a standard Next.js application.

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (npm, yarn, pnpm, or bun can be used)
npm install

# Start the development server
npm run dev
```

*Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.*

## 📜 License

This project is licensed under the terms found in the `LICENSE` file in the root directory.