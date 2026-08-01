export interface Env {
	DB: D1Database;
	ALLOWED_ORIGINS: string;
	UPDATES_ADMIN_TOKEN?: string;
}

interface UpdateRow {
	id: string;
	kind: string;
	date: string;
	title: string;
	body: string;
	href: string | null;
	created_at: string;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function corsHeaders(origin: string | null, env: Env): HeadersInit {
	const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
	const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0];
	return {
		'Access-Control-Allow-Origin': allowOrigin,
		'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type,Authorization',
		Vary: 'Origin',
	};
}

function json(data: unknown, status: number, origin: string | null, env: Env): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', ...corsHeaders(origin, env) },
	});
}

function requireAdmin(request: Request, env: Env): boolean {
	if (!env.UPDATES_ADMIN_TOKEN) return false;
	const auth = request.headers.get('Authorization') || '';
	const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
	return token === env.UPDATES_ADMIN_TOKEN;
}

function encodeCursor(row: UpdateRow): string {
	return btoa(`${row.date}|${row.created_at}|${row.id}`);
}

function decodeCursor(cursor: string): { date: string; created_at: string; id: string } | null {
	try {
		const [date, created_at, id] = atob(cursor).split('|');
		if (!date || !created_at || !id) return null;
		return { date, created_at, id };
	} catch {
		return null;
	}
}

async function handleList(request: Request, env: Env, origin: string | null): Promise<Response> {
	const url = new URL(request.url);
	const limit = Math.min(MAX_LIMIT, Math.max(1, Number(url.searchParams.get('limit')) || DEFAULT_LIMIT));
	const cursorParam = url.searchParams.get('cursor');
	const cursor = cursorParam ? decodeCursor(cursorParam) : null;

	let query = 'SELECT * FROM updates';
	const params: unknown[] = [];
	if (cursor) {
		query += ' WHERE (date, created_at, id) < (?, ?, ?)';
		params.push(cursor.date, cursor.created_at, cursor.id);
	}
	query += ' ORDER BY date DESC, created_at DESC, id DESC LIMIT ?';
	params.push(limit + 1);

	const { results } = await env.DB.prepare(query)
		.bind(...params)
		.all<UpdateRow>();

	const hasMore = results.length > limit;
	const items = hasMore ? results.slice(0, limit) : results;
	const nextCursor = hasMore ? encodeCursor(items[items.length - 1]) : null;

	return json({ items, nextCursor }, 200, origin, env);
}

async function handleCreate(request: Request, env: Env, origin: string | null): Promise<Response> {
	if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, origin, env);

	const body = (await request.json().catch(() => null)) as Partial<UpdateRow> | null;
	if (!body || !body.title || !body.body || !body.date) {
		return json({ error: 'title, body, and date are required' }, 400, origin, env);
	}

	const row: UpdateRow = {
		id: crypto.randomUUID(),
		kind: body.kind === 'event' ? 'event' : 'update',
		date: body.date,
		title: body.title,
		body: body.body,
		href: body.href || null,
		created_at: new Date().toISOString(),
	};

	await env.DB.prepare(
		'INSERT INTO updates (id, kind, date, title, body, href, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
	)
		.bind(row.id, row.kind, row.date, row.title, row.body, row.href, row.created_at)
		.run();

	return json(row, 201, origin, env);
}

async function handleUpdate(request: Request, env: Env, origin: string | null, id: string): Promise<Response> {
	if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, origin, env);

	const existing = await env.DB.prepare('SELECT * FROM updates WHERE id = ?').bind(id).first<UpdateRow>();
	if (!existing) return json({ error: 'Not found' }, 404, origin, env);

	const body = (await request.json().catch(() => null)) as Partial<UpdateRow> | null;
	if (!body) return json({ error: 'Invalid body' }, 400, origin, env);

	const merged: UpdateRow = {
		...existing,
		kind: body.kind === 'event' ? 'event' : body.kind === 'update' ? 'update' : existing.kind,
		date: body.date ?? existing.date,
		title: body.title ?? existing.title,
		body: body.body ?? existing.body,
		href: body.href !== undefined ? body.href : existing.href,
	};

	await env.DB.prepare('UPDATE updates SET kind = ?, date = ?, title = ?, body = ?, href = ? WHERE id = ?')
		.bind(merged.kind, merged.date, merged.title, merged.body, merged.href, id)
		.run();

	return json(merged, 200, origin, env);
}

async function handleDelete(request: Request, env: Env, origin: string | null, id: string): Promise<Response> {
	if (!requireAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, origin, env);

	await env.DB.prepare('DELETE FROM updates WHERE id = ?').bind(id).run();
	return json({ ok: true }, 200, origin, env);
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const origin = request.headers.get('Origin');
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
		}

		const match = url.pathname.match(/^\/api\/updates(?:\/([^/]+))?$/);
		if (!match) return json({ error: 'Not found' }, 404, origin, env);
		const id = match[1];

		if (request.method === 'GET' && !id) return handleList(request, env, origin);
		if (request.method === 'POST' && !id) return handleCreate(request, env, origin);
		if (request.method === 'PUT' && id) return handleUpdate(request, env, origin, id);
		if (request.method === 'DELETE' && id) return handleDelete(request, env, origin, id);

		return json({ error: 'Method not allowed' }, 405, origin, env);
	},
} satisfies ExportedHandler<Env>;
