import { Link, useNavigate } from 'react-router-dom';
import { auth, db, signInWithGoogle } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ShieldCheck, User, LogOut, LayoutDashboard, History, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setIsAdmin(data.role === 'admin');
          setIsProvider(data.role === 'provider');
        }
      });
    } else {
      setIsAdmin(false);
      setIsProvider(false);
    }
  }, [user]);

  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        alert('Please allow popups for this site to sign in.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Sign in request was cancelled');
      } else {
        console.error('Sign in error:', error);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-4 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm' : 'py-6 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center bg-white/60 p-2 rounded-[2rem] border border-white/20 backdrop-blur-md">
          <Link to="/" className="flex items-center gap-2 group ml-4">
            <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white scale-110 group-hover:rotate-12 transition-transform shadow-xl shadow-black/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              Urban<span className="text-indigo-600">Help</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-gray-50/50 p-1 rounded-2xl border border-gray-100">
            <Link to="/" className="px-6 py-2.5 rounded-xl text-sm font-black text-gray-600 hover:text-black hover:bg-white transition-all">Home</Link>
            <Link to="/services" className="px-6 py-2.5 rounded-xl text-sm font-black text-gray-600 hover:text-black hover:bg-white transition-all">Services</Link>
            {isProvider ? (
              <Link to="/provider" className="px-6 py-2.5 rounded-xl text-sm font-black text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2">
                 <LayoutDashboard className="w-4 h-4" /> Pro Hub
              </Link>
            ) : (
              <Link to="/join" className="px-6 py-2.5 rounded-xl text-sm font-black text-indigo-600 hover:bg-indigo-50 transition-all">Register as Partner</Link>
            )}
            {user && (
              <Link to="/history" className="px-6 py-2.5 rounded-xl text-sm font-black text-gray-600 hover:text-black hover:bg-white transition-all">My Bookings</Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="px-6 py-2.5 rounded-xl text-sm font-black text-indigo-600 hover:bg-white transition-all flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> HQ
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
               <div className="relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 pl-2 pr-4 py-2 bg-black text-white rounded-2xl hover:scale-105 transition-all shadow-xl shadow-black/10"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                       {user.photoURL ? <img src={user.photoURL} alt="" /> : <User className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-bold truncate max-w-[100px]">{user.displayName?.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-gray-100 overflow-hidden py-2"
                      >
                         <div className="px-6 py-4 border-b border-gray-50 mb-2">
                            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Signed in as</div>
                            <div className="text-sm font-black text-gray-900 truncate tracking-tighter">{user.email}</div>
                         </div>
                         <Link to="/history" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                            <History className="w-4 h-4" /> Booking History
                         </Link>
                         <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors">
                            <LogOut className="w-4 h-4" /> Logout
                         </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            ) : (
              <button 
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="bg-black text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
              >
                {isSigningIn ? 'Signing in...' : 'Sign In'}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center mr-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 bg-gray-50 rounded-2xl text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-4">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-6 py-4 rounded-2xl text-lg font-black text-gray-900 bg-gray-50">Home</Link>
              <Link to="/services" onClick={() => setIsMenuOpen(false)} className="block px-6 py-4 rounded-2xl text-lg font-black text-gray-900 bg-gray-50">Services</Link>
              {isProvider && (
                <Link to="/provider" onClick={() => setIsMenuOpen(false)} className="block px-6 py-4 rounded-2xl text-lg font-black text-indigo-600 bg-indigo-50">Pro Dashboard</Link>
              )}
              {user && (
                <Link to="/history" onClick={() => setIsMenuOpen(false)} className="block px-6 py-4 rounded-2xl text-lg font-black text-gray-900 bg-gray-50">My Bookings</Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-6 py-4 rounded-2xl text-lg font-black text-indigo-600 bg-indigo-50">HQ Dashboard</Link>
              )}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-5 rounded-2xl font-black text-xl text-red-500 bg-red-50"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              ) : (
                <button
                  onClick={() => { handleSignIn(); setIsMenuOpen(false); }}
                  disabled={isSigningIn}
                  className="w-full py-5 bg-black text-white rounded-2xl font-black text-xl shadow-xl shadow-black/10 disabled:opacity-50"
                >
                  {isSigningIn ? 'Processing...' : 'Join UrbanHelp'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
