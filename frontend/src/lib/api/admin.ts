/**
 * Admin API functions
 * All endpoints require admin/super_admin authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ============= DASHBOARD & STATISTICS =============

export async function getAdminDashboard(token: string): Promise<any> {
  const response = await fetch(`${API_URL}/admin/dashboard`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard');
  }

  return response.json();
}

export async function getAdminStatistics(
  token: string,
  params?: {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
  }
): Promise<any> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.period) queryParams.append('period', params.period);

  const response = await fetch(`${API_URL}/admin/statistics?${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }

  return response.json();
}

// ============= USER MANAGEMENT =============

export async function getAdminUsers(
  token: string,
  page: number = 1,
  limit: number = 50,
  search?: string
): Promise<any> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) queryParams.append('search', search);

  const response = await fetch(`${API_URL}/admin/users?${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}

export async function getAdminUserDetails(token: string, userId: number): Promise<any> {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user details');
  }

  return response.json();
}

export async function updateUserBalance(
  token: string,
  data: {
    userId: number;
    amount: number;
    currency: string;
    reason?: string;
  }
): Promise<any> {
  const response = await fetch(`${API_URL}/admin/users/balance`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update user balance');
  }

  return response.json();
}

export async function updateUserRole(
  token: string,
  data: {
    userId: number;
    role: string;
  }
): Promise<any> {
  const response = await fetch(`${API_URL}/admin/users/role`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update user role');
  }

  return response.json();
}

export async function banUser(token: string, userId: number): Promise<any> {
  const response = await fetch(`${API_URL}/admin/users/${userId}/ban`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to ban user');
  }

  return response.json();
}

export async function unbanUser(token: string, userId: number): Promise<any> {
  const response = await fetch(`${API_URL}/admin/users/${userId}/unban`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to unban user');
  }

  return response.json();
}

// ============= TRANSACTION MANAGEMENT =============

export async function getAdminTransactions(
  token: string,
  page: number = 1,
  limit: number = 50,
  type?: string,
  status?: string
): Promise<any> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (type) queryParams.append('type', type);
  if (status) queryParams.append('status', status);

  const response = await fetch(`${API_URL}/admin/transactions?${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return response.json();
}

export async function getPendingTransactions(token: string): Promise<any> {
  const response = await fetch(`${API_URL}/admin/transactions/pending`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch pending transactions');
  }

  return response.json();
}

export async function approveTransaction(
  token: string,
  data: {
    id: string | number; // Can be string (UUID) or number
    status: 'approved' | 'rejected' | 'completed';
    reason?: string;
  }
): Promise<any> {
  const response = await fetch(`${API_URL}/admin/transactions/approve`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to approve transaction');
  }

  return response.json();
}

export async function rejectTransaction(
  token: string,
  data: {
    id: string | number; // Can be string (UUID) or number
    status: 'rejected';
    reason?: string;
  }
): Promise<any> {
  const response = await fetch(`${API_URL}/admin/transactions/reject`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to reject transaction');
  }

  return response.json();
}

// ============= BETS & GAMES =============

export async function getAdminBets(
  token: string,
  page: number = 1,
  limit: number = 50
): Promise<any> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`${API_URL}/admin/bets?${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bets');
  }

  return response.json();
}

export async function getAdminGames(token: string): Promise<any> {
  const response = await fetch(`${API_URL}/admin/games`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch games');
  }

  return response.json();
}

export async function toggleGameStatus(
  token: string,
  data: {
    gameId: number;
    active: boolean;
  }
): Promise<any> {
  const response = await fetch(`${API_URL}/admin/games/toggle`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to toggle game status');
  }

  return response.json();
}

// ============= PROMOTIONS =============

export async function getAdminPromotions(token: string): Promise<any> {
  const response = await fetch(`${API_URL}/admin/promotions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch promotions');
  }

  return response.json();
}

export async function createPromotion(
  token: string,
  data: {
    name: string;
    description: string;
    code: string;
    type: 'fixed' | 'percentage';
    value: number;
    maxUses: number;
    minDeposit: number;
    startDate: string;
    endDate: string;
    active: boolean;
  }
): Promise<any> {
  const response = await fetch(`${API_URL}/admin/promotions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create promotion');
  }

  return response.json();
}

export async function updatePromotion(
  token: string,
  data: {
    id: number;
    name?: string;
    description?: string;
    active?: boolean;
    maxUses?: number;
  }
): Promise<any> {
  const response = await fetch(`${API_URL}/admin/promotions`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update promotion');
  }

  return response.json();
}

export async function deletePromotion(token: string, promotionId: number): Promise<any> {
  const response = await fetch(`${API_URL}/admin/promotions/${promotionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete promotion');
  }

  return response.json();
}

export async function getPromotionUsage(token: string, code: string): Promise<any> {
  const response = await fetch(`${API_URL}/admin/promotions/usage/${code}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch promotion usage');
  }

  return response.json();
}

// ============= LEADERBOARD =============

export async function getAdminLeaderboards(token: string): Promise<any> {
  const response = await fetch(`${API_URL}/admin/leaderboards`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboards');
  }

  return response.json();
}

export async function createLeaderboard(
  token: string,
  data: {
    name: string;
    description: string;
    period: 'daily' | 'weekly' | 'monthly' | 'all-time';
    startDate: string;
    endDate: string;
    active: boolean;
    prizes?: any;
  }
): Promise<any> {
  const response = await fetch(`${API_URL}/admin/leaderboards`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create leaderboard');
  }

  return response.json();
}

export async function updateLeaderboard(
  token: string,
  data: {
    id: number;
    name?: string;
    active?: boolean;
    prizes?: any;
  }
): Promise<any> {
  const response = await fetch(`${API_URL}/admin/leaderboards`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update leaderboard');
  }

  return response.json();
}

export async function getLeaderboardParticipants(
  token: string,
  leaderboardId: number
): Promise<any> {
  const response = await fetch(`${API_URL}/admin/leaderboards/${leaderboardId}/participants`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard participants');
  }

  return response.json();
}

// ============= NOTIFICATIONS =============

export async function sendNotification(
  token: string,
  data: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    userId?: number;
  }
): Promise<any> {
  const response = await fetch(`${API_URL}/admin/notifications`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to send notification');
  }

  return response.json();
}

// ============= SYSTEM SETTINGS =============

export async function getAdminSettings(token: string): Promise<any> {
  const response = await fetch(`${API_URL}/admin/settings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }

  return response.json();
}

export async function updateAdminSettings(
  token: string,
  settings: Record<string, any>
): Promise<any> {
  const response = await fetch(`${API_URL}/admin/settings`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error('Failed to update settings');
  }

  return response.json();
}

