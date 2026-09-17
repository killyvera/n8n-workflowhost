/**
 * Single source of truth for BOTO Workflow Host product identity.
 * Technical package names stay `n8n*` for compatibility.
 */
export const BOTO_BRANDING = {
	productName: 'BOTO Workflow Host',
	shortName: 'BOTO Workflow',
	companyName: 'BOTO Technologies',
	tagline: 'Workflow & Agent Orchestration',
	poweredBy: 'Powered by BOTO',
	basedOn: 'Based on n8n',
	modifiedDistribution: true,
	/** Company / marketing site */
	website: 'https://bototech.com.mx',
	/** Hosting / deploy / VM service identity (Muelle / production) */
	hosting: 'https://workflowhost.com',
	hostingName: 'workflowhost.com',
	repository: 'https://github.com/killyvera/n8n-workflowhost',
	upstreamRepository: 'https://github.com/n8n-io/n8n',
	licensePath: '/LICENSE.md',
} as const;

export type BotoBranding = typeof BOTO_BRANDING;
