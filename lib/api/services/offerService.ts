import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const offerService = {
  getActiveOffers() {
    return axios.get(`${API_URL}/api/offers/active`);
  },

  getOffers(params?: { page?: number; limit?: number; status?: string; type?: string }) {
    return axios.get(`${API_URL}/api/offers`, { params });
  },

  getOfferById(id: string) {
    return axios.get(`${API_URL}/api/offers/${id}`);
  },

  createOffer(data: any) {
    return axios.post(`${API_URL}/api/offers`, data);
  },

  updateOffer(id: string, data: any) {
    return axios.patch(`${API_URL}/api/offers/${id}`, data);
  },

  deleteOffer(id: string) {
    return axios.delete(`${API_URL}/api/offers/${id}`);
  },

  toggleOfferStatus(id: string) {
    return axios.patch(`${API_URL}/api/offers/${id}/toggle`);
  },
};

export default offerService;