import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Plus, Search, Filter, MoreVertical, Car } from 'lucide-react';
import { Vehicle } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const Vehicles: React.FC = () => {
  const { vehicles, addVehicle, deleteVehicle } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = vehicles.filter(v => 
    v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMock = () => {
    const newVehicle: Vehicle = {
      id: uuidv4(),
      plate: `NEW-${Math.floor(Math.random() * 9000) + 1000}`,
      model: 'Novo Modelo',
      brand: 'Marca',
      year: 2024,
      color: 'Prata',
      ownerName: 'Cliente Novo',
      ownerPhone: '(11) 90000-0000',
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    addVehicle(newVehicle);
  };

  const getStatusBadge = (status: Vehicle['status']) => {
    switch (status) {
      case 'in-service': return <Badge variant="warning">Em Serviço</Badge>;
      case 'waiting': return <Badge variant="secondary">Aguardando</Badge>;
      case 'ready': return <Badge variant="success">Pronto</Badge>;
      case 'delivered': return <Badge variant="outline">Entregue</Badge>;
      default: return <Badge>Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Veículos</h1>
          <p className="text-gray-500">Gerencie a frota e clientes da oficina</p>
        </div>
        <Button onClick={handleAddMock}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Veículo
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Buscar por placa, modelo ou cliente..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="md">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Veículo</th>
                  <th className="px-6 py-4">Placa</th>
                  <th className="px-6 py-4">Proprietário</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{vehicle.brand} {vehicle.model}</p>
                          <p className="text-xs text-gray-500">{vehicle.year} • {vehicle.color}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">{vehicle.plate}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{vehicle.ownerName}</p>
                      <p className="text-xs text-gray-500">{vehicle.ownerPhone}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(vehicle.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => deleteVehicle(vehicle.id)}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredVehicles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Nenhum veículo encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
