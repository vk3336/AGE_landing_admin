'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Typography,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import RichTextEditor from '../../components/RichTextEditor';

interface FAQA {
  _id: string;
  question: string;
  answer: string;
}

export default function FAQAPage() {
  const [faqas, setFaqas] = useState<FAQA[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

  const fetchFAQAs = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/faqa`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      if (data.success) {
        setFaqas(data.data);
      }
    } catch (error) {
      console.error('Error fetching FAQAs:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchFAQAs();
  }, [fetchFAQAs]);

  const handleOpen = (faqa?: FAQA) => {
    if (faqa) {
      setEditId(faqa._id);
      setForm({ question: faqa.question, answer: faqa.answer });
    } else {
      setEditId(null);
      setForm({ question: '', answer: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setForm({ question: '', answer: '' });
  };

  const handleSubmit = async () => {
    try {
      const url = editId ? `${API_URL}/faqa/${editId}` : `${API_URL}/faqa`;
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message: editId ? 'FAQA updated successfully' : 'FAQA created successfully',
          severity: 'success',
        });
        fetchFAQAs();
        handleClose();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Something went wrong',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQA?')) return;

    try {
      const response = await fetch(`${API_URL}/faqa/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message: 'FAQA deleted successfully',
          severity: 'success',
        });
        fetchFAQAs();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to delete FAQA',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">FAQA Management</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add FAQA
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Answer</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faqas.map((faqa) => (
              <TableRow key={faqa._id}>
                <TableCell>
                  <div dangerouslySetInnerHTML={{ __html: faqa.question }} />
                </TableCell>
                <TableCell>
                  <div dangerouslySetInnerHTML={{ __html: faqa.answer }} />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(faqa)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(faqa._id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Edit FAQA' : 'Add FAQA'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 2 }}>
            <RichTextEditor
              label="Question"
              value={form.question}
              onChange={(content) => setForm({ ...form, question: content })}
              height={200}
              placeholder="Enter question..."
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <RichTextEditor
              label="Answer"
              value={form.answer}
              onChange={(content) => setForm({ ...form, answer: content })}
              height={300}
              placeholder="Enter answer..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
