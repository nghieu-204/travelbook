'use client'

import { useEffect, useState, useRef } from 'react'

export default function CountUp({ end, duration = 2, suffix = '' }: { end: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return

    let startTimestamp: number | null = null
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1)
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      setCount(Math.floor(easeProgress * end))
      
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    
    window.requestAnimationFrame(step)
  }, [inView, end, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}
