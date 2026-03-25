/**
 * utils/api.js – WalletWise Centralised API Client
 *
 * All HTTP requests live here so components call clean functions instead
 * of writing raw fetch() calls.  If the base URL changes, update API_BASE.
 */

const API_BASE = 'http://localhost:3000/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const request = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }
  return data;
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export const login = ({ username, password }) =>
  request(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

export const register = (username, password, email) =>
  request(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  });

// ── Reference Data ────────────────────────────────────────────────────────────

/** GET /api/reference-data/income-types */
export const getIncomeTypes = () =>
  request(`${API_BASE}/reference-data/income-types`);

/** GET /api/reference-data/expense-types */
export const getExpenseTypes = () =>
  request(`${API_BASE}/reference-data/expense-types`);

// ── Income ────────────────────────────────────────────────────────────────────

/**
 * GET /api/income
 * @param {string} token
 * @param {{ type_id?, from?, to?, limit?, offset? }} [filters]
 */
export const getIncome = (token, filters = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''))
  ).toString();
  const incomeUrl = q ? `${API_BASE}/income?${q}` : `${API_BASE}/income`;
  return request(incomeUrl, { headers: authHeaders(token) });
};

/** GET /api/income/:id */
export const getIncomeById = (id, token) =>
  request(`${API_BASE}/income/${id}`, { headers: authHeaders(token) });

/** POST /api/income */
export const createIncome = (body, token) =>
  request(`${API_BASE}/income`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

/** PUT /api/income/:id */
export const updateIncome = (id, body, token) =>
  request(`${API_BASE}/income/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

/** DELETE /api/income/:id */
export const deleteIncome = (id, token) =>
  request(`${API_BASE}/income/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

// ── Expense ───────────────────────────────────────────────────────────────────

/**
 * GET /api/expense
 * @param {string} token
 * @param {{ type_id?, from?, to?, limit?, offset? }} [filters]
 */
export const getExpenses = (token, filters = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''))
  ).toString();
  const expenseUrl = q ? `${API_BASE}/expense?${q}` : `${API_BASE}/expense`;
  return request(expenseUrl, { headers: authHeaders(token) });
};

/** GET /api/expense/:id */
export const getExpenseById = (id, token) =>
  request(`${API_BASE}/expense/${id}`, { headers: authHeaders(token) });

/** POST /api/expense */
export const createExpense = (body, token) =>
  request(`${API_BASE}/expense`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

/** PUT /api/expense/:id */
export const updateExpense = (id, body, token) =>
  request(`${API_BASE}/expense/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

/** DELETE /api/expense/:id */
export const deleteExpense = (id, token) =>
  request(`${API_BASE}/expense/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

// ── Balance ───────────────────────────────────────────────────────────────────

/** GET /api/balance – live balance row */
export const getLiveBalance = (token) =>
  request(`${API_BASE}/balance`, { headers: authHeaders(token) });

/** GET /api/balance/trend?days=30 */
export const getBalanceTrend = (token, days = 30) =>
  request(`${API_BASE}/balance/trend?days=${days}`, { headers: authHeaders(token) });

// ── Dashboard ─────────────────────────────────────────────────────────────────

/** GET /api/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD */
export const getDashboard = (token, filters = {}) => {
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
  ).toString();
  const dashUrl = q ? `${API_BASE}/dashboard?${q}` : `${API_BASE}/dashboard`;
  return request(dashUrl, { headers: authHeaders(token) });
};

// ── Users (admin) ─────────────────────────────────────────────────────────────

export const getUsers = (token) =>
  request(`${API_BASE}/users`, { headers: authHeaders(token) });

export const getUserById = (id, token) =>
  request(`${API_BASE}/users/${id}`, { headers: authHeaders(token) });

export const updateUser = (id, user, token) =>
  request(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(user),
  });

export const deleteUser = (id, token) =>
  request(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
