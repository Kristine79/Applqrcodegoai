'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, FileText, Eye } from 'lucide-react';
import { motion } from 'motion/react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-secondary hover:text-white transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-bold">Назад</span>
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <ShieldCheck className="w-5 h-5 text-apple-red" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-secondary">Безопасность</span>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              Политика <span className="text-apple-red">конфиденциальности</span>
            </h1>
            <p className="text-xl text-secondary leading-relaxed">
              Мы ценим вашу приватность и разработали сервис так, чтобы ваши данные оставались только вашими.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-apple-red/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-apple-red" />
              </div>
              <h3 className="text-xl font-bold">Локальное хранение</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Все данные, которые вы вводите в форму, кодируются непосредственно в QR-код. Мы не сохраняем их в базе данных на сервере.
              </p>
            </div>
            <div className="glass-card p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-apple-red/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-apple-red" />
              </div>
              <h3 className="text-xl font-bold">Прозрачность</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Вы сами контролируете, какую информацию размещать на визитке. В любой момент вы можете создать новый QR-код с другими данными.
              </p>
            </div>
          </div>

          <section id="data-processing" className="space-y-6 pt-8 border-t border-white/10 scroll-mt-8">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-apple-red" />
              <h2 className="text-2xl font-bold">Обработка данных</h2>
            </div>
            
            <div className="prose prose-invert max-w-none space-y-6 text-secondary leading-relaxed">
              <p>
                Настоящая Политика обработки персональных данных составлена в соответствии с требованиями законодательства и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые сервисом CarQR.
              </p>
              
              <div className="space-y-4">
                <h4 className="text-white font-bold">1. Общие положения</h4>
                <p>
                  Оператор ставит своей важнейшей целью и условием осуществления своей деятельности соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в том числе защиты прав на неприкосновенность частной жизни, личную и семейную тайну.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-bold">2. Какие данные мы используем</h4>
                <p>
                  Сервис использует данные, предоставляемые пользователем добровольно: имя, номер телефона, марка автомобиля и госномер. Эти данные используются исключительно для генерации QR-кода и отображения на странице визитки.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-bold">3. Цели обработки</h4>
                <p>
                  Цель обработки персональных данных — предоставление пользователю доступа к сервису создания электронных автовизиток и обеспечение возможности связи с владельцем автомобиля в экстренных ситуациях.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-white font-bold">4. Безопасность</h4>
                <p>
                  Безопасность персональных данных, которые обрабатываются Оператором, обеспечивается путем реализации правовых, организационных и технических мер, необходимых для выполнения в полном объеме требований действующего законодательства в области защиты персональных данных.
                </p>
              </div>
            </div>
          </section>
        </motion.div>

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
              <Link href="/privacy" className="text-tertiary hover:text-secondary transition-colors">
                Обработка данных
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
