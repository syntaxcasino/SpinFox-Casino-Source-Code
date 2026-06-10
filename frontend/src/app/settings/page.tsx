'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useNetwork } from '@/contexts/NetworkContext';
import { useOddsPreferenceStore, OddsFormat } from '@/store/oddsPreference';
import { useTranslation } from '@/contexts/TranslationContext';
import { Sun, Moon, Monitor, Activity, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { getOddsFormatLabel, getOddsFormatDescription } from '@/utils/oddsFormatter';
import Image from 'next/image';

export default function Settings() {
    const { theme, setTheme, toggleTheme } = useTheme();
    const { user } = useUser();
    const { activeNetwork, getActiveBalance } = useNetwork();
    const { oddsFormat, setOddsFormat } = useOddsPreferenceStore();
    const { language, setLanguage } = useTranslation();

    const languages = [
        { code: 'en', label: 'English', flag: '/flags/en.png' },
        { code: 'zh', label: 'Chinese', flag: '/flags/zh.png' },
    ];

    return (
        <div className="flex flex-col items-start px-4 py-4 lg:px-8 lg:py-6 relative min-h-screen">
            <h1 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 dark:text-dark-text">Settings</h1>

            <div className="w-full max-w-4xl space-y-4 lg:space-y-6">
                {/* Theme Section */}
                <div className="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-xl p-4 lg:p-6 shadow-sm">
                    <h2 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-gray-900 dark:text-dark-text">
                        Appearance
                    </h2>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-dark-text-secondary mb-4 lg:mb-6">
                        Customize how SpinFox looks on your device
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                        {/* Light Theme */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setTheme('light')}
                            className={`relative p-4 lg:p-6 rounded-lg border-2 transition-all ${
                                theme === 'light'
                                    ? 'border-primary bg-primary/10 shadow-md'
                                    : 'border-gray-300 dark:border-dark-border hover:border-primary/50'
                            }`}
                        >
                            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                                <div className="p-1.5 lg:p-2 bg-gray-100 dark:bg-dark-bg-tertiary rounded-lg">
                                    <Sun className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                                </div>
                                <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-dark-text">
                                    Light Mode
                                </span>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-600 dark:text-dark-text-secondary text-left">
                                Clean and bright interface
                            </p>
                            {theme === 'light' && (
                                <div className="absolute top-2 lg:top-3 right-2 lg:right-3 w-3 h-3 lg:w-4 lg:h-4 bg-primary rounded-full shadow-md"></div>
                            )}
                        </motion.button>

                        {/* Dark Theme */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setTheme('dark')}
                            className={`relative p-4 lg:p-6 rounded-lg border-2 transition-all ${
                                theme === 'dark'
                                    ? 'border-primary bg-primary/10 shadow-md'
                                    : 'border-gray-300 dark:border-dark-border hover:border-primary/50'
                            }`}
                        >
                            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                                <div className="p-1.5 lg:p-2 bg-gray-100 dark:bg-dark-bg-tertiary rounded-lg">
                                    <Moon className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                                </div>
                                <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-dark-text">
                                    Dark Mode
                                </span>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-600 dark:text-dark-text-secondary text-left">
                                Easy on the eyes in low light
                            </p>
                            {theme === 'dark' && (
                                <div className="absolute top-2 lg:top-3 right-2 lg:right-3 w-3 h-3 lg:w-4 lg:h-4 bg-primary rounded-full shadow-md"></div>
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* Language Section */}
                <div className="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-xl p-4 lg:p-6 shadow-sm">
                    <h2 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-gray-900 dark:text-dark-text">
                        Language
                    </h2>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-dark-text-secondary mb-4 lg:mb-6">
                        Choose your preferred language
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                        {languages.map((lang) => (
                            <motion.button
                                key={lang.code}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setLanguage(lang.code)}
                                className={`relative p-4 lg:p-6 rounded-lg border-2 transition-all ${
                                    language === lang.code
                                        ? 'border-primary bg-primary/10 shadow-md'
                                        : 'border-gray-300 dark:border-dark-border hover:border-primary/50'
                                }`}
                            >
                                <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                                    <div className="p-1.5 lg:p-2 bg-gray-100 dark:bg-dark-bg-tertiary rounded-lg flex items-center justify-center">
                                        <Image
                                            src={lang.flag}
                                            alt={lang.label}
                                            width={24}
                                            height={24}
                                            className="w-5 h-5 lg:w-6 lg:h-6 rounded-full object-cover"
                                            quality={100}
                                        />
                                    </div>
                                    <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-dark-text">
                                        {lang.label}
                                    </span>
                                </div>
                                <p className="text-xs lg:text-sm text-gray-600 dark:text-dark-text-secondary text-left">
                                    {lang.code === 'en' ? 'English language interface' : 'Chinese language interface'}
                                </p>
                                {language === lang.code && (
                                    <div className="absolute top-2 lg:top-3 right-2 lg:right-3 w-3 h-3 lg:w-4 lg:h-4 bg-primary rounded-full shadow-md"></div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Odds Format Section */}
                <div className="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-xl p-4 lg:p-6 shadow-sm">
                    <h2 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-gray-900 dark:text-dark-text">
                        Odds Display Format
                    </h2>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-dark-text-secondary mb-4 lg:mb-6">
                        Choose how you want odds to be displayed throughout the site
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
                        {/* Decimal Format */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setOddsFormat('decimal')}
                            className={`relative p-4 lg:p-6 rounded-lg border-2 transition-all ${
                                oddsFormat === 'decimal'
                                    ? 'border-primary bg-primary/10 shadow-md'
                                    : 'border-gray-300 dark:border-dark-border hover:border-primary/50'
                            }`}
                        >
                            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                                <div className="p-1.5 lg:p-2 bg-gray-100 dark:bg-dark-bg-tertiary rounded-lg">
                                    <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                                </div>
                                <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-dark-text">
                                    Decimal
                                </span>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-600 dark:text-dark-text-secondary text-left">
                                Format: 2.50, 1.50
                            </p>
                            <p className="text-[10px] lg:text-xs text-primary font-mono mt-1 lg:mt-2">Example: 2.50</p>
                            {oddsFormat === 'decimal' && (
                                <div className="absolute top-2 lg:top-3 right-2 lg:right-3 w-3 h-3 lg:w-4 lg:h-4 bg-primary rounded-full shadow-md"></div>
                            )}
                        </motion.button>

                        {/* American Format */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setOddsFormat('american')}
                            className={`relative p-4 lg:p-6 rounded-lg border-2 transition-all ${
                                oddsFormat === 'american'
                                    ? 'border-primary bg-primary/10 shadow-md'
                                    : 'border-gray-300 dark:border-dark-border hover:border-primary/50'
                            }`}
                        >
                            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                                <div className="p-1.5 lg:p-2 bg-gray-100 dark:bg-dark-bg-tertiary rounded-lg">
                                    <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                                </div>
                                <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-dark-text">
                                    American
                                </span>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-600 dark:text-dark-text-secondary text-left">
                                Format: +150, -200
                            </p>
                            <p className="text-[10px] lg:text-xs text-primary font-mono mt-1 lg:mt-2">Example: +150</p>
                            {oddsFormat === 'american' && (
                                <div className="absolute top-2 lg:top-3 right-2 lg:right-3 w-3 h-3 lg:w-4 lg:h-4 bg-primary rounded-full shadow-md"></div>
                            )}
                        </motion.button>

                        {/* Normalized Implied Format */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setOddsFormat('normalizedImplied')}
                            className={`relative p-4 lg:p-6 rounded-lg border-2 transition-all ${
                                oddsFormat === 'normalizedImplied'
                                    ? 'border-primary bg-primary/10 shadow-md'
                                    : 'border-gray-300 dark:border-dark-border hover:border-primary/50'
                            }`}
                        >
                            <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                                <div className="p-1.5 lg:p-2 bg-gray-100 dark:bg-dark-bg-tertiary rounded-lg">
                                    <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                                </div>
                                <span className="text-sm lg:text-base font-semibold text-gray-900 dark:text-dark-text">
                                    Normalized
                                </span>
                            </div>
                            <p className="text-xs lg:text-sm text-gray-600 dark:text-dark-text-secondary text-left">
                                Format: 0.43, 0.63
                            </p>
                            <p className="text-[10px] lg:text-xs text-primary font-mono mt-1 lg:mt-2">Example: 0.43</p>
                            {oddsFormat === 'normalizedImplied' && (
                                <div className="absolute top-2 lg:top-3 right-2 lg:right-3 w-3 h-3 lg:w-4 lg:h-4 bg-primary rounded-full shadow-md"></div>
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* User Info Section */}
                {user && (
                    <div className="bg-white dark:bg-dark-bg-secondary border border-gray-200 dark:border-dark-border rounded-xl p-4 lg:p-6 shadow-sm">
                        <h2 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-gray-900 dark:text-dark-text">
                            Account Information
                        </h2>
                        <div className="space-y-2 lg:space-y-3">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-xs lg:text-sm text-gray-600 dark:text-dark-text-secondary">Username</span>
                                <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-dark-text">{user.username}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-dark-border">
                                <span className="text-xs lg:text-sm text-gray-600 dark:text-dark-text-secondary">Email</span>
                                <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-dark-text">{user.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-dark-border">
                                <span className="text-xs lg:text-sm text-gray-600 dark:text-dark-text-secondary">Balance ({activeNetwork === 'mainnet' ? 'Mainnet' : 'Testnet'})</span>
                                <span className="text-sm lg:text-base font-medium text-primary">${user ? getActiveBalance(user).toFixed(2) : '0.00'}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}