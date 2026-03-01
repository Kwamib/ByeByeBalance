'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Hooks
import { useDebts } from './hooks/useDebts';
import { useMobile } from './hooks/useMobile';

// Utils
import { validateDebts, buildWarningMap, runFullCalculation } from './utils/calculations';
import { generateCSV } from './utils/formatters';
import { globalStyles } from './utils/printStyles';

// Components
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import DebtOverview from './components/DebtOverview';
import { GlobalWarningBanner } from './components/WarningBanner';
import StrategySelector from './components/StrategySelector';
import StrategyComparison from './components/StrategyComparison';
import Results from './components/Results';
import SidePanel from './components/SidePanel';
import Footer from './components/Footer';
import PrintReport from './components/PrintReport';

function App() {
  const isMobile = useMobile();
  const {
    debts, strategy, extraPayment,
    setStrategy, setExtraPayment,
    updateDebt, removeDebt, addDebt, clearAll,
    totalDebt, avgRate, monthlyMin,
  } = useDebts();

  const [results, setResults] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);

  // Favicon
  useEffect(() => {
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
    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgFavicon)}`;
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/svg+xml';
    link.rel = 'icon';
    link.href = dataUrl;
    document.head.appendChild(link);
    document.title = 'ByeByeBalance - Free Debt Payoff Calculator';
  }, []);

  // Validation
  const debtWarnings = validateDebts(debts);
  const warningMap = buildWarningMap(debtWarnings);

  // Calculate
  const handleCalculate = useCallback(() => {
    const result = runFullCalculation(debts, strategy, extraPayment);
    if (!result) {
      alert('Please add at least one debt with a balance and minimum payment!');
      return;
    }
    setResults(result.results);
    setComparisonResults(result.comparison);
  }, [debts, strategy, extraPayment]);

  // Actions
  const handleClear = useCallback(() => {
    if (clearAll()) {
      setResults(null);
      setComparisonResults(null);
    }
  }, [clearAll]);

  const exportPDF = useCallback(() => window.print(), []);

  const shareResults = useCallback(async () => {
    if (!results) { alert('Calculate your plan first!'); return; }
    const text = `I'll be debt-free in ${results.totalMonths} months! Check out this free debt calculator: https://byebyebalance.com`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch (err) { if (err.name !== 'AbortError') console.log('Share failed:', err); }
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  }, [results]);

  const downloadCSV = useCallback(() => {
    if (!results) { alert('Please calculate your plan first!'); return; }
    const csv = generateCSV(results, debts, strategy, extraPayment);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debt-plan-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results, debts, strategy, extraPayment]);

  return (
    <div
      id="app-root"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
      }}
    >
      <PrintReport
        results={results}
        comparisonResults={comparisonResults}
        debts={debts}
        strategy={strategy}
        extraPayment={extraPayment}
      />

      <Header onCalculate={handleCalculate} isMobile={isMobile} />
      <HeroSection isMobile={isMobile} />

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1400px',
          margin: isMobile ? '1rem auto' : '2rem auto',
          padding: isMobile ? '0 1rem' : '0 2rem',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
          gap: isMobile ? '1rem' : '2rem',
        }}
        className="no-print"
      >
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <DebtOverview
            debts={debts}
            totalDebt={totalDebt}
            avgRate={avgRate}
            monthlyMin={monthlyMin}
            warningMap={warningMap}
            isMobile={isMobile}
            onUpdate={updateDebt}
            onRemove={removeDebt}
            onAdd={addDebt}
            onClear={handleClear}
          />

          <GlobalWarningBanner warnings={debtWarnings} />

          <StrategySelector
            strategy={strategy}
            extraPayment={extraPayment}
            isMobile={isMobile}
            onStrategyChange={setStrategy}
            onExtraChange={setExtraPayment}
            onCalculate={handleCalculate}
          />

          <StrategyComparison
            comparison={comparisonResults}
            strategy={strategy}
            isMobile={isMobile}
          />

          <Results
            results={results}
            extraPayment={extraPayment}
            isMobile={isMobile}
            onShare={shareResults}
            onExportPDF={exportPDF}
            onDownloadCSV={downloadCSV}
          />
        </div>

        {/* Right Panel */}
        <SidePanel
          isMobile={isMobile}
          onShare={shareResults}
          onExportPDF={exportPDF}
          onDownloadCSV={downloadCSV}
          onClear={handleClear}
        />
      </div>

      <Footer isMobile={isMobile} />
      <style>{globalStyles}</style>
    </div>
  );
}

export default App;
