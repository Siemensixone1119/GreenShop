import { CreateOrderItemData } from './create-order-item-data.type.js';

export type CreateOrderData = {
  totalPrice: number;
  firstName: string;
  lastName: string;
  region: string;
  city: string;
  street: string;
  house: string;
  apartment?: string;
  postalCode?: string;
  phone: string;
  email: string;

  items: CreateOrderItemData[];
};
