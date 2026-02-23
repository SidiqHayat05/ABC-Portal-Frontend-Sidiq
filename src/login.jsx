import { useState } from 'react';
import api from './services/api';
import { Link } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

   const handleLogin = async (e) => {
    e.preventDefault();
    try {
        localStorage.clear();
        const res = await api.post('/login', { 
            email: email.trim(), 
            password: password 
        });

        if (res.data && res.data.access_token) {
            localStorage.setItem('token', res.data.access_token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            window.location.href = '/dashboard';
        }
    } catch (error) {
        const msg = error.response?.data?.message || "Invalid Credentials";
        alert("Login Failed: " + msg);
    }
};

    return (
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-100 space-y-8">
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-[0_0_20px_rgba(37,99,235,0.4)]">A</div>
                </div>
                <div className="text-center">
                    <h2 className="text-3xl font-black tracking-tighter text-white italic uppercase">Sign in to Portal</h2>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input 
                        type="email" placeholder="Email address" 
                        className="w-full p-4 bg-[#11141B] border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                        value={email} onChange={(e) => setEmail(e.target.value)} required 
                    />
                    <input 
                        type="password" placeholder="Password" 
                        className="w-full p-4 bg-[#11141B] border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                        value={password} onChange={(e) => setPassword(e.target.value)} required 
                    />
                    <button type="submit" className="w-full bg-white text-black py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all active:scale-95 mt-4">
                        Log In
                    </button>
                </form>
                <div className="text-center">
                    <p className="text-slate-500 text-sm">Don't have an account? <Link to="/register" className="text-blue-500 font-bold hover:underline">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
}

export default Login;