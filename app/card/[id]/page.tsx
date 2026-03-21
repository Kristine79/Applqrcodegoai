'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { decodeCardData, type CarCardData } from '@/lib/utils';
import Image from 'next/image';
import { 
  Car, 
  Phone, 
  Mail, 
  Send, 
  MessageSquare, 
  AlertTriangle,
  ShieldAlert,
  Info,
  QrCode,
  Download,
  User,
  Zap,
  ChevronDown,
  Plus,
  ArrowLeft,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

const BUTTON_CONFIG: Record<string, { label: string, icon: any, color: string }> = {
  evacuation: { label: 'Эвакуация', icon: AlertTriangle, color: 'bg-orange-500' },
  damage: { label: 'Повреждение', icon: ShieldAlert, color: 'bg-apple-red' },
  vandalism: { label: 'Вандализм', icon: ShieldAlert, color: 'bg-purple-500' },
  message: { label: 'Сообщение', icon: MessageSquare, color: 'bg-blue-500' },
};

export default function PublicCardView() {
  const params = useParams();
  const id = params.id as string;
  const [alertSent, setAlertSent] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [mounted, setMounted] = useState(false);

  const card = React.useMemo(() => {
    if (!id) return null;
    return decodeCardData(id);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    // Ensure dark theme is applied for public view
    document.documentElement.classList.add('dark');

    // Track scan
    if (id) {
      fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: id }),
      }).catch(err => console.error('Error tracking scan:', err));
    }
  }, [card, id]);

  const sendAlert = (type: string) => {
    // Show local success message
    setAlertSent(type);
    
    const config = BUTTON_CONFIG[type];
    
    // Simple notification: Open Telegram with pre-filled message
    if (card?.telegram) {
      const alertMessage = encodeURIComponent(`Здравствуйте! Я у вашего авто ${card.carModel} (${card.plateNumber}). Сигнал: ${config?.label || type}. Пожалуйста, выйдите.`);
      window.open(`https://t.me/${card.telegram.replace('@', '')}?text=${alertMessage}`, '_blank');
    } else if (card?.phone1) {
      // If no telegram, maybe they want to call?
      // window.location.href = `tel:${card.phone1}`;
    }

    setTimeout(() => setAlertSent(null), 3000);
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set high resolution for download
    const scale = 4; // 240 * 4 = 960px
    const size = 240 * scale;
    canvas.width = size;
    canvas.height = size;
    
    const img = new window.Image();
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, size, size);
        
        const pngFile = canvas.toDataURL('image/png', 1.0);
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR_${card?.plateNumber || 'car'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (!card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-8 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/10">
          <Info className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Визитка не найдена</h1>
        <p className="text-gray-400 mt-3 max-w-xs leading-relaxed">Возможно, ссылка повреждена или неверна. Попробуйте отсканировать код еще раз.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-8 py-4 px-8 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/5"
        >
          На главную
        </button>
      </div>
    );
  }

  const cardUrl = typeof window !== 'undefined' ? `${window.location.origin}/card/${id}` : '';

  if (!mounted) return null;

  return (
    <div 
      className="min-h-screen pb-12 bg-black text-white font-sans selection:bg-apple-red selection:text-white"
      suppressHydrationWarning
    >
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-apple-red/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-apple-red/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-6 pb-12 px-5 overflow-hidden">
        <div className="absolute inset-0 red-gradient opacity-20 blur-3xl -z-10 transform scale-150"></div>
        
        <div className="max-w-md mx-auto relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-2.5">
              <Link 
                href="/cabinet"
                className="w-9 h-9 glass-panel rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/5 transition-all shadow-xl"
                title="В профиль"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400" />
              </Link>
              <Link href="/" className="w-9 h-9 relative rounded-xl overflow-hidden border border-white/10 shadow-xl hover:opacity-80 transition-opacity">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  fill 
                  sizes="36px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </Link>
            </div>
            <button 
              onClick={() => setShowQR(true)}
              className="w-9 h-9 glass-panel rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/5 transition-all shadow-xl"
            >
              <QrCode className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight leading-tight">
              {card.carModel}
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl shadow-2xl transform -rotate-1 border border-white/10">
              <span className="text-xl font-black tracking-widest text-white uppercase font-mono">
                {card.plateNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-5 -mt-6 space-y-5 relative z-20">
        {/* Quick Actions */}
        {card.quickButtons.length > 0 && (
          <section className="grid grid-cols-2 gap-2.5">
            {card.quickButtons.map((btnId) => {
              const config = BUTTON_CONFIG[btnId];
              if (!config) return null;
              const Icon = config.icon;
              const isSent = alertSent === btnId;

              return (
                <motion.button
                  key={btnId}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendAlert(btnId)}
                  disabled={!!alertSent}
                  className={`relative overflow-hidden flex flex-col items-center justify-center min-h-[90px] p-3 rounded-[1.5rem] transition-all border shadow-2xl ${
                    isSent 
                      ? 'bg-green-500/20 border-green-500/50 text-green-500' 
                      : 'glass-panel border-white/10 text-white hover:bg-white/5'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${isSent ? 'bg-green-500/20' : 'bg-apple-red/10'}`}>
                    <Icon className={`w-4 h-4 ${isSent ? 'text-green-500 animate-pulse' : 'text-apple-red'}`} />
                  </div>
                  <span className="font-bold text-[10px] uppercase tracking-widest text-center text-gray-500">
                    {isSent ? 'Отправлено!' : config.label}
                  </span>
                </motion.button>
              );
            })}
          </section>
        )}

        {/* Contact Info */}
        {card.showContact && (
          <section className="glass-card p-5 space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-apple-red/20 flex items-center justify-center">
                <User className="w-3 h-3 text-apple-red" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Владелец авто
              </h3>
            </div>
            
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-2.5 -m-2.5">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
                  <User className="w-5 h-5 text-apple-red" />
                </div>
                <div>
                  <p className="font-bold text-lg tracking-tight">{card.ownerName}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <a href={`tel:${card.phone1}`} className="flex items-center gap-3 group p-2.5 -m-2.5 rounded-2xl hover:bg-white/5 transition-all">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                    <Phone className="w-5 h-5 text-apple-red" />
                  </div>
                  <div>
                    <p className="font-bold text-base tracking-tight">{card.phone1}</p>
                  </div>
                </a>

                {card.telegram && (
                  <a href={`https://t.me/${card.telegram.replace('@', '')}`} target="_blank" className="flex items-center gap-3 group p-2.5 -m-2.5 rounded-2xl hover:bg-white/5 transition-all">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                      <Send className="w-5 h-5 text-apple-red" />
                    </div>
                    <div>
                      <p className="font-bold text-base tracking-tight">@{card.telegram.replace('@', '')}</p>
                    </div>
                  </a>
                )}

                {card.whatsapp && (
                  <a href={`https://wa.me/${card.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" className="flex items-center gap-3 group p-2.5 -m-2.5 rounded-2xl hover:bg-white/5 transition-all">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                      <MessageSquare className="w-5 h-5 text-apple-red" />
                    </div>
                    <div>
                      <p className="font-bold text-base tracking-tight">{card.whatsapp}</p>
                    </div>
                  </a>
                )}

                {card.max && (
                  <div className="flex items-center gap-3 p-2.5 -m-2.5 rounded-2xl">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                      <Zap className="w-5 h-5 text-apple-red" />
                    </div>
                    <div>
                      <p className="font-bold text-base tracking-tight">{card.max}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Primary Contact Buttons */}
        <div className="grid grid-cols-1 gap-2.5">
          {card.phone1 && (
            <a 
              href={`tel:${card.phone1}`}
              className="flex items-center justify-center gap-2 text-white py-4 rounded-[1.25rem] font-bold text-base red-gradient shadow-2xl red-glow hover:brightness-110 transition-all active:scale-95"
            >
              <Phone className="w-4 h-4" />
              Позвонить
            </a>
          )}
          {card.telegram && (
            <a 
              href={`https://t.me/${card.telegram.replace('@', '')}`}
              target="_blank"
              className="flex items-center justify-center gap-2 bg-white/5 text-white py-4 rounded-[1.25rem] font-bold text-base border border-white/10 hover:bg-white/10 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              Написать в Telegram
            </a>
          )}
        </div>

        {/* Share Section */}
        <section className="glass-card p-5 space-y-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] text-center">Поделиться ссылкой на приложение</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                const text = encodeURIComponent('CarQR — Ваш QR-код для связи');
                const url = encodeURIComponent('https://autoqrcard.vercel.app/');
                window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
              }}
              className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all shadow-xl"
              title="Telegram"
            >
              <Send className="w-5 h-5 text-apple-red" />
            </button>
            <button
              onClick={() => {
                const text = encodeURIComponent('CarQR — Ваш QR-код для связи: ');
                const url = encodeURIComponent('https://autoqrcard.vercel.app/');
                window.open(`https://wa.me/?text=${text}${url}`, '_blank');
              }}
              className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all shadow-xl"
              title="WhatsApp"
            >
              <MessageSquare className="w-5 h-5 text-apple-red" />
            </button>
            <button
              onClick={() => {
                const url = encodeURIComponent('https://autoqrcard.vercel.app/');
                window.open(`https://vk.com/share.php?url=${url}`, '_blank');
              }}
              className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all shadow-xl"
              title="VK"
            >
              <span className="font-bold text-apple-red text-base">VK</span>
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'CarQR — Ваш QR-код для связи',
                    text: 'Создайте свой QR-код для автомобиля, чтобы другие могли связаться с вами, если машина мешает.',
                    url: 'https://autoqrcard.vercel.app/',
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText('https://autoqrcard.vercel.app/');
                  alert('Ссылка скопирована');
                }
              }}
              className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all shadow-xl"
              title="Другое"
            >
              <Plus className="w-5 h-5 text-apple-red" />
            </button>
          </div>
        </section>
      </main>

      <footer className="mt-8 mb-6 text-center space-y-5 px-5">
        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Разработка и поддержка</p>
          <div className="flex items-center justify-center">
            <a 
              href="mailto:info@premiumwebsite.ru" 
              className="group flex flex-col items-center gap-1"
            >
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-apple-red/20 group-hover:border-apple-red/30 transition-all">
                <Mail className="w-3.5 h-3.5 text-gray-400 group-hover:text-apple-red" />
              </div>
              <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-400 transition-colors">Email</span>
            </a>
          </div>
        </div>
        <div className="pt-4 border-t border-white/10">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">© 2026 CarQR. Все права защищены.</p>
        </div>
      </footer>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-2xl"
          >
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6 border-b border-white/10">
              <h2 className="text-2xl font-bold tracking-tight">Ваш QR-код</h2>
              <button 
                onClick={() => setShowQR(false)}
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center gap-10">
              <div className="relative group">
                <div className="absolute -inset-4 red-gradient rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl">
                  <QRCodeSVG 
                    id="qr-code-svg"
                    value={cardUrl}
                    size={280}
                    level="Q"
                    includeMargin={true}
                  />
                </div>
              </div>

              <div className="w-full max-w-sm space-y-4">
                <button
                  onClick={downloadQR}
                  className="w-full py-5 px-8 rounded-3xl red-gradient text-white font-bold flex items-center justify-center gap-3 shadow-xl red-glow hover:brightness-110 transition-all"
                >
                  <Download className="w-6 h-6" />
                  Скачать PNG
                </button>
                
                <button
                  onClick={() => setShowQR(false)}
                  className="w-full py-5 px-8 rounded-3xl bg-white/5 text-white font-bold flex items-center justify-center gap-3 border border-white/10 hover:bg-white/10 transition-all"
                >
                  Закрыть
                </button>
              </div>

              <div className="glass-panel p-6 w-full max-w-sm">
                <p className="text-xs text-gray-500 leading-relaxed text-center font-medium">
                  Распечатайте этот код и разместите его под лобовым стеклом. При сканировании откроется ваша персональная визитка.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
