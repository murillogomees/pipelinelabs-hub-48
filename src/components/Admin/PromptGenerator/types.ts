
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
  type: 'user' | 'ai' | 'system' | 'initial_query' | 'technical_approval' | 'implementation' | 'build_verification';
  content: string;
  timestamp: string;
  status?: 'pending' | 'completed' | 'failed';
  metadata?: {
    prompt?: string;
    generated_code?: any;
    build_status?: 'pending' | 'success' | 'error';
    build_errors?: string[];
    suggestions?: string[];
    hasLearningContext?: boolean;
    reusedSolution?: SimilarSolution;
    appliedKnowledge?: KnowledgeEntry;
    appliedPattern?: Pattern;
  };
}

export interface ConversationState {
  currentStep: ConversationStep['type'];
  steps: ConversationStep[];
  originalPrompt: string;
  technicalAnalysis?: TechnicalAnalysis;
  implementationReport?: ImplementationReport;
  learningContext?: LearningContext;
}

export interface TechnicalAnalysis {
  affectedFiles: string[];
  impactType: 'performance' | 'security' | 'clean_code' | 'database' | 'architectural';
  impactDescription: string;
  justification: string;
  estimatedChanges: {
    files: string[];
    functions: string[];
    tables: string[];
    edgeFunctions: string[];
  };
}

export interface ImplementationReport {
  modifiedFiles: string[];
  linesChanged: Record<string, number>;
  functionsCreated: string[];
  functionsModified: string[];
  functionsRemoved: string[];
  databaseChanges: {
    tables: string[];
    fields: string[];
    indexes: string[];
  };
  edgeFunctions: string[];
  buildStatus: 'success' | 'failed' | 'running';
  buildErrors: string[];
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
  prompt?: string;
  analysis?: TechnicalAnalysis;
  implementation?: ImplementationReport;
  build_result?: BuildResult;
  user_feedback?: 'positive' | 'negative';
  improvements_made?: string[];
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

// Learning System Types
export interface LearningContext {
  similarSolutions: SimilarSolution[];
  knowledgeBase: KnowledgeEntry[];
  patterns: Pattern[];
  suggestions: string[];
}

export interface SimilarSolution {
  id: string;
  prompt: string;
  solution: string;
  tags: string[];
  similarity: number;
  usage_count: number;
  last_used: string;
  effectiveness_score: number;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  code_snippet: string;
  files_affected: string[];
  solution_type: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
  success_rate: number;
}

export interface Pattern {
  id: string;
  pattern_type: 'architectural' | 'performance' | 'security';
  description: string;
  trigger_keywords: string[];
  recommended_solution: string;
  confidence_score: number;
  examples: string[];
}

export interface BuildResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  timestamp: string;
  build_time_ms: number;
}
