import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const RouteModal = ({
                               isOpen,
                               onClose,
                               onSubmit,
                               initialData,
                           }) => {
    const [formData, setFormData] = useState({
        name: '',
        startLocation: '',
        endLocation: '',
        distance: '',
        estimatedTime: '',
        status: 'planning',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                startLocation: initialData.startLocation,
                endLocation: initialData.endLocation,
                distance: initialData.distance.toString(),
                estimatedTime: initialData.estimatedTime.toString(),
                status: initialData.status,
            });
        } else {
            setFormData({
                name: '',
                startLocation: '',
                endLocation: '',
                distance: '',
                estimatedTime: '',
                status: 'planning',
            });
        }
        setErrors({});
    }, [initialData, isOpen]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Route name is required';
        if (!formData.startLocation.trim()) newErrors.startLocation = 'Start location is required';
        if (!formData.endLocation.trim()) newErrors.endLocation = 'End location is required';
        if (!formData.distance.trim()) {
            newErrors.distance = 'Distance is required';
        } else if (isNaN(Number(formData.distance)) || Number(formData.distance) <= 0) {
            newErrors.distance = 'Please enter a valid distance';
        }
        if (!formData.estimatedTime.trim()) {
            newErrors.estimatedTime = 'Estimated time is required';
        } else if (isNaN(Number(formData.estimatedTime)) || Number(formData.estimatedTime) <= 0) {
            newErrors.estimatedTime = 'Please enter a valid time in minutes';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit({
                name: formData.name,
                startLocation: formData.startLocation,
                endLocation: formData.endLocation,
                distance: Number(formData.distance),
                estimatedTime: Number(formData.estimatedTime),
                status: formData.status,
            });
            setFormData({
                name: '',
                startLocation: '',
                endLocation: '',
                distance: '',
                estimatedTime: '',
                status: 'planning',
            });
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
            title={initialData ? 'Edit Route' : 'Create New Route'}
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Route Name"
                    value={formData.name}
                    onChange={handleChange('name')}
                    error={errors.name}
                    placeholder="Enter route name"
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Start Location"
                        value={formData.startLocation}
                        onChange={handleChange('startLocation')}
                        error={errors.startLocation}
                        placeholder="Enter start location"
                        required
                    />

                    <Input
                        label="End Location"
                        value={formData.endLocation}
                        onChange={handleChange('endLocation')}
                        error={errors.endLocation}
                        placeholder="Enter end location"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                        label="Distance (km)"
                        type="number"
                        step="0.1"
                        min="0"
                        value={formData.distance}
                        onChange={handleChange('distance')}
                        error={errors.distance}
                        placeholder="0.0"
                        required
                    />

                    <Input
                        label="Estimated Time (min)"
                        type="number"
                        min="1"
                        value={formData.estimatedTime}
                        onChange={handleChange('estimatedTime')}
                        error={errors.estimatedTime}
                        placeholder="60"
                        required
                    />

                    <div className="w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={handleChange('status')}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="planning">Planning</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
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
                        {initialData ? 'Update Route' : 'Create Route'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};