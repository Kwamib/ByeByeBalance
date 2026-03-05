'use client';

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_DEBTS, DEFAULT_EXTRA_PAYMENT, DEFAULT_STRATEGY, STORAGE_KEY } from '../utils/constants';

/**
 * Custom hook for managing debt state with localStorage persistence.
 * Includes onboarding flow: null (prompt) → 'example' | 'fresh' → active.
 */
export function useDebts() {
  const [onboardingMode, setOnboardingMode] = useState(null); // null | 'example' | 'fresh'
  const [debts, setDebts] = useState([]);
  const [extraPayment, setExtraPayment] = useState(0);
  const [strategy, setStrategy] = useState(DEFAULT_STRATEGY);
  const [nextId, setNextId] = useState(1);

  // Load from localStorage on mount — if saved data exists, skip onboarding
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.debts && data.debts.length > 0 && data.debts.some(d => d.balance > 0)) {
          setDebts(data.debts);
          setExtraPayment(data.extraPayment || 0);
          setStrategy(data.strategy || DEFAULT_STRATEGY);
          setOnboardingMode(data.onboardingMode || 'fresh');
          const maxId = Math.max(...data.debts.map(d => d.id), 0);
          setNextId(maxId + 1);
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Save to localStorage on changes (only if past onboarding)
  useEffect(() => {
    if (onboardingMode === null) return;
    try {
      const dataToSave = { debts, extraPayment, strategy, onboardingMode, savedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [debts, extraPayment, strategy, onboardingMode]);

  // Onboarding actions
  const startWithExamples = useCallback(() => {
    setDebts(DEFAULT_DEBTS);
    setExtraPayment(DEFAULT_EXTRA_PAYMENT);
    setNextId(DEFAULT_DEBTS.length + 1);
    setOnboardingMode('example');
  }, []);

  const startFresh = useCallback(() => {
    setDebts([{ id: 1, name: '', balance: 0, rate: 0, minPayment: 0 }]);
    setExtraPayment(0);
    setNextId(2);
    setOnboardingMode('fresh');
  }, []);

  // CRUD
  const updateDebt = useCallback((id, field, value) => {
    setDebts(prev => prev.map(debt => debt.id === id ? { ...debt, [field]: value } : debt));
  }, []);

  const removeDebt = useCallback((id) => {
    setDebts(prev => prev.length > 1 ? prev.filter(debt => debt.id !== id) : prev);
  }, []);

  const addDebt = useCallback(() => {
    const newDebt = { id: nextId, name: '', balance: 0, rate: 0, minPayment: 0 };
    setDebts(prev => [...prev, newDebt]);
    setNextId(prev => prev + 1);
  }, [nextId]);

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setDebts([]);
    setExtraPayment(0);
    setStrategy(DEFAULT_STRATEGY);
    setOnboardingMode(null);
    return true;
  }, []);

  // Computed values
  const totalDebt = debts.reduce((sum, d) => sum + (d.balance || 0), 0);
  const avgRate = debts.length > 0 ? debts.reduce((sum, d) => sum + (d.rate || 0), 0) / debts.length : 0;
  const monthlyMin = debts.reduce((sum, d) => sum + (d.minPayment || 0), 0);

  return {
    debts, strategy, extraPayment, nextId, onboardingMode,
    setStrategy, setExtraPayment,
    updateDebt, removeDebt, addDebt, clearAll,
    startWithExamples, startFresh,
    totalDebt, avgRate, monthlyMin,
  };
}
