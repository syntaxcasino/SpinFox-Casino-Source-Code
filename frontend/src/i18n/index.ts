import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// --- English ---
import common_en from './locales/en/common.json';
import menu_en from './locales/en/menu.json';
import footer_en from './locales/en/footer.json';
import auth_en from './locales/en/auth.json';
import user_en from './locales/en/user.json';
import wallet_en from './locales/en/wallet.json';
import slots_en from './locales/en/slots.json';
import promotions_en from './locales/en/promotions.json';
import tournaments_en from './locales/en/tournaments.json';
import leaderboard_en from './locales/en/leaderboard.json';
import notifications_en from './locales/en/notifications.json';
import buttons_en from './locales/en/buttons.json';
import errors_en from './locales/en/errors.json';
import misc_en from './locales/en/misc.json';
import home_en from './locales/en/home.json';
import admin_en from './locales/en/admin.json';

// --- Chinese ---
import common_zh from './locales/zh/common.json';
import menu_zh from './locales/zh/menu.json';
import footer_zh from './locales/zh/footer.json';
import auth_zh from './locales/zh/auth.json';
import user_zh from './locales/zh/user.json';
import wallet_zh from './locales/zh/wallet.json';
import slots_zh from './locales/zh/slots.json';
import promotions_zh from './locales/zh/promotions.json';
import tournaments_zh from './locales/zh/tournaments.json';
import leaderboard_zh from './locales/zh/leaderboard.json';
import notifications_zh from './locales/zh/notifications.json';
import buttons_zh from './locales/zh/buttons.json';
import errors_zh from './locales/zh/errors.json';
import misc_zh from './locales/zh/misc.json';
import home_zh from './locales/zh/home.json';
import admin_zh from './locales/zh/admin.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: common_en,
        menu: menu_en,
        footer: footer_en,
        auth: auth_en,
        user: user_en,
        wallet: wallet_en,
        slots: slots_en,
        promotions: promotions_en,
        tournaments: tournaments_en,
        leaderboard: leaderboard_en,
        notifications: notifications_en,
        buttons: buttons_en,
        errors: errors_en,
        misc: misc_en,
        home: home_en,
        admin: admin_en,
      },
      zh: {
        common: common_zh,
        menu: menu_zh,
        footer: footer_zh,
        auth: auth_zh,
        user: user_zh,
        wallet: wallet_zh,
        slots: slots_zh,
        promotions: promotions_zh,
        tournaments: tournaments_zh,
        leaderboard: leaderboard_zh,
        notifications: notifications_zh,
        buttons: buttons_zh,
        errors: errors_zh,
        misc: misc_zh,
        home: home_zh,
        admin: admin_zh,
      },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    ns: [
      'common',
      'menu',
      'footer',
      'auth',
      'user',
      'wallet',
      'slots',
      'promotions',
      'tournaments',
      'leaderboard',
      'notifications',
      'buttons',
      'errors',
      'misc',
      'home',
      'admin',
    ],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
