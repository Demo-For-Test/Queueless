import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { connectToDatabase } from '../../../utils/mongodb';

const saltRounds = 10;
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

export async function POST(request) {
    const { username, password } = await request.json();
    const client = await connectToDatabase();
    const db = client.db('your_database');

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const newUser = { username, password: hashedPassword };

    // Insert user into the database
    const result = await db.collection('users').insertOne(newUser);

    // Generate QR code
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${username}&size=100x100`;
    await QRCode.toFileStream(result.qr_code_path, qrCodeUrl);

    // Create JWT token
    const token = jwt.sign({ id: result.insertedId, username: result.username }, jwtSecret, { expiresIn: '1h' });

    return NextResponse.json({ message: 'User registered successfully', token, qrCodeUrl }, { status: 201 });
}