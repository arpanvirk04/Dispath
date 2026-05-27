import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import driverService from '../../prototype/services/driverPrototypeService';
import { Lock, Mail, Phone, IdCard } from 'lucide-react';

const defaultForm = {
    name: '',
    phone: '',
    licenceType: '',
    password: '',
    confirmPassword: ''
};

const licenceOptions = ['G2', 'G', 'AZ', 'DZ'];

const DriverOnboarding = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [invite, setInvite] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState(defaultForm);
    const [submitStatus, setSubmitStatus] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing invite token.');
            setLoading(false);
            return;
        }
        let mounted = true;
        driverService.getInviteByToken(token)
            .then(data => {
                if (!mounted) return;
                setInvite(data);
                setFormData(prev => ({
                    ...prev,
                    name: data?.name || '',
                    phone: data?.phone || '',
                    licenceType: data?.licenceType || ''
                }));
            })
            .catch(() => {
                setError('Invite not found or has expired.');
            })
            .finally(() => setLoading(false));
        return () => { mounted = false };
    }, [token]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 8) {
            setSubmitStatus('Password must be at least 8 characters.');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setSubmitStatus('Passwords do not match.');
            return;
        }
        setSubmitting(true);
        setSubmitStatus('');
        try {
            await driverService.registerDriver(token, {
                name: formData.name,
                phone: formData.phone,
                licenceType: formData.licenceType,
                password: formData.password
            });
            setSubmitStatus('success');
        } catch (err) {
            console.error('Driver registration failed', err);
            setSubmitStatus('Failed to complete registration. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-600">Loading invite...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white shadow rounded-lg p-6 text-center max-w-md">
                    <p className="text-red-600 font-medium">{error}</p>
                    <p className="text-sm text-gray-500 mt-2">Request a new invite from your dispatcher.</p>
                </div>
            </div>
        );
    }

    if (submitStatus === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white shadow rounded-lg p-6 text-center max-w-md space-y-3">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome aboard!</h1>
                    <p className="text-gray-600">Your driver account has been created. You can now sign in using the DisPath driver portal.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-lg">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">DisPath Driver Registration</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Completing invite for <span className="font-medium text-gray-700">{invite?.email}</span>
                    </p>
                </div>
                {submitStatus && submitStatus !== 'success' && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                        {submitStatus}
                    </div>
                )}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 text-gray-500">
                            <Mail size={16} /> {invite?.email}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <div className="flex items-center gap-2 border rounded-lg px-3">
                            <IdCard size={16} className="text-gray-400" />
                            <input
                                type="text"
                                className="w-full py-2 focus:outline-none"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <div className="flex items-center gap-2 border rounded-lg px-3">
                            <Phone size={16} className="text-gray-400" />
                            <input
                                type="tel"
                                className="w-full py-2 focus:outline-none"
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Licence Type</label>
                        <select
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            value={formData.licenceType}
                            onChange={(e) => handleChange('licenceType', e.target.value)}
                            required
                        >
                            <option value="">Select licence type</option>
                            {licenceOptions.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="flex items-center gap-2 border rounded-lg px-3">
                            <Lock size={16} className="text-gray-400" />
                            <input
                                type="password"
                                className="w-full py-2 focus:outline-none"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">At least 8 characters.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="flex items-center gap-2 border rounded-lg px-3">
                            <Lock size={16} className="text-gray-400" />
                            <input
                                type="password"
                                className="w-full py-2 focus:outline-none"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
                    >
                        {submitting ? 'Creating Account...' : 'Create Driver Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DriverOnboarding;
