import { HelpCircle, LogOut, Search, Settings } from 'lucide-react';
import Logo from '../assets/logo.png';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router'; // 1. Corrected import
import { useAuthStore } from '../store/authStore';  // Corrected filename if needed
import { toast } from 'react-hot-toast';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();

    const avatarURL = user ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username)}` : "";

    // 2. Corrected Logout Handler
    const handleLogout = async () => {
        try {
            await logout(); // This function from the store doesn't return anything
            toast.success("Logged out successfully"); // Use a static message
            setShowMenu(false);
            navigate("/signin"); // Redirect the user to the sign-in page
        } catch (error) {
            toast.error("Logout failed. Please try again.");
            console.error("Logout error:", error);
        }
    };

    return (
        // Using the solid black, sticky style you requested
        <nav className='sticky top-0 z-50 bg-black text-gray-300 flex justify-between items-center p-4 h-20 text-sm md:text-[15px] font-medium'>
            <div className='flex items-center gap-8'>
                <Link to={'/'}>
                    <img src={Logo} alt="Logo" className='w-24 cursor-pointer' />
                </Link>
                <ul className='hidden xl:flex space-x-6'>
                    <li className='cursor-pointer hover:text-white transition-colors'>Home</li>
                    <li className='cursor-pointer hover:text-white transition-colors'>TV Shows</li>
                    <li className='cursor-pointer hover:text-white transition-colors'>Movies</li>
                    <li className='cursor-pointer hover:text-white transition-colors'>New & Popular</li>
                </ul>
            </div>

            <div className='flex space-x-4 items-center'>
                <div className='relative hidden md:inline-flex'>
                    <input type="text" className='bg-[#1a1a1a] border border-gray-700 px-4 py-2 rounded-full min-w-72 pr-10 outline-none focus:border-white transition-colors' placeholder='Search...' />
                    <Search className='absolute top-2.5 right-4 w-5 h-5 text-gray-500' />
                </div>
                
                <Link to={user ? "/ai-recommendations" : "/signin"}>
                    <button className='bg-[#e50914] px-5 py-2 text-white font-semibold rounded cursor-pointer hover:bg-red-700 transition-colors'>Get AI Movie Picks</button>
                </Link>

                {!user ? (
                    <Link to={'/signin'}>
                        <button className='bg-transparent border border-gray-600 px-5 py-2 text-white font-semibold rounded cursor-pointer hover:bg-gray-800 transition-colors'>Sign In</button>
                    </Link>
                ) : (
                    <div className='relative'>
                        <img 
                            src={avatarURL} 
                            alt="User Avatar" 
                            // 3. Corrected CSS typo
                            className='w-10 h-10 rounded-full border-2 border-transparent hover:border-white cursor-pointer' 
                            onClick={() => setShowMenu(!showMenu)} 
                        />
                        {showMenu && (
                            <div className='absolute right-0 mt-2 w-64 bg-[#1a1a1a] rounded-lg z-50 shadow-lg p-2 flex flex-col gap-1 border border-gray-700'>
                                <div className='flex flex-col items-center p-3 mb-1 border-b border-gray-700'>
                                    <span className='text-white font-semibold text-base'>{user.username}</span>
                                    <span className='text-xs text-gray-400'>{user.email}</span>
                                </div>
                                <button className='flex items-center w-full px-3 py-2.5 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white gap-3 cursor-pointer'>
                                    <Settings className='w-5 h-5' />
                                    Settings
                                </button>
                                <button className='flex items-center w-full px-3 py-2.5 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white gap-3 cursor-pointer'>
                                    <HelpCircle className='w-5 h-5' />
                                    Help Center
                                </button>
                                <button onClick={handleLogout} className='flex items-center w-full px-3 py-2.5 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white gap-3 cursor-pointer'>
                                    <LogOut className='w-5 h-5' />
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;