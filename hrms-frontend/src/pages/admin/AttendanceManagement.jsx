import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  InputGroup,
  InputLeftElement,
  Input,
  Button,
  Flex,
  Box,
  Select,
  IconButton,
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { BiLeftArrow, BiRightArrow } from 'react-icons/bi';

const AttendanceManagement = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [employeeIdFilter, setEmployeeIdFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 20,
      };
      if (startDate) params.startDate = moment(startDate).format('YYYY-MM-DD');
      if (endDate) params.endDate = moment(endDate).format('YYYY-MM-DD');
      if (employeeIdFilter) params.employeeId = employeeIdFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await axios.get('/api/attendance/all', { params });
      setAttendanceRecords(response.data.records || []);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      setError(err.response?.data?.message || 'Failed to fetch attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    setPage(1);
    fetchAttendanceRecords();
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <h2 style={{ fontSize: '1.5em', marginBottom: '1em' }}>Attendance Management</h2>

      <Flex mb={4} wrap="wrap" gap={3} alignItems="center">
        <InputGroup maxWidth="200px">
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Employee ID"
            value={employeeIdFilter}
            onChange={(e) => setEmployeeIdFilter(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </InputGroup>

        <Select
          placeholder="Select Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          maxWidth="200px"
        >
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
          <option value="Half Day">Half Day</option>
          <option value="Leave">Leave</option>
          <option value="Holiday">Holiday</option>
        </Select>

        <Box>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
            className="chakra-input"
          />
        </Box>
        <Box>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="End Date"
            className="chakra-input"
          />
        </Box>
        <Button onClick={handleSearch} colorScheme="blue">
          Search
        </Button>
      </Flex>

      {loading && <Spinner size="xl" />}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Removed the 'No attendance records found' alert as requested */}
      {/*
      {!loading && attendanceRecords.length === 0 && !error && (
        <Alert status="info" mb={4}>
          <AlertIcon />
          No attendance records found.
        </Alert>
      )}
      */}

      {attendanceRecords.length > 0 && (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Employee Name</Th>
                <Th>Date</Th>
                <Th>Clock In</Th>
                <Th>Clock Out</Th>
                <Th>Status</Th>
                <Th>Working Hours</Th>
                <Th>Geofence Check</Th>
              </Tr>
            </Thead>
            <Tbody>
              {attendanceRecords.map((record) => (
                <Tr key={record.AttendanceID || record.id}>
                  <Td>{record.Employee ? `${record.Employee.firstName} ${record.Employee.lastName}` : 'N/A'}</Td>
                  <Td>{moment(record.date).format('YYYY-MM-DD')}</Td>
                  <Td>{record.clockIn ? moment(record.clockIn).format('HH:mm:ss') : 'N/A'}</Td>
                  <Td>{record.clockOut ? moment(record.clockOut).format('HH:mm:ss') : 'N/A'}</Td>
                  <Td>{record.status}</Td>
                  <Td>{record.workHours || 'N/A'}</Td>
                  <Td>{record.isInGeoFence ? 'Inside' : 'Outside'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {/* Conditionally render pagination controls only if there are records */}
      {attendanceRecords.length > 0 && (
        <Flex mt={4} justifyContent="center" alignItems="center">
          <IconButton
            icon={<BiLeftArrow />}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            isDisabled={page === 1}
            mr={2}
          />
          <Button isDisabled>{page} / {totalPages}</Button>
          <IconButton
            icon={<BiRightArrow />}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            isDisabled={page === totalPages}
            ml={2}
          />
        </Flex>
      )}
    </Box>
  );
};

export default AttendanceManagement; 