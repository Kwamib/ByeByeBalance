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
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const s = {
    container: {
      minHeight: '100vh',
      background: 'var(--bg, #F5F2EC)',
      fontFamily: "var(--font-body, 'Outfit', -apple-system, sans-serif)",
      color: 'var(--text-primary, #1A2626)',
    },
    nav: {
      borderBottom: '1px solid var(--border, #D8D3C8)',
      padding: '0 2rem',
      background: 'var(--bg, #F5F2EC)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    navInner: {
      maxWidth: 800,
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 60,
    },
    backLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      color: 'var(--text-muted, #8A9A9A)',
      textDecoration: 'none',
      fontSize: '0.8rem',
      fontWeight: 500,
    },
    content: {
      maxWidth: 800,
      margin: '0 auto',
      padding: isMobile ? '2rem 1rem' : '3rem 2rem',
    },
    card: {
      background: 'var(--bg-card, #EFECE4)',
      borderRadius: 6,
      border: '1px solid var(--border, #D8D3C8)',
      padding: isMobile ? '1.5rem' : '2.5rem',
    },
    title: {
      fontFamily: "var(--font-display, 'Cormorant Garamond', Georgia, serif)",
      fontSize: isMobile ? '2rem' : '2.75rem',
      fontWeight: 600,
      letterSpacing: '-1px',
      color: 'var(--text-primary, #1A2626)',
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: '0.65rem',
      fontWeight: 600,
      letterSpacing: '2px',
      textTransform: 'uppercase',
      color: 'var(--sage, #7A9E87)',
      marginBottom: '0.75rem',
    },
    highlight: {
      background: 'var(--success-light, rgba(90,122,102,0.12))',
      borderLeft: '3px solid var(--sage, #7A9E87)',
      padding: '1.25rem',
      borderRadius: 4,
      marginBottom: '2rem',
      marginTop: '1.5rem',
    },
    section: {
      marginBottom: '2rem',
    },
    sectionTitle: {
      fontFamily: "var(--font-display, 'Cormorant Garamond', Georgia, serif)",
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      fontWeight: 600,
      marginBottom: '0.75rem',
      color: 'var(--text-primary, #1A2626)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      letterSpacing: '-0.2px',
    },
    paragraph: {
      fontSize: '0.9rem',
      lineHeight: 1.7,
      color: 'var(--text-secondary, #4A5A5A)',
      marginBottom: '0.75rem',
    },
    list: {
      paddingLeft: '1.25rem',
      color: 'var(--text-secondary, #4A5A5A)',
      lineHeight: 1.8,
      fontSize: '0.88rem',
    },
    footer: {
      marginTop: '2rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid var(--border, #D8D3C8)',
      color: 'var(--text-muted, #8A9A9A)',
      fontSize: '0.8rem',
    },
  };

  return (
    <div style={s.container}>
      <div style={s.nav}>
        <div style={s.navInner}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: "var(--font-display, 'Cormorant Garamond', serif)", fontWeight: 600, fontSize: '1.4rem', letterSpacing: '-0.3px', color: 'var(--text-primary, #1A2626)' }}>
              Bye<span style={{ color: 'var(--sage, #7A9E87)' }}>Bye</span>Balance
            </span>
          </Link>
          <Link href="/" style={s.backLink}>
            <ArrowLeft size={16} />
            Back to Calculator
          </Link>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.card}>
          <div style={s.subtitle}>Legal</div>
          <h1 style={s.title}>Privacy Policy</h1>

          <div style={s.highlight}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <Shield size={20} color="var(--sage-dark, #5A7A66)" />
              <strong style={{ fontSize: '0.95rem', color: 'var(--sage-dark, #5A7A66)' }}>Your Privacy is Our Priority</strong>
            </div>
            <p style={{ margin: 0, color: 'var(--sage-dark, #5A7A66)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              ByeByeBalance runs entirely in your browser. We don't collect, store, or see any of your financial information.
            </p>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>
              <Database size={20} color="var(--slate, #4A6FA5)" />
              What We Don't Collect
            </h2>
            <p style={s.paragraph}>
              We take a radically different approach to privacy. Here's what we <strong>don't</strong> do:
            </p>
            <ul style={s.list}>
              <li>No account creation or sign-ups required</li>
              <li>No personal information collected (name, email, phone, etc.)</li>
              <li>No financial data stored on our servers</li>
              <li>No tracking cookies or advertising pixels</li>
              <li>No selling or sharing of data (we don't have any!)</li>
              <li>No third-party analytics that track individuals</li>
            </ul>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>
              <Lock size={20} color="var(--slate, #4A6FA5)" />
              How Your Data Stays Private
            </h2>
            <p style={s.paragraph}>
              All calculations and data storage happen locally in your browser using "localStorage". This means:
            </p>
            <ul style={s.list}>
              <li>Your debt information never leaves your device</li>
              <li>We cannot see or access your financial data</li>
              <li>Clearing your browser data removes everything</li>
              <li>No backups exist on our servers</li>
              <li>Each browser/device maintains its own separate data</li>
            </ul>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>
              <Cookie size={20} color="var(--slate, #4A6FA5)" />
              Minimal Analytics
            </h2>
            <p style={s.paragraph}>
              We use privacy-focused analytics to understand general usage patterns:
            </p>
            <ul style={s.list}>
              <li>Page views and general traffic patterns</li>
              <li>General geographic location (country/state level)</li>
              <li>Device type (mobile/desktop)</li>
              <li>No personal identification or tracking across sites</li>
            </ul>
            <p style={s.paragraph}>
              This helps us improve the calculator and understand which features are most helpful. We specifically chose analytics providers that respect user privacy and don't track individuals.
            </p>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>
              <Mail size={20} color="var(--slate, #4A6FA5)" />
              When You Contact Us
            </h2>
            <p style={s.paragraph}>If you choose to contact us via email or submit feedback:</p>
            <ul style={s.list}>
              <li>We only use your contact information to respond to your inquiry</li>
              <li>We don't add you to any mailing lists without explicit consent</li>
              <li>We don't share your information with third parties</li>
              <li>You can request deletion of any correspondence at any time</li>
            </ul>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>Your Rights</h2>
            <p style={s.paragraph}>
              Since we don't collect personal data through the calculator, traditional data rights (access, deletion, portability) don't apply — there's simply nothing to access or delete on our servers. Your data exists only on your device, under your full control.
            </p>
            <p style={s.paragraph}>You can clear all calculator data at any time by:</p>
            <ul style={s.list}>
              <li>Using the "Reset All" button in the calculator</li>
              <li>Clearing your browser's localStorage</li>
              <li>Clearing your browser's cache and cookies</li>
            </ul>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>Changes to This Policy</h2>
            <p style={s.paragraph}>
              We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date. We will never make changes that reduce your privacy without clear notice.
            </p>
          </div>

          <div style={s.section}>
            <h2 style={s.sectionTitle}>Contact Us</h2>
            <p style={s.paragraph}>
              If you have questions about this privacy policy or how ByeByeBalance handles privacy, please contact us at:
            </p>
            <p style={s.paragraph}>
              <strong>Email:</strong> support@byebyebalance.com
            </p>
          </div>

          <div style={s.footer}>
            <p><strong>Last Updated:</strong> October 2025<br /><strong>Effective Date:</strong> October 2025</p>
            <p style={{ marginTop: '0.75rem', fontStyle: 'italic' }}>
              This privacy policy applies to the ByeByeBalance debt calculator located at byebyebalance.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
