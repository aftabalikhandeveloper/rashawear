'use client';

import Link from 'next/link';
import Image from "next/image";
import { Globe, Mail, MessageCircle, Tv } from 'lucide-react';

const FOOTER_LINKS = {
  'Shop': [
    { label: 'Men', href: '/collections/men' },
    { label: 'Women', href: '/collections/women' },
    { label: 'Accessories', href: '/collections/accessories-2' },
    { label: 'All Products', href: '/collections/all' },
  ],
  'Help': [
    { label: 'Customer Service', href: '#' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'Returns & Exchanges', href: '#' },
    { label: 'Shipping Info', href: '#' },
  ],
  'About': [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
             <Link href="/" className="flex items-center gap-2">
              <Image
                src="/rashawear_logo_svg.svg"
                alt="Rashawear Logo"
                width={200}
                height={50}
                // in mobile i want a litte gap from top

                className="rounded-full sm:pt-2"
              />
             
            </Link>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Premium fashion for everyone. Quality clothing that speaks your style.
            </p>
            <div className="flex gap-3">
              {[Globe, Mail, MessageCircle, Tv].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-gray-200 hover:bg-black hover:text-white flex items-center justify-center transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-black transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Rashawear. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-gray-400 hover:text-gray-600">Privacy Policy</Link>
            <Link href="#" className="text-xs text-gray-400 hover:text-gray-600">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
