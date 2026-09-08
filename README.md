# IDX Property Search

A Zillow-style property search application backed by real MLS (RETS) data.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React (Create React App) | 18.x |
| Routing | React Router | 6.x |
| Backend | Node.js | 24.x |
| API framework | Express | 4.x |
| Database | MySQL (Docker) | 8.x |
| DB driver | mysql2 | 3.x |
| Testing | Jest, React Testing Library, Supertest | — |
| Linting | ESLint | 9.x |

## Architecture

React (:3000) → Express API (:5000) → MySQL (:3306)


React never connects to MySQL directly. All data flows through the Express API.

## Setup

### Prerequisites

- Node.js 18+ and npm
- Docker Destop
- Git

### 1. Clone
```bash
git clone https://github.com/kquakk/idx-exchange-sde-26.git
cd idx-exchange-sde-26
```

### 2. Database

```bash
docker run -d --name idx-mysql-local \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=rets \
  -p 3306:3306 mysql:8

docker exec -i idx-mysql-local mysql -u root -prootpassword rets < path/to/rets_property.sql
docker exec -i idx-mysql-local mysql -u root -prootpassword rets < path/to/rets_openhouse.sql
```

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env  
npm run dev
```

### 4. Frontend

```bash
cd frontend
npm install
npm start
```

Create `frontend/.env`:
REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here

Open https://localhost:3000.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Database connectivity check |
| GET | `/api/properties` | Paginated, filterable, sortable listings |
| GET | `/api/properties/:id` | Single property detail |
| GET | `/api/properties/:id/openhouses` | Open house events for a property |

### Query parameters for `/api/properties`

| Param | Type | Notes |
|---|---|---|
| `limit` | integer | 1–50, default 20 |
| `offset` | integer | ≥ 0, default 0 |
| `city` | string | Case-insensitive |
| `zipcode` | string | |
| `minPrice` / `maxPrice` | number | |
| `beds` / `baths` | number | Minimum values |
| `sortBy` | enum | `price`, `dateListed`, `sqft`, `beds` |
| `sortOrder` | enum | `asc` or `desc` |

## Project Structure

backend/
├── db/pool.js MySQL connection pool
├── middleware/logger.js Request logging with timing
├── routes/properties.js Property and open house endpoints
└── server.js Express app setup

frontend/src/
├── api/ HTTP client for the backend
├── components/ Reusable UI components
├── hooks/ Custom React hooks
├── pages/ Route-level components
└── utils/ Pure helper functions

## Testing

```bash
cd frontend && npm test
cd backend && npm test
```