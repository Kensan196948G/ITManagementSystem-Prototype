import { apiClient } from './api';

export interface Incident {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  assignedTo?: string;
  reportedBy: string;
  affectedServices: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  affectedServices: string[];
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
}

export interface UpdateIncidentRequest {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  category?: string;
  assignedTo?: string;
  affectedServices?: string[];
  resolution?: string;
  impact?: 'low' | 'medium' | 'high';
  urgency?: 'low' | 'medium' | 'high';
}

export interface IncidentComment {
  id: string;
  incidentId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export interface CreateCommentRequest {
  content: string;
  isInternal: boolean;
}

export interface IncidentFilters {
  status?: string[];
  priority?: string[];
  category?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export const incidentService = {
  // Get all incidents with optional filters
  async getIncidents(filters?: IncidentFilters, page = 1, limit = 10): Promise<{
    incidents: Incident[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = {
      page,
      limit,
      ...filters,
    };
    return apiClient.get('/incidents', params);
  },

  // Get incident by ID
  async getIncident(id: string): Promise<Incident> {
    return apiClient.get(`/incidents/${id}`);
  },

  // Create new incident
  async createIncident(incident: CreateIncidentRequest): Promise<Incident> {
    return apiClient.post('/incidents', incident);
  },

  // Update incident
  async updateIncident(id: string, incident: UpdateIncidentRequest): Promise<Incident> {
    return apiClient.put(`/incidents/${id}`, incident);
  },

  // Delete incident
  async deleteIncident(id: string): Promise<void> {
    return apiClient.delete(`/incidents/${id}`);
  },

  // Assign incident to user
  async assignIncident(id: string, userId: string): Promise<Incident> {
    return apiClient.patch(`/incidents/${id}/assign`, { assignedTo: userId });
  },

  // Change incident status
  async updateStatus(id: string, status: Incident['status']): Promise<Incident> {
    return apiClient.patch(`/incidents/${id}/status`, { status });
  },

  // Resolve incident
  async resolveIncident(id: string, resolution: string): Promise<Incident> {
    return apiClient.patch(`/incidents/${id}/resolve`, { resolution });
  },

  // Close incident
  async closeIncident(id: string): Promise<Incident> {
    return apiClient.patch(`/incidents/${id}/close`);
  },

  // Get incident comments
  async getComments(incidentId: string): Promise<IncidentComment[]> {
    return apiClient.get(`/incidents/${incidentId}/comments`);
  },

  // Add comment to incident
  async addComment(incidentId: string, comment: CreateCommentRequest): Promise<IncidentComment> {
    return apiClient.post(`/incidents/${incidentId}/comments`, comment);
  },

  // Update comment
  async updateComment(incidentId: string, commentId: string, content: string): Promise<IncidentComment> {
    return apiClient.put(`/incidents/${incidentId}/comments/${commentId}`, { content });
  },

  // Delete comment
  async deleteComment(incidentId: string, commentId: string): Promise<void> {
    return apiClient.delete(`/incidents/${incidentId}/comments/${commentId}`);
  },

  // Get incident statistics
  async getStatistics(dateFrom?: string, dateTo?: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
    avgResolutionTime: number;
    slaCompliance: number;
  }> {
    const params = { dateFrom, dateTo };
    return apiClient.get('/incidents/statistics', params);
  },

  // Escalate incident
  async escalateIncident(id: string, reason: string): Promise<Incident> {
    return apiClient.patch(`/incidents/${id}/escalate`, { reason });
  },

  // Get incident history/audit log
  async getHistory(id: string): Promise<Array<{
    id: string;
    action: string;
    userId: string;
    userName: string;
    timestamp: string;
    changes: Record<string, any>;
  }>> {
    return apiClient.get(`/incidents/${id}/history`);
  },
};