import React, { useState } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Briefcase, IndianRupee, Users, ArrowRight, CheckCircle2, Star, Sparkles } from 'lucide-react';

export default function Join() {
  const [user] = useAuthState(auth);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    specialty: 'cleaning',
    experience: '1-3 years'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'applications'), {
        ...formData,
        userId: user?.uid || null,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'applications');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-emerald-50"
        >
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Application Received!</h1>
          <p className="text-gray-500 font-medium leading-relaxed mb-8">Our team will call you within 24-48 hours for a verification interview.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-600 transition-all"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-indigo-50/50 -z-10 rounded-l-[10rem]" />
        
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <Sparkles className="w-3 h-3" /> Join 50,000+ Partners
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] tracking-tighter mb-8">
              Grow your business with <span className="text-indigo-600">UrbanHelp.</span>
            </h1>
            <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-lg mb-12">
              Get direct access to thousands of customers looking for your skills. Be your own boss, earn more, and work when you want.
            </p>

            <div className="grid grid-cols-2 gap-8">
               <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center shrink-0">
                     <IndianRupee className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                     <div className="font-black text-gray-900 tracking-tight">₹40k - 80k</div>
                     <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Monthly Earnings</div>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center shrink-0">
                     <Star className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                     <div className="font-black text-gray-900 tracking-tight">Top Rated</div>
                     <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Global Standards</div>
                  </div>
               </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-10 md:p-12 shadow-2xl border border-gray-100 relative"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600 rounded-full -z-10 blur-3xl opacity-20" />
            
            <h2 className="text-3xl font-black text-gray-900 mb-2">Get Started</h2>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-10">Fill the simple form below</p>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Enter your name"
                    className="w-full px-8 py-5 bg-gray-50 rounded-2xl border-none outline-none font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                     <input 
                       required
                       type="tel" 
                       placeholder="10-digit number"
                       className="w-full px-8 py-5 bg-gray-50 rounded-2xl border-none outline-none font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                       value={formData.phone}
                       onChange={(e) => setFormData({...formData, phone: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your City</label>
                     <input 
                       required
                       type="text" 
                       placeholder="e.g. Bangalore"
                       className="w-full px-8 py-5 bg-gray-50 rounded-2xl border-none outline-none font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                       value={formData.city}
                       onChange={(e) => setFormData({...formData, city: e.target.value})}
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">What do you do?</label>
                  <select 
                    className="w-full px-8 py-5 bg-gray-50 rounded-2xl border-none outline-none font-bold focus:ring-2 focus:ring-indigo-100 transition-all appearance-none"
                    value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  >
                    <option value="cleaning">Home Cleaning</option>
                    <option value="electrician">Electrician</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="salon">Salon & Beauty</option>
                    <option value="painting">Painting</option>
                    <option value="carpenter">Carpenter</option>
                  </select>
               </div>

               <button 
                 type="submit"
                 disabled={isSubmitting}
                 className="w-full bg-black text-white py-6 rounded-2xl font-black text-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 Register Now <ArrowRight className="w-6 h-6" />
               </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-32 bg-white">
         <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
               {[
                 { icon: <ShieldCheck />, title: "Fully Verified", desc: "We provide safety for both partners and customers." },
                 { icon: <Briefcase />, title: "Flexible Work", desc: "Choose your own hours and areas you want to serve." },
                 { icon: <Users />, title: "Better Payouts", desc: "Up to 3x more earnings compared to local shops." }
               ].map((item, i) => (
                 <div key={i} className="text-center">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                       {item.icon}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4">{item.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}
