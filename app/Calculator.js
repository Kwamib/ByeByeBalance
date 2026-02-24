'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Trash2, Plus, TrendingDown, Calendar, DollarSign, Target, Sparkles, Zap, Snowflake, Mountain, GripVertical, Share2, Download, Eye, AlertCircle, Shield, TrendingUp, Calculator, FileText, RefreshCw } from 'lucide-react';

function App() {
  // Debt calculator state
  const [debts, setDebts] = useState([
    { id: 1, name: 'Credit Card', balance: 8000, rate: 22.99, minPayment: 240 },
    { id: 2, name: 'Car Loan', balance: 3000, rate: 4.5, minPayment: 300 },
    { id: 3, name: 'Personal Loan', balance: 5000, rate: 12.99, minPayment: 150 },
    { id: 4, name: 'Student Loan', balance: 15000, rate: 6.5, minPayment: 165 }
  ]);
  const [strategy, setStrategy] = useState('snowball');
  const [customOrder, setCustomOrder] = useState(false);
  const [extraPayment, setExtraPayment] = useState(200);
  const [results, setResults] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [nextId, setNextId] = useState(5);
  const [isMobile, setIsMobile] = useState(false); // Safe default for SSR

  // Handle window resize (and set initial value on mount)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // Set correct value on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set favicon on mount
  useEffect(() => {
    // Create SVG favicon
    const svgFavicon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <rect width="32" height="32" rx="6" fill="url(#gradient)"/>
        <text x="16" y="22" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="white" text-anchor="middle">BB</text>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
      </svg>
    `;
    
    // Convert SVG to data URL
    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgFavicon)}`;
    
    // Update favicon
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = dataUrl;
    document.head.appendChild(link);
    
    // Update page title
    document.title = 'ByeByeBalance - Free Debt Payoff Calculator';
  }, []);

  // Load saved data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('byebyebalance-data');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.debts && data.debts.length > 0) {
          setDebts(data.debts);
          setExtraPayment(data.extraPayment || 0);
          setStrategy(data.strategy || 'snowball');
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    try {
      const dataToSave = {
        debts,
        extraPayment,
        strategy,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('byebyebalance-data', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [debts, extraPayment, strategy]);

  // Functions to manage debts
  const updateDebt = (id, field, value) => {
    setDebts(debts.map(debt => 
      debt.id === id ? { ...debt, [field]: value } : debt
    ));
  };

  const removeDebt = (id) => {
    if (debts.length > 1) {
      setDebts(debts.filter(debt => debt.id !== id));
    }
  };

  const addDebt = () => {
    const newDebt = {
      id: nextId,
      name: '',
      balance: 0,
      rate: 0,
      minPayment: 0
    };
    setDebts([...debts, newDebt]);
    setNextId(nextId + 1);
  };

  const clearAllData = () => {
    if (window.confirm('This will clear all your debts and settings. Are you sure?')) {
      localStorage.removeItem('byebyebalance-data');
      setDebts([{ id: 1, name: '', balance: 0, rate: 0, minPayment: 0 }]);
      setExtraPayment(0);
      setStrategy('snowball');
      setResults(null);
      setComparisonResults(null);
    }
  };

  // Calculate payoff for a given strategy
  const calculateStrategy = (validDebts, strategyType, extraPmt) => {
    // Validate and ensure minimum payments cover interest
    const validatedDebts = validDebts.map(d => {
      const monthlyInterestRate = d.rate / 100 / 12;
      const minInterestPayment = d.balance * monthlyInterestRate;
      return {
        ...d,
        minPayment: Math.max(d.minPayment, minInterestPayment * 1.1)
      };
    });

    let workingDebts = validatedDebts.map(d => ({
      ...d, 
      originalBalance: d.balance,
      currentBalance: d.balance,
      individualInterest: 0,
      monthPaidOff: null
    }));

    const chartData = [];
    let month = 0;
    let totalInterestPaid = 0;
    const MAX_MONTHS = 360;

    while (workingDebts.some(d => d.currentBalance > 0) && month < MAX_MONTHS) {
      month++;
      
      workingDebts.forEach(debt => {
        if (debt.currentBalance > 0) {
          const monthlyInterest = debt.currentBalance * (debt.rate / 100 / 12);
          const minPayment = Math.min(debt.minPayment, debt.currentBalance + monthlyInterest);
          const principalFromMin = Math.max(0, minPayment - monthlyInterest);
          
          debt.currentBalance = Math.max(0, debt.currentBalance - principalFromMin);
          debt.individualInterest += monthlyInterest;
          totalInterestPaid += monthlyInterest;
        }
      });

      if (extraPmt > 0) {
        let targetDebt = null;
        const activeDebts = workingDebts.filter(d => d.currentBalance > 0);
        
        if (activeDebts.length > 0) {
          if (strategyType === 'snowball') {
            targetDebt = activeDebts.reduce((min, d) => 
              d.currentBalance < min.currentBalance ? d : min
            );
          } else if (strategyType === 'avalanche') {
            targetDebt = activeDebts.reduce((max, d) => 
              d.rate > max.rate ? d : max
            );
          }
          
          if (targetDebt) {
            const extraApplied = Math.min(extraPmt, targetDebt.currentBalance);
            targetDebt.currentBalance -= extraApplied;
          }
        }
      }

      workingDebts.forEach(debt => {
        if (debt.currentBalance === 0 && !debt.monthPaidOff) {
          debt.monthPaidOff = month;
        }
      });

      const monthData = { month: `M${month}` };
      workingDebts.forEach(debt => {
        monthData[debt.name] = Math.round(debt.currentBalance);
      });

      if (month === 1 || month % Math.ceil(month / 20) === 0 || workingDebts.every(d => d.currentBalance === 0)) {
        chartData.push(monthData);
      }
    }

    return {
      totalMonths: month,
      totalInterest: totalInterestPaid,
      workingDebts: workingDebts,
      chartData: chartData
    };
  };

  const handleCalculate = () => {
    const validDebts = debts.filter(d => d.balance > 0 && d.minPayment > 0);
    
    if (validDebts.length === 0) {
      alert('Please add at least one debt with a balance and minimum payment!');
      return;
    }

    const currentResults = calculateStrategy(validDebts, strategy, extraPayment);
    const snowballResults = calculateStrategy(validDebts, 'snowball', extraPayment);
    const avalancheResults = calculateStrategy(validDebts, 'avalanche', extraPayment);
    const minOnlyResults = calculateStrategy(validDebts, 'snowball', 0);

    let displayOrder = [...currentResults.workingDebts];
    if (strategy === 'snowball') {
      displayOrder.sort((a, b) => (a.monthPaidOff || 999) - (b.monthPaidOff || 999));
    } else if (strategy === 'avalanche') {
      displayOrder.sort((a, b) => b.rate - a.rate);
    }

    const finalResults = {
      totalMonths: currentResults.totalMonths,
      totalInterest: currentResults.totalInterest,
      debtFreeDate: new Date(Date.now() + (currentResults.totalMonths * 30 * 24 * 60 * 60 * 1000)),
      chartData: currentResults.chartData,
      monthlyPayment: validDebts.reduce((sum, d) => sum + (d.minPayment || 0), 0) + (extraPayment || 0),
      totalPaid: validDebts.reduce((sum, d) => sum + d.balance, 0) + currentResults.totalInterest,
      schedule: displayOrder.map((debt, i) => ({
        order: i + 1,
        name: debt.name,
        originalBalance: debt.originalBalance,
        rate: debt.rate,
        paidOffMonth: debt.monthPaidOff || currentResults.totalMonths,
        interestPaid: Math.round(debt.individualInterest)
      })),
      minimumOnlyMonths: minOnlyResults.totalMonths,
      minimumOnlyInterest: minOnlyResults.totalInterest,
      interestSaved: minOnlyResults.totalInterest - currentResults.totalInterest,
      monthsSaved: minOnlyResults.totalMonths - currentResults.totalMonths,
      strategy: strategy
    };

    const comparison = {
      snowball: {
        months: snowballResults.totalMonths,
        interest: snowballResults.totalInterest
      },
      avalanche: {
        months: avalancheResults.totalMonths,
        interest: avalancheResults.totalInterest
      },
      difference: {
        months: snowballResults.totalMonths - avalancheResults.totalMonths,
        interest: snowballResults.totalInterest - avalancheResults.totalInterest
      }
    };

    setResults(finalResults);
    setComparisonResults(comparison);
  };

  // Action functions
  const exportPDF = () => {
    window.print();
  };

  const shareResults = async () => {
  if (!results) {
    alert('Calculate your plan first!');
    return;
  }
  
  const text = `I'll be debt-free in ${results.totalMonths} months! Check out this free debt calculator: https://byebyebalance.com`;
  
  if (navigator.share) {
    try {
      await navigator.share({ text });
    } catch (err) {
      // User cancelled share or share failed
      if (err.name !== 'AbortError') {
        // Only log if it's not a user cancellation
        console.log('Share failed:', err);
      }
      // Don't show an error to user for cancellation
    }
  } else {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }
};

  const downloadCSV = () => {
    if (!results) {
      alert('Please calculate your plan first!');
      return;
    }

    // Create CSV content
    let csvContent = 'Debt Payoff Plan\n';
    csvContent += `Generated,${new Date().toLocaleDateString()}\n`;
    csvContent += `Strategy,${strategy === 'snowball' ? 'Snowball (Lowest balance first)' : 'Avalanche (Highest rate first)'}\n`;
    csvContent += `Extra Monthly Payment,${extraPayment}\n`;
    csvContent += `Debt-Free Date,${results.debtFreeDate.toLocaleDateString()}\n`;
    csvContent += `Total Months,${results.totalMonths}\n`;
    csvContent += `Total Interest Paid,${Math.round(results.totalInterest)}\n`;
    csvContent += `Interest Saved,${Math.round(results.interestSaved || 0)}\n\n`;
    
    // Debt payoff order
    csvContent += 'PAYOFF ORDER\n';
    csvContent += 'Order,Debt Name,Original Balance,Interest Rate,Interest Paid\n';
    results.schedule.forEach(debt => {
      csvContent += `${debt.order},"${debt.name || 'Unnamed Debt'}",${debt.originalBalance},${debt.rate}%,${debt.interestPaid}\n`;
    });
    
    // Current debt details
    csvContent += '\n';
    csvContent += 'CURRENT DEBT DETAILS\n';
    csvContent += 'Name,Balance,Rate,Min Payment\n';
    debts.forEach(debt => {
      csvContent += `"${debt.name || ''}",${debt.balance || 0},${debt.rate || 0},${debt.minPayment || 0}\n`;
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debt-plan-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    },
    header: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      padding: isMobile ? '1rem' : '1rem 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)'
    },
    headerContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: isMobile ? 'wrap' : 'nowrap',
      gap: isMobile ? '1rem' : '0'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    logoIcon: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      padding: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    logoText: {
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      fontWeight: 900,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      width: isMobile ? '100%' : 'auto'
    },
    heroSection: {
      maxWidth: '1400px',
      margin: isMobile ? '1rem auto' : '2rem auto',
      padding: isMobile ? '0 1rem' : '0 2rem',
      textAlign: 'center',
      color: 'white'
    },
    mainContent: {
      maxWidth: '1400px',
      margin: isMobile ? '1rem auto' : '2rem auto',
      padding: isMobile ? '0 1rem' : '0 2rem',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
      gap: isMobile ? '1rem' : '2rem'
    },
    mainPanel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    sidePanel: {
      display: isMobile ? 'none' : 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: isMobile ? '1rem' : '1.5rem',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    statCard: {
      background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
      borderRadius: '12px',
      padding: '1rem',
      borderLeft: '3px solid #667eea'
    },
    debtCard: {
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
      border: '2px solid #e9ecef',
      borderRadius: '16px',
      padding: isMobile ? '1rem' : '1.5rem',
      marginBottom: '1rem',
      position: 'relative',
      transition: 'all 0.3s ease'
    },
    quickActions: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem',
      marginTop: '1rem'
    },
    actionButton: {
      padding: '0.75rem',
      background: 'white',
      border: '2px solid #e9ecef',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    trustCard: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '2px solid #86efac'
    },
    footer: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.2)',
      padding: isMobile ? '1.5rem 1rem' : '2rem',
      marginTop: '4rem'
    },
    footerContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr 1fr',
      gap: '2rem',
      alignItems: 'center',
      textAlign: isMobile ? 'center' : 'left'
    }
  };

  const totalDebt = debts.reduce((sum, d) => sum + (d.balance || 0), 0);
  const avgRate = debts.length > 0 ? debts.reduce((sum, d) => sum + (d.rate || 0), 0) / debts.length : 0;
  const monthlyMin = debts.reduce((sum, d) => sum + (d.minPayment || 0), 0);

  return (
    <div style={styles.container}>
      {/* Header Bar */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <Sparkles size={24} color="white" />
            </div>
            <h1 style={styles.logoText}>ByeByeBalance</h1>
          </div>

          <div style={styles.headerActions}>
            <button
              onClick={handleCalculate}
              style={{
                width: isMobile ? '100%' : 'auto',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Calculator size={18} />
              Calculate My Plan
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div style={styles.heroSection}>
        <h2 style={{ fontSize: isMobile ? '1.75rem' : '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
          Calculate Your Path to Financial Freedom
        </h2>
        <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', opacity: 0.95, marginBottom: '1.5rem' }}>
          Compare proven strategies and see exactly when you'll be debt-free
        </p>
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '0.5rem' : '2rem', 
          justifyContent: 'center', 
          fontSize: '0.9rem', 
          opacity: 0.9 
        }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '0.5rem' }}>
            <Shield size={16} />
            100% Private
          </span>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '0.5rem' }}>
            <DollarSign size={16} />
            Forever Free
          </span>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', gap: '0.5rem' }}>
            <Calculator size={16} />
            No Account Required
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        {/* Left Panel - Main Calculator */}
        <div style={styles.mainPanel}>
          {/* Quick Stats */}
          <div style={styles.card}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isMobile ? '1.25rem' : '1.5rem' }}>
              <Target size={24} color="#667eea" />
              Your Debt Overview
            </h2>
            
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>TOTAL DEBT</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#212529' }}>
                  ${totalDebt.toLocaleString()}
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>AVG RATE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#212529' }}>
                  {avgRate.toFixed(1)}%
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>MONTHLY MIN</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#212529' }}>
                  ${monthlyMin.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Debt List */}
            <div style={{ marginTop: '1.5rem' }}>
              {/* Example Data Banner */}
              {debts.some(d => d.balance > 0) && (
                <div style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  border: '1px solid #93c5fd',
                  borderRadius: '10px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  color: '#1e40af'
                }}>
                  <span style={{ fontSize: '1rem' }}>💡</span>
                  <span>
                    <strong>Example debts shown</strong> - Edit these directly or click 'Reset All' to start fresh with your own debts
                  </span>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: isMobile ? '1.125rem' : '1.25rem' }}>Your Debts</h3>
                <button
                  onClick={clearAllData}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    color: '#6c757d',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <RefreshCw size={14} />
                  {!isMobile && 'Reset All'}
                </button>
              </div>

              {debts.map((debt, index) => (
                <div key={debt.id} style={styles.debtCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem',
                      background: '#667eea',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      #{index + 1}
                    </span>
                    <button
                      onClick={() => removeDebt(debt.id)}
                      style={{
                        background: '#fee2e2',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <label style={{ 
                        fontSize: '0.75rem', 
                        color: '#6c757d', 
                        marginBottom: '0.25rem',
                        display: 'block',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Debt Name
                      </label>
                      <input
                        type="text"
                        value={debt.name}
                        onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                        placeholder="e.g., Chase Card"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '2px solid #e9ecef',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e9ecef';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ 
                        fontSize: '0.75rem', 
                        color: '#6c757d', 
                        marginBottom: '0.25rem',
                        display: 'block',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Balance ($)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={debt.balance ? debt.balance.toLocaleString() : ''}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9.]/g, '');
                          updateDebt(debt.id, 'balance', raw === '' ? 0 : parseFloat(raw));
                        }}
                        placeholder="5,000"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '2px solid #e9ecef',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e9ecef';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ 
                        fontSize: '0.75rem', 
                        color: '#6c757d', 
                        marginBottom: '0.25rem',
                        display: 'block',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        value={debt.rate || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          updateDebt(debt.id, 'rate', value === '' ? 0 : parseFloat(value));
                        }}
                        placeholder="18.99"
                        step="0.01"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '2px solid #e9ecef',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e9ecef';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ 
                        fontSize: '0.75rem', 
                        color: '#6c757d', 
                        marginBottom: '0.25rem',
                        display: 'block',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        Min Payment ($)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={debt.minPayment ? debt.minPayment.toLocaleString() : ''}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9.]/g, '');
                          updateDebt(debt.id, 'minPayment', raw === '' ? 0 : parseFloat(raw));
                        }}
                        placeholder="150"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '2px solid #e9ecef',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e9ecef';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={addDebt}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'white',
                  border: '2px dashed #dee2e6',
                  borderRadius: '10px',
                  color: '#6c757d',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.color = '#667eea';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#dee2e6';
                  e.currentTarget.style.color = '#6c757d';
                }}
              >
                <Plus size={18} />
                Add Another Debt
              </button>
            </div>
          </div>

          {/* Strategy Selection */}
          <div style={styles.card}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isMobile ? '1.125rem' : '1.25rem' }}>
              <Zap size={20} color="#facc15" />
              Payoff Strategy
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {[
                { id: 'snowball', icon: Snowflake, label: 'Snowball', desc: 'Lowest balance first (psychological wins)' },
                { id: 'avalanche', icon: Mountain, label: 'Avalanche', desc: 'Highest rate first (saves most money)' }
              ].map(strat => (
                <div
                  key={strat.id}
                  onClick={() => setStrategy(strat.id)}
                  style={{
                    padding: '1rem',
                    border: '2px solid',
                    borderColor: strategy === strat.id ? '#667eea' : '#e9ecef',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    background: strategy === strat.id 
                      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                      : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <strat.icon size={28} color="#667eea" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{strat.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#6c757d', lineHeight: 1.3 }}>{strat.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', color: '#495057', fontWeight: '600' }}>
                Extra Monthly Payment (This is where the magic happens!)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="number"
                  value={extraPayment || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setExtraPayment(0);
                    } else {
                      setExtraPayment(parseFloat(value));
                    }
                  }}
                  placeholder="0"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '2px solid #dee2e6',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
                <button 
                  onClick={handleCalculate}
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <TrendingDown size={18} />
                  {isMobile ? 'Go' : 'Calculate'}
                </button>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginTop: '0.75rem',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>Try:</span>
                {[50, 100, 200, 500].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setExtraPayment(amount)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      background: extraPayment === amount ? '#667eea' : '#f8f9fa',
                      color: extraPayment === amount ? 'white' : '#495057',
                      border: '1px solid',
                      borderColor: extraPayment === amount ? '#667eea' : '#dee2e6',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    +${amount}
                  </button>
                ))}
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontStyle: 'italic' }}>
                  Even $50 extra makes a huge difference!
                </span>
              </div>
            </div>
          </div>

          {/* Strategy Comparison */}
          {comparisonResults && (
            <div style={styles.card}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: isMobile ? '1.125rem' : '1.25rem' }}>
                <TrendingUp size={20} color="#10b981" />
                Strategy Comparison
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  padding: '1rem',
                  background: strategy === 'snowball' ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : '#f8f9fa',
                  borderRadius: '12px',
                  border: strategy === 'snowball' ? '2px solid #3b82f6' : '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Snowflake size={20} color="#3b82f6" />
                    <span style={{ fontWeight: '600', color: '#1e40af' }}>Snowball Method</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af' }}>
                    ${Math.round(comparisonResults.snowball.interest).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#3b82f6' }}>
                    Total interest • {comparisonResults.snowball.months} months
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: strategy === 'avalanche' ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : '#f8f9fa',
                  borderRadius: '12px',
                  border: strategy === 'avalanche' ? '2px solid #22c55e' : '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Mountain size={20} color="#16a34a" />
                    <span style={{ fontWeight: '600', color: '#14532d' }}>Avalanche Method</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#14532d' }}>
                    ${Math.round(comparisonResults.avalanche.interest).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>
                    Total interest • {comparisonResults.avalanche.months} months
                  </div>
                </div>
              </div>

              {comparisonResults.difference.interest > 0 && (
                <div style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '12px',
                  border: '1px solid #fbbf24'
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
                    <strong>💰 Avalanche saves you:</strong>{' '}
                    <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#16a34a' }}>
                      ${Math.round(comparisonResults.difference.interest).toLocaleString()}
                    </span>{' '}
                    in interest
                    {comparisonResults.difference.months > 0 && (
                      <span> and <strong>{comparisonResults.difference.months} months</strong> of payments</span>
                    )}!
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: isMobile ? '1.125rem' : '1.25rem' }}>Your Debt Freedom Plan</h3>
                {!isMobile && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={exportPDF}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'white',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        color: '#495057',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FileText size={14} />
                      PDF
                    </button>
                    <button
                      onClick={shareResults}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'white',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        color: '#495057',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                {/* Summary Stats */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #10b98115 0%, #05966915 100%)',
                    borderRadius: '12px',
                    padding: '1rem',
                    borderLeft: '3px solid #10b981'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#047857', marginBottom: '0.25rem', fontWeight: '600' }}>
                      DEBT-FREE DATE
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#047857' }}>
                      {results.debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                      {results.totalMonths} months
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #f5990b15 0%, #d9770615 100%)',
                    borderRadius: '12px',
                    padding: '1rem',
                    borderLeft: '3px solid #f59e0b'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '0.25rem', fontWeight: '600' }}>
                      TOTAL INTEREST
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#92400e' }}>
                      ${Math.round(results.totalInterest).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                      Total paid: ${Math.round(results.totalPaid).toLocaleString()}
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                    borderRadius: '12px',
                    padding: '1rem',
                    borderLeft: '3px solid #667eea'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#4c1d95', marginBottom: '0.25rem', fontWeight: '600' }}>
                      MONTHLY PAYMENT
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4c1d95' }}>
                      ${Math.round(results.monthlyPayment).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#667eea' }}>
                      Including ${extraPayment} extra
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#495057' }}>Balance Over Time</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={results.chartData}>
                      <defs>
                        {results.schedule.map((debt, index) => (
                          <linearGradient key={`gradient-${index}`} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={`hsl(${260 + index * 40}, 70%, 50%)`} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={`hsl(${260 + index * 40}, 70%, 50%)`} stopOpacity={0.1}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                      <XAxis dataKey="month" stroke="#495057" fontSize={12} />
                      <YAxis stroke="#495057" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #dee2e6',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      {results.schedule.map((debt, index) => (
                        <Area
                          key={debt.name}
                          type="monotone"
                          dataKey={debt.name}
                          stroke={`hsl(${260 + index * 40}, 70%, 50%)`}
                          fillOpacity={1}
                          fill={`url(#gradient${index})`}
                          strokeWidth={2}
                          stackId="1"
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Payoff Schedule */}
                <div>
                  <h4 style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#495057' }}>Payoff Order</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {results.schedule.map((item, index) => (
                      <div key={item.name} style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '30px 1fr' : '30px 2fr 1fr 1fr 1fr',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: index === 0 ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)' : '#f8f9fa',
                        borderRadius: '8px',
                        border: index === 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #e9ecef',
                        alignItems: 'center',
                        fontSize: '0.875rem'
                      }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: index === 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}>
                          {item.order}
                        </div>
                        <div style={{ fontWeight: '600', color: '#212529' }}>
                          {item.name}
                          {isMobile && (
                            <div style={{ fontSize: '0.7rem', color: '#6c757d', marginTop: '0.25rem' }}>
                              ${Math.round(item.originalBalance).toLocaleString()} • {item.rate}% • ${Math.round(item.interestPaid).toLocaleString()} interest
                            </div>
                          )}
                        </div>
                        {!isMobile && (
                          <>
                            <div style={{ color: '#6c757d' }}>${Math.round(item.originalBalance).toLocaleString()}</div>
                            <div style={{ color: '#f59e0b', fontWeight: '600' }}>{item.rate}%</div>
                            <div style={{ 
                              color: item.interestPaid > 1000 ? '#dc2626' : '#16a34a',
                              fontWeight: '600'
                            }}>
                              ${Math.round(item.interestPaid).toLocaleString()}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Mobile Quick Actions */}
                  {isMobile && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
                      <button onClick={shareResults} style={{
                        padding: '0.75rem',
                        background: 'white',
                        border: '2px solid #e9ecef',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}>
                        <Share2 size={16} />
                        Share
                      </button>
                      <button onClick={downloadCSV} style={{
                        padding: '0.75rem',
                        background: 'white',
                        border: '2px solid #e9ecef',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}>
                        <FileText size={16} />
                        Export
                      </button>
                    </div>
                  )}
                  
                  {/* Important Disclaimer */}
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(156, 163, 175, 0.1)',
                    borderRadius: '8px',
                    borderLeft: '3px solid #9ca3af'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                      <AlertCircle size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'text-bottom' }} />
                      * Calculations do not include late fees, annual fees, or variable rate changes. For educational purposes only.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Only visible on desktop */}
        <div style={styles.sidePanel}>
          {/* Quick Actions */}
          <div style={styles.card}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>Quick Actions</h3>
            <div style={styles.quickActions}>
              <button onClick={shareResults} style={styles.actionButton}>
                <Share2 size={18} />
                <span>Share</span>
              </button>
              <button onClick={exportPDF} style={styles.actionButton}>
                <Download size={18} />
                <span>Print</span>
              </button>
              <button onClick={downloadCSV} style={styles.actionButton}>
                <FileText size={18} />
                <span>Export</span>
              </button>
              <button onClick={clearAllData} style={styles.actionButton}>
                <RefreshCw size={18} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Why Trust This */}
          <div style={styles.trustCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Shield size={20} color="#10b981" />
              <span style={{ fontWeight: '700', color: '#047857' }}>Why Trust This?</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Calculator size={16} color="#10b981" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#047857' }}>
                    Math You Can Verify
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                    Check our calculations against any financial calculator
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Shield size={16} color="#10b981" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#047857' }}>
                    Your Data Stays Private
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                    Everything stays in your browser
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <DollarSign size={16} color="#10b981" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#047857' }}>
                    Completely Free
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                    No hidden fees or premium versions
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div style={{
            ...styles.card,
            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
            border: '2px solid #d1d5db'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Shield size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Your Privacy Matters
                </div>
                <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: '#4b5563', margin: 0 }}>
                  All calculations happen in your browser. We don't store or see your financial data. 
                  Questions? 
                  <a href="mailto:support@byebyebalance.com" style={{ color: '#667eea', marginLeft: '0.25rem' }}>
                    Contact support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div>
            <div style={{ fontWeight: '600', color: '#212529', marginBottom: '0.5rem' }}>
              ByeByeBalance
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6c757d', margin: 0 }}>
              A free tool to visualize your<br />journey to debt freedom
            </p>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '0.5rem' : '2rem', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#495057' }}>
              <Shield size={16} color="#10b981" />
              <span>100% Private</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#495057' }}>
              <DollarSign size={16} color="#10b981" />
              <span>Forever Free</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#495057' }}>
              <Calculator size={16} color="#10b981" />
              <span>No Ads or Spam</span>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            justifyContent: isMobile ? 'center' : 'flex-end', 
            fontSize: '0.875rem' 
          }}>
            <Link href="/privacy" style={{ color: '#6c757d', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/contact" style={{ color: '#6c757d', textDecoration: 'none' }}>Contact</Link>
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid #e9ecef',
          fontSize: '0.8rem',
          color: '#6c757d'
        }}>
          © 2025 ByeByeBalance | Empowering debt-free futures
        </div>
      </footer>

      <style>{`
        @media print {
          header, .side-panel, footer, button { 
            display: none !important; 
          }
          
          .main-content {
            grid-template-columns: 1fr !important;
          }
          
          .card {
            break-inside: avoid;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
        }
        
        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        a:hover {
          text-decoration: underline;
        }
        
        /* Remove spinner buttons from number inputs */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}

export default App;