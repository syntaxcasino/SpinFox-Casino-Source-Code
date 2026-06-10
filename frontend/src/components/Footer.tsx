"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "../contexts/TranslationContext";
import { useTheme } from "../contexts/ThemeContext";
import FooterLanguageDropdown from "./FooterLanguageDropdown";

export default function Footer() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Partners images
  const partners = [
    { src: "/partners/digitain.png", alt: "Digitain" },
    { src: "/partners/evolution.png", alt: "Evolution" },
    { src: "/partners/evoplay.png", alt: "Evoplay" },
    { src: "/partners/microgaming.png", alt: "Microgaming" },
    { src: "/partners/playson.png", alt: "Playson" },
    { src: "/partners/vivogaming.png", alt: "Vivo Gaming" },
    { src: "/partners/yggdrasil.png", alt: "Yggdrasil" },
  ];

  // Payment images
  const paymentMethods = [
    { src: "/payment/neteller.png", alt: "Neteller" },
    { src: "/payment/paycryptos.png", alt: "Pay Cryptos" },
    { src: "/payment/visa.png", alt: "Visa" },
    { src: "/payment/yandexmoney.png", alt: "Yandex Money" },
    { src: "/payment/neteller.png", alt: "Neteller" },
    { src: "/payment/paycryptos.png", alt: "Pay Cryptos" },
    { src: "/payment/visa.png", alt: "Visa" },
    { src: "/payment/yandexmoney.png", alt: "Yandex Money" },
  ];

  // Social media icons (same as sidepanel)
  const socialLinks = [
    { name: "Facebook", icon: "/facebook.png", url: "https://facebook.com", type: "external" },
    { name: "Google", icon: "/google.png", url: "https://google.com", type: "external" },
    { name: "X", icon: "/x.png", url: "https://x.com", type: "external" },
    { name: "Email", icon: "/email.png", url: "mailto:email@example.com", type: "email" },
  ];

  // Footer links
  const footerLinks = [
    { name: t('common.footer.links.privacyPolicy'), href: '/info?tab=privacy' },
    { name: t('common.footer.links.responsibleGaming'), href: '/info?tab=responsible' },
    { name: t('common.footer.links.fairPlay'), href: '/info?tab=fairplay' },
    { name: t('common.footer.links.gamesRules'), href: '/info?tab=gamesrules' },
    { name: t('common.footer.links.termsConditions'), href: '/info?tab=terms' },
    { name: t('common.footer.links.contactUs'), href: '/info?tab=contactus' },
  ];

  return (
    <footer className="bg-[#0b0911] pt-16">
      <div className="contaianer mx-auto px-4 pb-12">
        
        {/* Desktop Layout */}
        <div className="hidden lg:block space-y-12">
          
          {/* Partners Grid - Equally spaced */}
          <div className="flex justify-between gap-4">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                className="w-[160px] h-[35px] flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={160}
                  height={35}
                  className="max-w-[160px] max-h-[35px] w-auto h-auto object-contain"
                  priority
                />
              </motion.div>
            ))}
          </div>

          {/* Payment Methods Grid - Equally spaced */}
          <div className="bg-[#221d35] rounded-lg p-4">
            <div className="flex justify-between gap-8">
              {paymentMethods.map((method, index) => (
                <motion.div
                  key={index}
                  className="w-[105px] h-[35px] flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Image
                    src={method.src}
                    alt={method.alt}
                    width={105}
                    height={35}
                    className="max-w-[105px] max-h-[35px] w-auto h-auto object-contain"
                    priority
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* 6 Column Layout - More precise sizing with responsive behavior */}
          <div className="grid gap-8 xl:grid-cols-[180px_minmax(120px,max-content)_minmax(120px,max-content)_auto_1fr_100px] lg:grid-cols-[180px_1fr_1fr_auto_1fr_100px]">
            
            {/* Column 1: Logo, Socials, Affiliate Button - Fixed 180px */}
            <div className="space-y-6">
              <div className="w-full">
                <Image
                  src={theme === "dark" ? "/logo-light.png" : "/logo-dark.png"}
                  alt="Logo"
                  width={180}
                  height={100}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
              
              {/* Social Icons */}
              <div className="flex space-x-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    target={social.type === 'external' ? '_blank' : undefined}
                    rel={social.type === 'external' ? 'noopener noreferrer' : undefined}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Image
                      src={social.icon}
                      alt={social.name}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </motion.a>
                ))}
              </div>
              
              {/* Affiliate Program Button */}
              <motion.button
                className="w-full max-w-[180px] py-2 px-3 border-2 border-[#896cef] rounded-[5px] text-white font-bold text-[14px] bg-transparent hover:bg-[#896cef]/20 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('common.footer.links.affiliateProgram')}
              </motion.button>
            </div>

            {/* Column 2: Links 1-4 */}
            <div className="space-y-3">
              {footerLinks.slice(0, 4).map((link, index) => (
                <motion.div key={index} whileHover={{ x: 5 }}>
                  <Link
                    href={link.href}
                    className="block text-white hover:text-[#896cef] transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Column 3: Links 5-6 */}
            <div className="space-y-3">
              {footerLinks.slice(4, 6).map((link, index) => (
                <motion.div key={index} whileHover={{ x: 5 }}>
                  <Link
                    href={link.href}
                    className="block text-white hover:text-[#896cef] transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Column 4: 18+ and Verified Icons - Minimal width */}
            <div className="flex flex-col space-y-5">
              <Image
                src="/18.png"
                alt="18+"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <Image
                src="/verified.png"
                alt="Verified"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            </div>

            {/* Column 5: Legal Text (Takes remaining available width) */}
            <div className="space-y-4 text-white text-sm leading-relaxed">
              <p>
                {t('common.footer.legal.companyInfoPart1')}
                <Link href="/licence-agreement" className="text-[#896cef] underline hover:no-underline">
                  {t('common.footer.legal.companyInfoPart2')}
                </Link>
                {t('common.footer.legal.companyInfoPart3')}
              </p>
              <p>
                {t('common.footer.legal.recaptchaNoticePart1')}
                <Link href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#896cef] underline hover:no-underline">
                  {t('common.footer.legal.recaptchaNoticePart2')}
                </Link>
                {t('common.footer.legal.recaptchaNoticePart3')}
                <Link href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-[#896cef] underline hover:no-underline">
                  {t('common.footer.legal.recaptchaNoticePart4')}
                </Link>
                {t('common.footer.legal.recaptchaNoticePart5')}
              </p>
              <p className="text-[#896cef]">
                {t('common.footer.legal.copyright')}
              </p>
            </div>

            {/* Column 6: Language Dropdown - Fixed 100px */}
            <div className="flex justify-end">
              <FooterLanguageDropdown />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-8">
          
          {/* Partners Grid - Mobile */}
          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                className="w-[67px] h-[30px] flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  width={67}
                  height={30}
                  className="max-w-[67px] max-h-[30px] w-auto h-auto object-contain"
                  priority
                />
              </motion.div>
            ))}
          </div>

          {/* Payment Methods Grid - Mobile */}
          <div className="flex flex-wrap justify-center gap-4">
            {paymentMethods.map((method, index) => (
              <motion.div
                key={index}
                className="w-[105px] h-[26px] flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src={method.src}
                  alt={method.alt}
                  width={105}
                  height={26}
                  className="max-w-[105px] max-h-[26px] w-auto h-auto object-contain"
                  priority
                />
              </motion.div>
            ))}
          </div>

          {/* Links Column - Mobile */}
          <div className="space-y-3 text-center">
            {footerLinks.map((link, index) => (
              <motion.div key={index} whileHover={{ x: 5 }}>
                <Link
                  href={link.href}
                  className="block text-white hover:text-[#896cef] transition-colors"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Language Dropdown - Mobile */}
          <div className="flex justify-center">
            <FooterLanguageDropdown />
          </div>

          {/* Social Icons - Mobile */}
          <div className="flex justify-center space-x-3">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.url}
                target={social.type === 'external' ? '_blank' : undefined}
                rel={social.type === 'external' ? 'noopener noreferrer' : undefined}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Image
                  src={social.icon}
                  alt={social.name}
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </motion.a>
            ))}
          </div>

          {/* Legal Text - Mobile (Centered) */}
          <div className="text-center space-y-4 text-white text-sm leading-relaxed">
            <p>
              {t('common.footer.legal.companyInfoPart1')}
              <Link href="/licence-agreement" className="text-[#896cef] underline hover:no-underline">
                {t('common.footer.legal.companyInfoPart2')}
              </Link>
              {t('common.footer.legal.companyInfoPart3')}
            </p>
            <p>
              {t('common.footer.legal.recaptchaNoticePart1')}
              <Link href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#896cef] underline hover:no-underline">
                {t('common.footer.legal.recaptchaNoticePart2')}
              </Link>
              {t('common.footer.legal.recaptchaNoticePart3')}
              <Link href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-[#896cef] underline hover:no-underline">
                {t('common.footer.legal.recaptchaNoticePart4')}
              </Link>
              {t('common.footer.legal.recaptchaNoticePart5')}
            </p>
            <p className="text-[#896cef]">
              {t('common.footer.legal.copyright')}
            </p>
          </div>

          {/* 18+ and Verified Icons - Mobile */}
          <div className="flex justify-center space-x-5">
            <Image
              src="/18.png"
              alt="18+"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <Image
              src="/verified.png"
              alt="Verified"
              width={40}
              height={40}
              className="w-10 h-10"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
