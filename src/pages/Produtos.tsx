
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Package, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Produtos() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie seu catálogo e controle de estoque</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold">1.247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold">R$ 125.430</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Categorias</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Buscar produtos..." className="pl-10" />
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
                  <th className="text-left py-3 px-4">Código</th>
                  <th className="text-left py-3 px-4">Nome</th>
                  <th className="text-left py-3 px-4">Categoria</th>
                  <th className="text-left py-3 px-4">Estoque</th>
                  <th className="text-left py-3 px-4">Preço</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { codigo: 'PRD001', nome: 'Produto Premium A', categoria: 'Eletrônicos', estoque: 45, preco: 'R$ 299,90', status: 'Ativo' },
                  { codigo: 'PRD002', nome: 'Produto Standard B', categoria: 'Casa', estoque: 8, preco: 'R$ 89,90', status: 'Baixo' },
                  { codigo: 'PRD003', nome: 'Produto Especial C', categoria: 'Moda', estoque: 0, preco: 'R$ 159,90', status: 'Esgotado' },
                  { codigo: 'PRD004', nome: 'Produto Basic D', categoria: 'Livros', estoque: 156, preco: 'R$ 29,90', status: 'Ativo' }
                ].map((produto) => (
                  <tr key={produto.codigo} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{produto.codigo}</td>
                    <td className="py-3 px-4">{produto.nome}</td>
                    <td className="py-3 px-4">{produto.categoria}</td>
                    <td className="py-3 px-4">
                      <span className={produto.estoque <= 10 ? 'text-red-600 font-medium' : ''}>
                        {produto.estoque} un.
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{produto.preco}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        produto.status === 'Ativo' ? 'bg-green-100 text-green-800' :
                        produto.status === 'Baixo' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {produto.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">
                        Editar
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
