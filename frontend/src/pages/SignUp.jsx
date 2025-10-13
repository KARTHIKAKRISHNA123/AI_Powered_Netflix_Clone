import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../store/authStore';
import { AlertCircle } from 'lucide-react';

const SignUp = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {signup, isLoading, error} = useAuthStore();

  const handleSignUP = async (e) => {
    e.preventDefault();
    // console.log(username, email, password);
    try {
      await signup(username, email, password);
      navigate("/")
    } catch (error) {
      console.log(error);
    }
  }

  console.log("UserName: " + username, "\nEmail: " + email, "\nPassword: " +  password);
  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat px-4 md:px-8 py-5" 
    style={{
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/background_banner.jpg')",
    }} >
        <div className='max-w-[450px] w-full bg-black bg-opacity-75 mx-auto mt-20 p-8 rounded-md'>
            <h1 className='text-3xl font-medium text-white mb-7'>Sign Up</h1>

            <form onSubmit={handleSignUP} className='flex flex-col space-y-4 '>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter Your Username" className='w-full h-[50px] bg-[#333] text-white rounded px-5 text-base' />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className='w-full h-[50px] bg-[#333] text-white rounded px-5 text-base' placeholder="Enter Your Email"/>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className='w-full h-[50px] bg-[#333] text-white rounded px-5 text-base' placeholder="Enter Your Password"/>

                {error && (
                        <div className="flex items-center gap-x-2 bg-red-900/50 border border-red-700 text-red-300 text-sm p-3 rounded-md">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                <button disabled={isLoading} className='bg-[#e50914] py-3 text-white rounded font-semibold text-lg hover:opacity-90 cursor-pointer transition' type="submit">Sign Up</button>
            </form>

            <div className='text-gray-400 text-sm mt-10'>
                <p>Already have an account?<span onClick={() => navigate("/signin")}className='text-white font-medium cursor-pointer ml-2 hover:underline'>Sign In</span></p>
            </div>
        </div>
    </div>
  )
}

export default SignUp