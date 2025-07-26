
import React from 'react';
import { ResponsiveContainer, ResponsiveSection, ResponsiveGrid } from '@/components/ui/responsive-layout';
import { PersonaCard } from '@/components/ui/persona-card';

const personas = [
  {
    name: "Ana Costa",
    age: 34,
    location: "São Paulo, SP",
    business: "Loja de roupas femininas",
    image: "/placeholder.svg"
  },
  {
    name: "Lucas Silva", 
    age: 28,
    location: "Rio de Janeiro, RJ",
    business: "Vendedor em marketplaces",
    image: "/placeholder.svg"
  },
  {
    name: "Carla Santos",
    age: 41,
    location: "Belo Horizonte, MG", 
    business: "Pequena fábrica de salgados",
    image: "/placeholder.svg"
  },
  {
    name: "Eduardo Martins",
    age: 38,
    location: "Curitiba, PR",
    business: "Distribuidor de bebidas", 
    image: "/placeholder.svg"
  },
  {
    name: "Patrícia Lima",
    age: 32,
    location: "Fortaleza, CE",
    business: "Prestadora de serviços",
    image: "/placeholder.svg"
  },
  {
    name: "João Santos",
    age: 45,
    location: "Porto Alegre, RS",
    business: "Comércio atacadista",
    image: "/placeholder.svg"
  }
];

interface PersonasSectionProps {
  title?: string;
  subtitle?: string;
}

export function PersonasSection({
  title = "Quem já transformou seu negócio",
  subtitle = "Histórias reais de empreendedores que superaram seus desafios"
}: PersonasSectionProps) {
  return (
    <ResponsiveSection spacing="lg">
      <ResponsiveContainer>
        <div className="text-center space-y-12">
          <div className="space-y-4">
            <h2 className="heading-section">
              {title}
            </h2>
            <p className="body-large max-w-3xl mx-auto">
              {subtitle}
            </p>
          </div>

          <ResponsiveGrid 
            cols={{ default: 1, sm: 2, lg: 3 }}
            gap="lg"
            className="max-w-6xl mx-auto"
          >
            {personas.map((persona, index) => (
              <PersonaCard
                key={index}
                name={persona.name}
                age={persona.age}
                location={persona.location}
                business={persona.business}
                image={persona.image}
                className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              />
            ))}
          </ResponsiveGrid>
        </div>
      </ResponsiveContainer>
    </ResponsiveSection>
  );
}
