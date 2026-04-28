import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Booking } from '../types';
import { Calendar, CheckCircle2, Clock, XCircle, MapPin, Phone, IndianRupee, MessageSquare, ArrowRight, Star, History as HistoryIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function History() {
  const [user] = useAuthState(auth);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bookings'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
      setLoading(false);
    }, (err) => {
       handleFirestoreError(err, OperationType.LIST, 'bookings');
       setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': return { icon: <CheckCircle2 className="w-4 h-4" />, classes: 'bg-emerald-500 text-white', label: 'Service Completed' };
      case 'cancelled': return { icon: <XCircle className="w-4 h-4" />, classes: 'bg-red-500 text-white', label: 'Cancelled' };
      default: return { icon: <Clock className="w-4 h-4" />, classes: 'bg-orange-500 text-white', label: 'Expert on the way' };
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <HistoryIcon className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Please log in</h2>
        <p className="text-gray-500">You need to be signed in to view your booking history.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-500 font-medium">Track your service requests and history</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {bookings.map((booking, idx) => {
            const config = getStatusConfig(booking.status);
            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={booking.id}
                className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="p-8">
                  <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                    <div className="flex gap-6">
                       <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center shrink-0">
                          <MessageSquare className="w-8 h-8 text-indigo-600" />
                       </div>
                       <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">{booking.specialty}</div>
                          <h3 className="text-2xl font-black text-gray-900 mb-1">{booking.providerName}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase tracking-wider">
                             <Calendar className="w-3.5 h-3.5" /> 
                             {booking.createdAt ? format(new Date(booking.createdAt?.seconds * 1000 || booking.createdAt), 'MMMM dd, yyyy') : 'Recently'}
                          </div>
                       </div>
                    </div>
                    <div className="flex md:flex-col items-end justify-between md:justify-center gap-2">
                       <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${config.classes}`}>
                          {config.icon}
                          {config.label}
                       </span>
                       <div className="text-2xl font-black text-gray-900 flex items-center gap-0.5">
                          <IndianRupee className="w-4 h-4" />{booking.price || '0'}
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-gray-50">
                     <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center"><Phone className="w-4 h-4 text-gray-400" /></div>
                        <div>
                           <div className="text-[10px] font-black text-gray-400 uppercase">Expert Contact</div>
                           <div className="text-sm font-bold">Will call you soon</div>
                        </div>
                     </div>
                     <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center"><Star className="w-4 h-4 text-orange-400" /></div>
                        <div>
                           <div className="text-[10px] font-black text-gray-400 uppercase">Experience</div>
                           <div className="text-sm font-bold">Rate this professional</div>
                        </div>
                     </div>
                  </div>
                </div>
                
                {booking.status === 'pending' && (
                  <div className="px-8 py-4 bg-indigo-600 flex justify-between items-center text-white">
                     <span className="text-xs font-bold uppercase tracking-widest">Share address with expert?</span>
                     <button className="flex items-center gap-2 text-sm font-black bg-white/20 px-4 py-2 rounded-xl hover:bg-white/30 transition-all">
                        Open Map <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
                )}
              </motion.div>
            );
          })}

          {bookings.length === 0 && (
            <div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
               <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-8">
                  <Calendar className="w-8 h-8 text-gray-300" />
               </div>
               <h2 className="text-2xl font-black text-gray-900 mb-2">No bookings yet</h2>
               <p className="text-gray-500 mb-8">Looks like you haven't booked any expert help recently.</p>
               <button className="bg-black text-white px-8 py-3 rounded-2xl font-bold">Explore Services</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
