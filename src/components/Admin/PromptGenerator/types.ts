
import { Json } from '@/integrations/supabase/types';

export interface PromptLog {
  id: string;
  prompt: string;
  generated_code: Json;
  status: 'pending' | 'applied' | 'rolled_back' | 'error';
  created_at: string;
  applied_at?: string;
  rolled_back_at?: string;
  error_message?: string;
  user_id: string;
  company_id: string;
  model_used: string;
  temperature: number;
  applied_files: string[];
  rollback_data?: Json;
}

export interface ConversationStep {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    prompt?: string;
    generated_code?: any;
    build_status?: 'pending' | 'success' | 'error';
    build_errors?: string[];
    suggestions?: string[];
  };
}

export interface LearningSession {
  id: string;
  session_id: string;
  user_id: string;
  company_id: string;
  query: string;
  response: string;
  context: Json;
  feedback_score?: number;
  feedback_comment?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  effectiveness_score: number;
  usage_count: number;
  last_used: string;
  created_at: string;
  updated_at: string;
}

export interface SimilarityPattern {
  id: string;
  pattern_hash: string;
  pattern_type: 'query' | 'solution' | 'error';
  pattern_data: Json;
  similarity_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface BuildStatus {
  status: 'pending' | 'success' | 'error';
  errors?: string[];
  warnings?: string[];
  timestamp: string;
}

export interface GeneratedCode {
  files: {
    path: string;
    content: string;
    action: 'create' | 'update' | 'delete';
  }[];
  dependencies?: string[];
  explanation: string;
  warnings?: string[];
}

export interface PromptGeneratorConfig {
  defaultModel: string;
  defaultTemperature: number;
  maxTokens: number;
  enableBuildVerification: boolean;
  enableLearning: boolean;
  enableSimilarityCheck: boolean;
}
