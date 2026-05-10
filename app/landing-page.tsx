'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style jsx>{`
        /* Page Background */
        .page-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #FFF9F0 0%, #FEF3E2 50%, #FFF5E6 100%);
          position: relative;
          overflow-x: hidden;
        }

        /* Decorative elements */
        .page-bg::before {
          content: '';
          position: absolute;
          top: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%);
          border-radius: 50%;
        }

        .page-bg::after {
          content: '';
          position: absolute;
          bottom: -50px;
          left: -50px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, transparent 70%);
          border-radius: 50%;
        }

        /* Floating shapes */
        .floating-shape {
          position: absolute;
          animation: float 6s ease-in-out infinite;
          opacity: 0.6;
        }

        .shape-1 { top: 15%; left: 8%; animation-delay: 0s; }
        .shape-2 { top: 25%; right: 12%; animation-delay: -1s; }
        .shape-3 { bottom: 20%; left: 15%; animation-delay: -2s; }
        .shape-4 { bottom: 30%; right: 8%; animation-delay: -3s; }

        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        /* Owl container glow */
        .owl-container {
          position: relative;
        }

        .owl-container::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.5; }
        }

        /* Glass effect */
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        /* Gradient text */
        .gradient-text {
          background: linear-gradient(135deg, #1E3A5F 0%, #2D5A87 50%, #1E3A5F 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        /* Button styles */
        .btn-primary {
          background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
          color: white;
          padding: 12px 28px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
        }

        .btn-secondary {
          background: white;
          color: #1E3A5F;
          padding: 12px 28px;
          border-radius: 12px;
          font-weight: 600;
          border: 2px solid #E5E7EB;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          border-color: #22C55E;
          color: #22C55E;
        }

        /* Feature cards */
        .feature-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
        }

        /* Animated border */
        .animated-border {
          position: relative;
          background: white;
          border-radius: 20px;
          overflow: hidden;
        }

        .animated-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 2px;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(34, 197, 94, 0.3), rgba(245, 158, 11, 0.3));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: borderRotate 4s linear infinite;
        }

        @keyframes borderRotate {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        /* Fade in animation */
        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeIn 0.6s ease forwards;
        }

        .fade-in:nth-child(1) { animation-delay: 0.1s; }
        .fade-in:nth-child(2) { animation-delay: 0.2s; }
        .fade-in:nth-child(3) { animation-delay: 0.3s; }
        .fade-in:nth-child(4) { animation-delay: 0.4s; }
        .fade-in:nth-child(5) { animation-delay: 0.5s; }

        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Stats */
        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        /* Testimonial card */
        .testimonial-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      <div className="page-bg">
        {/* Floating decorative shapes */}
        <div className="floating-shape shape-1">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>
        <div className="floating-shape shape-2">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <rect x="5" y="5" width="20" height="20" rx="4" stroke="#22C55E" strokeWidth="2" />
          </svg>
        </div>
        <div className="floating-shape shape-3">
          <svg width="35" height="35" viewBox="0 0 35 35" fill="none">
            <polygon points="17.5,0 35,30 0,30" stroke="#1E3A5F" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div className="floating-shape shape-4">
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none">
            <circle cx="12.5" cy="12.5" r="10" fill="#22C55E" opacity="0.2" />
          </svg>
        </div>

        {/* Navigation */}
        <nav className="relative z-20 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/owl-mascot.png" alt="TeachWise" className="w-12 h-12" />
              <span className="text-xl font-bold gradient-text">TeachWise AI</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium">How It Works</a>
              <Link href="/chat" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative z-10 px-6 py-20 md:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Text */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium fade-in">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Trusted by 2,500+ Australian Teachers
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight fade-in" style={{ animationDelay: '0.1s' }}>
                  <span className="gradient-text">Your AI Teaching</span>
                  <br />
                  <span className="text-slate-700">Assistant for</span>
                  <br />
                  <span className="bg-gradient-to-r from-amber-500 to-green-500 bg-clip-text text-transparent">Australian F-6</span>
                </h1>

                <p className="text-lg text-slate-600 leading-relaxed fade-in" style={{ animationDelay: '0.2s' }}>
                  Generate AC9-aligned lesson plans, rubrics, assessments, and teaching resources in seconds. 
                  Let AI handle the paperwork so you can focus on what matters — teaching.
                </p>

                <div className="flex flex-wrap gap-4 fade-in" style={{ animationDelay: '0.3s' }}>
                  <Link href="/chat" className="btn-primary inline-flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Free — No Credit Card
                  </Link>
                  <Link href="/planner" className="btn-secondary inline-flex items-center gap-2">
                    See How It Works
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-6 pt-4 fade-in" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-slate-600">AC9 Aligned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-600">No Setup Required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-sm text-slate-600">Australian Data</span>
                  </div>
                </div>
              </div>

              {/* Right side - Owl Mascot */}
              <div className="flex justify-center lg:justify-end">
                <div className="owl-container relative">
                  <img 
                    src="/owl-mascot.png" 
                    alt="TeachWise AI Owl Mascot" 
                    className="w-80 h-80 md:w-96 md:h-96 object-contain relative z-10"
                  />
                  {/* Sparkles around owl */}
                  <div className="absolute top-10 right-10 animate-pulse">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#F59E0B">
                      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-20 left-0 animate-pulse" style={{ animationDelay: '0.5s' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#22C55E">
                      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                    </svg>
                  </div>
                  <div className="absolute top-1/3 right-0 animate-pulse" style={{ animationDelay: '1s' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#8B5CF6">
                      <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-10 px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="animated-border p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center fade-in">
                  <div className="stat-number">2,500+</div>
                  <div className="text-slate-600 text-sm mt-1">Australian Teachers</div>
                </div>
                <div className="text-center fade-in">
                  <div className="stat-number">50k+</div>
                  <div className="text-slate-600 text-sm mt-1">Lesson Plans Created</div>
                </div>
                <div className="text-center fade-in">
                  <div className="stat-number">100%</div>
                  <div className="text-slate-600 text-sm mt-1">AC9 Aligned</div>
                </div>
                <div className="text-center fade-in">
                  <div className="stat-number">4.9</div>
                  <div className="text-slate-600 text-sm mt-1">Teacher Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative z-10 px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
                Everything a teacher needs, powered by AI
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                From lesson planning to assessment, TeachWise handles the time-consuming tasks so you can focus on your students.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="feature-card fade-in">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Lesson Planner</h3>
                <p className="text-slate-600">Generate AC9-aligned lesson plans with differentiated activities, assessments, and resources in under 60 seconds.</p>
              </div>

              {/* Feature 2 */}
              <div className="feature-card fade-in">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Auto-Marking</h3>
                <p className="text-slate-600">Upload student work and get instant, detailed feedback with rubric alignment and improvement suggestions.</p>
              </div>

              {/* Feature 3 */}
              <div className="feature-card fade-in">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Unit Library</h3>
                <p className="text-slate-600">Browse and customise 100s of pre-built units covering all learning areas and year levels.</p>
              </div>

              {/* Feature 4 */}
              <div className="feature-card fade-in">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Rubric Generator</h3>
                <p className="text-slate-600">Create detailed assessment rubrics with clear success criteria and rubrics aligned to AC9 standards.</p>
              </div>

              {/* Feature 5 */}
              <div className="feature-card fade-in">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">AI Chat Assistant</h3>
                <p className="text-slate-600">Ask any teaching question and get instant, curriculum-aligned answers and resource suggestions.</p>
              </div>

              {/* Feature 6 */}
              <div className="feature-card fade-in">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Worksheet Generator</h3>
                <p className="text-slate-600">Create differentiated worksheets, activities, and assessments for any topic and year level.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="relative z-10 px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
                Three steps to better lessons
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center fade-in">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-amber-600">1</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Choose your tool</h3>
                <p className="text-slate-600">Select from lesson planner, rubric generator, auto-marking, or chat with your specific needs.</p>
              </div>
              <div className="text-center fade-in">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-600">2</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Enter your requirements</h3>
                <p className="text-slate-600">Tell us the topic, year level, and any specific details. Our AI handles the rest.</p>
              </div>
              <div className="text-center fade-in">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">3</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Get instant results</h3>
                <p className="text-slate-600">Receive AC9-aligned resources ready to use or customise for your classroom.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="animated-border p-12 md:p-16 text-center">
              <div className="mb-6">
                <img src="/owl-mascot.png" alt="TeachWise" className="w-24 h-24 mx-auto" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
                Ready to transform your teaching?
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                Join 2,500+ Australian teachers already using TeachWise AI to save hours on lesson planning and assessment.
              </p>
              <Link href="/chat" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Free — No Credit Card Required
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 px-6 py-12 border-t border-slate-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/owl-mascot.png" alt="TeachWise" className="w-8 h-8" />
              <span className="font-semibold text-slate-700">TeachWise AI</span>
            </div>
            <p className="text-sm text-slate-500">© 2024 TeachWise AI. Made with ❤️ for Australian teachers.</p>
          </div>
        </footer>
      </div>
    </>
  );
}