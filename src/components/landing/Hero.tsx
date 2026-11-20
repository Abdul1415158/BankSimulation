"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  Bot,
  DollarSign,
} from "lucide-react";

const stats = [
  { label: "Total Assets", value: 2400000000, prefix: "$", suffix: "B", icon: DollarSign, format: (v: number) => `$${(v / 1e9).toFixed(1)}B` },
  { label: "Net Profit", value: 45000000, prefix: "$", suffix: "M", icon: TrendingUp, format: (v: number) => `$${(v / 1e6).toFixed(0)}M` },
  { label: "Employees", value: 234, prefix: "", suffix: "", icon: Users, format: (v: number) => v.toString() },
  { label: "AI Agents", value: 12, prefix: "", suffix: "", icon: Bot, format: (v: number) => v.toString() },
];

function AnimatedCounter({ target, format }: { target: number; format: (v: number) => string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(Math.floor(increment * step));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return <span className="font-mono-numbers">{format(current)}</span>;
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">
      {/* Banking Background Image with Atmospheric Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=85')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#060b17]/95 via-[#0a1226]/85 to-[#0b1b3a]/90 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 4 + 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-white space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-sm text-white/80">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Banking Simulation Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Your Bank.{" "}
              <span className="gradient-text">Your Decisions.</span>{" "}
              Your Future.
            </h1>

            <p className="text-lg text-white/70 max-w-lg leading-relaxed">
              Experience the challenges of running a commercial bank. Make
              strategic financial decisions, manage employees, embrace AI, and
              survive changing economic conditions.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold border-0 h-12 px-8 text-base shadow-lg shadow-blue-500/25"
              >
                <Link href="/register">Get Started</Link>
              </Button>
              <Button
                size="lg"
                asChild
                className="bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md h-12 px-8 text-base font-semibold transition-all"
              >
                <a href="#features">Explore</a>
              </Button>
            </div>
          </div>

          {/* Right preview card */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Dashboard Preview</p>
                    <p className="text-white font-semibold text-lg">
                      Meridian National Bank
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    Year 3, Q2
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white/5 rounded-xl p-3 border border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <stat.icon className="size-3.5 text-cyan-400" />
                        <span className="text-white/50 text-xs">
                          {stat.label}
                        </span>
                      </div>
                      <p className="text-white font-semibold text-lg">
                        <AnimatedCounter
                          target={stat.value}
                          format={stat.format}
                        />
                      </p>
                    </div>
                  ))}
                </div>

                {/* Mini chart placeholder */}
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-white/50 text-xs mb-2">Profit Trend</p>
                  <div className="flex items-end gap-1 h-16">
                    {[40, 55, 45, 65, 50, 70, 60, 80, 75, 90, 85, 95].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-sm opacity-80"
                          style={{
                            height: `${h}%`,
                            animation: `counter 0.6s ease-out forwards`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
