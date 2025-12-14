import { motion } from 'framer-motion';
import { Heart, Users, Shield, Globe, Award, Target } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import AnimatedCounter from '../components/UI/AnimatedCounter';

export default function About() {
  const { t } = useLanguage();

  const values = [
    {
      icon: Heart,
      title: 'Compassionate Care',
      description: 'We believe healthcare should be delivered with empathy and understanding, especially in rural communities.',
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your health data is protected with the highest security standards and offline backup capabilities.',
    },
    {
      icon: Users,
      title: 'Community Focus',
      description: 'We design our solutions specifically for the unique needs of rural and underserved communities.',
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Our platform works on low bandwidth connections with multilingual support for better accessibility.',
    },
  ];

  const team = [
    {
      name: 'Dr. Rajesh Patel',
      role: 'Chief Medical Officer',
      image: 'https://images.pexels.com/photos/612608/pexels-photo-612608.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: '20+ years in rural healthcare',
    },
    {
      name: 'Priya Sharma',
      role: 'Technology Lead',
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Expert in healthcare technology',
    },
    {
      name: 'Harpreet Singh',
      role: 'Community Outreach',
      image: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Local community advocate',
    },
  ];

  const stats = [
    { icon: Users, number: '10,000+', numericValue: 10000, suffix: '+', label: 'Patients Served' },
    { icon: Heart, number: '500+', numericValue: 500, suffix: '+', label: 'Consultations' },
    { icon: Award, number: '50+', numericValue: 50, suffix: '+', label: 'Partner Doctors' },
    { icon: Target, number: '15+', numericValue: 15, suffix: '+', label: 'Rural Locations' },
  ];

  return (
    <div className="min-h-screen" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section className="hero">
        <div className="container text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t('aboutUs')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600"
            style={{ fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto' }}
          >
            Bridging the healthcare gap in rural Punjab through technology, compassion, and community-centered care.
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="grid grid-lg-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2>{t('mission')}</h2>
              <p className="text-gray-600" style={{ marginBottom: '1.5rem' }}>
                {t('missionText')}
              </p>
              <p className="text-gray-600" style={{ marginBottom: '1.5rem' }}>
                Founded in Nabha, Punjab, we understand the unique challenges faced by rural communities in accessing quality healthcare. Our platform combines modern technology with traditional values to create a healthcare solution that truly serves the people.
              </p>
              <div className="card" style={{ backgroundColor: 'var(--primary-50)', border: 'none' }}>
                <h3 style={{ color: 'var(--primary-800)', marginBottom: '0.75rem' }}>Our Vision</h3>
                <p style={{ color: 'var(--primary-700)', margin: 0 }}>
                  To become the leading rural healthcare platform in India, ensuring that geographical barriers never prevent anyone from receiving quality medical care.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              style={{ position: 'relative' }}
            >
              <img
                src="https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Rural Healthcare"
                style={{
                  borderRadius: '1rem',
                  boxShadow: 'var(--shadow-lg)',
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(10, 115, 209, 0.2)',
                borderRadius: '1rem'
              }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-light" style={{ padding: '4rem 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
            style={{ marginBottom: '3rem' }}
          >
            <h2>Our Values</h2>
            <p className="text-gray-600">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid grid-lg-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="card text-center"
              >
                <div className="feature-icon" style={{ margin: '0 auto 1rem' }}>
                  <value.icon size={32} />
                </div>
                <h3>{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
            style={{ marginBottom: '3rem' }}
          >
            <h2>Our Impact</h2>
            <p className="text-gray-600">Making a difference in rural healthcare, one patient at a time</p>
          </motion.div>

          <div className="grid grid-lg-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-center"
              >
                <div className="feature-icon" style={{ margin: '0 auto 1rem' }}>
                  <stat.icon size={32} />
                </div>
                <div className="stat-number">
                  <AnimatedCounter 
                    end={stat.numericValue}
                    duration={2500}
                    delay={700 + index * 100}
                    suffix={stat.suffix}
                  />
                </div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-light" style={{ padding: '4rem 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
            style={{ marginBottom: '3rem' }}
          >
            <h2>Meet Our Team</h2>
            <p className="text-gray-600">Dedicated professionals working to improve rural healthcare</p>
          </motion.div>

          <div className="grid grid-md-3 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="card text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  style={{
                    width: '6rem',
                    height: '6rem',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    margin: '0 auto 1rem'
                  }}
                />
                <h3 style={{ marginBottom: '0.5rem' }}>{member.name}</h3>
                <p className="text-primary" style={{ fontWeight: 500, marginBottom: '0.5rem' }}>
                  {member.role}
                </p>
                <p className="text-gray-600">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-primary" style={{ padding: '4rem 0', color: 'white' }}>
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Join Our Mission</h2>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
              Help us bring quality healthcare to rural communities across Punjab and beyond.
            </p>
            <a
              href="mailto:contact@nabhahealthcare.com"
              className="btn btn-secondary"
              style={{ textDecoration: 'none' }}
            >
              Get In Touch
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}