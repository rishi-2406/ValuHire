const API_BASE = "http://localhost:4000/api/v1";

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || "API Error");
    error.statusCode = res.status;
    throw error;
  }
  return data;
}

export const authService = {
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register({ name, email, password, role, companyName }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password, role, companyName })
    });
    return handleResponse(res);
  },

  async logout(refreshToken) {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ refreshToken })
    });
    return handleResponse(res);
  },

  async refresh(refreshToken) {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ refreshToken })
    });
    return handleResponse(res);
  },

  async me() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include"
    });
    return handleResponse(res);
  }
};

export const campaignService = {
  async getPublicCampaigns() {
    const res = await fetch(`${API_BASE}/campaigns/public`);
    return handleResponse(res);
  },

  async getMyCampaigns() {
    const res = await fetch(`${API_BASE}/campaigns`, { credentials: "include" });
    return handleResponse(res);
  },

  async createCampaign(data) {
    const res = await fetch(`${API_BASE}/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateCampaign(id, data) {
    const res = await fetch(`${API_BASE}/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async createInviteLink(campaignId, expiresAt) {
    const res = await fetch(`${API_BASE}/campaigns/${campaignId}/invite-links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ expiresAt })
    });
    return handleResponse(res);
  },

  async upsertAssessment(campaignId, data) {
    const res = await fetch(`${API_BASE}/campaigns/${campaignId}/assessment`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }
};

export const applicationService = {
  async getMyApplications() {
    const res = await fetch(`${API_BASE}/applications/me`, { credentials: "include" });
    return handleResponse(res);
  },

  async apply(campaignId) {
    const res = await fetch(`${API_BASE}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ campaignId })
    });
    return handleResponse(res);
  },

  async applyWithInvite(token) {
    const res = await fetch(`${API_BASE}/applications/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token })
    });
    return handleResponse(res);
  },

  async startSession(assessmentId) {
    const res = await fetch(`${API_BASE}/assessments/${assessmentId}/sessions`, {
      method: "POST",
      credentials: "include"
    });
    return handleResponse(res);
  },

  async submitMcqAnswer(sessionId, questionId, selectedKey) {
    const res = await fetch(`${API_BASE}/assessment-sessions/${sessionId}/mcq-answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ questionId, selectedKey })
    });
    return handleResponse(res);
  },

  async submitProctorEvent(sessionId, type, metadata) {
    const res = await fetch(`${API_BASE}/assessment-sessions/${sessionId}/proctor-events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type, metadata })
    });
    return handleResponse(res);
  },

  async finalSubmit(sessionId) {
    const res = await fetch(`${API_BASE}/assessment-sessions/${sessionId}/final-submit`, {
      method: "POST",
      credentials: "include"
    });
    return handleResponse(res);
  }
};

export const submissionService = {
  async submitCode(sessionId, codingQuestionId, code, language) {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sessionId, codingQuestionId, code, language })
    });
    return handleResponse(res);
  },

  async getSubmissionStatus(submissionId) {
    const res = await fetch(`${API_BASE}/submissions/${submissionId}`, { credentials: "include" });
    return handleResponse(res);
  }
};

export const interviewService = {
  async getMyInterviews() {
    const res = await fetch(`${API_BASE}/interviews/me`, { credentials: "include" });
    return handleResponse(res);
  },

  async scheduleInterview(data) {
    const res = await fetch(`${API_BASE}/interviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }
};

export const resultsService = {
  async getCampaignResults(campaignId) {
    const res = await fetch(`${API_BASE}/results/campaign/${campaignId}`, { credentials: "include" });
    return handleResponse(res);
  },

  async getMyResults() {
    const res = await fetch(`${API_BASE}/results/me`, { credentials: "include" });
    return handleResponse(res);
  }
};

export const adminService = {
  async getCompanies() {
    const res = await fetch(`${API_BASE}/admin/companies`, { credentials: "include" });
    return handleResponse(res);
  },

  async updateCompanyStatus(companyId, status) {
    const res = await fetch(`${API_BASE}/admin/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, { credentials: "include" });
    return handleResponse(res);
  },

  async banUser(userId) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
      method: "POST",
      credentials: "include"
    });
    return handleResponse(res);
  }
};