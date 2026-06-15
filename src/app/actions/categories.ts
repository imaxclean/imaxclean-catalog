'use server';

import { connectToDatabase, isMockDb } from '@/lib/db';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export type CategoryActionState = {
  errors?: { [key: string]: string[] };
  success?: boolean;
  message?: string;
};

function requireAdmin() {
  return getSession().then(session => {
    if (!session || session.role !== 'admin') {
      throw new Error('Unauthorized');
    }
  });
}

export async function createCategory(
  prevState: CategoryActionState | undefined,
  formData: FormData
): Promise<CategoryActionState> {
  try { await requireAdmin(); } catch { return { errors: { form: ['Unauthorized.'] } }; }

  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();

  const errors: CategoryActionState['errors'] = {};
  if (!name || name.length < 2) errors.name = ['Name must be at least 2 characters.'];
  if (!description || description.length < 5) errors.description = ['Description is required.'];
  if (Object.keys(errors).length > 0) return { errors };

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  await connectToDatabase();

  try {
    if (isMockDb()) {
      return { errors: { form: ['Cannot create category in mock mode.'] } };
    }
    await Category.create({ name, slug, description, image: slug });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, message: `Category "${name}" created successfully.` };
  } catch (err: any) {
    if (err.code === 11000) return { errors: { name: ['A category with this name/slug already exists.'] } };
    console.error('createCategory error:', err);
    return { errors: { form: ['Failed to create category.'] } };
  }
}

export async function updateCategory(
  id: string,
  name: string,
  description: string
): Promise<CategoryActionState> {
  try { await requireAdmin(); } catch { return { errors: { form: ['Unauthorized.'] } }; }

  name = name.trim();
  description = description.trim();

  if (!name || name.length < 2) return { errors: { name: ['Name is too short.'] } };
  if (!description) return { errors: { description: ['Description is required.'] } };

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  await connectToDatabase();
  try {
    if (isMockDb()) return { errors: { form: ['Cannot update in mock mode.'] } };
    await Category.findByIdAndUpdate(id, { name, slug, description, image: slug });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, message: `Category updated.` };
  } catch (err: any) {
    console.error('updateCategory error:', err);
    return { errors: { form: ['Failed to update category.'] } };
  }
}

export async function deleteCategory(id: string): Promise<CategoryActionState> {
  try { await requireAdmin(); } catch { return { errors: { form: ['Unauthorized.'] } }; }

  await connectToDatabase();
  try {
    if (isMockDb()) return { errors: { form: ['Cannot delete in mock mode.'] } };
    
    const category = await Category.findById(id);
    if (!category) {
      return { errors: { form: ['Category not found.'] } };
    }

    const assignedProduct = await Product.findOne({ category: category.slug });
    if (assignedProduct) {
      return {
        errors: {
          form: [`Cannot delete category because it is assigned to product "${assignedProduct.name}".`],
        },
      };
    }

    await Category.findByIdAndDelete(id);
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, message: 'Category deleted.' };
  } catch (err: any) {
    console.error('deleteCategory error:', err);
    return { errors: { form: ['Failed to delete category.'] } };
  }
}
