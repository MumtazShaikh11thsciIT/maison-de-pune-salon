import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Mail, FileText, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface CorporateInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCompanyName?: string;
  initialWorkEmail?: string;
  initialDetails?: string;
  forceSubmitted?: boolean;
}

export default function CorporateInquiryModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialCompanyName = '',
  initialWorkEmail = '',
  initialDetails = '',
  forceSubmitted = false
}: CorporateInquiryModalProps) {
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [workEmail, setWorkEmail] = useState(initialWorkEmail);
  const [details, setDetails] = useState(initialDetails);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(forceSubmitted);

  // Sync state values reactivity for tour input autofilling simulation
  useEffect(() => {
    if (isOpen) {
      setCompanyName(initialCompanyName);
      setWorkEmail(initialWorkEmail);
      setDetails(initialDetails);
      setIsSubmitted(forceSubmitted);
    }
  }, [isOpen, initialCompanyName, initialWorkEmail, initialDetails, forceSubmitted]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is required.';
    }
    if (!workEmail.trim()) {
      newErrors.workEmail = 'Work email is required.';
    } else if (!/\S+@\S+\.\S+/.test(workEmail)) {
      newErrors.workEmail = 'Please provide a valid corporate email.';
    }
    if (!details.trim()) {
      newErrors.details = 'Please provide some inquiry details.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitted(true);
    onSuccess();
  };

  const handleReset = () => {
    setCompanyName('');
    setWorkEmail('');
    setDetails('');
    setErrors({});
    setIsSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div id="corporate-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isSubmitted ? handleReset : onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
          className="relative w-full max-w-md md:max-w-lg bg-white text-charcoal-900 rounded-2xl z-10 shadow-2xl border border-charcoal-200 max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 sm:p-8 md:p-10 border-b border-charcoal-100 flex items-center justify-between shrink-0">
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-gold-600 bg-gold-50 border border-gold-200/50 px-2.5 py-1 rounded inline-block uppercase font-bold leading-none">Corporate & VIP Sector</span>
              <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-charcoal-900 pt-1.5">
                {isSubmitted ? 'Partnership Scheduled' : 'Exclusive Inquiries'}
              </h2>
            </div>
            
            {!isSubmitted && (
              <button 
                onClick={onClose}
                className="p-2 sm:p-2.5 text-charcoal-400 hover:text-charcoal-950 hover:bg-gold-50 rounded-full transition-all border border-charcoal-200/60 flex items-center justify-center cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 md:p-10 space-y-6">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-xs sm:text-[13px] text-charcoal-500 font-light leading-relaxed tracking-wide">
                  Maison Salon caters to elite corporate office hubs, wellness days, residential compounds, and custom high-society events throughout Pune. Share your requirements to unlock absolute bespoke terms.
                </p>

                {/* Company Name */}
                <div id="field-company-name" className="space-y-2">
                  <label className="text-[10px] font-mono tracking-wider text-charcoal-600 block font-bold uppercase">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                    <input 
                      type="text"
                      placeholder="e.g. Pune Tech Venture / Hyatt Residences"
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        if (errors.companyName) {
                          const { companyName: _, ...rest } = errors;
                          setErrors(rest);
                        }
                      }}
                      className={`w-full bg-[#FAF9F6] border rounded-lg pl-11 pr-4 py-3 text-xs text-charcoal-900 outline-none focus:border-gold-500 transition-all font-sans focus:bg-white ${
                        errors.companyName ? 'border-red-500 bg-red-50/10' : 'border-charcoal-200'
                      }`}
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-[10px] text-red-500 font-mono mt-1 flex items-center gap-1">
                      ⚠️ {errors.companyName}
                    </p>
                  )}
                </div>

                {/* Work Email */}
                <div id="field-work-email" className="space-y-2">
                  <label className="text-[10px] font-mono tracking-wider text-charcoal-600 block font-bold uppercase">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                    <input 
                      type="email"
                      placeholder="e.g. partnerships@company.com"
                      value={workEmail}
                      onChange={(e) => {
                        setWorkEmail(e.target.value);
                        if (errors.workEmail) {
                          const { workEmail: _, ...rest } = errors;
                          setErrors(rest);
                        }
                      }}
                      className={`w-full bg-[#FAF9F6] border rounded-lg pl-11 pr-4 py-3 text-xs text-charcoal-900 outline-none focus:border-gold-500 transition-all font-sans focus:bg-white ${
                        errors.workEmail ? 'border-red-500 bg-red-50/10' : 'border-charcoal-200'
                      }`}
                    />
                  </div>
                  {errors.workEmail && (
                    <p className="text-[10px] text-red-500 font-mono mt-1 flex items-center gap-1">
                      ⚠️ {errors.workEmail}
                    </p>
                  )}
                </div>

                {/* Inquiry Details */}
                <div id="field-inquiry-details" className="space-y-2">
                  <label className="text-[10px] font-mono tracking-wider text-charcoal-600 block font-bold uppercase">Inquiry Details</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-charcoal-400" />
                    <textarea 
                      rows={3}
                      placeholder="Describe the occasion, preferred dates, estimate guest count, or bespoke expectations..."
                      value={details}
                      onChange={(e) => {
                        setDetails(e.target.value);
                        if (errors.details) {
                          const { details: _, ...rest } = errors;
                          setErrors(rest);
                        }
                      }}
                      className={`w-full bg-[#FAF9F6] border rounded-lg pl-11 pr-4 py-3 text-xs text-charcoal-900 outline-none focus:border-gold-500 transition-all font-sans resize-none focus:bg-white ${
                        errors.details ? 'border-red-500 bg-red-50/10' : 'border-charcoal-200'
                      }`}
                    />
                  </div>
                  {errors.details && (
                    <p className="text-[10px] text-red-500 font-mono mt-1 flex items-center gap-1">
                      ⚠️ {errors.details}
                    </p>
                  )}
                </div>

                {/* Submit and Cancel buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-1/3 border border-charcoal-200 hover:border-gold-400 text-charcoal-600 hover:text-charcoal-950 font-bold py-3 px-4 rounded-lg text-xs uppercase tracking-widest transition-all font-mono cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-charcoal-900 hover:bg-gold-400 hover:text-charcoal-950 text-gold-50 font-bold py-3.5 px-6 rounded-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] font-mono cursor-pointer shadow-lg"
                  >
                    <span>Submit Request</span>
                    <ArrowRight className="w-4 h-4 text-gold-400" />
                  </button>
                </div>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-4"
              >
                <div className="inline-flex p-4 bg-gold-50 border border-gold-400/30 rounded-full animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-gold-500" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-serif text-charcoal-900 font-bold tracking-tight">Inquiry Received</h3>
                  <p className="text-xs sm:text-[13px] text-charcoal-500 max-w-sm mx-auto leading-relaxed">
                    Thank you. A master experience curator will analyze your requirements and call you or reach your corporate inbox within 2 business hours.
                  </p>
                </div>

                {/* Classical beautiful printed memo style receipt */}
                <div className="border border-charcoal-100 rounded-xl bg-[#FAF9F6] overflow-hidden divide-y divide-charcoal-150 text-left p-5 space-y-4 shadow-sm">
                  <div className="pb-3 border-b border-charcoal-200">
                    <span className="text-[9px] font-mono text-charcoal-400 block uppercase">Reference Receipt</span>
                    <span className="text-xs font-mono font-bold text-gold-600">CORP-{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>
                  <div className="pt-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-charcoal-400">Entity</span>
                      <span className="text-charcoal-900 font-semibold">{companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-400">Authorized Email</span>
                      <span className="text-charcoal-900 font-mono font-semibold">{workEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-400">Status</span>
                      <span className="text-green-600 font-bold uppercase font-mono tracking-wider text-[10px]">Concierge Assigned</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full bg-charcoal-900 hover:bg-gold-400 hover:text-charcoal-950 text-gold-50 font-bold py-4 px-6 rounded-lg text-xs uppercase tracking-widest flex items-center justify-center transition-all font-mono cursor-pointer"
                  >
                    Return to Maison
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer security badge */}
          <div className="p-5 border-t border-charcoal-100 bg-[#FAF9F6] flex items-center justify-center gap-1.5 text-[10px] text-charcoal-500 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-500" /> SECURE EXECUTIVE PRIVACY SHIELDED
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
