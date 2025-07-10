import { INTEGRATION_TYPES, INTEGRATION_TYPE_COLORS, type IntegrationType } from './types';

export const getTypeColor = (type: string) => {
  return INTEGRATION_TYPE_COLORS[type as IntegrationType] || INTEGRATION_TYPE_COLORS.personalizada;
};

export const getTypeLabel = (type: string) => {
  return INTEGRATION_TYPES[type as IntegrationType] || 'Outro';
};

export const parseConfigSchema = (schema: any) => {
  try {
    if (Array.isArray(schema)) {
      return schema.filter(field => 
        field && typeof field === 'object' && 
        'field' in field && 'type' in field && 'label' in field
      );
    }
    return [];
  } catch {
    return [];
  }
};