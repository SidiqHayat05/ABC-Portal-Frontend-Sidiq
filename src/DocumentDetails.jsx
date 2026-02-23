import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './services/api';

function DocumentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocDetails = async () => {
            try {
                const res = await api.get(`/documents/${id}`);
                setDoc(res.data);
            } catch (err) {
                console.error("Error fetching details:", err);
                alert("Could not load document details.");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchDocDetails();
    }, [id, navigate]);

    if (loading) return <div style={{ padding: '20px' }}>Loading document metadata...</div>;
    if (!doc) return <div style={{ padding: '20px' }}>Document not found.</div>;

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: 'auto' }}>
            <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '20px', cursor: 'pointer' }}>
                ← Back to Dashboard
            </button>
            
            <div style={{ border: '1px solid #ddd', borderRadius: '10px', padding: '30px', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h1 style={{ color: '#007bff', marginTop: 0 }}>{doc.title}</h1>
                <hr />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                    <div>
                        <p><strong>Document ID:</strong> {doc.id}</p>
                        <p><strong>Department ID:</strong> {doc.department_id}</p>
                        <p><strong>Uploaded At:</strong> {new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p><strong>Description:</strong> {doc.description || 'No description provided.'}</p>
                        <p><strong>Status:</strong> <span style={{ color: 'green' }}>Active</span></p>
                    </div>
                </div>

                <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '5px' }}>
                    <p style={{ margin: 0 }}><strong>Technical Metadata:</strong></p>
                    <small style={{ color: '#666' }}>
                        File Path: {doc.file_path} <br />
                        Access Level: {doc.access_level || 'Standard'}
                    </small>
                </div>
            </div>
        </div>
    );
}

export default DocumentDetails;