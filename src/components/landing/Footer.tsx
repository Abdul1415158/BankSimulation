import Link from "next/link";
import { Landmark } from "lucide-react";

const links = {
  Product: [
    { label: "Home", href: "/" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Simulator", href: "#simulator" },
  ],
  Simulation: [
    { label: "Banking Dashboard", href: "/register" },
    { label: "Workforce", href: "/register" },
    { label: "Loans & Credit", href: "/register" },
    { label: "Reports", href: "/register" },
  ],
  Resources: [
    { label: "FAQ", href: "#about" },
    { label: "Documentation", href: "#" },
    { label: "Banking Concepts", href: "#" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Contact", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#0a0e1a] text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Landmark className="size-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">BANKVERSE</span>
            </div>
            <p className="text-sm leading-relaxed">
              Build your bank. Manage your people. Survive the market.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} BANKVERSE. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Built for banking education. No real financial transactions.
          </p>
        </div>
      </div>
    </footer>
  );
}
