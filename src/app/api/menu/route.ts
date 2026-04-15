import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId');

  if (!sellerId) {
    return NextResponse.json({ error: 'sellerId query parameter is required' }, { status: 400 });
  }

  // Mock menu items for demonstration (replace with actual database call)
  const menuItems = [
    { id: 1, sellerId: '123', name: 'Pizza', price: 9.99 },
    { id: 2, sellerId: '123', name: 'Burger', price: 5.99 },
    { id: 3, sellerId: '456', name: 'Sushi', price: 12.99 },
  ];

  const filteredMenuItems = menuItems.filter(item => item.sellerId === sellerId);

  return NextResponse.json(filteredMenuItems);
}