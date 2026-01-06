import { User, Vehicle, Part, Service, WorkshopDocument, Bid } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@oficina.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: '2',
    name: 'João Mecânico',
    email: 'joao@oficina.com',
    role: 'mechanic',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: uuidv4(),
    plate: 'ABC-1234',
    model: 'Civic',
    brand: 'Honda',
    year: 2020,
    color: 'Prata',
    ownerName: 'Carlos Silva',
    ownerPhone: '(11) 99999-9999',
    status: 'in-service',
    createdAt: new Date(2023, 10, 15).toISOString(),
  },
  {
    id: uuidv4(),
    plate: 'XYZ-9876',
    model: 'Gol',
    brand: 'Volkswagen',
    year: 2018,
    color: 'Branco',
    ownerName: 'Maria Oliveira',
    ownerPhone: '(11) 98888-8888',
    status: 'waiting',
    createdAt: new Date(2023, 11, 1).toISOString(),
  },
  {
    id: uuidv4(),
    plate: 'DEF-5678',
    model: 'Corolla',
    brand: 'Toyota',
    year: 2022,
    color: 'Preto',
    ownerName: 'Roberto Santos',
    ownerPhone: '(11) 97777-7777',
    status: 'ready',
    createdAt: new Date(2023, 11, 5).toISOString(),
  },
];

export const MOCK_PARTS: Part[] = [
  {
    id: uuidv4(),
    name: 'Óleo 5W30',
    code: 'OIL-001',
    category: 'Lubrificantes',
    quantity: 50,
    minQuantity: 10,
    price: 45.00,
    supplier: 'LubriMax',
    location: 'A1',
  },
  {
    id: uuidv4(),
    name: 'Filtro de Óleo',
    code: 'FLT-002',
    category: 'Filtros',
    quantity: 20,
    minQuantity: 5,
    price: 25.00,
    supplier: 'AutoParts',
    location: 'A2',
  },
  {
    id: uuidv4(),
    name: 'Pastilha de Freio',
    code: 'BRK-003',
    category: 'Freios',
    quantity: 8,
    minQuantity: 4,
    price: 120.00,
    supplier: 'BrakeSys',
    location: 'B1',
  },
];

export const MOCK_SERVICES: Service[] = [
  {
    id: uuidv4(),
    vehicleId: MOCK_VEHICLES[0].id,
    description: 'Troca de óleo e filtros',
    mechanicId: '2',
    status: 'in-progress',
    startDate: new Date(2023, 11, 10, 9, 0).toISOString(),
    partsUsed: [
      { partId: MOCK_PARTS[0].id, quantity: 4 },
      { partId: MOCK_PARTS[1].id, quantity: 1 },
    ],
    totalCost: 205.00,
    notes: 'Cliente pediu para verificar freios também.',
  },
  {
    id: uuidv4(),
    vehicleId: MOCK_VEHICLES[2].id,
    description: 'Revisão 10.000km',
    mechanicId: '2',
    status: 'completed',
    startDate: new Date(2023, 11, 5, 8, 0).toISOString(),
    endDate: new Date(2023, 11, 5, 16, 0).toISOString(),
    partsUsed: [],
    totalCost: 350.00,
  },
];

export const MOCK_DOCUMENTS: WorkshopDocument[] = [
  {
    id: uuidv4(),
    name: 'Contrato_Manutencao_Padrao.pdf',
    type: 'application/pdf',
    size: 1024 * 500, // 500KB
    url: '#',
    uploadDate: new Date(2023, 10, 1).toISOString(),
    category: 'contract',
  },
  {
    id: uuidv4(),
    name: 'Manual_Honda_Civic.pdf',
    type: 'application/pdf',
    size: 1024 * 2500, // 2.5MB
    url: '#',
    uploadDate: new Date(2023, 9, 15).toISOString(),
    category: 'manual',
  },
];

export const MOCK_BIDS: Bid[] = [
  {
    id: uuidv4(),
    title: 'Aquisição de Pneus 17"',
    description: 'Compra de lote de pneus para reposição de estoque.',
    deadline: new Date(2024, 1, 15).toISOString(),
    status: 'published',
    createdAt: new Date(2023, 11, 12).toISOString(),
    items: [
      {
        id: uuidv4(),
        partName: 'Pneu 225/45 R17',
        quantity: 20,
        targetPrice: 450.00,
        status: 'open',
      },
    ],
  },
];
