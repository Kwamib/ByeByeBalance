'use client';

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_DEBTS, DEFAULT_EXTRA_PAYMENT, DEFAULT_STRATEGY, STORAGE_KEY } from '../utils/constants';

/**
 * Custom hook for managing debt state with localStorage persistence.
 * Encapsulates all CRUD operations and persistence logic.
 */
export function useDebts() {
  const [debts, setDebts] = useState(DEFAULT_DEBTS);
  const [extraPayment, setExtraPayment] = useState(DEFAULT_EXTRA_PAYMENT);
  const [strategy, setStrategy] = useState(DEFAULT_STRATEGY);
  const [nextId, setNextId] = useState(DEFAULT_DEBTS.length + 1);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.debts && data.debts.length > 0) {
          setDebts(data.debts);
          setExtraPayment(data.extraPayment || 0);
          setStrategy(data.strategy || DEFAULT_STRATEGY);
          const maxId = Math.max(...data.debts.map(d => d.id), 0);
          setNextId(maxId + 1);
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    try {
      const dataToSave = { debts, extraPayment, strategy, savedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [debts, extraPayment, strategy]);

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
    if (window.confirm('This will clear all your debts and settings. Are you sure?')) {
      localStorage.removeItem(STORAGE_KEY);
      setDebts([{ id: 1, name: '', balance: 0, rate: 0, minPayment: 0 }]);
      setExtraPayment(0);
      setStrategy(DEFAULT_STRATEGY);
      return true; // signal to clear results
    }
    return false;
  }, []);

  // Computed values
  const totalDebt = debts.reduce((sum, d) => sum + (d.balance || 0), 0);
  const avgRate = debts.length > 0 ? debts.reduce((sum, d) => sum + (d.rate || 0), 0) / debts.length : 0;
  const monthlyMin = debts.reduce((sum, d) => sum + (d.minPayment || 0), 0);

  return {
    debts, strategy, extraPayment, nextId,
    setStrategy, setExtraPayment,
    updateDebt, removeDebt, addDebt, clearAll,
    totalDebt, avgRate, monthlyMin,
  };
}
