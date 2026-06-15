import { connectToDatabase, isMockDb } from './db';
import Category from './models/Category';
import Product from './models/Product';
import Inquiry from './models/Inquiry';
import { mockDb } from './mockData';

// Helper to convert mongoose documents or mock documents to plain objects
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export async function getCategories() {
  await connectToDatabase();
  if (isMockDb()) {
    return serialize(await mockDb.getCategories());
  }
  try {
    const list = await Category.find({}).lean();
    return serialize(list);
  } catch (err) {
    console.error('Error fetching categories from DB, falling back to mock:', err);
    return serialize(await mockDb.getCategories());
  }
}

export async function getProducts(options?: { category?: string; query?: string; featured?: boolean }) {
  await connectToDatabase();
  if (isMockDb()) {
    let list = await mockDb.getProducts();
    if (options?.category) {
      list = list.filter((p) => p.category === options.category);
    }
    if (options?.featured !== undefined) {
      list = list.filter((p) => p.featured === options.featured);
    }
    if (options?.query) {
      const q = options.query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }
    return serialize(list);
  }

  try {
    const filter: any = {};
    if (options?.category) {
      filter.category = options.category;
    }
    if (options?.featured !== undefined) {
      filter.featured = options.featured;
    }
    if (options?.query) {
      filter.$or = [
        { name: { $regex: options.query, $options: 'i' } },
        { description: { $regex: options.query, $options: 'i' } },
        { sku: { $regex: options.query, $options: 'i' } }
      ];
    }
    const list = await Product.find(filter).lean();
    return serialize(list);
  } catch (err) {
    console.error('Error fetching products from DB, falling back to mock:', err);
    // fallback
    let list = await mockDb.getProducts();
    if (options?.category) {
      list = list.filter((p) => p.category === options.category);
    }
    if (options?.featured !== undefined) {
      list = list.filter((p) => p.featured === options.featured);
    }
    if (options?.query) {
      const q = options.query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }
    return serialize(list);
  }
}

export async function getProductById(id: string) {
  await connectToDatabase();
  if (isMockDb() || id.startsWith('prod-')) {
    return serialize(await mockDb.getProductById(id));
  }
  try {
    const p = await Product.findById(id).lean();
    if (p) return serialize(p);
    return serialize(await mockDb.getProductById(id));
  } catch (error) {
    // Fallback search in mock in case ID is a mock ID format
    return serialize(await mockDb.getProductById(id));
  }
}

export async function getProductBySlug(slug: string) {
  await connectToDatabase();
  if (isMockDb()) {
    return serialize(await mockDb.getProductBySlug(slug));
  }
  try {
    const p = await Product.findOne({ slug }).lean();
    if (p) return serialize(p);
    return serialize(await mockDb.getProductBySlug(slug));
  } catch (error) {
    return serialize(await mockDb.getProductBySlug(slug));
  }
}

export async function getInquiries() {
  await connectToDatabase();
  if (isMockDb()) {
    return serialize(await mockDb.getInquiries());
  }
  try {
    const list = await Inquiry.find({}).sort({ createdAt: -1 }).lean();
    return serialize(list);
  } catch (err) {
    console.error('Error fetching inquiries from DB, falling back to mock:', err);
    return serialize(await mockDb.getInquiries());
  }
}

export async function getPaginatedProducts(options: { category: string; page: number; limit: number }) {
  await connectToDatabase();
  const skip = (options.page - 1) * options.limit;

  if (isMockDb()) {
    const all = await mockDb.getProducts();
    const filtered = all.filter((p) => p.category === options.category);
    const paginated = filtered.slice(skip, skip + options.limit);
    return {
      products: serialize(paginated),
      total: filtered.length
    };
  }

  try {
    const query = { category: options.category };
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(options.limit).lean(),
      Product.countDocuments(query)
    ]);
    return {
      products: serialize(products),
      total
    };
  } catch (err) {
    console.error('Error paginating products, falling back to mock:', err);
    const all = await mockDb.getProducts();
    const filtered = all.filter((p) => p.category === options.category);
    const paginated = filtered.slice(skip, skip + options.limit);
    return {
      products: serialize(paginated),
      total: filtered.length
    };
  }
}
