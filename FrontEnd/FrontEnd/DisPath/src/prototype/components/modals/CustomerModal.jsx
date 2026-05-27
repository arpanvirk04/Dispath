import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const CustomerModal = ({
                                  isOpen,
                                  onClose,
                                  onSubmit,
                                  initialData,
                              }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                email: initialData.email,
                phone: initialData.phone,
                address: initialData.address,
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
            });
        }
        setErrors({});
    }, [initialData, isOpen]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(formData);
            setFormData({ name: '', email: '', phone: '', address: '' });
            setErrors({});
        }
    };

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Customer' : 'Add New Customer'}
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={handleChange('name')}
                        error={errors.name}
                        placeholder="Enter customer name"
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleChange('email')}
                        error={errors.email}
                        placeholder="Enter email address"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange('phone')}
                        error={errors.phone}
                        placeholder="Enter phone number"
                        required
                    />

                    <Input
                        label="Address"
                        value={formData.address}
                        onChange={handleChange('address')}
                        error={errors.address}
                        placeholder="Enter full address"
                        required
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button type="submit">
                        {initialData ? 'Update Customer' : 'Add Customer'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};