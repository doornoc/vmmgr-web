export interface WebSocketResult {
    id: number
    err: string
    created_at: string
    type: number
    uuid: string
    vm_detail: VMDetail[]
    data: any
}

export interface VMDetail {
    vm: any
    stat: number
    node: string
}
