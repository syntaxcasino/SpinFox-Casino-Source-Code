import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatarUrl?: string;
  stake: number;
  wins: number;
  country?: string;
  isCurrentUser?: boolean;
}

export interface LeaderboardParams {
  period?: 'daily' | 'weekly' | 'monthly' | 'all-time';
  limit?: number;
  type?: 'all' | 'casino' | 'sports';
}

/**
 * Get leaderboard entries
 */
export async function getLeaderboard(params: LeaderboardParams = {}): Promise<LeaderboardEntry[]> {
  try {
    const { period = 'all-time', limit = 100, type = 'all' } = params;
    const response = await axios.get(`${API_URL}/leaderboard`, {
      params: { period, limit, type },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
}

/**
 * Get current user's leaderboard position
 */
export async function getMyLeaderboardPosition(period: string = 'all-time', type: string = 'all'): Promise<LeaderboardEntry | null> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const response = await axios.get(`${API_URL}/leaderboard/my-position`, {
      params: { period, type },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user position:', error);
    return null;
  }
}

/**
 * Manually trigger leaderboard update (admin only)
 */
export async function updateLeaderboard(period: string = 'all-time'): Promise<boolean> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    const response = await axios.get(`${API_URL}/leaderboard/update`, {
      params: { period },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.success;
  } catch (error) {
    console.error('Failed to update leaderboard:', error);
    return false;
  }
}

