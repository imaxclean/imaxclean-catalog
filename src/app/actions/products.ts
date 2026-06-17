'use server';

import { connectToDatabase, isMockDb } from '@/lib/db';
import Product from '@/lib/models/Product';
import Inquiry from '@/lib/models/Inquiry';
import { mockDb } from '@/lib/mockData';
import { getSession } from '@/lib/session';
import { revalidatePath as nextRevalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isCloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name_here' &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'your_api_key_here' &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== 'your_api_secret_here'
  );
}

async function saveUploadedFile(file: any): Promise<string | null> {
  if (!file || typeof file !== 'object' || !('arrayBuffer' in file) || file.size === 0) {
    return null;
  }
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    if (isCloudinaryConfigured()) {
      return new Promise((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'imaxclean_catalog',
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              resolve(null);
            } else {
              resolve(result?.secure_url || null);
            }
          }
        );
        uploadStream.end(buffer);
      });
    }

    // Local fallback if Cloudinary is not configured
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.name || 'image.jpg') || '.jpg';
    const filename = `${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error saving uploaded file:', error);
    return null;
  }
}

export type ActionState = {
  errors?: {
    [key: string]: string[];
  };
  success?: boolean;
  message?: string;
};

// Action to submit a quote request
export async function submitInquiry(prevState: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const clientName = formData.get('clientName') as string;
  const clientEmail = formData.get('clientEmail') as string;
  const clientCompany = formData.get('clientCompany') as string;
  const clientPhone = formData.get('clientPhone') as string;
  const notes = formData.get('notes') as string;
  const itemsJson = formData.get('items') as string;

  const errors: ActionState['errors'] = {};

  if (!clientName || clientName.trim().length < 2) {
    errors.clientName = ['Name must be at least 2 characters long.'];
  }
  if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
    errors.clientEmail = ['Please enter a valid email address.'];
  }
  if (!clientCompany || clientCompany.trim().length < 2) {
    errors.clientCompany = ['Company name is required.'];
  }
  if (!clientPhone || clientPhone.trim().length < 5) {
    errors.clientPhone = ['A valid phone number is required.'];
  }

  let items = [];
  try {
    items = JSON.parse(itemsJson || '[]');
  } catch (e) {
    errors.form = ['Invalid cart items.'];
  }

  if (items.length === 0) {
    errors.form = ['Your inquiry cart is empty. Please add products to request a quote.'];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  await connectToDatabase();

  try {
    const inquiryData = {
      clientName,
      clientEmail,
      clientCompany,
      clientPhone,
      notes,
      items: items.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity
      }))
    };

    if (isMockDb()) {
      await mockDb.addInquiry(inquiryData);
    } else {
      await Inquiry.create(inquiryData);
    }

    return {
      success: true,
      message: 'Your quote request has been submitted successfully. A representative will contact you shortly!'
    };
  } catch (error: any) {
    console.error('Inquiry submission error:', error);
    return {
      errors: { form: ['Something went wrong while submitting your inquiry. Please try again.'] }
    };
  }
}

// Action to submit a review
export async function submitReview(productId: string, rating: number, comment: string): Promise<ActionState> {
  const session = await getSession();
  if (!session) {
    return { errors: { form: ['You must be logged in to leave a review.'] } };
  }

  if (!comment || comment.trim().length < 5) {
    return { errors: { comment: ['Comment must be at least 5 characters.'] } };
  }

  await connectToDatabase();

  try {
    if (isMockDb() || productId.startsWith('prod-')) {
      const added = await mockDb.addReview(productId, {
        user: session.name,
        rating,
        comment
      });
      if (!added) return { errors: { form: ['Product not found.'] } };
    } else {
      const product = await Product.findById(productId);
      if (!product) return { errors: { form: ['Product not found.'] } };
      
      product.reviews.push({
        user: session.name,
        rating,
        comment,
        createdAt: new Date()
      });

      // Recalculate average rating
      const totalRating = product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      product.rating = parseFloat((totalRating / product.reviews.length).toFixed(1));

      await product.save();
    }

    nextRevalidatePath(`/products/${productId}`);
    return { success: true, message: 'Review submitted successfully.' };
  } catch (error) {
    console.error('Submit review error:', error);
    return { errors: { form: ['An error occurred. Please try again.'] } };
  }
}

// Action for Admin to create a product
export async function createProduct(prevState: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { errors: { form: ['Unauthorized. Admin privilege required.'] } };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const quantityVal = formData.get('quantity') as string;
  const priceVal = formData.get('price') as string;
  const category = formData.get('category') as string;
  const specsJson = formData.get('specs') as string;
  const image = formData.get('image') as string;
  const imageFile = formData.get('imageFile');

  let imageUrl = image;
  if (imageFile) {
    const uploadedPath = await saveUploadedFile(imageFile);
    if (uploadedPath) imageUrl = uploadedPath;
  }

  const errors: ActionState['errors'] = {};

  if (!name || name.trim().length < 3) errors.name = ['Name is too short.'];
  if (!description || description.trim().length < 10) errors.description = ['Description is too short.'];
  if (!priceVal || isNaN(parseFloat(priceVal))) errors.price = ['A valid price is required.'];
  if (!category) errors.category = ['Category is required.'];

  let specs = [];
  try {
    specs = JSON.parse(specsJson || '[]');
  } catch (e) {
    errors.specs = ['Invalid specs JSON format.'];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  await connectToDatabase();

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const price = parseFloat(priceVal);
  // Auto-generate a unique SKU under the hood for DB compatibility and integrity
  const sku = 'IMX-' + slug.toUpperCase().slice(0, 10) + '-' + Math.floor(1000 + Math.random() * 9000);
  const quantity = quantityVal || undefined;

  const productData = {
    name,
    slug,
    description,
    sku,
    quantity,
    price,
    category,
    images: [imageUrl || '/products/scrubber.svg'],
    specs,
    stock: 'In Stock' as const,
    featured: false
  };

  try {
    if (isMockDb()) {
      await mockDb.addProduct(productData);
    } else {
      await Product.create(productData);
    }

    nextRevalidatePath('/products');
    nextRevalidatePath('/admin');
    return { success: true, message: 'Product created successfully!' };
  } catch (error: any) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      return { errors: { sku: ['This SKU or slug already exists.'] } };
    }
    return { errors: { form: ['An error occurred while creating the product.'] } };
  }
}

// Action for Admin to delete a product
export async function deleteProduct(id: string): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { errors: { form: ['Unauthorized.'] } };
  }

  await connectToDatabase();

  try {
    if (isMockDb() || id.startsWith('prod-')) {
      await mockDb.deleteProduct(id);
    } else {
      await Product.findByIdAndDelete(id);
    }

    nextRevalidatePath('/');
    nextRevalidatePath('/admin');
    return { success: true, message: 'Product deleted successfully.' };
  } catch (error) {
    console.error('Delete product error:', error);
    return { errors: { form: ['An error occurred.'] } };
  }
}

// Action for Admin to update an existing product
export async function updateProduct(id: string, prevState: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { errors: { form: ['Unauthorized. Admin privilege required.'] } };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const quantityVal = formData.get('quantity') as string;
  const priceVal = formData.get('price') as string;
  const category = formData.get('category') as string;
  const specsJson = formData.get('specs') as string;
  const image = formData.get('image') as string;
  const imageFile = formData.get('imageFile');
  const stock = formData.get('stock') as string;

  let imageUrl = image;
  if (imageFile) {
    const uploadedPath = await saveUploadedFile(imageFile);
    if (uploadedPath) imageUrl = uploadedPath;
  }

  const errors: ActionState['errors'] = {};
  if (!name || name.trim().length < 3) errors.name = ['Name is too short.'];
  if (!description || description.trim().length < 10) errors.description = ['Description is too short.'];
  if (!priceVal || isNaN(parseFloat(priceVal))) errors.price = ['A valid price is required.'];
  if (!category) errors.category = ['Category is required.'];

  let specs = [];
  try {
    specs = JSON.parse(specsJson || '[]');
  } catch (e) {
    errors.specs = ['Invalid specs format.'];
  }

  if (Object.keys(errors).length > 0) return { errors };

  await connectToDatabase();

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const price = parseFloat(priceVal);
  const quantity = quantityVal || null;

  try {
    const updateData: any = { name, slug, description, price, category, specs, quantity };
    if (imageUrl) updateData.images = [imageUrl];
    if (stock) updateData.stock = stock;

    if (isMockDb()) {
      return { errors: { form: ['Cannot update in mock mode.'] } };
    }
    await Product.findByIdAndUpdate(id, updateData);

    nextRevalidatePath('/');
    nextRevalidatePath('/admin');
    return { success: true, message: 'Product updated successfully!' };
  } catch (error: any) {
    console.error('Update product error:', error);
    if (error.code === 11000) return { errors: { sku: ['This SKU or slug already exists.'] } };
    return { errors: { form: ['An error occurred while updating the product.'] } };
  }
}

// Action for Admin to update inquiry status
export async function updateInquiryStatus(id: string, status: 'Pending' | 'Contacted' | 'Closed'): Promise<ActionState> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { errors: { form: ['Unauthorized.'] } };
  }

  await connectToDatabase();

  try {
    if (isMockDb() || id.startsWith('inq-')) {
      await mockDb.updateInquiryStatus(id, status);
    } else {
      await Inquiry.findByIdAndUpdate(id, { status });
    }

    nextRevalidatePath('/admin');
    return { success: true, message: 'Inquiry status updated successfully.' };
  } catch (error) {
    console.error('Update inquiry error:', error);
    return { errors: { form: ['An error occurred.'] } };
  }
}
