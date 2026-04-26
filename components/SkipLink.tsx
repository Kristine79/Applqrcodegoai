'use client';

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-apple-red focus:text-white focus:text-sm focus:font-bold focus:shadow-xl focus:outline-none"
    >
      Перейти к основному содержимому
    </a>
  );
}
