# EvolvEd Backend

Express.js + PostgreSQL (Supabase) + Prisma backend for the EvolvEd Campus Placement Intelligence Platform.

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string (Transaction pooler) |
| `JWT_SECRET` | Random secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Random secret for refresh tokens (min 32 chars) |
| `FRONTEND_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |

Optional (Supabase OAuth bridge):

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |

### 3. Push schema to Supabase

```bash
npm run db:push
```

### 4. Seed demo data

```bash
npm run db:seed
```

### 5. Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`. API base: `http://localhost:5000/api`.

---

## Demo Credentials (after seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@evolved.edu | Admin@1234 |
| Student | arjun.kumar@student.edu | Student@1234 |
| Recruiter | recruiter@google.com | Recruiter@1234 |

---

## API Reference

### Auth (`/api/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register new student |
| POST | `/register/recruiter` | — | Register recruiter (requires invite token) |
| POST | `/login` | — | Login (returns `{ token, refreshToken, role, user }`) |
| POST | `/refresh` | — | Refresh access token |
| POST | `/logout` | — | Revoke refresh token |
| POST | `/logout-all` | Bearer | Revoke all sessions |
| GET | `/me` | Bearer | Get current user |
| POST | `/oauth/callback` | — | Supabase OAuth bridge |

### Student (`/api/student`) — requires `student` role

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard` | Dashboard data + readiness score |
| GET | `/readiness-score` | Full score breakdown |
| GET | `/profile` | Full profile |
| PUT | `/profile` | Update profile |
| GET | `/skills` | List skills |
| POST | `/skills` | Add skill |
| DELETE | `/skills/:skillId` | Remove skill |
| POST | `/projects` | Add project |
| DELETE | `/projects/:projectId` | Remove project |
| POST | `/internships` | Add internship |
| DELETE | `/internships/:internshipId` | Remove internship |
| POST | `/certifications` | Add certification |
| DELETE | `/certifications/:certId` | Remove certification |
| GET | `/assessments` | List assessments (paginated) |
| GET | `/assessments/:id` | Assessment detail + breakdown |
| GET | `/applications` | Job applications |
| GET | `/report/export` | Download CSV report |

### Recruiter (`/api/recruiter`) — requires `recruiter` role

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard` | Recruiter dashboard |
| GET | `/candidates` | Search candidates (filterable) |
| GET | `/candidates/export` | Download CSV of candidates |
| GET | `/candidates/:id` | Candidate profile |
| GET | `/candidates/:id/export` | Download candidate CSV report |
| POST | `/candidates/:id/shortlist` | Toggle shortlist |
| GET | `/jobs` | List recruiter's jobs |
| POST | `/jobs` | Post new job |
| GET | `/jobs/:jobId/applicants` | Job applicants |
| PATCH | `/applications/:applicationId/status` | Update application status |
| GET | `/analytics` | Hiring analytics |

### Admin (`/api/admin`) — requires `admin` role

| Method | Path | Description |
|---|---|---|
| GET | `/dashboard` | Admin dashboard |
| GET | `/students` | List all students (filterable, paginated) |
| GET | `/students/:id` | Student detail |
| PUT | `/students/:id` | Update student |
| DELETE | `/students/:id` | Soft-delete student |
| PATCH | `/users/:userId/status` | Activate/deactivate user |
| GET | `/placement-drives` | List placement drives |
| POST | `/placement-drives` | Create placement drive |
| PATCH | `/placement-drives/:id` | Update drive status |
| GET | `/recruiters` | List recruiters |
| POST | `/recruiters/invite` | Invite recruiter via token |
| GET | `/companies` | List companies |
| POST | `/companies` | Create company |
| GET | `/stats` | System statistics + audit log |
| POST | `/scores/recalculate` | Recalculate all student scores |
| GET | `/reports/generate` | Download admin CSV report |

---

## Scoring Engine

Readiness score is calculated from five weighted components:

| Component | Default Weight |
|---|---|
| Technical Skills | 30% |
| Projects | 20% |
| Internships | 20% |
| Certifications | 10% |
| Assessments | 20% |

Weights are stored in the `score_weights` table and can be updated directly in the DB.

Score is automatically recalculated whenever a student updates skills, projects, internships, certifications, or assessments.
