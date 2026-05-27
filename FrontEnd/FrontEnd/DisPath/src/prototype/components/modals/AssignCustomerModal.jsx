import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Search, User } from 'lucide-react';
import { Input } from '../ui/Input';

export const AssignCustomersModal = ({
                                         isOpen,
                                         onClose,
                                         onAssign,
                                         customers,
                                         assignedCustomerIds,
                                         routeName,
                                     }) => {
    const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelectedCustomerIds([...assignedCustomerIds]);
            setSearchQuery('');
        }
    }, [isOpen, assignedCustomerIds]);

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleCustomer = (customerId) => {
        setSelectedCustomerIds(prev =>
            prev.includes(customerId)
                ? prev.filter(id => id !== customerId)
                : [...prev, customerId]
        );
    };

    const handleSubmit = () => {
        onAssign(selectedCustomerIds);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Assign Customers to "${routeName}"`}
            maxWidth="lg"
        >
            <div className="space-y-6">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Customer List */}
                <div className="max-h-96 overflow-y-auto space-y-3">
                    {filteredCustomers.map((customer) => (
                        <div
                            key={customer.id}
                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <input
                                type="checkbox"
                                id={`customer-${customer.id}`}
                                checked={selectedCustomerIds.includes(customer.id)}
                                onChange={() => handleToggleCustomer(customer.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <label
                                        htmlFor={`customer-${customer.id}`}
                                        className="font-medium text-gray-900 cursor-pointer"
                                    >
                                        {customer.name}
                                    </label>
                                    <p className="text-sm text-gray-600">{customer.email}</p>
                                    <p className="text-sm text-gray-500">{customer.address}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCustomers.length === 0 && (
                    <div className="text-center py-8">
                        <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria.</p>
                    </div>
                )}

                {/* Selection Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <span className="font-medium">{selectedCustomerIds.length} customers selected</span>
                        {selectedCustomerIds.length > 0 && (
                            <span> for assignment to this route</span>
                        )}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                    >
                        Assign {selectedCustomerIds.length} Customer{selectedCustomerIds.length !== 1 ? 's' : ''}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};