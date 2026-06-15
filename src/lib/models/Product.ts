import mongoose, { Schema, Document } from 'mongoose';

export interface IReview {
  user: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  sku: string;
  price: number;
  category: string; // matches Category slug
  images: string[];
  specs: { key: string; value: string }[];
  stock: 'In Stock' | 'Low Stock' | 'Out of Stock';
  featured: boolean;
  rating: number;
  reviews: IReview[];
}

const ReviewSchema = new Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  sku: { type: String, required: true, unique: true, index: true },
  price: { type: Number, required: true },
  category: { type: String, required: true, index: true },
  images: [{ type: String }],
  specs: [
    {
      key: { type: String, required: true },
      value: { type: String, required: true }
    }
  ],
  stock: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  featured: { type: Boolean, default: false },
  rating: { type: Number, default: 5 }
}, {
  timestamps: true
});

// Nest reviews as subdocuments
ProductSchema.add({
  reviews: [ReviewSchema]
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
