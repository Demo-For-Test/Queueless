"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronLeft, Star, Clock, CheckCircle2, MessageSquare, History, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState<{ isOpen: boolean; orderId: string | null; shopName: string }>({
    isOpen: false,
    orderId: null,
    shopName: ''
  });
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      if (history.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // Fetch latest status for all orders in history
      const promises = history.map((orderId: string) => axios.get(`${API_URL}/order/${orderId}`));
      const responses = await Promise.allSettled(promises);
      
      const ordersData = responses
        .filter(r => r.status === 'fulfilled')
        .map((r: any) => r.value.data)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    if (!ratingModal.orderId) return;
    try {
      await axios.post(`${API_URL}/order/${ratingModal.orderId}/rate`, {
        rating: ratingValue,
        review: reviewText
      });
      setRatingModal({ isOpen: false, orderId: null, shopName: '' });
      setRatingValue(5);
      setReviewText('');
      fetchHistory(); // Refresh to show rated status
    } catch (err) {
      alert('Failed to submit rating');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="p-3 -ml-3 hover:bg-muted rounded-2xl transition-all">
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex items-center gap-3">
             <History className="w-5 h-5 text-saffron-primary" />
             <h1 className="font-black text-xl italic text-foreground">Order <span className="text-saffron-primary">History</span></h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 pt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-saffron-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 font-bold text-slate-gray/40 uppercase tracking-widest text-xs">Loading History...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/20" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">No orders found</h2>
            <p className="text-muted-foreground/50 mb-8 max-w-xs mx-auto">You haven&apos;t placed any orders yet. Start ordering from your favorite stalls!</p>
            <Button onClick={() => router.push('/')} className="h-14 px-10 rounded-2xl font-black">
              Explore Stalls
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard hover={false} className="p-6 border-slate-100 bg-white rounded-[32px] shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-lg text-slate-900 group-hover:text-saffron-primary transition-colors">
                        Token #{order.tokenNumber}
                      </h3>
                      <p className="text-[10px] font-black text-slate-gray/40 uppercase tracking-widest mt-1">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                      order.status === 'Ready' ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-gray'
                    }`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-gray/60"><span className="font-black text-slate-900">{item.quantity}x</span> {item.name}</span>
                        <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                      <span className="font-black text-xs uppercase tracking-widest text-slate-900">Total</span>
                      <span className="text-lg font-black text-saffron-primary">₹{order.totalAmount}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-12 rounded-xl text-xs font-black"
                      onClick={() => router.push(`/shop/track?orderId=${order._id}`)}
                    >
                      TRACK STATUS
                    </Button>
                    {!order.rating && order.status === 'Completed' ? (
                      <Button 
                        className="flex-1 h-12 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800"
                        onClick={() => setRatingModal({ isOpen: true, orderId: order._id, shopName: 'the stall' })}
                      >
                        RATE FOOD
                      </Button>
                    ) : order.rating ? (
                      <div className="flex items-center gap-1.5 px-4 bg-saffron-50 text-saffron-primary rounded-xl">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-black text-xs">{order.rating}</span>
                      </div>
                    ) : null}
                    {order.status === 'Completed' && (
                      <button 
                        onClick={() => router.push(`/invoice/${order._id}`)}
                        className="p-3 bg-slate-50 text-slate-900 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center"
                        title="View Invoice"
                      >
                         <Printer className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Rating Modal */}
      <AnimatePresence>
        {ratingModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/50 backdrop-blur-sm" onClick={() => setRatingModal({isOpen: false, orderId: null, shopName: ''})}>
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-t-[40px] sm:rounded-[40px] p-10">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-saffron-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Star className="w-10 h-10 text-saffron-primary fill-saffron-primary/20" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 italic">How was the food?</h2>
                  <p className="text-slate-gray/40 text-sm font-medium mt-2">Your feedback helps stalls improve.</p>
                </div>

                <div className="flex justify-center gap-3 mb-10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingValue(star)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                        ratingValue >= star ? 'bg-saffron-primary text-white shadow-lg shadow-saffron-200' : 'bg-slate-50 text-slate-300'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${ratingValue >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>

                <div className="mb-8">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-gray/40 ml-1 mb-2 block">Leave a comment (Optional)</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us what you liked or what could be better..."
                    className="w-full h-32 p-5 rounded-3xl bg-slate-50 border-0 focus:ring-2 focus:ring-saffron-primary/20 text-sm font-medium placeholder:text-slate-gray/30 resize-none transition-all"
                  />
                </div>

                <div className="flex gap-4">
                  <Button onClick={submitRating} className="flex-1 h-14 rounded-2xl font-black">
                    Submit Review
                  </Button>
                  <Button variant="outline" onClick={() => setRatingModal({isOpen: false, orderId: null, shopName: ''})} className="px-8 rounded-2xl border-slate-100 font-bold">
                    Skip
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
