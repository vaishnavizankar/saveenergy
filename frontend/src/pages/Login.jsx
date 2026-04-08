import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// AUTH BYPASS: This page is now disabled.
const Login = () => {
    const navigate = useNavigate();
    useEffect(() => {
        // Force navigate to dashboard immediately on load
        navigate('/', { replace: true });
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-inter">
            <div className="text-center">
                <div className="w-12 h-12 border-[4px] border-eco-100 border-t-eco-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs">Entering Dashboard...</h3>
            </div>
        </div>
    );
};

export default Login;
