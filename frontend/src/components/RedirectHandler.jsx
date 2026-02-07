import React, { useEffect, useState } from 'react';
import { urlApi } from '../services/api';

const RedirectHandler = ({ shortId }) => {
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndRedirect = async () => {
            if (!shortId) return;

            try {
                // Construct the backend redirect URL
                // We ensure we don't have double slashes if shortId has one, though passing it clean is best.
                // Construct the backend redirect URL
                const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

                if (!baseUrl) {
                    throw new Error("API URL is not configured");
                }

                const cleanId = shortId.replace(/^\//, '');
                const backendRedirectUrl = `${baseUrl}/${cleanId}`;

                // Redirect to backend
                window.location.href = backendRedirectUrl;

            } catch (err) {
                console.error("Redirection error:", err);
                setError("Failed to redirect.");
            }
        };

        fetchAndRedirect();
    }, [shortId]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center">
                    <h1 className="text-4xl text-neon-red mb-4">Error</h1>
                    <p className="text-gray-400">{error}</p>
                    <a href="/" className="mt-4 inline-block text-neon-blue hover:underline">Go Home</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="text-center animate-pulse">
                <div className="inline-block w-12 h-12 border-4 border-t-neon-blue border-r-transparent border-b-neon-purple border-l-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xl font-mono text-gray-300">Redirecting...</p>
            </div>
        </div>
    );
};

export default RedirectHandler;
