'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import CasinoWheel from "@/components/CasinoSpinBox";

export default function Features() {
    const { t } = useTranslation();

    const [searchQuery, setSearchQuery] = useState('');
    
    return (
        <div className="flex flex-col items-start px-4 py-4 relative">
            <CasinoWheel />
        </div>
    );
}
