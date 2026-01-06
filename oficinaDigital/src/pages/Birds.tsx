import React from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Gavel, Plus, BrainCircuit, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Birds: React.FC = () => {
  const { bids, addBid } = useData();

  const handleCreateBid = () => {
    alert('Funcionalidade de criação de pregão será implementada na próxima etapa.');
  };

  const handleAIAnalysis = () => {
    alert('O módulo de IA analisará seu estoque e sugerirá os melhores itens para este pregão. (Em breve)');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pregões e Cotações</h1>
          <p className="text-gray-500">Gerencie compras e oportunidades de fornecimento</p>
        </div>
        <Button onClick={handleCreateBid}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Pregão
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-900">Inteligência Artificial</h3>
              <p className="text-indigo-700">Otimize suas compras comparando automaticamente seu estoque com as demandas.</p>
            </div>
          </div>
          <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700" onClick={handleAIAnalysis}>
            Analisar Oportunidades
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {bids.map((bid) => (
          <Card key={bid.id}>
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Gavel className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{bid.title}</CardTitle>
                    <p className="text-sm text-gray-500">Criado em {format(new Date(bid.createdAt), "d 'de' MMM, yyyy", { locale: ptBR })}</p>
                  </div>
                </div>
                <Badge variant={bid.status === 'published' ? 'success' : 'secondary'}>
                  {bid.status === 'published' ? 'Publicado' : 'Rascunho'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-4">{bid.description}</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Itens Solicitados</h4>
                <div className="space-y-2">
                  {bid.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{item.quantity}x {item.partName}</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        Meta: R$ {item.targetPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Encerra em {format(new Date(bid.deadline), "d 'de' MMM, yyyy", { locale: ptBR })}
                </div>
                <Button variant="outline" size="sm">Ver Detalhes</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
