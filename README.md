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

### Rules Validated
| Rule | Error message |
|------|---------------|
| Value is required | `Please enter a glucose value.` |
| Whole number between 40 and 600 | `Value must be between 40 and 600 mg/dl.` |
| One reading per slot per day | `You already have an After lunch reading for this date.` |
| Maximum 4 readings per day | `You can add only 4 readings per day.` |
| Date cannot be in the future | `Date cannot be in the future.` |

### Bonus task completed
- **Pagination** on `GET /readings` (`?page=1&limit=20`).
- **Chart** — a line chart of the month-to-date readings (Recharts).
- **Frontend tests** — React Testing Library tests for the reading form.


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

## 1. Database configuration

All the Database Creation and Setup is handled by Prisma we just need to run it.

Copy the server env file and set `DATABASE_URL` (and a `JWT_SECRET`):

```bash
cd server
cp .env.example .env
```

`DATABASE_URL` format:
```
postgresql://USER:PASSWORD@localhost:5432/sweety?schema=public
```

Instead of `sweety` right anything else if you want as the db name. 

---

## 2. Run the server

```bash
cd server
npm install
npx prisma migrate dev --name init   # creates the database + tables 
npm run seed                          # creates a demo user + sample data
npm run dev                           # starts the API on http://localhost:4000
```

> `prisma migrate dev` creates the database and all tables from `prisma/schema.prisma`,
> so there is no separate "create database" step. `npm run seed` is safe to re-run —
> it resets the demo user's data.

**Demo credentials** (saved in the seed):
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
- **Dates are stored and compared as calendar days in UTC.** 
- **Maximum 4 readings per day and the 4 fixed slots reinforce each other.** 
- **JWT is stored in `localStorage`** 
- **Login returns the same error for an wrong email or a wrong password.**

### What I'd improve with more time
- Add Reset/Forget Password Functionality
- Add a Profile Section to manage basic details of the user.
- Move the JWT to http cookie and add a referesh token.
- Rate Limited for protected routes.
- A toast notification system for optimistic UI.
- Add a export to CSV button to export the data ..
- The remaining bonuses: Docker Compose, Redis report caching, a BullMQ reminder job,
  and the doctor role.
```
