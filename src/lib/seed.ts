import { connectToDatabase, isMockDb } from './db';
import Category from './models/Category';
import Product from './models/Product';
import User from './models/User';
import bcrypt from 'bcryptjs';

const initialCategories = [
  {
    name: 'Industrial Equipment',
    slug: 'industrial-equipment',
    description: 'High-performance scrubber driers, professional jetters, steam generators, and heavy-duty vacuums.',
    image: 'industrial-equipment'
  },
  {
    name: 'Chemical Solutions',
    slug: 'chemical-solutions',
    description: 'Industrial-strength concentrated degreasers, sanitizers, and high-gloss floor coatings.',
    image: 'chemical-solutions'
  },
  {
    name: 'Janitorial Supplies',
    slug: 'janitorial-supplies',
    description: 'Ergonomic service trolleys, split-fiber microfiber setups, and professional-grade squeegees.',
    image: 'janitorial-supplies'
  }
];

const initialProducts = [
  // Industrial Equipment
  {
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
    reviews: []
  },
  {
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

export async function seedDatabase() {
  await connectToDatabase();

  if (isMockDb()) {
    console.log('Seed warning: cannot seed a mock in-memory database.');
    return;
  }

  try {
    console.log('Atlas Connected! Resetting and Seeding database collections...');

    // Clear old tables entirely to prevent duplicates
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({})
    ]);

    console.log('Old collections cleared.');

    // Seed Categories
    await Category.insertMany(initialCategories);
    console.log('Seeded categories successfully.');

    // Seed Products
    await Product.insertMany(initialProducts);
    console.log('Seeded products successfully.');

    // Seed Default Portal Users (Hashed)
    const adminHash = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@imaxclean.com',
      passwordHash: adminHash,
      role: 'admin'
    });

    const customerHash = await bcrypt.hash('customer123', 10);
    await User.create({
      name: 'Customer Account',
      email: 'customer@imaxclean.com',
      passwordHash: customerHash,
      role: 'customer'
    });

    console.log('Seeded portal users successfully.');
    console.log('Database seeding completely successful.');
  } catch (error) {
    console.error('Critical database seeding error:', error);
  }
}
