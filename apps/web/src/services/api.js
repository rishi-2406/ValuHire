const API_BASE = `${import.meta.env.VITE_API_URL || ""}/api/v1`;

let accessToken = null;
let refreshToken = null;
let refreshPromise = null;
const listeners = new Set();

function notifyChange() {
  listeners.forEach(l => l({ accessToken, refreshToken }));
}

export function setTokens({ accessToken: at, refreshToken: rt }) {
  accessToken = at || null;
  refreshToken = rt || null;
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  if (!refreshToken) localStorage.removeItem("refreshToken");
  notifyChange();
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken || localStorage.getItem("refreshToken");
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("refreshToken");
  notifyChange();
}

export function onTokenChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;
  const rt = getRefreshToken();
  if (!rt) throw new Error("No refresh token");

  refreshPromise = (async () => {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt })
    });
    const json = await res.json();
    const data = json.data !== undefined ? json.data : json;
    if (!res.ok) throw new Error(data.message || json.message || "Refresh failed");
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken || rt });
    return data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function request(path, options = {}, _retried = false) {
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  const data = json.data !== undefined ? json.data : json;

  if (res.status === 401 && !_retried && getRefreshToken()) {
    try {
      await refreshAccessToken();
      return request(path, options, true);
    } catch (e) {
      clearTokens();
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!res.ok) {
    const errorMsg = data.error?.message || (typeof data.error === 'string' ? data.error : null) || data.message || json.error?.message || "API Error";
    const error = new Error(errorMsg);
    error.statusCode = res.status;
    error.payload = json;
    throw error;
  }
  return data;
}

export const authService = {
  async login(email, password) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  },

  async register({ name, email, password, role, companyName }) {
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role, companyName })
    });
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  },

  async logout() {
    const rt = getRefreshToken();
    try {
      if (rt) await request("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken: rt }) });
    } catch {}
    clearTokens();
  },

  async me() {
    return request("/auth/me");
  }
};

export const userService = {
  updateProfile: (data) => request("/auth/me", { method: "PATCH", body: JSON.stringify(data) })
};

export const companyService = {
  updateCompany: (data) => request("/companies/mine", { method: "PATCH", body: JSON.stringify(data) })
};

export const campaignService = {
  getPublicCampaigns: () => request("/campaigns/public"),
  getMyCampaigns: () => request("/campaigns"),
  getCampaignDetails: (id) => request(`/campaigns/${id}`),
  createCampaign: (data) => request("/campaigns", { method: "POST", body: JSON.stringify(data) }),
  updateCampaign: (id, data) => request(`/campaigns/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  createInviteLink: (campaignId, expiresAt) => request(`/campaigns/${campaignId}/invite-links`, { method: "POST", body: JSON.stringify({ expiresAt }) }),
  upsertAssessment: (campaignId, data) => request(`/campaigns/${campaignId}/assessment`, { method: "PUT", body: JSON.stringify(data) })
};

export const applicationService = {
  getMyApplications: () => request("/applications/me"),
  apply: (campaignId) => request("/applications", { method: "POST", body: JSON.stringify({ campaignId }) }),
  applyWithInvite: (token) => request("/applications/invite", { method: "POST", body: JSON.stringify({ token }) }),
  startSession: (assessmentId) => request(`/assessments/${assessmentId}/sessions`, { method: "POST" }),
  getSessionDetails: (sessionId) => request(`/assessment-sessions/${sessionId}`),
  submitMcqAnswer: (sessionId, questionId, selectedKey) =>
    request(`/assessment-sessions/${sessionId}/mcq-answers`, { method: "POST", body: JSON.stringify({ questionId, selectedKey }) }),
  submitProctorEvent: (sessionId, type, metadata) =>
    request(`/assessment-sessions/${sessionId}/proctor-events`, { method: "POST", body: JSON.stringify({ type, metadata }) }),
  finalSubmit: (sessionId, data) => request(`/assessment-sessions/${sessionId}/final-submit`, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  shortlistCandidates: (campaignId, candidateIds) =>
    request("/applications/shortlist", { method: "POST", body: JSON.stringify({ campaignId, candidateIds }) }),
  getShortlistedCandidates: (campaignId) =>
    request(`/applications/campaign/${campaignId}/shortlisted`),
  executeCode: (assessmentSessionId, codingQuestionId, code, language) =>
    request("/submissions", { method: "POST", body: JSON.stringify({ assessmentSessionId, codingQuestionId, code, language }) }),
  getSubmissionStatus: (submissionId) =>
    request(`/submissions/${submissionId}`)
};

export const submissionService = {
  submitCode: (sessionId, codingQuestionId, code, language) =>
    request("/submissions", { method: "POST", body: JSON.stringify({ sessionId, codingQuestionId, code, language }) }),
  getSubmissionStatus: (submissionId) => request(`/submissions/${submissionId}`)
};

export const interviewService = {
  // GET /interviews returns slots for the current user (recruiter or candidate)
  getMyInterviews: () => request("/interviews"),
  // POST /interviews requires { campaignId, candidateId, startsAt, endsAt }
  scheduleInterview: (data) => request("/interviews", { method: "POST", body: JSON.stringify(data) }),
  submitFeedback: (interviewId, data) => request(`/interviews/${interviewId}/feedback`, { method: "POST", body: JSON.stringify(data) }),
  getRoomByCode: (roomCode) => request(`/interviews/rooms/${roomCode}`),
  runCode: (interviewId, code, language) => request(`/interviews/${interviewId}/run`, { method: "POST", body: JSON.stringify({ code, language }) }),
  getRunJobStatus: (jobId) => request(`/interviews/jobs/${jobId}`)
};

export const resultsService = {
  // Recruiter: get all results for a specific campaign
  getCampaignResults: (campaignId) => request(`/results/campaigns/${campaignId}`),
  // Candidate: get their own result history
  getMyResults: () => request("/results/me/history"),
  // Get a specific result by ID
  getResult: (id) => request(`/results/${id}`)
};

export const adminService = {
  getCompanies: () => request("/admin/companies"),
  // PATCH /admin/companies/:id/status with { status: "APPROVED"|"PENDING"|"BANNED" }
  updateCompanyStatus: (companyId, status) =>
    request(`/admin/companies/${companyId}/status`, { method: "PATCH", body: JSON.stringify({ status: status.toUpperCase() }) }),
  getUsers: () => request("/admin/users"),
  // PATCH /admin/users/:id/status with { status: "BANNED"|"ACTIVE" }
  banUser: (userId) =>
    request(`/admin/users/${userId}/status`, { method: "PATCH", body: JSON.stringify({ status: "BANNED" }) }),
  unbanUser: (userId) =>
    request(`/admin/users/${userId}/status`, { method: "PATCH", body: JSON.stringify({ status: "ACTIVE" }) })
};

export const notificationService = {
  getAll: () => request("/notifications"),
  markRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () => request("/notifications/read-all", { method: "PATCH" })
};

