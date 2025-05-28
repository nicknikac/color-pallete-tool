"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Pin, Eye } from "lucide-react"
import type { ColorPalette } from "@/types"

interface PinnedPalettesProps {
  savedPalettes: ColorPalette[]
  pinnedIds: string[]
  onLoad: (colors: string[]) => void
  onTogglePin: (id: string) => void
}

export default function PinnedPalettes({ savedPalettes, pinnedIds, onLoad, onTogglePin }: PinnedPalettesProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const pinnedPalettes = savedPalettes.filter((palette) => pinnedIds.includes(palette.id))

  const copyToClipboard = useCallback(async (color: string) => {
    try {
      await navigator.clipboard.writeText(color)
      setCopiedColor(color)
      setTimeout(() => setCopiedColor(null), 2000)
    } catch (err) {
      console.error("Failed to copy color:", err)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: "spring" }}
      className="mt-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Pinned Palettes</h2>
        <span className="text-sm text-gray-400">{pinnedPalettes.length} pinned</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pinnedPalettes.map((palette) => (
          <motion.div
            key={palette.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
            whileHover={{ scale: 1.01, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-medium text-sm">{palette.name}</h3>
              <div className="flex gap-2">
                <motion.button
                  onClick={() => onTogglePin(palette.id)}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Pin className="w-3 h-3" />
                </motion.button>
                <motion.button
                  onClick={() => onLoad(palette.colors)}
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Eye className="w-3 h-3" />
                </motion.button>
              </div>
            </div>

            <div className="flex h-12 rounded-lg overflow-hidden">
              {palette.colors.map((color, colorIndex) => (
                <motion.div
                  key={`pinned-${palette.id}-${colorIndex}`}
                  className="flex-1 cursor-pointer relative group"
                  onClick={() => copyToClipboard(color)}
                  whileHover={{ scaleY: 1.05 }}
                  style={{ backgroundColor: color }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy className="w-3 h-3 text-white drop-shadow-lg" />
                  </div>

                  <AnimatePresence>
                    {copiedColor === color && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-0.5 rounded text-xs whitespace-nowrap"
                      >
                        {color}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
