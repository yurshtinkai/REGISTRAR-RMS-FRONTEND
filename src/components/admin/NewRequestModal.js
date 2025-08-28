import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { createDummySchoolYears, getDocumentTypes } from '../../data/dummyData';

function NewRequestModal({ isOpen, onClose, onConfirm }) {
    const schoolYearsData = createDummySchoolYears();
    const documentTypes = getDocumentTypes();

    const [requestType, setRequestType] = useState(documentTypes[0].name);
    const [schoolYear, setSchoolYear] = useState(schoolYearsData[0].schoolYear);
    const [semester, setSemester] = useState(schoolYearsData[0].semester);
    const [amount, setAmount] = useState(documentTypes[0].amount);

    useEffect(() => {
        const selectedType = documentTypes.find(doc => doc.name === requestType);
        if (selectedType) {
            setAmount(selectedType.amount);
        }
    }, [requestType, documentTypes]);

    const handleSubmit = () => {
        onConfirm({
            documentType: requestType,
            schoolYear,
            semester,
            amount,
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
                            <Form.Select value={requestType} onChange={e => setRequestType(e.target.value)}>
                                {documentTypes.map(doc => (
                                    <option key={doc.name} value={doc.name}>{doc.name}</option>
                                ))}
                            </Form.Select>
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
                            <Form.Control type="text" value={`₱ ${amount.toFixed(2)}`} readOnly />
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