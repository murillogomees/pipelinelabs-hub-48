import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, MapPin, User, Heart, Clock } from 'lucide-react';
import { PipelineLabsLogo } from '@/components/Layout/PipelineLabsLogo';

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

interface PersonaCardCompactProps {
  persona: PersonaData;
  className?: string;
}

export function PersonaCardCompact({ persona, className = '' }: PersonaCardCompactProps) {
  return (
    <Card className={`overflow-hidden shadow-lg h-auto min-h-[700px] ${className}`}>
      <CardContent className="p-0">
        {/* Foto da persona */}
        <div className="relative">
          <img 
            src={persona.image} 
            alt={`${persona.name} - ${persona.business}`} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-white font-bold text-2xl">{persona.name}</h3>
            <p className="text-white/90 text-base">{persona.business}</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Identificação - Minimalista */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{persona.age} anos</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{persona.location}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Badge variant="secondary" className="text-sm px-3 py-1 h-6">
                {persona.situation ? (persona.situation.length > 20 ? persona.situation.slice(0, 20) + '...' : persona.situation) : 'Empreendedor'}
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
              {(persona.problems || []).slice(0, 4).map((problem, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{problem}</span>
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
              {(persona.solutions || []).slice(0, 4).map((solution, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{solution}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}