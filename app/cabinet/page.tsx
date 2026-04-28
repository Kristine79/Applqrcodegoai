"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Car,
  User,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  X,
  Download,
  Package,
  QrCode,
  Edit3,
  Trash2,
  Upload,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { type CarCardData, encodeCardData } from "@/lib/utils";
import { toast } from "sonner";

// shadcn/ui components with glassmorphism
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardDescription,
  GlassCardContent,
  GlassCardFooter,
} from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassDialog } from "@/components/ui/glass-dialog";
import { QRDisplay } from "@/components/ui/qr-display";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const SAVED_CARDS_KEY = "carqr_saved_cards";

export default function CabinetPage() {
  const router = useRouter();
  const [savedCards, setSavedCards] = useState<CarCardData[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CarCardData | null>(null);
  const [cardToDelete, setCardToDelete] = useState<number | null>(null);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Load logo as base64 for QR code embedding
    fetch("/logo.png")
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch((err) => console.error("Error loading logo for QR:", err));

    const saved = localStorage.getItem(SAVED_CARDS_KEY);
    if (saved && saved.trim() !== "") {
      try {
        setSavedCards(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved cards", e);
      }
    }
  }, []);

  const deleteCard = (index: number) => {
    const newCards = savedCards.filter((_, i) => i !== index);
    setSavedCards(newCards);
    localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(newCards));
    setSelectedCard(null);
    setCardToDelete(null);
    toast.success("Визитка удалена", {
      description: "Данные удалены из локального хранилища",
    });
  };

  const editCard = (card: CarCardData) => {
    localStorage.setItem("carqr_draft", JSON.stringify(card));
    router.push("/");
  };

  const viewQR = (card: CarCardData) => {
    const encoded = encodeCardData(card);
    const url = `${window.location.origin}/card/${encoded}`;
    setQrUrl(url);
    setShowQR(true);
  };

  const exportCards = () => {
    const dataStr = JSON.stringify(savedCards);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "carqr_backup.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    toast.success("Резервная копия создана", {
      description: "Файл сохранён в загрузки",
    });
  };

  const importCards = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          const merged = [...savedCards, ...imported];
          setSavedCards(merged);
          localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(merged));
          toast.success("Визитки импортированы", {
            description: `Добавлено ${imported.length} визиток`,
          });
        }
      } catch (err) {
        toast.error("Ошибка импорта", {
          description: "Неверный формат файла",
        });
      }
    };
    reader.readAsText(file);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full bg-white/10" />
          <Skeleton className="h-32 w-full bg-white/10" />
          <Skeleton className="h-64 w-full bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#ff3b30] selection:text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 relative rounded-xl overflow-hidden border border-white/10 shadow-lg">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <span className="font-heading text-xl">
                Car
                <motion.span
                  animate={{ color: ["#ffffff", "#ff3b30", "#ffffff"] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  QR
                </motion.span>
              </span>
            </Link>
            <h1 className="font-heading text-lg">Личный кабинет</h1>
            <div className="w-9 h-9 rounded-xl bg-[#ff3b30]/10 flex items-center justify-center border border-[#ff3b30]/20">
              <User className="w-4 h-4 text-[#ff3b30]" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Summary Card */}
        <GlassCard variant="subtle">
          <GlassCardContent className="pt-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#ff3b30]" />
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-base">Ваш профиль</h2>
                <p className="text-sm text-white/50">
                  Локальное хранилище данных
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-[#ff3b30]/30 text-[#ff3b30] bg-[#ff3b30]/10"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] animate-pulse mr-1.5" />
                Активен
              </Badge>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="text-center py-4">
            <div className="text-2xl font-heading text-white">
              {savedCards.length}
            </div>
            <div className="text-xs text-white/50 uppercase tracking-wider">
              Визиток
            </div>
          </GlassCard>
          <GlassCard className="text-center py-4">
            <div className="text-2xl font-heading text-white">
              {savedCards.filter((c) => c.showContact).length}
            </div>
            <div className="text-xs text-white/50 uppercase tracking-wider">
              Активных
            </div>
          </GlassCard>
          <GlassCard className="text-center py-4">
            <div className="text-2xl font-heading text-[#ff3b30]">
              {savedCards.length > 0 ? "100%" : "0%"}
            </div>
            <div className="text-xs text-white/50 uppercase tracking-wider">
              Готово
            </div>
          </GlassCard>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <label className="flex-1">
            <input
              type="file"
              accept=".json"
              onChange={importCards}
              className="hidden"
            />
            <GlassButton variant="glass" className="w-full" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Импорт
              </span>
            </GlassButton>
          </label>
          <GlassButton
            variant="glass"
            className="flex-1"
            onClick={exportCards}
          >
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </GlassButton>
          <GlassButton
            variant="default"
            className="flex-1"
            onClick={() => router.push("/")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Новая
          </GlassButton>
        </div>

        <Separator className="bg-white/10" />

        {/* Cards List */}
        <div className="space-y-3">
          <h3 className="font-heading text-sm text-white/70 uppercase tracking-wider">
            Сохранённые визитки
          </h3>

          <ScrollArea className="h-[400px] -mx-4 px-4">
            <div className="space-y-3 pr-4">
              <AnimatePresence>
                {savedCards.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <GlassCard className="text-center py-12">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <QrCode className="w-8 h-8 text-white/30" />
                      </div>
                      <p className="text-white/50 mb-1">Нет сохранённых визиток</p>
                      <p className="text-sm text-white/30">
                        Создайте первую визитку на главной странице
                      </p>
                    </GlassCard>
                  </motion.div>
                ) : (
                  savedCards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GlassCard className="group cursor-pointer hover:border-white/20 transition-colors">
                        <GlassCardContent className="pt-4">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: card.themeColor || "#ff3b30" }}
                            >
                              <Car className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-heading text-base truncate">
                                {card.carModel || "Автомобиль"}
                              </h4>
                              <p className="text-sm text-white/50">
                                {card.plateNumber || "Без номера"}
                              </p>
                              <p className="text-xs text-white/40 mt-0.5">
                                {card.ownerName}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1">
                              <GlassButton
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => viewQR(card)}
                              >
                                <QrCode className="w-4 h-4" />
                              </GlassButton>
                              <GlassButton
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => editCard(card)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </GlassButton>
                              <GlassButton
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                onClick={() => setCardToDelete(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </GlassButton>
                            </div>
                          </div>
                        </GlassCardContent>
                      </GlassCard>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* QR Display Dialog */}
      <QRDisplay
        url={qrUrl}
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        onDownload={() => {
          toast.success("QR-код скачан");
        }}
        onShare={() => {
          if (qrUrl) {
            navigator.clipboard.writeText(qrUrl);
            toast.success("Ссылка скопирована");
          }
        }}
        title={`${selectedCard?.carModel || "Визитка"}`}
        subtitle={`${selectedCard?.plateNumber || ""}`}
      />

      {/* Delete Confirmation Dialog */}
      <GlassDialog
        open={cardToDelete !== null}
        onOpenChange={(open) => !open && setCardToDelete(null)}
        trigger={null}
        title="Удалить визитку?"
        description="Это действие нельзя отменить. Визитка будет удалена из локального хранилища."
        size="sm"
      >
        <div className="flex gap-2 mt-4">
          <GlassButton
            variant="glass"
            className="flex-1"
            onClick={() => setCardToDelete(null)}
          >
            Отмена
          </GlassButton>
          <GlassButton
            variant="default"
            className="flex-1"
            onClick={() => cardToDelete !== null && deleteCard(cardToDelete)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Удалить
          </GlassButton>
        </div>
      </GlassDialog>
    </div>
  );
}
