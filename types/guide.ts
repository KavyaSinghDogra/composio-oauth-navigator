export interface OAuthGuide {
  slug: string;
  appName: string;
  developerPortalUrl: string;
  category: string;
  complexity: 'Low' | 'Medium' | 'High' | 'Gatekept';
  estimatedEffort: {
    setupTime: string;
    approvalWaitTime: string;
  };
  prerequisites: {
    requiresPaidAccount: boolean;
    requiresDomainVerification: boolean;
    requiresPrivacyPolicyUrl: boolean;
    requiresVideoDemo: boolean;
  };
  divisionOfLabor: {
    agentCanAutomate: string[];
    humanRequired: string[];
  };
  steps: Array<{
    stepNumber: number;
    title: string;
    instructions: string;
    gotchas: string;
  }>;
  evidence: {
    confidenceLevel: 'High (Verified Docs)' | 'Medium (Inferred from Docs)' | 'Uncertain / Community Sourced';
    verifiedSources: string[];
    uncertainties: string[];
  };
}