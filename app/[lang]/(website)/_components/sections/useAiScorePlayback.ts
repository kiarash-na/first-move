import { useCallback, useEffect, useState, useSyncExternalStore, type RefObject } from 'react'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/** The viewer's reduced-motion preference, false on the server and before hydration. */
export function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION)
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  )
}

/**
 * Plays the example run once the console scrolls into view: step 0 is the plan unread, steps 1 to
 * `turns` are the turns, `turns + 1` shows the score. With reduced motion the final step shows at
 * once; `replay` starts again from 0. `run` counts the plays, so dependents can restart with it.
 */
export function useAiScorePlayback(ref: RefObject<HTMLElement | null>, turns: number, stepMs = 950) {
  const final = turns + 1
  const reduced = useReducedMotion()
  const [armed, setArmed] = useState(false)
  const [run, setRun] = useState(0)
  const [ticks, setTicks] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      setArmed(true)
      observer.disconnect()
    }, { threshold: 0.35 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  useEffect(() => {
    if (!armed || reduced) return
    let current = 0
    const id = window.setInterval(() => {
      current += 1
      setTicks(current)
      if (current >= final) window.clearInterval(id)
    }, stepMs)
    return () => window.clearInterval(id)
  }, [armed, run, reduced, final, stepMs])

  const replay = useCallback(() => {
    setArmed(true)
    setTicks(0)
    setRun((count) => count + 1)
  }, [])

  const step = !armed ? 0 : reduced ? final : Math.min(ticks, final)
  return { step, final, run, replay }
}

/** Counts from 0 to `target` while `active`, in `duration` ms, once per `run`; at once with reduced motion. */
export function useCountUp(target: number, active: boolean, run = 0, duration = 900) {
  const reduced = useReducedMotion()
  const [state, setState] = useState({ run: -1, progress: 0 })

  useEffect(() => {
    if (!active || reduced) return
    const start = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const progress = Math.min(1, (now - start) / duration)
      setState({ run, progress })
      if (progress < 1) frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [active, reduced, run, duration])

  if (!active) return 0
  if (reduced) return target
  const progress = state.run === run ? state.progress : 0
  return Math.round(target * (1 - (1 - progress) ** 3))
}
