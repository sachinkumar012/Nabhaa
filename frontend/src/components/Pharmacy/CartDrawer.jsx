import React from 'react';
import { X, Plus, Minus, ShoppingCart, Truck, Tag, ChevronRight, Trash2 } from 'lucide-react';

const CartDrawer = ({ isOpen, cart, onClose, onUpdateQty, onRemove, onCheckout, getTotal }) => {
  const total = getTotal?.() || 0;
  const deliveryCharge = total >= 299 ? 0 : 50;
  const finalTotal = total + deliveryCharge;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-white">
            <ShoppingCart size={20} />
            <div>
              <h2 className="font-bold text-base">Your Cart</h2>
              <p className="text-teal-100 text-xs">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free delivery progress */}
        {total > 0 && total < 299 && (
          <div className="bg-amber-50 border-b border-amber-100 px-5 py-2.5">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-medium mb-1.5">
              <Truck size={13} />
              Add <span className="font-bold">₹{299 - total}</span> more for FREE delivery
            </div>
            <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((total / 299) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        {total >= 299 && (
          <div className="bg-green-50 border-b border-green-100 px-5 py-2 flex items-center gap-2 text-green-700 text-xs font-semibold">
            <Truck size={13} /> 🎉 You qualify for FREE delivery!
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 px-4 py-3 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl">🛒</div>
              <div>
                <p className="font-bold text-gray-700 text-base">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-1">Add medicines from the store to get started</p>
              </div>
              <button
                onClick={onClose}
                className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
              >
                Browse Medicines
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId || item.id} className="bg-gray-50 rounded-2xl p-3.5 flex gap-3 border border-gray-100">
                {/* Item icon */}
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-2xl border border-gray-100 shrink-0">
                  💊
                </div>
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.packSize || 'Standard Pack'}</p>
                  {item.source === 'prescription' && (
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">Rx</span>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-extrabold text-teal-600">₹{(item.price * item.quantity).toFixed(0)}</span>
                    {/* Quantity stepper */}
                    <div className="flex items-center gap-1 bg-white border border-teal-200 rounded-lg overflow-hidden">
                      <button
                        className="px-2.5 py-1 text-teal-600 hover:bg-teal-50 font-bold transition-colors text-sm"
                        onClick={() => onUpdateQty?.(item.productId || item.id, item.quantity - 1)}
                      >
                        {item.quantity === 1 ? <Trash2 size={12} /> : '−'}
                      </button>
                      <span className="px-2 text-sm font-bold text-gray-700 min-w-[1.5rem] text-center">{item.quantity}</span>
                      <button
                        className="px-2.5 py-1 text-teal-600 hover:bg-teal-50 font-bold transition-colors text-sm"
                        onClick={() => onUpdateQty?.(item.productId || item.id, item.quantity + 1)}
                      >+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-white shrink-0 space-y-3">
            {/* Offer pill */}
            <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
              <Tag size={13} className="text-teal-500" />
              <span className="text-xs text-teal-700 font-medium">Use code <strong>FIRST25</strong> for 25% off your first order</span>
            </div>

            {/* Price breakdown */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-700">₹{total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span className={`font-semibold ${deliveryCharge === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-base border-t border-gray-100 pt-2 mt-2">
                <span>Total</span>
                <span>₹{finalTotal.toFixed(0)}</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-100 text-sm"
            >
              Proceed to Checkout
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
