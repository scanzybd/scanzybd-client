import React from 'react';
import ProFastLogo from '../Logo/ProFastLogo';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-24 pb-10 px-6 relative">

  {/* <!-- CTA BOX --> */}
  <div className="max-w-5xl mx-auto bg-yellow-300 text-gray-900 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 absolute left-1/2 -top-16 -translate-x-1/2 shadow-lg">
    
    <div>
      <h2 className="text-xl md:text-2xl font-semibold">
        950,000 Registered User in Bangladesh.
      </h2>
      <p className="mt-1">Join the Revolution today !</p>
    </div>

    <button className="btn bg-black text-white hover:bg-gray-800 border-none">
      Shop Now
    </button>
  </div>

  {/* <!-- FOOTER CONTENT --> */}
  <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10 mt-16">

    {/* <!-- Logo + Info --> */}
    <div>
      <h2 className="text-2xl font-bold mb-3">
        QR<span className="text-yellow-300">TAG</span>
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        © 2026 QRTAG.<br />
        All rights reserved.<br />
        QRTAG Pvt Ltd
      </p>

      {/* <!-- Social --> */}
      <div className="flex gap-4 text-gray-400 text-lg">
        <span>🐦</span>
        <span>📘</span>
        <span>📸</span>
        <span>▶️</span>
      </div>
    </div>

    {/* <!-- Contact --> */}
    <div>
      <h3 className="font-semibold mb-3">Get in Touch</h3>
      <ul className="text-sm text-gray-400 space-y-2">
        <li>Dhaka 1200</li>
        <li>Bangladesh</li>
        <li>hello@qrtag.com</li>
        <li>+880 1581 400 986</li>
      </ul>
    </div>

    {/* <!-- Learn More --> */}
    <div>
      <h3 className="font-semibold mb-3">Learn More</h3>
      <ul className="text-sm text-gray-400 space-y-2">
        <li className="hover:text-yellow-300 cursor-pointer">About Us</li>
        <li className="hover:text-yellow-300 cursor-pointer">Contact</li>
        <li className="hover:text-yellow-300 cursor-pointer">Terms of Use</li>
        <li className="hover:text-yellow-300 cursor-pointer">Privacy Policy</li>
        <li className="hover:text-yellow-300 cursor-pointer">Franchise Management</li>
      </ul>
    </div>

    {/* <!-- Company --> */}
    <div>
      <h3 className="font-semibold mb-3">Company</h3>
      <ul className="text-sm text-gray-400 space-y-2">
        <li className="hover:text-yellow-300 cursor-pointer">Business Terms</li>
        <li className="hover:text-yellow-300 cursor-pointer">Refund</li>
        <li className="hover:text-yellow-300 cursor-pointer">Shipping</li>
      </ul>

      {/* <!-- Buttons --> */}
      <div className="mt-4 flex flex-col gap-2">
        <button className="btn btn-sm bg-yellow-300 text-black border-none">
          Download Brochure
        </button>
        <div className="flex gap-2">
          <button className="btn btn-xs bg-black text-white border-none">
            Google Play
          </button>
          <button className="btn btn-xs bg-black text-white border-none">
            App Store
          </button>
        </div>
      </div>
    </div>

  </div>

</footer>
  );
};

export default Footer;