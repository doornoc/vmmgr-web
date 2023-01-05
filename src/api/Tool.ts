export const arrayMove = (data: any[], oldIndex: number, newIndex: number) => {
  if (newIndex >= data.length) {
    let k = newIndex - data.length + 1
    while (k--) {
      data.push(undefined)
    }
  }
  data.splice(newIndex, 0, data.splice(oldIndex, 1)[0])
  return data
}

export const getArchID = (arch: string) => {
  switch (arch) {
    case 'x86':
      return 1
    case 'aarch64':
      return 2
    case 'ppc64le':
      return 3
    default:
      return 0
  }
}