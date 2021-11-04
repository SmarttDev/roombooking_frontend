//@ts-nocheck
export const classNames = (...classes: any[]) => {
  return classes.filter(Boolean).join(' ')
}

export const shorter = (str: string) =>
  str?.length > 8 ? str.slice(0, 6) + '...' + str.slice(-4) : str
