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

export interface TemplateStorage {
  name: string
  comment: string
  path: string
  option: {
    is_iso: boolean
    is_cloudimg: boolean
  }
}

export interface TemplateList {
  name: string
  base_path: string
  path: string[]
}

export interface TemplateNIC {
  name: string
  comment: string
  interface: string
}

export interface TemplateImage {
  name: string
  comment: string
  disable: boolean
  path: string
  spec_plans: {
    name: string
    disable: boolean
    arch: string
    cpu: number
    memory: number
  }[]
  storage_plans: {
    name: string
    disable: boolean
    storage_id: string
    size: number[]
    option: {
      is_not_extension: boolean
    }
  }[]
}

export interface CreateVM {
  name: string
  is_cloudinit: boolean
  arch?: number
  cpu: number
  memory: number
  boot?: string
  disk?: InputStorage[]
  nic?: InputNIC[]
  cloudinit?: InputCloutinit
}

export interface InputStorage {
  type?: number
  file_type?: number
  path: string
  readonly?: boolean
  size: number
  // tmp key
  image?: string
}

export interface InputNIC {
  //tmp
  type?: string
  driver?: string
  mode?: string
  mac?: string
  device?: string

  cloudinit?: InputCloudinitNIC
}

export interface InputCloudinitNIC {
  name: string
  address: string
  netmask: string
  gateway: string
  dns?: string[]
}

export interface InputCloudinitUser {
  name: string
  password: string
  password_verify: string
  groups?: string
  shell?: string
  sudo?: string[]
  ssh_authorized_keys?: string[]
  ssh_pwauth?: boolean
  lock_passwd?: boolean
}

export interface InputCloutinit {
  id: string,
  image_copy: string
  name: string
  userdata?: InputCloudinitUserData
}

export interface InputCloudinitUserData {
  packages_update?: boolean
  packages_upgrade?: boolean
  packages?: string[]
  user?: string
  password?: string
  password_verify?: string
  ssh_pwauth?: boolean
  ssh_authorized_keys?: string[]
  users?: InputCloudinitUser[]
}

export interface Result {
  id?: number
  error?: string
  created_at: string
  type: number
  uuid: string
  data?: any
  vm_detail?: any
}