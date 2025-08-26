import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Flex,
  Box,
  Select,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { BiCheckCircle, BiXCircle } from 'react-icons/bi';

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Pending'); // Default to pending
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  const fetchLeaveRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 10,
      };
      if (statusFilter) params.status = statusFilter;

      const response = await axios.get('/api/leaves', { params });
      setLeaveRequests(response.data.records || []);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setError(err.response?.data?.message || 'Failed to fetch leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setPage(1); // Reset to first page on status change
  };

  const handleAction = (leave, action) => {
    setSelectedLeave({ ...leave, action });
    onOpen();
  };

  const processLeaveRequest = async () => {
    if (!selectedLeave) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`/api/leaves/${selectedLeave.ApplicationID}`, {
        status: selectedLeave.action === 'approve' ? 'Approved' : 'Rejected',
        approvalRemarks,
      });

      if (response.data.success) {
        // Refresh the list after successful action
        fetchLeaveRequests();
        onClose();
        setApprovalRemarks('');
      } else {
        setError(response.data.message || 'Failed to process leave request.');
      }
    } catch (err) {
      console.error('Error processing leave request:', err);
      setError(err.response?.data?.message || 'Failed to process leave request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <h2 style={{ fontSize: '1.5em', marginBottom: '1em' }}>Leave Management</h2>

      <Flex mb={4} wrap="wrap" gap={3} alignItems="center">
        <Select
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          maxWidth="200px"
        >
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </Select>
      </Flex>

      {loading && <Spinner size="xl" />}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Removed the 'No leave requests found' alert as requested */}
      {/*
      {!loading && leaveRequests.length === 0 && !error && (
        <Alert status="info" mb={4}>
          <AlertIcon />
          No leave requests found for the selected status.
        </Alert>
      )}
      */}

      {leaveRequests.length > 0 && (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Employee Name</Th>
                <Th>Leave Type</Th>
                <Th>Dates</Th>
                <Th>Total Days</Th>
                <Th>Reason</Th>
                <Th>Status</Th>
                <Th>Applied Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {leaveRequests.map((request) => (
                <Tr key={request.ApplicationID}>
                  <Td>{request.Employee ? `${request.Employee.firstName} ${request.Employee.lastName}` : 'N/A'}</Td>
                  <Td>{request.LeaveType ? request.LeaveType.LeaveTypeName : 'N/A'}</Td>
                  <Td>{moment(request.FromDate).format('YYYY-MM-DD')} - {moment(request.ToDate).format('YYYY-MM-DD')}</Td>
                  <Td>{request.TotalDays}</Td>
                  <Td>{request.Reason}</Td>
                  <Td>{request.Status}</Td>
                  <Td>{moment(request.ApplicationDate).format('YYYY-MM-DD')}</Td>
                  <Td>
                    {request.Status === 'Pending' && (
                      <Flex>
                        <Button
                          size="sm"
                          colorScheme="green"
                          leftIcon={<BiCheckCircle />}
                          onClick={() => handleAction(request, 'approve')}
                          mr={2}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="red"
                          leftIcon={<BiXCircle />}
                          onClick={() => handleAction(request, 'reject')}
                        >
                          Reject
                        </Button>
                      </Flex>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* Conditionally render pagination controls only if there are records */}
      {leaveRequests.length > 0 && (
        <Flex mt={4} justifyContent="center" alignItems="center">
          <Button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            isDisabled={page === 1}
            mr={2}
          >
            Previous
          </Button>
          <Button isDisabled>{page} / {totalPages}</Button>
          <Button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            isDisabled={page === totalPages}
            ml={2}
          >
            Next
          </Button>
        </Flex>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedLeave?.action === 'approve' ? 'Approve' : 'Reject'} Leave Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedLeave && (
              <Box>
                <p><strong>Employee:</strong> {selectedLeave.Employee?.firstName} {selectedLeave.Employee?.lastName}</p>
                <p><strong>Leave Type:</strong> {selectedLeave.LeaveType?.LeaveTypeName}</p>
                <p><strong>Dates:</strong> {moment(selectedLeave.FromDate).format('YYYY-MM-DD')} - {moment(selectedLeave.ToDate).format('YYYY-MM-DD')}</p>
                <p><strong>Reason:</strong> {selectedLeave.Reason}</p>
                <FormControl mt={4}>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <Textarea
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    placeholder="Add remarks for approval or rejection"
                  />
                </FormControl>
              </Box>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button
              colorScheme={selectedLeave?.action === 'approve' ? 'green' : 'red'}
              onClick={processLeaveRequest}
              isLoading={loading}
            >
              Confirm {selectedLeave?.action === 'approve' ? 'Approval' : 'Rejection'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LeaveManagement; 