import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Promotion {
  id: number;
  name: string;
  title: string;
  subtitle: string;
  type: 'bonus' | 'freespin' | 'cashback' | 'welcome' | 'deposit';
  value?: number;
  badge?: string;
  bonus?: string;
  spins?: string;
  buttonText?: string;
  ctaLabel?: string;
  imageSrc?: string;
  overlayImageSrc?: string;
  href?: string;
  description?: string;
  terms?: string;
  active: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all active promotions
 */
export async function getActivePromotions(): Promise<Promotion[]> {
  try {
    const response = await axios.get(`${API_URL}/promotions`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch promotions:', error);
    return [];
  }
}

/**
 * Get promotion by ID
 */
export async function getPromotionById(id: number): Promise<Promotion | null> {
  try {
    const response = await axios.get(`${API_URL}/promotions/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch promotion:', error);
    return null;
  }
}

/**
 * Create new promotion (admin only)
 */
export async function createPromotion(data: Partial<Promotion>): Promise<Promotion | null> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const response = await axios.post(`${API_URL}/promotions`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create promotion:', error);
    return null;
  }
}

/**
 * Update promotion (admin only)
 */
export async function updatePromotion(id: number, data: Partial<Promotion>): Promise<Promotion | null> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const response = await axios.put(`${API_URL}/promotions/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update promotion:', error);
    return null;
  }
}

/**
 * Delete promotion (admin only)
 */
export async function deletePromotion(id: number): Promise<boolean> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    const response = await axios.delete(`${API_URL}/promotions/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.success;
  } catch (error) {
    console.error('Failed to delete promotion:', error);
    return false;
  }
}

/**
 * Initialize default promotions
 */
export async function initializeDefaultPromotions(): Promise<boolean> {
  try {
    const response = await axios.post(`${API_URL}/promotions/initialize`);
    return response.data.success;
  } catch (error) {
    console.error('Failed to initialize promotions:', error);
    return false;
  }
}

