"use client"

import { useState, useEffect, useCallback, useMemo } from "react"

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue],
  )

  return [storedValue, setValue] as const
}

export const useColorOperations = () => {
  const colorNames = useMemo(
    () => ({
      "#FF6B6B": "Coral Red",
      "#4ECDC4": "Turquoise",
      "#45B7D1": "Sky Blue",
      "#96CEB4": "Mint Green",
      "#FFEAA7": "Warm Yellow",
      "#DDA0DD": "Plum",
      "#98D8C8": "Seafoam",
      "#F7DC6F": "Golden",
      "#BB8FCE": "Lavender",
      "#85C1E9": "Light Blue",
    }),
    [],
  )

  const generateRandomColor = useCallback((): string => {
    return (
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
    )
  }, [])

  const generateHarmoniousColor = useCallback(
    (baseColor: string, type: "complementary" | "triadic" | "analogous" = "complementary"): string => {
      const hex = baseColor.replace("#", "")
      const r = Number.parseInt(hex.substr(0, 2), 16)
      const g = Number.parseInt(hex.substr(2, 2), 16)
      const b = Number.parseInt(hex.substr(4, 2), 16)

      let newR, newG, newB

      switch (type) {
        case "complementary":
          newR = 255 - r
          newG = 255 - g
          newB = 255 - b
          break
        case "triadic":
          newR = g
          newG = b
          newB = r
          break
        case "analogous":
          newR = Math.min(255, r + 30)
          newG = Math.max(0, g - 30)
          newB = Math.min(255, b + 30)
          break
        default:
          return generateRandomColor()
      }

      return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`
    },
    [generateRandomColor],
  )

  const getColorName = useCallback(
    (hex: string): string => {
      return colorNames[hex as keyof typeof colorNames] || "Custom Color"
    },
    [colorNames],
  )

  const getTextColor = useCallback((hexColor: string): string => {
    const r = Number.parseInt(hexColor.slice(1, 3), 16)
    const g = Number.parseInt(hexColor.slice(3, 5), 16)
    const b = Number.parseInt(hexColor.slice(5, 7), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? "#000000" : "#ffffff"
  }, [])

  const getAccessibilityScore = useCallback((color1: string, color2: string): number => {
    const getLuminance = (hex: string) => {
      const r = Number.parseInt(hex.slice(1, 3), 16) / 255
      const g = Number.parseInt(hex.slice(3, 5), 16) / 255
      const b = Number.parseInt(hex.slice(5, 7), 16) / 255

      const [rs, gs, bs] = [r, g, b].map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }

    const l1 = getLuminance(color1)
    const l2 = getLuminance(color2)
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

    return Math.round(ratio * 100) / 100
  }, [])

  return {
    generateRandomColor,
    generateHarmoniousColor,
    getColorName,
    getTextColor,
    getAccessibilityScore,
  }
}
