import mongoose, { Schema, Document } from 'mongoose';

export interface IInquiryItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
}

export interface IInquiry extends Document {
  clientName: string;
  clientEmail: string;
  clientCompany: string;
  clientPhone: string;
  notes?: string;
  items: IInquiryItem[];
  status: 'Pending' | 'Contacted' | 'Closed';
  createdAt: Date;
}

const InquiryItemSchema = new Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 }
});

const InquirySchema: Schema = new Schema({
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  clientCompany: { type: String, required: true },
  clientPhone: { type: String, required: true },
  notes: { type: String },
  items: [InquiryItemSchema],
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'Closed'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

export default mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);
