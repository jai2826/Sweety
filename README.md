# Sweety — Blood Glucose Tracker

A small full-stack app where a diabetes patient records up to **4 blood glucose
readings a day** and views **daily and monthly reports**.

- **Backend:** Node.js + Express REST API
- **Database:** PostgreSQL via **Prisma ORM**
- **Frontend:** React (Vite) + Tailwind CSS
- **Auth:** email/password with bcrypt-hashed passwords and JWT
- **Charts:** Recharts (month-to-date trend)
- **Tests:** Vitest on the server (domain logic) and React Testing Library on the client (reading form)

---

## Features

### Required
- **Sign up / log in** — register with name, email, password; passwords stored as bcrypt hashes; each user sees only their own readings.
- **Readings CRUD** — each reading has a *date*, a *time slot* (Morning (fasting), After breakfast, After lunch, After dinner) and a *value in mg/dl*, with all validation rules below.
- **Reports** — Daily, Month-to-date and Monthly (previous month), each showing highest / lowest / average (1 decimal) / count, with a friendly empty state. The daily report also lists each reading with its slot.

### Validation rules
| Rule | Error message |
|------|---------------|
| Value is required | `Please enter a glucose value.` |
| Whole number between 40 and 600 | `Value must be between 40 and 600 mg/dl.` |
| One reading per slot per day | `You already have an After lunch reading for this date.` |
| Maximum 4 readings per day | `You can add only 4 readings per day.` |
| Date cannot be in the future | `Date cannot be in the future.` |

### Bonus implemented
- **Pagination** on `GET /readings` (`?page=1&limit=20`).
- **Chart** — a line chart of the month-to-date readings (Recharts).
- **Frontend tests** — React Testing Library tests for the reading form.

(Not attempted: Docker, Redis caching, BullMQ jobs, doctor role.)

---

## Project structure

```
Sweety/
├── server/            Express + Prisma API
│   ├── prisma/        schema.prisma, seed.js
│   ├── src/
│   │   ├── domain/    pure logic: slots, dates, validation, report math (unit-tested)
│   │   ├── lib/       prisma client, auth, errors, serializers
│   │   ├── middleware/ auth + error handling
│   │   ├── routes/    auth, readings, reports
│   │   └── app.js / index.js
│   └── tests/         Vitest unit tests
└── client/            React + Vite + Tailwind
    └── src/
        ├── components/ ReadingForm, ReadingsTable, Pagination, ReportsPanel, MonthChart, ui
        ├── context/    AuthContext
        ├── lib/        api client, slots, formatting
        └── pages/      Login, Register, Dashboard
```

---

## Prerequisites
- **Node.js 18+**
- **PostgreSQL 14+** running locally (or any reachable Postgres instance)

---

## 1. Database setup

Create an empty database (any name — the example uses `sweety`):

```sql
CREATE DATABASE sweety;
```

Then copy the server env file and point `DATABASE_URL` at your database:

```bash
cd server
cp .env.example .env
# edit .env: set DATABASE_URL and a JWT_SECRET
```

`DATABASE_URL` format:
```
postgresql://USER:PASSWORD@localhost:5432/sweety?schema=public
```

---

## 2. Run the server

```bash
cd server
npm install
npx prisma migrate dev --name init   # creates tables (first run only)
npm run seed                          # creates a demo user + sample readings
npm run dev                           # starts the API on http://localhost:4000
```

> Prefer not to create migration files? `npx prisma db push` will create the same
> schema directly. `npm run seed` is safe to re-run — it resets the demo user's data.

**Demo credentials** (from the seed):
```
email:    demo@sweety.app
password: password123
```

### API endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register, returns `{ token, user }` |
| POST | `/api/auth/login` | Log in, returns `{ token, user }` |
| GET  | `/api/auth/me` | Current user (Bearer token) |
| GET  | `/api/readings?page=&limit=` | List own readings (paginated) |
| POST | `/api/readings` | Create a reading |
| PUT  | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |
| GET  | `/api/reports?date=YYYY-MM-DD` | Daily, month-to-date and monthly reports |

All reading/report routes require an `Authorization: Bearer <token>` header.

---

## 3. Run the client

```bash
cd client
npm install
cp .env.example .env     # VITE_API_URL defaults to http://localhost:4000/api
npm run dev              # starts the app on http://localhost:5173
```

Open http://localhost:5173, log in with the demo account (or register a new one).

---

## 4. Run the tests

```bash
# server (domain logic: validation, report math, date math)
cd server && npm test

# client (reading form: validation messages + submit behaviour)
cd client && npm test
```

---

## Notes

### Assumptions
- **Dates are stored and compared as calendar days in UTC.** A reading's `date` has
  no time component, which keeps "one reading per slot per day", the future-date
  check and the report ranges unambiguous regardless of server timezone.
- **"Maximum 4 readings per day" and the 4 fixed slots reinforce each other.** Because
  there are exactly 4 slots and only one reading per slot per day, four is the natural
  cap; both rules are still enforced explicitly with their own messages.
- **Average is rounded to 1 decimal place**; highest/lowest/count are integers.
- **The month-to-date chart plots one point per day (that day's average)** so the trend
  line stays readable when a day has several readings. A shaded 70–180 mg/dl band gives
  rough context (not medical advice).
- **JWT is stored in `localStorage`** for simplicity (a fresher-level choice).
- Login returns the same error for an unknown email and a wrong password, to avoid
  leaking which emails are registered.

### What I'd improve with more time
- Move the JWT to an httpOnly cookie and add refresh tokens.
- Add API-level integration tests (supertest) against a test database, not just the
  pure-logic unit tests.
- Server-side rate limiting on auth routes.
- A proper toast/notification system instead of inline alerts, and optimistic UI updates.
- Filter the readings list by date range and slot; export to CSV.
- The remaining bonuses: Docker Compose, Redis report caching, a BullMQ reminder job,
  and the doctor role.
```
