import { generateKeyPairSync } from 'node:crypto';
import path from 'node:path';

export type KeyPairType = 'ed25519' | 'rsa';

export type KeyPair = {
	privateKey: string;
	publicKey: string;
};

type BuildHttpsGitConfigOptions = {
	repositoryUrl: string;
};

type BuildSshCommandOptions = {
	privateKeyPath: string;
	knownHostsPath: string;
};

const HTTPS_CREDENTIAL_HELPER =
	'!f() { printf \'%s\\n\' "username=$N8N_GIT_USERNAME" "password=$N8N_GIT_PASSWORD"; }; f';

function toPosixPath(filePath: string): string {
	return filePath.replace(/\\/g, '/');
}

function shellQuote(value: string): string {
	return `'${value.replace(/'/g, `'\"'\"'`)}'`;
}

function hostMatchesNoProxy(hostname: string, noProxy: string): boolean {
	const entries = noProxy
		.split(',')
		.map((entry) => entry.trim().toLowerCase())
		.filter(Boolean);
	const host = hostname.toLowerCase();
	return entries.some((entry) => {
		if (entry === '*') return true;
		if (entry.startsWith('.')) {
			return host === entry.slice(1) || host.endsWith(entry);
		}
		return host === entry || host.endsWith(`.${entry}`);
	});
}

function resolveHttpProxy(repositoryUrl: string): string | undefined {
	const noProxy = process.env.NO_PROXY ?? process.env.no_proxy ?? '';
	let hostname = '';
	try {
		hostname = new URL(repositoryUrl).hostname;
	} catch {
		return undefined;
	}
	if (noProxy && hostMatchesNoProxy(hostname, noProxy)) {
		return undefined;
	}

	const isHttps = repositoryUrl.toLowerCase().startsWith('https:');
	if (isHttps) {
		return (
			process.env.HTTPS_PROXY ??
			process.env.https_proxy ??
			process.env.HTTP_PROXY ??
			process.env.http_proxy
		);
	}
	return (
		process.env.HTTP_PROXY ??
		process.env.http_proxy ??
		process.env.HTTPS_PROXY ??
		process.env.https_proxy
	);
}

/**
 * Build simple-git `config` entries for HTTPS remotes.
 * Credentials are supplied via GIT env vars + an inline credential helper.
 */
export function buildHttpsGitConfig({ repositoryUrl }: BuildHttpsGitConfigOptions): string[] {
	const config = [
		`credential.helper=${HTTPS_CREDENTIAL_HELPER}`,
		'credential.useHttpPath=true',
		'http.lowSpeedLimit=1000',
		'http.lowSpeedTime=30',
	];

	const proxy = resolveHttpProxy(repositoryUrl);
	if (proxy) {
		config.push(`http.proxy=${proxy}`);
	}

	return config;
}

/**
 * Build `GIT_SSH_COMMAND` for deploy-key auth against n8n-managed known_hosts.
 */
export function buildSshCommand({
	privateKeyPath,
	knownHostsPath,
}: BuildSshCommandOptions): string {
	const key = shellQuote(toPosixPath(privateKeyPath));
	const knownHosts = shellQuote(toPosixPath(knownHostsPath));
	return [
		'ssh',
		'-o ConnectTimeout=30',
		'-o ServerAliveInterval=15',
		'-o ServerAliveCountMax=3',
		`-o UserKnownHostsFile=${knownHosts}`,
		'-o StrictHostKeyChecking=accept-new',
		`-i ${key}`,
	].join(' ');
}

/**
 * Generate an OpenSSH key pair for source-control / git deploy keys.
 */
export async function generateSshKeyPair(
	keyType: KeyPairType,
	comment = 'n8n deploy key',
): Promise<KeyPair> {
	const { default: sshpk } = await import('sshpk');

	const generated =
		keyType === 'ed25519'
			? generateKeyPairSync('ed25519', {
					publicKeyEncoding: { type: 'spki', format: 'pem' },
					privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
				})
			: generateKeyPairSync('rsa', {
					modulusLength: 4096,
					publicKeyEncoding: { type: 'spki', format: 'pem' },
					privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
				});

	const publicKey = sshpk.parseKey(generated.publicKey, 'pem');
	publicKey.comment = comment;
	const privateKey = sshpk.parsePrivateKey(generated.privateKey, 'pem');

	return {
		publicKey: publicKey.toString('ssh'),
		privateKey: privateKey.toString('ssh'),
	};
}

/** Path helper kept for callers that need known_hosts next to the private key. */
export function defaultKnownHostsPath(sshFolder: string): string {
	return path.join(sshFolder, 'known_hosts');
}
