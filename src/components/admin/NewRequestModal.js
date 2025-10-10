import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { createDummySchoolYears, getDocumentTypes } from '../../data/dummyData';

function NewRequestModal({ isOpen, onClose, onConfirm, expectedDocumentType }) {
    const schoolYearsData = createDummySchoolYears();
    const documentTypes = getDocumentTypes();

    const [requestType, setRequestType] = useState(documentTypes[0].name);
    const [schoolYear, setSchoolYear] = useState(schoolYearsData[0].schoolYear);
    const [semester, setSemester] = useState(schoolYearsData[0].semester);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        console.log('🔍 NewRequestModal - useEffect triggered');
        console.log('🔍 expectedDocumentType:', expectedDocumentType);
        console.log('🔍 requestType:', requestType);
        
        // If a specific type is expected (coming from student's original request), lock to that
        if (expectedDocumentType) {
            console.log('🔍 Setting requestType to expectedDocumentType:', expectedDocumentType);
            setRequestType(expectedDocumentType);
            const selectedType = documentTypes.find(doc => doc.name === expectedDocumentType);
            if (selectedType) {
                console.log('🔍 Setting amount to:', selectedType.amount);
                setAmount(selectedType.amount.toString());
            }
        }
        // Don't auto-set amount when request type changes - let registrar input manually
    }, [expectedDocumentType]);

    const handleSubmit = () => {
        console.log('🔍 NewRequestModal - handleSubmit called');
        console.log('🔍 expectedDocumentType:', expectedDocumentType);
        console.log('🔍 requestType:', requestType);
        console.log('🔍 Are they equal?', requestType === expectedDocumentType);
        
        // Validate amount
        const amountValue = parseFloat(amount);
        if (!amount || isNaN(amountValue) || amountValue < 0) {
            alert('Please enter a valid amount (must be a positive number).');
            return;
        }
        
        if (expectedDocumentType && requestType !== expectedDocumentType) {
            console.log('❌ Validation failed - types don\'t match');
            alert(`Your request is incorrect because student requested ${expectedDocumentType} not ${requestType}.`);
            return;
        }
        
        console.log('✅ Validation passed - proceeding with request');
        onConfirm({
            documentType: requestType,
            schoolYear,
            semester,
            amount: amountValue,
        });
        onClose(); // Close modal after confirmation
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="fas fa-file-alt me-2"></i> New Document Request
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group as={Row} className="mb-3" controlId="formRequestType">
                        <Form.Label column sm={4}>Request Type</Form.Label>
                        <Col sm={8}>
                            <Form.Select value={requestType} onChange={e => setRequestType(e.target.value)} disabled={!!expectedDocumentType}>
                                {documentTypes.map(doc => (
                                    <option key={doc.name} value={doc.name}>{doc.name}</option>
                                ))}
                            </Form.Select>
                            {expectedDocumentType && (
                                <small className="text-muted">Request type locked to match the student's original request.</small>
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" controlId="formSchoolYear">
                        <Form.Label column sm={4}>School Year</Form.Label>
                        <Col sm={8}>
                            <Form.Select value={schoolYear} onChange={e => setSchoolYear(e.target.value)}>
                                {schoolYearsData.map(sy => (
                                    <option key={sy.id} value={sy.schoolYear}>{sy.schoolYear}</option>
                                ))}
                            </Form.Select>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3" controlId="formSemester">
                        <Form.Label column sm={4}>Semester</Form.Label>
                        <Col sm={8}>
                             <Form.Select value={semester} onChange={e => setSemester(e.target.value)}>
                                <option>1st Semester</option>
                                <option>2nd Semester</option>
                                <option>Summer</option>
                            </Form.Select>
                        </Col>
                    </Form.Group>
                     <Form.Group as={Row} className="mb-3" controlId="formAmount">
                        <Form.Label column sm={4}>Amount</Form.Label>
                        <Col sm={8}>
                            <Form.Control 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                placeholder="Enter amount (e.g., 150.00)"
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                            <Form.Text className="text-muted">
                                Enter the exact amount for this document request
                            </Form.Text>
                        </Col>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Confirm Request
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default NewRequestModal;