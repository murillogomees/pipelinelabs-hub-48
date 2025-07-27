
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
  buildStatus: 'success' | 'failed' | 'pending';
  buildErrors?: string[];
}

export interface ConversationState {
  currentStep: ConversationStep['type'];
  steps: ConversationStep[];
  technicalAnalysis?: TechnicalAnalysis;
  implementationReport?: ImplementationReport;
  originalPrompt: string;
  logId?: string;
}
