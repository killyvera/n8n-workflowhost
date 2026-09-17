import { Service } from '@n8n/di';

export type LlmJudgeProvider = {
	nodeType: string;
	credentialTypes: string[];
};

const PROVIDERS: LlmJudgeProvider[] = [
	{
		nodeType: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
		credentialTypes: ['openAiApi'],
	},
	{
		nodeType: '@n8n/n8n-nodes-langchain.lmChatAnthropic',
		credentialTypes: ['anthropicApi'],
	},
	{
		nodeType: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
		credentialTypes: ['googlePalmApi'],
	},
];

/**
 * Minimal fixed-list registry so Instance AI metric provider resolution still works.
 */
@Service()
export class LlmJudgeProviderRegistry {
	getByCredentialType(credentialType: string): LlmJudgeProvider | undefined {
		return PROVIDERS.find((provider) => provider.credentialTypes.includes(credentialType));
	}

	getAll(): LlmJudgeProvider[] {
		return [...PROVIDERS];
	}
}
