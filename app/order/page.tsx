'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Check, 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Maximize, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Info,
  ChevronRight,
  Package,
  Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type StickerType = 'standard' | 'premium';

interface OrderFormData {
  type: StickerType;
  size: number;
  isUrgent: boolean;
  fullName: string;
  phone: string;
  email: string;
  index: string;
  city: string;
  street: string;
  house: string;
}

export default function OrderPage() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    type: 'standard',
    size: 10,
    isUrgent: false,
    fullName: '',
    phone: '',
    email: '',
    index: '',
    city: '',
    street: '',
    house: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const calculatePrice = () => {
    let basePrice = formData.type === 'standard' ? 250 : 450;
    // Size multiplier (10cm is base, each cm adds 10%)
    const sizeMultiplier = 1 + (formData.size - 10) * 0.1;
    let total = basePrice * sizeMultiplier;
    
    if (formData.isUrgent) {
      total *= 1.3;
    }
    
    return Math.round(total);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  if (!mounted) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30"
        >
          <Check className="w-10 h-10 text-green-500" />
        </motion.div>
        <h1 className="text-2xl font-bold mb-2">Заказ принят!</h1>
        <p className="text-gray-400 max-w-xs mb-8">
          Мы свяжемся с вами в ближайшее время для подтверждения деталей оплаты и доставки.
        </p>
        <Link 
          href="/"
          className="py-4 px-8 bg-apple-red rounded-2xl font-bold hover:scale-105 transition-all"
        >
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-12">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 mx-2 mt-2 px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 relative rounded-lg overflow-hidden border border-white/10">
            <Image src="/logo.png" alt="Logo" fill sizes="32px" className="object-cover" />
          </div>
          <span className="font-bold text-lg tracking-tight">CarQR</span>
        </Link>
        <Link href="/" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Заказать наклейку</h1>
          <p className="text-gray-500 text-sm">Профессиональная печать вашего QR-кода</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sticker Type */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Тип наклейки</h2>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'standard' }))}
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  formData.type === 'standard' 
                    ? 'bg-apple-red/10 border-apple-red shadow-[0_0_20px_rgba(255,59,48,0.1)]' 
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${formData.type === 'standard' ? 'bg-apple-red/20' : 'bg-white/5'}`}>
                  <ShieldCheck className={`w-5 h-5 ${formData.type === 'standard' ? 'text-apple-red' : 'text-gray-500'}`} />
                </div>
                <div>
                  <div className="font-bold text-base">Стандартная</div>
                  <p className="text-xs text-gray-500 mt-1">Виниловая пленка, клей снаружи. Классический вариант для кузова или стекла.</p>
                </div>
                {formData.type === 'standard' && <Check className="w-5 h-5 text-apple-red ml-auto shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'premium' }))}
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  formData.type === 'premium' 
                    ? 'bg-apple-red/10 border-apple-red shadow-[0_0_20px_rgba(255,59,48,0.1)]' 
                    : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${formData.type === 'premium' ? 'bg-apple-red/20' : 'bg-white/5'}`}>
                  <Zap className={`w-5 h-5 ${formData.type === 'premium' ? 'text-apple-red' : 'text-gray-500'}`} />
                </div>
                <div>
                  <div className="font-bold text-base">Премиум</div>
                  <p className="text-xs text-gray-500 mt-1">Статическая пленка, клеится изнутри салона. УФ-защита, не оставляет следов клея.</p>
                </div>
                {formData.type === 'premium' && <Check className="w-5 h-5 text-apple-red ml-auto shrink-0" />}
              </button>
            </div>
          </section>

          {/* Size Configurator */}
          <section className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Maximize className="w-4 h-4 text-apple-red" />
                <h2 className="text-sm font-bold">Размер наклейки</h2>
              </div>
              <span className="text-apple-red font-bold">{formData.size}x{formData.size} см</span>
            </div>
            
            <div className="space-y-4">
              <input
                type="range"
                name="size"
                min="10"
                max="15"
                step="1"
                value={formData.size}
                onChange={handleInputChange}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-apple-red"
              />
              <div className="flex justify-between text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                <span>10 см</span>
                <span>12.5 см</span>
                <span>15 см</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isUrgent"
                    checked={formData.isUrgent}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${formData.isUrgent ? 'bg-apple-red' : 'bg-white/10'}`}></div>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isUrgent ? 'translate-x-4' : ''}`}></div>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold group-hover:text-apple-red transition-colors">Срочное производство</div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">+30% к стоимости, готовность за 24 часа</p>
                </div>
              </label>
            </div>
          </section>

          {/* Delivery Form */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 ml-1">
              <Truck className="w-4 h-4 text-apple-red" />
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Доставка и адрес</h2>
            </div>
            
            <div className="glass-card p-5 space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="ФИО получателя"
                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-apple-red transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Телефон"
                      className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-apple-red transition-all outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-apple-red transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <input
                      required
                      name="index"
                      value={formData.index}
                      onChange={handleInputChange}
                      placeholder="Индекс"
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-apple-red transition-all outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      required
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Город"
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-apple-red transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <input
                      required
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="Улица"
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-apple-red transition-all outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      required
                      name="house"
                      value={formData.house}
                      onChange={handleInputChange}
                      placeholder="Дом/кв"
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-apple-red transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Summary and Checkout */}
          <section className="sticky bottom-4 left-0 right-0 z-40">
            <div className="glass-panel p-5 shadow-2xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Итого к оплате</p>
                <p className="text-2xl font-black text-white">{calculatePrice()} ₽</p>
              </div>
              <button
                disabled={isSubmitting}
                className="bg-apple-red text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Оплатить</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </section>
        </form>

        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
          <Info className="w-5 h-5 text-gray-500 shrink-0" />
          <p className="text-[10px] text-gray-500 leading-relaxed">
            После оплаты мы сгенерируем макет вашей наклейки на основе данных из вашего профиля и отправим в производство. Доставка осуществляется Почтой России или СДЭК.
          </p>
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-4 border-t border-white/5 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors cursor-pointer">
              <Headphones className="w-4 h-4" />
              <span className="text-xs font-medium">Техподдержка</span>
            </div>
            <a href="mailto:info@premiumwebsite.ru" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
              <span className="text-xs font-medium">info@premiumwebsite.ru</span>
            </a>
          </div>
          <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest">© 2024 CarQR Project</p>
        </footer>
      </main>
    </div>
  );
}
