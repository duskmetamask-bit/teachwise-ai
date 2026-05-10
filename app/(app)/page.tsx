'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const quickActions = [
  {
    label: 'Lesson Planner',
    href: '/planner',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    desc: 'Generate AC9-aligned lesson plans',
    color: '#00D4AA',
  },
  {
    label: 'Unit Library',
    href: '/units',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    desc: 'Browse 100s of ready-to-use units',
    color: '#8B5CF6',
  },
  {
    label: 'Rubric Generator',
    href: '/rubrics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    desc: 'Create detailed assessment rubrics',
    color: '#F59E0B',
  },
  {
    label: 'Auto-Marking',
    href: '/automark',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    desc: 'Upload work, get instant feedback',
    color: '#EF4444',
  },
];

const recentActivity = [
  { type: 'chat', text: 'Generated lesson plan for Year 4 Fractions', time: '2 hours ago', icon: '✧' },
  { type: 'rubric', text: 'Created rubric for Year 5 Persuasive Writing', time: 'Yesterday', icon: '◉' },
  { type: 'unit', text: 'Viewed Unit: Earth\'s Living History', time: '2 days ago', icon: '◇' },
  { type: 'worksheet', text: 'Generated Worksheet: Multiplication Word Problems', time: '3 days ago', icon: '◎' },
];

const features = [
  {
    title: 'AI-Powered Lesson Plans',
    desc: 'Generate comprehensive AC9-aligned lesson plans in seconds with intelligent content suggestions',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: '#00D4AA',
  },
  {
    title: 'Smart Assessment Tools',
    desc: 'Create rubrics, auto-mark student work, and generate personalized feedback effortlessly',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: '#8B5CF6',
  },
  {
    title: 'Behavior Support',
    desc: 'Access de-escalation strategies, behavior tracking tools, and restorative practice templates',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: '#EF4444',
  },
];

const stats = [
  { label: 'Units Created', value: 24, icon: '◇' },
  { label: 'Rubrics Built', value: 18, icon: '◉' },
  { label: 'Worksheets Generated', value: 42, icon: '◎' },
  { label: 'Students Assisted', value: 156, icon: '◈' },
];

const tips = [
  'Use the Auto-Marking tool to save hours on feedback. Upload a rubric and student work for instant criterion-by-criterion analysis.',
  'Try the Writing Feedback tool with your Year 5-6 students. It provides growth-focused feedback on narrative and persuasive texts.',
  'The Report Comments generator creates AC9-aligned comments in seconds. Select effort level and get personalised feedback instantly.',
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Typewriter component
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [started, text]);

  return <span>{displayed}<span className="animate-pulse">|</span></span>;
}

// Counting animation hook
function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * eased));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, end, duration, start]);

  return { count, startCounting: () => setHasStarted(true) };
}

// 3D Tilt component
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => setTransform('');

  return (
    <div
      ref={ref}
      className={`transition-all duration-200 ease-out ${className}`}
      style={{ transform, transformOrigin: 'center' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [statsStarted, setStatsStarted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setStatsStarted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style jsx>{`
        /* Animated Background Mesh */
        .mesh-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
          background: linear-gradient(135deg, #0A0D14 0%, #111420 50%, #0D1117 100%);
          overflow: hidden;
        }

        .mesh-bg::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(ellipse at 20% 20%, rgba(0, 212, 170, 0.08) 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
                      radial-gradient(ellipse at 40% 60%, rgba(0, 212, 170, 0.05) 0%, transparent 40%),
                      radial-gradient(ellipse at 70% 30%, rgba(139, 92, 246, 0.05) 0%, transparent 40%);
          animation: meshMove 20s ease-in-out infinite;
        }

        @keyframes meshMove {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(2%, 2%) rotate(1deg); }
          66% { transform: translate(-1%, 1%) rotate(-1deg); }
        }

        /* Floating Orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.4;
          animation: float 8s ease-in-out infinite;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(0, 212, 170, 0.3) 0%, transparent 70%);
          top: 10%;
          right: 10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%);
          bottom: 20%;
          left: 5%;
          animation-delay: -3s;
        }

        .orb-3 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(0, 212, 170, 0.2) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          animation-delay: -5s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.05); }
          50% { transform: translate(-10px, 20px) scale(0.95); }
          75% { transform: translate(30px, 10px) scale(1.02); }
        }

        /* Gradient Text Glow */
        .gradient-text-glow {
          background: linear-gradient(135deg, #00D4AA 0%, #8B5CF6 50%, #00D4AA 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: gradientShift 4s ease infinite;
          text-shadow: 0 0 40px rgba(0, 212, 170, 0.3);
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Animated Border Gradient */
        .animated-border {
          position: relative;
          background: linear-gradient(#161B22, #161B22) padding-box,
                      linear-gradient(135deg, #00D4AA, #8B5CF6, #00D4AA) border-box;
          border: 1px solid transparent;
          background-size: 200% 200%;
          animation: borderGradient 4s ease infinite;
        }

        @keyframes borderGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* Hero Glow Ring */
        .glow-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(0, 212, 170, 0.2);
          animation: pulseRing 4s ease-in-out infinite;
        }

        .glow-ring-1 {
          width: 120px;
          height: 120px;
          top: -20px;
          right: -20px;
          animation-delay: 0s;
        }

        .glow-ring-2 {
          width: 180px;
          height: 180px;
          top: -40px;
          right: -50px;
          animation-delay: -1s;
        }

        .glow-ring-3 {
          width: 240px;
          height: 240px;
          top: -60px;
          right: -80px;
          animation-delay: -2s;
        }

        @keyframes pulseRing {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        /* Rotating Orb Illustration */
        .orbit-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 300px;
          height: 300px;
        }

        .orbit {
          position: absolute;
          border-radius: 50%;
          border: 1px dashed rgba(0, 212, 170, 0.15);
          animation: spin 20s linear infinite;
        }

        .orbit-1 {
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .orbit-2 {
          width: 80%;
          height: 80%;
          top: 10%;
          left: 10%;
          animation-direction: reverse;
          animation-duration: 15s;
        }

        .orbit-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background: #00D4AA;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(0, 212, 170, 0.8);
        }

        .orbit-dot-1 {
          top: 0;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: orbitDot1 4s linear infinite;
        }

        .orbit-dot-2 {
          top: 50%;
          right: 0;
          transform: translate(50%, -50%);
          background: #8B5CF6;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.8);
          animation: orbitDot2 6s linear infinite;
        }

        .orbit-dot-3 {
          bottom: 10%;
          left: 10%;
          transform: translate(-50%, 50%);
          animation: orbitDot3 8s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes orbitDot1 {
          0% { transform: translate(-50%, -50%) rotate(0deg) translateX(150px) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg) translateX(150px) rotate(-360deg); }
        }

        @keyframes orbitDot2 {
          0% { transform: translate(50%, -50%) rotate(0deg) translateY(-120px) rotate(0deg); }
          100% { transform: translate(50%, -50%) rotate(360deg) translateY(-120px) rotate(-360deg); }
        }

        @keyframes orbitDot3 {
          0% { transform: translate(-50%, 50%) rotate(0deg) translateX(100px) rotate(0deg); }
          100% { transform: translate(-50%, 50%) rotate(360deg) translateX(100px) rotate(-360deg); }
        }

        /* Shimmer Effect */
        .shimmer {
          position: relative;
          overflow: hidden;
        }

        .shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
          transition: left 0.5s ease;
        }

        .shimmer:hover::after {
          left: 100%;
        }

        /* Stats Card Floating */
        .stats-float {
          animation: statsFloat 3s ease-in-out infinite;
        }

        .stats-float:nth-child(2) { animation-delay: -0.75s; }
        .stats-float:nth-child(3) { animation-delay: -1.5s; }
        .stats-float:nth-child(4) { animation-delay: -2.25s; }

        @keyframes statsFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        /* Glowing Border on Hover */
        .glow-border-hover {
          transition: all 0.3s ease;
        }

        .glow-border-hover:hover {
          border-color: rgba(0, 212, 170, 0.5);
          box-shadow: 0 0 20px rgba(0, 212, 170, 0.15), 0 0 40px rgba(0, 212, 170, 0.05);
        }

        /* Quick Actions Slide In */
        .slide-in {
          opacity: 0;
          transform: translateX(-20px);
          animation: slideIn 0.5s ease forwards;
        }

        .slide-in:nth-child(1) { animation-delay: 0.1s; }
        .slide-in:nth-child(2) { animation-delay: 0.2s; }
        .slide-in:nth-child(3) { animation-delay: 0.3s; }
        .slide-in:nth-child(4) { animation-delay: 0.4s; }

        @keyframes slideIn {
          to { opacity: 1; transform: translateX(0); }
        }

        /* Arrow Animation */
        .arrow-anim {
          transition: transform 0.3s ease;
        }

        .group:hover .arrow-anim {
          transform: translateX(4px);
        }

        /* Ripple Effect */
        .ripple {
          position: relative;
          overflow: hidden;
        }

        .ripple::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: radial-gradient(circle, rgba(0, 212, 170, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s ease, height 0.6s ease;
        }

        .ripple:active::before {
          width: 300px;
          height: 300px;
        }

        /* Icon Pulse */
        .icon-pulse {
          animation: iconPulse 2s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* Glassmorphism */
        .glass {
          background: rgba(22, 27, 34, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        /* Feature Card 3D */
        .feature-3d {
          transition: all 0.3s ease;
          transform-style: preserve-3d;
        }

        .feature-3d:hover {
          transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 212, 170, 0.1);
        }

        /* Entrance Animations */
        .fade-up {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeUp 0.6s ease forwards;
        }

        .fade-up:nth-child(1) { animation-delay: 0.1s; }
        .fade-up:nth-child(2) { animation-delay: 0.2s; }
        .fade-up:nth-child(3) { animation-delay: 0.3s; }

        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Pulse Glow */
        .pulse-glow-anim {
          animation: pulseGlow 2s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 170, 0.15); }
          50% { box-shadow: 0 0 30px rgba(0, 212, 170, 0.3), 0 0 60px rgba(0, 212, 170, 0.1); }
        }

        /* Animated gradient background */
        .gradient-animate {
          background: linear-gradient(-45deg, #161B22, #1D2233, #161B22, #1D2233);
          background-size: 400% 400%;
          animation: gradientBg 15s ease infinite;
        }

        @keyframes gradientBg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="mesh-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl animated-border p-8 md:p-12 glass">
          {/* Background Glow Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D4AA]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8B5CF6]/10 rounded-full blur-3xl" />

          {/* Floating Elements */}
          <div className="absolute top-20 right-20 w-3 h-3 rounded-full bg-[#00D4AA]/60 animate-pulse" />
          <div className="absolute top-40 right-40 w-2 h-2 rounded-full bg-[#8B5CF6]/60 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-32 right-32 w-2 h-2 rounded-full bg-[#00D4AA]/40 animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00D4AA]/10 border border-[#00D4AA]/20 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
                <span className="text-xs text-[#00D4AA] font-medium">AI-Powered Teaching Assistant</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <span className="text-white">Build better lessons, </span>
                <span className="gradient-text-glow">faster.</span>
              </h1>
              <p className="text-lg text-[#8B949E] leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                Generate AC9-aligned lesson plans, rubrics, worksheets, and teaching resources in seconds. Let AI handle the paperwork so you can focus on what matters — teaching.
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <Link
                  href="/planner"
                  className="ripple inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00D4AA] text-[#0D1117] font-semibold hover:bg-[#00E4BA] transition-all duration-200 shadow-lg shadow-[#00D4AA]/25"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Lesson Plan
                </Link>
                <Link
                  href="/chat"
                  className="ripple inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#30363D] bg-[#161B22] text-white font-medium hover:bg-[#1C2128] hover:border-[#00D4AA]/50 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Ask AI Assistant
                </Link>
              </div>
            </div>

            {/* Hero Visual - Owl Mascot */}
            <div className="relative hidden md:flex justify-center items-center">
              <div className="relative">
                {/* Glow effect behind owl */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-green-400/20 rounded-full blur-3xl scale-75" />
                {/* Owl mascot image */}
                <img 
                  src="/owl-mascot.png" 
                  alt="TeachWise AI Mascot" 
                  className="relative w-72 h-72 object-contain drop-shadow-2xl"
                />
                {/* Sparkle decorations */}
                <div className="absolute -top-4 -right-4 animate-bounce" style={{ animationDuration: '2s' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#F59E0B">
                    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                  </svg>
                </div>
                <div className="absolute bottom-8 -left-4 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#22C55E">
                    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                  </svg>
                </div>
                <div className="absolute top-1/3 -right-6 animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#8B5CF6">
                    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const { count, startCounting } = useCountUp(stat.value, 2000);
            useEffect(() => {
              if (statsStarted && mounted) {
                startCounting();
              }
            }, [statsStarted, mounted, startCounting]);

            return (
              <div
                key={stat.label}
                className={`stats-float relative overflow-hidden rounded-xl glow-border-hover gradient-animate border border-[#30363D] p-5 ${mounted ? '' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#00D4AA]/5 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[#00D4AA] icon-pulse" style={{ animationDelay: `${i * 0.5}s` }}>{stat.icon}</span>
                    <span className="text-xs text-[#8B949E] font-medium">{stat.label}</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{count}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Grid */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 fade-up">Features</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <TiltCard key={feature.title}>
                <div
                  className={`feature-3d shimmer relative overflow-hidden rounded-xl glow-border-hover border border-[#30363D] bg-[#161B22] p-6 h-full`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00D4AA]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 icon-pulse"
                      style={{ backgroundColor: `${feature.color}20`, color: feature.color, animationDelay: `${i * 0.3}s` }}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2 group-hover:text-[#00D4AA] transition-colors duration-200">{feature.title}</h3>
                    <p className="text-sm text-[#8B949E] leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 fade-up">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="slide-in ripple group relative overflow-hidden rounded-xl glow-border-hover border border-[#30363D] bg-[#161B22] p-5 hover:border-[#00D4AA]/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00D4AA]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: `${action.color}20`, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-1 group-hover:text-[#00D4AA] transition-colors duration-200">{action.label}</div>
                    <div className="text-xs text-[#8B949E]">{action.desc}</div>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-5 h-5 text-[#00D4AA] arrow-anim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Two Column Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="fade-up rounded-xl border border-[#30363D] bg-[#161B22] p-6 glass">
            <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-center text-[#00D4AA] text-sm flex-shrink-0 group-hover:border-[#00D4AA]/50 transition-colors duration-200">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{item.text}</div>
                    <div className="text-xs text-[#8B949E]">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="fade-up rounded-xl border border-[#00D4AA]/30 bg-gradient-to-br from-[#161B22] to-[#0D1117] p-6 relative overflow-hidden glass">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D4AA]/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[#00D4AA]/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white">Teaching Tips</h3>
              </div>
              <div className="space-y-4">
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#00D4AA]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#00D4AA] text-xs">✦</span>
                    </div>
                    <p className="text-sm text-[#8B949E] leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-[#30363D]">
          <p className="text-xs text-[#8B949E]">TeachWise AI • Empowering Australian teachers with AI</p>
        </div>
      </div>
    </>
  );
}
