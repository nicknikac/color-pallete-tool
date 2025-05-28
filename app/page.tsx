"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Palette, Sparkles } from "lucide-react"
import type { ColorPalette } from "@/types"
import { useLocalStorage } from "@/lib/hooks"
import ColorPaletteGenerator from "@/components/color-palette"
import SavedPalettes from "@/components/saved-palettes"
import PinnedPalettes from "@/components/pinned-palettes"

export default function Home() {
  const [currentColors, setCurrentColors] = useState<string[]>([])
  const [savedPalettes, setSavedPalettes] = useLocalStorage<ColorPalette[]>("colorPalettes", [])
  const [pinnedPalettes, setPinnedPalettes] = useLocalStorage<string[]>("pinnedPalettes", [])
  const [showSaved, setShowSaved] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSavePalette = (name: string, colors: string[]) => {
    const newPalette: ColorPalette = {
      id: Date.now().toString(),
      name: name || "Untitled Palette",
      colors,
      createdAt: new Date().toLocaleDateString(),
    }
    setSavedPalettes((prev) => [...prev, newPalette])
  }

  const handleDeletePalette = (id: string) => {
    setSavedPalettes((prev) => prev.filter((palette) => palette.id !== id))
    setPinnedPalettes((prev) => prev.filter((paletteId) => paletteId !== id))
  }

  const handleTogglePin = (id: string) => {
    setPinnedPalettes((prev) => (prev.includes(id) ? prev.filter((paletteId) => paletteId !== id) : [...prev, id]))
  }

  const handleLoadPalette = (colors: string[]) => {
    setCurrentColors(colors)
    setShowSaved(false)
  }

  if (!mounted) {
    return null // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            animate={{
              x: [0, Math.random() * window.innerWidth],
              y: [0, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            style={{
              left: Math.random() * window.innerWidth,
              top: Math.random() * window.innerHeight,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <motion.h1
            className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-4"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Sparkles className="w-12 h-12 text-yellow-400" />
            </motion.div>
            Color Palette Generator
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Palette className="w-12 h-12 text-cyan-400" />
            </motion.div>
          </motion.h1>
          <p className="text-xl text-gray-300 mb-4">
            Generate color palettes to easily select colors you need for your design
          </p>
          <p className="text-sm text-gray-400">
            Press <kbd className="px-2 py-1 bg-gray-700 rounded">Space</kbd> to generate •{" "}
            <kbd className="px-2 py-1 bg-gray-700 rounded">Cmd+S</kbd> to save
          </p>
        </motion.div>

        {showSaved ? (
          <SavedPalettes
            savedPalettes={savedPalettes}
            pinnedPalettes={pinnedPalettes}
            onDelete={handleDeletePalette}
            onLoad={handleLoadPalette}
            onTogglePin={handleTogglePin}
            onBack={() => setShowSaved(false)}
          />
        ) : (
          <ColorPaletteGenerator
            initialColors={currentColors}
            onColorsChange={setCurrentColors}
            onSave={handleSavePalette}
            onShowSaved={() => setShowSaved(true)}
            savedCount={savedPalettes.length}
          />
        )}

        {pinnedPalettes.length > 0 && !showSaved && (
          <PinnedPalettes
            savedPalettes={savedPalettes}
            pinnedIds={pinnedPalettes}
            onLoad={handleLoadPalette}
            onTogglePin={handleTogglePin}
          />
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 text-gray-400"
        >
          <p className="mb-2">Click any color to copy • Lock colors to keep them • Pin palettes for quick access</p>
          <p className="text-sm">Palettes are saved locally in your browser</p>
        </motion.div>
      </div>
    </div>
  )
}
