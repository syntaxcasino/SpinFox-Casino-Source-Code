'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import InfoNavigation from '../../components/info/InfoNavigation';
import ContactUsTab from '../../components/info/ContactUsTab';
import TermsTab from '../../components/info/TermsTab';
import { motion } from 'framer-motion';
import { ClipLoader } from 'react-spinners';

const VALID_TABS = ['contactus', 'privacy', 'responsible', 'fairplay', 'gamesrules', 'terms'];
const DEFAULT_TAB = 'contactus';

// ✅ This stays as the default export, only handles Suspense
export default function InfoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
          <ClipLoader color="#896cef" size={50} />
        </div>
      }
    >
      <InfoPageContent />
    </Suspense>
  );
}

// ✅ This is the real client component using useSearchParams
function InfoPageContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || DEFAULT_TAB;

  // Validate tab parameter
  const activeTab = VALID_TABS.includes(currentTab) ? currentTab : DEFAULT_TAB;

  const handleTabChange = (tab: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url.toString());
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'contactus':
        return <ContactUsTab />;
      case 'terms':
        return <TermsTab />;
      case 'privacy':
      case 'responsible':
      case 'fairplay':
      case 'gamesrules':
      default:
        return <ContactUsTab />;
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
      <motion.div
        className="w-full max-w-6xl px-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        {/* Main Card */}
        <div className="max-w-[1200px] mx-auto bg-[#221d35] rounded-[10px] overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Navigation */}
            <InfoNavigation activeTab={activeTab} onTabChange={handleTabChange} />

            {/* Content Area */}
            <div className="flex-1">{renderContent()}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
