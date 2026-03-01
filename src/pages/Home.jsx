import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      {/* ── Hero Section ── */}
      <div className="w-full bg-midnight-navy relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')" }}
        />
        <div className="relative px-6 py-20 lg:py-32 lg:px-40 flex flex-col items-center justify-center text-center gap-8 max-w-7xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-2 backdrop-blur-sm">
            <span className="mr-2">✨</span> Premium Placement Intelligence
          </div>
          <h1 className="text-warm-white text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-[-0.02em] max-w-4xl">
            Placement Readiness{' '}
            <br className="hidden md:block" />{' '}
            <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-normal leading-relaxed max-w-2xl font-sans">
            Empowering students, recruiters, and admins with elite data-driven insights for career
            success. Bridging the gap between potential and opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
            <Link to="/login">
              <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-primary hover:bg-primary-dark text-midnight-navy text-base font-bold leading-normal tracking-[0.015em] transition-all shadow-[0_0_20px_rgba(198,164,63,0.3)] font-sans w-full sm:w-auto">
                <span>Start Your Journey</span>
              </button>
            </Link>
            <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-transparent border border-slate-500 hover:border-white text-white text-base font-medium leading-normal tracking-[0.015em] transition-colors font-sans w-full sm:w-auto">
              <span>Watch Demo</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="w-full border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-40 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
            <div>
              <p className="text-3xl font-bold text-white font-serif">98%</p>
              <p className="text-slate-400 text-sm font-sans uppercase tracking-wider">Placement Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white font-serif">500+</p>
              <p className="text-slate-400 text-sm font-sans uppercase tracking-wider">Top Recruiters</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white font-serif">15k+</p>
              <p className="text-slate-400 text-sm font-sans uppercase tracking-wider">Students Placed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white font-serif">24/7</p>
              <p className="text-slate-400 text-sm font-sans uppercase tracking-wider">Support Access</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Role Based Section ── */}
      <div id="features" className="flex flex-col gap-10 px-6 lg:px-40 py-20 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-6 items-center text-center">
          <div className="flex flex-col gap-4">
            <h2 className="text-midnight-navy dark:text-white text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Tailored Solutions for Every Role
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg font-normal leading-normal max-w-2xl font-sans mx-auto">
              EvolvEd provides specialized tools to streamline the placement process for all
              stakeholders, ensuring no opportunity is missed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Student Card */}
          <div className="group flex flex-col gap-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-deep-teal group-hover:bg-primary transition-colors" />
            <div className="size-12 rounded-full bg-deep-teal/10 flex items-center justify-center text-deep-teal group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined !text-[28px]">school</span>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-midnight-navy dark:text-white text-xl font-bold leading-tight">For Students</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-sans">
                Track your readiness score, build a smart resume, and access personalized learning
                paths to land your dream job with confidence.
              </p>
            </div>
            <Link
              to="/student"
              className="mt-auto text-deep-teal font-semibold text-sm hover:text-primary flex items-center gap-1 font-sans group-hover:gap-2 transition-all"
            >
              Explore Student Features{' '}
              <span className="material-symbols-outlined !text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Recruiter Card */}
          <div className="group flex flex-col gap-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-deep-teal group-hover:bg-primary transition-colors" />
            <div className="size-12 rounded-full bg-deep-teal/10 flex items-center justify-center text-deep-teal group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined !text-[28px]">work</span>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-midnight-navy dark:text-white text-xl font-bold leading-tight">For Recruiters</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-sans">
                Discover top talent efficiently with advanced filtering, readiness analytics, and
                automated scheduling tools designed for precision hiring.
              </p>
            </div>
            <Link
              to="/recruiter"
              className="mt-auto text-deep-teal font-semibold text-sm hover:text-primary flex items-center gap-1 font-sans group-hover:gap-2 transition-all"
            >
              Explore Recruiter Features{' '}
              <span className="material-symbols-outlined !text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Admin Card */}
          <div className="group flex flex-col gap-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-deep-teal group-hover:bg-primary transition-colors" />
            <div className="size-12 rounded-full bg-deep-teal/10 flex items-center justify-center text-deep-teal group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined !text-[28px]">bar_chart</span>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-midnight-navy dark:text-white text-xl font-bold leading-tight">For Admins</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-sans">
                Gain comprehensive oversight of placement activities, generate detailed reports, and
                manage campus drives seamlessly from a single dashboard.
              </p>
            </div>
            <Link
              to="/admin"
              className="mt-auto text-deep-teal font-semibold text-sm hover:text-primary flex items-center gap-1 font-sans group-hover:gap-2 transition-all"
            >
              Explore Admin Features{' '}
              <span className="material-symbols-outlined !text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Feature Split Section ── */}
      <div className="w-full bg-slate-50 dark:bg-slate-900/50 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-40 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-deep-teal/20 rounded-full blur-2xl" />
            <img
              alt="Students collaborating in a modern library environment"
              className="relative rounded-2xl shadow-2xl w-full object-cover aspect-video"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAb_mZb1nBvB16l3ds42_Cv2bRFoT9L_yWUsK-r3GSqeuCTg7fFCtX9MPIQ2vIQm_m2Vwu39D_zMZkmnug_8VE3StDLwmX7kDZRuJUf8L5quEkoo6B0r7D7cSriVBPT4eFxW6LCKszGn9r7hnultUXkntzHr7qaINtPxPUlkpbeuVljZvtu8XVi_UkALgycHwxBTxHI3M_J4tdKaqbPmCpH0HfwrABgFX4eMK87v7W_Uy1wjHNC1CNtAPik2lCdlW16tKrYZAWPMMMJ"
            />
          </div>
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="inline-flex items-center rounded px-2 py-1 text-xs font-bold text-deep-teal bg-deep-teal/10 w-fit uppercase tracking-wider font-sans">
              Readiness Scoring
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-midnight-navy dark:text-white">
              Evaluate, Enhance, Evolve.
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-sans">
              Our proprietary AI-driven scoring system analyzes student performance across technical
              skills, aptitude, and soft skills to provide a comprehensive readiness index.
            </p>
            <ul className="flex flex-col gap-4 mt-2">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium font-sans">Real-time skill gap analysis</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium font-sans">Personalized improvement roadmaps</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium font-sans">Predictive placement success metrics</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── How It Works Section ── */}
      <div id="how-it-works" className="w-full bg-white dark:bg-background-dark py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-midnight-navy dark:text-white text-3xl md:text-4xl font-bold leading-tight tracking-[-0.015em] mb-4">
              How It Works
            </h2>
            <p className="text-slate-500 text-sm uppercase tracking-widest font-sans font-semibold">A Simple 3-Step Process</p>
          </div>
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 -translate-x-1/2 hidden md:block" />
            <div className="flex flex-col gap-12 md:gap-24 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 flex justify-center md:justify-end md:pr-12">
                  <div className="size-16 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-[0_0_0_8px_rgba(248,247,246,1)] dark:shadow-[0_0_0_8px_rgba(31,28,19,1)] z-10">
                    <span className="material-symbols-outlined text-primary !text-[32px]">assignment</span>
                  </div>
                </div>
                <div className="w-full md:w-1/2 md:pl-12 text-center md:text-left">
                  <h3 className="text-xl font-bold text-midnight-navy dark:text-white mb-2">1. Assess Readiness</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-sans max-w-xs mx-auto md:mx-0">
                    Students take comprehensive assessments to benchmark their current skill levels against industry standards.
                  </p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="w-full md:w-1/2 flex justify-center md:justify-start md:pl-12">
                  <div className="size-16 rounded-full bg-white border-2 border-deep-teal flex items-center justify-center shadow-[0_0_0_8px_rgba(248,247,246,1)] dark:shadow-[0_0_0_8px_rgba(31,28,19,1)] z-10">
                    <span className="material-symbols-outlined text-deep-teal !text-[32px]">person_add</span>
                  </div>
                </div>
                <div className="w-full md:w-1/2 md:pr-12 text-center md:text-right">
                  <h3 className="text-xl font-bold text-midnight-navy dark:text-white mb-2">2. Build Profile</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-sans max-w-xs mx-auto md:ml-auto md:mr-0">
                    Create a dynamic, data-backed profile that highlights strengths, projects, and verified achievements.
                  </p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 flex justify-center md:justify-end md:pr-12">
                  <div className="size-16 rounded-full bg-midnight-navy border-2 border-midnight-navy flex items-center justify-center shadow-[0_0_0_8px_rgba(248,247,246,1)] dark:shadow-[0_0_0_8px_rgba(31,28,19,1)] z-10">
                    <span className="material-symbols-outlined text-white !text-[32px]">rocket_launch</span>
                  </div>
                </div>
                <div className="w-full md:w-1/2 md:pl-12 text-center md:text-left">
                  <h3 className="text-xl font-bold text-midnight-navy dark:text-white mb-2">3. Connect &amp; Succeed</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-sans max-w-xs mx-auto md:mx-0">
                    Get matched with top recruiters, schedule interviews, and secure placements with ease.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA Section ── */}
      <div id="pricing" className="w-full px-6 py-20 lg:py-32 bg-background-light dark:bg-background-dark">
        <div className="max-w-5xl mx-auto rounded-3xl bg-midnight-navy relative overflow-hidden px-6 py-16 md:px-16 text-center shadow-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1974&auto=format&fit=crop')" }}
          />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col items-center gap-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Ready to Transform Your Placement Process?
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl font-sans">
              Join over 500+ institutions and companies using EvolvEd to bridge the talent gap.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <button className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary hover:bg-primary-dark text-midnight-navy text-base font-bold leading-normal tracking-[0.015em] font-sans shadow-lg transition-all">
                  Get Started Now
                </button>
              </Link>
              <button className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-transparent border border-white/30 hover:bg-white/10 text-white text-base font-medium leading-normal tracking-[0.015em] font-sans transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
