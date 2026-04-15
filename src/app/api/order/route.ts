import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

let tokenSequence = 0;

const validateOrder = (order) => {
    const { sellerId, customerName, customerPhone, items, totalAmount } = order;
    if (!sellerId || !customerName || !customerPhone || !items || !totalAmount) {
        throw new Error('All fields are required.');
    }
};

export async function POST(req) {
    try {
        const db = await connectToDatabase();
        const body = await req.json();

        validateOrder(body);

        const newOrder = { 
            token: ++tokenSequence,
            ...body,
            createdAt: new Date().toUTCString()
        };

        await db.collection('orders').insertOne(newOrder);

        return NextResponse.json({ message: 'Order created successfully', order: newOrder }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}