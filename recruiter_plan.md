# EvolvEd Recruiter & Admin Enhancement — Phased Implementation Plan

## Current State Summary

| Aspect | Status |
|--------|--------|
| **Theme** | Gold/Navy/Teal palette defined in `tailwind.config.js`. Applied well on landing page & student pages. Recruiter uses `bg-midnight`, Admin uses `bg-surface-light` (white) — inconsistent |
| **Landing Navbar** | Inline in `Layout.jsx`, functional but basic. Standalone `Navbar.jsx` exists but unused |
| **Mobile Responsiveness** | Excellent on student pages (bottom nav + drawer). **Zero mobile support** for recruiter & admin (sidebar is `hidden lg:flex`) |
| **Recruiter Sidebar** | 91 lines, desktop only, no collapse, no mobile |
| **Admin Sidebar** | 105 lines, desktop only, white bg (off-theme), no collapse, no mobile |
| **Recruiter Profile** | No profile page exists |
| **Job Posting** | `PostJob.jsx` exists but basic. DB schema has full `Job` + `JobSkill` models |
| **Candidate Matching** | Readiness score exists (609-line scoring engine). No job-specific matching yet |
| **Email** | No email library installed. No sending capability |

---

## Phase 1 — Foundation: Theme Consistency + Landing Navbar + Global Responsiveness

**Goal**: Establish a consistent visual identity and responsive framework across all pages.

### Tasks:
1. **Upgrade Landing Page Navbar** (`src/components/Layout.jsx`)
   - Extract navbar into a proper reusable component
   - Add premium styling: glass-morphism effect, gold accent border, smooth scroll-aware transitions, better typography hierarchy
   - Improve mobile hamburger menu with slide-in animation, proper navigation grouping
   - Add role-based CTA buttons (Login/Sign Up) with gold accent styling

2. **Unify Recruiter Theme** (`src/pages/RecruiterDashboard.jsx`, `src/pages/CandidateSearch.jsx`, `src/pages/PostJob.jsx`, `src/pages/CandidateProfile.jsx`)
   - Apply the same `midnight-navy` / `gold primary` / `warm-white` palette used on landing + student pages
   - Replace hardcoded colors with Tailwind theme tokens
   - Consistent card styling, typography, button styles matching student dashboard patterns

3. **Unify Admin Theme** (`src/pages/AdminDashboard.jsx`, `src/pages/ManageStudents.jsx`)
   - Same treatment as recruiter — dark sidebar, gold accents, consistent card/button styles
   - Replace the white `bg-surface-light` sidebar with `bg-secondary` dark sidebar

4. **Global Responsive Utilities**
   - Audit and fix all recruiter pages for mobile breakpoints (`sm`, `md`, `lg`)
   - Audit and fix all admin pages for mobile breakpoints
   - Ensure grids collapse properly, text scales, padding adjusts

**Files Modified**: `Layout.jsx`, `Navbar.jsx`, `RecruiterDashboard.jsx`, `CandidateSearch.jsx`, `PostJob.jsx`, `CandidateProfile.jsx`, `AdminDashboard.jsx`, `ManageStudents.jsx`, `index.css`

**Estimated Effort**: Medium-Large

---

## Phase 2 — Retractable Sidebar for Recruiter & Admin

**Goal**: Build a sidebar system matching the student sidebar's quality — collapsible on desktop, bottom nav + drawer on mobile.

### Tasks:
1. **Rebuild Recruiter Sidebar** (`src/components/RecruiterSidebar.jsx`)
   - Desktop: Collapsible width (72px collapsed / 288px expanded), collapse state persisted in localStorage
   - Mobile: Fixed bottom navigation bar (key items) + "More" slide-up drawer
   - Nav items: Dashboard, Post Job, Candidates, Profile, Reports
   - Match dark theme (`bg-secondary`), gold active indicators, smooth transitions
   - User profile row at bottom with avatar + name

2. **Rebuild Admin Sidebar** (`src/components/AdminSidebar.jsx`)
   - Same collapsible + mobile pattern as recruiter
   - Nav items: Dashboard, Students, Recruiters, Drives, Reports, Settings
   - Same dark theme treatment

3. **Create Shell Layouts** (`src/App.jsx`)
   - Create `RecruiterShell` component (similar to existing `StudentShell`) wrapping recruiter routes with persistent sidebar
   - Create `AdminShell` component wrapping admin routes with persistent sidebar
   - Update React Router to use these shells

4. **Content Area Adjustments**
   - All recruiter/admin pages: Remove inline sidebar rendering, use full content width
   - Add `pb-16 lg:pb-0` pattern on mobile for bottom nav spacing
   - Smooth margin transition when sidebar collapses/expands

**Files Modified**: `RecruiterSidebar.jsx`, `AdminSidebar.jsx`, `App.jsx`, all recruiter pages, all admin pages

**Estimated Effort**: Medium

---

## Phase 3 — Recruiter Profile Page

**Goal**: Production-ready recruiter profile with comprehensive form validation.

### Tasks:
1. **Create Recruiter Profile Page** (`src/pages/RecruiterProfile.jsx`)
   - **Personal Section**: Full name, email (read-only), phone, designation/title, bio, avatar upload (Cloudinary)
   - **Company Section**: Company name, industry, company size, headquarters location, website URL, company description, company logo upload
   - **Social Links**: LinkedIn, company careers page
   - Professional card layout with edit/view modes

2. **Form Validation** (Zod on backend, client-side validation on frontend)
   - Phone: format validation
   - Email: format + uniqueness
   - URL fields: valid URL format
   - Required fields: name, company name, designation
   - File uploads: type (image/jpeg, image/png) + size limits (2MB avatar, 5MB logo)
   - Real-time inline error messages, field-level validation on blur

3. **Backend API** (`backend/src/routes/recruiter.routes.js`, `backend/src/services/recruiter.service.js`)
   - `GET /api/recruiter/profile` — fetch profile with company data
   - `PUT /api/recruiter/profile` — update profile
   - `POST /api/recruiter/profile/avatar` — upload avatar
   - `POST /api/recruiter/profile/company-logo` — upload company logo
   - Zod validation schemas

4. **Database** — The Prisma schema already has `Recruiter` (with bio, position, avatar, linkedin) and `Company` (with all needed fields) models. May need minor additions (phone field on Recruiter).

**Files Created**: `RecruiterProfile.jsx`
**Files Modified**: `recruiter.routes.js`, `recruiter.service.js`, `RecruiterSidebar.jsx` (add Profile nav), `App.jsx` (add route), possibly `schema.prisma`

**Estimated Effort**: Medium

---

## Phase 4 — Job Posting System

**Goal**: Full job posting CRUD with comprehensive form and validation.

### Tasks:
1. **Enhance Job Posting Page** (`src/pages/PostJob.jsx`)
   - Comprehensive multi-section form:
     - **Basic Info**: Title, department, job type (full-time/part-time/internship/contract), location (on-site/remote/hybrid), salary range (min/max/currency)
     - **Description**: Rich job description, responsibilities (list), qualifications (list)
     - **Requirements**: Required skills (multi-select with proficiency level), minimum experience, education level
     - **Settings**: Application deadline, visibility (public/private/invite-only), max applications
   - Form validation (Zod): all required fields, salary min < max, deadline in future, at least 1 skill required
   - Preview mode before publishing
   - Draft save capability

2. **Job Management Dashboard** (`src/pages/RecruiterJobs.jsx` — new)
   - List all posted jobs with status badges (active/closed/draft)
   - Filter by status, sort by date/applicants
   - Quick actions: edit, close, duplicate, delete
   - Applicant count per job
   - Responsive card/table layout

3. **Backend Enhancements** (`recruiter.service.js`, `recruiter.routes.js`)
   - The DB schema already has `Job`, `JobSkill` models — use them fully
   - `POST /api/recruiter/jobs` — create job (already exists, may need enhancement)
   - `GET /api/recruiter/jobs` — list recruiter's jobs with filters
   - `PUT /api/recruiter/jobs/:id` — update job
   - `DELETE /api/recruiter/jobs/:id` — soft delete
   - `PATCH /api/recruiter/jobs/:id/status` — close/reopen

**Files Created**: `RecruiterJobs.jsx`
**Files Modified**: `PostJob.jsx`, `recruiter.routes.js`, `recruiter.service.js`, `App.jsx`, `RecruiterSidebar.jsx`

**Estimated Effort**: Medium-Large

---

## Phase 5 — Candidate Matching & Ranking Engine

**Goal**: When a recruiter clicks "Calculate" on a job, rank all applicants by how well they match the job requirements — not just readiness score.

### Tasks:
1. **Job-Specific Matching Algorithm** (`backend/src/services/matching.service.js` — new)
   - **Skill Match Score (40%)**: Compare job's required skills vs student's skills. Exact match = full points, related skill = partial. Factor in proficiency level match.
   - **Readiness Score Component (20%)**: Use existing readiness score as a baseline quality signal
   - **Experience Match (15%)**: Internship count/duration vs job's experience requirement
   - **Project Relevance (10%)**: Check if student projects use technologies required by the job
   - **Assessment Performance (10%)**: Relevant assessment scores
   - **Certification Relevance (5%)**: Certifications matching job domain
   - Output: 0-100 composite "Job Fit Score" per candidate

2. **AI Justification** (`backend/src/services/matching.service.js`)
   - After algorithmic scoring, send top candidates' data + job requirements to Groq LLM
   - Generate 2-3 sentence justification per candidate explaining WHY they're a good fit
   - Include strengths and potential gaps
   - Cache justifications in DB to avoid repeated LLM calls

3. **API Endpoints**
   - `POST /api/recruiter/jobs/:id/calculate` — trigger matching for all applicants of a job
   - `GET /api/recruiter/jobs/:id/rankings` — get ranked candidates with scores + justifications
   - Response includes: candidate info, job fit score, score breakdown, AI justification, readiness score

4. **Frontend — Job Applicants View** (`src/pages/JobApplicants.jsx` — new)
   - "Calculate Match" button (prominent, gold CTA)
   - Loading state while matching runs
   - Ranked list: candidate cards showing name, avatar, Job Fit Score (with visual bar), readiness score, top matching skills, AI justification expandable
   - Sort by: fit score, readiness score, application date
   - Filter by: minimum fit score threshold

5. **Database**: May add `JobMatchResult` model or use existing `Ranking` model to store computed scores + justifications

**Files Created**: `matching.service.js`, `JobApplicants.jsx`
**Files Modified**: `recruiter.routes.js`, `recruiter.service.js`, `App.jsx`, `RecruiterSidebar.jsx`, possibly `schema.prisma`

**Estimated Effort**: Large

---

## Phase 6 — Candidate Data Access & Email Notifications

**Goal**: Recruiter can view full candidate profiles and send shortlist notification emails.

### Tasks:
1. **Enhanced Candidate Profile View** (`src/pages/CandidateProfile.jsx`)
   - Full student data accessible to recruiter:
     - Personal info, bio, department
     - Readiness score with breakdown (radar chart)
     - Skills with proficiency levels
     - Projects (with descriptions, tech stack, links)
     - Internship history
     - Certifications
     - Assessment scores
     - LeetCode & GitHub stats
     - Events & achievements
   - Professional layout matching the theme
   - "Send Mail" and "Shortlist" action buttons
   - PDF export of candidate profile

2. **Backend — Full Candidate Data API**
   - `GET /api/recruiter/candidates/:id/full-profile` — returns comprehensive student data
   - Respect data visibility settings if any
   - Include score breakdown from `ScoreBreakdown` table

3. **Email System Setup**
   - Install Resend SDK (`resend` npm package)
   - Create email service (`backend/src/services/email.service.js`)
   - Configure Resend API key in environment
   - Create email templates:
     - **Shortlist Notification**: "Congratulations! You've been shortlisted for [Job Title] at [Company Name]. [Details]..."
     - Branded HTML template matching EvolvEd's theme (gold/navy)

4. **Send Mail Feature**
   - `POST /api/recruiter/jobs/:id/send-shortlist` — send emails to selected candidates
   - Accept: list of candidate IDs, optional custom message
   - Track email sending status in DB (sent/failed/pending)
   - Frontend: checkbox selection on ranked list, "Send Shortlist Email" button
   - Confirmation modal before sending
   - Success/failure toast notifications

5. **Criteria-Based Bulk Actions**
   - "Select all above X% fit score" quick action
   - "Select top N candidates" quick action
   - Bulk shortlist + bulk email

**Files Created**: `email.service.js`, email templates
**Files Modified**: `CandidateProfile.jsx`, `JobApplicants.jsx`, `recruiter.routes.js`, `recruiter.service.js`, `schema.prisma` (email tracking), `backend/package.json` (add resend)

**Estimated Effort**: Large

---

## Phase Summary

| Phase | Focus | Depends On | Effort |
|-------|-------|-----------|--------|
| **1** | Theme + Navbar + Responsiveness | None | Medium-Large |
| **2** | Retractable Sidebars | Phase 1 | Medium |
| **3** | Recruiter Profile | Phase 2 | Medium |
| **4** | Job Posting System | Phase 3 | Medium-Large |
| **5** | Candidate Matching + AI | Phase 4 | Large |
| **6** | Candidate Data Access + Email | Phase 5 | Large |

---

## Color Palette Reference

```
primary:           #c6a43f  (gold)
primary-dark:      #b08e30
primary-light:     #ebdcb2
background-light:  #e8e3de
background-dark:   #1f1c13
midnight-navy:     #0B1E33
warm-white:        #F9F6F0
deep-teal:         #1E5F5F
secondary:         #1e293b  (dark slate — sidebar bg)
accent:            #0d9488
surface-light:     #ffffff
text-main:         #171612
text-secondary:    #827c68
text-muted:        #64748b
```

## Tech Stack Reference

- **Frontend**: React 18, React Router 6, Tailwind CSS 3, Recharts, Axios, Vite
- **Backend**: Express 4, Prisma 5 (PostgreSQL), Groq SDK (AI), Cloudinary (uploads), JWT auth
- **Email (to add)**: Resend
- **Fonts**: Playfair Display (headings), Inter (body)
