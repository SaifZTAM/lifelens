"use client"

import { forwardRef, useRef } from "react"
import {
  motion,
  motionValue,
  useAnimationFrame,
  useTransform,
  type MotionValue,
} from "motion/react"
import { useMousePositionRef } from "@/hooks/use-mouse-position-ref"

// ── Per-letter component — useTransform lives at component level (valid hooks) ──

interface LetterProps {
  char: string
  proximity: MotionValue<number>
  fromColor: string
  toColor: string
  fromScale: number
  toScale: number
  setRef: (el: HTMLSpanElement | null) => void
}

function Letter({ char, proximity, fromColor, toColor, fromScale, toScale, setRef }: LetterProps) {
  const color = useTransform(proximity, [0, 1], [fromColor, toColor])
  const scale = useTransform(proximity, [0, 1], [fromScale, toScale])

  return (
    <motion.span
      ref={setRef}
      className="inline-block will-change-transform"
      aria-hidden="true"
      style={{ color, scale }}
    >
      {char}
    </motion.span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export interface TextCursorProximityProps {
  label: string
  containerRef: React.RefObject<HTMLDivElement | null>
  fromColor?: string
  toColor?: string
  fromScale?: number
  toScale?: number
  radius?: number
  falloff?: "linear" | "exponential" | "gaussian"
  className?: string
}

const TextCursorProximity = forwardRef<HTMLSpanElement, TextCursorProximityProps>(
  (
    {
      label,
      containerRef,
      fromColor = "#fafafa",
      toColor = "#14b8a6",
      fromScale = 1,
      toScale = 1.18,
      radius = 80,
      falloff = "gaussian",
      className,
    },
    ref
  ) => {
    const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
    const mousePositionRef = useMousePositionRef(containerRef)

    // Use motionValue() factory — not a hook, safe inside useRef initializer
    const nonSpaceCount = label.replace(/\s/g, "").length
    const proximities = useRef<MotionValue<number>[]>(
      Array.from({ length: nonSpaceCount }, () => motionValue(0))
    )

    const applyFalloff = (distance: number): number => {
      const n = Math.max(0, Math.min(1, 1 - distance / radius))
      switch (falloff) {
        case "exponential": return n * n
        case "gaussian":    return Math.exp(-((distance / (radius / 2)) ** 2) / 2)
        default:            return n
      }
    }

    useAnimationFrame(() => {
      if (!containerRef.current) return
      const box = containerRef.current.getBoundingClientRect()
      const { x: mx, y: my } = mousePositionRef.current

      letterRefs.current.forEach((el, i) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const cx = r.left + r.width / 2 - box.left
        const cy = r.top + r.height / 2 - box.top
        const dist = Math.hypot(mx - cx, my - cy)
        proximities.current[i].set(applyFalloff(dist))
      })
    })

    const words = label.split(" ")
    let idx = 0

    return (
      <span ref={ref} className={`${className ?? ""} inline`}>
        {words.map((word, wi) => (
          <span key={wi} className="inline-block whitespace-nowrap">
            {word.split("").map((char) => {
              const i = idx++
              return (
                <Letter
                  key={i}
                  char={char}
                  proximity={proximities.current[i]}
                  fromColor={fromColor}
                  toColor={toColor}
                  fromScale={fromScale}
                  toScale={toScale}
                  setRef={(el) => { letterRefs.current[i] = el }}
                />
              )
            })}
            {wi < words.length - 1 && (
              <span className="inline-block">&nbsp;</span>
            )}
          </span>
        ))}
        <span className="sr-only">{label}</span>
      </span>
    )
  }
)

TextCursorProximity.displayName = "TextCursorProximity"
export default TextCursorProximity
