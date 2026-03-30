'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Car, QrCode, Download, Send, Phone, User, Mail, MessageSquare, AlertTriangle, ShieldAlert, ShieldCheck, Info, ChevronDown, ChevronUp, Check, Loader2, HelpCircle, Palette, Image as ImageIcon, Type, Plus, Trash2, BarChart3, DownloadCloud, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { encodeCardData, type CarCardData } from '@/lib/utils';
import { QRCodeSVG } from 'qrcode.react';

const BUTTON_OPTIONS = [
  { id: 'evacuation', label: 'Эвакуация', icon: AlertTriangle, color: 'bg-orange-500', hint: 'Сообщить о риске эвакуации' },
  { id: 'damage', label: 'Повреждение', icon: ShieldAlert, color: 'bg-red-500', hint: 'Сообщить о повреждении авто' },
  { id: 'vandalism', label: 'Вандализм', icon: ShieldAlert, color: 'bg-purple-500', hint: 'Сообщить о действиях вандалов' },
  { id: 'message', label: 'Сообщение', icon: MessageSquare, color: 'bg-blue-500', hint: 'Отправить произвольное сообщение' },
];

const STORAGE_KEY = 'carqr_draft';
const SAVED_CARDS_KEY = 'carqr_saved_cards';

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState<CarCardData>({
    carModel: '',
    plateNumber: '',
    ownerName: '',
    phone1: '',
    telegram: '',
    whatsapp: '',
    max: '',
    showContact: true,
    quickButtons: ['evacuation', 'damage', 'message'],
    themeColor: '#991b1b',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    qrText: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showMockup, setShowMockup] = useState(false);
  const [currentMockupIndex, setCurrentMockupIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const MOCKUP_IMAGES = [
    { src: 'https://picsum.photos/seed/car-sticker-1/800/600', title: 'Вид спереди', desc: 'Размещение на лобовом стекле' },
    { src: 'https://picsum.photos/seed/car-sticker-2/800/600', title: 'Вид сбоку', desc: 'Размещение на боковом стекле' },
    { src: 'https://picsum.photos/seed/car-sticker-3/800/600', title: 'Вид сзади', desc: 'Размещение на заднем стекле' },
    { src: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800&h=600', title: 'Mercedes G-class', desc: 'Пример размещения на заднем стекле внедорожника' },
    { src: 'https://picsum.photos/seed/car-qr-4/800/600', title: 'Стиль и минимализм', desc: 'Вариант для любого типа кузова' },
  ];
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [stats, setStats] = useState<{ totalScans: number; cardScans: Record<string, number> } | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [savedCards, setSavedCards] = useState<CarCardData[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    instruction: false,
    car: true,
    owner: true,
    socials: false,
    buttons: false,
    design: false,
  });

  const phoneInputRef = React.useRef<HTMLInputElement>(null);
  const carModelRef = React.useRef<HTMLInputElement>(null);
  const plateNumberRef = React.useRef<HTMLInputElement>(null);
  const ownerNameRef = React.useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Load draft, statistics and theme
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft && draft.trim() !== '') {
      try {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }

    const saved = localStorage.getItem(SAVED_CARDS_KEY);
    if (saved && saved.trim() !== '') {
      try {
        setSavedCards(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved cards', e);
      }
    }

    // PWA Install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    setIsIOS(isIOSDevice);
    if (isIOSDevice && !isStandalone) {
      setShowInstallBanner(true);
    }

    // Fetch metrics
    fetch('/api/metrics')
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text().catch(() => 'No error details');
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        return res.json();
      })
      .then(data => {
        if (data && typeof data === 'object') {
          setStats(data);
        }
      })
      .catch(err => {
        console.error('Error fetching metrics:', err);
        // Fallback to empty stats to avoid UI breakage
        setStats({ totalScans: 0, cardScans: {} });
      });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Save draft
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, mounted]);

  const saveCardToProfile = () => {
    // Check if card already exists
    const exists = savedCards.some(c => c.plateNumber === formData.plateNumber && c.carModel === formData.carModel);
    if (exists) {
      router.push('/cabinet');
      return;
    }

    const newSaved = [...savedCards, { ...formData }];
    setSavedCards(newSaved);
    localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(newSaved));
    triggerVibration(50);
    router.push('/cabinet');
  };

  const clearDraft = () => {
    setFormData({
      carModel: '',
      plateNumber: '',
      ownerName: '',
      phone1: '',
      telegram: '',
      whatsapp: '',
      max: '',
      showContact: true,
      quickButtons: ['evacuation', 'damage', 'message'],
      themeColor: '#991b1b',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      qrText: '',
    });
    localStorage.removeItem(STORAGE_KEY);
    triggerVibration(20);
  };

  const validateField = useCallback((name: string, value: string) => {
    let error = '';
    if (name === 'carModel' && !value.trim()) error = 'Введите марку и модель';
    if (name === 'plateNumber' && !value.trim()) error = 'Введите госномер';
    if (name === 'ownerName' && !value.trim()) error = 'Введите имя';
    if (name === 'phone1') {
      const digits = value.replace(/\D/g, '');
      if (!digits) error = 'Введите номер телефона';
      else if (digits.length < 11) error = 'Номер слишком короткий';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  }, []);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    
    let formatted = '+7 ';
    if (digits.length > 1) {
      const main = digits.startsWith('7') || digits.startsWith('8') ? digits.slice(1) : digits;
      if (main.length > 0) formatted += `(${main.slice(0, 3)}`;
      if (main.length > 3) formatted += `) ${main.slice(3, 6)}`;
      if (main.length > 6) formatted += `-${main.slice(6, 8)}`;
      if (main.length > 8) formatted += `-${main.slice(8, 10)}`;
    }
    return formatted.trim();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue = value;

    if (name === 'phone1' || name === 'whatsapp') {
      newValue = formatPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : newValue
    }));

    if (errors[name]) {
      validateField(name, newValue);
    }
  };

  const triggerVibration = (pattern: number | number[] = 50) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  };

  const toggleButton = (id: string) => {
    triggerVibration(10);
    setFormData(prev => ({
      ...prev,
      quickButtons: prev.quickButtons.includes(id)
        ? prev.quickButtons.filter(b => b !== id)
        : [...prev.quickButtons, id]
    }));
  };

  const generateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const isCarValid = validateField('carModel', formData.carModel);
    const isPlateValid = validateField('plateNumber', formData.plateNumber);
    const isOwnerValid = validateField('ownerName', formData.ownerName);
    const isPhoneValid = validateField('phone1', formData.phone1);

    if (!isCarValid || !isPlateValid || !isOwnerValid || !isPhoneValid) {
      triggerVibration([100, 50, 100]);
      // Expand sections with errors
      setExpandedSections(prev => ({
        ...prev,
        car: !isCarValid || !isPlateValid || prev.car,
        owner: !isOwnerValid || !isPhoneValid || prev.owner,
      }));

      // Focus the first invalid field
      setTimeout(() => {
        if (!isCarValid) carModelRef.current?.focus();
        else if (!isPlateValid) plateNumberRef.current?.focus();
        else if (!isOwnerValid) ownerNameRef.current?.focus();
        else if (!isPhoneValid) phoneInputRef.current?.focus();
      }, 100);

      return;
    }

    setIsGenerating(true);
    triggerVibration(30);

    // Simulate generation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const encoded = encodeCardData(formData);
    
    // Check if data is too long for QR code (approx limit for Version 40 with compression)
    if (encoded.length > 2000) {
      setErrors(prev => ({ ...prev, general: 'Слишком много данных для QR-кода. Попробуйте сократить текст.' }));
      setIsGenerating(false);
      triggerVibration([100, 50, 100]);
      return;
    }

    const url = `${window.location.origin}/card/${encoded}`;
    setGeneratedUrl(url);
    setIsGenerating(false);
    setIsSuccess(true);
    
    // Auto-save to profile if not already there
    const exists = savedCards.some(c => c.plateNumber === formData.plateNumber && c.carModel === formData.carModel);
    if (!exists) {
      const newSaved = [...savedCards, { ...formData }];
      setSavedCards(newSaved);
      localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(newSaved));
    }

    // Notify admin via Telegram
    try {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            carModel: formData.carModel,
            plateNumber: formData.plateNumber,
            ownerName: formData.ownerName,
            phone1: formData.phone1,
            url: url
          }
        }),
      }).then(res => res.json()).then(data => {
        if (data.error) {
          console.error('Telegram notification error:', data.error);
        } else {
          console.log('Telegram notification sent successfully');
        }
      });
    } catch (err) {
      console.error('Failed to send admin notification:', err);
    }

    setTimeout(() => {
      setShowQR(true);
      setIsSuccess(false);
    }, 500);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      triggerVibration(50);
      // Optional: show a toast or temporary success state
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const shareApp = async () => {
    const appUrl = 'https://autoqrcard.vercel.app/';
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CarQR — Ваш QR-код для связи',
          text: 'Создайте свой QR-код для автомобиля, чтобы другие могли связаться с вами, если машина мешает.',
          url: appUrl,
        });
      } catch (err) {
        // Ignore AbortError (user canceled sharing)
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      copyToClipboard(appUrl);
      alert('Ссылка на приложение скопирована в буфер обмена');
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 4;
    const qrSize = 240 * scale;
    const padding = 10 * scale;
    const fontSize = 14 * scale;
    const lineHeight = 18 * scale;
    const maxWidth = qrSize - (padding * 2);

    ctx.font = `bold ${fontSize}px sans-serif`;
    
    // Calculate lines
    const words = (formData.qrText || '').split(' ');
    const lines: string[] = [];
    let currentLine = '';

    if (formData.qrText) {
      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(currentLine);
          currentLine = words[n] + ' ';
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
    }

    const textHeight = lines.length > 0 ? (lines.length * lineHeight) + padding : 0;
    
    canvas.width = qrSize;
    canvas.height = qrSize + textHeight;
    
    const img = new window.Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, qrSize, qrSize);
      
      if (lines.length > 0) {
        ctx.fillStyle = 'black';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        lines.forEach((line, i) => {
          ctx.fillText(line.trim(), qrSize / 2, qrSize + (i * lineHeight) + fontSize);
        });
      }
      
      const pngFile = canvas.toDataURL('image/png', 1.0);
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${formData.plateNumber || 'car'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const handleInstallClick = () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      installPWA();
    }
  };

  const shareQRImage = async () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg || !navigator.share) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 4;
    const qrSize = 240 * scale;
    const padding = 10 * scale;
    const fontSize = 14 * scale;
    const lineHeight = 18 * scale;
    const maxWidth = qrSize - (padding * 2);

    ctx.font = `bold ${fontSize}px sans-serif`;
    
    // Calculate lines
    const words = (formData.qrText || '').split(' ');
    const lines: string[] = [];
    let currentLine = '';

    if (formData.qrText) {
      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(currentLine);
          currentLine = words[n] + ' ';
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
    }

    const textHeight = lines.length > 0 ? (lines.length * lineHeight) + padding : 0;
    
    canvas.width = qrSize;
    canvas.height = qrSize + textHeight;
    
    const img = new window.Image();
    img.onload = async () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, qrSize, qrSize);
      
      if (lines.length > 0) {
        ctx.fillStyle = 'black';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        lines.forEach((line, i) => {
          ctx.fillText(line.trim(), qrSize / 2, qrSize + (i * lineHeight) + fontSize);
        });
      }
      
      canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `QR_${formData.plateNumber || 'car'}.png`, { type: 'image/png' });
          
          try {
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: 'Моя QR-визитка',
                text: 'Отсканируй, чтобы связаться со мной!',
              });
            } else {
              // Fallback to regular share if file share not supported
              shareApp();
            }
          } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
              console.error('Error sharing image:', err);
            }
          }
        }, 'image/png');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-apple-red selection:text-white transition-colors duration-300" suppressHydrationWarning>
      <header className="glass-panel sticky top-0 z-50 mx-2 mt-2 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-[46px] h-[46px] relative rounded-lg overflow-hidden shadow-lg border border-white/10">
            <Image 
              src="/logo.png" 
              alt="CarQR Logo" 
              fill 
              sizes="46px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="heading-section">CarQR</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/cabinet"
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all relative"
            title="Личный кабинет"
          >
            <User className="w-5 h-5" />
            {savedCards.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-apple-red text-white text-xs font-bold rounded-full flex items-center justify-center">
                {savedCards.length}
              </span>
            )}
          </Link>

          {deferredPrompt && (
            <button
              onClick={installPWA}
              className="px-3 h-9 rounded-full bg-apple-red text-white text-sm font-medium flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <DownloadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Установить</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto p-2 space-y-3">
        {/* PWA Install Banner */}
        <AnimatePresence>
          {(deferredPrompt || (isIOS && showInstallBanner)) && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card p-4 relative overflow-hidden border-apple-red/30"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-apple-red/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
              <div className="flex items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-apple-red/20 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-apple-red" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Установите CarQR</h3>
                    <p className="text-[10px] text-secondary leading-tight">Быстрый доступ к вашим визиткам прямо с рабочего стола</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInstallBanner(false)}
                    className="p-2 text-tertiary hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>
                  <button
                    onClick={handleInstallClick}
                    className="px-4 py-2 rounded-full bg-apple-red text-white text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    Установить
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Stats Section - Temporarily Commented Out
        <div className="glass-card p-3 relative overflow-hidden">
          <button
            type="button"
            onClick={() => setShowStats(!showStats)}
            className="w-full flex items-center justify-between text-left group focus:outline-none rounded-xl p-1 -ml-1 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-apple-red/20 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-apple-red" />
              </div>
              <h2 className="heading-card">Статистика</h2>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
              {showStats ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 grid grid-cols-2 gap-3">
                  <div className="glass-panel p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-caption mb-1">Всего сканирований</span>
                    <span className="text-2xl font-black text-apple-red">{stats?.totalScans || 0}</span>
                  </div>
                  <div className="glass-panel p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-caption mb-1">Активных визиток</span>
                    <span className="text-2xl font-black text-white">{Object.keys(stats?.cardScans || {}).length}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        */}

        {/* Recent Cards Section */}
        {savedCards.length > 0 && (
          <div className="glass-card p-3 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-caption">Недавние визитки</h3>
              <Link href="/cabinet" className="text-caption text-apple-red hover:opacity-80 transition-opacity">Все</Link>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {savedCards.slice(-5).reverse().map((card, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setFormData(card);
                    triggerVibration(10);
                  }}
                  className="flex-shrink-0 glass-panel p-2 flex items-center gap-2 min-w-[140px] hover:bg-white/5 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <Car className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-label text-primary truncate">{card.carModel}</div>
                    <div className="text-[9px] text-tertiary font-medium truncate">{card.plateNumber}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="glass-card p-4 md:p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-apple-red/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
                  <div className="flex flex-col items-center text-center gap-1.5 mb-5 relative z-10">
            <div className="w-[58px] h-[58px] relative rounded-xl overflow-hidden border border-white/20 shadow-2xl">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill 
                sizes="58px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="heading-section">Создать визитку</h1>
              <p className="text-secondary text-sm">Безопасное шифрование данных</p>
            </div>
          </div>

          {/* Instruction Section */}
          <div className="mb-4 border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => toggleSection('instruction')}
              className="w-full flex items-center justify-between text-left group focus:outline-none rounded-xl p-1 -ml-1 hover:bg-white/5 transition-colors"
            >
              <h2 className="heading-card">Как это работает?</h2>
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                {expandedSections.instruction ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            <AnimatePresence>
              {expandedSections.instruction && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 space-y-2 text-secondary text-sm">
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-apple-red/20 flex items-center justify-center shrink-0 text-apple-red font-bold text-[10px]">1</div>
                      <p>Заполните данные о вашем автомобиле и контактную информацию.</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-apple-red/20 flex items-center justify-center shrink-0 text-apple-red font-bold text-[10px]">2</div>
                      <p>Сгенерируйте уникальный QR-код, который содержит зашифрованную ссылку.</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-apple-red/20 flex items-center justify-center shrink-0 text-apple-red font-bold text-[10px]">3</div>
                      <p>Распечатайте код и разместите его под лобовым стеклом.</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-apple-red/20 flex items-center justify-center shrink-0 text-apple-red font-bold text-[10px]">4</div>
                      <p>Закажите оригинальную наклейку.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={generateQR} className="space-y-3">
            {/* Car Info */}
            <div className="space-y-3 border-b border-white/10 pb-3 pt-1">
              <button 
                type="button"
                onClick={() => toggleSection('car')}
                className="w-full flex items-center justify-between text-left group focus:outline-none rounded-xl p-1 -ml-1 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-apple-red/20 flex items-center justify-center">
                    <Car className="w-4 h-4 text-apple-red" />
                  </div>
                  <h2 className="heading-card">Автомобиль</h2>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                  {expandedSections.car ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </button>
              
              <AnimatePresence>
                {expandedSections.car && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-caption ml-1">Марка и модель</label>
                        <motion.div
                          animate={errors.carModel ? { x: [-4, 4, -4, 4, 0] } : {}}
                          transition={{ duration: 0.4 }}
                        >
                          <input
                            required
                            name="carModel"
                            ref={carModelRef}
                            value={formData.carModel || ''}
                            onChange={handleInputChange}
                            placeholder="Tesla Model 3"
                            className={`w-full bg-white/5 border-2 ${errors.carModel ? 'border-apple-red shadow-[0_0_20px_rgba(255,59,48,0.2)]' : 'border-white/5 hover:border-white/10'} rounded-xl px-3 py-2 text-base focus:border-apple-red transition-all outline-none placeholder:text-tertiary`}
                          />
                        </motion.div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption ml-1">Госномер</label>
                        <motion.div
                          animate={errors.plateNumber ? { x: [-4, 4, -4, 4, 0] } : {}}
                          transition={{ duration: 0.4 }}
                        >
                          <input
                            required
                            name="plateNumber"
                            ref={plateNumberRef}
                            value={formData.plateNumber || ''}
                            onChange={handleInputChange}
                            placeholder="А123ВС 777"
                            className={`w-full bg-white/5 border-2 ${errors.plateNumber ? 'border-apple-red shadow-[0_0_20px_rgba(255,59,48,0.2)]' : 'border-white/5 hover:border-white/10'} rounded-xl px-3 py-2 text-base focus:border-apple-red transition-all outline-none placeholder:text-tertiary`}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Owner Info */}
            <div className="space-y-3 border-b border-white/10 pb-3 pt-1">
              <button 
                type="button"
                onClick={() => toggleSection('owner')}
                className="w-full flex items-center justify-between text-left group focus:outline-none rounded-xl p-1 -ml-1 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-apple-red/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-apple-red" />
                  </div>
                  <h2 className="heading-card">Владелец</h2>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                  {expandedSections.owner ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </button>

              <AnimatePresence>
                {expandedSections.owner && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <motion.div
                          animate={errors.ownerName ? { x: [-4, 4, -4, 4, 0] } : {}}
                          transition={{ duration: 0.4 }}
                        >
                          <input
                            required
                            name="ownerName"
                            ref={ownerNameRef}
                            value={formData.ownerName || ''}
                            onChange={handleInputChange}
                            placeholder="Ваше имя"
                            className={`w-full bg-white/5 border-2 ${errors.ownerName ? 'border-apple-red shadow-[0_0_20px_rgba(255,59,48,0.2)]' : 'border-white/5 hover:border-white/10'} rounded-xl px-3 py-2 text-base focus:border-apple-red transition-all outline-none placeholder:text-tertiary`}
                          />
                        </motion.div>
                      </div>
                      <div className="space-y-1.5">
                        <motion.div
                          animate={errors.phone1 ? { x: [-4, 4, -4, 4, 0] } : {}}
                          transition={{ duration: 0.4 }}
                        >
                          <input
                            required
                            type="tel"
                            name="phone1"
                            ref={phoneInputRef}
                            value={formData.phone1 || ''}
                            onChange={handleInputChange}
                            placeholder="Телефон"
                            className={`w-full bg-white/5 border-2 ${errors.phone1 ? 'border-apple-red shadow-[0_0_20px_rgba(255,59,48,0.2)]' : 'border-white/5 hover:border-white/10'} rounded-xl px-3 py-2 text-base focus:border-apple-red transition-all outline-none placeholder:text-tertiary`}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Socials */}
            <div className="space-y-3 border-b border-white/10 pb-3 pt-1">
              <button 
                type="button"
                onClick={() => toggleSection('socials')}
                className="w-full flex items-center justify-between text-left group focus:outline-none rounded-xl p-1 -ml-1 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-apple-red/20 flex items-center justify-center">
                    <Send className="w-4 h-4 text-apple-red" />
                  </div>
                  <h2 className="heading-card">Мессенджеры</h2>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                  {expandedSections.socials ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </button>

              <AnimatePresence>
                {expandedSections.socials && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <input
                          name="telegram"
                          value={formData.telegram || ''}
                          onChange={handleInputChange}
                          placeholder="Telegram (username)"
                          className="w-full bg-white/5 border-2 border-white/5 hover:border-white/10 rounded-xl px-3 py-2 text-base focus:border-apple-red transition-all outline-none placeholder:text-white/30"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <input
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp || ''}
                          onChange={handleInputChange}
                          placeholder="WhatsApp (+7...)"
                          className="w-full bg-white/5 border-2 border-white/5 hover:border-white/10 rounded-xl px-3 py-2 text-base focus:border-apple-red transition-all outline-none placeholder:text-tertiary"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Buttons */}
            <div className="space-y-3 border-b border-white/10 pb-3 pt-1">
              <button 
                type="button"
                onClick={() => toggleSection('buttons')}
                className="w-full flex items-center justify-between text-left group focus:outline-none rounded-xl p-1 -ml-1 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-apple-red/20 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-apple-red" />
                  </div>
                  <h2 className="heading-card">Быстрые кнопки</h2>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                  {expandedSections.buttons ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </button>

              <AnimatePresence>
                {expandedSections.buttons && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {BUTTON_OPTIONS.map((btn) => {
                        const isActive = formData.quickButtons.includes(btn.id);
                        return (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => toggleButton(btn.id)}
                            className={`flex flex-col items-center justify-center min-h-[60px] p-2 rounded-xl border-2 transition-all active:scale-95 ${
                              isActive
                                ? 'bg-apple-red border-transparent text-white red-glow'
                                : 'bg-white/5 border-white/5 text-white hover:border-white/10'
                            }`}
                          >
                            <btn.icon className={`w-4 h-4 mb-1 text-white`} />
                            <span className={`text-[10px] uppercase tracking-wider font-bold text-center text-white`}>
                              {btn.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Design Customization */}
            <div className="space-y-3 border-b border-white/10 pb-3 pt-1">
              <button 
                type="button"
                onClick={() => toggleSection('design')}
                className="w-full flex items-center justify-between text-left group focus:outline-none rounded-xl p-1 -ml-1 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-apple-red/20 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-apple-red" />
                  </div>
                  <h2 className="heading-card">Дизайн</h2>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                  {expandedSections.design ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </button>

              <AnimatePresence>
                {expandedSections.design && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-caption ml-1">Основной цвет</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            name="themeColor"
                            value={formData.themeColor}
                            onChange={handleInputChange}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-2 border-white/10"
                          />
                          <input
                            type="text"
                            name="themeColor"
                            value={formData.themeColor}
                            onChange={handleInputChange}
                            className="flex-1 bg-white/5 border-2 border-white/5 rounded-xl px-2 py-1.5 text-xs font-mono text-secondary"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-caption ml-1">Текст рядом с QR</label>
                        <div className="relative">
                          <Type className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tertiary" />
                          <input
                            name="qrText"
                            value={formData.qrText || ''}
                            onChange={handleInputChange}
                            placeholder="Сканируй меня!"
                            className="w-full bg-white/5 border-2 border-white/5 rounded-xl pl-8 pr-3 py-2 text-base focus:border-apple-red outline-none transition-all placeholder:text-tertiary"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full py-3 px-6 rounded-xl font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl ${
                isSuccess 
                  ? 'bg-green-500 text-white' 
                  : 'red-gradient text-white red-glow hover:brightness-110'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Создаем...
                </>
              ) : isSuccess ? (
                <>
                  <Check className="w-5 h-5" />
                  Готово!
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5" />
                  Создать QR-код
                </>
              )}
            </button>

            {errors.general && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-base font-medium">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                {errors.general}
              </div>
            )}
          </form>
        </div>

        <footer className="mt-12 mb-8 text-center space-y-6 relative z-10 px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
              <ShieldCheck className="w-4 h-4 text-apple-red" />
              <span className="text-[10px] text-tertiary leading-tight max-w-[220px] text-left uppercase tracking-wider font-medium">
                Данные не хранятся на сервере, а кодируются прямо в QR-код
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-widest">
              <a href="mailto:info@premiumwebsite.ru" className="flex items-center gap-1.5 text-secondary hover:text-apple-red transition-colors">
                <Mail className="w-3.5 h-3.5" />
                Поддержка
              </a>
              <Link href="/privacy" className="text-tertiary hover:text-secondary transition-colors">
                Политика конфиденциальности
              </Link>
              <Link href="/privacy" className="text-tertiary hover:text-secondary transition-colors">
                Обработка данных
              </Link>
            </div>
          </div>
          <p className="text-caption opacity-50">© 2026 CarQR. Все права защищены.</p>
        </footer>
      </main>

      {/* iOS Install Instructions */}
      <AnimatePresence>
        {showIOSInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowIOSInstructions(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full max-w-sm glass-card p-6 space-y-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-apple-red/20 flex items-center justify-center">
                  <Package className="w-8 h-8 text-apple-red" />
                </div>
                <h3 className="text-xl font-bold">Установка на iOS</h3>
                <p className="text-sm text-secondary">Следуйте инструкции ниже, чтобы добавить приложение на главный экран</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">1</div>
                  <p className="text-sm">Нажмите кнопку <span className="font-bold text-apple-red">«Поделиться»</span> в нижней панели браузера</p>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-sm">Прокрутите меню вниз и выберите <span className="font-bold text-apple-red">«На экран „Домой“»</span></p>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-sm">Нажмите <span className="font-bold text-apple-red">«Добавить»</span> в правом верхнем углу</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSInstructions(false)}
                className="w-full py-3 rounded-xl bg-white/10 font-bold hover:bg-white/20 transition-all"
              >
                Понятно
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && generatedUrl && (
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
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center gap-10">
              <div className="relative group">
                <div className="absolute -inset-4 red-gradient rounded-[3rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-full">
                  <QRCodeSVG 
                    id="qr-code-svg"
                    value={generatedUrl}
                    size={280}
                    level="Q"
                    includeMargin={true}
                    fgColor={formData.themeColor}
                    className="max-w-full h-auto"
                  />
                  {formData.qrText && (
                    <div className="mt-2 text-black font-bold text-xl text-center break-words max-w-[280px]">
                      {formData.qrText}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full max-w-sm space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={downloadQR}
                    className="py-3 px-2 rounded-2xl red-gradient text-white font-bold flex flex-col items-center justify-center gap-1.5 shadow-xl red-glow hover:brightness-110 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-caption">Скачать</span>
                  </button>
                  
                  <button
                    onClick={() => setShowMockup(true)}
                    className="py-3 px-2 rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 border bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-caption">Макет</span>
                  </button>
                  
                  <button
                    onClick={saveCardToProfile}
                    className="py-3 px-2 rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 border bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-caption">Профиль</span>
                  </button>
                </div>

                <Link
                  href="/order"
                  className="w-full py-4 px-8 rounded-2xl bg-apple-red text-white font-bold flex items-center justify-center gap-3 shadow-xl red-glow hover:brightness-110 transition-all"
                >
                  <Package className="w-5 h-5" />
                  Заказать наклейку
                </Link>

                <button
                  onClick={() => copyToClipboard(generatedUrl || '')}
                  className="w-full py-4 px-8 rounded-2xl bg-white/5 text-white font-bold flex items-center justify-center gap-3 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Check className="w-5 h-5 text-white/30" />
                  Копировать ссылку
                </button>

                <div className="space-y-3 pt-2">
                  <p className="text-caption text-center">Поделиться ссылкой на приложение</p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        const text = encodeURIComponent('CarQR — Ваш QR-код для связи');
                        const url = encodeURIComponent('https://autoqrcard.vercel.app/');
                        window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
                      }}
                      className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
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
                      className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
                      title="WhatsApp"
                    >
                      <MessageSquare className="w-5 h-5 text-apple-red" />
                    </button>
                    <button
                      onClick={() => {
                        const url = encodeURIComponent('https://autoqrcard.vercel.app/');
                        window.open(`https://vk.com/share.php?url=${url}`, '_blank');
                      }}
                      className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
                      title="VK"
                    >
                      <span className="font-bold text-apple-red text-sm">VK</span>
                    </button>
                    <button
                      onClick={() => shareQRImage()}
                      className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
                      title="Поделиться картинкой"
                    >
                      <ImageIcon className="w-5 h-5 text-apple-red" />
                    </button>
                    <button
                      onClick={() => shareApp()}
                      className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
                      title="Другое"
                    >
                      <Plus className="w-5 h-5 text-apple-red" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 w-full max-w-sm">
                <p className="text-body-sm text-center">
                  Распечатайте этот код и разместите его под лобовым стеклом. При сканировании откроется ваша персональная визитка.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mockup Modal */}
      <AnimatePresence>
        {showMockup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col bg-black/95 backdrop-blur-2xl"
          >
            <header className="flex items-center justify-between px-8 py-6 border-b border-white/10">
              <h2 className="text-2xl font-bold tracking-tight">Макеты наклеек</h2>
              <button 
                onClick={() => setShowMockup(false)}
                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </header>
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentMockupIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <Image 
                      src={MOCKUP_IMAGES[currentMockupIndex].src} 
                      alt="Mockup" 
                      fill 
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                      <p className="heading-card text-xl">{MOCKUP_IMAGES[currentMockupIndex].title}</p>
                      <p className="text-body-sm">{MOCKUP_IMAGES[currentMockupIndex].desc}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentMockupIndex((prev) => (prev - 1 + MOCKUP_IMAGES.length) % MOCKUP_IMAGES.length);
                    }}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white pointer-events-auto hover:bg-black/60 transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentMockupIndex((prev) => (prev + 1) % MOCKUP_IMAGES.length);
                    }}
                    className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white pointer-events-auto hover:bg-black/60 transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {MOCKUP_IMAGES.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentMockupIndex ? 'bg-apple-red w-4' : 'bg-white/20'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
