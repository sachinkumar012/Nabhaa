import React from 'react';
import { ChevronLeft, CheckCircle, Clock, AlertCircle, Calendar, ShieldCheck } from 'lucide-react';

const LabTestDetailsView = ({ test, onBack, onBook, onSuggestionClick }) => {
    if (!test) return null;

    return (
        <div className="min-h-screen bg-white">
            {/* Header / Back Button */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-100 px-4 py-3">
                <div className="container mx-auto max-w-5xl">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#115E59] transition-colors font-medium"
                    >
                        <ChevronLeft size={20} /> Back to Lab Tests
                    </button>
                </div>
            </div>

            <div className="container mx-auto max-w-5xl px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Left Column: Details */}
                    <div className="lg:w-2/3">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="bg-teal-50 p-4 rounded-2xl">
                                <span className="text-4xl">🧪</span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-teal-100 text-[#115E59] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                        {test.category}
                                    </span>
                                    {test.fastingRequired && (
                                        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <AlertCircle size={12} /> Fasting Required
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.title}</h1>
                                <p className="text-gray-600 text-lg leading-relaxed">{test.description}</p>
                            </div>
                        </div>

                        {/* Feature Highlights */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-8">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                                <Clock className="text-blue-600" />
                                <div>
                                    <p className="text-xs text-blue-600 font-semibold uppercase">Report Time</p>
                                    <p className="font-semibold text-blue-900">{test.reportsWithin || '24-48 Hours'}</p>
                                </div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                                <ShieldCheck className="text-green-600" />
                                <div>
                                    <p className="text-xs text-green-600 font-semibold uppercase">Lab Quality</p>
                                    <p className="font-semibold text-green-900">NABL Certified Labs</p>
                                </div>
                            </div>
                        </div>

                        {/* Tests Included */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                                <CheckCircle className="text-[#115E59]" />
                                Tests Included in Package
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-y-3 gap-x-8">
                                {test.features && test.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-gray-700">
                                        <div className="w-1.5 h-1.5 bg-[#115E59] rounded-full mt-2 flex-shrink-0"></div>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Required for */}
                        {test.recommendedFor && (
                            <div className="mb-8">
                                <h3 className="font-bold text-gray-900 mb-3">Recommended For</h3>
                                <p className="text-gray-600 bg-white border border-gray-200 p-4 rounded-xl">{test.recommendedFor}</p>
                            </div>
                        )}

                        {/* Suggestions */}
                        {test.suggestions && test.suggestions.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Booked Together</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {test.suggestions.map(suggestion => (
                                        <div
                                            key={suggestion._id}
                                            className="group border border-gray-200 p-5 rounded-xl hover:border-[#115E59] hover:shadow-md transition-all cursor-pointer flex justify-between items-center bg-white"
                                            onClick={() => onSuggestionClick(suggestion._id)}
                                        >
                                            <div>
                                                <h4 className="font-bold text-gray-800 group-hover:text-[#115E59] transition-colors">{suggestion.title}</h4>
                                                <p className="text-gray-500 text-sm mt-1">{suggestion.reportsWithin || '24 hrs'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[#115E59] font-bold text-lg">₹{suggestion.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Pricing Card */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                            <div className="mb-6">
                                <span className="text-gray-400 line-through text-sm">₹{test.originalPrice}</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-[#115E59]">₹{test.price}</span>
                                    <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded">
                                        {Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)}% OFF
                                    </span>
                                </div>
                                <p className="text-gray-500 text-xs mt-1">Inclusive of all taxes</p>
                            </div>

                            <button
                                onClick={() => onBook(test)}
                                className="w-full bg-[#115E59] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0d4a46] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 mb-4"
                            >
                                Book Test Now
                            </button>

                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={18} className="text-[#115E59]" />
                                    <span>Safe & Hygienic Sample Collection</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock size={18} className="text-[#115E59]" />
                                    <span>Timely Report Delivery</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-[#115E59]" />
                                    <span>Flexible Slot Booking</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LabTestDetailsView;
