'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Car, QrCode, Download, Send, Phone, User, Mail, MessageSquare, AlertTriangle, ShieldAlert, Info, ChevronDown, ChevronUp, Check, Loader2, HelpCircle, Palette, Image as ImageIcon, Type, Plus, Trash2, BarChart3, DownloadCloud } from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
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
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }

    const saved = localStorage.getItem(SAVED_CARDS_KEY);
    if (saved) {
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

    // Fetch stats
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching stats:', err));

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
    const newSaved = [...savedCards, { ...formData }];
    setSavedCards(newSaved);
    localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(newSaved));
    triggerVibration(50);
    router.push('/cabinet');
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
        downloadLink.download = `QR_${formData.plateNumber || 'car'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const shareQRImage = async () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg || !navigator.share) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const scale = 4;
    const size = 240 * scale;
    canvas.width = size;
    canvas.height = size;
    
    const img = new window.Image();
    img.onload = async () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, size, size);
        
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
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-apple-red selection:text-white transition-colors duration-300" suppressHydrationWarning>
      <header className="glass-panel sticky top-0 z-50 mx-2 mt-2 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 relative rounded-lg overflow-hidden shadow-lg border border-white/10">
            <Image 
              src="/logo.png" 
              alt="CarQR Logo" 
              fill 
              sizes="36px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-bold text-xl tracking-tight">CarQR</span>
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
        {/* Admin Stats Section */}
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
              <h2 className="text-base font-bold tracking-tight">Статистика</h2>
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
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Всего сканирований</span>
                    <span className="text-2xl font-black text-apple-red">{stats?.totalScans || 0}</span>
                  </div>
                  <div className="glass-panel p-3 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Активных визиток</span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{Object.keys(stats?.cardScans || {}).length}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="glass-card p-4 md:p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-apple-red/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
                  <div className="flex flex-col items-center text-center gap-1.5 mb-5 relative z-10">
            <div className="w-12 h-12 relative rounded-xl overflow-hidden border border-white/20 shadow-2xl">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill 
                sizes="48px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Создать визитку</h1>
              <p className="text-gray-500 text-xs font-medium">Безопасное шифрование данных</p>
            </div>
          </div>

          {/* Instruction Section */}
          <div className="mb-4 border-b border-white/10 pb-3">
            <button
              type="button"
              onClick={() => toggleSection('instruction')}
              className="w-full flex items-center justify-between text-left group focus:outline-none rounded-xl p-1 -ml-1 hover:bg-white/5 transition-colors"
            >
              <h2 className="text-base font-bold tracking-tight">Как это работает?</h2>
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
                  <div className="pt-2 space-y-2 text-gray-400 text-sm leading-relaxed">
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-apple-red/20 flex items-center justify-center shrink-0 text-apple-red font-bold text-xs">1</div>
                      <p>Заполните данные о вашем автомобиле и контактную информацию.</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-apple-red/20 flex items-center justify-center shrink-0 text-apple-red font-bold text-xs">2</div>
                      <p>Сгенерируйте уникальный QR-код, который содержит зашифрованную ссылку.</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-apple-red/20 flex items-center justify-center shrink-0 text-apple-red font-bold text-xs">3</div>
                      <p>Распечатайте код и разместите его под лобовым стеклом.</p>
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
                  <h2 className="text-base font-bold tracking-tight">Автомобиль</h2>
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
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Марка и модель</label>
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
                            className={`w-full bg-white/5 border-2 ${errors.carModel ? 'border-apple-red shadow-[0_0_20px_rgba(255,59,48,0.2)]' : 'border-white/5 hover:border-white/10'} rounded-xl px-3 py-2 text-base focus:border-apple-red transition-all outline-none placeholder:text-gray-600`}
                          />
                        </motion.div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Госномер</label>
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
                            className={`w-full bg-white/5 border-2 ${errors.plateNumber ? 'border-apple-red shadow-[0_0_20px_rgba(255,59,48,0.2)]' : 'border-white/5 hover:border-white/10'} rounded-xl px-3 py-2 text-base focus:border-apple-red transition-all font-mono uppercase tracking-widest outline-none placeholder:text-gray-600`}
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
                  <h2 className="text-base font-bold tracking-tight">Владелец</h2>
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
                            className={`w-full bg-white/5 border-2 ${errors.ownerName ? 'border-apple-red shadow-[0_0_20px_rgba(255,59,48,0.2)]' : 'border-white/5 hover:border-white/10'} rounded-xl px-3 py-2 text-base focus:border-apple-red transition-all outline-none placeholder:text-gray-600`}
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
                            className={`w-full bg-white/5 border-2 ${errors.phone1 ? 'border-apple-red shadow-[0_0_20px_rgba(255,59,48,0.2)]' : 'border-white/5 hover:border-white/10'} rounded-xl px-3 py-2 text-base focus:border-apple-red transition-all outline-none placeholder:text-gray-600`}
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
                  <h2 className="text-base font-bold tracking-tight">Мессенджеры</h2>
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
                          className="w-full bg-white/5 border-2 border-white/5 hover:border-white/10 rounded-xl px-3 py-2 text-base focus:border-apple-red transition-all outline-none placeholder:text-gray-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <input
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp || ''}
                          onChange={handleInputChange}
                          placeholder="WhatsApp (+7...)"
                          className="w-full bg-white/5 border-2 border-white/5 hover:border-white/10 rounded-xl px-3 py-2 text-base focus:border-apple-red transition-all outline-none placeholder:text-gray-600"
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
                  <h2 className="text-base font-bold tracking-tight">Быстрые кнопки</h2>
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
                                : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                            }`}
                          >
                            <btn.icon className={`w-4 h-4 mb-1 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                            <span className="text-xs font-black uppercase tracking-widest text-center">
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
                  <h2 className="text-base font-bold tracking-tight">Дизайн</h2>
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
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Основной цвет</label>
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
                            className="flex-1 bg-white/5 border-2 border-white/5 rounded-xl px-2 py-1.5 text-xs font-mono text-gray-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Текст рядом с QR</label>
                        <div className="relative">
                          <Type className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                          <input
                            name="qrText"
                            value={formData.qrText || ''}
                            onChange={handleInputChange}
                            placeholder="Сканируй меня!"
                            className="w-full bg-white/5 border-2 border-white/5 rounded-xl pl-8 pr-3 py-2 text-base focus:border-apple-red outline-none transition-all placeholder:text-gray-600"
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
              className={`w-full py-3 px-6 rounded-xl font-bold text-base uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl ${
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

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => {
                triggerVibration(20);
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
                setErrors({});
                localStorage.removeItem(STORAGE_KEY);
              }}
              className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-base font-bold py-3 px-6 rounded-2xl hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800"
            >
              <AlertTriangle className="w-5 h-5 rotate-180" />
              Очистить форму
            </button>
          </div>
        </div>

        <footer className="mt-16 mb-8 text-center space-y-8 relative z-10">
          <div className="flex flex-col items-center gap-6">
            <p className="text-xs font-bold text-white/30 uppercase tracking-[0.3em]">Разработка и поддержка</p>
            <div className="flex flex-col items-center gap-4">
              <a 
                href="mailto:info@premiumwebsite.ru" 
                className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-apple-red transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
            </div>
          </div>
          <p className="text-xs text-white/20 font-bold tracking-widest uppercase">© 2026 CarQR. Все права защищены.</p>
        </footer>
      </main>

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
                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl">
                  <QRCodeSVG 
                    id="qr-code-svg"
                    value={generatedUrl}
                    size={280}
                    level="Q"
                    includeMargin={true}
                  />
                </div>
              </div>

              <div className="w-full max-w-sm space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={downloadQR}
                    className="py-4 px-4 rounded-2xl red-gradient text-white font-bold flex flex-col items-center justify-center gap-2 shadow-xl red-glow hover:brightness-110 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-widest">Скачать PNG</span>
                  </button>
                  
                  <button
                    onClick={saveCardToProfile}
                    className="py-4 px-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 border bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[10px] uppercase tracking-widest">В профиль</span>
                  </button>
                </div>

                <button
                  onClick={() => copyToClipboard(generatedUrl || '')}
                  className="w-full py-4 px-8 rounded-2xl bg-white/5 text-white font-bold flex items-center justify-center gap-3 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Check className="w-5 h-5 text-white/30" />
                  Копировать ссылку
                </button>

                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] text-center">Поделиться ссылкой на приложение</p>
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
