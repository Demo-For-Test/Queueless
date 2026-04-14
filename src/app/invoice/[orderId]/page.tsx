"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/lib/constants';
import { motion } from 'framer-motion';
import { Printer, Download, ChevronLeft, ShoppingBag, MapPin, Phone, Hash, CalendarDays, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';

/* Page Name: CustomerOrderInvoice */

export default function InvoicePage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_URL}/order/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Invoice...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center font-bold text-red-500">Invoice Not Found</div>;

  const seller = order.sellerId || {};

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20 print:bg-white print:p-0">
      {/* Action Bar (Hidden in Print) */}
      <div className="bg-card border-b border-border flex items-center justify-between px-6 py-4 sticky top-0 z-50 print:hidden">
        <button onClick={() => router.back()} className="p-3 hover:bg-muted rounded-2xl transition-all">
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" onClick={() => window.print()} className="h-12 px-6 rounded-xl text-xs font-black uppercase tracking-widest gap-2 hover:bg-muted">
            <Printer className="w-4 h-4" /> Print
          </Button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 pt-10 print:pt-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[40px] shadow-2xl border border-border overflow-hidden print:shadow-none print:border-none print:rounded-none print:bg-white"
        >
          {/* Invoice Header */}
          <div className="bg-slate-900 text-white p-10 md:p-14">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-saffron-primary rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-black italic text-2xl">Queue<span className="text-saffron-primary">Less</span></span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black italic">TAX INVOICE</h1>
                <p className="text-slate-gray/40 font-black tracking-widest uppercase text-xs mt-3">Order #{order.tokenNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-saffron-primary">₹{order.totalAmount}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-gray/40 mt-1">{order.paymentStatus} via {order.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-10 md:p-14 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Stall Details</h4>
                <div>
                  <h3 className="text-xl font-black text-foreground print:text-black">{seller.shopName || 'Stall Merchant'}</h3>
                  <div className="space-y-1.5 mt-3">
                    <p className="text-sm font-medium text-muted-foreground print:text-gray-600 flex items-center gap-2">
                       <MapPin className="w-3.5 h-3.5 text-saffron-primary" /> {seller.location || 'Exhibition Hall'}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground print:text-gray-600 flex items-center gap-2">
                       <Phone className="w-3.5 h-3.5 text-saffron-primary" /> +91 {seller.phone || '9999999999'}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground print:text-gray-600 flex items-center gap-2">
                       <Hash className="w-3.5 h-3.5 text-saffron-primary" /> Stall ID: {seller.shortCode || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Customer Details</h4>
                <div>
                  <h3 className="text-xl font-black text-foreground print:text-black">{order.customerName}</h3>
                  <div className="space-y-1.5 mt-3">
                    <p className="text-sm font-medium text-muted-foreground print:text-gray-600 flex items-center gap-2">
                       <Phone className="w-3.5 h-3.5 text-saffron-primary" /> {order.customerPhone}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground print:text-gray-600 flex items-center gap-2">
                       <CalendarDays className="w-3.5 h-3.5 text-saffron-primary" /> {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mb-6">Order Items ({order.items?.length || 0})</h4>
              <div className="border-y border-border print:border-gray-100 py-6 space-y-4">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center group">
                    <div>
                      <h5 className="font-black text-foreground print:text-black">{item.name}</h5>
                      <p className="text-xs text-muted-foreground print:text-gray-500 font-medium">Quantity: {item.quantity} × ₹{item.price}</p>
                    </div>
                    <span className="font-black text-foreground print:text-black">₹{item.quantity * item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Section */}
            <div className="flex justify-end">
              <div className="w-full md:w-64 space-y-3 pt-6">
                <div className="flex justify-between text-muted-foreground print:text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span>₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-muted-foreground print:text-gray-600 font-medium">
                  <span>Taxes & GST</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-foreground/10 print:border-gray-100">
                  <span className="text-xs font-black uppercase tracking-widest text-foreground print:text-black">Total Amount</span>
                  <span className="text-2xl font-black text-saffron-primary">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Terms & Footer */}
            <div className="mt-16 pt-10 border-t border-dashed border-border print:border-gray-200 text-center">
              <p className="text-sm font-bold text-foreground print:text-black italic">Thank you for skipping the line!</p>
              <p className="text-[10px] text-muted-foreground/40 print:text-gray-400 mt-2 font-black uppercase tracking-widest">
                Computer Generated Invoice • No signature required
              </p>
              <p className="text-[9px] text-saffron-primary font-black uppercase tracking-widest mt-6 bg-saffron-primary/5 inline-block px-4 py-2 rounded-full">
                Powered by QueueLess
              </p>
            </div>
          </div>
        </motion.div>

        {/* Print only footer */}
        <div className="hidden print:block text-center mt-10 text-[8px] text-slate-300">
          Visit www.queueless.in to create your digital stall
        </div>
      </main>
    </div>
  );
}
