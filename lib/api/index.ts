import { cartService } from './services/cartService';
import { productService } from './services/productService';
import { categoryService } from './services/categoryService';
import * as ratingService from './services/rating/rating.service';
import { offerService } from './services/offerService';
import { promotionService } from './services/promotionService';

export const apiServices = {
  cartService,
  productService,
  categoryService,
  ratingService,
  offerService,
  promotionService,
};

export type ApiServices = typeof apiServices;
