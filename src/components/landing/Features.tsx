import {
  BarChart3,
  Users,
  CreditCard,
  AlertTriangle,
  Clock,
  FileText,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Banking Dashboard",
    description:
      "Real-time financial metrics, balance sheets, P&L statements, and key performance ratios — all calculated from your actual simulation data.",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    icon: Users,
    title: "Workforce Management",
    description:
      "Hire humans or deploy AI agents for each role. Each choice has trade-offs in cost, accuracy, customer satisfaction, and risk.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: CreditCard,
    title: "Loan & Credit",
    description:
      "Approve or reject loan applications. Set interest rates, assess credit risk, and manage your non-performing loan portfolio.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: AlertTriangle,
    title: "Crisis Management",
    description:
      "Navigate bank runs, cyberattacks, recessions, and fraud. Each crisis demands quick decisions with lasting consequences.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Clock,
    title: "Quarterly Simulation",
    description:
      "Turn-based strategic gameplay. Review performance, make decisions, allocate resources, and advance through simulated years.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: FileText,
    title: "Management Reports",
    description:
      "Comprehensive financial, workforce, risk, and performance reports. Export as PDF or CSV for analysis.",
    gradient: "from-pink-500 to-rose-500",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-blue-500 mb-2 tracking-wide uppercase">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Run a Bank
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From financial operations to workforce management, BANKVERSE
            simulates the full complexity of commercial banking.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-card rounded-xl border border-border p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200 hover:-translate-y-0.5"
            >
              <div
                className={`inline-flex items-center justify-center size-11 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}
              >
                <feature.icon className="size-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
