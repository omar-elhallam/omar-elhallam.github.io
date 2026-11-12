/**
 * Live surf conditions for the spot (Open-Meteo marine + forecast APIs: free, no key, no cookies).
 * Fetched once per page and shared by the hero bulletin and the surf game.
 */
import { site } from '../data/site'

export type WindKind = 'offshore' | 'side-shore' | 'onshore'
export interface Conditions {
  hs: number        // significant wave height (m)
  tp: number        // wave period (s)
  dir: number       // swell direction (° from)
  wind: number      // wind speed (kn)
  windDir: number   // wind direction (° from)
  kind: WindKind
  live: boolean
}

/** Casablanca's coast faces north-west: wind blowing from the south-east (land) is offshore. */
export const windKind = (deg: number): WindKind => {
  const diff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180)
  return diff(deg, 135) < 60 ? 'offshore' : diff(deg, 315) < 60 ? 'onshore' : 'side-shore'
}

let pending: Promise<Conditions | null> | null = null

export function getConditions(): Promise<Conditions | null> {
  pending ??= (async () => {
    try {
      const { lat, lon } = site.spot
      const [m, w] = await Promise.all([
        fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_period,wave_direction`).then(r => r.json()),
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=kn`).then(r => r.json()),
      ])
      const c: Conditions = {
        hs: m.current.wave_height, tp: m.current.wave_period, dir: m.current.wave_direction,
        wind: w.current.wind_speed_10m, windDir: w.current.wind_direction_10m,
        kind: windKind(w.current.wind_direction_10m), live: true,
      }
      if (!Number.isFinite(c.hs) || !Number.isFinite(c.tp)) return null
      return c
    } catch {
      pending = null // allow a retry later
      return null
    }
  })()
  return pending
}

/** Presets, for flat days or for fun. */
export const PRESETS = {
  classic: { hs: 1.6, tp: 12, dir: 300, wind: 6, windDir: 120, kind: 'offshore', live: false } as Conditions,
  big: { hs: 2.8, tp: 15, dir: 300, wind: 8, windDir: 130, kind: 'offshore', live: false } as Conditions,
  windy: { hs: 1.4, tp: 7, dir: 310, wind: 16, windDir: 320, kind: 'onshore', live: false } as Conditions,
}
