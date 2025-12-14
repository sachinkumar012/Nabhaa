import { Stethoscope, Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <div className="flex items-center space-x-2" style={{ marginBottom: '1rem' }}>
              <div className="logo-icon">
                <Stethoscope size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Nabha Healthcare</span>
            </div>
            <p style={{ marginBottom: '1rem' }}>
              {t('missionText')}
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com/nabhahealthcare" 
                className="social-icon facebook"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://twitter.com/nabhahealthcare" 
                className="social-icon twitter"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://instagram.com/nabhahealthcare" 
                className="social-icon instagram"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><a href="/doctors">{t('doctors')}</a></li>
              <li><a href="/records">{t('records')}</a></li>
              <li><a href="/pharmacy">{t('pharmacy')}</a></li>
              <li><a href="/symptoms">{t('symptoms')}</a></li>
              <li><a href="/about">{t('about')}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3>Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin size={16} style={{ color: 'var(--primary-400)' }} />
                <span>Nabha, Punjab, India</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} style={{ color: 'var(--primary-400)' }} />
                <span>+91 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} style={{ color: 'var(--primary-400)' }} />
                <span>contact@nabhahealthcare.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 Nabha Healthcare Solution. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}