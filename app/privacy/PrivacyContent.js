'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Lock, Database, Cookie, Mail, ArrowLeft } from 'lucide-react';

function Privacy() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    window.scrollTo(0, 0);
    document.title = 'Privacy Policy - ByeByeBalance';
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    backButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      background: 'white',
      color: '#667eea',
      textDecoration: 'none',
      borderRadius: '10px',
      margin: '2rem',
      fontWeight: '600',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s'
    },
    content: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: isMobile ? '0 1rem 2rem 1rem' : '0 2rem 4rem 2rem',
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      padding: isMobile ? '1.5rem' : '3rem',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    },
    title: {
      fontSize: isMobile ? '1.75rem' : '2.5rem',
      fontWeight: '800',
      marginBottom: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    section: {
      marginBottom: '2.5rem',
    },
    sectionTitle: {
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: '#212529',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    paragraph: {
      fontSize: '1rem',
      lineHeight: '1.8',
      color: '#495057',
      marginBottom: '1rem',
    },
    list: {
      paddingLeft: '1.5rem',
      color: '#495057',
      lineHeight: '1.8',
    },
    highlight: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      borderLeft: '4px solid #10b981',
      padding: '1.5rem',
      borderRadius: '10px',
      marginBottom: '2rem',
    },
    footer: {
      marginTop: '3rem',
      paddingTop: '2rem',
      borderTop: '2px solid #e9ecef',
      color: '#6c757d',
      fontSize: '0.875rem',
    }
  };

  return (
    <div style={styles.container}>
      <Link href="/" style={styles.backButton} 
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <ArrowLeft size={20} />
        Back to Calculator
      </Link>

      <div style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.title}>Privacy Policy</h1>

          <div style={styles.highlight}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Shield size={24} color="#10b981" />
              <strong style={{ fontSize: '1.125rem', color: '#047857' }}>Your Privacy is Our Priority</strong>
            </div>
            <p style={{ margin: 0, color: '#059669' }}>
              ByeByeBalance runs entirely in your browser. We don't collect, store, or see any of your financial information.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Database size={24} color="#667eea" />
              What We Don't Collect
            </h2>
            <p style={styles.paragraph}>
              We take a radically different approach to privacy. Here's what we <strong>don't</strong> do:
            </p>
            <ul style={styles.list}>
              <li>No account creation or sign-ups required</li>
              <li>No personal information collected (name, email, phone, etc.)</li>
              <li>No financial data stored on our servers</li>
              <li>No tracking cookies or advertising pixels</li>
              <li>No selling or sharing of data (we don't have any!)</li>
              <li>No third-party analytics that track individuals</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Lock size={24} color="#667eea" />
              How Your Data Stays Private
            </h2>
            <p style={styles.paragraph}>
              All calculations and data storage happen locally in your browser using a technology called "localStorage". 
              This means:
            </p>
            <ul style={styles.list}>
              <li>Your debt information never leaves your device</li>
              <li>We cannot see or access your financial data</li>
              <li>Clearing your browser data removes everything</li>
              <li>No backups exist on our servers</li>
              <li>Each browser/device maintains its own separate data</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Cookie size={24} color="#667eea" />
              Minimal Analytics
            </h2>
            <p style={styles.paragraph}>
              We use privacy-focused analytics to understand general usage patterns:
            </p>
            <ul style={styles.list}>
              <li>Page views and general traffic patterns</li>
              <li>General geographic location (country/state level)</li>
              <li>Device type (mobile/desktop)</li>
              <li>No personal identification or tracking across sites</li>
            </ul>
            <p style={styles.paragraph}>
              This helps us improve the calculator and understand which features are most helpful. 
              We specifically chose analytics providers that respect user privacy and don't track individuals.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Mail size={24} color="#667eea" />
              When You Contact Us
            </h2>
            <p style={styles.paragraph}>
              If you choose to contact us via email or submit feedback:
            </p>
            <ul style={styles.list}>
              <li>We only use your contact information to respond to your inquiry</li>
              <li>We don't add you to any mailing lists without explicit consent</li>
              <li>We don't share your information with third parties</li>
              <li>You can request deletion of any correspondence at any time</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Your Rights
            </h2>
            <p style={styles.paragraph}>
              Since we don't collect personal data through the calculator, traditional data rights 
              (access, deletion, portability) don't apply - there's simply nothing to access or delete 
              on our servers. Your data exists only on your device, under your full control.
            </p>
            <p style={styles.paragraph}>
              You can clear all calculator data at any time by:
            </p>
            <ul style={styles.list}>
              <li>Using the "Reset All" button in the calculator</li>
              <li>Clearing your browser's localStorage</li>
              <li>Clearing your browser's cache and cookies</li>
            </ul>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Changes to This Policy
            </h2>
            <p style={styles.paragraph}>
              We may update this privacy policy from time to time. Any changes will be posted on this page 
              with an updated revision date. We will never make changes that reduce your privacy without 
              clear notice.
            </p>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Contact Us
            </h2>
            <p style={styles.paragraph}>
              If you have questions about this privacy policy or how ByeByeBalance handles privacy, 
              please contact us at:
            </p>
            <p style={styles.paragraph}>
              <strong>Email:</strong> support@byebyebalance.com
            </p>
          </div>

          <div style={styles.footer}>
            <p>
              <strong>Last Updated:</strong> October 2025<br />
              <strong>Effective Date:</strong> October 2025
            </p>
            <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
              This privacy policy applies to the ByeByeBalance debt calculator located at byebyebalance.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Privacy;