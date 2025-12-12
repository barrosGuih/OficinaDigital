import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Plus, Search, Filter, MoreVertical, Package, AlertCircle } from 'lucide-react';
import { Part } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const Parts: React.FC = () => {
  const { parts, addPart, deletePart } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMock = () => {
    const newPart: Part = {
      id: uuidv4(),
      name: 'Nova Peça',
      code: `PRT-${Math.floor(Math.random() * 9000) + 1000}`,
      category: 'Geral',
      quantity: 10,
      minQuantity: 5,
      price: 50.00,
      supplier: 'Fornecedor X',
      location: 'C1',
    };
    addPart(newPart);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estoque de Peças</h1>
          <p className="text-gray-500">Controle de inventário e fornecedores</p>
        </div>
        <Button onClick={handleAddMock}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Peça
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Buscar por nome ou código..." 
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
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Estoque</th>
                  <th className="px-6 py-4">Preço Unit.</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredParts.map((part) => (
                  <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{part.name}</p>
                          <p className="text-xs text-gray-500">{part.supplier}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600">{part.code}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{part.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={part.quantity <= part.minQuantity ? 'text-red-600 font-bold' : 'text-gray-900'}>
                          {part.quantity} un
                        </span>
                        {part.quantity <= part.minQuantity && (
                          <AlertCircle className="w-4 h-4 text-red-500">
                            <title>Estoque baixo</title>
                          </AlertCircle>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      R$ {part.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => deletePart(part.id)}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredParts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhuma peça encontrada.
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
