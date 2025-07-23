import React from 'react';
import { EnhancedCard, StatsCard, ListCard } from '@/components/ui/composed';
import type { UIAction } from '@/components/ui/composed';

// Re-export for backward compatibility
export const BaseCard = EnhancedCard;
export const BaseStatsCard = StatsCard;
export const BaseListCard = ListCard;
export type BaseCardAction = UIAction;
