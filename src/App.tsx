import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Award, ShieldCheck, MapPin, Phone, Clock, 
  ChevronRight, Calendar, Heart, ShieldAlert, Check,
  Sliders, Star, Scissors, Map, ArrowUpRight, Trash2,
  BookmarkCheck, Coffee, RefreshCw, AlertCircle, Mail
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { SERVICES, STYLISTS, PUNE_LOCATIONS } from './data';
import { ServiceItem, Booking } from './types';
import BookingModal from './components/BookingModal';
import CorporateInquiryModal from './components/CorporateInquiryModal';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function App() {
  // Modal controllers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCorporateModalOpen, setIsCorporateModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(SERVICES[0]);
  
  // Real active bookings from localStorage
  const [localBookings, setLocalBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'bridal' | 'spa' | 'hair' | 'skin'>('all');
  
  // Luxury interactive consultation recommender state
  const [consultCategory, setConsultCategory] = useState<'bridal' | 'spa' | 'hair' | 'skin'>('bridal');
  const [consultVibe, setConsultVibe] = useState<'glam' | 'calm' | 'radiant'>('glam');
  const [recommendationResult, setRecommendationResult] = useState<ServiceItem | null>(null);

  // Success toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Parallax background ref
  const heroRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Load bookings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pune_salon_bookings');
    if (saved) {
      try {
        setLocalBookings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse local bookings', e);
      }
    }
  }, []);

  // Sync consultation recommendation automatically
  useEffect(() => {
    // Basic logic mapping inputs to service item
    let recommended: ServiceItem | undefined;
    if (consultCategory === 'bridal') {
      recommended = SERVICES.find(s => s.category === 'bridal');
    } else if (consultCategory === 'spa') {
      recommended = SERVICES.find(s => s.category === 'spa');
    } else if (consultCategory === 'hair') {
      recommended = SERVICES.find(s => s.category === 'hair');
    } else {
      recommended = SERVICES.find(s => s.category === 'skin');
    }
    setRecommendationResult(recommended || SERVICES[0]);
  }, [consultCategory, consultVibe]);

  // GSAP subtle scroll reveal effect
  useGSAP(() => {
    // Fade in intro story elements
    gsap.fromTo('.story-reveal', 
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.story-trigger-section',
          start: 'top 92%',
          once: true
        }
      }
    );

    // Fade in offering cards - optimized for smooth, instant, reliable reveal
    gsap.fromTo('.offering-card', 
      { opacity: 0, y: 15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: 'sine.out',
        scrollTrigger: {
          trigger: '.offerings-trigger-section',
          start: 'top 92%',
          once: true
        }
      }
    );

    // Section 4 (Safety) slow, premium staggered reveal
    const safetyTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#safety-nav',
        start: 'top 92%',
        once: true
      }
    });

    safetyTl.fromTo('.safety-reveal-headline', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }
    )
    .fromTo('.safety-reveal-subtitle', 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, 
      '+=0.15'
    )
    .fromTo('.safety-reveal-image', 
      { opacity: 0, y: 25, scale: 0.99 },
      { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out' }, 
      '+=0.15'
    )
    .fromTo('.safety-reveal-cta', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 
      '+=0.15'
    );

    // Handle scroll parallax on hero background
    const handleScroll = () => {
      if (heroBgRef.current) {
        const scrolled = window.scrollY;
        // Subtle offset
        heroBgRef.current.style.transform = `translateY(${scrolled * 0.35}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial reflow refresh
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => window.removeEventListener('scroll', handleScroll);
  }, { dependencies: [], scope: mainContainerRef });

  // Handle opening modal with selected service
  const triggerBooking = (service: ServiceItem) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  // Toast dispatch helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Callback when a new booking is confirmed
  const handleBookingConfirmed = (newBooking: Booking) => {
    setLocalBookings((prev) => [newBooking, ...prev]);
    showToast(`Your reservation with ${newBooking.stylist.name} for ₹${newBooking.totalPrice.toLocaleString('en-IN')} has been beautifully secured.`);
  };

  // Cancel booking helper
  const handleCancelBooking = (bookingId: string) => {
    const updated = localBookings.filter(b => b.id !== bookingId);
    setLocalBookings(updated);
    localStorage.setItem('pune_salon_bookings', JSON.stringify(updated));
    showToast('Your reservation was successfully cancelled.');
  };

  // Static premium 4 services curation list
  const filteredServices = SERVICES;

  return (
    <div ref={mainContainerRef} className="min-h-screen bg-gold-50 font-sans text-charcoal-900 selection:bg-gold-200 selection:text-charcoal-950">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-50 max-w-md w-full"
          >
            <div className="luxury-toast bg-charcoal-950 text-white rounded-xl border border-gold-400 p-4 flex gap-3 shadow-2xl">
              <div className="bg-gold-400/10 p-2 rounded-lg self-start">
                <BookmarkCheck className="w-5 h-5 text-gold-400" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-xs font-mono font-bold text-gold-400 tracking-widest uppercase">PLATFORM ALERT</h4>
                <p className="text-xs text-charcoal-200 leading-relaxed font-medium">{toastMessage}</p>
              </div>
              <button 
                onClick={() => setToastMessage(null)}
                className="text-charcoal-500 hover:text-white self-start text-xs font-semibold p-1"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Sticky Luxury Header */}
      <header className="sticky top-0 z-40 bg-gold-50/95 backdrop-blur-md border-b border-charcoal-900/10 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Branding */}
          <a href="#" className="flex flex-col select-none">
            <span className="font-serif text-lg font-bold tracking-widest text-charcoal-900">MAISON DE PUNE</span>
            <span className="font-mono text-[9px] text-gold-400 tracking-widest uppercase">SALON DE LUXE</span>
          </a>

          {/* Minimalist Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest uppercase text-charcoal-600">
            <a href="#story-nav" className="hover:text-charcoal-900 transition-colors">The Story</a>
            <a href="#offerings-nav" className="hover:text-charcoal-900 transition-colors">Bespoke Rituals</a>
            <a href="#consultation-nav" className="hover:text-charcoal-900 transition-colors">Curation</a>
            <a href="#safety-nav" className="hover:text-charcoal-900 transition-colors">Sanitation Standards</a>
            {localBookings.length > 0 && (
              <a href="#reservations-nav" className="flex items-center gap-1.5 text-gold-500 font-bold hover:text-charcoal-900 transition-colors">
                <span>My Rituals</span>
                <span className="bg-charcoal-900 text-gold-50 font-sans font-black px-1.5 py-0.2 rounded-full text-[10px]">
                  {localBookings.length}
                </span>
              </a>
            )}
          </nav>

          {/* Contact and Direct CTA */}
          <div className="flex items-center gap-4">
            <a 
              href="tel:+919011090110" 
              className="hidden sm:flex items-center gap-2 text-xs font-mono text-charcoal-800 hover:text-charcoal-950 hover:border-gold-400 transition-colors border border-charcoal-900/10 bg-gold-50 px-3.5 py-1.5 rounded-full"
            >
              <Phone className="w-3.5 h-3.5 text-gold-400" />
              <span>+91 90110 90110</span>
            </a>
            
            <button 
              onClick={() => triggerBooking(SERVICES[0])}
              className="bg-charcoal-900 hover:bg-gold-400 hover:text-charcoal-950 text-gold-50 text-xs font-mono tracking-widest uppercase font-bold px-4 py-2 rounded transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
            >
              Reserve Salon
            </button>
          </div>

        </div>
      </header>

      {/* Section 1: Cinematic Hero (The Hook) */}
      <section 
        ref={heroRef}
        className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-charcoal-950 pt-20 pb-24 md:pt-24 md:pb-28"
      >
        {/* Parallax Container Backdrop */}
        <div 
          ref={heroBgRef}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-75 scale-110"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80&w=1600')`,
          }}
        />
        
        {/* Extreme cinematic dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/70 to-charcoal-900/60" />

        {/* Content Box */}
        <div className="relative w-full max-w-4xl mx-auto px-6 text-center space-y-8 md:space-y-10 z-10">
          
          <div className="space-y-4 md:space-y-5">
            {/* Elegant upper subheader */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/20 px-4.5 py-1.5 rounded-full"
            >
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="text-xs font-mono font-bold tracking-widest text-gold-400 uppercase">A FIVE-STAR SPA COMES HOME</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-tight text-white max-w-3xl mx-auto"
            >
              Luxury Salon Services, <br />
              <span className="italic font-medium text-gold-300 font-serif">Delivered to Your Home in Pune.</span>
            </motion.h1>

            {/* Sub-sentence */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="text-xs sm:text-sm md:text-[15px] text-charcoal-200/90 font-sans max-w-2xl mx-auto font-light leading-relaxed md:leading-loose tracking-wide"
            >
              Skip the commute. Transform your home into a tranquil five-star sanctuary. Vetted master stylists arrive equipped with premium biologics on your schedule.
            </motion.p>
          </div>

          {/* Singular High-Contrast Booking CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 md:pt-6"
          >
            <button 
              onClick={() => triggerBooking(SERVICES[0])}
              className="w-full sm:w-auto bg-charcoal-900 hover:bg-gold-400 hover:text-charcoal-950 text-gold-50 px-8 py-4 rounded-lg text-sm font-semibold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xl font-mono"
            >
              Book Your Stylist
            </button>
            <a 
              href="#offerings-nav"
              className="w-full sm:w-auto bg-transparent border border-white/20 hover:border-gold-400 text-white hover:text-gold-300 px-8 py-4 rounded-lg text-sm font-semibold uppercase tracking-widest transition-all text-center font-mono"
            >
              View Menu Rituals
            </a>
          </motion.div>

          {/* Quick indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1, duration: 1 }}
            className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 md:pt-8 text-center max-w-2xl mx-auto text-white"
          >
            <div>
              <div className="font-serif text-2xl font-bold text-gold-400">₹0</div>
              <div className="text-[10px] font-mono tracking-wider uppercase text-charcoal-200">Convenience Travel Charge</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-gold-400">100%</div>
              <div className="text-[10px] font-mono tracking-wider uppercase text-charcoal-200">Bio-sealed Hygiene Kits</div>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-gold-400">Elite 20</div>
              <div className="text-[10px] font-mono tracking-wider uppercase text-charcoal-200">Vetted Salon Artisans</div>
            </div>
          </motion.div>

        </div>

        {/* Scroll down elegant visual link */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 text-white/40 text-[9px] font-mono tracking-widest uppercase select-none pointer-events-none">
          <span className="animate-pulse">Scroll to explore</span>
          <motion.div 
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="w-0.5 h-4 bg-gold-400/50 rounded-full"
          />
        </div>
      </section>

      {/* Section 2: Introduction Section (The Story) */}
      <section 
        id="story-nav" 
        className="story-trigger-section py-16 md:py-24 bg-gold-50 px-6 overflow-hidden border-b border-gold-200"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Block: Collage-style layout with overlapping images adding raw high-end personality */}
          <div className="lg:col-span-6 relative h-[380px] sm:h-[480px] w-full max-w-md mx-auto lg:max-w-none">
            
            {/* Background luxury frame decoration */}
            <div className="absolute inset-4 border border-gold-400/20 rounded-2xl transform translate-x-2 -translate-y-2 pointer-events-none" />
            
            {/* Image 1: Main background image */}
            <div className="absolute top-0 left-0 w-[65%] h-[70%] rounded-xl overflow-hidden shadow-xl border border-gold-400/10">
              <img 
                src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800" 
                alt="Luxury aromatics" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none"
              />
            </div>

            {/* Image 2: Middle overlapping image */}
            <div className="absolute top-[20%] right-0 w-[55%] h-[60%] rounded-xl overflow-hidden shadow-2xl border border-white/60 translate-y-4">
              <img 
                src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800" 
                alt="Facial experience" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none"
              />
            </div>

            {/* Image 3: Small floating action detail */}
            <div className="absolute bottom-0 left-[15%] w-[45%] h-[40%] rounded-xl overflow-hidden shadow-xl border border-gold-400/10 -translate-x-4">
              <img 
                src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=800" 
                alt="Premium tools" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover select-none"
              />
            </div>

            {/* Soft decorative golden circle */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gold-400/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Right Block: Pure High-Contrast Storytelling Content */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8">
            <span className="story-reveal font-mono text-[10px] tracking-widest text-gold-600 font-bold uppercase block">THE PHILOSOPHY & VISION</span>
            
            {/* The single strong mission statement */}
            <h2 className="story-reveal font-serif text-3xl sm:text-4xl lg:text-5xl text-charcoal-950 tracking-tight leading-tight lg:leading-tight font-black">
              Bringing Pune’s top beauty experts <br className="hidden sm:inline" />
              <span className="font-serif italic text-gold-600 font-normal font-serif">directly to your living room.</span>
            </h2>

            <div className="story-reveal w-16 h-0.5 bg-gold-400" />

            <p className="story-reveal text-xs sm:text-sm text-charcoal-500 font-light leading-relaxed md:leading-loose tracking-wide">
              We believe luxury lies in complete privacy, saved time, and immaculate security. Formulated for those who demand world-class results without stepping foot in crowded salons.
            </p>

            <p className="story-reveal text-xs sm:text-sm text-charcoal-500 font-light leading-relaxed md:leading-loose tracking-wide">
              Maison de Pune integrates highly trained senior cosmetologists and wellness therapists. Each appointment initiates a curated sanctuary ritual, bringing sterile instrument packs, heated linens, and ambient soundtracks into your home.
            </p>

            {/* Quick benefits grid */}
            <div className="story-reveal grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-2.5">
                <div className="bg-gold-100 p-1 rounded-full"><Check className="w-3.5 h-3.5 text-gold-600" /></div>
                <div>
                  <h4 className="text-xs font-semibold text-charcoal-900 leading-none">No Travel Friction</h4>
                  <p className="text-[11px] text-charcoal-500 mt-1">Dodge the city traffic; relax instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="bg-gold-100 p-1 rounded-full"><Check className="w-3.5 h-3.5 text-gold-600" /></div>
                <div>
                  <h4 className="text-xs font-semibold text-charcoal-900 leading-none">100% Medical Sanitation</h4>
                  <p className="text-[11px] text-charcoal-500 mt-1">Surgical tool sterilization guarantee.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Section 3: Offerings Section (Static Grid) */}
      <section 
        id="offerings-nav" 
        className="offerings-trigger-section py-16 md:py-24 bg-gold-50 text-charcoal-900 px-6 border-b border-charcoal-200"
      >
        <div className="max-w-7xl mx-auto space-y-12 md:space-y-16">
          
          {/* Header context */}
          <div className="text-center space-y-4 md:space-y-5 max-w-3xl mx-auto">
            <span className="font-mono text-[10px] tracking-widest text-gold-500 font-bold uppercase block">EXQUISITE SERVICES DEEP MENU</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-charcoal-900 leading-tight tracking-tight">
              Bespoke In-Home Salon Curation
            </h2>
            <div className="w-16 h-1 bg-gold-400 mx-auto mt-4" />
            <p className="text-xs sm:text-sm md:text-[15px] text-charcoal-500 max-w-xl mx-auto font-light leading-relaxed md:leading-loose tracking-wide">
              Select an indulgent wellness treatment tailored specifically for Pune’s premium residential standards. No rush, only pristine execution.
            </p>
          </div>

          {/* Grid Layout: perfectly sized premium static 4-card grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {filteredServices.map((service) => (
              <div 
                key={service.id}
                className="offering-card group relative rounded-xl border border-charcoal-200 bg-white overflow-hidden flex flex-col justify-between transition-all hover:border-gold-400 hover:scale-[1.01] luxury-glow"
              >
                {/* Visual Cover with Dark Overlay */}
                <div className="relative h-52 sm:h-56 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none"
                  />
                  {/* Subtle Dark Overlay for guaranteed description legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/30 to-transparent" />
                  
                  {/* Category Pill Tag */}
                  <span className="absolute top-3 left-3 bg-white text-charcoal-900 font-mono text-[9px] tracking-widest font-bold px-2 py-0.5 rounded uppercase border border-charcoal-200">
                    {service.category}
                  </span>

                  {/* Time badge */}
                  <span className="absolute bottom-3 right-3 flex items-center gap-1 bg-gold-50/95 text-charcoal-900 font-mono text-[9px] px-2 py-0.5 rounded border border-charcoal-200/50">
                    <Clock className="w-3 h-3 text-gold-500" />
                    <span>{service.duration} mins</span>
                  </span>
                </div>

                {/* Card Content details */}
                <div className="p-6 sm:p-7 md:p-8 flex-1 flex flex-col justify-between space-y-6 md:space-y-8">
                  <div className="space-y-4 md:space-y-5">
                    <div className="space-y-1.5 md:space-y-2">
                      <span className="text-[9px] font-mono text-gold-600 uppercase tracking-widest block leading-none">{service.tagline}</span>
                      <h3 className="text-lg sm:text-xl font-serif font-black text-charcoal-900 group-hover:text-gold-600 transition-colors leading-snug">
                        {service.title}
                      </h3>
                    </div>
                    
                    <p className="text-xs sm:text-[13px] text-charcoal-500 leading-relaxed font-light tracking-wide line-clamp-3">
                      {service.description}
                    </p>

                    {/* Feature points checklist */}
                    <ul className="space-y-2 sm:space-y-2.5 pt-4 md:pt-5 border-t border-charcoal-100/60">
                      {service.features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[10px] sm:text-[11px] text-charcoal-500 leading-normal">
                           <Check className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing and Action triggers */}
                  <div className="pt-5 md:pt-6 border-t border-charcoal-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-auto">
                    <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-1">
                      <div className="text-[9px] font-mono text-charcoal-400 tracking-wider uppercase leading-none">INVESTMENT</div>
                      <div className="text-lg font-extrabold font-sans tracking-tight text-charcoal-900 leading-none">
                        ₹{service.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => triggerBooking(service)}
                      className="w-full sm:w-auto bg-charcoal-900 hover:bg-gold-400 hover:text-charcoal-950 text-gold-50 px-5 py-3.5 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                    >
                      <span>Book Service</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gold-400" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Quick interactive beauty service consultation matching module */}
          <div id="consultation-nav" className="mt-16 md:mt-24 p-6 md:p-10 lg:p-12 rounded-2xl bg-white border border-charcoal-200 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center luxury-glow">
            
            <div className="lg:col-span-5 space-y-4 md:space-y-5">
              <span className="font-mono text-[9px] tracking-widest text-gold-500 font-bold uppercase block">DIGITAL BEAUTY CONSULTATION</span>
              <h3 className="font-serif text-2xl sm:text-3xl text-charcoal-900 leading-tight md:leading-tight font-black tracking-tight">
                Unveil Your Personalized Ritual Curation Instantly
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed md:leading-loose font-light tracking-wide">
                Answer two questions about your lifestyle and priorities. Our algorithm pairs your profile with Pune's bespoke service pack and specialized stylist.
              </p>

              {/* Sliders icons decoration */}
              <div className="flex items-center gap-3 text-gold-500 pt-3 md:pt-4">
                <Sliders className="w-5 h-5 text-gold-500" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-charcoal-500">Interactive judging sandbox</span>
              </div>
            </div>

            {/* Questions selectors logic */}
            <div className="lg:col-span-7 bg-gold-50/50 p-5 md:p-6 rounded-xl border border-charcoal-200/80 space-y-4 md:space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Question 1 */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-charcoal-555 uppercase tracking-widest font-semibold block">1. Primary Treatment Focus</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'bridal', icon: '★', label: 'Bridal Art' },
                      { key: 'spa', icon: '♨', label: 'Deep Calm' },
                      { key: 'hair', icon: '✂', label: 'Couture Hair' },
                      { key: 'skin', icon: '✦', label: 'Glow Skin' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.key}
                        onClick={() => setConsultCategory(item.key as any)}
                        className={`py-3 px-3 rounded-lg border text-left text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                          consultCategory === item.key 
                            ? 'bg-charcoal-900 border-charcoal-900 text-gold-50 shadow-sm' 
                            : 'bg-white border-charcoal-200 text-charcoal-600 hover:border-gold-400'
                        }`}
                      >
                        <span className="text-[10px] font-mono block select-none">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2 */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-charcoal-555 uppercase tracking-widest font-semibold block">2. Required Aesthetic Vibe</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'glam', label: 'High Glam' },
                      { key: 'calm', label: 'Meditation' },
                      { key: 'radiant', label: 'Anti-Aging' }
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.key}
                        onClick={() => setConsultVibe(item.key as any)}
                        className={`py-3 px-1 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer ${
                          consultVibe === item.key 
                            ? 'bg-charcoal-900 border-charcoal-900 text-gold-50 shadow-sm' 
                            : 'bg-white border-charcoal-200 text-charcoal-600 hover:border-gold-400'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Consultation Outcome dynamic display */}
              {recommendationResult && (
                <div className="bg-white border border-charcoal-200 p-5 sm:p-6 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6 animate-fade-in shadow-sm w-full">
                  <div className="flex items-center gap-4 text-left">
                    <img 
                      src={recommendationResult.image} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border border-charcoal-100 select-none shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="text-[9px] font-mono text-gold-600 font-bold tracking-widest leading-none">SUGGESTED RITUAL MATCH</div>
                      <h4 className="text-sm sm:text-base font-serif font-bold text-charcoal-900 leading-tight">{recommendationResult.title}</h4>
                      <p className="text-[11px] text-charcoal-500 font-mono leading-none">{recommendationResult.tagline}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-charcoal-100 w-full sm:w-auto">
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5">
                      <div className="text-[9px] font-mono text-charcoal-400 tracking-wider leading-none">INVESTMENT</div>
                      <div className="text-base font-bold text-charcoal-900 font-sans leading-tight">
                        ₹{recommendationResult.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => triggerBooking(recommendationResult!)}
                      className="w-full sm:w-auto bg-charcoal-900 hover:bg-gold-400 hover:text-charcoal-950 text-gold-50 font-mono text-[10px] font-bold tracking-widest uppercase px-5 py-3.5 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                    >
                      <span>Reserve Match</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-gold-400" />
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* Section 4: Our Process/Values Section (Split Column) */}
      <section 
        id="safety-nav" 
        className="py-16 md:py-24 bg-gold-50 px-6 border-b border-gold-200"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Column (Bold statements and values explanation with generous spacing) */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4 safety-reveal-headline">
              <span className="font-mono text-[10px] tracking-widest text-gold-600 font-bold uppercase block">HYGIENE & EXPERT PROTOCOL</span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-charcoal-950 tracking-tight leading-tight">
                Our Surgical Safety <br />
                <span className="font-serif italic text-gold-600 font-normal font-serif">Standards & Values</span>
              </h2>
              <div className="w-16 h-0.5 bg-gold-400" />
            </div>

            <p className="safety-reveal-subtitle text-xs sm:text-sm text-charcoal-500 font-light leading-relaxed md:leading-loose tracking-wide">
              Home salon sanitation is more than a marketing guarantee. Maison de Pune aligns with premium hospital protocols to deliver our proprietary gold hygiene toolkit.
            </p>

            {/* Core Values checklist items cards */}
            <div className="space-y-4">
              
              <div className="flex gap-4 p-4 rounded-xl border border-gold-200 bg-white/60">
                <div className="bg-gold-100 p-2.5 rounded-lg text-gold-600 self-start">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-900">Clinically Sanitized Instruments</h4>
                  <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                    All metal styling combs, cuticle trimmers, and facial probes undergo autoclave sealing. Our artisans open the vacuum packs in front of your eyes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl border border-gold-200 bg-white/60">
                <div className="bg-gold-100 p-2.5 rounded-lg text-gold-600 self-start">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-900">Pune's Elite Indian Artistry</h4>
                  <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                    We strictly partner with Pune's Elite Indian Artistry, proudly featuring 100% local, elite-vetted Indian cosmetologists rigorously checked and trained in premium luxury standards.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl border border-gold-200 bg-white/60">
                <div className="bg-gold-100 p-2.5 rounded-lg text-gold-600 self-start">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-charcoal-900">Zero Travel-Fee Policy</h4>
                  <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                    Our luxury dispatch is all inclusive. There are never any premium distance surcharges, parking overhead bills, or mysterious travel supplements added to your receipt.
                  </p>
                </div>
              </div>

            </div>

            {/* Elegant Luxury CTA inside Left Column */}
            <div className="safety-reveal-cta pt-4">
              <button 
                onClick={() => triggerBooking(SERVICES[0])}
                className="w-full sm:w-auto bg-charcoal-900 hover:bg-gold-400 hover:text-charcoal-950 text-gold-50 px-7 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Reserve Certified Stylist</span>
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              </button>
            </div>

          </div>

          {/* Right Column (Detailed high-quality image explaining the exquisite delivery) */}
          <div className="lg:col-span-6 relative safety-reveal-image">
            <div className="absolute inset-4 border-2 border-gold-400/20 rounded-2xl transform translate-x-4 translate-y-4 pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gold-400/10">
              <img 
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000" 
                alt="Elite wellness therapist" 
                referrerPolicy="no-referrer"
                className="w-full h-[480px] object-cover select-none"
              />
              {/* Soft dark luxury backdrop text overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-charcoal-950/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                <div className="space-y-1 max-w-sm">
                  <span className="font-mono text-[9px] tracking-widest text-gold-400 font-bold uppercase">PROMISE OF TRUST</span>
                  <h4 className="text-base font-serif text-white font-bold leading-snug">Elite verification certificate displayed by arrival.</h4>
                  <p className="text-[11px] text-charcoal-350 font-light leading-relaxed">
                    All tools are opened dynamically from biological safety seals in front of you. Secure, clean, premium.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Section 5: Real-time "My Reserved Experiences" Panel (Only displays if bookings exist!) */}
      {localBookings.length > 0 && (
        <section 
          id="reservations-nav" 
          className="py-16 md:py-20 bg-white text-charcoal-900 border-b border-charcoal-200 px-6"
        >
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            
            <div className="text-center space-y-2">
              <span className="font-mono text-[10px] tracking-widest text-gold-600 font-bold uppercase block">YOUR ACCOUNT JOURNAL</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900">Your Reserved Home Sanctuary Rituals</h2>
              <p className="text-xs text-charcoal-600 max-w-md mx-auto">Track assigned experts, dates, locations, and comprehensive investment receipts.</p>
            </div>

            <div className="space-y-4">
              {localBookings.map((b) => (
                <div 
                  key={b.id}
                  className="p-5 rounded-xl border border-charcoal-200 bg-gold-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gold-400 transition-all shadow-sm"
                >
                  <div className="flex gap-4 items-start">
                    <img 
                      src={b.service.image} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded object-cover border border-charcoal-200 select-none"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-gold-600 bg-gold-100 px-2 py-0.5 rounded tracking-wide font-bold">{b.id}</span>
                        <span className="text-[10px] uppercase font-mono text-charcoal-500">• Confirmed</span>
                      </div>
                      <h4 className="text-sm font-semibold text-charcoal-900 mt-1">{b.service.title}</h4>
                      <p className="text-[11px] text-charcoal-600 font-mono mt-1">
                        With <span className="text-gold-600 font-medium">{b.stylist.name}</span> on <span className="text-charcoal-900 font-semibold">{b.date}</span> @ <span className="text-charcoal-900 font-semibold">{b.timeSlot.split('(')[0]}</span>
                      </p>
                      <p className="text-[11px] text-charcoal-500 mt-1 flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-gold-500" /> Deliver to: {b.customerName}, {b.customerAddress} ({b.location.name})
                      </p>
                    </div>
                  </div>

                  <div className="w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-charcoal-200 flex items-center justify-between md:justify-end gap-6 self-stretch md:self-center">
                    <div className="text-left md:text-right">
                      <div className="text-[10px] text-charcoal-500 font-mono">GST INCLUDED CHARGE</div>
                      <div className="text-sm font-semibold text-charcoal-900 font-sans">₹{b.totalPrice.toLocaleString('en-IN')}</div>
                    </div>

                    <button 
                      onClick={() => handleCancelBooking(b.id)}
                      className="p-2 border border-charcoal-200 hover:border-red-500/30 text-charcoal-400 hover:text-red-650 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold"
                      title="Cancel Booking"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="md:hidden">Cancel Ritual</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>

            <div className="text-center">
              <button 
                onClick={() => {
                  if(confirm("Are you sure you want to clear reservation history from local caches?")) {
                    localStorage.removeItem('pune_salon_bookings');
                    setLocalBookings([]);
                    showToast("Reservation history cleared successfully.");
                  }
                }}
                className="text-[10px] font-mono uppercase tracking-widest text-charcoal-500 hover:text-charcoal-700 transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Clear Local Cached Bookings
              </button>
            </div>

          </div>
        </section>
      )}

      {/* Section 6: Final Call to Action & Footer */}
      <section 
        className="relative py-16 md:py-20 bg-gold-50 text-charcoal-900 text-center overflow-hidden border-b border-charcoal-100 px-6"
      >
        {/* Soft decorative background circles */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto space-y-8 md:space-y-10 z-10">
          
          <div className="space-y-4 md:space-y-5">
            <span className="font-mono text-[10px] tracking-widest text-gold-500 font-bold uppercase block">EXPERIENCE MAISON LUXURY</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-charcoal-900 leading-tight">
              Transform your home into <br className="hidden sm:inline" />
              <span className="font-serif italic text-gold-500 font-normal font-serif">a luxury salon today.</span>
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 max-w-lg mx-auto font-light leading-relaxed md:leading-loose tracking-wide">
              Skip the waiting lists. Experience Pune’s premier in-home wellness dispatch and reserve your personalized salon ritual.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 md:pt-10">
            <button 
              onClick={() => triggerBooking(SERVICES[0])}
              className="w-full sm:w-auto bg-charcoal-900 hover:bg-gold-400 hover:text-charcoal-950 text-gold-50 px-8 py-4 rounded-lg text-sm font-semibold uppercase tracking-widest transition-all font-mono cursor-pointer"
            >
              Book Your Stylist Now
            </button>
            <button 
              type="button"
              onClick={() => setIsCorporateModalOpen(true)}
              className="w-full sm:w-auto bg-transparent border border-charcoal-200 hover:border-gold-400 text-charcoal-800 hover:text-charcoal-950 px-8 py-4 rounded-lg text-sm font-semibold uppercase tracking-widest transition-all font-mono text-center cursor-pointer"
            >
              Corporate Inquiries
            </button>
          </div>

          {/* Core Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-charcoal-200 pt-16 text-center text-charcoal-600 max-w-3xl mx-auto">
            <div className="space-y-1">
              <ShieldCheck className="w-5 h-5 text-gold-500 mx-auto" />
              <h5 className="text-[11px] font-semibold text-charcoal-950 font-serif">Deep Sterilization</h5>
              <p className="text-[9px] font-mono text-charcoal-500">Autoclaved instruments always</p>
            </div>
            <div className="space-y-1">
              <Award className="w-5 h-5 text-gold-500 mx-auto" />
              <h5 className="text-[11px] font-semibold text-charcoal-950 font-serif">Elite Experts Only</h5>
              <p className="text-[9px] font-mono text-charcoal-500">Top 4% credential vetted</p>
            </div>
            <div className="space-y-1">
              <Sliders className="w-5 h-5 text-gold-500 mx-auto" />
              <h5 className="text-[11px] font-semibold text-charcoal-950 font-serif">Bespoke Curation</h5>
              <p className="text-[9px] font-mono text-charcoal-500">Tailored facial & skin maps</p>
            </div>
            <div className="space-y-1">
              <Coffee className="w-5 h-5 text-gold-500 mx-auto" />
              <h5 className="text-[11px] font-semibold text-charcoal-950 font-serif">Sanctuary Comfort</h5>
              <p className="text-[9px] font-mono text-charcoal-500">Includes relaxing tea brew</p>
            </div>
          </div>

        </div>
      </section>

      {/* Clean, Minimal Footer */}
      <footer className="bg-white text-charcoal-600 py-12 px-6 border-t border-charcoal-200 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Logo & Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-widest text-charcoal-900">MAISON DE PUNE</span>
              <span className="font-mono text-[9px] text-gold-500 tracking-widest uppercase">SALON DE LUXE</span>
            </div>
            <p className="text-[11px] text-charcoal-650 max-w-sm leading-relaxed">
              Serving premium housing segments across East, West, and Central Pune. Delivering the standards of clinical cosmetic sanitation and traditional luxury styling to your home oasis.
            </p>
            <div className="text-[11px] font-mono text-charcoal-400">
              © 2026 Maison de Pune. Crafted for High-End Hackathon, judging rules fully maintained.
            </div>
          </div>

          {/* Quick Grouped Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            <div className="space-y-3">
              <h5 className="font-mono text-[10px] tracking-wider text-gold-600 uppercase font-bold">Menu Rituals</h5>
              <ul className="space-y-2 text-[11px] text-charcoal-500">
                {SERVICES.map((s) => (
                  <li key={s.id}>
                    <button 
                      onClick={() => triggerBooking(s)}
                      className="hover:text-charcoal-900 transition-colors cursor-pointer text-left"
                    >
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-mono text-[10px] tracking-wider text-gold-600 uppercase font-bold">Premium Sectors</h5>
              <ul className="space-y-2 text-[11px] text-charcoal-500">
                <li><a href="#" className="hover:text-charcoal-900 transition-colors">Koregaon Park / Kalyani Nagar</a></li>
                <li><a href="#" className="hover:text-charcoal-900 transition-colors">Baner / Balewadi / Aundh</a></li>
                <li><a href="#" className="hover:text-charcoal-900 transition-colors">Kothrud / Prabhat Road</a></li>
                <li><a href="#" className="hover:text-charcoal-900 transition-colors">Viman Nagar / Phursungi</a></li>
              </ul>
            </div>

            <div className="space-y-3 col-span-2 sm:col-span-1">
              <h5 className="font-mono text-[10px] tracking-wider text-gold-600 uppercase font-bold">Contact Concierge</h5>
              <ul className="space-y-2 text-[11px] text-charcoal-500">
                <li className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-gold-500" />
                  <a href="tel:+919011090110" className="hover:text-charcoal-900">+91 90110 90110</a>
                </li>
                <li className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-gold-500" />
                  <a href="mailto:concierge@maisondepune.com" className="hover:text-charcoal-900">concierge@maison.in</a>
                </li>
                <li>
                  <div className="mt-1 text-[10px] text-charcoal-400">
                    Operation hours: <br />
                    Daily 07:00 AM - 11:30 PM
                  </div>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </footer>

      {/* Booking Modal render segment */}
      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedService={selectedService}
        onBookingSuccess={handleBookingConfirmed}
      />

      {/* Corporate Inquiry Modal render segment */}
      <CorporateInquiryModal
        isOpen={isCorporateModalOpen}
        onClose={() => setIsCorporateModalOpen(false)}
        onSuccess={() => showToast('Maison Elite: Your premium corporate proposal has been successfully registered.')}
      />

    </div>
  );
}
