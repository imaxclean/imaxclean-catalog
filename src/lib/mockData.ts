export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface Review {
  _id: string;
  user: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  quantity?: string;
  price: number;
  category: string;
  images: string[];
  specs: { key: string; value: string }[];
  stock: 'In Stock' | 'Low Stock' | 'Out of Stock';
  featured: boolean;
  rating: number;
  reviews: Review[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'customer';
}

export interface InquiryItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
}

export interface Inquiry {
  _id: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  clientPhone: string;
  notes?: string;
  items: InquiryItem[];
  status: 'Pending' | 'Contacted' | 'Closed';
  createdAt: string;
}

// Global store to persist changes during development server lifetime
let globalStore = (global as any).mockDbStoreV3;

if (!globalStore) {
  const initialCategories: Category[] = [
    {
      _id: 'cat-1',
      name: 'Industrial Equipment',
      slug: 'industrial-equipment',
      description: 'High-performance scrubber driers, professional jetters, steam generators, and heavy-duty vacuums.',
      image: 'industrial-equipment'
    },
    {
      _id: 'cat-2',
      name: 'Chemical Solutions',
      slug: 'chemical-solutions',
      description: 'Industrial-strength concentrated degreasers, sanitizers, and high-gloss floor coatings.',
      image: 'chemical-solutions'
    },
    {
      _id: 'cat-3',
      name: 'Janitorial Supplies',
      slug: 'janitorial-supplies',
      description: 'Ergonomic service trolleys, split-fiber microfiber setups, and professional-grade squeegees.',
      image: 'janitorial-supplies'
    }
  ];

  const initialProducts: Product[] = [
    // Industrial Equipment
    {
      _id: 'prod-1',
      name: 'Imaxclean Pro-Scrub 85D',
      slug: 'imaxclean-pro-scrub-85d',
      description: 'Heavy-duty ride-on floor scrubber drier designed for warehouses, logistical depots, and manufacturing facilities. Features double-disk brushes with an 850mm cleaning path, a 120L solution tank, and smart water-recycling loops that cut resource consumption by 40%.',
      sku: 'IMX-EQ-PS85D',
      price: 12499.00,
      category: 'industrial-equipment',
      images: ['https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=600&q=80'],
      specs: [
        { key: 'Power Source', value: '24V / 240Ah Gel Battery' },
        { key: 'Cleaning Width', value: '850 mm' },
        { key: 'Squeegee Width', value: '1100 mm' },
        { key: 'Max Productivity', value: '5,100 m²/h' },
        { key: 'Weight', value: '380 kg (with batteries)' }
      ],
      stock: 'In Stock',
      featured: true,
      rating: 4.8,
      reviews: [
        {
          _id: 'rev-1',
          user: 'David Miller (Logistics Manager)',
          rating: 5,
          comment: 'Outstanding performance. Cleans our 10,000 sqm warehouse floor in a fraction of the time. The battery life easily lasts a full shift.',
          createdAt: '2026-05-10T10:30:00Z'
        }
      ]
    },
    {
      _id: 'prod-2',
      name: 'Imaxclean Hydro-Blast 250',
      slug: 'imaxclean-hydro-blast-250',
      description: 'Professional cold-water high-pressure jet washer designed for facade cleaning, fleet washing, and industrial equipment degreasing. Equipped with a triple-plunger ceramic pump, heavy-duty steel protection frame, and auto-stop trigger.',
      sku: 'IMX-EQ-HB250',
      price: 2450.00,
      category: 'industrial-equipment',
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'],
      specs: [
        { key: 'Working Pressure', value: '250 bar / 3625 PSI' },
        { key: 'Water Flow Rate', value: '900 L/h' },
        { key: 'Motor Power', value: '5.5 kW (3-Phase)' },
        { key: 'Hose Length', value: '15 m Steel-reinforced' }
      ],
      stock: 'In Stock',
      featured: true,
      rating: 4.9,
      reviews: []
    },
    {
      _id: 'prod-3',
      name: 'Imaxclean SteamVap 10',
      slug: 'imaxclean-steamvap-10',
      description: 'Commercial dry steam generator with continuous flow boiler. Reaches 180°C and 10 bar pressure, providing chemical-free disinfection and deep grease melting. Ideal for food preparation facilities and sensitive engineering settings.',
      sku: 'IMX-EQ-SV10',
      price: 3899.00,
      category: 'industrial-equipment',
      images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80'],
      specs: [
        { key: 'Steam Pressure', value: '10 bar' },
        { key: 'Boiler Temp', value: '180 °C' },
        { key: 'Boiler Capacity', value: '3.5 L' },
        { key: 'Weight', value: '32 kg' }
      ],
      stock: 'Low Stock',
      featured: false,
      rating: 4.6,
      reviews: []
    },
    {
      _id: 'prod-4',
      name: 'Imaxclean Cyclone 70L',
      slug: 'imaxclean-cyclone-70l',
      description: 'Heavy-duty wet and dry industrial vacuum cleaner. Features dual bypass motors providing extreme suction power, a robust stainless steel tank with a tilting chassis, and a drainage hose for quick liquid disposal.',
      sku: 'IMX-EQ-CY70L',
      price: 899.00,
      category: 'industrial-equipment',
      images: ['https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80'],
      specs: [
        { key: 'Tank Capacity', value: '70 Liters' },
        { key: 'Motor Power', value: '2400 W (Dual Motors)' },
        { key: 'Suction Airflow', value: '120 L/s' },
        { key: 'Tank Material', value: 'Stainless Steel' }
      ],
      stock: 'In Stock',
      featured: true,
      rating: 4.7,
      reviews: []
    },
    // Chemical Solutions
    {
      _id: 'prod-5',
      name: 'Imaxclean EcoDegreaser Gold',
      slug: 'imaxclean-ecodegreaser-gold',
      description: 'Super-concentrated, biodegradable alkaline degreaser. Formulated with organic citrus extracts to cut through thick industrial grease, oils, carbon stains, and food fats. Solvent-free and safe for food-processing plants.',
      sku: 'IMX-CH-EDG05',
      price: 45.00,
      category: 'chemical-solutions',
      images: ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80'],
      specs: [
        { key: 'pH Level', value: '11.5 (Alkaline)' },
        { key: 'Dilution Ratio', value: '1:10 to 1:100' },
        { key: 'Biodegradability', value: '98% (OECD 301B)' },
        { key: 'Volume', value: '5 Liters (Concentrate)' }
      ],
      stock: 'In Stock',
      featured: true,
      rating: 4.7,
      reviews: []
    },
    {
      _id: 'prod-6',
      name: 'Imaxclean BioSan Sanitizer',
      slug: 'imaxclean-biosan-sanitizer',
      description: 'Hospital-grade neutral quaternary ammonium disinfectant. Formulated to kill 99.999% of bacteria, viruses, and molds in under 60 seconds. Safe for all hard surfaces, requiring no rinsing after application.',
      sku: 'IMX-CH-BSMS5',
      price: 38.00,
      category: 'chemical-solutions',
      images: ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80'],
      specs: [
        { key: 'pH Level', value: '7.0 (Neutral)' },
        { key: 'Contact Time', value: '60 seconds' },
        { key: 'Certifications', value: 'EN 1276, EN 14476' },
        { key: 'Volume', value: '5 Liters' }
      ],
      stock: 'In Stock',
      featured: false,
      rating: 4.5,
      reviews: []
    },
    {
      _id: 'prod-7',
      name: 'Imaxclean FloorSheen Wax',
      slug: 'imaxclean-floorsheen-wax',
      description: 'Premium ultra-high gloss floor emulsion wax. Contains 22% solids for maximum floor protection and brilliant light reflectivity. Resistant to scuffs and heel marks, ideal for high-traffic hospital corridors and retail halls.',
      sku: 'IMX-CH-FSW05',
      price: 65.00,
      category: 'chemical-solutions',
      images: ['https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80'],
      specs: [
        { key: 'Solids Content', value: '22%' },
        { key: 'Coverage Rate', value: 'Approx. 250 m² per 5L' },
        { key: 'Drying Time', value: '30 minutes' },
        { key: 'Gloss Level', value: 'Ultra-High Reflective' }
      ],
      stock: 'In Stock',
      featured: true,
      rating: 4.6,
      reviews: []
    },
    // Janitorial Supplies
    {
      _id: 'prod-8',
      name: 'Imaxclean SmartCart 300',
      slug: 'imaxclean-smartcart-300',
      description: 'Professional janitorial workstation cart made from high-density structural plastic that will not dent or rust. Features locking cabinets, quiet non-marking swivel wheels, color-coded 18L buckets, and mop-handle holders.',
      sku: 'IMX-JT-SC300',
      price: 580.00,
      category: 'janitorial-supplies',
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'],
      specs: [
        { key: 'Material', value: 'Heavy-Duty Structural Web Plastic' },
        { key: 'Dimensions', value: '120 x 55 x 100 cm' },
        { key: 'Buckets', value: '2x 18L (Red & Blue)' },
        { key: 'Castors', value: '4x 100mm Swivel (2 with brakes)' }
      ],
      stock: 'In Stock',
      featured: true,
      rating: 4.8,
      reviews: []
    },
    {
      _id: 'prod-9',
      name: 'Imaxclean Micro-Ultra Cloths',
      slug: 'imaxclean-micro-ultra-cloths',
      description: 'Bulk pack of premium split-fiber microfiber cleaning cloths. High absorption density picks up to 7 times its weight in dirt and moisture. Color-coded pack helps cleaning teams prevent cross-contamination.',
      sku: 'IMX-JT-MUC50',
      price: 24.50,
      category: 'janitorial-supplies',
      images: ['https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80'],
      specs: [
        { key: 'Material Density', value: '320 GSM split-fiber' },
        { key: 'Composition', value: '80% Polyester / 20% Polyamide' },
        { key: 'Dimensions', value: '40 x 40 cm' },
        { key: 'Pack Size', value: '50 Cloths (Color-Assorted)' }
      ],
      stock: 'In Stock',
      featured: false,
      rating: 4.7,
      reviews: []
    },
    {
      _id: 'prod-10',
      name: 'Imaxclean ErgoSqueegee 55',
      slug: 'imaxclean-ergosqueegee-55',
      description: 'Professional-grade floor squeegee featuring an anodized aluminum frame and a double moss rubber blade. Effectively removes liquids and residues on uneven tile floors, concrete surfaces, and pool decks.',
      sku: 'IMX-JT-ES55',
      price: 32.00,
      category: 'janitorial-supplies',
      images: ['https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80'],
      specs: [
        { key: 'Blade Material', value: 'Double Moss Rubber' },
        { key: 'Frame Material', value: 'Anodized Aluminum' },
        { key: 'Blade Width', value: '550 mm' },
        { key: 'Handle Socket', value: 'Universal taper' }
      ],
      stock: 'In Stock',
      featured: false,
      rating: 4.4,
      reviews: []
    }
  ];

  const initialUsers: User[] = [
    {
      _id: 'usr-1',
      name: 'Admin User',
      email: 'admin@imaxclean.com',
      passwordHash: '$2a$10$WqB8i0s8q6x1Q9zP4r5mTeK3x5S4Pj3C7p/OqJ9mZq/6Nq6R7H7hO',
      role: 'admin'
    },
    {
      _id: 'usr-2',
      name: 'Customer Account',
      email: 'customer@imaxclean.com',
      passwordHash: '$2a$10$wK1F5N8O8jNq6R7H7hO6TeK3x5S4Pj3C7p/OqJ9mZq/6Nq6R7H7hO',
      role: 'customer'
    }
  ];

  const initialInquiries: Inquiry[] = [];

  globalStore = (global as any).mockDbStoreV3 = {
    categories: initialCategories,
    products: initialProducts,
    users: initialUsers,
    inquiries: initialInquiries
  };
}

export const mockDb = {
  getCategories: async (): Promise<Category[]> => {
    return [...globalStore.categories];
  },
  addCategory: async (category: Omit<Category, '_id'>): Promise<Category> => {
    const newCat = { ...category, _id: `cat-${Date.now()}` };
    globalStore.categories.push(newCat);
    return newCat;
  },
  getProducts: async (): Promise<Product[]> => {
    return [...globalStore.products];
  },
  getProductById: async (id: string): Promise<Product | null> => {
    const p = globalStore.products.find((prod: Product) => prod._id === id);
    return p ? { ...p } : null;
  },
  getProductBySlug: async (slug: string): Promise<Product | null> => {
    const p = globalStore.products.find((prod: Product) => prod.slug === slug);
    return p ? { ...p } : null;
  },
  addProduct: async (product: Omit<Product, '_id' | 'rating' | 'reviews'>): Promise<Product> => {
    const newProd: Product = {
      ...product,
      _id: `prod-${Date.now()}`,
      rating: 5,
      reviews: []
    };
    globalStore.products.push(newProd);
    return newProd;
  },
  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    const index = globalStore.products.findIndex((prod: Product) => prod._id === id);
    if (index === -1) return null;
    const updated = { ...globalStore.products[index], ...updates };
    globalStore.products[index] = updated;
    return updated;
  },
  deleteProduct: async (id: string): Promise<boolean> => {
    const initialLen = globalStore.products.length;
    globalStore.products = globalStore.products.filter((prod: Product) => prod._id !== id);
    return globalStore.products.length < initialLen;
  },
  addReview: async (productId: string, review: { user: string; rating: number; comment: string }): Promise<Review | null> => {
    const product = globalStore.products.find((prod: Product) => prod._id === productId);
    if (!product) return null;
    
    const newReview: Review = {
      _id: `rev-${Date.now()}`,
      user: review.user,
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date().toISOString()
    };
    
    product.reviews.push(newReview);
    const totalRating = product.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0);
    product.rating = parseFloat((totalRating / product.reviews.length).toFixed(1));
    
    return newReview;
  },
  getInquiries: async (): Promise<Inquiry[]> => {
    return [...globalStore.inquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  addInquiry: async (inquiry: Omit<Inquiry, '_id' | 'status' | 'createdAt'>): Promise<Inquiry> => {
    const newInquiry: Inquiry = {
      ...inquiry,
      _id: `inq-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    globalStore.inquiries.push(newInquiry);
    return newInquiry;
  },
  updateInquiryStatus: async (id: string, status: Inquiry['status']): Promise<Inquiry | null> => {
    const inq = globalStore.inquiries.find((i: Inquiry) => i._id === id);
    if (!inq) return null;
    inq.status = status;
    return { ...inq };
  },
  getUserByEmail: async (email: string): Promise<User | null> => {
    const u = globalStore.users.find((user: User) => user.email.toLowerCase() === email.toLowerCase());
    return u ? { ...u } : null;
  },
  addUser: async (user: Omit<User, '_id'>): Promise<User> => {
    const newUser = { ...user, _id: `usr-${Date.now()}` };
    globalStore.users.push(newUser);
    return newUser;
  }
};
