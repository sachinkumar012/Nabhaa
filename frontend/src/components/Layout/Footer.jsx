import React from 'react';
import { 
  Stethoscope, Phone, Mail, MapPin, 
  Facebook, Twitter, Instagram, ChevronRight 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white pt-16 pb-6 mt-12 border-t mt-auto shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Footer Top - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand Section */}
          <div className="flex flex-col space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#3B82F6] to-[#0EA5E9] p-2.5 rounded-xl shadow-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Nabha Healthcare</h2>
            </div>
            <p className="text-[#38BDF8] font-semibold tracking-wide text-sm">
              Accessible healthcare for everyone
            </p>
            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-sm">
              Empowering rural communities with digital health solutions, seamlessly connecting patients, doctors, and pharmacies.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:bg-[#3B82F6] hover:text-white hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:bg-[#3B82F6] hover:text-white hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#94A3B8] hover:bg-[#E1306C] hover:text-white hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(225,48,108,0.5)] transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col space-y-5">
            <h3 className="text-lg font-bold text-white relative inline-block pb-2">
              Quick Links
              <span className="absolute bottom-0 left-0 w-10 h-1 bg-[#3B82F6] rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'Doctors', path: '/doctors' },
                { name: 'Hospitals', path: '/hospitals' },
                { name: 'Pharmacy', path: '/pharmacy' },
                { name: 'Symptom Checker', path: '/symptoms' },
                { name: 'Health Blog', path: '/health-blog' },
                { name: 'About', path: '/about' }
              ].map((link, idx) => (
                <li key={idx}>
                  <a href={link.path} className="group flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors text-sm font-medium">
                    <ChevronRight className="w-3.5 h-3.5 text-[#3B82F6] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    <span className="group-hover:translate-x-1 transition-transform">{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="flex flex-col space-y-5">
            <h3 className="text-lg font-bold text-white relative inline-block pb-2">
              Our Services
              <span className="absolute bottom-0 left-0 w-10 h-1 bg-[#3B82F6] rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'Medicine Delivery', path: '/pharmacy' },
                { name: 'Lab Tests', path: '/lab-tests' },
                { name: 'ABHA Creation', path: '/abha' },
                { name: 'Insurance Info', path: '/insurance' },
                { name: 'Partner Portal', path: '/pharmacist/login', highlight: true }
              ].map((svc, idx) => (
                <li key={idx}>
                  <a href={svc.path} className={`group flex items-center gap-2 transition-colors text-sm font-medium ${svc.highlight ? "text-[#0EA5E9] hover:text-[#38BDF8]" : "text-[#94A3B8] hover:text-white"}`}>
                    <ChevronRight className={`w-3.5 h-3.5 ${svc.highlight ? "text-[#0EA5E9]" : "text-[#3B82F6]"} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                    <span className="group-hover:translate-x-1 transition-transform">{svc.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Details */}
          <div className="flex flex-col space-y-5">
            <h3 className="text-lg font-bold text-white relative inline-block pb-2">
              Contact Us
              <span className="absolute bottom-0 left-0 w-10 h-1 bg-[#3B82F6] rounded-full"></span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#3B82F6] transition-colors">
                  <MapPin className="w-4 h-4 text-[#38BDF8] group-hover:text-white transition-colors" />
                </div>
                <p className="text-[#94A3B8] text-sm leading-relaxed mt-1 group-hover:text-white transition-colors">
                  Lt Gen Shivdev Singh Civil Hospital,<br/>Nabha, Punjab, India
                </p>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#3B82F6] transition-colors">
                  <Phone className="w-4 h-4 text-[#38BDF8] group-hover:text-white transition-colors" />
                </div>
                <a href="tel:+919318496221" className="text-[#94A3B8] text-sm font-medium group-hover:text-white transition-colors">
                  +91 9318496221
                </a>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#3B82F6] transition-colors">
                  <Mail className="w-4 h-4 text-[#38BDF8] group-hover:text-white transition-colors" />
                </div>
                <a href="mailto:in.nabhahealthcare@gmail.com" className="text-[#94A3B8] text-sm font-medium group-hover:text-white transition-colors">
                  in.nabhahealthcare@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Line */}
        <div className="border-t border-white/10 pt-6 mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#64748B] text-xs sm:text-sm text-center md:text-left">
            © {new Date().getFullYear()} Nabha Healthcare. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[#64748B] text-xs font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}