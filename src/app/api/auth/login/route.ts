import { NextResponse } from 'next/server';
import { Seller } from '@/models/seller';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    const body = await request.json();
    const { email, password } = body;

    // Validate email and password against Seller model
    const seller = await Seller.findOne({ email });
    if (!seller || seller.password !== password) {
        return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Create and sign JWT token
    const token = jwt.sign({ id: seller._id }, 'your_jwt_secret_key', { expiresIn: '1h' });

    // Return the token
    return NextResponse.json({ token });
}