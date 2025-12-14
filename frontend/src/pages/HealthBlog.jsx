import React, { useState } from 'react';
import { Search, Calendar, User, ArrowRight, Tag, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BLOG_POSTS, CATEGORIES } from '../data/blogData';

const HealthBlog = () => {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    // Filter Logic
    const getFilteredPosts = () => {
        let posts = BLOG_POSTS;

        // 1. Search Filter
        if (searchQuery) {
            posts = posts.filter(post =>
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 2. Category Filter
        if (activeCategory === "All") {
            // Show 1 post from each category
            if (!searchQuery) {
                const categories = CATEGORIES.filter(c => c !== "All");
                const representativePosts = [];
                categories.forEach(cat => {
                    const post = posts.find(p => p.category === cat);
                    if (post) representativePosts.push(post);
                });
                return representativePosts;
            }
            return posts; // If searching, show all matches regardless of category
        } else {
            // Show all posts for the selected category
            return posts.filter(post => post.category === activeCategory);
        }
    };

    const filteredPosts = getFilteredPosts();

    return (
        <div className="min-h-screen bg-gray-50 pt-28">
            {/* Hero Section */}
            <div className="bg-[#1A73E8] text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-md"
                        >
                            Health & Wellness Blog
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-blue-100 mb-8"
                        >
                            Expert insights, tips, and guides to help you live a healthier, happier life.
                        </motion.p>

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative max-w-xl mx-auto"
                        >
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search articles, topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-lg"
                            />
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Categories */}
                <div className="flex flex-wrap gap-3 justify-center mb-12 mt-4">
                    {CATEGORIES.map((category, index) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category
                                ? 'bg-[#1A73E8] text-white shadow-md transform scale-105'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post, index) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-[#1A73E8] flex items-center gap-1">
                                    <Tag size={12} />
                                    {post.category}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {post.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {post.readTime}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#1A73E8] transition-colors">
                                    {post.title}
                                </h3>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {post.excerpt}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <User size={14} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{post.author}</span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/blog/${post.id}`)}
                                        className="text-[#1A73E8] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                                    >
                                        Read More <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {filteredPosts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
                        <button
                            onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
                            className="mt-4 text-[#1A73E8] font-medium hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthBlog;
