import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FiDownload, FiX } from 'react-icons/fi';

const QRCodeDisplay = ({ shortUrl, shortId, onClose }) => {
    const qrRef = useRef();

    const downloadQR = () => {
        const svg = qrRef.current.querySelector('svg');
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = url;
            link.download = `qr-${shortId}.png`;
            link.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black border border-gray-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-purple-900/20 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-lg transition"
                >
                    <FiX size={20} />
                </button>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-2">QR Code</h2>
                <p className="text-gray-400 text-sm mb-6">Share this QR code or download it</p>

                {/* QR Code */}
                <div ref={qrRef} className="flex justify-center mb-6 p-4 bg-white rounded-xl">
                    <QRCodeSVG
                        value={shortUrl}
                        size={200}
                        level="H"
                        includeMargin={true}
                    />
                </div>

                {/* URL Display */}
                <div className="mb-6 p-3 bg-gray-900 rounded-lg border border-gray-800">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Short URL</p>
                    <p className="text-sm text-white font-mono break-all">{shortUrl}</p>
                </div>

                {/* Download Button */}
                <button
                    onClick={downloadQR}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-900/50 hover:bg-purple-900/70 text-purple-200 rounded-lg font-semibold transition border border-purple-500/30 mb-3"
                >
                    <FiDownload size={18} />
                    Download QR Code
                </button>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition border border-gray-800"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default QRCodeDisplay;
