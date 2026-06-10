"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";
import { fadeInUp, scaleUp } from "@/utils/animations";
import VerifyModal from "./VerifyModal";
import { useTranslation } from "../../contexts/TranslationContext";
import { ChevronDown, X, Copy } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Coin = {
  id: string;
  label: string;
  icon?: string; // path to icon or emoji fallback
  networks: string[];
};

const COINS: Coin[] = [
  {
    id: "ETH",
    label: "ETH",
    icon: "/crypto/ETH.black.png",
    networks: ["Ethereum", "Base", "Optimism", "Arbitrum"],
  },
  {
    id: "BTC",
    label: "BTC",
    icon: "/crypto/BTC.black.png",
    networks: ["Segwit"],
  },
  {
    id: "USDT",
    label: "USDT",
    icon: "/crypto/USDT.black.png",
    networks: ["Ethereum", "Base", "Optimism", "Arbitrum", "Solona"],
  },
  {
    id: "USDC",
    label: "USDC",
    icon: "/crypto/USDC.black.png",
    networks: ["Ethereum", "Base", "Optimism", "Arbitrum", "Solona"],
  },
  {
    id: "SOL",
    label: "SOL",
    icon: "/crypto/SOL.black.png",
    networks: ["Solona"],
  },
];

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { t: tWallet } = useTranslation("wallet");
  const { user } = useUser();

  // Mock default values (you can replace these with real data/props)
  const [selectedCoin, setSelectedCoin] = useState<Coin>(COINS[3]); // USDC default
  const [selectedNetwork, setSelectedNetwork] = useState<string>("Base");
  const [depositAddress, setDepositAddress] = useState<string>(user?.EVMAddress);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  

  const copyAddress = async (address) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success(tWallet("copied") || "Address copied");
    } catch (err) {
      console.error(err);
      toast.error(tWallet("Copy failed") || "Copy failed");
    }
  };

  const onCoinSelect = (coin: Coin) => {
    setSelectedCoin(coin);
    // set default network if exists, otherwise empty
    if (coin.networks.length) setSelectedNetwork(coin.networks[0]);
    else setSelectedNetwork("");
  };

  useEffect(() => {
    switch (selectedNetwork) {
      case "Solona":
        setDepositAddress(user.SOLAddress);
        break;
      
      case "Segwit":
        setDepositAddress(user.BTCAddress)
        break;
    
      default:
        setDepositAddress(user?.EVMAddress);
        break;
    }
  }, [selectedNetwork, user]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => {
              setCurrencyOpen(false);
              setNetworkOpen(false);
            }}
          >
            {/* backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* modal container */}
            <motion.div
              className="relative z-10 w-full max-w-3xl"
              variants={scaleUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="bg-light-bg-secondary dark:bg-[#171424] border-2 border-light-border dark:border-[#2f3a3f] rounded-[16px] p-6 md:p-8 text-light-text dark:text-white flex flex-col transition-colors duration-300">
                {/* close button */}
                <motion.button
                  className="absolute top-4 right-4 p-2 hover:bg-light-border dark:hover:bg-white/10 rounded-full transition-colors z-20"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-light-text dark:text-white" />
                </motion.button>

                {/* header */}
                <motion.div
                  className="mb-6 text-center"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="font-poppins font-bold text-light-text dark:text-white text-[20px]">
                    {tWallet("deposit")}
                  </h3>
                </motion.div>
                {/* coin selector bar */}
                <div className="flex flex-wrap justify-center sm:justify-between md:flex-row pb-4 gap-2 sm:gap-3">
                  {COINS.map((coin) => {
                    const active = coin.id === selectedCoin.id;
                    return (
                      <button
                        key={coin.id}
                        onClick={() => onCoinSelect(coin)}
                        className={`flex items-center justify-center gap-2 w-[48%] sm:flex-1 sm:min-w-[72px] px-3 py-2 rounded-full border ${
                          active
                            ? "border-primary"
                            : "border-transparent bg-light-bg-tertiary dark:bg-white/5"
                        } transition-colors duration-200`}
                      >
                        {coin.icon ? (
                          <Image
                            src={coin.icon}
                            alt={coin.label}
                            width={20}
                            height={20}
                            className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]"
                          />
                        ) : (
                          <span className="w-5 h-5 rounded-full flex items-center justify-center bg-light-border dark:bg-white/10 text-xs">
                            {coin.label[0]}
                          </span>
                        )}
                        <span
                          className={`text-[12px] sm:text-[13px] ${
                            active ? "text-light-text dark:text-white" : "text-light-text-secondary dark:text-[#cbd5d7]"
                          }`}
                        >
                          {coin.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* dropdowns: Deposit Currency & Choose Network */}
                <div className="flex flex-col md:flex-row gap-3 justify-between w-full">
                  {/* Deposit Currency */}
                  <div className="w-full">
                    <label className="block text-light-text dark:text-white mb-2 text-sm md:text-base">
                      {tWallet("currency") || "Deposit Currency"}
                    </label>
                    <div className="relative w-full">
                      {/* Dropdown trigger */}
                      <div
                        onClick={(e) => {
                          setCurrencyOpen(!currencyOpen);
                          e.stopPropagation();
                          setNetworkOpen(false);
                        }}
                        className="flex items-center justify-between border-2 border-light-border dark:border-[#70828F] rounded-md px-3 py-2 bg-light-bg-tertiary dark:bg-white/5 cursor-pointer text-light-text dark:text-white text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {selectedCoin.icon ? (
                            <Image
                              src={selectedCoin.icon}
                              alt={selectedCoin.label}
                              width={20}
                              height={20}
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">
                              {selectedCoin.label[0]}
                            </div>
                          )}
                          <span>{selectedCoin.label}</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            currencyOpen ? "rotate-90" : ""
                          }`}
                        />
                      </div>

                      {/* Dropdown menu */}
                      {currencyOpen && (
                        <div className="absolute mt-2 w-full bg-light-bg-secondary dark:bg-[#181e20] border border-light-border dark:border-[#2b363b] rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                          {COINS.map((coin) => (
                            <div
                              key={coin.id}
                              onClick={() => {
                                onCoinSelect(coin);
                                setCurrencyOpen(false);
                              }}
                              className={`flex items-center justify-between px-4 py-2 text-sm text-light-text dark:text-white cursor-pointer hover:bg-light-bg-tertiary dark:hover:bg-[#252d30] ${
                                selectedCoin.id === coin.id
                                  ? "bg-light-bg-tertiary dark:bg-[#1f2628]"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {coin.icon ? (
                                  <Image
                                    src={coin.icon}
                                    alt={coin.label}
                                    width={24}
                                    height={24}
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs">
                                    {coin.label[0]}
                                  </div>
                                )}
                                <span>{coin.label}</span>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-full border ${
                                  selectedCoin.id === coin.id
                                    ? "border-[#2dd4bf] border-4"
                                    : "border-[#4b5563]"
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Choose Network */}
                  <div className="w-full">
                    <label className="block text-light-text dark:text-white mb-2 text-sm md:text-base">
                      {tWallet("network") || "Choose CoinNetwork"}
                    </label>
                    <div className="relative w-full">
                      <div
                        onClick={(e) => {
                          setNetworkOpen(!networkOpen);
                          e.stopPropagation();
                          setCurrencyOpen(false);
                        }}
                        className="flex items-center justify-between border-2 border-light-border dark:border-[#70828F] rounded-md px-3 py-2 bg-light-bg-tertiary dark:bg-white/5 cursor-pointer text-light-text dark:text-white text-sm"
                      >
                        <span>{selectedNetwork}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            networkOpen ? "rotate-90" : ""
                          }`}
                        />
                      </div>

                      {networkOpen && (
                        <div className="absolute mt-2 w-full bg-light-bg-secondary dark:bg-[#181e20] border border-light-border dark:border-[#2b363b] rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                          {selectedCoin.networks.map((net) => (
                            <div
                              key={net}
                              onClick={() => {
                                setSelectedNetwork(net);
                                setNetworkOpen(false);
                              }}
                              className={`flex items-center justify-between px-4 py-2 text-sm text-light-text dark:text-white cursor-pointer hover:bg-light-bg-tertiary dark:hover:bg-[#252d30] ${
                                selectedNetwork === net ? "bg-light-bg-tertiary dark:bg-[#1f2628]" : ""
                              }`}
                            >
                              <span>{net}</span>
                              <div
                                className={`w-4 h-4 rounded-full border ${
                                  selectedNetwork === net
                                    ? "border-[#2dd4bf] border-4"
                                    : "border-[#4b5563]"
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* QR & address section */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mt-6">
                  <div className="bg-light-bg-tertiary dark:bg-white/6 p-4 rounded-md w-full md:w-auto flex justify-center">
                    {/* <QRCode
                      value={depositAddress}
                      size={140}
                      bgColor="transparent"
                      fgColor="#ffffff"
                      level="H"
                    /> */}
                    <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                      depositAddress
                    )}`}
                    alt="Deposit QR"
                    width={140}
                    height={140}
                    className="rounded-lg border"
                  />
                  </div>

                  <div className="flex flex-col w-full text-center md:text-left">
                    <div className="text-light-text dark:text-white mb-1">
                      {tWallet("address")}
                    </div>
                    <div className="w-full bg-light-bg-tertiary dark:bg-white/5 border-2 border-light-border dark:border-[#2f3a3f] rounded-md py-3 px-2 break-all text-sm md:text-base text-center">
                      {depositAddress}
                    </div>

                    <div className="flex flex-col items-center gap-2 w-full py-4">
                      <button
                        onClick={() => {copyAddress(depositAddress)}}
                        className="flex flex-row justify-center gap-2 px-3 py-2 border rounded-md hover:border-primary hover:border-2 bg-light-bg-tertiary dark:bg-white/5 transition w-full"
                      >
                        <Copy className="w-4 h-4 text-light-text dark:text-white" />
                        <span>{tWallet("copy")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
