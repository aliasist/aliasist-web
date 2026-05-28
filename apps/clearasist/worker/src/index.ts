/**
 * Clearasist Metadata Collection Worker
 * 
 * Receives stripped metadata reports from the frontend
 * and stores them in D1 for later analysis / AI training.
 */

export interface Env {
  DB: D1Database;
}

export interface Env {
  DB: D1Database;
  ADMIN_SECRET?: string;   // Set this in Worker environment variables
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // === ADMIN ENDPOINTS (protected) ===
    if (path.startsWith('/admin')) {
      const authHeader = request.headers.get('Authorization') || '';
      const providedSecret = authHeader.replace('Bearer ', '');

      if (!env.ADMIN_SECRET || providedSecret !== env.ADMIN_SECRET) {
        return new Response('Unauthorized', { status: 401 });
      }

      // GET /admin/reports - list reports with pagination & filters
      if (path === '/admin/reports' && request.method === 'GET') {
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const fileType = url.searchParams.get('file_type');

        let query = `
          SELECT id, timestamp, filename, file_type, extension, 
                 original_size, cleaned_size, removed_count
          FROM metadata_reports
        `;
        const params: any[] = [];

        if (fileType) {
          query += ` WHERE file_type = ?`;
          params.push(fileType);
        }

        query += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const { results } = await env.DB.prepare(query).bind(...params).all();

        const countQuery = fileType 
          ? `SELECT COUNT(*) as total FROM metadata_reports WHERE file_type = ?`
          : `SELECT COUNT(*) as total FROM metadata_reports`;

        const countParams = fileType ? [fileType] : [];
        const { results: countResults } = await env.DB.prepare(countQuery).bind(...countParams).all();
        const total = countResults[0]?.total || 0;

        return new Response(JSON.stringify({ reports: results, total }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // GET /admin/reports/:id - get full report
      if (path.startsWith('/admin/reports/') && request.method === 'GET') {
        const id = path.split('/').pop();
        const report = await env.DB.prepare(
          `SELECT * FROM metadata_reports WHERE id = ?`
        ).bind(id).first();

        if (!report) {
          return new Response('Not found', { status: 404 });
        }

        return new Response(JSON.stringify(report), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      return new Response('Not Found', { status: 404 });
    }

    // === PUBLIC INGESTION (from Clearasist frontend) ===
    if (request.method === 'POST') {
      try {
        const report = await request.json();

        if (!report || typeof report !== 'object') {
          return new Response('Invalid payload', { status: 400 });
        }

        const now = new Date().toISOString();

        await env.DB.prepare(`
          INSERT INTO metadata_reports (
            timestamp, filename, file_type, extension,
            original_size, cleaned_size, removed_count,
            removed_items, raw_metadata, cleaned_metadata, user_agent
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
          .bind(
            report.timestamp || now,
            report.filename || null,
            report.file_type || null,
            report.extension || null,
            report.original_size || null,
            report.cleaned_size || null,
            report.removed_count || 0,
            report.removed_items ? JSON.stringify(report.removed_items) : null,
            report.raw_metadata ? JSON.stringify(report.raw_metadata) : null,
            report.cleaned_metadata ? JSON.stringify(report.cleaned_metadata) : null,
            request.headers.get('User-Agent') || null
          )
          .run();

        return new Response('OK', {
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
        });
      } catch (err) {
        console.error('Worker error:', err);
        return new Response('Internal Server Error', { 
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};