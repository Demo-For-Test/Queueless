"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

export const Cart = ({ isOpen, onClose, items, onUpdateQuantity, onCheckout }: CartProps) => {
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 overflow-hidden"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-8 flex justify-between items-center border-b border-slate-gray/5 bg-saffron-50/30">
               <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Cart</h2>
                  <p className="text-sm text-slate-gray/40 font-bold uppercase tracking-widest mt-1">Stall Selection</p>
               </div>
               <button 
                 onClick={onClose} 
                 className="p-4 hover:bg-white rounded-3xl transition-all glass shadow-sm hover:scale-110 active:scale-95"
               >
                  <X className="w-6 h-6 text-slate-gray" />
               </button>
            </div>

            {/* List */}
            <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6 text-center opacity-40">
                   <div className="w-24 h-24 bg-slate-100 rounded-4xl flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-slate-gray" />
                   </div>
                   <div>
                      <p className="text-xl font-black text-slate-900 font-poppins">Cart is empty</p>
                      <p className="text-sm text-slate-gray mt-2">Add some delicious items to get started!</p>
                   </div>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    key={item._id} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-6 items-center group"
                  >
                    <div className="w-24 h-24 rounded-3xl overflow-hidden glass shadow-sm shrink-0">
                       <img 
                         src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80"} 
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                         alt={item.name}
                       />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-xl text-slate-900 truncate">{item.name}</h3>
                      <p className="text-lg font-black text-saffron-primary mt-1">₹{item.price}</p>
                      
                      <div className="flex items-center gap-4 mt-4 glass px-4 py-2 rounded-2xl w-fit border-slate-gray/5">
                        <button 
                          onClick={() => onUpdateQuantity(item._id, -1)} 
                          className="p-1.5 hover:bg-white rounded-xl transition-all active:scale-90"
                        >
                          <Minus className="w-4 h-4 text-slate-gray" />
                        </button>
                        <span className="font-black text-slate-900 w-6 text-center text-lg">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item._id, 1)} 
                          className="p-1.5 hover:bg-white rounded-xl transition-all active:scale-90"
                        >
                          <Plus className="w-4 h-4 text-slate-gray" />
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => onUpdateQuantity(item._id, -item.quantity)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors self-start"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-10 bg-slate-900 border-t border-white/5 rounded-t-[40px] shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
              <div className="flex justify-between items-center mb-8">
                <div>
                   <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Grand Total</p>
                   <p className="text-4xl font-black text-white mt-1 font-poppins">₹{total}</p>
                </div>
                <div className="bg-saffron-primary/10 px-4 py-2 rounded-2xl border border-saffron-primary/20">
                   <span className="text-saffron-primary font-black text-sm">{items.length} Items</span>
                </div>
              </div>
              
              <Button 
                onClick={onCheckout} 
                className="w-full h-20 rounded-[28px] text-xl font-black bg-linear-to-r from-saffron-primary to-saffron-secondary border-none shadow-2xl shadow-saffron-500/30 hover:shadow-saffron-500/50 hover:scale-[1.02] transition-all"
                disabled={items.length === 0}
              >
                Proceed to Checkout
              </Button>
              
              <p className="text-center text-white/30 text-xs mt-6 font-bold uppercase tracking-widest">
                Safe & Secure Payments
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
