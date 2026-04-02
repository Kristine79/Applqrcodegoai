'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Car, QrCode, Download, Send, Phone, User, Mail, MessageSquare, AlertTriangle, ShieldAlert, ShieldCheck, Info, ChevronDown, ChevronUp, Check, Loader2, HelpCircle, Palette, Image as ImageIcon, Type, Plus, Trash2, BarChart3, DownloadCloud, Package, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
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

const FRAME_OPTIONS = [
  { id: 'none', label: 'Без рамки', icon: QrCode },
  { id: 'label_bottom', label: 'С подписью', icon: ShieldCheck },
  { id: 'solid_black', label: 'Черный', icon: Package },
  { id: 'bubble', label: 'Бабл', icon: MessageSquare },
  { id: 'circle', label: 'Круг', icon: Palette },
  { id: 'rounded_accent', label: 'Акцент', icon: Type },
  { id: 'double_border', label: 'Двойная', icon: Zap },
];

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
    selectedFrame: 'none',
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
    { src: '/images/lob.jpg', title: 'Вид спереди', desc: 'Размещение на лобовом стекле' },
    { src: '/images/sboku.jpg', title: 'Вид сбоку', desc: 'Размещение на боковом стекле' },
    { src: '/images/szadi.jpg', title: 'Вид сзади', desc: 'Размещение на заднем стекле' },
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

  const [logoBase64, setLogoBase64] = useState<string>('');

  // Load draft, statistics and theme
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
      selectedFrame: 'none',
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
    const appUrl = 'https://avtovisitka.ru/';
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
    const padding = 16 * scale; // Matches p-4 in JSX
    const framePadding = 24 * scale; // Matches p-6 in JSX
    const fontSize = 14 * scale;
    const lineHeight = 18 * scale;
    const maxWidth = qrSize - (padding * 2);

    // Helper for rounded rectangles to ensure compatibility
    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number | number[]) => {
      ctx.beginPath();
      if (Array.isArray(radius)) {
        const [tl, tr, br, bl] = radius;
        ctx.moveTo(x + tl, y);
        ctx.lineTo(x + width - tr, y);
        ctx.arcTo(x + width, y, x + width, y + tr, tr);
        ctx.lineTo(x + width, y + height - br);
        ctx.arcTo(x + width, y + height, x + width - br, y + height, br);
        ctx.lineTo(x + bl, y + height);
        ctx.arcTo(x, y + height, x, y + height - bl, bl);
        ctx.lineTo(x, y + tl);
        ctx.arcTo(x, y, x + tl, y, tl);
      } else {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
      }
      ctx.closePath();
    };

    ctx.font = `bold ${fontSize}px sans-serif`;
    
    // Calculate lines
    const labelText = (formData.qrText || 'SCAN ME').toUpperCase();
    const words = labelText.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    if (labelText) {
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

    const footerText = "Твоя цифровая авто визитка avtovisitka.ru";
    const footerFontSize = 10 * scale;
    const footerPadding = 20 * scale;

    const labelHeight = lines.length > 0 ? (lines.length * lineHeight) + (padding * 2) : 0;
    const totalFooterHeight = footerFontSize + footerPadding;
    
    // Adjust canvas size based on frame
    let canvasWidth = qrSize + (framePadding * 2) + (padding * 2);
    let canvasHeight = qrSize + (framePadding * 2) + (padding * 2) + labelHeight + totalFooterHeight;

    if (formData.selectedFrame === 'circle') {
      const circlePadding = 40 * scale; // Matches p-10 in JSX
      canvasWidth = qrSize + (padding * 2) + (circlePadding * 2);
      canvasHeight = canvasWidth + totalFooterHeight;
    } else if (formData.selectedFrame === 'bubble') {
      canvasHeight += 20 * scale; // Extra for pointer
    } else if (formData.selectedFrame === 'double_border') {
      const doublePadding = 32 * scale; // Matches p-8 in JSX
      canvasWidth = qrSize + (padding * 2) + (doublePadding * 2);
      canvasHeight = canvasWidth + labelHeight + totalFooterHeight;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const img = new window.Image();
    img.onload = () => {
      // Background for the whole image
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Frame
      const frameX = 0;
      const frameY = 0;
      const frameWidth = canvas.width;
      const frameHeight = canvas.height - totalFooterHeight;
      const r = 48 * scale; // Matches rounded-[3rem]

      ctx.save();
      if (formData.selectedFrame === 'label_bottom' || formData.selectedFrame === 'bubble') {
        const mainRectHeight = formData.selectedFrame === 'bubble' ? frameHeight - 20 * scale : frameHeight;
        ctx.fillStyle = '#ffffff';
        drawRoundedRect(frameX + 2 * scale, frameY + 2 * scale, frameWidth - 4 * scale, mainRectHeight - 2 * scale, r);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        if (formData.selectedFrame === 'bubble') {
          // Pointer
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 - 15 * scale, frameY + mainRectHeight - 2 * scale);
          ctx.lineTo(canvas.width / 2, frameY + frameHeight - 2 * scale);
          ctx.lineTo(canvas.width / 2 + 15 * scale, frameY + mainRectHeight - 2 * scale);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.stroke();
          
          // Hide the line between rect and pointer
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 - 14 * scale, frameY + mainRectHeight - 3 * scale);
          ctx.lineTo(canvas.width / 2 + 14 * scale, frameY + mainRectHeight - 3 * scale);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4 * scale;
          ctx.stroke();
        }

        // Label box
        if (lines.length > 0) {
          ctx.fillStyle = '#000000';
          const boxPadding = 8 * scale;
          const boxWidth = qrSize + (padding * 2);
          const boxX = (canvas.width - boxWidth) / 2;
          const boxY = frameY + mainRectHeight - labelHeight - 10 * scale;
          drawRoundedRect(boxX, boxY, boxWidth, labelHeight, 16 * scale);
          ctx.fill();
        }
      } else if (formData.selectedFrame === 'solid_black') {
        ctx.fillStyle = '#000000';
        drawRoundedRect(frameX, frameY, frameWidth, frameHeight, r);
        ctx.fill();
        
        // Label box (subtle accent)
        if (lines.length > 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          const boxWidth = qrSize + (padding * 2);
          const boxX = (canvas.width - boxWidth) / 2;
          const boxY = frameY + frameHeight - labelHeight - 10 * scale;
          drawRoundedRect(boxX, boxY, boxWidth, labelHeight, 16 * scale);
          ctx.fill();
        }
      } else if (formData.selectedFrame === 'circle') {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, (canvas.height - totalFooterHeight) / 2, frameWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Label box (subtle accent)
        if (lines.length > 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          const boxWidth = qrSize * 0.8;
          const boxX = (canvas.width - boxWidth) / 2;
          const boxY = (canvas.height - totalFooterHeight) * 0.85 - labelHeight;
          drawRoundedRect(boxX, boxY, boxWidth, labelHeight, 16 * scale);
          ctx.fill();
        }
      } else if (formData.selectedFrame === 'rounded_accent') {
        ctx.fillStyle = '#ffffff';
        drawRoundedRect(frameX + 2 * scale, frameY + 2 * scale, frameWidth - 4 * scale, frameHeight - 4 * scale, [r, 0, r, r]);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
      } else if (formData.selectedFrame === 'double_border') {
        ctx.fillStyle = '#ffffff';
        drawRoundedRect(frameX + 2 * scale, frameY + 2 * scale, frameWidth - 4 * scale, frameHeight - 4 * scale, r);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        const innerOffset = 8 * scale;
        drawRoundedRect(frameX + innerOffset, frameY + innerOffset, frameWidth - innerOffset * 2, frameHeight - innerOffset * 2, r - innerOffset);
        ctx.stroke();
      } else {
        // none
        ctx.fillStyle = '#ffffff';
        drawRoundedRect(frameX, frameY, frameWidth, frameHeight, r);
        ctx.fill();
      }
      ctx.restore();

      // Draw QR Background (White box)
      const qrBoxSize = qrSize + (padding * 2);
      const qrBoxX = (canvas.width - qrBoxSize) / 2;
      const qrBoxY = framePadding;
      
      ctx.fillStyle = '#ffffff';
      drawRoundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 32 * scale); // Matches rounded-[2rem]
      ctx.fill();
      
      // Shadow for QR box (simplified)
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 10 * scale;
      ctx.shadowOffsetY = 5 * scale;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw QR
      ctx.drawImage(img, qrBoxX + padding, qrBoxY + padding, qrSize, qrSize);
      
      if (lines.length > 0) {
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        
        const boxWidth = qrSize + (padding * 2);
        const boxX = (canvas.width - boxWidth) / 2;
        
        if (formData.selectedFrame === 'label_bottom' || formData.selectedFrame === 'bubble') {
          ctx.fillStyle = 'white';
          const mainRectHeight = formData.selectedFrame === 'bubble' ? frameHeight - 20 * scale : frameHeight;
          const boxY = frameY + mainRectHeight - labelHeight - 10 * scale;
          const textY = boxY + (labelHeight / 2) - ((lines.length - 1) * lineHeight / 2) + (fontSize / 3);
          lines.forEach((line, i) => {
            ctx.fillText(line.trim(), canvas.width / 2, textY + (i * lineHeight));
          });
        } else if (formData.selectedFrame === 'solid_black') {
          ctx.fillStyle = 'white';
          const boxY = frameY + frameHeight - labelHeight - 10 * scale;
          const textY = boxY + (labelHeight / 2) - ((lines.length - 1) * lineHeight / 2) + (fontSize / 3);
          lines.forEach((line, i) => {
            ctx.fillText(line.trim(), canvas.width / 2, textY + (i * lineHeight));
          });
        } else if (formData.selectedFrame === 'circle') {
          ctx.fillStyle = 'white';
          const boxWidthCircle = qrSize * 0.8;
          const boxY = (canvas.height - totalFooterHeight) * 0.85 - labelHeight;
          const textY = boxY + (labelHeight / 2) - ((lines.length - 1) * lineHeight / 2) + (fontSize / 3);
          lines.forEach((line, i) => {
            ctx.fillText(line.trim(), canvas.width / 2, textY + (i * lineHeight));
          });
        } else {
          ctx.fillStyle = 'black';
          const textY = qrBoxY + qrBoxSize + 25 * scale;
          lines.forEach((line, i) => {
            ctx.fillText(line.trim(), canvas.width / 2, textY + (i * lineHeight));
          });
        }
      }

      // Draw footer
      ctx.fillStyle = '#444444';
      ctx.font = `500 ${footerFontSize}px Oswald, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(footerText, canvas.width / 2, canvas.height - (footerPadding / 2));
      
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
    const padding = 16 * scale; // Matches p-4 in JSX
    const framePadding = 24 * scale; // Matches p-6 in JSX
    const fontSize = 14 * scale;
    const lineHeight = 18 * scale;
    const maxWidth = qrSize - (padding * 2);

    // Helper for rounded rectangles to ensure compatibility
    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number | number[]) => {
      ctx.beginPath();
      if (Array.isArray(radius)) {
        const [tl, tr, br, bl] = radius;
        ctx.moveTo(x + tl, y);
        ctx.lineTo(x + width - tr, y);
        ctx.arcTo(x + width, y, x + width, y + tr, tr);
        ctx.lineTo(x + width, y + height - br);
        ctx.arcTo(x + width, y + height, x + width - br, y + height, br);
        ctx.lineTo(x + bl, y + height);
        ctx.arcTo(x, y + height, x, y + height - bl, bl);
        ctx.lineTo(x, y + tl);
        ctx.arcTo(x, y, x + tl, y, tl);
      } else {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
      }
      ctx.closePath();
    };

    ctx.font = `bold ${fontSize}px sans-serif`;
    
    // Calculate lines
    const labelText = (formData.qrText || 'SCAN ME').toUpperCase();
    const words = labelText.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    if (labelText) {
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

    const footerText = "Твоя цифровая авто визитка avtovisitka.ru";
    const footerFontSize = 10 * scale;
    const footerPadding = 20 * scale;

    const labelHeight = lines.length > 0 ? (lines.length * lineHeight) + (padding * 2) : 0;
    const totalFooterHeight = footerFontSize + footerPadding;
    
    // Adjust canvas size based on frame
    let canvasWidth = qrSize + (framePadding * 2) + (padding * 2);
    let canvasHeight = qrSize + (framePadding * 2) + (padding * 2) + labelHeight + totalFooterHeight;

    if (formData.selectedFrame === 'circle') {
      const circlePadding = 40 * scale; // Matches p-10 in JSX
      canvasWidth = qrSize + (padding * 2) + (circlePadding * 2);
      canvasHeight = canvasWidth + totalFooterHeight;
    } else if (formData.selectedFrame === 'bubble') {
      canvasHeight += 20 * scale; // Extra for pointer
    } else if (formData.selectedFrame === 'double_border') {
      const doublePadding = 32 * scale; // Matches p-8 in JSX
      canvasWidth = qrSize + (padding * 2) + (doublePadding * 2);
      canvasHeight = canvasWidth + labelHeight + totalFooterHeight;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const img = new window.Image();
    img.onload = async () => {
      // Background for the whole image
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Frame
      const frameX = 0;
      const frameY = 0;
      const frameWidth = canvas.width;
      const frameHeight = canvas.height - totalFooterHeight;
      const r = 48 * scale; // Matches rounded-[3rem]

      ctx.save();
      if (formData.selectedFrame === 'label_bottom' || formData.selectedFrame === 'bubble') {
        const mainRectHeight = formData.selectedFrame === 'bubble' ? frameHeight - 20 * scale : frameHeight;
        ctx.fillStyle = '#ffffff';
        drawRoundedRect(frameX + 2 * scale, frameY + 2 * scale, frameWidth - 4 * scale, mainRectHeight - 2 * scale, r);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        if (formData.selectedFrame === 'bubble') {
          // Pointer
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 - 15 * scale, frameY + mainRectHeight - 2 * scale);
          ctx.lineTo(canvas.width / 2, frameY + frameHeight - 2 * scale);
          ctx.lineTo(canvas.width / 2 + 15 * scale, frameY + mainRectHeight - 2 * scale);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = '#000000';
          ctx.stroke();
          
          // Hide the line between rect and pointer
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 - 14 * scale, frameY + mainRectHeight - 3 * scale);
          ctx.lineTo(canvas.width / 2 + 14 * scale, frameY + mainRectHeight - 3 * scale);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4 * scale;
          ctx.stroke();
        }

        // Label box
        if (lines.length > 0) {
          ctx.fillStyle = '#000000';
          const boxPadding = 8 * scale;
          const boxWidth = qrSize + (padding * 2);
          const boxX = (canvas.width - boxWidth) / 2;
          const boxY = frameY + mainRectHeight - labelHeight - 10 * scale;
          drawRoundedRect(boxX, boxY, boxWidth, labelHeight, 16 * scale);
          ctx.fill();
        }
      } else if (formData.selectedFrame === 'solid_black') {
        ctx.fillStyle = '#000000';
        drawRoundedRect(frameX, frameY, frameWidth, frameHeight, r);
        ctx.fill();
        
        // Label box (subtle accent)
        if (lines.length > 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          const boxWidth = qrSize + (padding * 2);
          const boxX = (canvas.width - boxWidth) / 2;
          const boxY = frameY + frameHeight - labelHeight - 10 * scale;
          drawRoundedRect(boxX, boxY, boxWidth, labelHeight, 16 * scale);
          ctx.fill();
        }
      } else if (formData.selectedFrame === 'circle') {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, (canvas.height - totalFooterHeight) / 2, frameWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Label box (subtle accent)
        if (lines.length > 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          const boxWidth = qrSize * 0.8;
          const boxX = (canvas.width - boxWidth) / 2;
          const boxY = (canvas.height - totalFooterHeight) * 0.85 - labelHeight;
          drawRoundedRect(boxX, boxY, boxWidth, labelHeight, 16 * scale);
          ctx.fill();
        }
      } else if (formData.selectedFrame === 'rounded_accent') {
        ctx.fillStyle = '#ffffff';
        drawRoundedRect(frameX + 2 * scale, frameY + 2 * scale, frameWidth - 4 * scale, frameHeight - 4 * scale, [r, 0, r, r]);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
      } else if (formData.selectedFrame === 'double_border') {
        ctx.fillStyle = '#ffffff';
        drawRoundedRect(frameX + 2 * scale, frameY + 2 * scale, frameWidth - 4 * scale, frameHeight - 4 * scale, r);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3 * scale;
        ctx.stroke();
        
        const innerOffset = 8 * scale;
        drawRoundedRect(frameX + innerOffset, frameY + innerOffset, frameWidth - innerOffset * 2, frameHeight - innerOffset * 2, r - innerOffset);
        ctx.stroke();
      } else {
        // none
        ctx.fillStyle = '#ffffff';
        drawRoundedRect(frameX, frameY, frameWidth, frameHeight, r);
        ctx.fill();
      }
      ctx.restore();

      // Draw QR Background (White box)
      const qrBoxSize = qrSize + (padding * 2);
      const qrBoxX = (canvas.width - qrBoxSize) / 2;
      const qrBoxY = framePadding;
      
      ctx.fillStyle = '#ffffff';
      drawRoundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 32 * scale); // Matches rounded-[2rem]
      ctx.fill();
      
      // Shadow for QR box (simplified)
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.shadowBlur = 10 * scale;
      ctx.shadowOffsetY = 5 * scale;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw QR
      ctx.drawImage(img, qrBoxX + padding, qrBoxY + padding, qrSize, qrSize);
      
      if (lines.length > 0) {
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        
        const boxWidth = qrSize + (padding * 2);
        const boxX = (canvas.width - boxWidth) / 2;
        
        if (formData.selectedFrame === 'label_bottom' || formData.selectedFrame === 'bubble') {
          ctx.fillStyle = 'white';
          const mainRectHeight = formData.selectedFrame === 'bubble' ? frameHeight - 20 * scale : frameHeight;
          const boxY = frameY + mainRectHeight - labelHeight - 10 * scale;
          const textY = boxY + (labelHeight / 2) - ((lines.length - 1) * lineHeight / 2) + (fontSize / 3);
          lines.forEach((line, i) => {
            ctx.fillText(line.trim(), canvas.width / 2, textY + (i * lineHeight));
          });
        } else if (formData.selectedFrame === 'solid_black') {
          ctx.fillStyle = 'white';
          const boxY = frameY + frameHeight - labelHeight - 10 * scale;
          const textY = boxY + (labelHeight / 2) - ((lines.length - 1) * lineHeight / 2) + (fontSize / 3);
          lines.forEach((line, i) => {
            ctx.fillText(line.trim(), canvas.width / 2, textY + (i * lineHeight));
          });
        } else if (formData.selectedFrame === 'circle') {
          ctx.fillStyle = 'white';
          const boxWidthCircle = qrSize * 0.8;
          const boxY = (canvas.height - totalFooterHeight) * 0.85 - labelHeight;
          const textY = boxY + (labelHeight / 2) - ((lines.length - 1) * lineHeight / 2) + (fontSize / 3);
          lines.forEach((line, i) => {
            ctx.fillText(line.trim(), canvas.width / 2, textY + (i * lineHeight));
          });
        } else {
          ctx.fillStyle = 'black';
          const textY = qrBoxY + qrBoxSize + 25 * scale;
          lines.forEach((line, i) => {
            ctx.fillText(line.trim(), canvas.width / 2, textY + (i * lineHeight));
          });
        }
      }

      // Draw footer
      ctx.fillStyle = '#444444';
      ctx.font = `500 ${footerFontSize}px Oswald, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(footerText, canvas.width / 2, canvas.height - (footerPadding / 2));
      
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
            />
          </div>
          <span className="heading-section flex items-center">
            Car
            <span className="relative inline-flex items-center justify-center w-8 h-6 ml-1">
              <motion.span
                animate={{ 
                  color: ["#ffffff", "#ff3b30", "#ff3b30", "#ffffff"]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  times: [0, 0.4, 0.6, 1],
                  ease: "easeInOut"
                }}
              >
                QR
              </motion.span>
            </span>
          </span>
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
              <h3 className="text-caption">Ваши визитки</h3>
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

        <div className="glass-card pt-3 pb-4 px-4 md:pt-4 md:pb-5 md:px-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-apple-red/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="flex flex-col items-center text-center gap-1 mb-3 relative z-10">
            <div>
              <h1 className="heading-section">СОЗДАТЬ QR ВИЗИТКУ</h1>
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
                            className={`w-full bg-white/5 border-2 ${errors.carModel ? 'border-apple-red shadow-[0_0_20px_rgba(255,59,48,0.2)]' : 'border-white/5 hover:border-white/10'} rounded-xl px-3 py-2 text-base font-heading text-white focus:border-apple-red transition-all outline-none placeholder:text-white/30`}
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
                            className={`w-full bg-white/5 border-2 ${errors.plateNumber ? 'border-apple-red shadow-[0_0_20px_rgba(255,59,48,0.2)]' : 'border-white/5 hover:border-white/10'} rounded-xl px-3 py-2 text-base font-heading text-white focus:border-apple-red transition-all outline-none placeholder:text-white/30`}
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
                            className={`w-full bg-white/5 border-2 ${errors.ownerName ? 'border-apple-red shadow-[0_0_20px_rgba(255,59,48,0.2)]' : 'border-white/5 hover:border-white/10'} rounded-xl px-3 py-2 text-base font-heading text-white focus:border-apple-red transition-all outline-none placeholder:text-white/30`}
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
                            className={`w-full bg-white/5 border-2 ${errors.phone1 ? 'border-apple-red shadow-[0_0_20px_rgba(255,59,48,0.2)]' : 'border-white/5 hover:border-white/10'} rounded-xl px-3 py-2 text-base font-heading text-white focus:border-apple-red transition-all outline-none placeholder:text-white/30`}
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
                          className="w-full bg-white/5 border-2 border-white/5 hover:border-white/10 rounded-xl px-3 py-2 text-base font-heading text-white focus:border-apple-red transition-all outline-none placeholder:text-white/30"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <input
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp || ''}
                          onChange={handleInputChange}
                          placeholder="WhatsApp (+7...)"
                          className="w-full bg-white/5 border-2 border-white/5 hover:border-white/10 rounded-xl px-3 py-2 text-base font-heading text-white focus:border-apple-red transition-all outline-none placeholder:text-white/30"
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
                            maxLength={35}
                            value={formData.qrText || ''}
                            onChange={handleInputChange}
                            placeholder="Сканируй меня!"
                            className="w-full bg-white/5 border-2 border-white/5 rounded-xl pl-8 pr-3 py-2 text-base font-heading text-white focus:border-apple-red outline-none transition-all placeholder:text-white/30"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 col-span-full pt-2">
                        <label className="text-caption ml-1">Рамка QR-кода</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                          {FRAME_OPTIONS.map((frame) => (
                            <button
                              key={frame.id}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, selectedFrame: frame.id }))}
                              className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[85px] p-2.5 rounded-xl border-2 transition-all active:scale-95 ${
                                formData.selectedFrame === frame.id
                                  ? 'bg-apple-red border-transparent text-white red-glow'
                                  : 'bg-white/5 border-white/5 text-white hover:border-white/10'
                              }`}
                            >
                              <frame.icon className="w-4 h-4 mb-1.5" />
                              <span className="text-[9px] uppercase tracking-wider font-bold text-center">
                                {frame.label}
                              </span>
                            </button>
                          ))}
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
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl ${
                isSuccess 
                  ? 'bg-green-500 text-white' 
                  : 'bg-apple-red text-white red-glow hover:brightness-110'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Создаем...
                </>
              ) : isSuccess ? (
                <>
                  <Check className="w-6 h-6" />
                  Готово!
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <QrCode className="w-6 h-6" />
                  </motion.div>
                  СОЗДАТЬ QR-КОД
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
              <span className="text-[10px] text-tertiary leading-tight max-w-[220px] text-center uppercase tracking-wider font-medium">
                Данные не хранятся на сервере, а кодируются прямо в QR-код
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[10px] font-medium uppercase tracking-wider">
              <a href="https://t.me/usefulbots2026_bot" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-tertiary hover:text-apple-red transition-colors">
                <Send className="w-3.5 h-3.5" />
                Полезные боты в Telegram
              </a>
              <a href="mailto:info@premiumwebsite.ru" className="flex items-center gap-1.5 text-tertiary hover:text-apple-red transition-colors">
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
          <p className="text-[10px] text-tertiary uppercase tracking-wider font-medium">© 2026 CarQR. Все права защищены.</p>
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
                
                {/* Frame Preview Wrapper */}
                <div className={`relative p-6 transition-all duration-300 flex flex-col items-center ${
                  formData.selectedFrame === 'solid_black' ? 'bg-black rounded-[3rem]' :
                  formData.selectedFrame === 'circle' ? 'bg-black rounded-full p-10' :
                  formData.selectedFrame === 'label_bottom' ? 'bg-white rounded-[3rem] border-[3px] border-black' :
                  formData.selectedFrame === 'bubble' ? 'bg-white rounded-[3rem] border-[3px] border-black mb-6' :
                  formData.selectedFrame === 'rounded_accent' ? 'bg-white rounded-bl-[3rem] rounded-br-[3rem] rounded-tl-[3rem] border-[3px] border-black' :
                  formData.selectedFrame === 'double_border' ? 'bg-white rounded-[3rem] border-[3px] border-black p-8' :
                  'bg-white rounded-[3rem]'
                }`}>
                  <div className="relative bg-white p-4 rounded-[2rem] shadow-lg">
                    <QRCodeSVG 
                      id="qr-code-svg"
                      value={generatedUrl || ''}
                      size={240}
                      level="Q"
                      includeMargin={true}
                      fgColor={formData.themeColor}
                      imageSettings={{
                        src: logoBase64 || "/logo.png",
                        x: undefined,
                        y: undefined,
                        height: 40,
                        width: 40,
                        excavate: true,
                      }}
                    />
                  </div>
                  
                  {/* Label Preview */}
                  {(formData.qrText || formData.selectedFrame !== 'none') && (
                    <div className={`mt-4 text-center w-full px-2 ${
                      formData.selectedFrame === 'solid_black' || formData.selectedFrame === 'circle' ? 'text-white' : 'text-black'
                    }`}>
                      <div className={`inline-block px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider w-full max-w-[240px] ${
                        (formData.selectedFrame === 'label_bottom' || formData.selectedFrame === 'bubble') ? 'bg-black text-white shadow-lg' : 
                        (formData.selectedFrame === 'solid_black' || formData.selectedFrame === 'circle') ? 'bg-white/20 text-white backdrop-blur-sm' : ''
                      }`}>
                        {formData.qrText || 'SCAN ME'}
                      </div>
                    </div>
                  )}

                  {/* Bubble Pointer Preview */}
                  {formData.selectedFrame === 'bubble' && (
                    <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-black"></div>
                  )}
                </div>
              </div>

              <div className="w-full max-w-sm space-y-4">
                {/* Frame Selector in Modal */}
                <div className="space-y-3">
                  <p className="text-caption text-center">Изменить дизайн рамки</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {FRAME_OPTIONS.map((frame) => (
                      <button
                        key={frame.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, selectedFrame: frame.id }));
                          triggerVibration(10);
                        }}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                          formData.selectedFrame === frame.id 
                            ? 'bg-apple-red border-transparent text-white shadow-lg' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <frame.icon className="w-5 h-5" />
                        <span className="text-[8px] uppercase font-bold text-center px-1">{frame.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={downloadQR}
                    className="py-3 px-2 rounded-2xl bg-apple-red text-white font-bold flex flex-col items-center justify-center gap-1.5 shadow-xl red-glow hover:brightness-110 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-caption !text-white">Скачать</span>
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
                        const url = encodeURIComponent('https://avtovisitka.ru/');
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
                        const url = encodeURIComponent('https://avtovisitka.ru/');
                        window.open(`https://wa.me/?text=${text}${url}`, '_blank');
                      }}
                      className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
                      title="WhatsApp"
                    >
                      <MessageSquare className="w-5 h-5 text-apple-red" />
                    </button>
                    <button
                      onClick={() => {
                        const url = encodeURIComponent('https://avtovisitka.ru/');
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
                      unoptimized
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
