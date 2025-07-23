import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, MapPin, User, Heart, Clock } from 'lucide-react';
import { carlaPersona, lucasPersonaCard, anaPersona, eduardoPersona, patriciaPersona, joaoPersona } from '@/assets';

interface PersonaData {
  id: number;
  name: string;
  age: number;
  business: string;
  location: string;
  situation: string;
  problems: string[];
  solutions: string[];
  result: string;
  image: string;
}

interface PersonaCardProps {
  persona?: PersonaData;
  className?: string;
}

// Dados padrão para Carla (fallback)
const defaultPersona: PersonaData = {
  id: 1,
  name: "Carla Santos",
  age: 41,
  business: "Fábrica de Salgados Artesanais",
  location: "Belo Horizonte/MG",
  situation: "Divorciada • 2 filhos",
  problems: [
    "Sem visão financeira clara do negócio",
    "Pedidos de produção confusos e manuais",
    "Planilhas desorganizadas tomavam muito tempo"
  ],
  solutions: [
    "<strong>DRE automático</strong> com metas e lucros reais",
    "<strong>Controle de produção</strong> otimizado por demanda",
    "<strong>Integração completa</strong> estoque + vendas + financeiro"
  ],
  result: "Carla conseguiu contratar 2 funcionários e dobrar sua produção, mantendo total controle financeiro e operacional.",
  image: "/src/assets/carla-persona.jpg"
};

// Mapeamento de imagens
const getPersonaImage = (personaId: number) => {
  switch (personaId) {
    case 1: return carlaPersona;
    case 2: return lucasPersonaCard;
    case 3: return anaPersona;
    case 4: return eduardoPersona;
    case 5: return patriciaPersona;
    case 6: return joaoPersona;
    default: return carlaPersona;
  }
};

export function PersonaCard({ persona = defaultPersona, className = '' }: PersonaCardProps) {
  const currentPersona = persona || defaultPersona;
  const personaImage = getPersonaImage(currentPersona.id);

  return (
    <Card className={`overflow-hidden shadow-lg h-auto min-h-[700px] ${className}`}>
      <CardContent className="p-0">
        {/* Foto da persona */}
        <div className="relative">
          <img 
            src={personaImage} 
            alt={`${currentPersona.name} - ${currentPersona.business}`} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-white font-bold text-2xl">{currentPersona.name}</h3>
            <p className="text-white/90 text-base">{currentPersona.business}</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Identificação - Minimalista */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{currentPersona.age} anos</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{currentPersona.location}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Badge variant="secondary" className="text-xs px-2 py-1 font-medium">
                {currentPersona.situation}
              </Badge>
            </div>
          </div>

          {/* Maiores dificuldades */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold text-sm">Principais Dificuldades</span>
            </div>
            
            <div className="space-y-2">
              {(currentPersona.problems || []).map((problem, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>"{problem}"</span>
                </div>
              ))}
            </div>
          </div>

          {/* Soluções do Pipeline Labs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="font-semibold text-sm">Com Pipeline Labs</span>
            </div>
            
            <div className="space-y-2">
              {(currentPersona.solutions || []).map((solution, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span dangerouslySetInnerHTML={{ __html: solution }} />
                </div>
              ))}
            </div>
          </div>

          {/* Resultado final */}
          <div className="bg-green-50/50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium">
              💡 <strong>Resultado:</strong> {currentPersona.result}
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}