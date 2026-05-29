import { RefObject, useEffect, useRef } from "react"

export const useMousePositionRef = (
  containerRef?: RefObject<HTMLElement | SVGElement | null>
) => {
  const positionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const update = (x: number, y: number) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect()
        positionRef.current = { x: x - rect.left, y: y - rect.top }
      } else {
        positionRef.current = { x, y }
      }
    }

    const onMouse = (e: MouseEvent) => update(e.clientX, e.clientY)
    const onTouch = (e: TouchEvent) => update(e.touches[0].clientX, e.touches[0].clientY)

    window.addEventListener("mousemove", onMouse)
    window.addEventListener("touchmove", onTouch)
    return () => {
      window.removeEventListener("mousemove", onMouse)
      window.removeEventListener("touchmove", onTouch)
    }
  }, [containerRef])

  return positionRef
}
