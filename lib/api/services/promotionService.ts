import apiServices from '@/lib/api';

const { api } = apiServices;

export type PromotionKind = 'free_shipping' | 'limited_time' | 'quantity' | 'gift' | 'bundle';
export type PromotionStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'expired';

export interface Promotion {
  _id: string;
  name: string;
  description?: string;
  kind: PromotionKind;
  status: PromotionStatus;
  startsAt: string;
  endsAt: string;
  scope?: { all?: boolean; products?: any[]; categories?: any[] };
  config?: any;
  usageLimit?: number | null;
  usageCount?: number;
  perUserLimit?: number | null;
  priority?: number;
  isLive?: boolean;
  [key: string]: any;
}

export const promotionService = {
  // public
  getActivePromotions() {
    return api.get('/api/promotions/active');
  },
  getFreeShippingStatus(params: { subtotal: number; deliveryMethod?: string; address?: string }) {
    return api.get('/api/promotions/free-shipping-status', { params });
  },
  // admin
  getPromotions(params?: Record<string, any>) {
    return api.get('/api/promotions', { params });
  },
  getPromotion(id: string) {
    return api.get(`/api/promotions/${id}`);
  },
  createPromotion(data: Record<string, any>) {
    return api.post('/api/promotions', data);
  },
  updatePromotion(id: string, data: Record<string, any>) {
    return api.patch(`/api/promotions/${id}`, data);
  },
  togglePromotion(id: string, status?: PromotionStatus) {
    return api.patch(`/api/promotions/${id}/toggle`, status ? { status } : {});
  },
  deletePromotion(id: string) {
    return api.delete(`/api/promotions/${id}`);
  },
  previewPromotion(data: Record<string, any>) {
    return api.post('/api/promotions/preview', data);
  },
};

export default promotionService;
