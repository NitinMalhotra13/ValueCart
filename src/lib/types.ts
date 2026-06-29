

export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  imageUrl: string;
  imageHint: string;
  description: string;
  category: string;
  specifications: string;
}

export interface CartItem {
  id: string; // This will be the document ID in the cart subcollection
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  imageHint: string;
  quantity: number;
}


export interface PurchasedItem {
  productId: string;
  name: string;
  quantity: number;
  priceAtPurchase: number;
  imageUrl: string;
  imageHint: string;
}

export interface DeliveryAddress {
  id: string;
  userId: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}


export interface Purchase {
  id: string;
  userId: string;
  items: PurchasedItem[];
  totalAmount: number;
  purchaseDate: any;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  budgetId?: string;
  budgetName?: string;
  deliveryAddress: DeliveryAddress;
  cancelledByUserId?: string;
  cancelledByUserName?: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  userId: string;
  sharedUsers: string[];
}

export interface Invitation {
    id: string;
    fromUserId: string;
    fromUserName: string;

    toUserEmail: string;
    budgetId: string;
    budgetName: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  profileImageUrl?: string;
  isAdmin?: boolean;
}
