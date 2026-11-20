import { Building2, Settings, Zap, TrendingUp } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Building2,
    title: "Create Your Bank",
    description:
      "Choose your country, bank type, difficulty level, and starting capital. Name your bank and define your strategy.",
  },
  {
    number: 2,
    icon: Settings,
    title: "Make Decisions",
    description:
      "Set deposit and loan rates, approve credit applications, hire staff or deploy AI, and allocate department budgets.",
  },
  {
    number: 3,
    icon: Zap,
    title: "Face Challenges",
    description:
      "Navigate economic recessions, cyberattacks, employee resignations, bank runs, and regulatory inspections.",
  },
  {
    number: 4,
    icon: TrendingUp,
    title: "Grow & Report",
    description:
      "Track your performance with comprehensive reports. Compete against three AI-driven rival banks in the market.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-blue-500 mb-2 tracking-wide uppercase">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            From Setup to Success in Four Steps
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            BANKVERSE guides you through the complete banking management
            experience with an intuitive turn-based simulation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200" />

          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              {/* Number badge */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="size-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <step.icon className="size-6 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 size-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                  {step.number}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
