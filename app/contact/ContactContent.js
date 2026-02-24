'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Bug, ArrowLeft, Sparkles, Heart, ExternalLink, Github, Twitter } from 'lucide-react';

function Contact() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    window.scrollTo(0, 0);
    document.title = 'Contact - ByeByeBalance';
    
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
      marginBottom: '1.5rem',
      color: '#212529',
    },
    contactItem: {
      marginBottom: '2rem',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
      border: '2px solid #e9ecef',
      borderRadius: '16px',
      transition: 'all 0.3s ease',
    },
    contactItemTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#212529',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    contactItemDescription: {
      fontSize: '0.875rem',
      color: '#6c757d',
      lineHeight: '1.5',
      marginBottom: '1rem',
    },
    contactLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '0.875rem',
      transition: 'all 0.2s',
    },
    aboutSection: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      borderRadius: '16px',
      padding: '2rem',
      marginTop: '2rem',
      border: '2px solid #86efac',
    },
    aboutText: {
      fontSize: '1rem',
      lineHeight: '1.8',
      color: '#059669',
      margin: '0.5rem 0',
    },
    followList: {
      listStyle: 'none',
      padding: 0,
      margin: '1rem 0',
    },
    followItem: {
      padding: '0.5rem 0',
      fontSize: '0.9rem',
      color: '#495057',
    },
    footer: {
      marginTop: '2rem',
      paddingTop: '2rem',
      borderTop: '2px solid #e9ecef',
      textAlign: 'center',
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
          <h1 style={styles.title}>Contact</h1>
          
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Get in Touch</h2>
            
            {/* Feature Requests */}
            <div style={styles.contactItem}>
              <h3 style={styles.contactItemTitle}>
                💡 Feature Requests
              </h3>
              <p style={styles.contactItemDescription}>
                Have an idea to make ByeByeBalance better?
              </p>
              <a 
                href="https://forms.gle/3q4UdFGtA8zi5JdY9"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.contactLink}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
              >
                Submit Feature Request
                <ExternalLink size={16} />
              </a>
            </div>

            {/* Bug Reports */}
            <div style={styles.contactItem}>
              <h3 style={styles.contactItemTitle}>
                🐛 Found a Bug?
              </h3>
              <p style={styles.contactItemDescription}>
                Let us know so we can fix it
              </p>
              <a 
                href="https://github.com/yourusername/byebyebalance/issues"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.contactLink}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
              >
                Report Bug on GitHub
                <ExternalLink size={16} />
              </a>
            </div>

            {/* Follow Updates */}
            <div style={styles.contactItem}>
              <h3 style={styles.contactItemTitle}>
                📣 Follow Updates
              </h3>
              <ul style={styles.followList}>
                <li style={styles.followItem}>
                  <a 
                    href="https://github.com/yourusername/byebyebalance"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...styles.contactLink, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Github size={18} />
                    GitHub: your-github-link
                  </a>
                </li>
                <li style={styles.followItem}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#6c757d' }}>
                    <Twitter size={18} />
                    Twitter: @byebyebalance (coming soon)
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* About Section */}
          <div style={styles.aboutSection}>
            <h2 style={{ ...styles.sectionTitle, color: '#047857', marginBottom: '1rem' }}>About</h2>
            <p style={styles.aboutText}>
              ByeByeBalance was created to help people visualize their path to becoming debt-free. 
              It's a free tool that respects your privacy and requires no sign-up.
            </p>
            <p style={{ ...styles.aboutText, marginTop: '1.5rem', marginBottom: 0, textAlign: 'center' }}>
              Built with ❤️ by Your Name/Handle
            </p>
          </div>

          <div style={styles.footer}>
            <p>
              <span style={{ fontSize: '0.75rem' }}>
                No spam, no data selling, just helpful tools for the debt-free community
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;