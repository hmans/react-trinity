import { useEffect } from "react"

export const useAnimationFrame = (fn: Function) =>
  useEffect(() => {
    let looping = true

    const tick = () => {
      fn()
      if (looping) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)

    return () => {
      looping = false
    }
  }, [fn])