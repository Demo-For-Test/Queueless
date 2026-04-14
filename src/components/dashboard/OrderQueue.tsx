"use client";
/* Component Name: SellerOrderQueue */

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Clock, CheckCircle, Package, Utensils, Hash, User, Wallet, IndianRupee, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface Order {
  _id: string;
  tokenNumber: number;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  status: string;
  orderTime: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
}

interface OrderQueueProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: string) => void;
  onUpdatePayment: (id: string, status: string) => void;
}

export const OrderQueue = ({ orders, onUpdateStatus, onUpdatePayment }: OrderQueueProps) => {
  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-500",
    Preparing: "bg-blue-500",
    Ready: "bg-green-500",
    Completed: "bg-gray-400",
  };

  const handlePrintToken = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Token #${order.tokenNumber}</title>
          <style>
            @page { margin: 0; }
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 20px; 
              width: 300px; 
              margin: 0 auto;
              text-align: center;
              border-bottom: 2px dashed #eee;
            }
            .shop { font-size: 24px; font-weight: 900; margin-bottom: 5px; font-style: italic; }
            .token-label { font-size: 14px; color: #666; font-weight: 900; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 2px; }
            .token-num { font-size: 64px; font-weight: 900; color: #000; margin-bottom: 20px; }
            .items { text-align: left; border-top: 1px solid #eee; padding-top: 15px; margin-bottom: 15px; }
            .item { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 5px; font-weight: 600; }
            .total { border-top: 1px solid #000; padding-top: 10px; font-size: 18px; font-weight: 900; display: flex; justify-content: space-between; }
            .footer { font-size: 10px; color: #999; margin-top: 30px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="shop">QueueLess</div>
          <div class="token-label">Token Number</div>
          <div class="token-num">#${order.tokenNumber}</div>
          <div class="items">
            ${order.items.map(i => `<div class="item"><span>${i.quantity}x ${i.name}</span> <span>₹${i.price * i.quantity}</span></div>`).join('')}
          </div>
          <div class="total">
            <span>Total Payable</span>
            <span>₹${order.totalAmount}</span>
          </div>
          <div class="footer">Thank you • Visit Again</div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-2 italic">
          <Clock className="text-saffron-primary w-5 h-5 md:w-6 md:h-6" /> Live Queue
        </h2>
        <span className="px-3 py-1 bg-muted text-muted-foreground rounded-lg font-black text-[10px] uppercase tracking-widest">
           {orders.length} Active Orders
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        <AnimatePresence>
          {orders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              layout
            >
              <GlassCard className="h-full flex flex-col justify-between border-border shadow-sm p-5 md:p-8 hover:shadow-xl transition-all duration-500 bg-card group rounded-[32px]">
                <div>
                  <div className="flex justify-between items-start mb-6 md:mb-8">
                    <div className="flex flex-col">
                      <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1">
                        <Hash className="w-2.5 h-2.5" /> Token
                      </span>
                      <span className="text-3xl md:text-5xl font-black text-saffron-primary leading-none mt-1 md:mt-2 italic tabular-nums tracking-tighter">#{order.tokenNumber}</span>
                    </div>
                    <span className={`px-2.5 py-1 md:px-4 md:py-1.5 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-sm ${statusColors[order.status]} text-white`}>
                      {order.status}
                    </span>
                  </div>

                   <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        order.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse'
                      }`}>
                        {order.paymentStatus === 'Paid' ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                        {order.paymentStatus === 'Paid' ? 'PAID' : 'UNPAID'}
                      </div>
                      <span className="text-[9px] font-black text-muted-foreground flex items-center gap-1">
                        {order.paymentMethod === 'Online' ? <Wallet className="w-2.5 h-2.5" /> : <IndianRupee className="w-2.5 h-2.5" />}
                        {order.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5" />
                       <span className="font-black">₹{order.totalAmount}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePrintToken(order); }}
                        className="ml-3 p-2 bg-foreground text-background rounded-lg hover:scale-110 active:scale-95 transition-all shadow-lg"
                        title="Print Token"
                      >
                         <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-muted rounded-xl flex items-center justify-center">
                           <User className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                        </div>
                        <div>
                           <h3 className="font-black text-sm md:text-xl text-foreground leading-tight truncate max-w-[150px] md:max-w-none">{order.customerName}</h3>
                           <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 flex items-center gap-1 font-medium">
                              <Clock className="w-3 h-3" /> {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                    </div>

                    <div className="bg-muted/50 rounded-2xl p-4 md:p-5 space-y-2 md:space-y-3 border border-border">
                      {order.items.map((item, idx) => (
                         <div key={idx} className="text-[11px] md:text-sm text-foreground flex justify-between font-bold leading-tight">
                          <span className="flex items-center gap-2 md:gap-3 truncate pr-2">
                             <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-saffron-primary shrink-0" />
                             <span className="truncate">{item.name}</span>
                          </span>
                          <span className="text-muted-foreground/40 font-black shrink-0">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 md:mt-10 md:pt-8 border-t border-border flex gap-2 md:gap-3">
                  {order.status === 'Pending' && (
                    <Button className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl shadow-saffron-500/10 text-[10px] md:text-xs" onClick={() => onUpdateStatus(order._id, 'Preparing')}>
                       <Utensils className="w-3.5 h-3.5 md:w-4 md:h-4" /> START
                    </Button>
                  )}
                  {order.status === 'Preparing' && (
                    <Button variant="secondary" className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-blue-500/10 text-[10px] md:text-xs" onClick={() => onUpdateStatus(order._id, 'Ready')}>
                       <Package className="w-3.5 h-3.5 md:w-4 md:h-4" /> READY
                    </Button>
                  )}
                  {order.status === 'Ready' && (
                    <Button className="flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10 text-[10px] md:text-xs" onClick={() => onUpdateStatus(order._id, 'Completed')}>
                       <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> HANDOVER
                    </Button>
                  )}
                  {order.paymentStatus === 'Pending' && (
                    <Button variant="outline" className="h-12 md:h-14 rounded-xl md:rounded-2xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 text-[10px] md:text-xs font-black shadow-sm" onClick={() => onUpdatePayment(order._id, 'Paid')}>
                       PAID
                    </Button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-20 bg-muted/50 rounded-[40px] border-2 border-dashed border-border text-foreground">
           <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
           <p className="text-muted-foreground/40 font-black uppercase tracking-widest text-xs">Queue is empty</p>
           <p className="text-muted-foreground/30 text-[10px] mt-1">New orders will pop up here</p>
        </div>
      )}
    </div>
  );
};
