import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Users, Shield, Clock, ArrowRight, Building2, Video, Pill, Search, Calendar, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import AppointmentChatBot from '../components/AppointmentChatBot';
import AnimatedCounter from '../components/UI/AnimatedCounter';
import { nabhaHospitals } from '../data/hospitalsData';
import videocallImage from '../assets/video_consultation.jpg';
import pharmacyImage from '../assets/pharmacy_service.jpg';
import symptomImage from '../assets/symptom_checker.jpg';
import hospitalImage from '../assets/hospital_directory.jpg';
import healthRecordImage from '../assets/health_records.jpg';
import appointmentImage from '../assets/appointment_booking.jpg';
import doctorTransparent from '../assets/doctor_transparent.png';
import { useState, useEffect } from 'react';
import doctorKidneyBg from '../assets/doctor_tablet_kidney_bg.png';
import infrastructureBg from '../assets/hospital_infrastructure_bg.png';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();


  const facilities = [
    {
      icon: Video,
      title: 'Video Consultation',
      description: 'Connect with doctors remotely through secure video calls for instant medical advice.',
      image: videocallImage,
      isImageFile: true,
      link: '/doctors',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    {
      icon: Pill,
      title: 'Pharmacy Services',
      description: 'Order medicines online with home delivery and get expert pharmaceutical guidance.',
      image: pharmacyImage,
      isImageFile: true,
      link: '/pharmacy',
      color: 'bg-gradient-to-br from-green-500 to-green-600'
    },
    {
      icon: Search,
      title: 'Symptom Checker',
      description: 'AI-powered symptom analysis to help you understand your health conditions better.',
      image: symptomImage,
      isImageFile: true,
      link: '/symptom-checker',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      icon: Building2,
      title: 'Hospital Directory',
      description: 'Find nearby hospitals with complete information about services and facilities.',
      image: hospitalImage,
      isImageFile: true,
      link: '/hospitals',
      color: 'bg-gradient-to-br from-red-500 to-red-600'
    },
    {
      icon: Calendar,
      title: 'Appointment Booking',
      description: 'Schedule appointments with doctors at your convenience with easy online booking.',
      image: appointmentImage,
      isImageFile: true,
      link: '/doctors',
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
    },
    {
      icon: FileText,
      title: 'Health Records',
      description: 'Access and manage your medical records securely with offline backup capabilities.',
      image: healthRecordImage,
      isImageFile: true,
      link: '/health-records',
      color: 'bg-gradient-to-br from-teal-500 to-teal-600'
    }
  ];

  const features = [
    {
      icon: Heart,
      title: 'Expert Doctors',
      description: 'Connect with qualified doctors specializing in rural healthcare needs.',
    },
    {
      icon: Building2,
      title: 'Hospital Directory',
      description: 'Complete information about hospitals in Nabha with contact details and services.',
    },
    {
      icon: Users,
      title: 'Community Care',
      description: 'Healthcare solutions designed specifically for rural communities.',
    },
    {
      icon: Shield,
      title: 'Secure Records',
      description: 'Your health data is protected with offline backup capabilities.',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Access healthcare guidance and emergency support anytime.',
    },
  ];

  const stats = [
    { number: '500+', label: 'Patients Served' },
    { number: '50+', label: 'Expert Doctors' },
    { number: `${nabhaHospitals.length}+`, label: 'Hospitals Listed' },
    { number: '24/7', label: 'Support' },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 0,
      image: doctorKidneyBg,
      content: (
        <div className="w-full h-full relative min-h-[500px] lg:min-h-[550px]">
           {/* Center Badge Focus */}
           <div className="absolute top-[15%] md:top-[20%] left-1/2 -translate-x-1/2 lg:left-[35%] lg:translate-x-0 w-64 h-64 md:w-80 md:h-80 bg-[#1D70B8] rounded-full border-[3px] border-white shadow-2xl flex flex-col justify-center items-center text-center p-6 z-20 animate-[pulse_6s_ease-in-out_infinite]">
              <div className="border border-white/40 w-full h-full rounded-full flex flex-col justify-center items-center p-4">
                 <h2 className="text-white text-xl md:text-2xl font-medium tracking-wide leading-tight mb-2">LASER SURGERY FOR</h2>
                 <h1 className="text-white text-2xl md:text-4xl font-black tracking-wider leading-tight">KIDNEY STONES</h1>
              </div>
           </div>

           {/* E-Consultation Floating Form (Desktop) */}
           <div className="hidden lg:block absolute right-[5%] xl:right-[15%] top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden w-[380px] z-30">
              <div className="bg-[#E51C23] text-white text-center py-3 font-bold text-[15px] tracking-wide">
                 FREE E-CONSULTATION
              </div>
              <form className="p-6 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); alert("Successfully submitted E-Consultation request!"); }}>
                 <input type="text" placeholder="Name*" required className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:border-[#1D70B8] text-sm" />
                 <div className="flex gap-4">
                   <input type="tel" placeholder="Mobile*" required className="w-1/2 px-4 py-3 rounded border border-gray-200 focus:outline-none focus:border-[#1D70B8] text-sm" />
                   <input type="text" placeholder="City*" required className="w-1/2 px-4 py-3 rounded border border-gray-200 focus:outline-none focus:border-[#1D70B8] text-sm" />
                 </div>
                 <textarea placeholder="Discuss Your Problem*" required rows={3} className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:border-[#1D70B8] text-sm resize-none"></textarea>
                 <button type="submit" className="bg-[#1D70B8] hover:bg-[#155fc2] transition-colors text-white font-bold py-3.5 rounded-full mt-2 w-48 mx-auto shadow-md">
                    SUBMIT
                 </button>
              </form>
           </div>
        </div>
      )
    },
    {
      id: 1,
      image: infrastructureBg,
      content: (
        <div className="w-full h-full relative flex items-center min-h-[500px] lg:min-h-[550px]">
           <div className="bg-white/95 backdrop-blur-sm px-8 md:px-16 py-8 md:py-12 ml-0 lg:ml-32 max-w-xl shadow-2xl border-l-8 border-[#1D70B8]">
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0A2540] leading-tight">State-of-the-art</h1>
             <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#0A2540] leading-tight mt-2">Infrastructure</h2>
           </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500); // 3.5 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      
      {/* Dynamic Hero Slider */}
      <section className="relative w-full h-[500px] lg:h-[650px] bg-gray-900 overflow-hidden group">
         {slides.map((slide, index) => (
           <div 
             key={slide.id}
             className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
           >
             <div className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${slide.image})` }}>
                <div className="absolute inset-0 bg-black/10"></div>
             </div>
             <div className="relative w-full h-full z-20 container mx-auto px-4">
                {slide.content}
             </div>
           </div>
         ))}
         
         {/* Carousel Controls */}
         <button 
           onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
           className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-4 shadow-lg z-30 transition-all opacity-0 group-hover:opacity-100"
         >
            <ChevronLeft size={32} />
         </button>
         <button 
           onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
           className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-4 shadow-lg z-30 transition-all opacity-0 group-hover:opacity-100"
         >
            <ChevronRight size={32} />
         </button>
      </section>

      {/* Mobile E-Consultation Form (Visible only on small screens below hero) */}
      <section className="lg:hidden bg-white py-12 px-4 shadow-inner">
         <div className="max-w-md mx-auto">
            <div className="bg-[#E51C23] text-white text-center py-3 rounded-t-lg font-bold text-[15px] tracking-wide">
               FREE E-CONSULTATION
            </div>
            <div className="bg-gray-50 p-6 rounded-b-lg border border-gray-200 shadow-sm">
               <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); alert("Successfully submitted E-Consultation request!"); }}>
                  <input type="text" placeholder="Name*" required className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:border-[#1D70B8] text-sm bg-white" />
                  <div className="flex gap-4">
                    <input type="tel" placeholder="Mobile*" required className="w-1/2 px-4 py-3 rounded border border-gray-200 focus:outline-none focus:border-[#1D70B8] text-sm bg-white" />
                    <input type="text" placeholder="City*" required className="w-1/2 px-4 py-3 rounded border border-gray-200 focus:outline-none focus:border-[#1D70B8] text-sm bg-white" />
                  </div>
                  <textarea placeholder="Discuss Your Problem*" required rows={3} className="w-full px-4 py-3 rounded border border-gray-200 focus:outline-none focus:border-[#1D70B8] text-sm resize-none bg-white"></textarea>
                  <button type="submit" className="bg-[#1D70B8] hover:bg-[#155fc2] transition-colors text-white font-bold py-3.5 rounded-full mt-2 w-full shadow-md">
                     SUBMIT
                  </button>
               </form>
            </div>
         </div>
      </section>

      {/* Scrolling Images Section */}
      <section className="py-10 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Trusted by Healthcare Professionals</h2>
        </div>
        <div className="relative w-full flex overflow-x-hidden">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 20,
            }}
          >
            {[
              "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=600",
              // Duplicate for seamless loop
              "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600",
              "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=600",
            ].map((src, index) => (
              <div key={index} className="w-64 h-40 flex-shrink-0 rounded-xl overflow-hidden shadow-md">
                <img src={src} alt="Healthcare" className="w-full h-full object-cover" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>



      {/* Stats Section */}
      <section className="py-16 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-primary-50 transition-colors duration-300"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  <AnimatedCounter
                    end={stat.number}
                    duration={2500}
                    delay={index * 200}
                  />
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Our Healthcare Services
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Comprehensive healthcare solutions designed for modern medical needs
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl overflow-hidden shadow-soft-md hover:shadow-soft-lg transition-all duration-300 border border-gray-100 group"
              >
                <Link to={facility.link} className="block h-full">
                  <div className={`h-48 relative overflow-hidden flex items-center justify-center ${facility.color.replace('bg-gradient-to-br', 'bg-gradient-to-br opacity-90 group-hover:opacity-100 transition-opacity')}`}>
                    {facility.isImageFile ? (
                      <img
                        src={facility.image}
                        alt={facility.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <>
                        <div className="absolute top-4 left-4 text-6xl opacity-20 text-white">{facility.image}</div>
                        <facility.icon size={48} className="text-white relative z-10" />
                      </>
                    )}
                  </div>
                  <div className="p-8 relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{facility.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">{facility.description}</p>
                    <div className="absolute bottom-8 right-8 text-primary-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300">
                      <ArrowRight size={24} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Nabha Healthcare?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We understand the unique healthcare challenges in rural areas and provide tailored solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-soft-lg transition-all duration-300 border border-transparent hover:border-gray-100 text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-soft-sm group-hover:scale-110 transition-transform duration-300 text-primary">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Join thousands of patients who trust Nabha Healthcare for their medical needs.
          </p>
          <Link to="/doctors" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold py-4 px-8 rounded-xl hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            Book Consultation
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Appointment ChatBot */}
      <AppointmentChatBot />
    </div>
  );
}