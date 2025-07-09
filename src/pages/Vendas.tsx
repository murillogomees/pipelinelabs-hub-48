
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Vendas() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600">Gerencie todos os seus pedidos e vendas</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Buscar pedidos..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Pedido</th>
                  <th className="text-left py-3 px-4">Cliente</th>
                  <th className="text-left py-3 px-4">Data</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Valor</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: '#001', cliente: 'João Silva', data: '2024-01-15', status: 'Pendente', valor: 'R$ 1.250,00' },
                  { id: '#002', cliente: 'Maria Santos', data: '2024-01-14', status: 'Aprovado', valor: 'R$ 890,00' },
                  { id: '#003', cliente: 'Pedro Costa', data: '2024-01-14', status: 'Entregue', valor: 'R$ 2.100,00' },
                  { id: '#004', cliente: 'Ana Lima', data: '2024-01-13', status: 'Cancelado', valor: 'R$ 450,00' }
                ].map((pedido) => (
                  <tr key={pedido.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{pedido.id}</td>
                    <td className="py-3 px-4">{pedido.cliente}</td>
                    <td className="py-3 px-4">{pedido.data}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pedido.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                        pedido.status === 'Aprovado' ? 'bg-blue-100 text-blue-800' :
                        pedido.status === 'Entregue' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {pedido.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{pedido.valor}</td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
