
export interface ConversationStep {
  id: string;
  type: 'initial_query' | 'technical_approval' | 'implementation' | 'build_verification';
  status: 'pending' | 'completed' | 'failed';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface TechnicalAnalysis {
  affectedFiles: string[];
  impactType: 'performance' | 'security' | 'clean_code' | 'database' | 'architecture';
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
  buildStatus: 'success' | 'failed' | 'pending' | 'running';
  buildErrors?: string[];
}

export interface ConversationState {
  currentStep: ConversationStep['type'];
  steps: ConversationStep[];
  technicalAnalysis?: TechnicalAnalysis;
  implementationReport?: ImplementationReport;
  originalPrompt: string;
  logId?: string;
  learningContext?: LearningContext;
}

export interface PromptLog {
  id: string;
  prompt: string;
  generated_code: any;
  status: 'pending' | 'applied' | 'rolled_back' | 'error';
  created_at: string;
  applied_at?: string;
  rolled_back_at?: string;
  error_message?: string;
  user_id: string;
  company_id: string;
  model_used: string;
  temperature: number;
  applied_files?: string[];
  rollback_data?: any;
}

// Novas interfaces para aprendizado contínuo
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
  pattern_type: 'architectural' | 'security' | 'performance' | 'code_style';
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

export interface LearningSession {
  id: string;
  prompt: string;
  context: LearningContext;
  analysis: TechnicalAnalysis;
  implementation: ImplementationReport;
  build_result: BuildResult;
  user_feedback?: 'positive' | 'negative';
  improvements_made: string[];
  created_at: string;
}
