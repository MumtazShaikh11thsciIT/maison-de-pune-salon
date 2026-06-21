import { ServiceItem, Stylist, PuneLocation } from './types';

export const SERVICES: ServiceItem[] = [
  {
    id: 'bridal-makeup',
    category: 'bridal',
    title: 'Heritage Bridal Artistry',
    tagline: 'Pune’s premium bridal service',
    description: 'A bespoke, holistic bridal styling experience. Includes customized facial maps, authentic Indian traditional or modern fusion luxury makeup, luxury lash applications, hair styling, and dupatta draping done by real master-artists.',
    price: 18500,
    duration: 180,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800',
    features: [
      'Personal pre-consultation and custom face mapping',
      'Premium HD / Airbrush products (Chanel, Dior, Estée Lauder)',
      'Luxury mink-touch eyelash extensions',
      'Exclusive high-strength long-stay locking mist',
      'Professional dupatta/saree draping'
    ]
  },
  {
    id: 'spa-massage',
    category: 'spa',
    title: 'Nirvana Deep Tissue Spa',
    tagline: 'Rejuvenation in your own sanctuary',
    description: 'An ultra-soothing, deep bodily release utilizing premium heated Ayurvedic or volcanic basalt stones and pure organic essential oils. Designed to melt away mental overload and physical tension in the comfort of your home.',
    price: 3600,
    duration: 90,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    features: [
      'Heated organic sesame or lavender-infused carrier oils',
      'Heated basalt stone point decompression',
      'Damp hot herbal compress towels',
      'Aromatic ambient soundscapes (loaded on wireless expert speakers)',
      'Complimentary soothing chamomile post-tea brew'
    ]
  },
  {
    id: 'hair-styling',
    category: 'hair',
    title: 'Couture Blowout & Styling',
    tagline: 'Sculpted by hand to perfection',
    description: 'Premium red-carpet grade hair blowout, styling, or texturizing using professional Dyson Supersonic devices. Customized entirely based on your individual hair length, texture, and style goals.',
    price: 2400,
    duration: 60,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    features: [
      'Professional Dyson & Oribe styling product kit',
      'Argan & keratin thermal defense infusion pre-spray',
      'Volumizing bounce blowout or sleek high-symmetry straight finish',
      'Scalp activation micro-massage (5 mins)',
      'Polishing serum sealing coat'
    ]
  },
  {
    id: 'skin-facial',
    category: 'skin',
    title: 'Luminous Glow Caviar Facial',
    tagline: 'A supreme skin transformation',
    description: 'A luxurious cosmetic treatment integrating high-efficacy botanical extracts, caviar-infused serums, and soft professional micro-current stimulation to restore ultimate radiance, hydration, and youthful bounce to your skin.',
    price: 4200,
    duration: 75,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800',
    features: [
      'Gentle dual-phrase enzyme deep exfoliation',
      'Caviar & multi-peptide active firming serums',
      'Soft micro-current contour massage stimulation',
      'Hydrating cooling algae peel-off mask',
      'Under-eye anti-fatigue crystal hydration pad'
    ]
  }
];

export const STYLISTS: Stylist[] = [
  {
    id: 'ananya-sen',
    name: 'Ananya Sen',
    role: 'Master Makeup Designer',
    rating: 4.95,
    completedJobs: 412,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    specialties: ['Bridal Contour', 'HD Airbrush', 'Glass Skin Finish'],
    bio: 'With over 8 years in commercial fashion and luxury weddings, Ananya is Pune’s premier choice for pristine traditional Maharashtrian or elegant modern Indian bridal visuals.'
  },
  {
    id: 'rahul-patil',
    name: 'Rahul Patil',
    role: 'Senior Hair Artisan',
    rating: 4.88,
    completedJobs: 580,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    specialties: ['Dyson Sculpting', 'Volumizing Blowouts', 'Keratin Therapy'],
    bio: 'Rahul trained in Paris and London, specializing in couture blowouts, structured hair design, and high-fashion hair texturizing for Pune’s elite list.'
  },
  {
    id: 'sarah-dsouza',
    name: 'Sarah D’Souza',
    role: 'Elite Spa & Wellness Guide',
    rating: 4.97,
    completedJobs: 330,
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    specialties: ['Aromatherapy', 'Deep Tissue Release', 'Ayurvedic compress'],
    bio: 'Instructed in classical Swedish and ancient Keralite therapy, Sarah brings a deep-rooted focus on neurological calmness, tailored tension release, and premium hygiene.'
  },
  {
    id: 'rohan-deshmukh',
    name: 'Rohan Deshmukh',
    role: 'Senior Esthetician',
    rating: 4.91,
    completedJobs: 290,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    specialties: ['Microcurrent Skincare', 'Peptide Facials', 'Lymphatic Detox'],
    bio: 'Rohan focuses on clinical botanical skin integrations, using sophisticated technology and organic actives to create immediate youthfulness and visual luminosity.'
  }
];

export const PUNE_LOCATIONS: PuneLocation[] = [
  {
    id: 'koregaon-park',
    name: 'Koregaon Park',
    region: 'East Pune',
    description: 'High-end leafy lanes, premium resident sector & upscale standard delivery.'
  },
  {
    id: 'kalyani-nagar',
    name: 'Kalyani Nagar',
    region: 'East Pune',
    description: 'Prestigious residential complexes nearby Trump Towers.'
  },
  {
    id: 'baner',
    name: 'Baner & Balewadi',
    region: 'West Pune',
    description: 'Modern executive high-rises and luxury IT-corridor residences.'
  },
  {
    id: 'viman-nagar',
    name: 'Viman Nagar',
    region: 'East Pune',
    description: 'Luxury apartments and high-density luxury pockets.'
  },
  {
    id: 'kothrud',
    name: 'Kothrud & Erandwane',
    region: 'West Pune',
    description: 'Vibrant cultural, premium leafy avenues and residential heart.'
  },
  {
    id: 'prabhat-road',
    name: 'Prabhat Road & Deccan',
    region: 'Central Pune',
    description: 'Highly exclusive traditional heritage luxury bungalows.'
  },
  {
    id: 'aundh',
    name: 'Aundh & Senapati Bapat Rd',
    region: 'West Pune',
    description: 'Tree-lined luxury villas and premium apartments.'
  }
];

export const TIME_SLOTS: string[] = [
  '08:00 AM - 10:00 AM (Early Calm)',
  '10:30 AM - 12:30 PM (Mid Morning)',
  '01:00 PM - 03:00 PM (Afternoon Solace)',
  '03:30 PM - 05:30 PM (Sunset Rejuvenation)',
  '06:00 PM - 08:00 PM (Evening Radiance)',
  '08:30 PM - 10:30 PM (Late Night Ease)'
];
