"use client";
import { useEffect, useState } from "react";
import MyPromotionCard from "@/components/MyPromotionCard";
import { getActivePromotions, Promotion } from "@/lib/api/promotions";

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPromotions() {
      setLoading(true);
      try {
        const data = await getActivePromotions();
        setPromotions(data);
      } catch (error) {
        console.error('Failed to fetch promotions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPromotions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
        <h2 className="text-2xl font-bold text-light-text dark:text-white mb-4">No Active Promotions</h2>
        <p className="text-light-text-secondary dark:text-white/60">Check back soon for exciting offers!</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-light-text dark:text-white mb-2">Promotions</h1>
        <p className="text-light-text-secondary dark:text-white/70">Discover our latest offers and bonuses</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map((promo) => (
          <MyPromotionCard
            key={promo.id}
            title={promo.title}
            subtitle={promo.subtitle}
            bonus={promo.bonus || ''}
            spins={promo.spins || ''}
            ctaLabel={promo.ctaLabel || promo.buttonText || 'Learn More'}
            href={promo.href || '#'}
            imageSrc={promo.imageSrc || '/images/promo-slots.jpg'}
          />
        ))}
      </div>
    </div>
  );
}
