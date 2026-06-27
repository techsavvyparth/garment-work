import axios from 'axios';

// Toggle to run in pure client-side mock database demo mode
const IS_DEMO = true; 

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Attach token for backend mode
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors for backend mode
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ==========================================
// CLIENT-SIDE MOCK DATABASE IMPLEMENTATION
// ==========================================

const getDB = (key, defaultVal = []) => {
  const data = localStorage.getItem(`db_${key}`);
  if (!data) {
    localStorage.setItem(`db_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  return JSON.parse(data);
};

const saveDB = (key, data) => {
  localStorage.setItem(`db_${key}`, JSON.stringify(data));
};

const seedDemoData = () => {
  // 1. Users
  getDB('users', [
    {
      _id: 'demo-admin-id',
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: 'admin123',
      companyName: 'Shree Enterprises',
      role: 'admin'
    }
  ]);
  
  // 2. Ladies
  getDB('ladies', [
    {
      _id: 'lady-sneha-id',
      name: 'Sneha',
      mobile: '9876543210',
      address: 'Near Temple Area',
      status: 'active',
      notes: 'Expert in stitching'
    },
    {
      _id: 'lady-pooja-id',
      name: 'Pooja',
      mobile: '9988776655',
      address: 'Vikas Nagar',
      status: 'active',
      notes: 'Handles heavy designs'
    }
  ]);

  // 3. Works
  getDB('works', [
    {
      _id: 'work-1',
      lady: 'lady-sneha-id',
      workType: 'Stitching',
      quantity: 500,
      rate: 2,
      totalAmount: 1000,
      date: new Date().toISOString(),
      notes: 'June batch',
      paymentStatus: 'pending',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    },
    {
      _id: 'work-2',
      lady: 'lady-pooja-id',
      workType: 'Embroidery',
      quantity: 200,
      rate: 5,
      totalAmount: 1000,
      date: new Date().toISOString(),
      notes: 'Festive wear',
      paymentStatus: 'paid',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    }
  ]);

  // 4. Payments
  getDB('payments', [
    {
      _id: 'payment-1',
      lady: 'lady-pooja-id',
      amount: 1000,
      date: new Date().toISOString(),
      paymentMethod: 'Cash',
      notes: 'Embroidery batch payment'
    }
  ]);
};

if (IS_DEMO) {
  seedDemoData();
}

const uuid = () => Math.random().toString(36).substring(2, 15);
const mockRes = (data) => Promise.resolve({ data });
const mockErr = (message, status = 400) => {
  const err = new Error(message);
  err.response = { status, data: { success: false, message } };
  return Promise.reject(err);
};

const getLoggedUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// ==========================================
// API ENDPOINTS EXPORT
// ==========================================

export const authAPI = IS_DEMO ? {
  login: (data) => {
    const users = getDB('users');
    const user = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (!user || user.password !== data.password) {
      return mockErr('Invalid email or password', 401);
    }
    const { password: _, ...safeUser } = user;
    localStorage.setItem('token', 'mock-demo-jwt-token');
    localStorage.setItem('user', JSON.stringify(safeUser));
    return mockRes({ success: true, token: 'mock-demo-jwt-token', user: safeUser });
  },
  register: (data) => {
    const users = getDB('users');
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return mockErr('Email already registered', 400);
    }
    const newUser = {
      _id: uuid(),
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      companyName: data.companyName || 'My Company',
      role: 'admin'
    };
    users.push(newUser);
    saveDB('users', users);
    const { password: _, ...safeUser } = newUser;
    localStorage.setItem('token', 'mock-demo-jwt-token');
    localStorage.setItem('user', JSON.stringify(safeUser));
    return mockRes({ success: true, token: 'mock-demo-jwt-token', user: safeUser });
  },
  getMe: () => {
    const user = getLoggedUser();
    if (!user) return mockErr('Unauthorized', 401);
    return mockRes({ success: true, user });
  },
  updateProfile: (data) => {
    const user = getLoggedUser();
    if (!user) return mockErr('Unauthorized', 401);
    const users = getDB('users');
    const idx = users.findIndex(u => u._id === user._id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...data };
      saveDB('users', users);
      const { password: _, ...safeUser } = users[idx];
      localStorage.setItem('user', JSON.stringify(safeUser));
      return mockRes({ success: true, user: safeUser });
    }
    return mockErr('User not found', 404);
  },
  changePassword: (data) => {
    const user = getLoggedUser();
    if (!user) return mockErr('Unauthorized', 401);
    const users = getDB('users');
    const idx = users.findIndex(u => u._id === user._id);
    if (idx !== -1) {
      if (users[idx].password !== data.currentPassword) {
        return mockErr('Current password is incorrect', 400);
      }
      users[idx].password = data.newPassword;
      saveDB('users', users);
      return mockRes({ success: true, message: 'Password updated' });
    }
    return mockErr('User not found', 404);
  }
} : {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

export const ladiesAPI = IS_DEMO ? {
  getAll: (params) => {
    let ladies = getDB('ladies');
    if (params?.search) {
      const q = params.search.toLowerCase();
      ladies = ladies.filter(l => l.name.toLowerCase().includes(q) || l.mobile.includes(q));
    }
    if (params?.status) {
      ladies = ladies.filter(l => l.status === params.status);
    }
    return mockRes({ success: true, data: ladies });
  },
  getById: (id) => {
    const ladies = getDB('ladies');
    const lady = ladies.find(l => l._id === id);
    if (!lady) return mockErr('Lady not found', 404);
    return mockRes({ success: true, data: lady });
  },
  create: (data) => {
    const ladies = getDB('ladies');
    const newLady = {
      _id: uuid(),
      ...data,
      status: data.status || 'active',
      createdAt: new Date().toISOString()
    };
    ladies.push(newLady);
    saveDB('ladies', ladies);
    return mockRes({ success: true, data: newLady });
  },
  update: (id, data) => {
    const ladies = getDB('ladies');
    const idx = ladies.findIndex(l => l._id === id);
    if (idx === -1) return mockErr('Lady not found', 404);
    ladies[idx] = { ...ladies[idx], ...data, updatedAt: new Date().toISOString() };
    saveDB('ladies', ladies);
    return mockRes({ success: true, data: ladies[idx] });
  },
  delete: (id) => {
    const ladies = getDB('ladies');
    const idx = ladies.findIndex(l => l._id === id);
    if (idx === -1) return mockErr('Lady not found', 404);
    const deleted = ladies[idx];
    ladies.splice(idx, 1);
    saveDB('ladies', ladies);
    return mockRes({ success: true, data: deleted });
  }
} : {
  getAll: (params) => api.get('/ladies', { params }),
  getById: (id, params) => api.get(`/ladies/${id}`, { params }),
  create: (data) => api.post('/ladies', data),
  update: (id, data) => api.put(`/ladies/${id}`, data),
  delete: (id) => api.delete(`/ladies/${id}`),
};

export const workAPI = IS_DEMO ? {
  getAll: (params) => {
    let works = getDB('works');
    if (params?.lady) {
      works = works.filter(w => w.lady === params.lady);
    }
    if (params?.month) {
      works = works.filter(w => Number(w.month) === Number(params.month));
    }
    if (params?.year) {
      works = works.filter(w => Number(w.year) === Number(params.year));
    }
    const ladies = getDB('ladies');
    const populated = works.map(w => ({
      ...w,
      ladyDetails: ladies.find(l => l._id === w.lady) || { name: 'Unknown' }
    }));
    return mockRes({ success: true, data: populated });
  },
  create: (data) => {
    const works = getDB('works');
    const newWork = {
      _id: uuid(),
      ...data,
      totalAmount: Number(data.quantity) * Number(data.rate),
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };
    works.push(newWork);
    saveDB('works', works);
    return mockRes({ success: true, data: newWork });
  },
  update: (id, data) => {
    const works = getDB('works');
    const idx = works.findIndex(w => w._id === id);
    if (idx === -1) return mockErr('Work entry not found', 404);
    works[idx] = { 
      ...works[idx], 
      ...data, 
      totalAmount: Number(data.quantity || works[idx].quantity) * Number(data.rate || works[idx].rate),
      updatedAt: new Date().toISOString() 
    };
    saveDB('works', works);
    return mockRes({ success: true, data: works[idx] });
  },
  delete: (id) => {
    const works = getDB('works');
    const idx = works.findIndex(w => w._id === id);
    if (idx === -1) return mockErr('Work entry not found', 404);
    const deleted = works[idx];
    works.splice(idx, 1);
    saveDB('works', works);
    return mockRes({ success: true, data: deleted });
  },
  getTypes: () => {
    const works = getDB('works');
    const types = [...new Set(works.map(w => w.workType))];
    const defaultTypes = ['Stitching', 'Embroidery', 'Folding', 'Packing', 'Cutting'];
    const allTypes = [...new Set([...defaultTypes, ...types])].filter(Boolean);
    return mockRes({ success: true, data: allTypes });
  }
} : {
  getAll: (params) => api.get('/work', { params }),
  create: (data) => api.post('/work', data),
  update: (id, data) => api.put(`/work/${id}`, data),
  delete: (id) => api.delete(`/work/${id}`),
  getTypes: () => api.get('/work/types/list'),
};

export const paymentAPI = IS_DEMO ? {
  getAll: (params) => {
    let payments = getDB('payments');
    if (params?.lady) {
      payments = payments.filter(p => p.lady === params.lady);
    }
    const ladies = getDB('ladies');
    const populated = payments.map(p => ({
      ...p,
      ladyDetails: ladies.find(l => l._id === p.lady) || { name: 'Unknown' }
    }));
    return mockRes({ success: true, data: populated });
  },
  create: (data) => {
    const payments = getDB('payments');
    const newPayment = {
      _id: uuid(),
      ...data,
      amount: Number(data.amount),
      createdAt: new Date().toISOString()
    };
    payments.push(newPayment);
    saveDB('payments', payments);
    
    // Mark pending works as paid for this lady
    const works = getDB('works');
    const ladyWorks = works.filter(w => w.lady === data.lady && w.paymentStatus !== 'paid');
    let balance = Number(data.amount);
    for (const w of ladyWorks) {
      if (balance <= 0) break;
      w.paymentStatus = 'paid';
    }
    saveDB('works', works);

    return mockRes({ success: true, data: newPayment });
  },
  update: (id, data) => {
    const payments = getDB('payments');
    const idx = payments.findIndex(p => p._id === id);
    if (idx === -1) return mockErr('Payment not found', 404);
    payments[idx] = { ...payments[idx], ...data, amount: Number(data.amount || payments[idx].amount), updatedAt: new Date().toISOString() };
    saveDB('payments', payments);
    return mockRes({ success: true, data: payments[idx] });
  },
  delete: (id) => {
    const payments = getDB('payments');
    const idx = payments.findIndex(p => p._id === id);
    if (idx === -1) return mockErr('Payment not found', 404);
    const deleted = payments[idx];
    payments.splice(idx, 1);
    saveDB('payments', payments);
    return mockRes({ success: true, data: deleted });
  }
} : {
  getAll: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

export const reportsAPI = IS_DEMO ? {
  getDashboard: () => {
    const ladies = getDB('ladies');
    const works = getDB('works');
    const payments = getDB('payments');

    const ladyCount = ladies.filter(l => l.status === 'active').length;
    
    const totalWorkAmount = works.reduce((sum, w) => sum + Number(w.totalAmount || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalPending = Math.max(0, totalWorkAmount - totalPaid);

    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();
    const currentMonthWork = works
      .filter(w => Number(w.month) === curMonth && Number(w.year) === curYear)
      .reduce((sum, w) => sum + Number(w.totalAmount || 0), 0);

    const monthlyChart = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const monthWork = works
        .filter(w => Number(w.month) === m && Number(w.year) === y)
        .reduce((sum, w) => sum + Number(w.totalAmount || 0), 0);
      monthlyChart.push({
        _id: { month: m, year: y },
        work: monthWork
      });
    }

    const pendingLadies = ladies.map(l => {
      const ladyWorks = works.filter(w => w.lady === l._id);
      const ladyPayments = payments.filter(p => p.lady === l._id);
      const totalEarned = ladyWorks.reduce((sum, w) => sum + Number(w.totalAmount || 0), 0);
      const totalPaidLady = ladyPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const pendingAmount = Math.max(0, totalEarned - totalPaidLady);
      return {
        _id: l._id,
        name: l.name,
        mobile: l.mobile,
        pendingAmount
      };
    }).filter(l => l.pendingAmount > 0);

    return mockRes({
      success: true,
      data: {
        ladyCount,
        currentMonthWork,
        totalPaid,
        totalPending,
        monthlyChart,
        pendingLadies
      }
    });
  },
  getLadyMonthly: (id) => {
    const works = getDB('works').filter(w => w.lady === id);
    const payments = getDB('payments').filter(p => p.lady === id);

    const monthlyData = {};
    works.forEach(w => {
      const key = `${w.year}-${String(w.month).padStart(2, '0')}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { month: w.month, year: w.year, totalWork: 0, totalPaid: 0, pending: 0 };
      }
      monthlyData[key].totalWork += Number(w.totalAmount || 0);
    });

    return mockRes({ success: true, data: Object.values(monthlyData) });
  },
  getPending: () => {
    const ladies = getDB('ladies');
    const works = getDB('works');
    const payments = getDB('payments');

    const pending = ladies.map(l => {
      const totalEarned = works.filter(w => w.lady === l._id).reduce((sum, w) => sum + Number(w.totalAmount || 0), 0);
      const totalPaid = payments.filter(p => p.lady === l._id).reduce((sum, p) => sum + Number(p.amount || 0), 0);
      return {
        _id: l._id,
        name: l.name,
        mobile: l.mobile,
        totalEarned,
        totalPaid,
        pendingAmount: Math.max(0, totalEarned - totalPaid)
      };
    }).filter(l => l.pendingAmount > 0);

    return mockRes({ success: true, data: pending });
  }
} : {
  getDashboard: () => api.get('/reports/dashboard'),
  getLadyMonthly: (id, params) => api.get(`/reports/lady/${id}/monthly`, { params }),
  getPending: () => api.get('/reports/pending'),
};

export default api;
