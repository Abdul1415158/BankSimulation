import Link from "next/link";
import { Landmark, Shield, Bot, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Shield,
    text: "Create and manage up to 3 independent bank simulations",
  },
  {
    icon: Bot,
    text: "Compare human employees vs AI agents in real scenarios",
  },
  {
    icon: TrendingUp,
    text: "Track your performance with comprehensive management reports",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-slate-950">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1800&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-blue-950/90 backdrop-blur-[1px]" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <Landmark className="size-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">BANKVERSE</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Build Your Bank.
              <br />
              <span className="gradient-text">Manage Your People.</span>
              <br />
              Survive the Market.
            </h2>
            <p className="text-white/60 max-w-md">
              The most comprehensive commercial banking simulation platform.
              Learn banking by doing banking.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <f.icon className="size-4 text-cyan-400" />
                </div>
                <span className="text-sm text-white/80">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/30">
          &copy; {new Date().getFullYear()} BANKVERSE. Educational simulation
          platform.
        </p>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Landmark className="size-4 text-white" />
            </div>
            <span className="text-lg font-bold">BANKVERSE</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
