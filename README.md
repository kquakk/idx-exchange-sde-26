# IDX Property Search

A Zillow-style property search application backed by real MLS (RETS) data.

## Stack

- **Frontend:** React 18 (Create React App), React Router
- **Backend:** Node.js + Express
- **Database:** MySQL 8 (Docker)
- **Testing:** Jest, React Testing Library, Supertest

## Architecture

React (:3000) → Express API (:5000) → MySQL (:3306)


React never connects to MySQL directly. All data flows through the Express API.

## Setup

### 1. Database

```bash
docker run -d --name idx-mysql-local \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=rets \
  -p 3306:3306 mysql:8

docker exec -i idx-mysql-local mysql -u root -prootpassword rets < path/to/rets_property.sql
docker exec -i idx-mysql-local mysql -u root -prootpassword rets < path/to/rets_openhouse.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env  
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

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