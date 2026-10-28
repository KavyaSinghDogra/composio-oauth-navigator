import { OAuthGuide } from '@/types/guide';

export const INITIAL_GUIDES: Record<string, OAuthGuide> = {
  notion: {
    slug: 'notion',
    appName: 'Notion',
    developerPortalUrl: 'https://www.notion.so/my-integrations',
    category: 'Productivity',
    complexity: 'Low',
    estimatedEffort: {
      setupTime: '10 minutes',
      approvalWaitTime: 'Instant (No review required for internal use)'
    },
    prerequisites: {
      requiresPaidAccount: false,
      requiresDomainVerification: false,
      requiresPrivacyPolicyUrl: true,
      requiresVideoDemo: false
    },
    divisionOfLabor: {
      agentCanAutomate: [
        'Generate redirect URIs and callback handlers',
        'Map requested Notion block/database permissions to scope sets'
      ],
      humanRequired: [
        'Log in to workspace with admin rights',
        'Toggle integration from Internal to Public'
      ]
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Create Integration in My Integrations',
        instructions: 'Head to the developer portal and click "+ New integration". Choose your associated workspace.',
        gotchas: 'Default integrations are Internal. They only connect to your own workspace until toggled to Public.'
      },
      {
        stepNumber: 2,
        title: 'Configure OAuth Settings',
        instructions: 'Under "Distribution", toggle to Public. Fill in Company Name, Homepage, and Privacy Policy URL.',
        gotchas: 'Redirect URIs must match your callback URL exactly, including HTTPS.'
      }
    ],
    evidence: {
      confidenceLevel: 'High (Verified Docs)',
      verifiedSources: ['https://developers.notion.com/docs/authorization'],
      uncertainties: ['Internal integrations do not support standard multi-tenant OAuth.']
    }
  },
  slack: {
    slug: 'slack',
    appName: 'Slack',
    developerPortalUrl: 'https://api.slack.com/apps',
    category: 'Communication',
    complexity: 'Medium',
    estimatedEffort: {
      setupTime: '15 minutes',
      approvalWaitTime: 'Instant (Workspace level) / 2-3 weeks (App Directory listing)'
    },
    prerequisites: {
      requiresPaidAccount: false,
      requiresDomainVerification: false,
      requiresPrivacyPolicyUrl: true,
      requiresVideoDemo: false
    },
    divisionOfLabor: {
      agentCanAutomate: [
        'Generate the complete App Manifest (YAML/JSON) with scopes, redirect URLs, and event subscriptions',
        'Instantly validate manifest syntax'
      ],
      humanRequired: [
        'Install app into Slack workspace',
        'Approve workspace permissions'
      ]
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Create App from Manifest',
        instructions: 'Go to api.slack.com/apps, click "Create New App", and select "From an app manifest". Paste the agent-generated YAML.',
        gotchas: 'Using manifests avoids manually clicking through 20+ checkboxes in the UI.'
      },
      {
        stepNumber: 2,
        title: 'Install to Workspace',
        instructions: 'Navigate to "Install App" and click "Install to Workspace" to obtain bot and user OAuth tokens.',
        gotchas: 'If requesting user tokens alongside bot tokens, granular scopes must be requested individually.'
      }
    ],
    evidence: {
      confidenceLevel: 'High (Verified Docs)',
      verifiedSources: ['https://api.slack.com/authentication/oauth-v2'],
      uncertainties: ['Slack App Directory submission requires manual team review and security screening.']
    }
  },
  google: {
    slug: 'google',
    appName: 'Google Cloud (Drive / Gmail)',
    developerPortalUrl: 'https://console.cloud.google.com/apis/credentials',
    category: 'Cloud Services',
    complexity: 'Gatekept',
    estimatedEffort: {
      setupTime: '30 minutes',
      approvalWaitTime: 'Instant (Testing mode, 100 users) / 3-6 weeks (Verification & CASA Security Review)'
    },
    prerequisites: {
      requiresPaidAccount: false,
      requiresDomainVerification: true,
      requiresPrivacyPolicyUrl: true,
      requiresVideoDemo: true
    },
    divisionOfLabor: {
      agentCanAutomate: [
        'Identify minimal necessary OAuth scopes (to avoid restricted tiers)',
        'Draft OAuth consent screen text and application privacy descriptions'
      ],
      humanRequired: [
        'Complete DNS domain verification via Google Search Console',
        'Record and submit unlisted YouTube demo showing client ID in the browser URL bar'
      ]
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Configure OAuth Consent Screen',
        instructions: 'Choose External user type. Fill in app name, support email, and authorized domains.',
        gotchas: 'Leaving app in "Testing" limits access to 100 manually added test users.'
      },
      {
        stepNumber: 2,
        title: 'Scope Selection & App Verification',
        instructions: 'Add scopes for Gmail/Drive. If selecting restricted scopes, complete verification.',
        gotchas: 'Restricted scopes trigger Cloud Application Security Assessment (CASA) Tier 2 or 3, potentially incurring third-party lab audit costs.'
      }
    ],
    evidence: {
      confidenceLevel: 'High (Verified Docs)',
      verifiedSources: ['https://support.google.com/cloud/answer/10311685'],
      uncertainties: ['Audit fees for CASA assessments can vary from free self-scans to $15,000+ for Tier 3.']
    }
  }
};