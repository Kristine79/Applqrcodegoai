import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import pako from "pako"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// CarQR Types
export interface CarCardData {
  carModel: string
  plateNumber: string
  ownerName: string
  phone1: string
  telegram?: string
  whatsapp?: string
  max?: string
  showContact?: boolean
  quickButtons?: string[]
  themeColor?: string
  backgroundColor?: string
  textColor?: string
  qrText?: string
  selectedFrame?: string
}

// Encode card data to compressed base64 string
export function encodeCardData(data: CarCardData): string {
  const jsonStr = JSON.stringify(data)
  const compressed = pako.deflate(jsonStr, { level: 9 })
  const base64 = btoa(String.fromCharCode(...compressed))
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

// Decode compressed base64 string to card data
export function decodeCardData(encoded: string): CarCardData {
  // Restore base64 padding and characters
  let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/")
  while (base64.length % 4) {
    base64 += "="
  }

  const compressed = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const decompressed = pako.inflate(compressed, { to: "string" })
  return JSON.parse(decompressed) as CarCardData
}
