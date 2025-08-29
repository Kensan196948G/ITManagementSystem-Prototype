import { apiClient } from './api';

export interface Change {
  id: string;
  title: string;
  description: string;
  type: 'standard' | 'normal' | 'emergency' | 'major';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'submitted' | 'approved' | 'scheduled' | 'in_progress' | 'implemented' | 'reviewed' | 'closed' | 'cancelled';
  category: string;
  requestedBy: string;
  assignedTo?: string;
  approvers: string[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
  implementationPlan: string;
  backoutPlan: string;
  testPlan?: string;
  risk: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  affectedServices: string[];
  scheduledStartDate: string;
  scheduledEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  createdAt: string;
  updatedAt: string;
  closeDate?: string;
  reason?: string;
}

export interface CreateChangeRequest {
  title: string;
  description: string;
  type: 'standard' | 'normal' | 'emergency' | 'major';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  implementationPlan: string;
  backoutPlan: string;
  testPlan?: string;
  risk: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  affectedServices: string[];
  scheduledStartDate: string;
  scheduledEndDate: string;
  approvers: string[];
}

export interface UpdateChangeRequest {
  title?: string;
  description?: string;
  type?: 'standard' | 'normal' | 'emergency' | 'major';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'draft' | 'submitted' | 'approved' | 'scheduled' | 'in_progress' | 'implemented' | 'reviewed' | 'closed' | 'cancelled';
  category?: string;
  assignedTo?: string;
  implementationPlan?: string;
  backoutPlan?: string;
  testPlan?: string;
  risk?: 'low' | 'medium' | 'high';
  impact?: 'low' | 'medium' | 'high';
  affectedServices?: string[];
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  reason?: string;
}

export interface ChangeApproval {
  id: string;
  changeId: string;
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface ChangeComment {
  id: string;
  changeId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export interface CreateChangeCommentRequest {
  content: string;
  isInternal: boolean;
}

export interface ChangeFilters {
  status?: string[];
  priority?: string[];
  type?: string[];
  category?: string;
  assignedTo?: string;
  requestedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const changeService = {
  // Get all changes with optional filters
  async getChanges(filters?: ChangeFilters, page = 1, limit = 10): Promise<{
    changes: Change[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = {
      page,
      limit,
      ...filters,
    };
    return apiClient.get('/changes', params);
  },

  // Get change by ID
  async getChange(id: string): Promise<Change> {
    return apiClient.get(`/changes/${id}`);
  },

  // Create new change request
  async createChange(change: CreateChangeRequest): Promise<Change> {
    return apiClient.post('/changes', change);
  },

  // Update change request
  async updateChange(id: string, change: UpdateChangeRequest): Promise<Change> {
    return apiClient.put(`/changes/${id}`, change);
  },

  // Delete change request
  async deleteChange(id: string): Promise<void> {
    return apiClient.delete(`/changes/${id}`);
  },

  // Submit change for approval
  async submitChange(id: string): Promise<Change> {
    return apiClient.patch(`/changes/${id}/submit`);
  },

  // Assign change to user
  async assignChange(id: string, userId: string): Promise<Change> {
    return apiClient.patch(`/changes/${id}/assign`, { assignedTo: userId });
  },

  // Update change status
  async updateStatus(id: string, status: Change['status']): Promise<Change> {
    return apiClient.patch(`/changes/${id}/status`, { status });
  },

  // Approve change
  async approveChange(id: string, comments?: string): Promise<ChangeApproval> {
    return apiClient.patch(`/changes/${id}/approve`, { comments });
  },

  // Reject change
  async rejectChange(id: string, comments: string): Promise<ChangeApproval> {
    return apiClient.patch(`/changes/${id}/reject`, { comments });
  },

  // Schedule change
  async scheduleChange(id: string, startDate: string, endDate: string): Promise<Change> {
    return apiClient.patch(`/changes/${id}/schedule`, {
      scheduledStartDate: startDate,
      scheduledEndDate: endDate,
    });
  },

  // Start implementation
  async startImplementation(id: string): Promise<Change> {
    return apiClient.patch(`/changes/${id}/start`);
  },

  // Complete implementation
  async completeImplementation(id: string): Promise<Change> {
    return apiClient.patch(`/changes/${id}/complete`);
  },

  // Close change
  async closeChange(id: string, reason?: string): Promise<Change> {
    return apiClient.patch(`/changes/${id}/close`, { reason });
  },

  // Cancel change
  async cancelChange(id: string, reason: string): Promise<Change> {
    return apiClient.patch(`/changes/${id}/cancel`, { reason });
  },

  // Execute backout plan
  async executeBackout(id: string, reason: string): Promise<Change> {
    return apiClient.patch(`/changes/${id}/backout`, { reason });
  },

  // Get change approvals
  async getApprovals(changeId: string): Promise<ChangeApproval[]> {
    return apiClient.get(`/changes/${changeId}/approvals`);
  },

  // Get change comments
  async getComments(changeId: string): Promise<ChangeComment[]> {
    return apiClient.get(`/changes/${changeId}/comments`);
  },

  // Add comment to change
  async addComment(changeId: string, comment: CreateChangeCommentRequest): Promise<ChangeComment> {
    return apiClient.post(`/changes/${changeId}/comments`, comment);
  },

  // Update comment
  async updateComment(changeId: string, commentId: string, content: string): Promise<ChangeComment> {
    return apiClient.put(`/changes/${changeId}/comments/${commentId}`, { content });
  },

  // Delete comment
  async deleteComment(changeId: string, commentId: string): Promise<void> {
    return apiClient.delete(`/changes/${changeId}/comments/${commentId}`);
  },

  // Get change statistics
  async getStatistics(dateFrom?: string, dateTo?: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    successRate: number;
    avgImplementationTime: number;
    pendingApprovals: number;
  }> {
    const params = { dateFrom, dateTo };
    return apiClient.get('/changes/statistics', params);
  },

  // Get change calendar
  async getCalendar(dateFrom: string, dateTo: string): Promise<Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    priority: string;
    scheduledStartDate: string;
    scheduledEndDate: string;
    assignedTo?: string;
  }>> {
    return apiClient.get('/changes/calendar', { dateFrom, dateTo });
  },

  // Get change history/audit log
  async getHistory(id: string): Promise<Array<{
    id: string;
    action: string;
    userId: string;
    userName: string;
    timestamp: string;
    changes: Record<string, any>;
  }>> {
    return apiClient.get(`/changes/${id}/history`);
  },

  // Get change advisory board (CAB) meetings
  async getCabMeetings(dateFrom?: string, dateTo?: string): Promise<Array<{
    id: string;
    date: string;
    changes: string[];
    attendees: string[];
    status: 'scheduled' | 'completed' | 'cancelled';
  }>> {
    const params = { dateFrom, dateTo };
    return apiClient.get('/changes/cab-meetings', params);
  },
};