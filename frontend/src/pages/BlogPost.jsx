import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Tag, Share2, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { BLOG_POSTS } from '../data/blogData';

const BlogPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const post = BLOG_POSTS.find(p => p.id === parseInt(id));

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Article Not Found</h2>
                    <button
                        onClick={() => navigate('/blog')}
                        className="text-primary hover:underline"
                    >
                        Back to Blog
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-28 pb-16">
            <article className="max-w-4xl mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/blog')}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#1A73E8] mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Articles
                </button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-2 text-[#1A73E8] font-semibold mb-4">
                        <Tag size={16} />
                        {post.category}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-gray-500 text-sm border-b border-gray-100 pb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{post.author}</p>
                                <p>Medical Editor</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={18} />
                            {post.date}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={18} />
                            {post.readTime}
                        </div>
                    </div>
                </motion.div>

                {/* Featured Image */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-12 rounded-2xl overflow-hidden shadow-lg"
                >
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-[400px] object-cover"
                    />
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="prose prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Share & Save */}
                <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors">
                            <Share2 size={18} />
                            Share
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors">
                            <Bookmark size={18} />
                            Save
                        </button>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default BlogPost;
