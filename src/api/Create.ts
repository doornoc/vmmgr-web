import {CreateVM, InputStorage, TemplateImage, TemplateList, TemplateNIC, TemplateStorage} from "../interface";

export const CreateRequest = (req: CreateVM, template: { storages: TemplateStorage[]; list: TemplateList[]; nics: TemplateNIC[]; images: TemplateImage[] } | undefined) => {
  let req_storages: InputStorage[] = []
  let count = 0
  if (template === undefined) {
    throw new Error("template is undefined")
  }
  for (const disk of req.disk ?? []) {
    const tplStorage = template?.storages.find(storage => storage.name === disk.path)
    if (tplStorage === undefined) {
      throw new Error('Storage not found')
    }
    let typeNum = 0
    let path = disk.path
    if (tplStorage?.option.is_iso) {
      typeNum = 1
      path = disk.image!
    }
    if (count === 0) {
      let boot: string
      switch (typeNum) {
        case 1:
          boot = "cdrom"
          break
        case 2:
          boot = "fd"
          break
        default:
          boot = "hd"
      }
      req.boot = boot
    }

    req_storages.push({
      type: typeNum,
      file_type: 1,
      path: path,
      readonly: false,
      size: disk.size
    })
    count++
  }
  req.disk = req_storages

  /* NIC
    {
      type: 0,
      driver: 0,
      mode: 0,
      mac: "",
      device: tplNIC.interface
    }
   */

  return req
}

export const CreateCloudinitRequest = (req: CreateVM, template: { storages: TemplateStorage[]; list: TemplateList[]; nics: TemplateNIC[]; images: TemplateImage[] } | undefined) => {
  let req_storages: InputStorage[] = []
  if (template === undefined) {
    throw new Error("template is undefined")
  }
  for (const disk of req.disk ?? []) {
    req_storages.push({
      type: 0,
      file_type: 1,
      path: disk.path,
      readonly: false,
      size: disk.size
    })
  }

  // password check
  if (req.cloudinit?.userdata?.password !== req.cloudinit?.userdata?.password_verify) {
    throw new Error('invalid root password')
  }

  for (const user of req.cloudinit?.userdata?.users ?? []) {
    if (user.password !== undefined) {
      if (user.password !== user.password_verify) {
        throw new Error('invalid user[' + user.name + '] password')
      }
    }
  }

  req.boot = "hd"
  req.disk = req_storages

  return req
}