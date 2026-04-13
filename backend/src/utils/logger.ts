const isDev = process.env.NODE_ENV !== 'production'

export const logger = {
  info: (msg: string, ...args: unknown[]) => {
    if (isDev) console.log(`[INFO] ${msg}`, ...args)
    else console.log(JSON.stringify({ level: 'info', message: msg, ts: new Date().toISOString() }))
  },
  debug: (msg: string, ...args: unknown[]) => {
    if (isDev) console.log(`[DEBUG] ${msg}`, ...args)
  },
  warn: (msg: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${msg}`, ...args)
  },
  error: (msg: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${msg}`, ...args)
  },
}
