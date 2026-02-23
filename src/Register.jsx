import { useState } from 'react';
import api from './services/api';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dept, setDept] = useState(1);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            console.log("Sending Register Payload:", { name, email, password, department_id: dept });

            const res = await api.post('/register', { 
                name: name.trim(), 
                email: email.trim().toLowerCase(), 
                password: password, 
                department_id: Number(dept)
            });

            console.log("Register Success:", res.data);
            alert("Registration Successful! Please log in.");
            navigate('/');
        } catch (error) {

            const backendErrors = error.response?.data?.errors;
            const errorMsg = backendErrors 
                ? Object.values(backendErrors).flat().join('\n') 
                : "Check your connection or credentials.";
            
            console.error("Validation failed:", backendErrors);
            alert("Registration failed:\n" + errorMsg);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-100 space-y-8">
                <div className="flex justify-center">
                    <div className="w-12 h-12 border-2 border-blue-500 rounded-xl flex items-center justify-center text-blue-500 text-2xl font-black shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        A
                    </div>
                </div>

                <div className="text-center">
                    <h2 className="text-3xl font-black tracking-tighter text-white italic uppercase">Create Account</h2>
                    <p className="text-slate-500 mt-2 font-medium text-sm">Join the ABC Corporation Work Portal</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <input 
                        type="text" placeholder="Full Name" 
                        className="w-full p-4 bg-[#11141B] border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 font-bold"
                        value={name} onChange={(e) => setName(e.target.value)} required 
                    />
                    <input 
                        type="email" placeholder="Email Address" 
                        className="w-full p-4 bg-[#11141B] border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 font-bold"
                        value={email} onChange={(e) => setEmail(e.target.value)} required 
                    />
                    <input 
                        type="password" placeholder="Password (Min 8 characters)" 
                        className="w-full p-4 bg-[#11141B] border border-slate-800 rounded-xl text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 font-bold"
                        value={password} onChange={(e) => setPassword(e.target.value)} required 
                    />
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Organization Unit</label>
                        <select 
                            className="w-full p-4 bg-[#11141B] border border-slate-800 rounded-xl text-slate-300 font-bold outline-none focus:border-blue-500 appearance-none cursor-pointer"
                            value={dept} onChange={(e) => setDept(parseInt(e.target.value))}
                        >
                            <option value="1">Human Resources (Admin)</option>
                            <option value="2">Information Technology</option>
                            <option value="3">Finance & Tax</option>
                            <option value="4">Marketing & Sales</option>
                            <option value="5">Operations</option>
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-900/40 transition-all active:scale-95 mt-4">
                        Register Account
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-slate-500 text-sm">
                        Existing user? <Link to="/" className="text-blue-500 font-bold hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;