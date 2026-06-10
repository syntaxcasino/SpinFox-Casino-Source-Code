"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

interface FaqCategory {
  id: string;
  name: string;
  description?: string;
  items: FaqItem[];
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
}

export default function FaqSection({ searchQuery }: { searchQuery: string }) {
  const { t } = useTranslation("support");
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [searchResults, setSearchResults] = useState<FaqItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFaqData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchFaqItems(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchFaqData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/faq/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching FAQ data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchFaqItems = async (query: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/faq/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Error searching FAQ:", error);
    }
  };

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderFaqItem = (item: FaqItem) => {
    const isExpanded = expandedItems.has(item.id);
    
    return (
      <motion.div
        key={item.id}
        className="bg-white dark:bg-gray-800 rounded-lg mb-3 overflow-hidden shadow-sm dark:shadow-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <button
          onClick={() => toggleItem(item.id)}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="text-gray-900 dark:text-white font-medium">{item.question}</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            {item.answer}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {searchQuery.trim() ? (
        // Search Results
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <Search className="w-6 h-6 mr-2" />
            Search Results for "{searchQuery}"
          </h2>
          
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map(renderFaqItem)}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No results found for "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      ) : (
        // Categories
        <div className="space-y-6">
          {categories.map((category) => {
            const isCategoryExpanded = expandedCategories.has(category.id);
            
            return (
              <motion.div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm dark:shadow-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                    {category.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{category.description}</p>
                    )}
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                      {category.items.length} questions
                    </p>
                  </div>
                  {isCategoryExpanded ? (
                    <ChevronUp className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
                
                <motion.div
                  initial={false}
                  animate={{ height: isCategoryExpanded ? "auto" : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 space-y-3">
                    {category.items.map(renderFaqItem)}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Contact Support CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">
          Still need help?
        </h3>
        <p className="text-blue-100 mb-6">
          Can't find what you're looking for? Our support team is here to help!
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Create Support Ticket
          </button>
          <button className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
            Start Live Chat
          </button>
        </div>
      </div>
    </div>
  );
}
