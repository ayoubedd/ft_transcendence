export function debounce(func: Function, wait: number, immediate: boolean, ...args: any[]) {
  let timeout: any
  return function (this: any) {
    const context = this
    const later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

export function dateToTimestamp(date: string) {
  return new Date(date).getTime()
}

export function formatDate(date: string) {
  return Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hour12: true
  }).format(new Date(date))
}
