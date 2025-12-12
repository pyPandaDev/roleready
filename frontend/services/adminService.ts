/**
 * Admin Service - API calls for admin panel operations
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Get admin token from localStorage
const getAdminToken = (): string | null => {
    return localStorage.getItem('adminToken');
};

// Set admin token in localStorage
export const setAdminToken = (token: string): void => {
    localStorage.setItem('adminToken', token);
};

// Clear admin token
export const clearAdminToken = (): void => {
    localStorage.removeItem('adminToken');
};

// Check if admin is logged in
export const isAdminLoggedIn = (): boolean => {
    const token = getAdminToken();
    if (!token) return false;

    // Check if token is expired (basic check)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

// Admin login
export const adminLogin = async (email: string, password: string): Promise<{ token: string; email: string }> => {
    const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    setAdminToken(data.token);
    return data;
};

// Get admin stats
export const getAdminStats = async (): Promise<{
    total_users: number;
    total_resumes: number;
    total_analyses: number;
    total_jd_analyses: number;
    total_interviews: number;
    total_portfolios: number;
    users_by_plan: { free: number; pro: number; enterprise: number };
}> => {
    const token = getAdminToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            clearAdminToken();
            throw new Error('Session expired');
        }
        throw new Error('Failed to fetch stats');
    }

    return response.json();
};

// Get all users
export const getUsers = async (search?: string): Promise<{
    users: any[];
    total: number;
}> => {
    const token = getAdminToken();
    if (!token) throw new Error('Not authenticated');

    const params = new URLSearchParams();
    if (search) params.append('search', search);

    const response = await fetch(`${API_URL}/api/admin/users?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            clearAdminToken();
            throw new Error('Session expired');
        }
        throw new Error('Failed to fetch users');
    }

    return response.json();
};

// Get user details
export const getUserDetails = async (uid: string): Promise<any> => {
    const token = getAdminToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/admin/users/${uid}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            clearAdminToken();
            throw new Error('Session expired');
        }
        throw new Error('Failed to fetch user details');
    }

    return response.json();
};

// Delete user
export const deleteUser = async (uid: string): Promise<{ message: string }> => {
    const token = getAdminToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/admin/users/${uid}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            clearAdminToken();
            throw new Error('Session expired');
        }
        throw new Error('Failed to delete user');
    }

    return response.json();
};

// Update user plan
export const updateUserPlan = async (uid: string, plan: string): Promise<{ message: string; uid: string; new_plan: string }> => {
    const token = getAdminToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/admin/users/${uid}/plan`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
    });

    if (!response.ok) {
        if (response.status === 401) {
            clearAdminToken();
            throw new Error('Session expired');
        }
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update plan');
    }

    return response.json();
};

