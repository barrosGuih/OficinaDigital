export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mechanic' | 'receptionist';
  avatar?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  color: string;
  ownerName: string;
  ownerPhone: string;
  status: 'in-service' | 'waiting' | 'ready' | 'delivered';
  createdAt: string;
}

export interface Part {
  id: string;
  name: string;
  code: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;
  supplier: string;
  location: string;
}

export interface Service {
  id: string;
  vehicleId: string;
  description: string;
  mechanicId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  partsUsed: { partId: string; quantity: number }[];
  totalCost: number;
  notes?: string;
}

export interface WorkshopDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string; // For mock, this might be a data URL or just a placeholder
  uploadDate: string;
  category: 'invoice' | 'manual' | 'contract' | 'other';
}

export interface BidItem {
  id: string;
  partName: string;
  quantity: number;
  targetPrice: number;
  status: 'open' | 'closed' | 'awarded';
  matchedInventoryId?: string; // Link to internal inventory
}

export interface Bid {
  id: string;
  title: string;
  description: string;
  deadline: string;
  items: BidItem[];
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
}
