#!/usr/bin/env node
/**
 * Smoke test against a running n8n-workflowhost instance.
 * Usage: node scripts/smoke-workflowhost.mjs [baseUrl]
 */
const base = (process.argv[2] || 'http://127.0.0.1:5678').replace(/\/$/, '');

async function req(path, opts = {}) {
	const res = await fetch(`${base}${path}`, {
		...opts,
		headers: {
			'content-type': 'application/json',
			...(opts.headers || {}),
		},
	});
	const text = await res.text();
	let body;
	try {
		body = text ? JSON.parse(text) : null;
	} catch {
		body = text;
	}
	return { status: res.status, ok: res.ok, body, headers: res.headers };
}

function assert(cond, msg) {
	if (!cond) throw new Error(msg);
}

function cookieFrom(res) {
	const setCookie = res.headers.getSetCookie?.() || [];
	return setCookie.map((c) => c.split(';')[0]).join('; ');
}

async function main() {
	console.log(`Smoke against ${base}`);

	const health = await req('/healthz');
	assert(health.ok, `healthz failed: ${health.status}`);
	console.log('OK healthz');

	const settings = await req('/rest/settings');
	assert(settings.ok, `settings failed: ${settings.status}`);
	const data = settings.body?.data || settings.body || {};
	const enterprise = data.enterprise || {};
	const license = data.license || {};
	console.log('plan/license:', license.planName || license);
	console.log('enterprise.sharing:', enterprise.sharing);
	console.log('Local entitlements fork — settingsMode:', data.settingsMode);

	const ownerEmail = process.env.SMOKE_EMAIL || 'admin@workflowhost.local';
	const ownerPassword = process.env.SMOKE_PASSWORD || 'WorkflowHost!Smoke1';

	let cookie = '';
	const setup = await req('/rest/owner/setup', {
		method: 'POST',
		body: JSON.stringify({
			email: ownerEmail,
			firstName: 'Workflow',
			lastName: 'Host',
			password: ownerPassword,
		}),
	});

	let userEmail = ownerEmail;

	if (setup.status === 200 || setup.status === 201) {
		console.log('OK owner setup created');
		cookie = cookieFrom(setup);
		userEmail = setup.body?.data?.email || setup.body?.email || ownerEmail;
	} else if (setup.status === 400 || setup.status === 403) {
		console.log('Owner already exists, logging in…');
		const login = await req('/rest/login', {
			method: 'POST',
			body: JSON.stringify({ emailOrLdapLoginId: ownerEmail, password: ownerPassword }),
		});
		assert(login.ok, `login failed: ${login.status} ${JSON.stringify(login.body)}`);
		cookie = cookieFrom(login);
		userEmail = login.body?.data?.email || login.body?.email || ownerEmail;
		console.log('OK login');
	} else {
		throw new Error(`owner setup unexpected: ${setup.status} ${JSON.stringify(setup.body)}`);
	}

	assert(cookie, 'missing session cookie');
	console.log('OK user', userEmail);

	const auth = { headers: { cookie } };

	const settingsAuth = await req('/rest/settings', auth);
	assert(settingsAuth.ok, `authenticated settings failed: ${settingsAuth.status}`);
	console.log('OK authenticated settings');

	const wfName = `smoke-${Date.now()}`;
	const create = await req('/rest/workflows', {
		method: 'POST',
		...auth,
		headers: { ...auth.headers, 'content-type': 'application/json' },
		body: JSON.stringify({
			name: wfName,
			nodes: [
				{
					id: '1',
					name: 'Manual',
					type: 'n8n-nodes-base.manualTrigger',
					typeVersion: 1,
					position: [0, 0],
					parameters: {},
				},
			],
			connections: {},
			settings: {},
		}),
	});
	assert(create.ok, `create workflow failed: ${create.status} ${JSON.stringify(create.body)}`);
	const wfId = create.body?.data?.id || create.body?.id;
	console.log('OK workflow created', wfId);

	const list = await req('/rest/workflows?limit=5', auth);
	assert(list.ok, `list workflows failed: ${list.status}`);
	console.log('OK workflows list count=', list.body?.count ?? list.body?.data?.length);

	console.log('\nSMOKE PASS');
}

main().catch((err) => {
	console.error('SMOKE FAIL', err);
	process.exit(1);
});
