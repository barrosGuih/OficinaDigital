import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Plus, Search, Filter, MoreVertical, Wrench, Calendar } from 'lucide-react';
import { Service } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Services: React.FC = () => {
  const { services, vehicles, addService, deleteService } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const getVehicleInfo = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.brand} ${v.model} (${v.plate})` : 'Veículo desconhecido';
  };

  const filteredServices = services.filter(s => 
    s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getVehicleInfo(s.vehicleId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMock = () => {
    if (vehicles.length === 0) return alert('Adicione um veículo primeiro!');
    
    const newService: Service = {
      id: uuidv4(),
      vehicleId: vehicles[0].id,
      description: 'Nova Manutenção',
      mechanicId: '2',
      status: 'pending',
      startDate: new Date().toISOString(),
      partsUsed: [],
      totalCost: 0,
    };
    addService(newService);
  };

  const getStatusBadge = (status: Service['status']) => {
    switch (status) {
      case 'in-progress': return <Badge variant="warning">Em Andamento</Badge>;
      case 'pending': return <Badge variant="secondary">Pendente</Badge>;
      case 'completed': return <Badge variant="success">Concluído</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelado</Badge>;
      default: return <Badge>Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-500">Ordens de serviço e manutenções</p>
        </div>
        <Button onClick={handleAddMock}>
          <Plus className="w-4 h-4 mr-2" />
          Nova OS
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Buscar por descrição ou veículo..." 
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
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Veículo</th>
                  <th className="px-6 py-4">Data Início</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="font-medium text-gray-900">{service.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{getVehicleInfo(service.vehicleId)}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(service.startDate), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(service.status)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      R$ {service.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => deleteService(service.id)}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhum serviço encontrado.
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
