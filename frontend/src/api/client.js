import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    if (tokens.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
        if (tokens.refresh) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: tokens.refresh,
          });
          const newTokens = {
            access: response.data.access,
            refresh: response.data.refresh || tokens.refresh,
          };
          localStorage.setItem('tokens', JSON.stringify(newTokens));
          originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
};

// Concepts API
export const conceptsAPI = {
  list: () => api.get('/concepts/'),
  detail: (slug) => api.get(`/concepts/${slug}/`),
  lessons: (slug) => api.get(`/concepts/${slug}/lessons/`),
};

// Student API
export const studentAPI = {
  progress: () => api.get('/student/progress/'),
  mastery: () => api.get('/student/mastery/'),
  achievements: () => api.get('/student/achievements/'),
  history: () => api.get('/student/history/'),
  stats: () => api.get('/student/stats/'),
  getGoals: () => api.get('/student/goals/'),
  createGoal: (data) => api.post('/student/goals/', data),
  updateGoal: (data) => api.put('/student/goals/', data),
  deleteGoal: (id) => api.delete(`/student/goals/?id=${id}`),
};

// Quiz API
export const quizAPI = {
  start: (data) => api.post('/quiz/start/', data),
  answer: (data) => api.post('/quiz/answer/', data),
  hint: (data) => api.post('/quiz/hint/', data),
  result: (id) => api.get(`/quiz/${id}/result/`),
  questions: (slug) => api.get(`/quiz/questions/${slug}/`),
};

// Tutor API
export const tutorAPI = {
  recommendation: () => api.get('/tutor/recommendation/'),
  feedback: (attemptId) => api.get(`/tutor/feedback/${attemptId}/`),
};

// Simulation API
export const simulationAPI = {
  budget: (data) => api.post('/simulations/budget/', data),
  emergencyFund: (data) => api.post('/simulations/emergency-fund/', data),
  compoundInterest: (data) => api.post('/simulations/compound-interest/', data),
  investment: (data) => api.post('/simulations/investment/', data),
  financialPlan: (data) => api.post('/simulations/financial-plan/', data),
};

export default api;
