import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, X, Sparkles, Volume2, 
  VolumeX, Smartphone, Monitor, ChevronRight, 
  FastForward, MousePointer, HelpCircle, AlertCircle
} from 'lucide-react';

// Web Audio API Synthesizer definitions
let audioCtx: AudioContext | null = null;
let synthNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let voiceSynth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

const playLuxuryAmbientMusic = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    // Resume or create context
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // High quality soft filter
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, audioCtx.currentTime);

    // Warm chord progression (E minor 9 / Major 7 luxury tones): E2, G#2, B2, D#3, F#3, A#3
    const frequencies = [82.41, 103.83, 123.47, 155.56, 185.00, 233.08];

    frequencies.forEach((freq, index) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      const oscGain = audioCtx.createGain();
      oscGain.gain.setValueAtTime(0, audioCtx.currentTime);
      // Soft luxury attack fade-in
      oscGain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 4);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();

      synthNodes.push({ osc, gain: oscGain });
    });

    const mainGain = audioCtx.createGain();
    mainGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    filter.connect(mainGain);
    mainGain.connect(audioCtx.destination);

    // Subtle LFO sweep simulator for organic feel
    let evolution = 0;
    const sweepInterval = setInterval(() => {
      if (audioCtx && filter && synthNodes.length > 0) {
        evolution += 0.08;
        const targetFreq = 300 + Math.sin(evolution) * 60;
        filter.frequency.linearRampToValueAtTime(targetFreq, audioCtx.currentTime + 0.8);
      } else {
        clearInterval(sweepInterval);
      }
    }, 800);

  } catch (error) {
    console.error("Audio Context could not start", error);
  }
};

const stopLuxuryAmbientMusic = () => {
  try {
    synthNodes.forEach((node) => {
      node.gain.gain.linearRampToValueAtTime(0, (audioCtx?.currentTime || 0) + 0.5);
      setTimeout(() => {
        try { node.osc.stop(); } catch(e){}
      }, 600);
    });
    synthNodes = [];
    if (audioCtx && audioCtx.state !== 'closed') {
      audioCtx.close();
      audioCtx = null;
    }
  } catch (e) {}
};

interface TourChapter {
  id: number;
  timeRange: string;
  title: string;
  caption: string;
  duration: number; // in seconds
}

export const TOUR_CHAPTERS: TourChapter[] = [
  {
    id: 1,
    timeRange: "0:00 - 0:30",
    title: "The Hook & Branding Narrative",
    caption: "Welcome to Maison de Pune, a high-end home salon marketplace built for the SuperXgen AI Startup Buildathon. We avoided cluttered templates to deliver a five-star digital experience.",
    duration: 30
  },
  {
    id: 2,
    timeRange: "0:30 - 1:10",
    title: "UX & Product Thinking",
    caption: "Notice our intentional, staggered motion that guides the eye without cognitive overload. We utilized a clean, 4-card static grid for our high-ticket services, complete with subtle micro-interactions that build instant trust.",
    duration: 40
  },
  {
    id: 3,
    timeRange: "1:10 - 1:45",
    title: "Mobile Responsiveness Grid Reflow",
    caption: "As a strict requirement, the entire platform is flawlessly mobile-responsive, adapting perfectly to any screen size.",
    duration: 35
  },
  {
    id: 4,
    timeRange: "1:45 - 2:30",
    title: "Business Viability & Corporate B2B Conversion",
    caption: "For business viability, we integrated a Corporate Inquiries channel using a sleek modal form to capture high-value B2B leads. This platform was built using a strict layer-by-layer AI prompting methodology—Structure, Motion, Interaction, and Polish—to maintain architectural control and ensure an award-winning aesthetic.",
    duration: 45
  }
];

interface InteractiveTourProps {
  onTourStateChange: (state: {
    isActive: boolean;
    simulatedDevices: 'desktop' | 'mobile';
    hoveredCardId: string | null;
  }) => void;
  onOpenCorporateModal: (autofillData?: {
    company: string;
    email: string;
    details: string;
  }) => void;
  onCloseCorporateModal: () => void;
  onTriggerDirectSuccess?: () => void;
}

export default function InteractiveTour({
  onTourStateChange,
  onOpenCorporateModal,
  onCloseCorporateModal,
  onTriggerDirectSuccess
}: InteractiveTourProps) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [elapsedTime, setElapsedTime] = useState(0); // overall elapsed virtual seconds
  
  // Custom pointer coordinate system to simulate mouse scrolling & movement overlay
  const [pointer, setPointer] = useState({ x: 400, y: 300, isVisible: false, isClicking: false });
  const [pointerActionText, setPointerActionText] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const TOTAL_DURATION = TOUR_CHAPTERS.reduce((sum, ch) => sum + ch.duration, 0); // 150 seconds

  // Handle Speech Synthesis
  const speakCaption = (text: string) => {
    if (typeof window === 'undefined' || !voiceSynth || isMuted) return;
    
    try {
      voiceSynth.cancel();
      activeUtterance = new SpeechSynthesisUtterance(text);
      
      // Select premium female english voice if available
      const voices = voiceSynth.getVoices();
      const premiumVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || 
                           voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
                           voices.find(v => v.lang.startsWith('en'));
      
      if (premiumVoice) {
        activeUtterance.voice = premiumVoice;
      }
      activeUtterance.rate = 0.95 * playbackSpeed; // Slightly slower, highly luxurious delivery pace
      activeUtterance.pitch = 1.05;
      
      voiceSynth.speak(activeUtterance);
    } catch (e) {
      console.warn("Speech Synthesis issue", e);
    }
  };

  const handleTogglePlay = () => {
    if (!isTourActive) {
      // Start fresh
      setIsTourActive(true);
      setIsPlaying(true);
      setElapsedTime(0);
      setCurrentChapterIndex(0);
      playLuxuryAmbientMusic();
      speakCaption(TOUR_CHAPTERS[0].caption);
      return;
    }

    if (isPlaying) {
      setIsPlaying(false);
      stopLuxuryAmbientMusic();
      if (voiceSynth) voiceSynth.pause();
    } else {
      setIsPlaying(true);
      playLuxuryAmbientMusic();
      if (voiceSynth && voiceSynth.paused) {
        voiceSynth.resume();
      } else {
        speakCaption(TOUR_CHAPTERS[currentChapterIndex].caption);
      }
    }
  };

  const handleSkipForward = () => {
    if (currentChapterIndex < TOUR_CHAPTERS.length - 1) {
      const nextIndex = currentChapterIndex + 1;
      let newElapsed = 0;
      for (let i = 0; i < nextIndex; i++) {
        newElapsed += TOUR_CHAPTERS[i].duration;
      }
      setElapsedTime(newElapsed);
      setCurrentChapterIndex(nextIndex);
      speakCaption(TOUR_CHAPTERS[nextIndex].caption);
    } else {
      // End Tour
      handleEndTour();
    }
  };

  const handleResetTour = () => {
    setElapsedTime(0);
    setCurrentChapterIndex(0);
    setIsPlaying(true);
    playLuxuryAmbientMusic();
    speakCaption(TOUR_CHAPTERS[0].caption);
    onCloseCorporateModal();
  };

  const handleEndTour = () => {
    setIsPlaying(false);
    setIsTourActive(false);
    stopLuxuryAmbientMusic();
    if (voiceSynth) voiceSynth.cancel();
    setPointer({ ...pointer, isVisible: false });
    onTourStateChange({
      isActive: false,
      simulatedDevices: 'desktop',
      hoveredCardId: null
    });
    onCloseCorporateModal();
  };

  // Mute toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      if (voiceSynth) voiceSynth.cancel();
    } else {
      if (isPlaying) {
        speakCaption(TOUR_CHAPTERS[currentChapterIndex].caption);
      }
    }
  };

  // Main chronometer simulator loop
  useEffect(() => {
    if (isPlaying && isTourActive) {
      const intervalMs = 1000 / playbackSpeed;
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const next = prev + 1;
          if (next >= TOTAL_DURATION) {
            handleEndTour();
            return TOTAL_DURATION;
          }
          
          // Calculate chapter boundaries
          let accumulatedDur = 0;
          let matchedChapter = 0;
          for (let i = 0; i < TOUR_CHAPTERS.length; i++) {
            accumulatedDur += TOUR_CHAPTERS[i].duration;
            if (next < accumulatedDur) {
              matchedChapter = i;
              break;
            }
          }
          
          if (matchedChapter !== currentChapterIndex) {
            setCurrentChapterIndex(matchedChapter);
            speakCampaignIndex(matchedChapter);
          }
          
          return next;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isTourActive, currentChapterIndex, playbackSpeed]);

  const speakCampaignIndex = (index: number) => {
    speakCaption(TOUR_CHAPTERS[index].caption);
  };

  // Simulated Mouse Action Controller & Page Automation Engine
  useEffect(() => {
    if (!isTourActive || !isPlaying) return;

    // Trigger state configurations matching the specific timestamp milestones
    // Elapsed timeline triggers
    const activeChapter = TOUR_CHAPTERS[currentChapterIndex];
    let deviceState: 'desktop' | 'mobile' = 'desktop';
    let hoveredCard: string | null = null;

    // Phase threshold check
    if (elapsedTime >= 0 && elapsedTime < 30) {
      deviceState = 'desktop';
    } else if (elapsedTime >= 30 && elapsedTime < 70) {
      deviceState = 'desktop';
    } else if (elapsedTime >= 70 && elapsedTime < 105) {
      deviceState = 'mobile';
    } else if (elapsedTime >= 105 && elapsedTime < 150) {
      deviceState = 'desktop';
    }

    // Dynamic scroll helpers that support mobile simulator boundaries safely
    const smoothScrollToElement = (elementId: string, offset: number = 100) => {
      const element = document.getElementById(elementId);
      const container = document.getElementById('tour-app-container');
      if (!element) return;
      
      const isSimulatedMobile = deviceState === 'mobile';
      if (isSimulatedMobile && container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const targetY = elementRect.top - containerRect.top + container.scrollTop - offset;
        container.scrollTo({ top: targetY, behavior: 'smooth' });
      } else {
        const elementRect = element.getBoundingClientRect();
        const targetY = elementRect.top + window.scrollY - offset;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    };

    const smoothScrollToTop = () => {
      const container = document.getElementById('tour-app-container');
      const isSimulatedMobile = deviceState === 'mobile';
      if (isSimulatedMobile && container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const alignPointerToElement = (elementId: string, actionText: string, clickState: boolean = false) => {
      const element = document.getElementById(elementId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPointer({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          isVisible: true,
          isClicking: clickState
        });
        setPointerActionText(actionText);
      } else {
        setPointer(prev => ({
          ...prev,
          isVisible: true,
          isClicking: clickState
        }));
        setPointerActionText(actionText);
      }
    };

    // Timeline control system
    if (elapsedTime >= 0 && elapsedTime < 30) {
      // Phase 1: Hero view
      hoveredCard = null;
      smoothScrollToTop();

      const timeInChapter = elapsedTime;
      if (timeInChapter < 12) {
        alignPointerToElement("tour-header-logo", "Maison Curator Branding");
      } else if (timeInChapter >= 12 && timeInChapter < 24) {
        alignPointerToElement("tour-hero-headline", "Inspecting Typography Hierarchy");
      } else {
        alignPointerToElement("tour-hero-cta", "Focusing Call to Action");
      }

    } else if (elapsedTime >= 30 && elapsedTime < 70) {
      // Phase 2: Offerings Menu Scroll & Card interactions
      smoothScrollToElement('offerings-nav', 120);

      const timeInChapter = elapsedTime - 30; // 0 to 40 seconds range
      if (timeInChapter < 15) {
        hoveredCard = 'bridal-makeup'; // Heritage Bridal Artistry
        alignPointerToElement('bridal-makeup', "Observing Subtle Card Lift");
      } else if (timeInChapter >= 15 && timeInChapter < 30) {
        hoveredCard = 'spa-massage'; // Nirvana Deep Tissue Spa
        alignPointerToElement('spa-massage', "Inspecting 'Book Service' Glow");
      } else {
        hoveredCard = null;
        alignPointerToElement('offerings-nav', "Menu Layout Evaluated");
      }

    } else if (elapsedTime >= 70 && elapsedTime < 105) {
      // Phase 3: Mobile Resizing Showcases
      smoothScrollToElement('offerings-nav', 20);

      const timeInChapter = elapsedTime - 70; // 0 to 35 sec
      if (timeInChapter < 10) {
        alignPointerToElement('offerings-nav', "Reflowing Canvas Grid");
      } else if (timeInChapter >= 10 && timeInChapter < 25) {
        // Slow vertical scroll inside mobile viewport context
        smoothScrollToElement('spa-massage', 40);
        alignPointerToElement('spa-massage', "Simulating Mobile Touch Scroll");
      } else {
        alignPointerToElement('offerings-nav', "Grid Collapsed Successfully");
      }

    } else if (elapsedTime >= 105 && elapsedTime < 150) {
      // Phase 4: Business Viability Corporate Modal Interaction
      const timeInChapter = elapsedTime - 105; // 0 to 45 seconds

      if (timeInChapter < 10) {
        // Scroll down to Footer corporate channel trigger
        smoothScrollToElement('corporate-inquiry-button-trigger', 140);
        alignPointerToElement('corporate-inquiry-button-trigger', "Moving to Corporate Executive Channel");
      } else if (timeInChapter >= 10 && timeInChapter < 18) {
        // Activate "Click" on Corporate button
        smoothScrollToElement('corporate-inquiry-button-trigger', 140);
        alignPointerToElement('corporate-inquiry-button-trigger', "Triggering Corporate Portal Modal", true);
        
        // programmatically load the corporate modal with sleek typed fills
        onOpenCorporateModal({
          company: "Pune Unicorn Ventures Ltd.",
          email: "chief.wellbeing@unicornventures.com",
          details: "Maison salon curation requested for 24-guest general partners wellness retreat event on late December."
        });
      } else if (timeInChapter >= 18 && timeInChapter < 32) {
        // Simulated Form entry inspects
        setPointer({
          x: window.innerWidth * 0.48,
          y: window.innerHeight * 0.45,
          isVisible: true,
          isClicking: false
        });
        setPointerActionText("Form Verification Completed");
      } else if (timeInChapter >= 32 && timeInChapter < 40) {
        // Simulated Submit button trigger
        setPointer({
          x: window.innerWidth * 0.5,
          y: window.innerHeight * 0.65,
          isVisible: true,
          isClicking: true
        });
        setPointerActionText("Posting Encrypted Lead Request");
        
        // Fire custom callback if provided to show success in modal
        if (onTriggerDirectSuccess) {
          onTriggerDirectSuccess();
        }
      } else {
        // Modal completed!
        setPointer({
          x: window.innerWidth * 0.5,
          y: window.innerHeight * 0.35,
          isVisible: true,
          isClicking: false
        });
        setPointerActionText("Executive Receipt Generated");
      }
    }

    // Pass synchronized state modifiers upward to update main App's layout wrapper
    onTourStateChange({
      isActive: true,
      simulatedDevices: deviceState,
      hoveredCardId: hoveredCard
    });

  }, [elapsedTime, isTourActive, isPlaying, currentChapterIndex]);

  // Clean Audio on unmount
  useEffect(() => {
    return () => {
      stopLuxuryAmbientMusic();
      if (voiceSynth) voiceSynth.cancel();
    };
  }, []);

  // Format helper
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const progressPercentage = (elapsedTime / TOTAL_DURATION) * 100;

  return (
    <>
      {/* Subtle FLOATING LAUNCH BAR in top corner of screen when inactive */}
      <AnimatePresence>
        {!isTourActive && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <button
              onClick={handleTogglePlay}
              className="group flex items-center gap-2.5 bg-gradient-to-r from-charcoal-900 to-charcoal-950 text-gold-200 border border-gold-400/30 hover:border-gold-400 text-[11px] font-mono tracking-widest font-extrabold uppercase py-3.5 px-5 rounded-full shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
              </span>
              <Sparkles className="w-4 h-4 text-gold-400 group-hover:rotate-12 transition-transform" />
              <span>Interactive Presentation Tour</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Showcase overlay element */}
      <AnimatePresence>
        {isTourActive && (
          <div 
            id="interactive-tour-overlay"
            className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between"
          >
            {/* Top Status & Control Ribbon */}
            <div className="absolute top-4 left-4 right-4 bg-charcoal-900/95 backdrop-blur-md text-white border border-gold-400/25 p-4 rounded-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 pointer-events-auto z-50 max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="bg-gold-500/15 p-2 rounded-lg border border-gold-400/20">
                  <Sparkles className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gold-400 font-bold uppercase tracking-widest">Interactive Cinematic Tour</span>
                    <span className="bg-gold-400/25 text-gold-300 font-sans px-1.5 py-0.5 rounded text-[9px] font-bold">1080p FHD</span>
                  </div>
                  <h3 className="text-sm font-sans font-extrabold tracking-tight text-white mt-0.5">
                    {TOUR_CHAPTERS[currentChapterIndex].title}
                  </h3>
                </div>
              </div>

              {/* Progress and controls */}
              <div className="flex items-center gap-4">
                {/* Time Indicator */}
                <div className="text-right font-mono text-xs text-charcoal-300">
                  <span className="text-white font-bold">{formatTime(elapsedTime)}</span>
                  <span> / </span>
                  <span>{formatTime(TOTAL_DURATION)}</span>
                </div>

                {/* Progress bar container */}
                <div className="w-24 bg-charcoal-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gold-400 h-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Speed selector */}
                <div className="flex items-center border border-charcoal-705 bg-charcoal-950 rounded-lg p-0.5 text-[9px] font-mono">
                  {([1, 1.5, 2] as const).map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`px-2 py-1 rounded transition-all cursor-pointer ${
                        playbackSpeed === speed 
                          ? 'bg-gold-400 text-charcoal-950 font-bold' 
                          : 'text-charcoal-400 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                {/* Controls toolbar */}
                <div className="flex items-center gap-1.5 border-l border-charcoal-700/60 pl-3">
                  <button
                    onClick={handleTogglePlay}
                    className="p-1.5 bg-charcoal-800 hover:bg-gold-400 hover:text-charcoal-950 rounded text-gold-200 transition-all cursor-pointer"
                    title={isPlaying ? "Pause Tour" : "Play Tour"}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                  <button
                    onClick={handleResetTour}
                    className="p-1.5 bg-charcoal-800 hover:bg-gold-400 hover:text-charcoal-950 rounded text-gold-200 transition-all cursor-pointer"
                    title="Restart Tour"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleToggleMute}
                    className="p-1.5 bg-charcoal-800 hover:bg-gold-400 hover:text-charcoal-950 rounded text-gold-200 transition-all cursor-pointer"
                    title={isMuted ? "Unmute Voiceover" : "Mute Voiceover"}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleSkipForward}
                    className="p-1.5 bg-charcoal-800 hover:bg-gold-400 hover:text-charcoal-950 rounded text-gold-200 transition-all cursor-pointer"
                    title="Skip Section"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleEndTour}
                    className="p-1.5 bg-red-950 hover:bg-red-600 rounded text-red-200 border border-red-500/20 hover:text-white transition-all cursor-pointer"
                    title="Exit Tour"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Desktop Cursor Overlay */}
            {pointer.isVisible && (
              <div 
                className="absolute z-50 pointer-events-none transition-all duration-700 ease-out"
                style={{ 
                  left: `${pointer.x}px`, 
                  top: `${pointer.y}px` 
                }}
              >
                <div className="relative">
                  {/* Subtle Radar Ripple on click simulation */}
                  <span className={`absolute -left-3 -top-3 flex h-10 w-10 transition-all ${
                    pointer.isClicking ? 'scale-150 opacity-100' : 'scale-50 opacity-0'
                  }`}>
                    <span className="absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-60 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-10 w-10 bg-gold-500/20"></span>
                  </span>

                  {/* High Quality Luxury Mouse cursor design */}
                  <MousePointer className={`w-6 h-6 text-charcoal-950 drop-shadow-lg transform transition-transform duration-300 ${
                    pointer.isClicking ? 'scale-90 rotate-[-12deg]' : 'rotate-[-5deg] hover:scale-110'
                  }`} />
                  
                  {/* Pointer action label text box */}
                  {pointerActionText && (
                    <div className="absolute left-6 top-6 bg-charcoal-900 border border-gold-400/30 text-white font-mono text-[9px] uppercase tracking-wider font-extrabold px-2 py-1 rounded shadow-xl whitespace-nowrap">
                      {pointerActionText}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Luxury Cinema Subtitle Card */}
            <div className="absolute bottom-8 left-4 right-4 max-w-4xl mx-auto z-40 pointer-events-auto">
              <div className="bg-charcoal-950/95 backdrop-blur-lg border border-gold-400/35 p-6 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden">
                {/* Visual Accent glow line */}
                <span className="absolute top-0 left-0 h-[2px] bg-gold-400 animate-pulse w-full" />

                {/* Subtitle speaker details & profile badge */}
                <div className="flex sm:flex-col items-center sm:items-start text-center sm:text-left gap-3 shrink-0">
                  <div className="w-12 h-12 rounded-full border border-gold-400/40 bg-gold-50/10 flex items-center justify-center p-0.5">
                    <div className="w-full h-full bg-charcoal-900 text-gold-400 text-xs font-mono font-black italic rounded-full flex items-center justify-center">
                      M
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gold-500 font-bold block uppercase tracking-widest leading-none">Voiceover Concierge</span>
                    <span className="text-[9px] font-mono text-charcoal-400 block uppercase mt-0.5">Maison Guide AI Voice</span>
                  </div>
                </div>

                {/* Current word-by-word synced subtitle caption text block */}
                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                  <span className="text-[9px] font-mono text-gold-500 tracking-widest font-black uppercase inline-block border border-gold-400/20 px-2 py-0.5 rounded">AUDIO SUBTITLE TRANSLATION</span>
                  <p className="text-xs sm:text-sm text-charcoal-100 font-light leading-relaxed tracking-wide font-sans select-none italic">
                    "{TOUR_CHAPTERS[currentChapterIndex].caption}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
