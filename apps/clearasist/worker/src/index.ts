/**
 * Clearasist Metadata Collection Worker
 *
 * Receives stripped metadata reports from the frontend
 * and stores them in D1 for later analysis / AI training.
 */

export interface Env {
  DB: D1Database;
  ADMIN_SECRET?: string;
}

const MAX_REPORT_BODY_CHARS = 512_000;
const MAX_NOTES_CHARS = 4_000;
const MAX_BULK_DELETE_IDS = 200;

function parseReportId(path: string): number | null {
  const rawId = path.split('/').pop() || '';
  if (!/^\d+$/.test(rawId)) return null;

  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
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
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
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
        const search = url.searchParams.get('search')?.trim();
        const fromDate = url.searchParams.get('from');
        const toDate = url.searchParams.get('to');
        const sort = url.searchParams.get('sort') || 'timestamp_desc';

        let whereClauses: string[] = [];
        const params: any[] = [];

        if (fileType) {
          whereClauses.push('file_type = ?');
          params.push(fileType);
        }

        if (search) {
          whereClauses.push('filename LIKE ?');
          params.push(`%${search}%`);
        }

        if (fromDate) {
          whereClauses.push('timestamp >= ?');
          params.push(fromDate);
        }

        if (toDate) {
          whereClauses.push('timestamp <= ?');
          params.push(toDate);
        }

        let where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Sorting
        let orderBy = 'ORDER BY timestamp DESC';
        if (sort === 'removed_desc') orderBy = 'ORDER BY removed_count DESC, timestamp DESC';
        if (sort === 'removed_asc') orderBy = 'ORDER BY removed_count ASC, timestamp DESC';
        if (sort === 'size_desc') orderBy = 'ORDER BY original_size DESC, timestamp DESC';

        const query = `
          SELECT id, timestamp, filename, file_type, extension,
                 original_size, cleaned_size, removed_count, partials
          FROM metadata_reports
          ${where}
          ${orderBy}
          LIMIT ? OFFSET ?
        `;
        params.push(limit, offset);

        const { results } = await env.DB.prepare(query).bind(...params).all();

        const countQuery = `
          SELECT COUNT(*) as total
          FROM metadata_reports
          ${where}
        `;
        const countParams = params.slice(0, params.length - 2);
        const { results: countResults } = await env.DB.prepare(countQuery).bind(...countParams).all();
        const total = countResults[0]?.total || 0;

        return new Response(JSON.stringify({ reports: results, total }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // GET /admin/reports/:id - get full report
      if (path.startsWith('/admin/reports/') && request.method === 'GET') {
        const id = parseReportId(path);
        if (!id) return new Response('Invalid report ID', { status: 400 });

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

      // PATCH /admin/reports/:id - update tags or notes
      if (path.startsWith('/admin/reports/') && request.method === 'PATCH') {
        try {
          const id = parseReportId(path);
          if (!id) return new Response('Invalid report ID', { status: 400 });

          const body = await request.json();

          const updates: string[] = [];
          const params: any[] = [];

          if (body.tags !== undefined) {
            if (!Array.isArray(body.tags) || !body.tags.every((tag: unknown) => typeof tag === 'string')) {
              return new Response('Tags must be an array of strings', { status: 400 });
            }
            updates.push('tags = ?');
            params.push(JSON.stringify(body.tags));
          }
          if (body.notes !== undefined) {
            if (typeof body.notes !== 'string' || body.notes.length > MAX_NOTES_CHARS) {
              return new Response(`Notes must be a string up to ${MAX_NOTES_CHARS} characters`, { status: 400 });
            }
            updates.push('notes = ?');
            params.push(body.notes);
          }

          if (updates.length === 0) {
            return new Response('No updates provided', { status: 400 });
          }

          params.push(id);

          await env.DB.prepare(`
            UPDATE metadata_reports
            SET ${updates.join(', ')}
            WHERE id = ?
          `).bind(...params).run();

          const updated = await env.DB.prepare(`SELECT * FROM metadata_reports WHERE id = ?`).bind(id).first();
          if (!updated) return new Response('Not found', { status: 404 });

          return new Response(JSON.stringify(updated), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        } catch (err) {
          return new Response('Invalid update request', { status: 400 });
        }
      }

      // DELETE /admin/reports/:id - delete one report
      if (path.startsWith('/admin/reports/') && request.method === 'DELETE') {
        const id = parseReportId(path);
        if (!id) return new Response('Invalid report ID', { status: 400 });

        const result = await env.DB.prepare(`DELETE FROM metadata_reports WHERE id = ?`).bind(id).run();
        if (!result.meta.changes) return new Response('Not found', { status: 404 });

        return new Response('Deleted', {
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
        });
      }

      // POST /admin/reports/bulk-delete - delete by ids or filters
      if (path === '/admin/reports/bulk-delete' && request.method === 'POST') {
        try {
          const body = await request.json();

          if (body.ids && Array.isArray(body.ids)) {
            if (
              body.ids.length === 0 ||
              body.ids.length > MAX_BULK_DELETE_IDS ||
              !body.ids.every((id: unknown) => Number.isSafeInteger(id) && Number(id) > 0)
            ) {
              return new Response(`IDs must contain 1 to ${MAX_BULK_DELETE_IDS} positive integers`, { status: 400 });
            }

            const placeholders = body.ids.map(() => '?').join(',');
            await env.DB.prepare(`DELETE FROM metadata_reports WHERE id IN (${placeholders})`).bind(...body.ids).run();
          } else if (body.filters && typeof body.filters === 'object') {
            const whereClauses: string[] = [];
            const params: any[] = [];

            if (body.filters.file_type) {
              whereClauses.push('file_type = ?');
              params.push(body.filters.file_type);
            }
            if (body.filters.from) {
              whereClauses.push('timestamp >= ?');
              params.push(body.filters.from);
            }
            if (body.filters.to) {
              whereClauses.push('timestamp <= ?');
              params.push(body.filters.to);
            }
            if (body.filters.search) {
              whereClauses.push('filename LIKE ?');
              params.push(`%${body.filters.search}%`);
            }

            if (whereClauses.length === 0) {
              return new Response('At least one bulk-delete filter is required', { status: 400 });
            }

            const where = `WHERE ${whereClauses.join(' AND ')}`;
            await env.DB.prepare(`DELETE FROM metadata_reports ${where}`).bind(...params).run();
          } else {
            return new Response('Provide report IDs or at least one filter', { status: 400 });
          }

          return new Response('Bulk delete completed', {
            status: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
          });
        } catch (err) {
          return new Response('Invalid bulk delete request', { status: 400 });
        }
      }

      return new Response('Not Found', { status: 404 });
    }

    // === PUBLIC INGESTION (from Clearasist frontend) ===
    if (request.method === 'POST') {
      try {
        const rawBody = await request.text();
        if (rawBody.length > MAX_REPORT_BODY_CHARS) {
          return new Response('Payload too large', { status: 413 });
        }

        let report;
        try {
          report = JSON.parse(rawBody);
        } catch {
          return new Response('Invalid payload', { status: 400 });
        }

        if (!report || typeof report !== 'object') {
          return new Response('Invalid payload', { status: 400 });
        }

        const now = new Date().toISOString();

        await env.DB.prepare(`
          INSERT INTO metadata_reports (
            timestamp, filename, file_type, extension,
            original_size, cleaned_size, removed_count,
            removed_items, raw_metadata, cleaned_metadata, partials, user_agent
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            report.partial ? JSON.stringify(report.partial) : null,
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
