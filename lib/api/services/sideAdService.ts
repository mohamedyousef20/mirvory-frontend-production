/**
 * Side Advertisement Service
 *
 * Frontend service for the /api/side-ads backend resource.
 * Since the backend may not have this endpoint yet, the service
 * gracefully falls back to the Announcements API (filtered by
 * type='side_ad') so that the homepage can display ads
 * immediately using the existing infrastructure.
 *
 * Admins create "side ads" via the AnnouncementsTab by choosing
 * type = 'side_ad'.  The SideAdsTab in AdminDashboard wraps this
 * logic in a dedicated UI.
 */

import apiServices from '@/lib/api';

const { api } = apiServices;

export interface SideAd {
  _id: string;
  title: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  position?: 'left' | 'right' | 'both';
  isActive: boolean;
  type: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const sideAdService = {
  /** Fetch ALL side ads (admin) */
  async getAll(): Promise<SideAd[]> {
    try {
      // Try dedicated endpoint first
      const res = await api.get('/api/side-ads');
      const data = res.data?.data ?? res.data ?? [];
      return Array.isArray(data) ? data : [];
    } catch {
      // Fallback: filter announcements with type === 'side_ad'
      try {
        const res = await api.get('/api/announcements');
        const data: any[] = res.data?.data ?? res.data?.announcements ?? res.data ?? [];
        return (Array.isArray(data) ? data : []).filter(
          (a: any) => a.type === 'side_ad'
        );
      } catch {
        return [];
      }
    }
  },

  /** Fetch only ACTIVE side ads (public) */
  async getActive(): Promise<SideAd[]> {
    try {
      const res = await api.get('/api/side-ads/active');
      const data = res.data?.data ?? res.data ?? [];
      return Array.isArray(data) ? data : [];
    } catch {
      // Fallback: filter active announcements
      try {
        const res = await api.get('/api/announcements/active');
        const data: any[] = res.data?.announcements ?? res.data?.data ?? res.data ?? [];
        return (Array.isArray(data) ? data : []).filter(
          (a: any) => a.type === 'side_ad' && a.isActive
        );
      } catch {
        return [];
      }
    }
  },

  /** Create a new side ad (admin) */
  async create(payload: {
    title: string;
    content?: string;
    imageUrl?: string;
    linkUrl?: string;
    position?: 'left' | 'right' | 'both';
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<SideAd | null> {
    try {
      const res = await api.post('/api/side-ads', { ...payload, type: 'side_ad' });
      return res.data?.data ?? res.data ?? null;
    } catch {
      // Fallback: create as announcement with type='side_ad'
      try {
        const formData = new FormData();
        formData.append('title', payload.title);
        if (payload.content) formData.append('content', payload.content);
        if (payload.imageUrl) formData.append('imageUrl', payload.imageUrl);
        if (payload.linkUrl) formData.append('linkUrl', payload.linkUrl);
        formData.append('type', 'side_ad');
        formData.append('isActive', String(payload.isActive ?? true));
        if (payload.startDate) formData.append('startDate', payload.startDate);
        if (payload.endDate) formData.append('endDate', payload.endDate);

        const res2 = await api.post('/api/announcements', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res2.data?.data ?? res2.data ?? null;
      } catch {
        return null;
      }
    }
  },

  /** Update a side ad */
  async update(id: string, payload: Partial<SideAd>): Promise<SideAd | null> {
    try {
      const res = await api.put(`/api/side-ads/${id}`, payload);
      return res.data?.data ?? res.data ?? null;
    } catch {
      // Fallback: update as announcement
      try {
        const res2 = await api.put(`/api/announcements/${id}`, payload);
        return res2.data?.data ?? res2.data ?? null;
      } catch {
        return null;
      }
    }
  },

  /** Toggle isActive */
  async toggle(id: string, isActive: boolean): Promise<boolean> {
    try {
      await api.patch(`/api/side-ads/${id}/toggle`, { isActive });
      return true;
    } catch {
      try {
        await api.put(`/api/announcements/${id}`, { isActive });
        return true;
      } catch {
        return false;
      }
    }
  },

  /** Delete a side ad */
  async delete(id: string): Promise<boolean> {
    try {
      await api.delete(`/api/side-ads/${id}`);
      return true;
    } catch {
      try {
        await api.delete(`/api/announcements/${id}`);
        return true;
      } catch {
        return false;
      }
    }
  },
};
