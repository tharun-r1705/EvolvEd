# EvolvEd Student Dashboard - Complete Implementation Plan

## Current State Summary

- **Backend**: Fully functional Express + Prisma + PostgreSQL with real data services for students, auth, scoring, ranking, exports
- **Frontend**: 100% hardcoded/mock data on ALL dashboard pages. Only Login/Signup/OAuth actually call APIs. The `api.js` service layer exists with endpoint functions but NO page uses them
- **Database**: 20 Prisma models covering users, students, skills, projects, internships, certifications, assessments, jobs, applications, rankings, scores
- **Demo credentials**: Keep as-is (seeded data for admin@evolved.edu, arjun.kumar@student.edu, recruiter@google.com)

---

## PHASE 1: Student Profile (Complete & Production-Ready)

**Goal**: A real, usable profile page that a college student can fill out and manage with full validation.

### Backend Changes

**New/Modified Schema fields on `Student` model:**
- `githubUsername` (String, optional)
- `leetcodeUsername` (String, optional)
- `resumeUrls` (Json, optional - stores array of `{ name, url, category, uploadedAt }`)
- `linkedinPdfUrl` (String, optional)
- `avatarUrl` - already exists, wire up to Cloudinary

**New Validator rules** (`student.schema.js`):
- `githubUsername`: alphanumeric + hyphens, max 39 chars (GitHub limit)
- `leetcodeUsername`: alphanumeric + underscores, max 50 chars
- `phone`: regex for Indian mobile (+91 format) or international
- `linkedin`: must be a valid linkedin.com URL
- `website`: valid URL
- `gpa`: 0.00 to 10.00
- `expectedGrad`: month/year format
- `bio`: 20-1000 chars
- `email`: read-only (shown but not editable)
- `department` / `yearOfStudy`: from predefined lists

**New API endpoints:**
- `POST /api/student/avatar` - upload avatar to Cloudinary
- `POST /api/student/resume` - upload resume PDF to Cloudinary, store metadata in `resumeUrls` JSON
- `DELETE /api/student/resume/:index` - remove a specific resume
- `POST /api/student/linkedin-pdf` - upload LinkedIn PDF, parse with `pdf-parse` + Groq LLM to extract skills, experience, education, certifications; auto-populate profile fields

**New dependencies:**
- `cloudinary` + `multer` (backend - file upload handling)
- `pdf-parse` (backend - LinkedIn PDF text extraction)
- `groq-sdk` (backend - LLM for structured data extraction from PDF text)

### Frontend Changes

**New page: `StudentProfile.jsx`** (route: `/student/profile`)
- Tabbed layout: **Personal Info** | **Academic** | **Links & Integrations** | **Resumes**
- Each tab is a form section with inline validation, save button per section
- Real-time validation feedback (red borders, error messages below fields)
- Profile completion progress bar (calculated from filled fields)
- Avatar upload with crop/preview
- Resume management: list uploaded resumes, add new with category tag (e.g., "AI/ML", "Full Stack", "General"), delete existing
- LinkedIn PDF upload with extraction preview (show what was extracted, let student confirm/edit before saving)
- GitHub username field with "Verify" button (calls GitHub API to confirm username exists)
- LeetCode username field with "Verify" button (calls LeetCode GraphQL to confirm)

**Updated `StudentSidebar.jsx`:**
- "Skills Profile" link → `/student/profile`
- Show real user info instead of hardcoded "Comp Sci, Year 4"

**Updated `api.js`:**
- Add `studentService.uploadAvatar`, `uploadResume`, `deleteResume`, `uploadLinkedinPdf`, `updateProfile`, `getProfile`

### What You Can Test After Phase 1
- Log in as a real student (not demo) → go to Profile
- Fill out all fields, see validation errors for bad input
- Upload avatar, see it persist
- Upload 2-3 resumes with different categories
- Upload a LinkedIn PDF, see extracted data, confirm and save
- Enter GitHub/LeetCode usernames, verify they exist
- See profile completion percentage update in real-time

---

## PHASE 2: Projects, Events, Certifications Management

**Goal**: Students can CRUD their projects, internships/events, and certifications. All data feeds into the readiness score.

### Backend Changes

**Schema additions to `Project` model:**
- `githubUrl` (String, optional - link to GitHub repo)
- `techStack` (String[], replaces/extends `tags`)
- `startDate` / `endDate` (DateTime, optional)
- `status` (enum: `in_progress`, `completed`)

**Schema additions to `Certification` model:**
- `credentialId` (String, optional)
- `imageUrl` (String, optional - certificate image)

**New model: `Event`** (separate from Internship):
- `id`, `studentId`, `title`, `organizer`, `type` (hackathon/workshop/conference/competition), `date`, `description`, `achievement` (winner/participant/speaker), `certificateUrl`, `createdAt`

**Updated validators** with comprehensive rules for each entity.

**New/updated endpoints:**
- `PUT /api/student/projects/:id` - update project
- `PUT /api/student/certifications/:id` - update certification
- `CRUD /api/student/events` - full create/read/update/delete for events
- `POST /api/student/projects/:id/image` - upload project screenshot to Cloudinary

**Scoring update** (`scoring.service.js`):
- Add `events` as a new scoring component (weight ~5%, redistributed from others)
- Project scoring: factor in tech stack diversity, not just count

### Frontend Changes

**New page sections in Profile or separate sub-pages:**
- **Projects tab** (`/student/projects`): Card grid view of projects. "Add Project" modal/form with fields: title, description, tech stack (tag input), GitHub URL, live URL, screenshot upload, status, dates. Edit/Delete actions on each card.
- **Certifications tab** (`/student/certifications`): List view. Add form: name, issuer, issue date, expiry date, credential URL, credential ID, certificate image upload. Edit/Delete.
- **Events tab** (`/student/events`): Timeline view. Add form: title, organizer, type dropdown, date, description, achievement, certificate URL. Edit/Delete.

### What You Can Test After Phase 2
- Add 3-4 projects with different tech stacks, GitHub links
- Upload project screenshots
- Add certifications with credential URLs
- Add hackathon/workshop events
- See readiness score change after adding items
- Edit and delete entries
- Verify validation on all forms

---

## PHASE 3: LeetCode & GitHub Integration

**Goal**: Auto-fetch coding stats from LeetCode and project/contribution data from GitHub to build a coding profile.

### Backend Changes

**New service: `integrations.service.js`**

**LeetCode Integration:**
- Use LeetCode's public GraphQL API (`https://leetcode.com/graphql`)
- Fetch: total solved, easy/medium/hard breakdown, contest rating, streak, submission calendar, top language stats
- Store in new model: `LeetCodeProfile` (`studentId`, `username`, `totalSolved`, `easySolved`, `mediumSolved`, `hardSolved`, `contestRating`, `contestRanking`, `streak`, `submissionCalendar` (Json), `lastFetchedAt`)
- Background refresh: fetch on-demand when student visits dashboard or manually triggers, cache for 6 hours
- Rate limiting: queue requests, max 1 per student per 6 hours

**GitHub Integration:**
- Use GitHub REST API (public, no auth needed for public repos)
- Fetch: public repos count, total stars, top languages, contribution count (last year), repo list with names/descriptions/languages/stars
- Store in new model: `GitHubProfile` (`studentId`, `username`, `publicRepos`, `totalStars`, `topLanguages` (Json), `contributionCount`, `repos` (Json - top 10), `lastFetchedAt`)
- Background refresh: same as LeetCode, cache for 6 hours

**New endpoints:**
- `GET /api/student/integrations/leetcode` - fetch/return cached LeetCode data
- `POST /api/student/integrations/leetcode/refresh` - force re-fetch
- `GET /api/student/integrations/github` - fetch/return cached GitHub data
- `POST /api/student/integrations/github/refresh` - force re-fetch

**Scoring update:**
- Add `coding_practice` component (LeetCode-based, weight ~10%)
  - Formula: `min((easySolved*1 + mediumSolved*3 + hardSolved*5) / 2, 100)` (tunable)
  - Bonus for contest rating > 1500
- Add `github_activity` component (weight ~5%)
  - Formula: based on repo count, stars, contribution consistency
- Redistribute existing weights: technical_skills 25%, projects 15%, internships 15%, certifications 8%, assessments 15%, coding_practice 12%, github_activity 5%, events 5%

### Frontend Changes

**New section in dashboard: "Coding Profile"**
- LeetCode card: solved count ring chart (easy/medium/hard), contest rating, streak, submission heatmap calendar (like GitHub's green squares)
- GitHub card: repos count, stars, top languages bar chart, contribution graph, link to profile
- "Refresh" button on each card
- "Connect" flow if username not set (redirects to Profile page)

### What You Can Test After Phase 3
- Enter LeetCode username → see solved problems, contest rating, heatmap
- Enter GitHub username → see repos, stars, languages, contributions
- See readiness score update with coding/GitHub components
- Hit refresh to re-fetch latest data
- See cached data load instantly on subsequent visits

---

## PHASE 4: Student Dashboard - Real Data Integration

**Goal**: Replace ALL hardcoded mock data in `StudentDashboard.jsx` with real API data. Add loading/error/empty states.

### Backend Changes

**Update `student.service.js` → `getDashboard`:**
- Include LeetCode/GitHub summary data
- Include upcoming placement drives relevant to student
- Include learning pace metrics (see Phase 8)
- Add "random facts & interview tips" to response (see Phase 9 detail below)

### Frontend Changes

**Rewrite `StudentDashboard.jsx`:**
- `useEffect` → call `studentService.getDashboard()` on mount
- Loading skeleton UI (shimmer cards matching layout)
- Error state with retry button
- Empty states for each section ("No assessments yet - Take your first assessment")
- Real readiness score with animated circular progress ring
- Real metrics cards from API data
- Real readiness trend chart (use `recharts` library for proper dynamic charting)
- Real recent assessments list
- Real skill proficiency bars from API
- Real class rank and percentile
- Profile completion card linked to Profile page

**Install `recharts`** (lightweight React charting library) for:
- Readiness trend line/bar chart
- Score breakdown radar chart
- Assessment history line chart

**Update `AssessmentBreakdown.jsx`:**
- Use route param `:id` to fetch `studentService.getAssessmentById(id)`
- Replace all hardcoded data with API response
- Dynamic bar charts for category performance

**Updated routes in `App.jsx`:**
- Add `/student/profile`, `/student/projects`, `/student/certifications`, `/student/events`

### What You Can Test After Phase 4
- Dashboard loads with real data from backend
- See loading skeletons while data fetches
- See empty states for a fresh student with no data
- Navigate to assessment breakdown with real data
- Charts render dynamically based on actual scores
- Profile completion links to profile page

---

## PHASE 5: Resume Management & Learning Pace Assessment

**Goal**: Multi-resume support with categorization. Learning pace tracking system to assess how fast a student learns.

### Backend Changes

**Resume Management (if not fully done in Phase 1):**
- Store resume metadata in a new `Resume` model: `id`, `studentId`, `name`, `category` (ai_ml/full_stack/data_science/frontend/backend/general/custom), `url` (Cloudinary), `uploadedAt`, `isDefault`
- `GET /api/student/resumes` - list all resumes
- `POST /api/student/resumes` - upload with category
- `PUT /api/student/resumes/:id` - update name/category/default
- `DELETE /api/student/resumes/:id`

**Learning Pace System:**

The idea: Track student activity over time to calculate how quickly they're improving and acquiring new skills.

**New model: `LearningActivity`**
- `id`, `studentId`, `type` (skill_added/project_completed/cert_earned/assessment_taken/course_completed/goal_completed), `entityId`, `score` (optional), `metadata` (Json), `completedAt`

**Learning Pace Calculation** (new function in `scoring.service.js`):
- Metrics tracked:
  1. **Skill acquisition rate**: New skills added per month (rolling 3 months)
  2. **Assessment improvement rate**: Score trend over last 5 assessments
  3. **Project completion frequency**: Projects completed per month
  4. **Certification velocity**: Certs earned per quarter
  5. **Consistency score**: How many days active in last 30 days (based on activity log)
  6. **LeetCode activity**: Problems solved per week trend
- Combined into a **Learning Pace Score** (0-100): Fast Learner (>=75), Steady (50-74), Needs Push (25-49), Getting Started (<25)
- Every mutation (add skill, complete project, take assessment, solve LC problem) creates a `LearningActivity` record

**New endpoint:**
- `GET /api/student/learning-pace` - returns pace score, breakdown, trend data, comparison to peers

### Frontend Changes

**Resume section in Profile:**
- Card list of resumes with category badge, upload date, download/preview/delete actions
- "Upload Resume" button → modal with file picker + category dropdown + name field
- Visual indicator for default resume

**Learning Pace widget on dashboard:**
- Pace score with label (Fast Learner/Steady/etc.)
- Mini sparkline charts showing activity trends
- "Your pace is faster than 72% of students" comparison text
- Activity streak indicator

### What You Can Test After Phase 5
- Upload multiple resumes with different categories
- Set a default resume
- Delete/rename resumes
- See learning pace score on dashboard
- Add a few skills/projects/certs over different sessions and see pace update
- Compare learning pace label before and after activity bursts

---

## PHASE 6: AI Chatbot (Context-Aware Assistant)

**Goal**: An AI chatbot that has full access to the student's data and can answer questions, create goals, provide study guidance, and generate roadmaps.

### Backend Changes

**New dependencies:**
- `groq-sdk` (already added in Phase 1)

**New model: `ChatConversation`**
- `id`, `studentId`, `title`, `createdAt`, `updatedAt`

**New model: `ChatMessage`**
- `id`, `conversationId`, `role` (user/assistant/system), `content` (Text), `metadata` (Json - for structured actions like goal creation), `createdAt`

**New model: `StudentGoal`**
- `id`, `studentId`, `title`, `description`, `category` (technical/career/academic/personal), `targetDate`, `status` (active/completed/abandoned), `progress` (0-100), `milestones` (Json array), `createdBy` (manual/ai), `createdAt`, `updatedAt`

**New model: `Roadmap`**
- `id`, `studentId`, `title`, `description`, `targetRole`, `modules` (Json - array of modules with courses, tests, resources), `status` (active/completed/archived), `progress` (0-100), `createdAt`, `updatedAt`

**New model: `RoadmapProgress`**
- `id`, `roadmapId`, `moduleIndex`, `status` (not_started/in_progress/completed), `testScore` (optional), `completedAt`

**New service: `chatbot.service.js`:**
- System prompt builder: assembles student's full context (profile, skills, scores, projects, LeetCode stats, GitHub stats, learning pace, goals, roadmaps) into a structured system prompt
- Groq API integration with fallback across 2-3 API keys (round-robin on rate limit)
- Function calling / structured output for actions:
  - `create_goal` → creates StudentGoal record
  - `generate_roadmap` → creates Roadmap with modules (see Phase 7)
  - `update_goal_progress` → updates goal status/progress
  - `suggest_resources` → returns curated learning resources
- Conversation memory: last 20 messages per conversation for context window
- New conversation auto-titled by AI based on first message

**New endpoints:**
- `GET /api/student/chat/conversations` - list conversations
- `POST /api/student/chat/conversations` - create new conversation
- `DELETE /api/student/chat/conversations/:id` - delete conversation
- `POST /api/student/chat/conversations/:id/messages` - send message, get AI response (streamed via SSE)
- `GET /api/student/chat/conversations/:id/messages` - get message history
- `CRUD /api/student/goals` - goal management
- `GET /api/student/goals/summary` - active goals summary for dashboard

### Frontend Changes

**New component: `ChatBot.jsx`** (slide-out panel or full page at `/student/chat`)
- Conversation sidebar: list of past conversations, "New Chat" button
- Chat interface: message bubbles, typing indicator, markdown rendering for AI responses
- Streaming response display (SSE)
- Quick action buttons: "Set a Goal", "Generate Roadmap", "Analyze My Profile", "Interview Prep Tips"
- When AI creates a goal → show goal card inline in chat
- When AI generates a roadmap → show roadmap preview inline, link to full roadmap view
- Floating chat button on all student pages (bottom-right corner)

**Goals section on dashboard:**
- Active goals cards with progress bars
- Link to full goals management page

### What You Can Test After Phase 6
- Open chatbot, start a conversation
- Ask "What are my weak areas?" → AI analyzes your actual profile data
- Say "Create a goal for me to learn React in 30 days" → see goal created
- Ask "How is my LeetCode progress?" → AI references your actual LC stats
- See conversation history persist across sessions
- See active goals on dashboard

---

## PHASE 7: Roadmap Generator with Course Links & Module Tests

**Goal**: AI generates learning roadmaps with real, validated free course links. Each module has an assessment/test.

### Backend Changes

**New service: `roadmap.service.js`:**
- Roadmap generation via Groq LLM:
  - Input: student's current skills, target role/skill, timeline
  - Output: structured JSON with modules, each containing:
    - Module title, description, estimated hours
    - Learning resources: YouTube videos, freeCodeCamp courses, MDN docs, official documentation, GitHub repos (URLs from a curated allowlist of free platforms)
    - Key concepts to learn
    - Assessment questions (5-10 MCQs per module)
- **URL validation**: After AI generates links, validate each URL via HEAD request. Replace broken links with fallback resources from a curated database
- **Curated resource database**: New model `CuratedResource` with verified free course links by topic, maintained by seeding + admin additions
- **Module test system**: Each roadmap module has a generated quiz (MCQ). Student takes quiz → score stored in `RoadmapProgress`. Must score >= 60% to "complete" a module.

**New model: `CuratedResource`**
- `id`, `topic`, `title`, `url`, `platform` (youtube/freecodecamp/mdn/coursera_free/github/docs), `type` (video/article/course/project), `verified` (Boolean), `lastVerifiedAt`, `createdAt`

**New endpoints:**
- `POST /api/student/roadmaps` - generate roadmap (calls AI)
- `GET /api/student/roadmaps` - list student's roadmaps
- `GET /api/student/roadmaps/:id` - get roadmap with progress
- `POST /api/student/roadmaps/:id/modules/:moduleIndex/test` - submit module test answers
- `GET /api/student/roadmaps/:id/modules/:moduleIndex/test` - get test questions for a module
- `PATCH /api/student/roadmaps/:id/modules/:moduleIndex/status` - mark module status

### Frontend Changes

**New page: `RoadmapView.jsx`** (`/student/roadmaps/:id`)
- Visual roadmap: vertical timeline/stepper with modules
- Each module expandable: shows resources (clickable links), estimated time, progress status
- "Take Test" button per module → quiz modal with MCQs, timer, submit
- Score display after test, pass/fail indicator
- Overall roadmap progress bar at top
- "Generate New Roadmap" accessible from chatbot or roadmaps list page

**Roadmaps list page** (`/student/roadmaps`):
- Cards for each roadmap: title, target role, progress %, created date
- Filter by status (active/completed/archived)

### What You Can Test After Phase 7
- Ask chatbot to "Generate a roadmap for becoming a full stack developer in 3 months"
- See roadmap with 8-12 modules, each with real course links
- Click course links → they actually work (validated URLs)
- Take module test → answer MCQs → see score
- See roadmap progress update as you complete modules
- See readiness score factor in roadmap completion

---

## PHASE 8: Mock Interview System

**Goal**: AI-powered mock interviews based on student's resume. Supports technical, HR, and tricky questions. Uses Edge TTS for interviewer voice and Web Speech API for student responses.

### Backend Changes

**New dependencies:**
- `edge-tts` (npm package for Microsoft Edge TTS)
- `ws` or use Express SSE for audio streaming

**New model: `MockInterview`**
- `id`, `studentId`, `type` (technical/hr/behavioral/mixed), `resumeId` (which resume was used), `difficulty` (easy/medium/hard), `status` (in_progress/completed), `questions` (Json - array of Q&A), `overallScore`, `feedback` (Json), `duration` (seconds), `createdAt`, `completedAt`

**New service: `interview.service.js`:**
- **Question generation**: Use Groq LLM to analyze student's resume (fetched from Cloudinary, parsed) + profile to generate contextual interview questions
  - Technical: based on skills/projects listed in resume
  - HR/Behavioral: STAR method questions based on experiences
  - Tricky: edge cases, "what would you do if..." scenarios
- **Answer evaluation**: Send student's transcribed answer + question to LLM, get score (1-10) + detailed feedback + model answer
- **Edge TTS integration**: Convert question text to audio using `edge-tts` with male voice (`en-US-GuyNeural`), return audio buffer
- **Session management**: Track question flow, timing, scores per question

**New endpoints:**
- `POST /api/student/interviews` - start new interview (params: type, difficulty, resumeId)
- `GET /api/student/interviews/:id` - get interview details
- `GET /api/student/interviews/:id/question/:index` - get next question (text)
- `GET /api/student/interviews/:id/question/:index/audio` - get question as audio (Edge TTS)
- `POST /api/student/interviews/:id/question/:index/answer` - submit answer text, get evaluation
- `POST /api/student/interviews/:id/complete` - finish interview, get overall feedback
- `GET /api/student/interviews` - list past interviews with scores

### Frontend Changes

**New page: `MockInterview.jsx`** (`/student/interviews`)
- **Start screen**: Select interview type (Technical/HR/Behavioral/Mixed), difficulty, which resume to use. "Start Interview" button.
- **Interview screen**:
  - Interviewer avatar/visual (simple animated icon)
  - Question text displayed + audio playback (Edge TTS)
  - "Listen Again" button to replay audio
  - Student answer input: "Record" button using Web Speech API for speech-to-text, OR type answer manually
  - Real-time transcription display as student speaks
  - "Submit Answer" button → shows AI evaluation + score + model answer
  - "Next Question" to proceed
  - Progress indicator (Question 3 of 10)
  - Timer per question and overall
- **Results screen**: Overall score, per-question breakdown, strengths/weaknesses, improvement tips
- **History page**: List of past interviews with scores, filterable by type

### What You Can Test After Phase 8
- Start a mock technical interview using your uploaded resume
- Hear questions in a male voice (Edge TTS)
- Answer by speaking (speech-to-text) or typing
- Get AI feedback + score for each answer
- Complete interview, see overall report
- Try HR and behavioral types
- See interview history with improving scores over time

---

## PHASE 9: Random Facts, Interview Tips & Real-Time Market Data

**Goal**: Show trending tech data, random interview questions with answers, and motivational/educational content.

### Backend Changes

**New model: `InterviewQuestion`** (seeded + AI-generated)
- `id`, `question`, `answer`, `category` (technical/hr/behavioral/aptitude), `difficulty`, `tags` (String[]), `source`, `createdAt`

**New model: `TechTrend`**
- `id`, `title`, `description`, `category` (language/framework/tool/domain), `trendScore`, `source`, `dataPoints` (Json - historical popularity), `lastUpdatedAt`, `createdAt`

**Seed data**: 200+ curated interview questions across categories with model answers.

**New service: `trends.service.js`:**
- **Market data aggregation** (background job, runs daily):
  - GitHub Trending API: top languages, trending repos
  - Stack Overflow API: most asked tags this month
  - npm trends / PyPI stats for framework popularity
  - Store aggregated data in `TechTrend` table
- **Random facts/tips**: Curate programming facts, career tips, industry insights. Serve randomly based on student's domain/skills.

**New endpoints:**
- `GET /api/student/feed/interview-questions` - random 3-5 questions per request, optionally filtered by category/tags matching student skills
- `GET /api/student/feed/market-trends` - current tech trends, personalized to student's domain
- `GET /api/student/feed/daily-tip` - daily rotating tip/fact
- `POST /api/admin/interview-questions` - admin can add questions
- `POST /api/admin/trends/refresh` - manually trigger trend refresh

**Background job**: Use `node-cron` or simple `setInterval` to refresh trend data every 24 hours on server start.

### Frontend Changes

**Dashboard additions:**
- **"Today's Interview Question"** card: Shows 1 random question with "Show Answer" toggle. "Next Question" button. Category badge.
- **"Tech Trends"** section: Cards showing trending languages/frameworks relevant to student's skills. Mini bar chart of popularity. "Trending in your domain" header.
- **"Daily Tip"** card: Motivational or technical tip, changes daily.

**New page: `InterviewPrep.jsx`** (`/student/interview-prep`)
- Browse all interview questions by category
- Search and filter
- Bookmark questions for later review
- Practice mode: see question, think, then reveal answer

### What You Can Test After Phase 9
- See daily interview question on dashboard
- Click "Show Answer" to reveal
- See tech trends relevant to your skills
- Browse full interview question bank
- See daily tips rotate
- Admin can refresh trend data

---

## PHASE 10: Leaderboard System

**Goal**: Competitive leaderboard to motivate students. Multi-dimensional rankings.

### Backend Changes

**Extend existing `Ranking` model** or create views:
- Already have global rankings by readiness score
- Add department-wise rankings
- Add skill-specific rankings (e.g., "Top Python developers")
- Add weekly/monthly activity-based rankings (most active learners)

**New endpoint expansions:**
- `GET /api/student/leaderboard` - params: `scope` (global/department/skill/weekly), `department`, `skill`, `page`, `limit`
- Returns: rank, name, avatar, department, readiness score, highlight metric, trend (up/down/same vs last week)

**Leaderboard computation:**
- Global: by readiness score (existing)
- Department: filter by department, rank by readiness score
- Weekly active: by `LearningActivity` count in last 7 days
- Skill-specific: by proficiency in a given skill
- Anonymization option: students can opt-out of showing their name (show "Anonymous Student" + department only)

### Frontend Changes

**New page: `Leaderboard.jsx`** (`/student/leaderboard`)
- Tab bar: Global | Department | Weekly Active | By Skill
- Table: Rank (with medal icons for top 3), Avatar, Name, Department, Score, Trend arrow
- Current student highlighted in the table
- "Your Position" sticky card at top showing your rank, percentile, nearest competitors
- Skill leaderboard: dropdown to select skill, shows top students for that skill
- Weekly leaderboard resets every Monday, encourages consistent activity
- Opt-in/opt-out toggle in settings for leaderboard visibility

### What You Can Test After Phase 10
- View global leaderboard, find your position
- Switch to department view, see department-specific ranks
- Check weekly activity leaderboard
- Select a skill, see who's top in React/Python/etc.
- See trend arrows (up/down) based on rank changes
- Toggle leaderboard visibility in profile settings

---

## PHASE 11: Final Integration, Polish & Readiness Score V2

**Goal**: Everything wired together, readiness score uses all data sources, UI polished.

### Backend Changes

**Readiness Score V2** - Final weight distribution:

| Component | Weight | Data Source |
|---|---|---|
| Technical Skills | 20% | Student skills + proficiency |
| Projects | 12% | Project count + diversity |
| Internships | 12% | Internship count + duration |
| Certifications | 8% | Certification count |
| Assessments | 12% | Assessment scores |
| Coding Practice | 12% | LeetCode stats |
| GitHub Activity | 6% | Repos, stars, contributions |
| Events | 3% | Hackathons, workshops |
| Learning Pace | 8% | Activity frequency + improvement rate |
| Roadmap Progress | 4% | Module completions + test scores |
| Interview Readiness | 3% | Mock interview scores |

**Profile Completion V2**: Factor in all new fields (GitHub, LeetCode, resume uploaded, LinkedIn PDF parsed, avatar, bio, all profile fields).

### Frontend Changes

- Update dashboard to show all new score components in a radar chart
- Unified sidebar navigation with all new pages
- Consistent loading/error/empty states everywhere
- Responsive design audit (mobile-friendly)
- Performance optimization: lazy loading pages, memoization

### What You Can Test After Phase 11
- Complete readiness score reflects ALL activities
- Score breakdown shows 11 components
- Everything works end-to-end
- Mobile responsive
- No mock data anywhere for real users
- Demo credentials still work with seeded data

---

## Technical Architecture Notes

### API Key Management (Groq)
- Store 2-3 Groq API keys in `.env`: `GROQ_API_KEY_1`, `GROQ_API_KEY_2`, `GROQ_API_KEY_3`
- Round-robin rotation on 429 rate limit errors
- Exponential backoff retry logic

### File Storage (Cloudinary)
- `.env`: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Folders: `evolved/avatars/`, `evolved/resumes/`, `evolved/projects/`, `evolved/certificates/`
- Max file sizes: avatar 2MB, resume 5MB, images 5MB
- Accepted formats: avatars (jpg/png/webp), resumes (pdf), images (jpg/png/webp)

### Database Migrations
- Each phase adds new models → new Prisma migration
- Seed file updated per phase to include demo data for new models
- Existing seed data (demo credentials) untouched

### Error Handling Pattern
- All new services follow existing pattern: `AppError` classes, try/catch in controllers
- Frontend: toast notifications for errors, inline validation for forms

### New Sidebar Navigation (Final)

```
Dashboard          /student
Profile            /student/profile
Projects           /student/projects
Certifications     /student/certifications
Events             /student/events
Resumes            /student/resumes
Interview Prep     /student/interview-prep
Mock Interview     /student/interviews
Roadmaps           /student/roadmaps
Leaderboard        /student/leaderboard
AI Assistant       /student/chat  (or floating button)
```
