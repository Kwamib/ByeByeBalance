'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Github, Twitter } from 'lucide-react';

function Contact() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    window.scrollTo(0, 0);
    document.title = 'Contact - ByeByeBalance';
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
    sectionTitle: {
      fontFamily: "var(--font-display, 'Cormorant Garamond', Georgia, serif)",
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      fontWeight: 600,
      marginBottom: '1.25rem',
      color: 'var(--text-primary, #1A2626)',
      letterSpacing: '-0.2px',
    },
    contactItem: {
      marginBottom: '1rem',
      padding: '1.25rem',
      background: 'var(--bg, #F5F2EC)',
      border: '1px solid var(--border, #D8D3C8)',
      borderRadius: 6,
    },
    contactItemTitle: {
      fontSize: '1rem',
      fontWeight: 600,
      color: 'var(--text-primary, #1A2626)',
      marginBottom: '0.35rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    contactItemDesc: {
      fontSize: '0.82rem',
      color: 'var(--text-muted, #8A9A9A)',
      lineHeight: 1.5,
      marginBottom: '0.75rem',
    },
    contactLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      color: 'var(--slate, #4A6FA5)',
      textDecoration: 'none',
      fontWeight: 600,
      fontSize: '0.82rem',
    },
    aboutSection: {
      background: 'var(--success-light, rgba(90,122,102,0.12))',
      borderRadius: 6,
      padding: '1.5rem',
      marginTop: '2rem',
      border: '1px solid var(--border, #D8D3C8)',
      borderLeft: '3px solid var(--sage, #7A9E87)',
    },
    footer: {
      marginTop: '2rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid var(--border, #D8D3C8)',
      textAlign: 'center',
      color: 'var(--text-muted, #8A9A9A)',
      fontSize: '0.78rem',
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
          <div style={s.subtitle}>Get in Touch</div>
          <h1 style={s.title}>Contact</h1>

          <div style={{ marginTop: '1.5rem' }}>
            {/* Feature Requests */}
            <div style={s.contactItem}>
              <h3 style={s.contactItemTitle}>💡 Feature Requests</h3>
              <p style={s.contactItemDesc}>Have an idea to make ByeByeBalance better?</p>
              <a href="https://forms.gle/3q4UdFGtA8zi5JdY9" target="_blank" rel="noopener noreferrer" style={s.contactLink}>
                Submit Feature Request <ExternalLink size={14} />
              </a>
            </div>

            {/* Bug Reports */}
            <div style={s.contactItem}>
              <h3 style={s.contactItemTitle}>🐛 Found a Bug?</h3>
              <p style={s.contactItemDesc}>Let us know so we can fix it</p>
              <a href="https://github.com/Kwamib/ByeByeBalance/issues" target="_blank" rel="noopener noreferrer" style={s.contactLink}>
                Report Bug on GitHub <ExternalLink size={14} />
              </a>
            </div>

            {/* Follow Updates */}
            <div style={s.contactItem}>
              <h3 style={s.contactItemTitle}>📣 Follow Updates</h3>
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="https://github.com/Kwamib/ByeByeBalance" target="_blank" rel="noopener noreferrer" style={s.contactLink}>
                  <Github size={16} /> GitHub
                </a>
              </div>
            </div>
          </div>

          {/* About */}
          <div style={s.aboutSection}>
            <h2 style={{ ...s.sectionTitle, color: 'var(--sage-dark, #5A7A66)', marginBottom: '0.75rem', fontSize: '1.25rem' }}>About</h2>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--sage-dark, #5A7A66)', margin: '0.4rem 0' }}>
              ByeByeBalance was created to help people visualize their path to becoming debt-free. It's a free tool that respects your privacy and requires no sign-up.
            </p>
          </div>

          <div style={s.footer}>
            <p>No spam, no data selling, just helpful tools for the debt-free community</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
