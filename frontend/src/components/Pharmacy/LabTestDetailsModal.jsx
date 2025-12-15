import React from 'react';
import { X, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const LabTestDetailsModal = ({ test, onClose, onBook }) => {
    if (!test) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={24} className="text-gray-500" />
                </button>

                <div className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="bg-teal-50 p-3 rounded-xl">
                            <span className="text-3xl">🧪</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-teal-100 text-[#115E59] px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide">
                                    {test.category}
                                </span>
                                {test.fastingRequired && (
                                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <AlertCircle size={10} /> Fasting Required
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{test.title}</h2>
                            <p className="text-gray-500 mt-1">{test.description}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle size={18} className="text-[#115E59]" />
                                Tests Included
                            </h3>
                            <ul className="space-y-2">
                                {test.features && test.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                        <div className="w-1.5 h-1.5 bg-[#115E59] rounded-full mt-1.5 flex-shrink-0"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                                    <Clock size={16} />
                                    Report Time
                                </div>
                                <p className="text-blue-600 text-sm">Reports available within {test.reportsWithin || '24-48 hours'}</p>
                            </div>

                            {test.recommendedFor && (
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                    <div className="font-medium text-purple-800 mb-1">Recommended For</div>
                                    <p className="text-purple-600 text-sm">{test.recommendedFor}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                        <div>
                            <span className="text-gray-400 line-through text-sm">₹{test.originalPrice}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold text-[#115E59]">₹{test.price}</span>
                                <span className="text-green-600 text-sm font-medium">Included Taxes</span>
                            </div>
                        </div>

                        <button
                            onClick={() => onBook(test)}
                            className="w-full sm:w-auto bg-[#115E59] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#0d4a46] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
                        >
                            Book Test Now
                        </button>
                    </div>

                    {/* Suggested Tests */}
                    {test.suggestions && test.suggestions.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4">Frequently Booked Together</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {test.suggestions.map(suggestion => (
                                    <div
                                        key={suggestion._id}
                                        className="border border-gray-200 p-4 rounded-xl hover:border-[#115E59] transition-colors cursor-pointer flex justify-between items-center group"
                                        onClick={() => { onClose(); onBook(suggestion); }}
                                    >
                                        <div>
                                            <h4 className="font-medium text-gray-800 text-sm group-hover:text-[#115E59] transition-colors">{suggestion.title}</h4>
                                            <p className="text-[#115E59] font-bold text-sm">₹{suggestion.price}</p>
                                        </div>
                                        <div className="bg-teal-50 p-2 rounded-full text-[#115E59] group-hover:bg-[#115E59] group-hover:text-white transition-colors">
                                            <CheckCircle size={16} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LabTestDetailsModal;
