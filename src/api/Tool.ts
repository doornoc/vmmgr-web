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
