"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "react-toastify";
import { useTranslation } from "../../contexts/TranslationContext";
import { X, Copy, Check, Wallet, AlertCircle } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNetwork } from "@/contexts/NetworkContext";
import { getCoinNetworks } from "@/utils/networkUtils";

interface ModernDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Coin = {
  id: string;
  label: string;
  icon?: string;
  networks: string[];
  color: string; // For gradient theming
};

const COINS: Coin[] = [
  {
    id: "ETH",
    label: "ETH",
    icon: "/crypto/ETH.black.png",
    networks: [], // Will be populated dynamically based on network type
    color: "from-blue-400 to-indigo-400",
  },
  {
    id: "BTC",
    label: "BTC",
    icon: "/crypto/BTC.black.png",
    networks: [], // Will be populated dynamically based on network type
    color: "from-orange-400 to-yellow-400",
  },
  {
    id: "USDT",
    label: "USDT",
    icon: "/crypto/USDT.black.png",
    networks: [], // Will be populated dynamically based on network type
    color: "from-green-400 to-emerald-400",
  },
  {
    id: "USDC",
    label: "USDC",
    icon: "/crypto/USDC.black.png",
    networks: [], // Will be populated dynamically based on network type
    color: "from-cyan-400 to-blue-400",
  },
  {
    id: "SOL",
    label: "SOL",
    icon: "/crypto/SOL.black.png",
    networks: [], // Will be populated dynamically based on network type
    color: "from-purple-400 to-pink-400",
  },
];

export default function ModernDepositModal({ isOpen, onClose }: ModernDepositModalProps) {
  const { t: tWallet } = useTranslation("wallet");
  const { user } = useUser();
  const { activeNetwork } = useNetwork();

  const [selectedCoin, setSelectedCoin] = useState<Coin>(COINS[3]); // USDC default
  const [selectedNetwork, setSelectedNetwork] = useState<string>("Base");
  const [depositAddress, setDepositAddress] = useState<string>(user?.EVMAddress || "");
  const [copied, setCopied] = useState(false);

  // Update coin networks based on active network type
  const coinsWithNetworks = COINS.map(coin => ({
    ...coin,
    networks: getCoinNetworks(coin.id, activeNetwork)
  }));

  // Update selected coin networks when active network changes
  useEffect(() => {
    const updatedCoin = coinsWithNetworks.find(coin => coin.id === selectedCoin.id);
    if (updatedCoin) {
      setSelectedCoin(updatedCoin);
      // Reset to first available network if current selection is not available
      if (updatedCoin.networks.length > 0 && !updatedCoin.networks.includes(selectedNetwork)) {
        setSelectedNetwork(updatedCoin.networks[0]);
      }
    }
  }, [activeNetwork]);

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success(tWallet("copied") || "Address copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error("Copy failed");
    }
  };

  const onCoinSelect = (coin: Coin) => {
    setSelectedCoin(coin);
    if (coin.networks.length) setSelectedNetwork(coin.networks[0]);
    else setSelectedNetwork("");
  };

  useEffect(() => {
    if (!user) return;
    switch (selectedNetwork) {
      case "Solana":
        setDepositAddress(user.SOLAddress || "");
        break;
      case "Segwit":
        setDepositAddress(user.BTCAddress || "");
        break;
      default:
        setDepositAddress(user.EVMAddress || "");
        break;
    }
  }, [selectedNetwork, user]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Container */}
          <motion.div
            className="relative z-10 w-full max-w-xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Glassmorphic Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 dark:bg-black/20 backdrop-blur-2xl shadow-2xl">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
              
              <div className="relative p-5 md:p-6">
                {/* Close Button */}
                <motion.button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all z-10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>

                {/* Header */}
                <div className="mb-5 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl mb-3">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">
                    {tWallet("deposit") || "Deposit Crypto"}
                  </h2>
                  <p className="text-white/60 text-xs">
                    Choose your currency and network
                  </p>
                </div>

                {/* Coin Selection */}
                <div className="mb-4">
                  <label className="block text-white/80 text-xs font-medium mb-2">
                    Select Currency
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {coinsWithNetworks.map((coin) => {
                      const isActive = coin.id === selectedCoin.id;
                      return (
                        <motion.button
                          key={coin.id}
                          onClick={() => onCoinSelect(coin)}
                          className={`relative p-2.5 rounded-xl border transition-all ${
                            isActive
                              ? "border-primary bg-white/20"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeCoin"
                              className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-xl"
                            />
                          )}
                          <div className="relative flex flex-col items-center gap-1">
                            {coin.icon && (
                              <Image
                                src={coin.icon}
                                alt={coin.label}
                                width={24}
                                height={24}
                                className="w-6 h-6"
                              />
                            )}
                            <span className={`text-[10px] font-medium ${isActive ? "text-white" : "text-white/60"}`}>
                              {coin.label}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Network Selection */}
                <div className="mb-4">
                  <label className="block text-white/80 text-xs font-medium mb-2">
                    Select Network
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {selectedCoin.networks.map((network) => {
                      const isActive = network === selectedNetwork;
                      return (
                        <motion.button
                          key={network}
                          onClick={() => setSelectedNetwork(network)}
                          className={`relative p-2 rounded-lg border transition-all ${
                            isActive
                              ? "border-primary bg-white/20"
                              : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-lg"></div>
                          )}
                          <span className={`relative text-xs font-medium ${isActive ? "text-white" : "text-white/60"}`}>
                            {network}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Deposit Address Section */}
                <div className="space-y-3">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="p-3 bg-white rounded-xl shadow-lg">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                          depositAddress
                        )}`}
                        alt="Deposit QR"
                        width={140}
                        height={140}
                        className="rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Address Display */}
                  <div className="space-y-1.5">
                    <label className="block text-white/80 text-xs font-medium">
                      Deposit Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-lg blur-md group-hover:blur-lg transition-all opacity-0 group-hover:opacity-100"></div>
                      <div className="relative flex items-center gap-2 p-3 bg-white/10 border border-white/20 rounded-lg">
                        <div className="flex-1 overflow-hidden">
                          <p className="text-white text-xs font-mono break-all">
                            {depositAddress}
                          </p>
                        </div>
                        <motion.button
                          onClick={() => copyAddress(depositAddress)}
                          className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                            copied
                              ? "bg-green-500/20 text-green-400"
                              : "bg-white/10 text-white hover:bg-white/20"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {copied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-yellow-200/80">
                      <p className="font-medium mb-0.5">Important:</p>
                      <ul className="space-y-0.5 text-[10px]">
                        <li>• Send only {selectedCoin.label} on {selectedNetwork} network</li>
                        <li>• Minimum: 0.001 {selectedCoin.label}</li>
                        <li>• Funds credited after confirmation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

