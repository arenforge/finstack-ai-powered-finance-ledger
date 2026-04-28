import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL || 'http://localhost:5000'
});

api.interceptors.request.use(async (config) => {
  if (import.meta.env.REACT_APP_DEMO_AUTH === 'true') {
    config.headers.Authorization = 'Bearer dev-token';
    return config;
  }

  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getTransactions = (params) => api.get('/api/transactions', { params }).then((res) => res.data);
export const createTransaction = (payload) => api.post('/api/transactions', payload).then((res) => res.data);
export const updateTransaction = (id, payload) => api.put(`/api/transactions/${id}`, payload).then((res) => res.data);
export const deleteTransaction = (id) => api.delete(`/api/transactions/${id}`).then((res) => res.data);
export const getDailySummary = (date) => api.get('/api/transactions/summary/daily', { params: { date } }).then((res) => res.data);
export const getMonthlySummary = (month) => api.get('/api/transactions/summary/monthly', { params: { month } }).then((res) => res.data);
export const getAllSummary = () => api.get('/api/transactions/summary/all').then((res) => res.data);

export const getGoals = () => api.get('/api/goals').then((res) => res.data);
export const createGoal = (payload) => api.post('/api/goals', payload).then((res) => res.data);
export const updateGoal = (id, payload) => api.put(`/api/goals/${id}`, payload).then((res) => res.data);
export const deleteGoal = (id) => api.delete(`/api/goals/${id}`).then((res) => res.data);

export const getBills = () => api.get('/api/bills').then((res) => res.data);
export const createBill = (payload) => api.post('/api/bills', payload).then((res) => res.data);
export const updateBill = (id, payload) => api.put(`/api/bills/${id}`, payload).then((res) => res.data);
export const deleteBill = (id) => api.delete(`/api/bills/${id}`).then((res) => res.data);

export const askAI = (question) => api.post('/api/ai/query', { question }).then((res) => res.data);
export const getSharedBudgets = () => api.get('/api/shared-budgets').then((res) => res.data);
export const createSharedBudget = (payload) => api.post('/api/shared-budgets', payload).then((res) => res.data);

export default api;
