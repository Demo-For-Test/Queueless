import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
    product: string;
    quantity: number;
    buyerId: string;
    orderDate: Date;
}

const OrderSchema: Schema = new Schema({
    product: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    buyerId: {
        type: String,
        required: true,
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<IOrder>('Order', OrderSchema);