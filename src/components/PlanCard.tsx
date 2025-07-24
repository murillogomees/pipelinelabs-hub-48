import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Users, Zap, Shield } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface PlanCardProps {
  name: string;
  price: number;
  interval: 'month' | 'year';
  description?: string;
  features: string[];
  maxUsers?: number;
  isPopular?: boolean;
  isCurrentPlan?: boolean;
}

export function PlanCard({
  name,
  price,
  interval,
  description,
  features,
  maxUsers,
  isPopular = false,
  isCurrentPlan = false,
}: PlanCardProps) {
  const { createCheckout, loading } = useSubscription();

  const handleSelectPlan = async () => {
    const priceInCents = price * 100; // Convert to cents
    await createCheckout(name, priceInCents);
  };

  const getPlanIcon = () => {
    const planName = name.toLowerCase();
    if (planName.includes('básico') || planName.includes('basic')) {
      return <Zap className="w-6 h-6 text-blue-600" />;
    }
    if (planName.includes('premium') || planName.includes('pro')) {
      return <Crown className="w-6 h-6 text-yellow-600" />;
    }
    if (planName.includes('enterprise') || planName.includes('empresarial')) {
      return <Shield className="w-6 h-6 text-purple-600" />;
    }
    return <Zap className="w-6 h-6 text-blue-600" />;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Grátis';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <Card 
      className={`relative transition-all duration-300 hover:shadow-xl ${
        isPopular 
          ? 'border-2 border-primary shadow-lg scale-105' 
          : 'border hover:border-gray-300'
      } ${
        isCurrentPlan ? 'ring-2 ring-green-500' : ''
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-4 py-1">
            Mais Popular
          </Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-4 right-4">
          <Badge className="bg-green-500 text-white px-3 py-1">
            Seu Plano
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-6">
        <div className="flex justify-center mb-4">
          {getPlanIcon()}
        </div>
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(price)}
          </span>
          {price > 0 && (
            <span className="text-gray-500 ml-2">
              /{interval === 'month' ? 'mês' : 'ano'}
            </span>
          )}
        </div>
        {description && (
          <p className="text-gray-600 mt-2">{description}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Recursos do plano */}
        {features && features.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Recursos incluídos:</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Limites do plano */}
        {maxUsers && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Usuários</span>
            </div>
            <Badge variant="outline">
              {maxUsers === -1 ? 'Ilimitado' : `${maxUsers} usuários`}
            </Badge>
          </div>
        )}

        <Button
          onClick={handleSelectPlan}
          disabled={loading || isCurrentPlan}
          className={`w-full h-12 text-lg font-semibold ${
            isPopular
              ? 'bg-primary hover:bg-primary/90'
              : ''
          }`}
          variant={isCurrentPlan ? 'outline' : 'default'}
          size="lg"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processando...</span>
            </div>
          ) : isCurrentPlan ? (
            'Plano Atual'
          ) : price === 0 ? (
            'Começar Grátis'
          ) : (
            'Selecionar Plano'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}