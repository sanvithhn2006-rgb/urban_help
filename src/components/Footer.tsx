import { Link } from 'react-router-dom';
import { ShieldCheck, Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white scale-110">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-gray-900">
                Urban<span className="text-indigo-600">Help</span>
              </span>
            </Link>
            <p className="text-gray-500 font-medium leading-relaxed mb-8">
              India's favorite home services platform. We provide verified experts for every home need, ensuring quality and safety.
            </p>
            <div className="flex gap-4">
               {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                 <a key={i} href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                    <Icon className="w-5 h-5" />
                 </a>
               ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8">Company</h4>
            <ul className="space-y-4">
              <li key="join"><Link to="/join" className="text-indigo-600 font-black hover:underline transition-all">Become a Partner</Link></li>
              {['About Us', 'Contact', 'Terms of Service', 'Privacy Policy'].map(item => (
                <li key={item}><Link to="#" className="text-gray-500 font-bold hover:text-indigo-600 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8">Services</h4>
            <ul className="space-y-4">
              {['Electricians', 'Plumbers', 'Cleaning', 'Home Tutors', 'Designers'].map(item => (
                <li key={item}><Link to="/services" className="text-gray-500 font-bold hover:text-indigo-600 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-8">Support</h4>
            <div className="space-y-6">
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                     <MapPin className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-sm text-gray-500 font-bold">123 Service Lane, Indiranagar, Bangalore, KA - 560038</p>
               </div>
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                     <Phone className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-sm text-gray-500 font-bold">+91 98765 43210</p>
               </div>
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                     <Mail className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-sm text-gray-500 font-bold">help@urbanhelp.in</p>
               </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">© 2026 UrbanHelp India - A Final Year Project</p>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Operational</span>
           </div>
        </div>
      </div>
    </footer>
  );
}
