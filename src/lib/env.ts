export const isBrowser = typeof window !== 'undefined'

export const prefersReducedMotion = () =>
  isBrowser && matchMedia('(prefers-reduced-motion: reduce)').matches

export const hasFinePointer = () =>
  isBrowser && matchMedia('(hover: hover) and (pointer: fine)').matches

/** Data-saver, slow network or modest hardware → skip the purely decorative work. */
export const isLowPower = () => {
  if (!isBrowser) return true
  const n = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number }
  return !!n.connection?.saveData
    || /(^|-)2g|3g/.test(n.connection?.effectiveType ?? '')
    || (n.hardwareConcurrency ?? 8) <= 4
    || (n.deviceMemory ?? 8) <= 4
}

export const idle = (cb: () => void, timeout = 1500) =>
  'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout }) : setTimeout(cb, 200)
