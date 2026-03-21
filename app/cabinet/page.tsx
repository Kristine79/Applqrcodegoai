'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Car, 
  User, 
  QrCode, 
  ChevronRight, 
  ArrowLeft,
  Calendar,
  ShieldCheck,
  CreditCard,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { type CarCardData, encodeCardData } from '@/lib/utils';

const SAVED_CARDS_KEY = 'carqr_saved_cards';

export default function CabinetPage() {
  const router = useRouter();
  const [savedCards, setSavedCards] = useState<CarCardData[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CarCardData | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const saved = localStorage.getItem(SAVED_CARDS_KEY);
    if (saved) {
      try {
        setSavedCards(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved cards', e);
      }
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-apple-red selection:text-white p-3 md:p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 relative rounded-lg overflow-hidden border border-white/10 shadow-lg">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill 
                sizes="32px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-bold text-lg tracking-tight">CarQR</span>
          </Link>
          <h1 className="text-base font-bold tracking-tight">Личный кабинет</h1>
          <div className="w-8 h-8 rounded-full bg-apple-red/10 flex items-center justify-center border border-apple-red/20">
            <User className="w-3.5 h-3.5 text-apple-red" />
          </div>
        </div>

        {/* Profile Summary Card */}
        <div className="glass-card p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-apple-red/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-apple-red" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Ваш профиль</h2>
              <p className="text-gray-500 text-xs">Локальное хранилище данных</p>
              <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 bg-apple-red/10 rounded-lg border border-apple-red/20">
                <span className="w-1 h-1 rounded-full bg-apple-red animate-pulse"></span>
                <span className="text-[10px] font-bold text-apple-red uppercase tracking-widest">Активен</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="glass-panel p-2.5 flex flex-col items-center justify-center gap-0 text-center">
            <span className="text-lg font-bold">{savedCards.length}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Визиток</span>
          </div>
          <div className="glass-panel p-2.5 flex flex-col items-center justify-center gap-0 text-center">
            <span className="text-lg font-bold">0</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Уведомлений</span>
          </div>
        </div>

        {/* Cards List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ваши визитки</h3>
            <span className="text-[10px] text-gray-600">Только просмотр</span>
          </div>

          {savedCards.length === 0 ? (
            <div className="glass-panel p-6 text-center space-y-2.5">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                <CreditCard className="w-5 h-5" />
              </div>
              <p className="text-gray-500 text-xs">У вас пока нет сохраненных визиток</p>
              <Link 
                href="/" 
                className="inline-block px-4 py-1.5 bg-apple-red rounded-xl text-xs font-bold hover:scale-105 transition-all"
              >
                Создать первую
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5">
              {savedCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedCard(card)}
                  className="glass-panel p-2.5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-apple-red/30 transition-all">
                      <Car className="w-3.5 h-3.5 text-gray-400 group-hover:text-apple-red transition-all" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{card.carModel}</div>
                      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{card.plateNumber}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-white transition-all" />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Card Detail Modal */}
        <AnimatePresence>
          {selectedCard && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCard(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-sm glass-card p-6 space-y-6 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-apple-red/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <h2 className="text-xl font-bold">Детали визитки</h2>
                  <button 
                    onClick={() => setSelectedCard(null)}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 relative z-10">
                  {/* QR Code Display */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative group">
                      <div className="absolute -inset-4 red-gradient rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative bg-white p-4 rounded-[2rem] shadow-2xl">
                        <QRCodeSVG 
                          value={`${window.location.origin}/card/${encodeCardData(selectedCard)}`}
                          size={200}
                          level="Q"
                          includeMargin={true}
                          imageSettings={{
                            src: "/logo.png?v=3",
                            x: undefined,
                            y: undefined,
                            height: 32,
                            width: 32,
                            excavate: true,
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Ваш QR-код</p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase font-bold">Автомобиль</span>
                      <span className="text-base font-bold">{selectedCard.carModel}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase font-bold">Госномер</span>
                      <span className="text-base font-mono font-bold uppercase">{selectedCard.plateNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase font-bold">Владелец</span>
                      <span className="text-base font-bold">{selectedCard.ownerName}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-600 text-center px-4">
                      Это данные вашей визитки. Люди увидят их при сканировании вашего QR-кода.
                    </p>
                    <button
                      onClick={() => setSelectedCard(null)}
                      className="w-full py-3 bg-white/5 text-gray-400 rounded-xl text-sm font-bold hover:bg-white/10 transition-all mt-2"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <div className="text-center pt-4">
          <p className="text-xs text-gray-600 uppercase tracking-[0.2em] font-bold">
            CarQR Personal Cabinet • Secure & Private
          </p>
        </div>
      </div>
    </div>
  );
}
