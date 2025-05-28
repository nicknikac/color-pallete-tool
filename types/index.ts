export interface ColorPalette {
  id: string
  name: string
  colors: string[]
  createdAt: string
  locked?: boolean[]
}

export interface ColorInfo {
  hex: string
  name: string
  locked: boolean
}
