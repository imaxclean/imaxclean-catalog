'use client';

import React, { useState, useTransition, useCallback, useRef, useActionState } from 'react';
import {
  createProduct, deleteProduct, updateProduct, ActionState
} from '../actions/products';
import {
  createCategory, updateCategory, deleteCategory
} from '../actions/categories';
import {
  PlusCircle, Trash2, Package, Layers, Search, X,
  Pencil, Check, ChevronDown, AlertCircle, Upload, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminClientProps {
  products: any[];
  categories: any[];
}

// ─── Shared input class helpers ───────────────────────────────────────────────
const inputCls = (err?: string[]) =>
  `w-full bg-white border ${err?.length ? 'border-red-400' : 'border-zinc-200'} focus:border-primary-500 focus:outline-none rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800 transition-colors`;

const selectCls = (err?: string[]) =>
  `w-full bg-white border ${err?.length ? 'border-red-400' : 'border-zinc-200'} focus:border-primary-500 focus:outline-none rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800 transition-colors`;

// ─── Reusable field error ─────────────────────────────────────────────────────
function FieldError({ errs }: { errs?: string[] }) {
  if (!errs?.length) return null;
  return (
    <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle size={10} />
      {errs[0]}
    </p>
  );
}

// ─── Product Form (shared for create + edit) ──────────────────────────────────
function ProductForm({
  categories,
  initial,
  actionFn,
  onSuccess,
  submitLabel,
}: {
  categories: any[];
  initial?: any;
  actionFn: (prev: ActionState | undefined, fd: FormData) => Promise<ActionState>;
  onSuccess: () => void;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(actionFn, { errors: {}, success: false, message: '' });
  const [, startTransition] = useTransition();

  // ── Controlled field state — never lost on error ──
  const [name, setName]           = useState(initial?.name ?? '');
  const [quantity, setQuantity]   = useState(initial?.quantity != null ? String(initial.quantity) : '');
  const [category, setCategory]   = useState(initial?.category ?? '');
  const [price, setPrice]         = useState(initial?.price != null ? String(initial.price) : '');
  const [stock, setStock]         = useState(initial?.stock ?? 'In Stock');
  const [image, setImage]         = useState(initial?.images?.[0] ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [specs, setSpecs]         = useState<{ key: string; value: string }[]>(
    initial?.specs?.length ? initial.specs : [{ key: '', value: '' }]
  );

  // File Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.images?.[0] ?? null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success → call parent
  React.useEffect(() => {
    if (state?.success) setTimeout(onSuccess, 600);
  }, [state?.success, onSuccess]);

  const handleSpecChange = (i: number, f: 'key' | 'value', v: string) => {
    const s = [...specs]; s[i][f] = v; setSpecs(s);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Build FormData manually so controlled inputs are submitted, wrapped in startTransition
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set('name', name);
    fd.set('quantity', quantity);
    fd.set('category', category);
    fd.set('price', price);
    fd.set('stock', stock);
    fd.set('image', image);
    if (imageFile) {
      fd.set('imageFile', imageFile);
    }
    fd.set('description', description);
    fd.set('specs', JSON.stringify(specs.filter(s => s.key && s.value)));
    startTransition(() => formAction(fd));
  };

  const e = state?.errors ?? {};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {state?.success && (
        <div className="p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-2">
          <Check size={14} /> {state.message}
        </div>
      )}
      {e.form && (
        <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={14} /> {e.form[0]}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Product Name</label>
          <input type="text" value={name} onChange={ev => setName(ev.target.value)}
            placeholder="e.g. Imaxclean JetStream 400"
            className={inputCls(e.name)} />
          <FieldError errs={e.name} />
        </div>
        {/* Quantity */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Quantity</label>
          <input type="text" value={quantity} onChange={ev => setQuantity(ev.target.value)}
            placeholder="e.g. 50 pcs"
            className={inputCls(e.quantity)} />
          <FieldError errs={e.quantity} />
        </div>
        {/* Category */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Category</label>
          <select value={category} onChange={ev => setCategory(ev.target.value)}
            className={selectCls(e.category)}>
            <option value="">Select Category</option>
            {categories.map((c: any) => (
              <option key={c._id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <FieldError errs={e.category} />
        </div>
        {/* Price */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Price (KWD)</label>
          <input type="number" step="0.01" value={price} onChange={ev => setPrice(ev.target.value)}
            placeholder="e.g. 1599.99"
            className={inputCls(e.price)} />
          <FieldError errs={e.price} />
        </div>
        {/* Stock (edit mode only) */}
        {initial && (
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Stock Status</label>
            <select value={stock} onChange={ev => setStock(ev.target.value)} className={selectCls()}>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        )}
      </div>

      {/* Image Upload Area */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Product Image</label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dropzone / Preview */}
          <div className="md:col-span-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            <AnimatePresence mode="wait">
              {imagePreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative group border border-zinc-200 rounded-xl overflow-hidden aspect-video bg-zinc-50 flex items-center justify-center min-h-[160px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-white rounded-full text-zinc-700 hover:bg-zinc-100 transition-colors shadow-lg cursor-pointer"
                      title="Change Image"
                    >
                      <Upload size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors shadow-lg cursor-pointer"
                      title="Remove Image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 min-h-[160px] aspect-video ${
                    isDragOver
                      ? 'border-primary-500 bg-primary-500/5 shadow-inner'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/50'
                  }`}
                >
                  <motion.div
                    animate={isDragOver ? { y: -5 } : { y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="p-3 bg-zinc-50 rounded-full text-zinc-400 group-hover:text-zinc-500 border border-zinc-100"
                  >
                    <Upload size={20} />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-zinc-700">Drag & drop your product image, or click to browse</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Supports PNG, JPG, JPEG, SVG up to 10MB</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* URL Input (Fallback) */}
          <div className="flex flex-col justify-center">
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                <ImageIcon size={12} className="text-zinc-400" /> Or paste Image URL
              </h4>
              <p className="text-[10px] text-zinc-400 leading-normal">
                If you prefer to link a web asset, paste a URL instead.
              </p>
              <input
                type="text"
                value={image}
                onChange={ev => {
                  const val = ev.target.value;
                  setImage(val);
                  setImagePreview(val || null);
                  setImageFile(null); // clear file upload state
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-white border border-zinc-200 focus:border-primary-500 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-zinc-800 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Description</label>
        <textarea rows={3} value={description} onChange={ev => setDescription(ev.target.value)}
          placeholder="Product overview, key features…"
          className={`${inputCls(e.description)} resize-none`} />
        <FieldError errs={e.description} />
      </div>

      {/* Specs */}
      <div className="space-y-2 pt-3 border-t border-zinc-100">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Specifications</h4>
          <button type="button" onClick={() => setSpecs([...specs, { key: '', value: '' }])}
            className="text-[10px] font-bold text-primary-500 hover:underline cursor-pointer">+ Add Row</button>
        </div>
        {specs.map((spec, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input type="text" value={spec.key} onChange={ev => handleSpecChange(i, 'key', ev.target.value)}
              placeholder="Key (e.g. Weight)"
              className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-800" />
            <input type="text" value={spec.value} onChange={ev => handleSpecChange(i, 'value', ev.target.value)}
              placeholder="Value (e.g. 15 kg)"
              className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-800" />
            <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))}
              className="text-zinc-400 hover:text-red-500 p-1"><Trash2 size={12} /></button>
          </div>
        ))}
      </div>

      <button disabled={pending} type="submit"
        className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}


// ─── Main AdminClient ─────────────────────────────────────────────────────────
export default function AdminClient({ products: initialProducts = [], categories: initialCategories = [] }: AdminClientProps) {
  type Tab = 'products' | 'new-product' | 'categories';
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [isPending, startTransition] = useTransition();

  // Products state
  const [products, setProducts] = useState(initialProducts);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Categories state
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [catEditName, setCatEditName] = useState('');
  const [catEditDesc, setCatEditDesc] = useState('');
  const [catEditError, setCatEditError] = useState('');
  const [catEditSuccess, setCatEditSuccess] = useState('');

  // Create category form state
  const [newCatState, newCatAction, newCatPending] = useActionState(createCategory, { errors: {}, success: false, message: '' });
  const newCatFormRef = useRef<HTMLFormElement>(null);
  React.useEffect(() => {
    if (newCatState?.success) {
      newCatFormRef.current?.reset();
      // Reload after success — page will re-fetch categories via revalidation
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  }, [newCatState?.success]);

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchCat = !productCategoryFilter || p.category === productCategoryFilter;
    const q = productSearch.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || 
      (p.sku?.toLowerCase().includes(q) || false) || 
      (p.quantity != null && String(p.quantity).includes(q)) ||
      p.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleDeleteProduct = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res.success) {
        setProducts(prev => prev.filter(p => p._id !== id));
      } else {
        alert(res.errors?.form?.[0] ?? 'Delete failed.');
      }
    });
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Products in this category will lose their category.`)) return;
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.success) {
        setCategories(prev => prev.filter(c => c._id !== id));
      } else {
        alert(res.errors?.form?.[0] ?? 'Delete failed.');
      }
    });
  };

  const handleSaveCategoryEdit = () => {
    if (!editingCategory) return;
    setCatEditError('');
    setCatEditSuccess('');
    startTransition(async () => {
      const res = await updateCategory(editingCategory._id, catEditName, catEditDesc);
      if (res.success) {
        setCatEditSuccess(res.message ?? 'Updated!');
        setCategories(prev => prev.map(c => c._id === editingCategory._id
          ? { ...c, name: catEditName, description: catEditDesc }
          : c
        ));
        setTimeout(() => { setEditingCategory(null); setCatEditSuccess(''); }, 800);
      } else {
        setCatEditError(Object.values(res.errors ?? {}).flat()[0] ?? 'Update failed.');
      }
    });
  };

  const tabList: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'products', label: `Products (${products.length})`, icon: <Package size={14} /> },
    { id: 'new-product', label: 'Add Product', icon: <PlusCircle size={14} /> },
    { id: 'categories', label: `Categories (${categories.length})`, icon: <Layers size={14} /> },
  ];

  const createProductBound = useCallback(
    (prev: ActionState | undefined, fd: FormData) => createProduct(prev, fd),
    []
  );

  return (
    <div className="mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6 flex-1 flex flex-col">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Admin Panel</h1>
        <p className="text-xs text-zinc-500 mt-1">Manage products and categories.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-lg"><Package size={18} className="text-primary-500" /></div>
          <div>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Products</p>
            <p className="text-lg font-extrabold text-zinc-900">{products.length}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-secondary-500/10 rounded-lg"><Layers size={18} className="text-secondary-500" /></div>
          <div>
            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Categories</p>
            <p className="text-lg font-extrabold text-zinc-900">{categories.length}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg"><Check size={18} className="text-amber-500" /></div>
         
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 gap-1">
        {tabList.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setEditingProduct(null); }}
            className={`py-3 px-3 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Products List ────────────────────────────────────── */}
      {activeTab === 'products' && !editingProduct && (
        <div className="space-y-4">
          {/* Search + Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                placeholder="Search by name, SKU or quantity…"
                className="w-full pl-9 pr-9 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs focus:border-primary-500 focus:outline-none text-zinc-800" />
              {productSearch && (
                <button onClick={() => setProductSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700">
                  <X size={13} />
                </button>
              )}
            </div>
            <div className="relative">
              <select value={productCategoryFilter} onChange={e => setProductCategoryFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs focus:border-primary-500 focus:outline-none text-zinc-800 cursor-pointer">
                <option value="">All Categories</option>
                {categories.map((c: any) => (
                  <option key={c._id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Product table */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left min-w-[600px]">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Quantity</th>
                    <th className="px-5 py-3 text-right">Price</th>
                    <th className="px-5 py-3">Stock</th>
                    <th className="px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-zinc-400 italic">No products match your search.</td></tr>
                  ) : filteredProducts.map(prod => (
                    <tr key={prod._id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-5 py-3 font-semibold text-zinc-900 max-w-[200px] truncate">{prod.name}</td>
                      <td className="px-5 py-3 text-zinc-500 capitalize">{prod.category?.replace(/-/g, ' ')}</td>
                      <td className="px-5 py-3 font-mono text-[10px] text-zinc-400">{prod.quantity != null ? prod.quantity : '-'}</td>
                      <td className="px-5 py-3 text-right font-bold text-zinc-900">{prod.price?.toLocaleString('en-US', { minimumFractionDigits: 2 })} KWD</td>
                      <td className="px-5 py-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          prod.stock === 'In Stock' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                          prod.stock === 'Low Stock' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          'bg-red-50 text-red-600 border-red-200'
                        }`}>{prod.stock}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setEditingProduct(prod); setActiveTab('products'); }}
                            className="p-1.5 hover:bg-primary-500/10 text-primary-500 rounded-md transition-colors cursor-pointer"
                            title="Edit Product"
                          ><Pencil size={13} /></button>
                          <button
                            disabled={isPending}
                            onClick={() => handleDeleteProduct(prod._id, prod.name)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-md transition-colors cursor-pointer disabled:opacity-40"
                            title="Delete Product"
                          ><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">Showing {filteredProducts.length} of {products.length} products</p>
        </div>
      )}

      {/* ── Edit Product Inline Panel ─────────────────────────────── */}
      {activeTab === 'products' && editingProduct && (
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Pencil size={15} className="text-primary-500" />
              Edit: {editingProduct.name}
            </h3>
            <button onClick={() => setEditingProduct(null)}
              className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1 cursor-pointer">
              <X size={13} /> Cancel
            </button>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <ProductForm
              categories={categories}
              initial={editingProduct}
              actionFn={(prev, fd) => updateProduct(editingProduct._id, prev, fd)}
              onSuccess={() => {
                setProducts(prev => prev.map(p => p._id === editingProduct._id
                  ? { ...p, ...editingProduct } : p));
                setEditingProduct(null);
                window.location.reload(); // reload to get fresh data
              }}
              submitLabel="Save Changes"
            />
          </div>
        </div>
      )}

      {/* ── Tab: Add New Product ──────────────────────────────────── */}
      {activeTab === 'new-product' && (
        <div className="w-full">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <PlusCircle size={15} className="text-primary-500" />
              Add New Product
            </h3>
            <ProductForm
              categories={categories}
              actionFn={createProductBound}
              onSuccess={() => {
                setActiveTab('products');
                window.location.reload();
              }}
              submitLabel="Publish to Catalog"
            />
          </div>
        </div>
      )}

      {/* ── Tab: Categories CRUD ──────────────────────────────────── */}
      {activeTab === 'categories' && (
        <div className="space-y-6 w-full">

          {/* Create new category */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <PlusCircle size={15} className="text-primary-500" />
              Create New Category
            </h3>
            {newCatState?.success && (
              <div className="p-3 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-2">
                <Check size={13} /> {newCatState.message}
              </div>
            )}
            {newCatState?.errors?.form && (
              <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle size={13} /> {newCatState.errors.form[0]}
              </div>
            )}
            <form ref={newCatFormRef} action={newCatAction} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Category Name</label>
                <input name="name" type="text" placeholder="e.g. Floor Care Equipment"
                  className={inputCls(newCatState?.errors?.name)} />
                <FieldError errs={newCatState?.errors?.name} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Description</label>
                <textarea name="description" rows={2} placeholder="Brief description of what this category contains…"
                  className={`${inputCls(newCatState?.errors?.description)} resize-none`} />
                <FieldError errs={newCatState?.errors?.description} />
              </div>
              <button disabled={newCatPending} type="submit"
                className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
                {newCatPending ? 'Creating…' : 'Create Category'}
              </button>
            </form>
          </div>

          {/* Category list */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Existing Categories</h3>
            </div>
            {categories.length === 0 ? (
              <div className="px-5 py-10 text-center text-xs text-zinc-400 italic">No categories yet.</div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {categories.map(cat => (
                  <div key={cat._id} className="px-5 py-4">
                    {editingCategory?._id === cat._id ? (
                      /* Inline Edit Row */
                      <div className="space-y-3">
                        {catEditError && (
                          <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle size={10} />{catEditError}</p>
                        )}
                        {catEditSuccess && (
                          <p className="text-[10px] text-emerald-600 flex items-center gap-1"><Check size={10} />{catEditSuccess}</p>
                        )}
                        <input type="text" value={catEditName} onChange={e => setCatEditName(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-800" />
                        <textarea rows={2} value={catEditDesc} onChange={e => setCatEditDesc(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 resize-none" />
                        <div className="flex gap-2">
                          <button onClick={handleSaveCategoryEdit} disabled={isPending}
                            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50">
                            {isPending ? 'Saving…' : 'Save'}
                          </button>
                          <button onClick={() => { setEditingCategory(null); setCatEditError(''); }}
                            className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-lg text-xs font-bold cursor-pointer">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Row */
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-900 truncate">{cat.name}</p>
                          <p className="text-xs text-zinc-500 leading-relaxed">{cat.description}</p>
                          <p className="text-[10px] font-mono text-zinc-300">/{cat.slug}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCatEditName(cat.name);
                              setCatEditDesc(cat.description);
                              setCatEditError('');
                              setCatEditSuccess('');
                            }}
                            className="p-1.5 hover:bg-primary-500/10 text-primary-500 rounded-md transition-colors cursor-pointer"
                            title="Edit Category"
                          ><Pencil size={14} /></button>
                          <button
                            disabled={isPending}
                            onClick={() => handleDeleteCategory(cat._id, cat.name)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-md transition-colors cursor-pointer disabled:opacity-40"
                            title="Delete Category"
                          ><Trash2 size={14} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
