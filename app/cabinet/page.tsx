'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Car, 
  User, 
  ChevronRight, 
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  X,
  Download,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { type CarCardData, encodeCardData } from '@/lib/utils';

const SAVED_CARDS_KEY = 'carqr_saved_cards';

export default function CabinetPage() {
  const router = useRouter();
  const [savedCards, setSavedCards] = useState<CarCardData[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CarCardData | null>(null);
  const [logoBase64, setLogoBase64] = useState<string>('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // Load logo as base64 for QR code embedding
    fetch('/logo.png')
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch(err => console.error('Error loading logo for QR:', err));

    const saved = localStorage.getItem(SAVED_CARDS_KEY);
    if (saved && saved.trim() !== '') {
      try {
        setSavedCards(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved cards', e);
      }
    }
  }, []);

  const deleteCard = (index: number) => {
    const newCards = savedCards.filter((_, i) => i !== index);
    setSavedCards(newCards);
    localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(newCards));
    setSelectedCard(null);
  };

  const editCard = (card: CarCardData) => {
    localStorage.setItem('carqr_draft', JSON.stringify(card));
    router.push('/');
  };

  const exportCards = () => {
    const dataStr = JSON.stringify(savedCards);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'carqr_backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importCards = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... logic removed ...
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-apple-red selection:text-white p-3 md:p-4">
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
              />
            </div>
            <span className="heading-section">
            Car
            <motion.span
              animate={{ color: ['#ffffff', '#ef4444', '#ffffff'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              QR
            </motion.span>
          </span>
          </Link>
          <h1 className="heading-card">Личный кабинет</h1>
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
              <h2 className="text-label">Ваш профиль</h2>
              <p className="text-secondary text-sm">Локальное хранилище данных</p>
              <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 bg-apple-red/10 rounded-lg border border-apple-red/20">
                <span className="w-1 h-1 rounded-full bg-apple-red animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-apple-red">Активен</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-2.5">
          <div className="glass-panel p-2.5 flex flex-col items-center justify-center gap-0 text-center">
            <span className="text-2xl font-black text-primary">{savedCards.length}</span>
            <span className="text-caption">Визиток</span>
          </div>
        </div>

        {/* Backup Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={exportCards}
            className="w-full glass-panel p-2.5 flex items-center justify-center gap-2 text-caption hover:bg-white/5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-white/40" />
            Сохранить визитку
          </button>
        </div>

        {/* Cards List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-caption">Ваши визитки</h3>
          </div>

          {savedCards.length === 0 ? (
            <div className="glass-panel p-6 text-center space-y-2.5">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <p className="text-secondary text-sm">У вас пока нет сохраненных визиток</p>
              <Link 
                href="/" 
                className="inline-block px-4 py-1.5 bg-apple-red rounded-xl text-[11px] uppercase tracking-wider font-bold text-white hover:scale-105 transition-all"
              >
                СОЗДАТЬ ПЕРВУЮ
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
                      <Car className="w-3.5 h-3.5 text-white/40 group-hover:text-apple-red transition-all" />
                    </div>
                    <div>
                      <div className="text-label text-primary">{card.carModel}</div>
                      <div className="text-[10px] text-tertiary font-medium">{card.plateNumber}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-tertiary group-hover:text-primary transition-all" />
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
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-sm glass-card p-6 space-y-6 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-apple-red/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <h2 className="heading-section">Детали визитки</h2>
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
                      
                      {/* Frame Preview Wrapper */}
                      <div className={`relative p-6 transition-all duration-300 flex flex-col items-center ${
                        selectedCard.selectedFrame === 'solid_black' ? 'bg-black rounded-[3rem]' :
                        selectedCard.selectedFrame === 'circle' ? 'bg-black rounded-full p-12' :
                        selectedCard.selectedFrame === 'label_bottom' ? 'bg-white rounded-[3rem] border-[3px] border-black' :
                        selectedCard.selectedFrame === 'bubble' ? 'bg-white rounded-[3rem] border-[3px] border-black mb-6 relative after:content-[""] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[12px] after:border-transparent after:border-t-black before:content-[""] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-[10px] before:border-transparent before:border-t-white before:z-10' :
                        selectedCard.selectedFrame === 'rounded_accent' ? 'bg-white rounded-bl-[3rem] rounded-br-[3rem] rounded-tl-[3rem] border-[3px] border-black' :
                        selectedCard.selectedFrame === 'double_border' ? 'bg-white rounded-[3rem] border-[3px] border-black p-8 shadow-[inset_0_0_0_4px_white,inset_0_0_0_7px_black]' :
                        'bg-white rounded-[3rem]'
                      }`}>
                        <div className={`relative bg-white p-3 rounded-[1.5rem] shadow-sm ${
                          (selectedCard.selectedFrame === 'solid_black' || selectedCard.selectedFrame === 'circle') ? 'ring-8 ring-white' : ''
                        }`}>
                          <QRCodeSVG 
                            value={`${window.location.origin}/card/${encodeCardData(selectedCard)}`}
                            size={180}
                            level="Q"
                            includeMargin={false}
                            fgColor={selectedCard.themeColor}
                            imageSettings={{
                              src: logoBase64 || "/logo.png",
                              x: undefined,
                              y: undefined,
                              height: 32,
                              width: 32,
                              excavate: true,
                            }}
                          />
                        </div>
                        
                        {/* Label Preview */}
                        {(selectedCard.qrText || selectedCard.selectedFrame !== 'none') && (
                          <div className="mt-4 w-full flex justify-center">
                            <div className={`px-6 py-2 rounded-2xl font-bold text-sm uppercase tracking-widest ${
                              (selectedCard.selectedFrame === 'label_bottom' || selectedCard.selectedFrame === 'bubble') ? 'bg-black text-white' : 
                              (selectedCard.selectedFrame === 'solid_black' || selectedCard.selectedFrame === 'circle') ? 'bg-white/20 text-white backdrop-blur-sm' :
                              'text-black'
                            }`}>
                              {selectedCard.qrText || 'SCAN ME'}
                            </div>
                          </div>
                        )}

                        {/* Bubble Pointer Preview */}
                        {selectedCard.selectedFrame === 'bubble' && (
                          <div className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-black"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-caption mt-2">Ваш QR-код</p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-caption">Автомобиль</span>
                      <span className="text-label text-primary">{selectedCard.carModel}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-caption">Госномер</span>
                      <span className="text-label text-primary">{selectedCard.plateNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-caption">Владелец</span>
                      <span className="text-label text-primary">{selectedCard.ownerName}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-secondary text-sm text-center px-4">
                      Это данные вашей визитки. Люди увидят их при сканировании вашего QR-кода.
                    </p>
                    <Link
                      href="/order"
                      className="w-full py-4 bg-apple-red text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg"
                    >
                      <Package className="w-4 h-4" />
                      Заказать наклейку
                    </Link>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => selectedCard && editCard(selectedCard)}
                        className="py-3 bg-white/5 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => {
                          const idx = savedCards.findIndex(c => c.plateNumber === selectedCard.plateNumber && c.carModel === selectedCard.carModel);
                          if (idx !== -1) deleteCard(idx);
                        }}
                        className="py-3 bg-apple-red/10 text-apple-red rounded-xl text-sm font-bold hover:bg-apple-red/20 transition-all border border-apple-red/20"
                      >
                        Удалить
                      </button>
                    </div>
                    <button
                      onClick={() => setSelectedCard(null)}
                      className="w-full py-3 bg-white/5 text-white/60 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
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
        <footer className="mt-12 mb-8 text-center space-y-6 relative z-10 px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-apple-red" />
              <span className="text-[10px] text-tertiary leading-tight max-w-[220px] text-left uppercase tracking-wider font-medium">
                Данные не хранятся на сервере, а кодируются прямо в QR-код
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] text-tertiary uppercase tracking-wider font-medium">© 2026 CarQR. Все права защищены.</p>
            <div className="flex flex-wrap justify-center gap-x-4 text-[10px] font-medium uppercase tracking-wider">
              <Link href="/privacy" className="text-tertiary hover:text-secondary transition-colors">
                Политика конфиденциальности
              </Link>
              <Link href="/privacy#data-processing" className="text-tertiary hover:text-secondary transition-colors">
                Обработка данных
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
