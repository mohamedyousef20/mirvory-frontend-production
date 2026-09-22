import apiServices from '@/lib/api';

const { api } = apiServices;

export const productService = {
  // Get all products in category
  async getProducts(categoryId: string) {
    try {
      const response = await api.get(`/api/categories/${categoryId}/products`);
      return response;
    } catch (error: any) {
      throw error;
    }
  },


  // Get products for admin
  async getProductsForAdmin() {
    try {
      const response = await api.get('/api/products/admin-products');
      //console.log(response, 'prod');
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Get seller products with optional query params (pagination, filters)
  async getSellerProducts(params?: any) {
    try {
      const response = await api.get('/api/products/seller', { params });
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Get pending products
  async getPendingProducts() {
    try {
      const response = await api.get('/api/products/pending');
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Get featured products
  async getFeaturedProducts() {
    try {
      const response = await api.get('/api/products/featured');
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Get new arrivals
  async getNewArrivals() {
    try {
      const response = await api.get('/api/products/new-arrivals');
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Get product by ID within category
  async getProductById(categoryIdOrProductId: string, productId?: string) {
    try {
      // If only one parameter is provided, treat it as productId
      if (!productId) {
        const response = await api.get(`/api/products/${categoryIdOrProductId}`);
        return response;
      }
      // If two parameters are provided, use the category-based route
      const response = await api.get(`/api/categories/${categoryIdOrProductId}/products/${productId}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Create new product in category
  async createProduct(productData: any) {
    try {
      const response = await api.post('/api/products', productData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Approve product
  async approveProduct(productId: string) {
    try {
      const response = await api.post(`/api/products/approve/${productId}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve product');
    }
  },

  // Update product with FormData support for images
  async updateProduct(productId: string, productData: any, files?: File[]) {
    try {
      const formData = new FormData();
      
      // Add all text fields
      Object.keys(productData).forEach(key => {
        if (productData[key] !== undefined && productData[key] !== null) {
          if (Array.isArray(productData[key])) {
            formData.append(key, JSON.stringify(productData[key]));
          } else if (typeof productData[key] === 'object') {
            formData.append(key, JSON.stringify(productData[key]));
          } else {
            formData.append(key, String(productData[key]));
          }
        }
      });

      // Add files if any
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('images', file);
        });
      }

      const response = await api.patch(`/api/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Delete product
  async deleteProduct(productId: string) {
    try {
      const response = await api.delete('/api/products', { data: { id: productId } });
      return response;
    } catch (error: any) {
      throw error;
    }
  }
}