import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    TextInput, 
    Alert,
    Modal,
    ActivityIndicator
} from 'react-native';
import { 
    MessageSquare, 
    FileText, 
    PenTool, 
    CheckCircle, 
    ArrowLeft,
    Phone,
    MapPin
} from 'lucide-react-native';
import { createDriverCase, completeOrder } from '../services/api';

export default function DeliveryDetailsScreen({ route, navigation, driver }) {
    const { delivery } = route.params;
    const driverInfo = driver || route.params?.driver;
    
    const [comment, setComment] = useState('');
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [signature, setSignature] = useState('');
    const resolvedStatus = delivery?.status ? delivery.status.toString().toLowerCase() : '';
    const [isCompleted, setIsCompleted] = useState(resolvedStatus === 'delivered' || resolvedStatus === 'completed');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [showCaseModal, setShowCaseModal] = useState(false);
    const [caseTitle, setCaseTitle] = useState('');
    const [caseDescription, setCaseDescription] = useState('');
    const [creatingCase, setCreatingCase] = useState(false);

    const handleMakeCase = () => {
        setCaseTitle('');
        setCaseDescription('');
        setShowCaseModal(true);
    };

    const handleSubmitCase = async () => {
        if (!caseTitle.trim()) {
            Alert.alert('Missing Info', 'Please enter a case title');
            return;
        }
        if (!driverInfo?.id) {
            Alert.alert('Missing Driver', 'We could not determine your driver account. Please log in again.');
            return;
        }
        if (!delivery?.orderId) {
            Alert.alert('Missing Order', 'This delivery is missing an order id.');
            return;
        }
        setCreatingCase(true);
        try {
            await createDriverCase(driverInfo.id, delivery.orderId, {
                title: caseTitle.trim(),
                description: caseDescription.trim()
            });
            Alert.alert('Case submitted', 'Dispatch has received your case.');
            setShowCaseModal(false);
            setCaseTitle('');
            setCaseDescription('');
        } catch (err) {
            console.warn('Failed to create case', err);
            Alert.alert('Error', err.message || 'Unable to submit case right now.');
        } finally {
            setCreatingCase(false);
        }
    };

    const handleAddComment = () => {
        if (comment.trim()) {
            Alert.alert('Success', 'Comment added successfully');
            setComment('');
        } else {
            Alert.alert('Error', 'Please enter a comment');
        }
    };

    const handleGetSignature = () => {
        setShowSignatureModal(true);
    };

    const handleSaveSignature = () => {
        if (signature.trim()) {
            setShowSignatureModal(false);
            Alert.alert('Success', 'Signature captured successfully');
            setSignature('');
        } else {
            Alert.alert('Error', 'Please provide a signature');
        }
    };

    const handleCompleteDelivery = () => {
        if (!delivery?.orderId) {
            Alert.alert('Missing Order', 'Unable to update this delivery because the order ID is missing.');
            return;
        }

        Alert.alert(
            'Complete Delivery',
            'Are you sure you want to mark this delivery as completed?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Complete', 
                    onPress: async () => {
                        setUpdatingStatus(true);
                        try {
                            await completeOrder(delivery.orderId);
                            setIsCompleted(true);
                            Alert.alert('Success', 'Delivery marked as completed');
                        } catch (err) {
                            console.warn('Failed to mark delivery complete', err);
                            Alert.alert('Error', err.message || 'Unable to update the order status right now.');
                        } finally {
                            setUpdatingStatus(false);
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return '#10B981';
            case 'in-progress':
                return '#F59E0B';
            default:
                return '#6B7280';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return '#EF4444';
            case 'medium':
                return '#F59E0B';
            default:
                return '#6B7280';
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{delivery.service || `Order ${delivery.orderId}`}</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Delivery Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Delivery Information</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
                            <Text style={styles.statusText}>
                                {delivery.status ? delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1) : 'Pending'}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Recipient:</Text>
                        <Text style={styles.infoValue}>{delivery.customerName || 'Customer'}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <MapPin size={16} color="#6B7280" />
                        <Text style={styles.infoValue}>Dropoff: {delivery.dropoffAddress || delivery.customerAddress || 'N/A'}</Text>
                    </View>
                    {delivery.pickupAddress && (
                        <View style={styles.infoRow}>
                            <MapPin size={16} color="#6B7280" />
                            <Text style={styles.infoValue}>Pickup: {delivery.pickupAddress}</Text>
                        </View>
                    )}
                    
                    {delivery.customerPhone && (
                        <View style={styles.infoRow}>
                            <Phone size={16} color="#6B7280" />
                            <Text style={styles.infoValue}>{delivery.customerPhone}</Text>
                        </View>
                    )}
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Service:</Text>
                        <Text style={styles.infoValue}>{delivery.service || 'Delivery'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Priority:</Text>
                        <Text style={[styles.infoValue, { color: getPriorityColor(delivery.priority) }]}>
                            {delivery.priority ? delivery.priority.charAt(0).toUpperCase() + delivery.priority.slice(1) : 'Normal'}
                        </Text>
                    </View>
                    
                    {delivery.notes && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Notes:</Text>
                            <Text style={styles.infoValue}>{delivery.notes}</Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsCard}>
                    <Text style={styles.cardTitle}>Actions</Text>
                    
                    {/* Make Case */}
                    <TouchableOpacity style={styles.actionButton} onPress={handleMakeCase}>
                        <FileText size={20} color="#EF4444" />
                        <Text style={styles.actionButtonText}>Create Case</Text>
                    </TouchableOpacity>
                    
                    {/* Get Signature */}
                    <TouchableOpacity style={styles.actionButton} onPress={handleGetSignature}>
                        <PenTool size={20} color="#10B981" />
                        <Text style={styles.actionButtonText}>Customer Signature</Text>
                    </TouchableOpacity>
                </View>

                {/* Add Comment Section */}
                <View style={styles.commentCard}>
                    <Text style={styles.cardTitle}>Add Comment</Text>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Enter your comment..."
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        numberOfLines={4}
                    />
                    <TouchableOpacity style={styles.commentButton} onPress={handleAddComment}>
                        <MessageSquare size={16} color="#FFFFFF" />
                        <Text style={styles.commentButtonText}>Add Comment</Text>
                    </TouchableOpacity>
                </View>

                {/* Complete Delivery Button */}
                {!isCompleted && (
                    <TouchableOpacity 
                        style={[
                            styles.completeButton,
                            (updatingStatus) && styles.completeButtonDisabled
                        ]}
                        onPress={handleCompleteDelivery}
                        disabled={updatingStatus}
                    >
                        {updatingStatus ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <CheckCircle size={20} color="#FFFFFF" />
                                <Text style={styles.completeButtonText}>Complete Delivery</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {isCompleted && (
                    <View style={styles.completedBadge}>
                        <CheckCircle size={20} color="#10B981" />
                        <Text style={styles.completedText}>Delivery Completed</Text>
                    </View>
                )}
            </ScrollView>

            {/* Case Modal */}
            <Modal
                visible={showCaseModal}
                animationType="fade"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create Case</Text>
                        <Text style={styles.modalSubtitle}>
                            Share why this delivery needs attention
                        </Text>

                        <TextInput
                            style={styles.caseInput}
                            placeholder="Case title"
                            value={caseTitle}
                            onChangeText={setCaseTitle}
                        />
                        <TextInput
                            style={[styles.caseInput, styles.caseDescriptionInput]}
                            placeholder="Describe the issue"
                            value={caseDescription}
                            onChangeText={setCaseDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowCaseModal(false)}
                                disabled={creatingCase}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.saveButton,
                                    creatingCase && styles.disabledButton
                                ]}
                                onPress={handleSubmitCase}
                                disabled={creatingCase}
                            >
                                {creatingCase ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Submit Case</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Signature Modal */}
            <Modal
                visible={showSignatureModal}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Customer Signature</Text>
                        <Text style={styles.modalSubtitle}>
                            In a real app, this would show a signature pad
                        </Text>
                        
                        <TextInput
                            style={styles.signatureInput}
                            placeholder="Enter signature (mock)"
                            value={signature}
                            onChangeText={setSignature}
                        />
                        
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]} 
                                onPress={() => setShowSignatureModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.saveButton]} 
                                onPress={handleSaveSignature}
                            >
                                <Text style={styles.saveButtonText}>Save Signature</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
    },
    content: {
        padding: 20,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        minWidth: 80,
    },
    infoValue: {
        fontSize: 14,
        color: '#1F2937',
        flex: 1,
    },
    actionsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 12,
        gap: 12,
    },
    actionButtonText: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    commentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        marginBottom: 12,
        textAlignVertical: 'top',
        fontSize: 14,
        color: '#1F2937',
    },
    caseInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        backgroundColor: '#F9FAFB',
        fontSize: 14,
        color: '#111827',
    },
    caseDescriptionInput: {
        minHeight: 120,
    },
    commentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    commentButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    completeButtonDisabled: {
        opacity: 0.7
    },
    completeButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0FDF4',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#10B981',
        gap: 8,
    },
    completedText: {
        color: '#10B981',
        fontSize: 18,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        margin: 20,
        width: '90%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    signatureInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: '#10B981',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    disabledButton: {
        opacity: 0.7,
    },
});
