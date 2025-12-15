import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, CheckCircle, Info, Clock, Calendar } from 'lucide-react';
import LabTestDetailsView from '../components/Pharmacy/LabTestDetailsView';
import MyLabBookingsView from '../components/Pharmacy/MyLabBookingsView';
import LabBookingModal from '../components/Pharmacy/LabBookingModal';

const LabTests = ({ user }) => {
    const [view, setView] = useState('list'); // 'list', 'details', 'my-bookings'

    // List View State
    const [activeFaq, setActiveFaq] = useState(null);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Selected Test for Details View
    const [selectedDetailTest, setSelectedDetailTest] = useState(null);

    // Booking State
    const [bookingTest, setBookingTest] = useState(null);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lab-tests/tests`);
                if (!response.ok) throw new Error('Failed to fetch lab tests');
                const data = await response.json();
                setTests(data.data);
                setLoading(false);
            } catch (err) {
                console.error("Error loading lab tests:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    const handleViewDetails = async (testId) => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lab-tests/tests/${testId}`);
            if (!response.ok) throw new Error('Failed to fetch test details');
            const data = await response.json();
            setSelectedDetailTest({ ...data.data, suggestions: data.recommendations });
            setView('details');
            window.scrollTo(0, 0); // Scroll to top
        } catch (error) {
            console.error("Error fetching test details:", error);
            alert("Failed to load details");
        } finally {
            setLoading(false);
        }
    };

    const handleBookTest = (test) => {
        setBookingTest(test);
    };

    const handleBookingSubmit = async (formData, test) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/lab-tests/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testId: test._id,
                    patientDetails: formData,
                    userId: user ? user.id : null
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(`✅ Booking Confirmed!\nBooking ID: ${data.bookingId}\nPlease check your email for details.`);
                setBookingTest(null);
                // Optionally switch to my bookings view
                setView('my-bookings');
            } else {
                alert(`Booking failed: ${data.message}`);
            }
        } catch (error) {
            console.error("Booking error:", error);
            alert("An error occurred while booking. Please try again.");
        }
    };

    const faqs = [
        { question: 'How often should you get a full body checkup?', answer: 'It is recommended to get a full body checkup once a year for adults over 18, and more frequently if you have existing health conditions.' },
        { question: 'How to get a free sample collection for a full body checkup?', answer: 'We offer free home sample collection for all full body checkup packages above ₹999.' },
        { question: 'How long will it take to get a test report for a full body checkup?', answer: 'Most reports are delivered within 24-48 hours via email and can be viewed on our portal.' },
        { question: 'What is the full body checkup cost?', answer: 'Our full body checkup packages start from ₹1499, offering a comprehensive range of 75+ tests.' },
        { question: 'Can specific conditions or medications affect full-body checkup results?', answer: 'Yes, certain medicines and conditions can affect results. Please inform the phlebotomist about any medications you are taking.' },
        { question: 'What information does a full body checkup provide about overall health?', answer: 'It provides a detailed overview of your vital organ functions, including liver, kidney, heart, thyroid, and blood sugar levels.' },
        { question: 'Do you have to fast before a full body checkup?', answer: 'Yes, fasting for 8-10 hours is typically required for accurate results, especially for blood sugar and lipid profile tests.' },
        { question: 'Does a full body checkup include a urine test?', answer: 'Yes, a routine urine examination is included in most standard full body checkup packages.' },
        { question: 'What other tests might be recommended based on full body checkup results?', answer: 'Depending on abnormalities, doctors might recommend further tests like ultrasound, MRI, or specialized blood tests.' },
        { question: 'Can children get a full body checkup?', answer: 'Yes, pediatric health checkup packages are available and tailored for children\'s specific health needs.' },
        { question: 'What is the Importance of Annual Health Check?', answer: 'Annual checks help in early detection of diseases, monitoring existing conditions, and maintaining overall wellness.' },
    ];

    const filteredTests = tests.filter(test =>
        (filter === 'All' || test.category === filter) &&
        test.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    if (view === 'details' && selectedDetailTest) {
        return (
            <LabTestDetailsView
                test={selectedDetailTest}
                onBack={() => setView('list')}
                onBook={handleBookTest}
                onSuggestionClick={handleViewDetails}
            />
        );
    }

    if (view === 'my-bookings') {
        return (
            <MyLabBookingsView
                user={user}
                onBack={() => setView('list')}
            />
        );
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#115E59]"></div></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Section */}
            <div className="bg-[#115E59] text-white py-12 px-4 shadow-md">
                <div className="container mx-auto max-w-5xl text-center relative">

                    {/* My Bookings Button */}
                    <div className="absolute top-0 right-0">
                        <button
                            onClick={() => setView('my-bookings')}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                        >
                            <Calendar size={16} /> My Bookings
                        </button>
                    </div>

                    <h1 className="text-4xl font-bold mb-4 text-white" style={{ WebkitTextFillColor: 'white' }}>Lab Tests & Health Packages</h1>
                    <p className="text-lg opacity-90 mb-8">Book comprehensive health checkups from the comfort of your home.</p>

                    <div className="relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search for tests or packages..."
                            className="w-full py-4 pl-12 pr-4 rounded-xl text-gray-800 shadow-lg focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 py-8">

                {/* Filters and List Section */}
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Filters Sidebar */}
                    <div className="w-full md:w-1/4">
                        <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
                            <div className="flex items-center gap-2 mb-4">
                                <Filter size={20} className="text-[#115E59]" />
                                <h2 className="font-bold text-lg text-gray-800">Filters</h2>
                            </div>
                            <div className="space-y-2">
                                {['All', 'Health Packages', 'Diabetes', 'Hormonal', 'Vitamins', 'Heart', 'Kidney'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setFilter(cat)}
                                        className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${filter === cat ? 'bg-[#115E59] text-white font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Test List */}
                    <div className="w-full md:w-3/4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Popular Checkups</h2>
                        <div className="grid gap-6">
                            {filteredTests.map(test => (
                                <div key={test._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition-shadow">
                                    <div className="mb-4 sm:mb-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded font-medium">{test.category}</span>
                                            {test.reportsWithin && <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {test.reportsWithin}</span>}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{test.title}</h3>
                                        <p className="text-gray-500 text-sm mb-3 max-w-md line-clamp-2">{test.description}</p>
                                        <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                                            <CheckCircle size={16} />
                                            <span>Certified Labs</span>
                                            <CheckCircle size={16} className="ml-2" />
                                            <span>Free Home Collection</span>
                                        </div>
                                        <button onClick={() => handleViewDetails(test._id)} className="text-[#115E59] text-sm font-medium hover:underline flex items-center gap-1">
                                            <Info size={14} /> View Details & Benefits
                                        </button>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                        <div className="text-right">
                                            <span className="text-gray-400 line-through text-sm">₹{test.originalPrice}</span>
                                            <div className="text-2xl font-bold text-[#115E59]">₹{test.price}</div>
                                        </div>
                                        <button
                                            onClick={() => handleBookTest(test)}
                                            className="bg-[#115E59] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0d4a46] transition-colors w-full"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-16 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white border-b border-gray-200">
                                <button
                                    className="w-full py-4 text-left flex justify-between items-center focus:outline-none"
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span className="text-base font-medium text-gray-800">{faq.question}</span>
                                    {activeFaq === index ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
                                </button>
                                {activeFaq === index && (
                                    <div className="pb-4 text-gray-600 text-sm leading-relaxed">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Booking Modal (Global for all views) */}
            {bookingTest && (
                <LabBookingModal
                    test={bookingTest}
                    user={user}
                    onClose={() => setBookingTest(null)}
                    onSubmit={handleBookingSubmit}
                />
            )}

        </div>
    );
};

export default LabTests;
