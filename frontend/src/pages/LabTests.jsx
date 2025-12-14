import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, CheckCircle, Info } from 'lucide-react';

const LabTests = () => {
    const [activeFaq, setActiveFaq] = useState(null);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const checkups = [
        { id: 1, title: 'Full Body Checkup', price: 1499, originalPrice: 2999, category: 'Health Packages', description: 'Includes 75+ tests: Liver, Kidney, Lipid Profile, Thyroid, and more.' },
        { id: 2, title: 'Diabetes Screening', price: 499, originalPrice: 999, category: 'Diabetes', description: 'HbA1c, Fasting Blood Sugar, and Urine Glucose.' },
        { id: 3, title: 'Thyroid Profile', price: 399, originalPrice: 799, category: 'Hormonal', description: 'T3, T4, and TSH levels check.' },
        { id: 4, title: 'Vitamin Deficiency Panel', price: 899, originalPrice: 1599, category: 'Vitamins', description: 'Vitamin B12, Vitamin D, and Calcium.' },
        { id: 6, title: 'Heart Health Package', price: 1299, originalPrice: 2499, category: 'Heart', description: 'ECG, Lipid Profile, Troponin-I, and hs-CRP.' },
        { id: 7, title: 'Kidney Function Test', price: 599, originalPrice: 1199, category: 'Kidney', description: 'Creatinine, Urea, Uric Acid, Sodium, Potassium, and Chloride.' },
    ];

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

    const filteredCheckups = checkups.filter(checkup =>
        (filter === 'All' || checkup.category === filter) &&
        checkup.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Section */}
            <div className="bg-[#115E59] text-white py-12 px-4 shadow-md">
                <div className="container mx-auto max-w-5xl text-center">
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
                            {filteredCheckups.map(checkup => (
                                <div key={checkup.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition-shadow">
                                    <div className="mb-4 sm:mb-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded font-medium">{checkup.category}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{checkup.title}</h3>
                                        <p className="text-gray-500 text-sm mb-3 max-w-md">{checkup.description}</p>
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <CheckCircle size={16} />
                                            <span>Certified Labs</span>
                                            <CheckCircle size={16} className="ml-2" />
                                            <span>Free Home Collection</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                        <div className="text-right">
                                            <span className="text-gray-400 line-through text-sm">₹{checkup.originalPrice}</span>
                                            <div className="text-2xl font-bold text-[#115E59]">₹{checkup.price}</div>
                                        </div>
                                        <button className="bg-[#115E59] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0d4a46] transition-colors w-full">
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
        </div>
    );
};

export default LabTests;
