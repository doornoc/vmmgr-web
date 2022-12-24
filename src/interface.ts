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

export interface Hosts {
  user: string
  host_name: string
}

export interface Storages {
  name: string
  comment: string
  path: string
  option: {
    is_iso: boolean
    is_cloudimg: boolean
  }
}

export interface ImageLists {
  name: string
  base_path: string
  path: string[]
}

export interface NICs {
  name: string
  comment: string
  interface: string
}
