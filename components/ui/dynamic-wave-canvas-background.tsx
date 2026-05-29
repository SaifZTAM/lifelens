'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

const HeroWave = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const SCALE = 2
    let animId: number

    // Offscreen canvas holds the low-res render — avoids drawing a canvas onto itself
    const offscreen = document.createElement('canvas')
    const offCtx = offscreen.getContext('2d')!

    let imageData: ImageData
    let data: Uint8ClampedArray

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      offscreen.width = Math.floor(canvas.width / SCALE)
      offscreen.height = Math.floor(canvas.height / SCALE)
      imageData = offCtx.createImageData(offscreen.width, offscreen.height)
      data = imageData.data
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    const startTime = Date.now()

    const SIN_TABLE = new Float32Array(1024)
    const COS_TABLE = new Float32Array(1024)
    for (let i = 0; i < 1024; i++) {
      const angle = (i / 1024) * Math.PI * 2
      SIN_TABLE[i] = Math.sin(angle)
      COS_TABLE[i] = Math.cos(angle)
    }

    const fastSin = (x: number) => SIN_TABLE[Math.floor(((x % (Math.PI * 2)) / (Math.PI * 2)) * 1024) & 1023]
    const fastCos = (x: number) => COS_TABLE[Math.floor(((x % (Math.PI * 2)) / (Math.PI * 2)) * 1024) & 1023]

    const render = () => {
      const w = offscreen.width
      const h = offscreen.height
      const time = (Date.now() - startTime) * 0.001
      const lightMode = document.documentElement.classList.contains('light') ||
        !document.documentElement.classList.contains('dark')

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const u_x = (2 * x - w) / h
          const u_y = (2 * y - h) / h

          let a = 0
          let d = 0

          for (let i = 0; i < 4; i++) {
            a += fastCos(i - d + time * 0.5 - a * u_x)
            d += fastSin(i * u_y + a)
          }

          const wave = (fastSin(a) + fastCos(d)) * 0.5
          const intensity = 0.3 + 0.4 * wave
          const baseVal = 0.1 + 0.15 * fastCos(u_x + u_y + time * 0.3)
          const blueAccent = 0.2 * fastSin(a * 1.5 + time * 0.2)
          const tealAccent = 0.15 * fastCos(d * 2 + time * 0.1)

          let r = Math.max(0, Math.min(1, baseVal)) * intensity
          let g = Math.max(0, Math.min(1, baseVal + blueAccent * 0.6 + tealAccent * 0.8)) * intensity
          let b = Math.max(0, Math.min(1, baseVal + blueAccent * 1.2 + tealAccent * 0.5)) * intensity

          if (lightMode) {
            // Invert to light: 1 - dark gives bright pastels
            r = 1 - r * 0.6
            g = 1 - g * 0.5
            b = 1 - b * 0.4
          }

          const idx = (y * w + x) * 4
          data[idx]     = r * 255
          data[idx + 1] = g * 255
          data[idx + 2] = b * 255
          data[idx + 3] = 255
        }
      }

      // Render pixels into offscreen, then scale up to main canvas
      offCtx.putImageData(imageData, 0, 0)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height)

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animId)
    }
  }, [resolvedTheme])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

export default HeroWave
