# ValuHire Frontend Design Prompts

Use these prompts with Stitch to generate UI designs for each page of the application.

---

## 1. Login Page (`/login`)

Design a modern login and registration page for a technical hiring platform called ValuHire.

**Vibe:** Clean, professional, but approachable. Think enterprise SaaS meets modern startup.

**Layout:** Split-screen design. Left side should feature the brand story with an illustration or abstract graphic representing hiring/recruitment. Right side has the login/register form with a tab toggle between Login and Create Account.

**Key elements needed:**
- Brand logo/name "ValuHire"
- Role selector (Recruiter / Candidate) with icons
- Email and password fields
- "Forgot Password?" link
- Social auth buttons (Google, GitHub) as optional secondary options
- Terms and privacy policy links at the bottom
- Error message display area
- Loading state on submit buttons

**Color direction:** Professional blues/indigos with clean whites. Accent color for primary actions.

**Feel:** Trustworthy, secure, non-intimidating. First-time users should feel confident signing up.

---

## 2. Recruiter Dashboard (`/recruiter`)

Design the main dashboard for a recruiter using the platform.

**Vibe:** Data-rich but not overwhelming. Clean analytics dashboard feel - like a modern HR tech tool.

**Layout:** Fixed sidebar navigation on the left. Top header bar with search and notifications. Main content area with cards and tables.

**Key elements needed:**
- Sidebar: Logo, navigation links (Dashboard, Campaigns, Interviews, Results), user profile at bottom with logout
- Header: Page title, search bar, notification bell, "New Campaign" button
- Metrics cards row (4 cards): Active Candidates, Assessments Completed, Interviews This Week, Integrity Flags
- Campaign Pipeline section: Table showing campaigns with columns for name, applicants, trend visualization, status badge, and actions
- Recent Interviews section: Cards showing upcoming interviews with candidate info, time, and action buttons
- Integrity Insights panel: A highlight card showing trust score and a CTA to review flagged cases

**Color direction:** Neutral grays with primary accent color for actions and highlights. Status colors (green for open, yellow for pending, red for flagged).

**Feel:** Powerful but calm. A recruiter should feel in control and organized.

---

## 3. Candidate Dashboard (`/candidate`)

Design the candidate's personal dashboard after logging in.

**Vibe:** Encouraging, clear, and motivating. Like a personal career coach interface.

**Layout:** Similar sidebar pattern (compact). Main content focused on the candidate's journey.

**Key elements needed:**
- Welcome section with user's name
- Active applications list showing status (Applied, Assessment Invited, Interview Scheduled, etc.)
- Upcoming assessments with "Start" buttons and countdown timers
- Interview schedule with dates/times and video call links
- Results history with scores and feedback
- Profile completion card encouraging them to add resume/skills

**Color direction:** Warm and encouraging. Use greens for progress, blues for information. Not too corporate.

**Feel:** Supportive and transparent. Candidates should understand exactly where they are in the process.

---

## 4. Assessment Room (`/assessment/:sessionId`)

Design the actual coding assessment interface where candidates take tests.

**Vibe:** Focus-heavy, minimal distractions. Like a professional IDE or coding platform.

**Layout:** Split view. Left side has questions/content. Right side has code editor. Top bar has timer and controls. Bottom has submit actions.

**Key elements needed:**
- Header: Assessment title, timer countdown (prominent), auto-save indicator, "Submit" button
- Question panel: Question text, examples, constraints, points value, difficulty badge
- Code editor area: Line numbers, syntax highlighting feel, language selector dropdown
- Test results panel: Show passed/failed test cases with input/output
- Proctoring indicator: "Camera active", "Screen share active" status indicators
- Sidebar with question list/navigation (if multiple questions)
- Warning/confirmation modals before submission

**Color direction:** Dark-focused or clean light theme with high contrast. Monospace fonts for code. Status colors (red for errors, green for passed).

**Feel:** Serious exam environment but not anxiety-inducing. Clear and focused.

---

## 5. Results Page (`/results`)

Design the results view showing assessment outcomes and rankings.

**Vibe:** Analytical and insightful. Data visualization focused.

**Layout:** Filterable table or card grid with summary statistics at the top.

**Key elements needed:**
- Summary stats: Average score, completion rate, top performers count
- Campaign selector/filter
- Candidate ranking table: Name, score, rank badge, time taken, status
- Score breakdown: MCQ score vs Coding score visualization
- Individual candidate detail expansion: Detailed answer review, code review, proctoring flags
- Export/Download button for results

**Color direction:** Professional with data-visualization colors. Green/red for pass/fail. Rank badges (gold, silver, bronze feel).

**Feel:** Authoritative but fair. Recruiters should trust the data presented.

---

## 6. Interviews Page (`/interviews`)

Design the interview scheduling and management interface.

**Vibe:** Calm, organized, professional. Calendar and scheduling tool aesthetic.

**Layout:** Calendar view on one side, list/schedule on the other. Or a clean list with date grouping.

**Key elements needed:**
- Calendar widget or date picker for scheduling
- Interview cards: Candidate name, role, date/time, status (Scheduled, Live, Completed, Cancelled)
- Video call action buttons (Join Call) with status indicators
- Filter by: Upcoming, Completed, Cancelled
- Interview details panel: Show related assessment, candidate info, notes section
- "Schedule Interview" button/modal
- Live indicator for ongoing interviews

**Color direction:** Calm blues and greens. Live indicator in red/coral. Completed in muted tones.

**Feel:** Organized and reassuring. Scheduling should feel easy and straightforward.

---

## 7. Admin Page (`/admin`)

Design the admin panel for platform management.

**Vibe:** Serious, authoritative, utilitarian. Enterprise admin tool aesthetic.

**Layout:** Full-width table views with sidebar for navigation between admin sections.

**Key elements needed:**
- Tab navigation: Users, Companies, System Overview
- User management table: Name, email, role, status, actions (ban/activate)
- Company management: Company name, status (Pending, Approved, Banned), recruiter count, actions
- Search and filter functionality
- Bulk action buttons
- Audit log or activity feed (optional)
- Stats overview: Total users, companies, active campaigns

**Color direction:** Dark header/sidebar. Serious reds for bans, yellows for pending, greens for approved.

**Feel:** Powerful and controlled. Admins should feel like they have full oversight.

---

## 8. 404 / Not Found Page

Design a friendly 404 error page for when users navigate to non-existent routes.

**Vibe:** Playful but professional. Should reduce user frustration, not increase it.

**Layout:** Centered single-screen design with a large illustration or animated graphic.

**Key elements needed:**
- Large 404 heading (creative typography)
- Friendly message explaining the page wasn't found
- Illustration or animated graphic (e.g., broken page, lost compass, confused character)
- "Go Back Home" primary button
- "Contact Support" secondary link
- Brand logo at top or bottom

**Color direction:** Match main brand palette but slightly muted. Use accent color for the CTA button.

**Feel:** Helpful and warm. Turn a frustrating moment into a brand-positive touchpoint.

---

## 9. Empty States

Design a series of empty state illustrations for when there's no data to show.

**Vibe:** Inviting, not sad. Empty states should feel like an opportunity, not a failure.

**Layout:** Centered content within a card or section of a page. Compact but visible.

**Key elements needed (variations):**
- **No campaigns yet:** Illustration + "Create your first campaign" + CTA button
- **No applications:** Illustration + "No applications yet" + helper text
- **No results:** Illustration + "Results will appear after candidates complete assessments" + timestamp
- **No interviews scheduled:** Illustration + "Schedule your first interview" + CTA button
- **No search results:** Illustration + "No matches found" + suggestion to adjust filters
- **Empty inbox/notifications:** Illustration + "You're all caught up" + positive tone

**Color direction:** Muted grays with single accent color. Use a friendly icon/illustration style (line art or soft gradients).

**Feel:** Encouraging and actionable. Empty is the start of something, not the end.

---

## 10. Loading States / Skeletons

Design loading and skeleton states for various content types.

**Vibe:** Smooth and non-jarring. Loading should feel fast even when it's not.

**Layout:** Replicates the actual content layout with placeholder shimmer effects.

**Key elements needed (variations):**
- **Page-level loading:** Full-screen centered spinner with brand logo and "Loading..." text
- **Card skeleton:** Gray placeholder boxes with shimmer animation
- **Table skeleton:** Row placeholders with column widths matching real data
- **Avatar skeleton:** Circular placeholder
- **Text skeleton:** Multiple lines of varying widths
- **Dashboard metrics skeleton:** 4 metric cards with shimmer
- **Assessment room loading:** Editor area placeholder with progress bar

**Color direction:** Light gray base with subtle gradient/shimmer animation. Should not be distracting.

**Feel:** Quick and fluid. The transition from skeleton to real content should be seamless.

---

## 11. Toast Notifications

Design a system of toast notification components for user feedback.

**Vibe:** Light, non-blocking, informative. Toasts should inform without demanding attention.

**Layout:** Fixed position (top-right or bottom-right) with stacking for multiple toasts. Each toast auto-dismisses after 4-5 seconds.

**Key elements needed (variations):**
- **Success toast:** Green accent + checkmark icon + message + close button
- **Error toast:** Red accent + alert icon + message + retry action button
- **Warning toast:** Yellow/amber accent + warning icon + message
- **Info toast:** Blue accent + info icon + message
- **Action toast:** E.g., "Email sent" with "Undo" action button
- **Loading toast:** Spinner + "Sending..." message
- **With description:** Title + longer description text

**Color direction:** White/light background with colored left border or icon for type. Match brand accent colors.

**Feel:** Polite and unobtrusive. Toasts whisper, they don't shout.

---

## 12. New Campaign Modal

Design a modal dialog for creating a new recruitment campaign.

**Vibe:** Focused and guided. A step-by-step feel without being too wizard-y.

**Layout:** Centered modal overlay with backdrop blur. Form fields stacked vertically.

**Key elements needed:**
- Modal title: "Create New Campaign"
- Close button (X) in top-right
- Form fields: Campaign title, description, role/position, required skills (tag input)
- Duration/schedule picker
- Assessment template selector (dropdown or cards)
- "Cancel" secondary button + "Create Campaign" primary button
- Helper text under fields
- Validation error states

**Color direction:** Clean white modal with backdrop dim. Primary button uses brand color.

**Feel:** Quick to complete. Recruiters should be able to set up a campaign in under 2 minutes.

---

## 13. Schedule Interview Modal

Design a modal for scheduling an interview with a candidate.

**Vibe:** Organized and calm. Scheduling is stressful enough; the UI shouldn't add to it.

**Layout:** Two-column modal: Left has calendar/date picker, right has time slot and details.

**Key elements needed:**
- Modal title: "Schedule Interview"
- Date picker (calendar view with available dates highlighted)
- Time slot selector (scrollable list of available times)
- Duration selector (30 min, 45 min, 60 min, custom)
- Interview type (Video, Phone, On-site)
- Attendees selector (add interviewers from team)
- Notes/agenda field (textarea)
- Time zone selector
- "Cancel" + "Schedule" buttons
- Conflict warning if slot is taken

**Color direction:** Calm blue-grays. Available slots in green, unavailable in gray, selected in primary color.

**Feel:** Confident and clear. No surprises or confusion about what was scheduled.

---

## 14. Edit Profile / Settings Modal

Design a modal or page for editing user profile and account settings.

**Vibe:** Personal and tidy. Like organizing your own workspace.

**Layout:** Tabbed interface: Profile, Account, Notifications, Privacy. Form-based input.

**Key elements needed:**
- **Profile tab:** Avatar upload, name, email, bio, skills (tag input), resume upload, social links
- **Account tab:** Change password, email preferences, connected accounts
- **Notifications tab:** Toggle switches for email/push notifications by category
- **Privacy tab:** Profile visibility settings, data export option
- Save button (sticky at bottom or top-right)
- Discard changes warning if user navigates away
- Success toast on save

**Color direction:** Neutral grays with toggle switches using brand primary color when active.

**Feel:** Personal and respectful. Users should feel in control of their information.

---

## Style Notes (Apply to all pages)

- **Typography:** Clean sans-serif (Inter or similar). Clear hierarchy with bold headings and readable body text.
- **Spacing:** Generous padding, card-based layouts with subtle shadows.
- **Interactions:** Smooth hover states, loading skeletons, subtle transitions.
- **Responsive:** Mobile-first approach, clean hamburger menu on mobile.
- **Mode:** Support both light and dark themes where applicable.