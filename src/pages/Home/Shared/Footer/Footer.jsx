import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight, Download } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'About Us', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Terms of Use', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Blog', href: '#' },
  ];

  const companyLinks = [
    { label: 'Business Terms', href: '#' },
    { label: 'Refund Policy', href: '#' },
    { label: 'Shipping Info', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Partners', href: '#' },
  ];

  const supportLinks = [
    { label: 'Help Center', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'Community', href: '#' },
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#' },
    { icon: Twitter, label: 'Twitter', href: '#' },
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
  ];

  return (
    <footer className="mt-16 w-full border-t-2 border-slate-700 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-16 text-slate-100 sm:mt-20 sm:pt-20">
      {/* CTA Section */}
      <div className="app-container pb-16 sm:pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 sm:px-8 md:px-12 py-8 sm:py-12 md:py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    Join 950K+ Users Today
                  </h2>
                  <p className="text-lg text-gray-800 mb-2">
                    Start managing your vehicle information securely with ProFast QR Tag System
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 md:justify-end">
                  <button className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gray-900 text-yellow-400 font-bold rounded-lg hover:bg-gray-800 transition transform hover:scale-105">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="app-container py-12 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 mb-12 sm:mb-16">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">
                Pro<span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">Fast</span>
              </h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Secure vehicle information management through innovative QR technology for modern India.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4">
                {socialLinks.map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={idx}
                      href={social.href}
                      aria-label={social.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 transition hover:scale-110 hover:bg-yellow-500"
                    >
                      <Icon className="w-5 h-5 text-yellow-400" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-yellow-400 transition inline-flex items-center group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2 group-hover:translate-x-1 transition"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Company</h3>
              <ul className="space-y-3">
                {companyLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-yellow-400 transition inline-flex items-center group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2 group-hover:translate-x-1 transition"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Support</h3>
              <ul className="space-y-3">
                {supportLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-yellow-400 transition inline-flex items-center group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-2 group-hover:translate-x-1 transition"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <a href="tel:+8801581400986" className="flex items-start gap-3 text-sm text-slate-400 hover:text-yellow-400 transition group">
                  <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:text-yellow-400" />
                  <span>+880 1581 400 986</span>
                </a>
                <a href="mailto:hello@profast.com" className="flex items-start gap-3 text-sm text-slate-400 hover:text-yellow-400 transition group">
                  <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:text-yellow-400" />
                  <span>hello@profast.com</span>
                </a>
                <div className="flex items-start gap-3 text-sm text-slate-400 hover:text-yellow-400 transition group">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 group-hover:text-yellow-400" />
                  <div>
                    <div>Dhaka 1200</div>
                    <div>Bangladesh</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8"></div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-sm text-slate-400 text-center md:text-left">
              <p>© {currentYear} ProFast QR Tag System. All rights reserved.</p>
              <p className="mt-2">ProFast Pvt. Ltd. | Secure Vehicle Information Management</p>
            </div>

            {/* Download Buttons */}
           
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;