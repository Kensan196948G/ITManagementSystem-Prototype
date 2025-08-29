import { apiClient } from './api';

export interface Problem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'known_error' | 'resolved' | 'closed';
  category: string;
  assignedTo?: string;
  reportedBy: string;
  rootCause?: string;
  workaround?: string;
  solution?: string;
  relatedIncidents: string[];
  affectedServices: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateProblemRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  relatedIncidents?: string[];
  affectedServices: string[];
}

export interface UpdateProblemRequest {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'investigating' | 'known_error' | 'resolved' | 'closed';
  category?: string;
  assignedTo?: string;
  rootCause?: string;
  workaround?: string;
  solution?: string;
  relatedIncidents?: string[];
  affectedServices?: string[];
}

export interface ProblemComment {
  id: string;
  problemId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export interface CreateProblemCommentRequest {
  content: string;
  isInternal: boolean;
}

export interface ProblemFilters {
  status?: string[];
  priority?: string[];
  category?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const problemService = {
  // Get all problems with optional filters
  async getProblems(filters?: ProblemFilters, page = 1, limit = 10): Promise<{
    problems: Problem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = {
      page,
      limit,
      ...filters,
    };
    return apiClient.get('/problems', params);
  },

  // Get problem by ID
  async getProblem(id: string): Promise<Problem> {
    return apiClient.get(`/problems/${id}`);
  },

  // Create new problem
  async createProblem(problem: CreateProblemRequest): Promise<Problem> {
    return apiClient.post('/problems', problem);
  },

  // Update problem
  async updateProblem(id: string, problem: UpdateProblemRequest): Promise<Problem> {
    return apiClient.put(`/problems/${id}`, problem);
  },

  // Delete problem
  async deleteProblem(id: string): Promise<void> {
    return apiClient.delete(`/problems/${id}`);
  },

  // Assign problem to user
  async assignProblem(id: string, userId: string): Promise<Problem> {
    return apiClient.patch(`/problems/${id}/assign`, { assignedTo: userId });
  },

  // Change problem status
  async updateStatus(id: string, status: Problem['status']): Promise<Problem> {
    return apiClient.patch(`/problems/${id}/status`, { status });
  },

  // Add root cause analysis
  async addRootCause(id: string, rootCause: string): Promise<Problem> {
    return apiClient.patch(`/problems/${id}/root-cause`, { rootCause });
  },

  // Add workaround
  async addWorkaround(id: string, workaround: string): Promise<Problem> {
    return apiClient.patch(`/problems/${id}/workaround`, { workaround });
  },

  // Add solution
  async addSolution(id: string, solution: string): Promise<Problem> {
    return apiClient.patch(`/problems/${id}/solution`, { solution });
  },

  // Resolve problem
  async resolveProblem(id: string, solution: string): Promise<Problem> {
    return apiClient.patch(`/problems/${id}/resolve`, { solution });
  },

  // Close problem
  async closeProblem(id: string): Promise<Problem> {
    return apiClient.patch(`/problems/${id}/close`);
  },

  // Link incident to problem
  async linkIncident(problemId: string, incidentId: string): Promise<Problem> {
    return apiClient.patch(`/problems/${problemId}/link-incident`, { incidentId });
  },

  // Unlink incident from problem
  async unlinkIncident(problemId: string, incidentId: string): Promise<Problem> {
    return apiClient.patch(`/problems/${problemId}/unlink-incident`, { incidentId });
  },

  // Get problem comments
  async getComments(problemId: string): Promise<ProblemComment[]> {
    return apiClient.get(`/problems/${problemId}/comments`);
  },

  // Add comment to problem
  async addComment(problemId: string, comment: CreateProblemCommentRequest): Promise<ProblemComment> {
    return apiClient.post(`/problems/${problemId}/comments`, comment);
  },

  // Update comment
  async updateComment(problemId: string, commentId: string, content: string): Promise<ProblemComment> {
    return apiClient.put(`/problems/${problemId}/comments/${commentId}`, { content });
  },

  // Delete comment
  async deleteComment(problemId: string, commentId: string): Promise<void> {
    return apiClient.delete(`/problems/${problemId}/comments/${commentId}`);
  },

  // Get problem statistics
  async getStatistics(dateFrom?: string, dateTo?: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
    avgResolutionTime: number;
    knownErrors: number;
  }> {
    const params = { dateFrom, dateTo };
    return apiClient.get('/problems/statistics', params);
  },

  // Get problem history/audit log
  async getHistory(id: string): Promise<Array<{
    id: string;
    action: string;
    userId: string;
    userName: string;
    timestamp: string;
    changes: Record<string, any>;
  }>> {
    return apiClient.get(`/problems/${id}/history`);
  },

  // Convert problem to known error
  async convertToKnownError(id: string, workaround: string): Promise<Problem> {
    return apiClient.patch(`/problems/${id}/known-error`, { workaround });
  },

  // Get related incidents for a problem
  async getRelatedIncidents(id: string): Promise<Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: string;
  }>> {
    return apiClient.get(`/problems/${id}/incidents`);
  },
};