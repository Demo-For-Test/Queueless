import mongoose, { Schema, Document } from 'mongoose';

// TypeScript interface for Seller model
export interface ISeller extends Document {
    shopName: string;
    ownerName: string;
    phone: string;
    email: string;
    password: string;
    category: string;
    location: string;
    upiId: string;
    shopImage: string;
    qrCode: string;
    shortCode: string;
    avgRating: number;
    totalRatings: number;
    tokenSequence: number;
    trialEndsAt: Date;
    subscriptionStatus: string;
    isPhoneVerified: boolean;
    otp: string;
    otpExpiresAt: Date;
}

// Mongoose schema definition for Seller
const SellerSchema: Schema<ISeller> = new Schema({
    shopName: { type: String, required: true },
    ownerName: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    upiId: { type: String, required: true },
    shopImage: { type: String, required: false },
    qrCode: { type: String, required: false },
    shortCode: { type: String, required: false },
    avgRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    tokenSequence: { type: Number, default: 0 },
    trialEndsAt: { type: Date, required: true },
    subscriptionStatus: { type: String, required: true },
    isPhoneVerified: { type: Boolean, default: false },
    otp: { type: String, required: false },
    otpExpiresAt: { type: Date, required: false }
});

// Export the model
const Seller = mongoose.model<ISeller>('Seller', SellerSchema);
export default Seller;