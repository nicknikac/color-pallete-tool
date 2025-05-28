"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { Copy, Save, Download, Shuffle, Lock, Unlock, Eye } from "lucide-react"
import { useColorOperations } from "@/lib/hooks"
import type { ColorInfo } from "@/types"

interface ColorPaletteProps {
  initialColors?: string[]
  onColorsChange: (colors: string[]) => void
  onSave: (name: string, colors: string[]) => void
  onShowSaved: () => void
  savedCount: number
}

export default function ColorPaletteGenerator({
  initialColors = [],
  onColorsChange,
  onSave,
  onShowSaved,
  savedCount,
}: ColorPaletteProps) {
  const [currentColors, setCurrentColors] = useState<ColorInfo[]>([])
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [generationMode, setGenerationMode] = useState<"random" | "harmonious">("random")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAccessibility, setShowAccessibility] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const { generateRandomColor, generateHarmoniousColor, getColorName, getTextColor, getAccessibilityScore } =
    useColorOperations()

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5])
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5])

  const generateNewPalette = useCallback(async () => {
    setIsGenerating(true)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const newColors: ColorInfo[] = []

    if (generationMode === "harmonious" && currentColors.length > 0) {
      const baseColor = currentColors.find((c) => !c.locked)?.hex || generateRandomColor()
      newColors.push({ hex: baseColor, name: getColorName(baseColor), locked: false })

      for (let i = 1; i < 5; i++) {
        const harmoniousColor = generateHarmoniousColor(baseColor, i % 2 === 0 ? "complementary" : "analogous")
        newColors.push({ hex: harmoniousColor, name: getColorName(harmoniousColor), locked: false })
      }
    } else {
      for (let i = 0; i < 5; i++) {
        if (currentColors[i]?.locked) {
          newColors.push(currentColors[i])
        } else {
          const color = generateRandomColor()
          newColors.push({ hex: color, name: getColorName(color), locked: false })
        }
      }
    }

    setCurrentColors(newColors)
    setIsGenerating(false)

    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }, [currentColors, generationMode, generateRandomColor, generateHarmoniousColor, getColorName])

  // Initialize palette only once
  useEffect(() => {
    if (!isInitialized) {
      if (initialColors && initialColors.length > 0) {
        setCurrentColors(
          initialColors.map((color) => ({
            hex: color,
            name: getColorName(color),
            locked: false,
          })),
        )
      } else {
        // Generate initial palette
        const newColors: ColorInfo[] = []
        for (let i = 0; i < 5; i++) {
          const color = generateRandomColor()
          newColors.push({ hex: color, name: getColorName(color), locked: false })
        }
        setCurrentColors(newColors)
      }
      setIsInitialized(true)
    }
  }, [isInitialized, initialColors, getColorName, generateRandomColor])

  // Update parent when colors change
  useEffect(() => {
    if (currentColors.length > 0) {
      const colorHexes = currentColors.map((c) => c.hex)
      onColorsChange(colorHexes)
    }
  }, [currentColors, onColorsChange])

  const copyToClipboard = useCallback(async (color: string) => {
    try {
      await navigator.clipboard.writeText(color)
      setCopiedColor(color)

      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50])
      }

      setTimeout(() => setCopiedColor(null), 2000)
    } catch (err) {
      console.error("Failed to copy color:", err)
    }
  }, [])

  const toggleColorLock = useCallback((index: number) => {
    setCurrentColors((prev) => prev.map((color, i) => (i === index ? { ...color, locked: !color.locked } : color)))
  }, [])

  const savePalette = useCallback(() => {
    if (currentColors.length === 0) return

    const name = prompt("Enter a name for this palette:")
    if (name !== null) {
      onSave(
        name,
        currentColors.map((c) => c.hex),
      )
    }
  }, [currentColors, onSave])

  const exportPalette = useCallback(() => {
    const cssVariables = currentColors.map((color, index) => `  --color-${index + 1}: ${color.hex};`).join("\n")
    const cssContent = `:root {\n${cssVariables}\n}`

    const blob = new Blob([cssContent], { type: "text/css" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "color-palette.css"
    a.click()
    URL.revokeObjectURL(url)
  }, [currentColors])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault()
        generateNewPalette()
      }
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        savePalette()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [generateNewPalette, savePalette])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseX.set(e.clientX - centerX)
      mouseY.set(e.clientY - centerY)
    },
    [mouseX, mouseY],
  )

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap justify-center gap-4 mb-8"
      >
        <motion.button
          onClick={generateNewPalette}
          disabled={isGenerating}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={isGenerating ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: isGenerating ? Number.POSITIVE_INFINITY : 0, ease: "linear" }}
          >
            <Shuffle className="w-5 h-5" />
          </motion.div>
          {isGenerating ? "Generating..." : "Generate New"}
        </motion.button>

        <motion.button
          onClick={() => setGenerationMode((prev) => (prev === "random" ? "harmonious" : "random"))}
          className={`px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
            generationMode === "harmonious"
              ? "bg-gradient-to-r from-green-600 to-teal-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {generationMode === "harmonious" ? "Harmonious" : "Random"}
        </motion.button>

        <motion.button
          onClick={savePalette}
          disabled={currentColors.length === 0}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Save className="w-4 h-4" />
          Save Palette
        </motion.button>

        <motion.button
          onClick={exportPalette}
          disabled={currentColors.length === 0}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download className="w-4 h-4" />
          Export CSS
        </motion.button>

        <motion.button
          onClick={() => setShowAccessibility(!showAccessibility)}
          className={`px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
            showAccessibility
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Eye className="w-4 h-4" />
          A11y
        </motion.button>

        <motion.button
          onClick={onShowSaved}
          className="bg-gray-700 text-gray-300 hover:bg-gray-600 px-6 py-4 rounded-xl font-medium transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Saved ({savedCount})
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, rotateX: -5 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        style={{ rotateX, rotateY, transformPerspective: 1000 }}
        onMouseMove={handleMouseMove}
        className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/20"
      >
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Current Palette</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {currentColors.map((colorInfo, index) => (
            <motion.div
              key={`${colorInfo.hex}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              className="relative group"
            >
              <motion.div
                className="relative overflow-hidden rounded-2xl shadow-lg"
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <motion.div
                  className="w-full h-40 cursor-pointer relative"
                  style={{ backgroundColor: colorInfo.hex }}
                  onClick={() => copyToClipboard(colorInfo.hex)}
                  whileHover={{ brightness: 1.05 }}
                >
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleColorLock(index)
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {colorInfo.locked ? (
                      <Lock className="w-4 h-4 text-white" />
                    ) : (
                      <Unlock className="w-4 h-4 text-white" />
                    )}
                  </motion.button>

                  <motion.div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: `${colorInfo.hex}20` }}
                  >
                    <motion.div
                      className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center gap-2"
                      initial={{ scale: 0.9, opacity: 0 }}
                      whileHover={{ scale: 1 }}
                      animate={{ scale: 0.95, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </motion.div>
                  </motion.div>

                  {showAccessibility && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs"
                    >
                      A11y: {getAccessibilityScore(colorInfo.hex, "#FFFFFF")}
                    </motion.div>
                  )}
                </motion.div>

                <div className="p-4 bg-white/5 backdrop-blur-sm">
                  <p className="font-mono text-sm text-white font-bold">{colorInfo.hex.toUpperCase()}</p>
                  <p className="text-xs text-gray-300 mt-1">{colorInfo.name}</p>
                </div>
              </motion.div>

              <AnimatePresence>
                {copiedColor === colorInfo.hex && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                  >
                    Copied! ✨
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  )
}
