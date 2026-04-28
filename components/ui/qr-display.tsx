"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { QRCodeSVG } from "qrcode.react"
import { GlassCard, GlassCardContent } from "./glass-card"
import { GlassButton } from "./glass-button"
import { Download, Share2, X, Check, Sparkles, Copy, ExternalLink } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface QRDisplayProps {
  url: string | null
  isOpen: boolean
  onClose: () => void
  onDownload?: () => void
  onShare?: () => void
  title?: string
  subtitle?: string
  logoBase64?: string
}

const FRAME_STYLES = {
  none: "",
  label_bottom: "",
  solid_black: "",
  bubble: "",
  circle: "",
  rounded_accent: "",
  double_border: "",
}

function QRDisplay({
  url,
  isOpen,
  onClose,
  onDownload,
  onShare,
  title = "Готово!",
  subtitle = "Ваш QR-код создан и сохранён в кабинете",
  logoBase64,
}: QRDisplayProps) {
  const [showCopied, setShowCopied] = React.useState(false)

  if (!url) return null

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "max-w-md border border-white/20 bg-black/95 backdrop-blur-2xl",
          "shadow-[0_0_80px_rgba(255,59,48,0.3)] p-0 overflow-hidden"
        )}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {/* Celebration effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.5, opacity: [0, 0.3, 0] }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#ff3b30]/20 blur-3xl"
              />
            </div>

            <div className="relative p-6 space-y-6">
              {/* Success badge */}
              <motion.div
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.1 }}
                className="flex justify-center"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Check className="w-7 h-7 text-white" strokeWidth={3} />
                </div>
              </motion.div>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-2"
              >
                <h3 className="heading-section text-white flex items-center justify-center gap-2">
                  {title}
                  <Sparkles className="w-5 h-5 text-[#ff3b30]" />
                </h3>
                <p className="text-body-sm text-white/60">{subtitle}</p>
              </motion.div>

              {/* QR Code - Hero Element */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.3 }}
                className="flex justify-center"
              >
                <div className="relative">
                  {/* Glow ring */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff3b30]/30 to-purple-500/30 rounded-3xl blur-2xl scale-110" />

                  <GlassCard className="relative p-4 glow border-2 border-white/20">
                    <div
                      id="qr-code-svg"
                      className="bg-white p-4 rounded-2xl shadow-inner"
                    >
                      <QRCodeSVG
                        value={url}
                        size={220}
                        level="H"
                        includeMargin={false}
                        imageSettings={
                          logoBase64
                            ? {
                                src: logoBase64,
                                height: 44,
                                width: 44,
                                excavate: true,
                              }
                            : undefined
                        }
                      />
                    </div>
                  </GlassCard>

                  {/* Corner decorations */}
                  <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-[#ff3b30]/50 rounded-tr-lg" />
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-[#ff3b30]/50 rounded-bl-lg" />
                </div>
              </motion.div>

              {/* Quick actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col gap-2"
              >
                {/* Copy link */}
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group"
                >
                  {showCopied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white/60 group-hover:text-white/80" />
                      <span className="text-sm text-white/60 group-hover:text-white/80 truncate max-w-[200px]">
                        {url}
                      </span>
                    </>
                  )}
                </button>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {onDownload && (
                    <GlassButton
                      variant="glass"
                      size="lg"
                      className="w-full"
                      onClick={onDownload}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Скачать
                    </GlassButton>
                  )}
                  {onShare && (
                    <GlassButton
                      variant="default"
                      size="lg"
                      glow
                      className="w-full"
                      onClick={onShare}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Поделиться
                    </GlassButton>
                  )}
                </div>
              </motion.div>

              {/* Cabinet link */}
              <motion.a
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                href="/cabinet"
                className="flex items-center justify-center gap-1 text-sm text-[#ff3b30] hover:text-[#ff5a52] transition-colors"
              >
                <span>Открыть в кабинете</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </motion.a>

              {/* Close hint */}
              <button
                onClick={onClose}
                className="w-full text-xs text-white/30 hover:text-white/50 transition-colors uppercase tracking-wider"
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export { QRDisplay }
