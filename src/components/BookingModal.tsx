import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Calendar, Clock, MapPin, User, CheckCircle2, 
  ArrowRight, Lock, ShieldCheck, Award, Sparkles, 
  Phone, Mail, FileText, ChevronRight 
} from 'lucide-react';
import { ServiceItem, Stylist, PuneLocation, Booking } from '../types';
import { STYLISTS, PUNE_LOCATIONS, TIME_SLOTS } from '../data';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: ServiceItem | null;
  onBookingSuccess: (newBooking: Booking) => void;
}

export default function BookingModal({ 
  isOpen, 
  onClose, 
  selectedService, 
  onBookingSuccess 
}: BookingModalProps) {
  
  // Steps: 1 = Choose Stylist, 2 = Set Location & DateTime, 3 = Personal Details, 4 = Success Receipt
  const [step, setStep] = useState<number>(1);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(
    STYLISTS[0] || null
  );
  const [selectedLocation, setSelectedLocation] = useState<PuneLocation>(
    PUNE_LOCATIONS[0]
  );
  const [date, setDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[0]);
  
  // Personal details
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // Errors validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Finished booking ref
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  if (!isOpen || !selectedService) return null;

  const handleNextStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 2) {
      if (!date) {
        newErrors.date = 'Please select a preferred date for your service.';
        setErrors(newErrors);
        return;
      }
      // Check if date is in the past
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selectedDate < today) {
        newErrors.date = 'Please select a date in the future.';
        setErrors(newErrors);
        return;
      }
    }

    if (step === 3) {
      if (!name.trim()) newErrors.name = 'Full name is required.';
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please provide a valid email.';
      if (!phone.trim() || phone.trim().length < 10) newErrors.phone = 'Please provide a valid 10-digit mobile number.';
      if (!address.trim()) newErrors.address = 'Your Pune residence address is required.';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    setErrors({});
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setErrors({});
    setStep((prev) => Math.max(1, prev - 1));
  };

  const calculateTotal = () => {
    const basePrice = selectedService.price;
    const gstRate = 0.18; // 18% Lux Salon Services Tax GST
    const convenienceTravelFee = 0; // Free for hackathon/promotional release
    const gst = Math.round(basePrice * gstRate);
    return {
      base: basePrice,
      gst,
      total: basePrice + gst + convenienceTravelFee
    };
  };

  const { base, gst, total } = calculateTotal();

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedStylist || !selectedLocation) return;

    // Create unique booking record
    const bookingId = `PSLN-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking: Booking = {
      id: bookingId,
      service: selectedService,
      stylist: selectedStylist,
      location: selectedLocation,
      date,
      timeSlot,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      customerAddress: address,
      notes: notes.trim() || undefined,
      totalPrice: total,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };

    // Store in localStorage
    const saved = localStorage.getItem('pune_salon_bookings');
    const existing = saved ? JSON.parse(saved) : [];
    localStorage.setItem('pune_salon_bookings', JSON.stringify([newBooking, ...existing]));

    setCreatedBooking(newBooking);
    onBookingSuccess(newBooking);
    setStep(4);
  };

  const resetState = () => {
    setStep(1);
    setSelectedStylist(STYLISTS[0]);
    setSelectedLocation(PUNE_LOCATIONS[0]);
    setDate('');
    setTimeSlot(TIME_SLOTS[0]);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setNotes('');
    setCreatedBooking(null);
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      <div id="booking-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-end overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step === 4 ? resetState : onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Sheet */}
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 24, stiffness: 120 }}
          className="relative w-full max-w-2xl h-screen bg-white text-charcoal-900 flex flex-col z-10 shadow-2xl border-l border-charcoal-200"
        >
          {/* Header */}
          <div className="p-6 border-b border-charcoal-150 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-widest text-gold-600 bg-gold-100 px-2 py-1 rounded">RITUAL RESERVE</span>
                <span className="text-xs text-charcoal-500">• {selectedService.duration} MINS</span>
              </div>
              <h2 className="text-xl font-serif mt-1 font-bold tracking-tight text-charcoal-900">
                {step === 4 ? 'Luxury Secured' : 'Reserve Salon Sanctuary'}
              </h2>
            </div>
            
            {step !== 4 && (
              <button 
                onClick={onClose}
                className="p-2 text-charcoal-400 hover:text-charcoal-900 hover:bg-gold-50 rounded-full transition-all border border-charcoal-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Stepper Indicator */}
          {step < 4 && (
            <div className="bg-[#FAF9F6] px-6 py-3 border-b border-charcoal-200 flex items-center justify-between text-xs font-mono text-charcoal-500">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-charcoal-900 text-gold-50' : 'bg-charcoal-200 text-charcoal-500'}`}>1</span>
                <span className={step >= 1 ? 'text-charcoal-900 font-semibold' : ''}>Stylist</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-charcoal-300" />
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-charcoal-900 text-gold-50' : 'bg-charcoal-200 text-charcoal-505'}`}>2</span>
                <span className={step >= 2 ? 'text-charcoal-900 font-semibold' : ''}>Schedule</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-charcoal-300" />
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-charcoal-900 text-gold-50' : 'bg-charcoal-200 text-charcoal-505'}`}>3</span>
                <span className={step >= 3 ? 'text-charcoal-900 font-semibold' : ''}>Personal</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-charcoal-300" />
              <div className="flex items-center gap-2 opacity-60">
                <span className="w-5 h-5 rounded-full bg-charcoal-100 flex items-center justify-center font-bold text-charcoal-400">4</span>
                <span>Ritual</span>
              </div>
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            
            {/* Step 1: Select Artisan Stylist */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-serif text-gold-600 font-medium">1. Choose Your Elite Dedicated Artisan</h3>
                  <p className="text-xs text-charcoal-500 mt-1">Our certified expert stylists arrive fully equipped with sterilized single-use professional toolsets to construct your chosen treatment.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {STYLISTS.map((st) => {
                    const isSelected = selectedStylist?.id === st.id;
                    return (
                      <div 
                        key={st.id}
                        onClick={() => setSelectedStylist(st)}
                        className={`cursor-pointer group relative p-4 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected 
                            ? 'bg-gold-50 border-gold-500 luxury-glow' 
                            : 'bg-white border-charcoal-200 hover:border-gold-400'
                        }`}
                      >
                        <div className="flex gap-3">
                          <img 
                            src={st.image} 
                            alt={st.name} 
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-lg object-cover border border-charcoal-100 group-hover:scale-105 transition-transform select-none"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-semibold tracking-wide text-charcoal-900 group-hover:text-gold-600 transition-colors">{st.name}</h4>
                              <Award className="w-3.5 h-3.5 text-gold-500" />
                            </div>
                            <p className="text-xs text-gold-600 font-mono mt-0.5">{st.role}</p>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-charcoal-500">
                              <span className="text-gold-600 font-bold font-sans">★ {st.rating}</span>
                              <span>•</span>
                              <span>{st.completedJobs} visits</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-charcoal-600 mt-3 italic line-clamp-2 leading-relaxed">
                          "{st.bio}"
                        </p>

                        <div className="mt-3 pt-3 border-t border-charcoal-100 flex flex-wrap gap-1">
                          {st.specialties.slice(0, 2).map((sp) => (
                            <span key={sp} className="text-[9px] font-mono bg-gold-100 text-charcoal-600 px-2 py-0.5 rounded">
                              {sp}
                            </span>
                          ))}
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-charcoal-900 text-gold-50 rounded-full p-0.5">
                            <CheckCircle2 className="w-4 h-4 fill-charcoal-900 text-gold-50" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Info Card on Service Selection */}
                <div className="mt-6 p-4 rounded-xl bg-gold-50 border border-charcoal-200 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-semibold text-charcoal-900 uppercase tracking-wider font-mono">Guaranteed Experience Quality</h5>
                    <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                      Your chosen stylist is strictly background-verified, health-screened daily, and will bring brand-new, biologically sealed disposable gowns, sanitizers, and luxury organic products.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Location, Date & Time Slot */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-serif text-gold-600 font-medium">2. Select Your Locale & Preferred Time Slot</h3>
                  <p className="text-xs text-charcoal-500 mt-1">We service premier neighborhoods within Pune with specialized mobile wellness lounges.</p>
                </div>

                <div className="space-y-4">
                  {/* Location Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono tracking-wider text-charcoal-600 block font-bold">SELECT PUNE NEIGHBORHOOD</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 no-scrollbar border border-charcoal-200 rounded-lg p-2 bg-white">
                      {PUNE_LOCATIONS.map((loc) => {
                        const isLocSelected = selectedLocation.id === loc.id;
                        return (
                          <button
                            type="button"
                            key={loc.id}
                            onClick={() => setSelectedLocation(loc)}
                            className={`flex items-start text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                              isLocSelected 
                                ? 'bg-gold-50 border-gold-500 text-charcoal-900' 
                                : 'bg-white border-charcoal-200 hover:border-gold-400 text-charcoal-600'
                            }`}
                          >
                            <MapPin className={`w-4 h-4 shrink-0 mr-2 mt-0.5 ${isLocSelected ? 'text-gold-500' : 'text-charcoal-400'}`} />
                            <div>
                              <div className="text-xs font-semibold">{loc.name}</div>
                              <div className="text-[10px] text-charcoal-500 font-mono mt-0.5">{loc.region}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Date picker */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono tracking-wider text-charcoal-600 flex items-center gap-1.5 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-gold-500" /> SELECT PREFERRED DATE
                      </label>
                      <input 
                        type="date"
                        value={date}
                        onChange={(e) => {
                          setDate(e.target.value);
                          if(errors.date) {
                            const { date, ...rest } = errors;
                            setErrors(rest);
                          }
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full bg-[#FAF9F6] text-charcoal-900 border rounded-lg p-3 text-xs outline-none focus:border-gold-500 transition-colors ${
                          errors.date ? 'border-red-500' : 'border-charcoal-200'
                        }`}
                      />
                      {errors.date && (
                        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-mono">
                          ⚠️ {errors.date}
                        </p>
                      )}
                    </div>

                    {/* Time slots pick */}
                    <div className="space-y-2">
                      <label className="text-xs font-mono tracking-wider text-charcoal-600 flex items-center gap-1.5 font-bold">
                        <Clock className="w-3.5 h-3.5 text-gold-500" /> SELECT TREATMENT SLOT
                      </label>
                      <select 
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full bg-[#FAF9F6] text-charcoal-900 border border-charcoal-200 rounded-lg p-3 text-xs outline-none focus:border-gold-500 transition-colors cursor-pointer"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot} className="bg-white">
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gold-50 border border-charcoal-200 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-semibold text-charcoal-900 uppercase tracking-wider font-mono">Flexible Cancellation</h5>
                    <p className="text-[11px] text-charcoal-600 mt-0.5 leading-relaxed">
                      Reschedule or cancel absolutely free up to 4 hours before your slot. Your booking parameters are dynamically aligned to your preference.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Billing Address & Contact Information */}
            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-serif text-gold-600 font-medium">3. Secure Personal Access & Deliverables</h3>
                  <p className="text-xs text-charcoal-500 mt-1">Please supply the direct contact parameters and the Pune flat/bungalow delivery address.</p>
                </div>

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-600 block font-bold">FULL LEGAL NAME</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                        <input 
                          type="text"
                          placeholder="Lord/Lady Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full bg-white border rounded-lg pl-10 pr-4 py-2.5 text-xs text-charcoal-900 outline-none focus:border-gold-500 transition-colors ${
                            errors.name ? 'border-red-500' : 'border-charcoal-200'
                          }`}
                        />
                      </div>
                      {errors.name && <p className="text-[9px] text-red-500 mt-0.5 font-mono">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-600 block font-bold">EMAIL ADDRESS (RECEIPT & ALERTS)</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                        <input 
                          type="email"
                          placeholder="client@yourluxury.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full bg-white border rounded-lg pl-10 pr-4 py-2.5 text-xs text-charcoal-900 outline-none focus:border-gold-500 transition-colors ${
                            errors.email ? 'border-red-500' : 'border-charcoal-200'
                          }`}
                        />
                      </div>
                      {errors.email && <p className="text-[9px] text-red-500 mt-0.5 font-mono">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-600 block font-bold">MOBILE CONTACT NUMBER</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                        <input 
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          className={`w-full bg-white border rounded-lg pl-10 pr-4 py-2.5 text-xs text-charcoal-900 outline-none focus:border-gold-500 transition-colors ${
                            errors.phone ? 'border-red-500' : 'border-charcoal-200'
                          }`}
                        />
                      </div>
                      {errors.phone && <p className="text-[9px] text-red-500 mt-0.5 font-mono">{errors.phone}</p>}
                    </div>

                    {/* Neighborhood locked display */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono tracking-wider text-charcoal-600 block font-bold">LOCKED DISTRICT SECTOR</label>
                      <div className="bg-gold-50 border border-charcoal-200 rounded-lg px-3 py-2.5 flex items-center justify-between">
                        <span className="text-xs text-gold-600 font-semibold">{selectedLocation.name}</span>
                        <span className="text-[9px] font-mono bg-gold-100 text-gold-600 px-2 py-0.5 rounded uppercase">Verified Zone</span>
                      </div>
                    </div>
                  </div>

                  {/* Physical Address */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider text-charcoal-600 block font-bold">Pune Residential Address (Apartment, Floor, Landmark)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-charcoal-400" />
                      <textarea 
                        rows={2}
                        placeholder="e.g. Penthouse A-402, Marvel Crest, Near Joggers Park..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full bg-white border rounded-lg pl-10 pr-4 py-2 text-xs text-charcoal-900 outline-none focus:border-gold-500 transition-colors resize-none ${
                          errors.address ? 'border-red-500' : 'border-charcoal-200'
                        }`}
                      />
                    </div>
                    {errors.address && <p className="text-[9px] text-red-500 mt-0.5 font-mono">{errors.address}</p>}
                  </div>

                  {/* Aesthetic notes */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider text-gold-500 block font-bold">SPECIAL MASSAGE/MAKEUP NOTES (PREFERENCES/ALLERGIES - OPTIONAL)</label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 w-4 h-4 text-charcoal-400" />
                      <textarea 
                        rows={2}
                        placeholder="Please signify skin sensitivity, specific oil selections, hair texture guidelines..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-white border border-charcoal-200 rounded-lg pl-10 pr-4 py-2 text-xs text-charcoal-900 outline-none focus:border-gold-500 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 4: Success Receipt */}
            {step === 4 && createdBooking && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="text-center py-4 space-y-2">
                  <div className="inline-flex p-3 bg-gold-100 border border-gold-400/30 rounded-full animate-bounce">
                    <CheckCircle2 className="w-10 h-10 text-gold-500" />
                  </div>
                  <h3 className="text-2xl font-serif text-charcoal-900 font-medium tracking-tight">Reservation Confirmed</h3>
                  <p className="text-xs text-charcoal-500 max-w-md mx-auto">
                    Your luxury ritual has been logged directly into our master schedule. Master {createdBooking.stylist.name} is scheduled to arrive.
                  </p>
                </div>

                {/* Classical beautiful printed receipt style */}
                <div className="border border-charcoal-200 rounded-xl bg-[#FAF9F6] overflow-hidden divide-y divide-charcoal-155 luxury-glow">
                  {/* Receipt Header */}
                  <div className="p-4 bg-white flex justify-between items-center border-b border-charcoal-200">
                    <div>
                      <span className="text-[10px] font-mono text-charcoal-500 block uppercase">Appointment ID</span>
                      <span className="text-sm font-mono font-bold text-gold-600 tracking-wider">{createdBooking.id}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-charcoal-500 block uppercase">Issued On</span>
                      <span className="text-xs text-charcoal-900 font-mono">{new Date(createdBooking.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}</span>
                    </div>
                  </div>

                  {/* Receipt Body */}
                  <div className="p-4 space-y-3.5 bg-white">
                    <div className="flex justify-between text-xs">
                      <span className="text-charcoal-500">Luxury Treatment</span>
                      <span className="text-charcoal-900 font-semibold">{createdBooking.service.title}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-charcoal-500">Assigned Artisan</span>
                      <span className="text-gold-600 font-semibold">{createdBooking.stylist.name} ({createdBooking.stylist.role})</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-charcoal-500">District Locale</span>
                      <span className="text-charcoal-900 font-semibold">{createdBooking.location.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-charcoal-500">Set Date / Time</span>
                      <span className="text-charcoal-900 font-mono font-semibold">{createdBooking.date} / {createdBooking.timeSlot.split('(')[0]}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-charcoal-500">Reserved For</span>
                      <span className="text-charcoal-900 font-semibold">{createdBooking.customerName}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-charcoal-500">Sanctuary Address</span>
                      <span className="text-charcoal-900 font-semibold text-right max-w-[280px] line-clamp-1">{createdBooking.customerAddress}</span>
                    </div>
                  </div>

                  {/* Receipt Cost Breakdown */}
                  <div className="p-4 bg-white/60 space-y-2">
                    <div className="flex justify-between text-xs text-charcoal-500">
                      <span>Base Ritual Rate</span>
                      <span className="font-mono">₹{base.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-charcoal-500">
                      <span>SGST + CGST (18%)</span>
                      <span className="font-mono">₹{gst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-charcoal-500">
                      <span>Travel & Convenience Fee</span>
                      <span className="text-gold-600 font-mono font-bold">FREE (HACKATHON)</span>
                    </div>
                    <div className="flex justify-between text-sm text-charcoal-900 pt-2 border-t border-charcoal-200 font-serif font-bold">
                      <span>Comprehensive Charge</span>
                      <span className="font-sans font-extrabold text-[#121212] text-base">₹{createdBooking.totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-charcoal-500 font-mono">
                    A confirmation SMS & detailed preparation guide has been dispatched to {createdBooking.customerPhone}.
                  </p>
                </div>
              </motion.div>
            )}

          </div>

          {/* Checkout Footer & Action Controls */}
          <div className="p-6 border-t border-charcoal-200 bg-white space-y-4 animate-fade-in">
            
            {/* Split Price calculator side summary (only under wizard mode) */}
            {step < 4 && (
              <div className="flex justify-between items-center p-3 rounded-lg bg-gold-50 border border-charcoal-200">
                <div>
                  <div className="text-[10px] text-charcoal-500 font-mono tracking-wider uppercase">Projected Luxury Investment</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-charcoal-900">₹{total.toLocaleString('en-IN')}</span>
                    <span className="text-[9px] text-charcoal-500 font-mono">ALL INCLUSIVE</span>
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono text-charcoal-500">
                  <div className="text-charcoal-900">{selectedService.title}</div>
                  <div>Includes 18% salon GST</div>
                </div>
              </div>
            )}

            {/* Back / Next actions */}
            <div className="flex gap-3">
              {step > 1 && step < 4 && (
                <button 
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3.5 border border-charcoal-200 hover:border-gold-400 text-charcoal-600 hover:text-charcoal-900 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Back
                </button>
              )}
              
              {step < 3 ? (
                <button 
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 bg-charcoal-900 hover:bg-gold-400 hover:text-charcoal-950 text-gold-50 font-semibold py-3.5 px-6 rounded-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] font-mono cursor-pointer"
                >
                  Continue to {step === 1 ? 'Schedule' : 'Personal Details'} <ArrowRight className="w-4 h-4 text-gold-50" />
                </button>
              ) : step === 3 ? (
                <button 
                  type="button"
                  onClick={handleConfirmReservation}
                  className="flex-1 bg-charcoal-900 hover:bg-gold-400 hover:text-charcoal-950 text-gold-50 font-bold py-3.5 px-6 rounded-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] font-mono cursor-pointer shadow-lg"
                >
                  Secure Sanctuary Booking <Lock className="w-4 h-4 text-gold-50" />
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={resetState}
                  className="w-full bg-charcoal-900 hover:bg-gold-400 hover:text-charcoal-950 text-gold-50 font-bold py-3.5 px-6 rounded-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-center cursor-pointer font-mono"
                >
                  Unveil Dashboard
                </button>
              )}
            </div>

            {/* Trust disclaimer */}
            {step < 4 && (
              <div className="flex items-center justify-center gap-1 text-[10px] text-charcoal-500 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-500" /> SECURE 256-BIT LUXURY SSL ENDPOINT
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
