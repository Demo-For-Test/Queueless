"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Cart } from '@/components/shop/Cart';
import { 
  ShoppingBag, 
  MapPin, 
  Star, 
  Heart,
  Store,
  Plus,
  X,
  User,
  Phone,
  ChevronRight,
  Search,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

export default function CustomerShopPage() {
  const { shopId } = useParams();
  const router = useRouter();
  const [shop, setShop] = useState<any>(null);
  const [menu, setMenu] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<'Online' | 'Counter'>('Online');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const [shopRes, menuRes] = await Promise.all([
          axios.get(`${API_URL}/auth/shop/${shopId}`),
          axios.get(`${API_URL}/menu/${shopId}`)
        ]);
        setShop(shopRes.data);
        setMenu(menuRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShopData();
  }, [shopId]);

  const addToCart = (item: any) => {
    setCartItems(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => 
      prev.map(i => i._id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
         .filter(i => i.quantity > 0)
    );
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.phone) {
      alert('Please enter your name and phone number to place the order.');
      return;
    }
    try {
      const orderData = {
        sellerId: shopId,
        customerName: customerForm.name,
        customerPhone: customerForm.phone,
        items: cartItems.map(i => ({ menuItemId: i._id, name: i.name, quantity: i.quantity, price: i.price })),
        totalAmount: cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0),
        paymentMethod,
        paymentStatus: paymentMethod === 'Online' ? 'Paid' : 'Pending'
      };
      const res = await axios.post(`${API_URL}/order`, orderData);
      
      // Save to local history
      const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      localStorage.setItem('orderHistory', JSON.stringify([...new Set([res.data._id, ...history])]));

      router.push(`/shop/${shopId}/order/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert('Checkout failed. Please try again.');
    }
  };

  const categories = ['All', ...Array.from(new Set(menu.map(item => item.category).filter(Boolean)))];
  const filteredMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return item.isAvailable && matchesSearch && matchesCategory;
  });

  const totalItems = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalAmount = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-saffron-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-gray font-black uppercase tracking-widest text-xs">Loading Menu...</p>
      </div>
    </div>
  );
  
  if (!shop) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-slate-gray font-bold">Shop not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 font-sans">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled ? 'bg-background/90 backdrop-blur-md py-3 border-border shadow-sm' : 'bg-transparent py-5 border-transparent'
      }`}>
        <div className="max-w-4xl mx-auto px-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-xl transition-all mr-1">
              <ChevronRight className="w-5 h-5 text-foreground rotate-180" />
            </button>
             <div>
              <h1 className={`font-black tracking-tight text-foreground transition-all ${isScrolled ? 'text-base' : 'text-lg'}`}>
                {shop?.shopName}
              </h1>
              <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <MapPin className="w-3 h-3 text-saffron-primary" /> {shop?.location}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={() => setCartOpen(true)}
              className="relative h-12 px-5 bg-saffron-primary text-white rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-saffron-500/30 hover:scale-105 active:scale-95 transition-all"
            >
            <ShoppingBag className="w-4 h-4" />
            Cart
            {totalItems > 0 && (
              <span className="bg-white text-saffron-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img 
          src={shop.shopImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"} 
          className="w-full h-full object-cover"
          alt={shop.shopName}
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* Shop Info Card */}
      <div className="max-w-4xl mx-auto px-5 -mt-20 relative z-10">
        <div className="bg-card rounded-[32px] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {shop.category && (
                  <span className="px-3 py-1.5 bg-saffron-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
                    {shop.category}
                  </span>
                )}
                {shop.avgRating > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm ring-1 ring-emerald-100">
                    <Star className="w-4 h-4 fill-current" /> {shop.avgRating}
                    <span className="text-[10px] text-emerald-600/50 font-medium ml-1">({shop.totalRatings})</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight italic">{shop.shopName}</h1>
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground font-medium">
                <MapPin className="w-4 h-4 text-saffron-primary" /> {shop.location}
              </div>
            </div>
            <Button 
              size="lg" 
              className="h-14 px-10 rounded-2xl font-black text-sm shrink-0" 
              onClick={() => document.getElementById('menu-section')?.scrollIntoView({behavior: 'smooth'})}
            >
              View Menu
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div id="menu-section" className="max-w-4xl mx-auto px-5 mt-12">
        {/* Search & Filter */}
        <div className="mb-8 space-y-5">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30" />
            <input 
              type="text" 
              placeholder="Search dishes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-14 pr-5 rounded-2xl bg-muted border border-border outline-none focus:ring-2 focus:ring-saffron-primary/20 text-foreground font-medium placeholder:text-muted-foreground/30"
            />
          </div>

          {categories.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${
                    selectedCategory === cat 
                      ? 'bg-saffron-primary text-white shadow-lg shadow-saffron-500/20' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">
          {selectedCategory === 'All' ? '🍽️ Full Menu' : `🔖 ${selectedCategory}`}
          <span className="ml-3 text-sm font-bold text-slate-gray/30">({filteredMenu.length} items)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {filteredMenu.map((item) => {
              const inCart = cartItems.find(c => c._id === item._id);
              return (
                <motion.div 
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group flex"
                >
                  {/* Item Image */}
                  <div className="relative w-36 flex-shrink-0 overflow-hidden">
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={item.name}
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex flex-col flex-1 p-5 justify-between">
                    <div>
                      <h3 className="font-black text-base text-slate-900 leading-tight">{item.name}</h3>
                      {item.description && (
                        <p className="text-xs text-slate-gray/50 mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xl font-black text-slate-900">₹{item.price}</span>
                      
                      {inCart ? (
                        <div className="flex items-center gap-3 bg-saffron-50 rounded-xl px-1 py-1">
                          <button 
                            onClick={() => updateQuantity(item._id, -1)}
                            className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-black text-saffron-primary hover:bg-saffron-primary hover:text-white transition-all"
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-black text-slate-900 text-sm">{inCart.quantity}</span>
                          <button 
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 rounded-lg bg-saffron-primary shadow-sm flex items-center justify-center font-black text-white hover:bg-saffron-600 transition-all"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart(item)}
                          className="w-10 h-10 rounded-xl bg-saffron-primary text-white flex items-center justify-center shadow-lg shadow-saffron-500/20 hover:scale-110 active:scale-95 transition-all"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredMenu.length === 0 && (
          <div className="text-center py-24 text-slate-gray/30">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="font-black uppercase tracking-widest text-sm">No items found</p>
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {totalItems > 0 && !cartOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 px-5 z-40"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="w-full max-w-4xl mx-auto flex items-center justify-between bg-slate-900 text-white rounded-2xl px-6 py-4 shadow-2xl shadow-slate-900/40 hover:bg-slate-800 active:scale-95 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="bg-saffron-primary text-white w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs">{totalItems}</span>
                <span className="font-black text-sm uppercase tracking-widest">View Cart</span>
              </div>
              <span className="font-black text-base">₹{totalAmount}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart */}
      <Cart 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        items={cartItems} 
        onUpdateQuantity={updateQuantity} 
        onCheckout={() => { setCartOpen(false); setIsCheckoutOpen(true); }}
      />

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)}>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full md:max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white md:rounded-[32px] rounded-t-[32px] p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 italic">Final Step</h2>
                    <p className="text-[10px] font-black text-slate-gray/40 uppercase tracking-widest mt-1">Enter your details to place order</p>
                  </div>
                  <button onClick={() => setIsCheckoutOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                    <X className="w-5 h-5 text-slate-gray" />
                  </button>
                </div>

                {/* Order Summary */}
                <div className="bg-slate-50 rounded-2xl p-5 mb-8 space-y-3">
                  {cartItems.map(item => (
                    <div key={item._id} className="flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-900">{item.name} <span className="text-slate-gray/40">x{item.quantity}</span></span>
                      <span className="font-black text-slate-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-3 flex justify-between font-black text-base">
                    <span>Total</span>
                    <span className="text-saffron-primary">₹{totalAmount}</span>
                  </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-5">
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-gray/30 z-10" />
                    <input
                      type="text"
                      placeholder="Your name"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                      className="w-full h-14 pl-14 pr-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-saffron-primary/20 text-slate-900 font-bold placeholder:text-slate-gray/30"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-gray/30 z-10" />
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                      className="w-full h-14 pl-14 pr-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-saffron-primary/20 text-slate-900 font-bold placeholder:text-slate-gray/30"
                      required
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-gray/40 uppercase tracking-widest ml-1">Payment Method</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Online')}
                        className={`h-14 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${paymentMethod === 'Online' ? 'border-saffron-primary bg-saffron-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                         <span className={`text-[11px] font-black uppercase tracking-widest ${paymentMethod === 'Online' ? 'text-saffron-primary' : 'text-slate-gray/40'}`}>Pay Now</span>
                         <span className="text-[9px] font-medium text-slate-gray/30">UPI / QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Counter')}
                        className={`h-14 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${paymentMethod === 'Counter' ? 'border-saffron-primary bg-saffron-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                         <span className={`text-[11px] font-black uppercase tracking-widest ${paymentMethod === 'Counter' ? 'text-saffron-primary' : 'text-slate-gray/40'}`}>Pay at Stall</span>
                         <span className="text-[9px] font-medium text-slate-gray/30">Cash on Pickup</span>
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full h-16 bg-saffron-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-saffron-500/30 hover:bg-saffron-600 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    Place Order <ChevronRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
