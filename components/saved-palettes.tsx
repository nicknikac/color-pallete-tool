"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Trash2, Eye, ArrowLeft, Pin } from "lucide-react"
import type { ColorPalette } from "@/types"

interface SavedPalettesProps {
  savedPalettes: ColorPalette[]
  pinnedPalettes: string[]
  onDelete: (id: string) => void
  onLoad: (colors: string[]) => void
  onTogglePin: (id: string) => void
  onBack: () => void
}

export default function SavedPalettes({
  savedPalettes,
  pinnedPalettes,
  onDelete,
  onLoad,
  onTogglePin,
  onBack,
}: SavedPalettesProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20"
    >
      <div className="flex justify-between items-center mb-8">
        <motion.button
          onClick={onBack}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>
        <h2 className="text-3xl font-bold text-white text-center">Saved Palettes ({savedPalettes.length})</h2>
        <div className="w-24"></div>
      </div>

      {savedPalettes.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <p className="text-gray-300 text-xl mb-2">No saved palettes yet</p>
          <p className="text-gray-400">Generate and save some beautiful color combinations!</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {savedPalettes.map((palette, paletteIndex) => (
            <motion.div
              key={palette.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: paletteIndex * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.01, y: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-white font-semibold">{palette.name}</h3>
                  <span className="text-sm text-gray-400">Saved on {palette.createdAt}</span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => onTogglePin(palette.id)}
                    className={`transition-colors duration-200 p-2 ${
                      pinnedPalettes.includes(palette.id) ? "text-yellow-400" : "text-gray-400 hover:text-yellow-300"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Pin className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => onLoad(palette.colors)}
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200 p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={() => onDelete(palette.id)}
                    className="text-red-400 hover:text-red-300 transition-colors duration-200 p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {palette.colors.map((color, colorIndex) => (
                  <motion.div
                    key={`${palette.id}-${colorIndex}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group cursor-pointer"
                    onClick={() => copyToClipboard(color)}
                  >
                    <div
                      className="w-full h-20 rounded-xl shadow-lg transition-shadow duration-200 group-hover:shadow-xl"
                      style={{ backgroundColor: color }}
                    />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Copy className="w-4 h-4 text-white drop-shadow-lg" />
                    </div>

                    <p className="text-xs font-mono text-gray-300 mt-2 text-center">{color.toUpperCase()}</p>

                    <AnimatePresence>
                      {copiedColor === color && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Copied!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
