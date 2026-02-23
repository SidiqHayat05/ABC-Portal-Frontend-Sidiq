import { useEffect, useState, useCallback } from 'react';
import api from './services/api';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const [docs, setDocs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [showUpload, setShowUpload] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('1'); 

    const [editingDoc, setEditingDoc] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');

    const [message, setMessage] = useState({ text: '', type: '' });

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));


    const showToast = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token'); 
        localStorage.removeItem('user');  
        navigate('/'); 
    }, [navigate]);

    const fetchDocs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/documents');
            setDocs(res.data);
        } catch {
            handleLogout();
        } finally {
            setLoading(false);
        }
    }, [handleLogout]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/'); 
        else fetchDocs();
    }, [navigate, fetchDocs]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/documents/${editingDoc.id}`, { 
                title: editTitle, 
                description: editDesc 
            });
            setEditingDoc(null);
            fetchDocs();
            showToast("DETAIL UPDATED", "success");
        } catch { 
            showToast("Update failed", "error"); 
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', file);
        formData.append('description', description);
        formData.append('department_id', user?.department_id || 1);
        formData.append('category_id', categoryId); 
        formData.append('access_level', 'Public'); 

        setLoading(true);
        try {
            await api.post('/documents', formData, { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            setShowUpload(false); setTitle(''); setFile(null); setDescription('');
            fetchDocs(); 
            showToast("DOCUMENT UPLOADED", "success");
        } catch (err) { 
            console.error(err.response?.data); 
            showToast("Upload failed", "error"); 
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("CONFIRM DELETION?")) return; 
        try {
            await api.delete(`/documents/${id}`);
            showToast("DOCUMENT DELETED", "success");
            setDocs(prevDocs => prevDocs.filter(doc => doc.id !== id));
        } catch {
            showToast("DELETE FAILED: Unauthorized", "error");
        }
    };
 
    const filteredDocs = docs
        .filter(doc => {
            const searchStr = searchTerm.toLowerCase();
            const matchesSearch = doc.title.toLowerCase().includes(searchStr) || 
                                 (doc.description && doc.description.toLowerCase().includes(searchStr));
            const matchesDept = deptFilter === '' || doc.department_id.toString() === deptFilter;
            return matchesSearch && matchesDept;
        })
        .sort((a, b) => {
            if (sortBy === 'name') return a.title.localeCompare(b.title);
            if (sortBy === 'name-desc') return b.title.localeCompare(a.title);
            if (sortBy === 'size-large') return b.file_size - a.file_size;
            if (sortBy === 'size-small') return a.file_size - b.file_size;
            if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
            return new Date(b.created_at) - new Date(a.created_at);
        });

    const resetFilters = () => {
        setSearchTerm('');
        setDeptFilter('');
        setSortBy('date');
    };

    const getRoleLabel = (id) => id === 1 ? "System Admin" : (id >= 2 && id <= 4 ? "Dept Manager" : "Staff Member");

    return (
        <div className="min-h-screen bg-[#0B0E14] flex font-sans text-slate-200 overflow-x-hidden relative">
            
            {message.text && (
                <div className={`fixed top-10 right-10 p-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-2xl z-[200] animate-bounce
                    ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'}`}>
                    {message.text}
                </div>
            )}

            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-md" 
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <aside className={`
                bg-[#11141B] flex flex-col fixed md:sticky top-0 h-screen z-50 transition-all duration-300
                ${isSidebarOpen ? 'w-64 p-6 border-r border-slate-800' : 'w-0 p-0 border-none overflow-hidden'}
            `}>
                {isSidebarOpen && (
                    <>
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-black shadow-[0_0_15px_rgba(59,130,246,0.5)]">A</div>
                                <span className="text-lg font-bold text-white">ABC Corp</span>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-500">✕</button>
                        </div>
                        <nav className="grow">
                            <button className="w-full text-left px-4 py-2 rounded-lg bg-slate-800 text-blue-400 font-bold italic">Dashboard</button>
                        </nav>
                        <div className="border-t border-slate-800 pt-6">
                            <div className="bg-[#1A1E26] p-4 rounded-xl border border-slate-800">
                                <p className="text-[10px] text-slate-500 uppercase font-black mb-1 tracking-widest">User</p>
                                <p className="text-sm font-bold truncate text-white">{user?.name}</p>
                                <button onClick={handleLogout} className="text-xs text-red-400 mt-2 font-bold hover:text-red-300">Sign Out</button>
                            </div>
                        </div>
                    </>
                )}
            </aside>

            <main className="grow p-4 md:p-10 flex flex-col items-center overflow-y-auto w-full">
                <div className="w-full max-w-5xl">
                    
                    <div className="flex items-center gap-4 mb-8">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 bg-[#1A1E26] border border-slate-800 rounded-lg hover:bg-slate-800"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                        <div>
                            <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter text-white">Employee Portal</h2>
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest">{getRoleLabel(user?.department_id)}</p>
                        </div>
                    </div>

                    <div className="w-full mb-4 flex justify-between items-end px-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Showing {filteredDocs.length} Documents
                        </p>
                        <button onClick={resetFilters} className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300">
                            Reset Filters
                        </button>
                    </div>

                    <div className="bg-[#11141B] rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
                        <div className="flex flex-col md:flex-row p-4 gap-3 bg-[#1A1E26]/50 border-b border-slate-800 items-center">
                            <div className="w-full">
                                <input type="text" placeholder="Search..." className="w-full bg-[#0B0E14] border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            
                            <div className="flex w-full md:w-auto justify-between md:justify-end gap-1">
                                <select className="w-[30%] md:w-auto bg-[#0B0E14] border border-slate-800 rounded-xl px-1 md:px-2 py-2 text-[10px] md:text-xs font-bold text-slate-400 outline-none" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                                    <option value="">Dept</option>
                                    <option value="1">Human Resources (HR)</option>
                                    <option value="2">Finance</option>
                                    <option value="3">Information Technology (IT)</option>
                                    <option value="4">Marketing</option>
                                    <option value="5">Operations</option>
                                </select>
                                <select className="w-[35%] md:w-auto bg-[#0B0E14] border border-slate-800 rounded-xl px-2 py-2 text-[10px] md:text-xs font-bold text-slate-400 outline-none" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                    <option value="date">Latest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="name">Title (A-Z)</option>
                                    <option value="size-small">Smallest</option>
                                    <option value="size-large">Largest</option>
                                </select>
                                {user?.department_id <= 4 && (
                                    <button onClick={() => setShowUpload(true)} className="w-[30%] md:w-auto bg-blue-600 text-white px-2 md:px-3 py-2 rounded-xl font-bold text-[10px] md:text-xs uppercase">Upload</button>
                                )}
                            </div>
                        </div>
                        
                        <div className="w-full overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#1A1E26]/30">
                                    <tr>
                                        <th className="px-6 py-4 font-black text-slate-500 uppercase text-[10px] tracking-widest">Asset Details</th>
                                        <th className="px-6 py-4 font-black text-slate-500 uppercase text-[10px] tracking-widest text-right hidden md:table-cell">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="2" className="p-20 text-center font-black text-slate-700 animate-pulse uppercase tracking-widest">Syncing Stream...</td>
                                        </tr>
                                    ) : (
                                        filteredDocs.map(doc => (
                                            <tr key={doc.id} className="group hover:bg-blue-900/10 transition-colors flex flex-col md:table-row">
                                                <td className="px-6 py-6" colSpan={window.innerWidth < 768 ? 2 : 1}>
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-slate-300 truncate">{doc.title}</p>
                                                            <p className="text-[10px] text-slate-600 italic truncate">{doc.description || "N/A"}</p>
                                                        </div>
                                                        <div className="mt-6 md:hidden">
                                                            <p className="font-black text-slate-500 uppercase text-[10px] tracking-widest mb-3">Actions</p>
                                                            <div className="flex flex-wrap items-center gap-4">
                                                                <button onClick={() => window.open(`http://localhost:8001/api/v1/documents/${doc.id}/preview`, '_blank')} className="font-black text-emerald-400 uppercase text-xs">View</button>
                                                                <button onClick={() => window.open(`http://localhost:8001/api/v1/documents/${doc.id}/download`, '_blank')} className="font-black text-blue-400 uppercase text-xs">Get</button>
                                                                <button onClick={() => {setEditingDoc(doc); setEditTitle(doc.title); setEditDesc(doc.description || '');}} className="font-black text-amber-500 uppercase text-xs">Edit</button>
                                                                {user?.department_id === 1 && <button onClick={() => handleDelete(doc.id)} className="font-black text-red-900 uppercase text-xs">Kill</button>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden md:table-cell px-6 py-6 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-6">
                                                        <button onClick={() => window.open(`http://localhost:8001/api/v1/documents/${doc.id}/preview`, '_blank')} className="font-black text-emerald-400 uppercase">View</button>
                                                        <button onClick={() => window.open(`http://localhost:8001/api/v1/documents/${doc.id}/download`, '_blank')} className="font-black text-blue-400 uppercase">Get</button>
                                                        <button onClick={() => {setEditingDoc(doc); setEditTitle(doc.title); setEditDesc(doc.description || '');}} className="font-black text-amber-500 uppercase">Edit</button>
                                                        {user?.department_id === 1 && <button onClick={() => handleDelete(doc.id)} className="font-black text-red-900 uppercase">Kill</button>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {editingDoc && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-100 p-4">
                    <div className="bg-[#11141B] p-8 rounded-[30px] w-full max-w-md border border-slate-800">
                        <h3 className="text-xl font-black text-white mb-6 uppercase italic">Patch Metadata</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <input className="w-full p-4 bg-[#0B0E14] border border-slate-800 rounded-xl text-white text-sm" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                            <textarea className="w-full p-4 bg-[#0B0E14] border border-slate-800 rounded-xl h-24 text-slate-400 text-sm" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                            <div className="flex gap-3">
                                <button type="submit" className="grow bg-blue-600 text-white py-3 rounded-xl font-black text-xs uppercase">Execute</button>
                                <button type="button" onClick={() => setEditingDoc(null)} className="grow bg-slate-800 text-slate-400 py-3 rounded-xl font-black text-xs uppercase">Abort</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showUpload && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-100 p-4">
                    <div className="bg-[#11141B] p-8 rounded-[30px] w-full max-w-md border border-slate-800">
                        <h3 className="text-xl font-black text-white mb-6 uppercase italic">New Asset</h3>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <input className="w-full p-4 bg-[#0B0E14] border border-slate-800 rounded-xl text-white text-sm" placeholder="Asset Title" value={title} onChange={e => setTitle(e.target.value)} required />
                            <input className="w-full p-4 bg-[#0B0E14] border border-slate-800 rounded-xl text-white text-sm" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                            
                            <select 
                                className="w-full p-4 bg-[#0B0E14] border border-slate-800 rounded-xl text-white text-sm outline-none"
                                value={categoryId} 
                                onChange={e => setCategoryId(e.target.value)}
                            >
                                <option value="1">Policy</option>
                                <option value="2">Report</option>
                                <option value="3">Template</option>
                                <option value="4">Guide</option>
                                <option value="5">Form</option>
                                <option value="6">Other</option>
                            </select>

                            <input type="file" className="w-full text-[10px] text-slate-500" onChange={e => setFile(e.target.files[0])} required />
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="grow bg-blue-600 text-white py-3 rounded-xl font-black text-xs uppercase">Upload</button>
                                <button type="button" onClick={() => setShowUpload(false)} className="grow bg-slate-800 text-slate-400 py-3 rounded-xl font-black text-xs uppercase">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;