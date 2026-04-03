export interface DumpState {
    taskId: string
    tables: string[]
    currentTableIndex: number
    currentRowOffset: number
    uploadId?: string
    parts: any[]
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
    error?: string
}

export interface DumpResponse {
    task_id: string
}

export interface DumpStatusResponse {
    task_id: string
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
    progress: {
        tables_completed: number
        total_tables: number
    }
    download_url?: string
    error?: string
}
