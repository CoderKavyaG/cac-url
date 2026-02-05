import React, { useState } from 'react';
import { FiX, FiCopy } from 'react-icons/fi';
import { FaXTwitter, FaLinkedin } from 'react-icons/fa6';

const ShareModal = ({ url, onClose }) => {
    const [copied, setCopied] = useState(false);

    const shortUrl = url.customAlias 
        ? `${window.location.origin}/${url.customAlias}`
        : `${window.location.origin}/${url.shortId}`;

    // Generate social media share URLs
    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortUrl)}`
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = (platform) => {
        window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-black border border-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl shadow-purple-900/20">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Share Link</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-purple-900/20 rounded-lg transition text-gray-400 hover:text-purple-300"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* URL Display */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Your Short Link</p>
                    <div className="flex items-center gap-2">
                        <p className="text-white font-mono break-all text-sm flex-1 min-w-0">{shortUrl}</p>
                        <button
                            onClick={handleCopy}
                            className={`p-2 rounded-lg transition flex-shrink-0 ${
                                copied
                                    ? 'bg-green-900/30 text-green-400'
                                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                            }`}
                            title="Copy link"
                        >
                            <FiCopy size={18} />
                        </button>
                    </div>
                    {copied && <p className="text-xs text-green-400 mt-2">✓ Copied to clipboard!</p>}
                </div>

                {/* Share Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => handleShare('twitter')}
                        className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-semibold transition border border-gray-800"
                    >
                        <FaXTwitter size={18} />
                        Share on X
                    </button>
                    <button
                        onClick={() => handleShare('linkedin')}
                        className="w-full flex items-center justify-center gap-2 bg-purple-900/50 hover:bg-purple-900/70 text-purple-200 py-3 px-4 rounded-lg font-semibold transition border border-purple-500/30"
                    >
                        <FaLinkedin size={18} />
                        Share on LinkedIn
                    </button>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full mt-6 bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg font-medium transition border border-gray-800 text-sm"
                >
                    Done
                </button>
            </div>
        </div>
    );
};

export default ShareModal;
