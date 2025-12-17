import axios, { AxiosInstance, AxiosError } from 'axios';
import { AuthResponse, User } from '../types/index';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load tokens from localStorage
    const storedTokens = localStorage.getItem('auth_tokens');
    if (storedTokens) {
      const { accessToken, refreshToken } = JSON.parse(storedTokens);
      this.setTokens(accessToken, refreshToken);
    }

    // Add request interceptor
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Add response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest && !originalRequest.headers.get('X-Retry')) {
          originalRequest.headers.set('X-Retry', 'true');

          try {
            const response = await this.client.post<AuthResponse>('/auth/refresh', {
              refreshToken: this.refreshToken,
            });

            this.setTokens(response.data.accessToken, response.data.refreshToken);

            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('auth_tokens', JSON.stringify({ accessToken, refreshToken }));
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('auth_tokens');
  }

  // Auth endpoints
  signup(data: { email: string; password: string; firstName: string; lastName: string; roles: string[] }) {
    return this.client.post<AuthResponse>('/auth/signup', data);
  }

  login(data: { email: string; password: string }) {
    return this.client.post<AuthResponse>('/auth/login', data);
  }

  getProfile() {
    return this.client.get<User>('/auth/profile');
  }

  updateProfile(data: Partial<User>) {
    return this.client.put<User>('/auth/profile', data);
  }

  changePassword(data: { oldPassword: string; newPassword: string }) {
    return this.client.post('/auth/change-password', data);
  }

  // Campaign endpoints
  createCampaign(data: any) {
    return this.client.post('/campaigns', data);
  }

  getCampaigns(params?: { status?: string; category?: string; search?: string; page?: number; limit?: number }) {
    return this.client.get('/campaigns', { params });
  }

  getCampaign(id: string) {
    return this.client.get(`/campaigns/${id}`);
  }

  updateCampaign(id: string, data: any) {
    return this.client.put(`/campaigns/${id}`, data);
  }

  publishCampaign(id: string) {
    return this.client.post(`/campaigns/${id}/publish`, {});
  }

  cancelCampaign(id: string) {
    return this.client.post(`/campaigns/${id}/cancel`, {});
  }

  getCampaignStats(id: string) {
    return this.client.get(`/campaigns/${id}/stats`);
  }

  // Donation endpoints
  createDonation(campaignId: string, data: any) {
    return this.client.post(`/donations/campaign/${campaignId}`, data);
  }

  getCampaignDonations(campaignId: string) {
    return this.client.get(`/donations/campaign/${campaignId}`);
  }

  getUserDonations(page?: number, limit?: number) {
    return this.client.get('/donations/user/history', { params: { page, limit } });
  }

  getUserTotalDonated() {
    return this.client.get('/donations/user/total');
  }

  // Loan endpoints
  createLoan(data: any) {
    return this.client.post('/loans', data);
  }

  getLoans(params?: { status?: string; page?: number; limit?: number }) {
    return this.client.get('/loans', { params });
  }

  getLoan(id: string) {
    return this.client.get(`/loans/${id}`);
  }

  getUserLoans(page?: number, limit?: number) {
    return this.client.get('/loans/user/my-loans', { params: { page, limit } });
  }

  approveLoan(id: string, data: any) {
    return this.client.post(`/loans/${id}/approve`, data);
  }

  fundLoan(id: string, data: { amount: number }) {
    return this.client.post(`/loans/${id}/fund`, data);
  }

  getLoanFundings(id: string) {
    return this.client.get(`/loans/${id}/fundings`);
  }

  getLoanRepayments(id: string) {
    return this.client.get(`/loans/${id}/repayments`);
  }

  // Admin endpoints
  getDashboardStats() {
    return this.client.get('/admin/stats');
  }

  getPendingCampaigns() {
    return this.client.get('/admin/campaigns/pending');
  }

  approveCampaign(id: string) {
    return this.client.post(`/admin/campaigns/${id}/approve`, {});
  }

  rejectCampaign(id: string, data: { reason?: string }) {
    return this.client.post(`/admin/campaigns/${id}/reject`, data);
  }

  getPendingLoans() {
    return this.client.get('/admin/loans/pending');
  }

  blockUser(userId: string, data: { reason: string }) {
    return this.client.post(`/admin/users/${userId}/block`, data);
  }

  unblockUser(userId: string) {
    return this.client.post(`/admin/users/${userId}/unblock`, {});
  }

  getAuditLogs(limit?: number, offset?: number) {
    return this.client.get('/admin/audit-logs', { params: { limit, offset } });
  }
}

export const apiClient = new ApiClient();
