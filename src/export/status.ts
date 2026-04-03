import { StarbaseDBConfiguration } from '../handler'
import { DataSource } from '../types'
import { createResponse } from '../utils'
import { DumpStatusResponse, DumpState } from './types'

export async function dumpStatusRoute(
    taskId: string,
    dataSource: DataSource,
    config: StarbaseDBConfiguration
): Promise<Response> {
    try {
        // Assume we'll add getInternalState to RPC
        const dumpState = (await dataSource.rpc.getInternalState(
            `dump_state_${taskId}`
        )) as DumpState

        if (!dumpState) {
            return createResponse(undefined, 'Task not found', 404)
        }

        const response: DumpStatusResponse = {
            task_id: taskId,
            status: dumpState.status,
            progress: {
                tables_completed: dumpState.currentTableIndex,
                total_tables: dumpState.tables.length,
            },
        }

        if (dumpState.status === 'completed') {
            response.download_url = `/export/download/${taskId}`
        } else if (dumpState.status === 'failed') {
            response.error = dumpState.error
        }

        return createResponse<DumpStatusResponse>(response, undefined, 200)
    } catch (error: any) {
        console.error('Dump Status Error:', error)
        return createResponse(undefined, 'Failed to get dump status', 500)
    }
}

export async function downloadDumpRoute(
    taskId: string,
    env: any
): Promise<Response> {
    try {
        const object = await env.R2_BUCKET.get(`dumps/${taskId}.sql`);

        if (!object) {
            return createResponse(undefined, 'Dump file not found', 404);
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Content-Type', 'application/x-sqlite3');
        headers.set('Content-Disposition', `attachment; filename="database_dump_${taskId}.sql"`);

        return new Response(object.body, {
            headers,
        });
    } catch (error: any) {
        console.error('Download Dump Error:', error);
        return createResponse(undefined, 'Failed to download dump', 500);
    }
}
