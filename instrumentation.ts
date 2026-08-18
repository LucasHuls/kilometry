declare global {
  // eslint-disable-next-line no-var
  var __kilometrySchedulerStarted: boolean | undefined
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (globalThis.__kilometrySchedulerStarted) return
  globalThis.__kilometrySchedulerStarted = true

  const { startScheduler } = await import('./lib/scheduler')
  startScheduler()
}
