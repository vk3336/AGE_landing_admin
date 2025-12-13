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

  Snackbar,
  Alert,
  Typography,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Edit, Delete, ArrowBack, Save, Add, Home } from '@mui/icons-material';
import RichTextEditor from '../../components/RichTextEditor';
import { apiFetch } from '../../utils/apiFetch';

interface FAQA {
  _id: string;
  question: string;
  answer: string;
}

export default function FAQAPage() {
  const [faqas, setFaqas] = useState<FAQA[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [loading, setLoading] = useState(false);


  const fetchFAQAs = useCallback(async () => {
    try {
      const response = await apiFetch('/faqa', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_SECRET_KEY || 'rajeshsir'
        }
      });
      const data = await response.json();
      if (data.success) {
        setFaqas(data.data);
      }
    } catch (error) {
      console.error('Error fetching FAQAs:', error);
    }
  }, []);

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
    setView('form');
  };

  const handleOpenForm = (faqa?: FAQA) => {
    if (faqa) {
      setEditId(faqa._id);
      setForm({ question: faqa.question, answer: faqa.answer });
    } else {
      setEditId(null);
      setForm({ question: '', answer: '' });
    }
    setView('form');
  };

  const handleBackToList = () => {
    setView('list');
    setEditId(null);
    setForm({ question: '', answer: '' });
  };

  const handleSubmit = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in both question and answer',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      const url = editId ? `/faqa/${editId}` : '/faqa';
      const method = editId ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_SECRET_KEY || 'rajeshsir'
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message: editId ? 'FAQ updated successfully' : 'FAQ created successfully',
          severity: 'success',
        });
        fetchFAQAs();
        handleBackToList();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Something went wrong',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const response = await apiFetch(`/faqa/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_SECRET_KEY || 'rajeshsir'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({
          open: true,
          message: 'FAQ deleted successfully',
          severity: 'success',
        });
        fetchFAQAs();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to delete FAQ',
        severity: 'error',
      });
    }
  };

  // Render Form View
  if (view === 'form') {
    return (
      <Box sx={{ p: 3 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/dashboard" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none' }}>
            <Home sx={{ mr: 0.5 }} fontSize="small" />
            Dashboard
          </Link>
          <Link onClick={handleBackToList} sx={{ cursor: 'pointer', color: 'text.secondary', textDecoration: 'none' }}>
            FAQ Management
          </Link>
          <Typography color="text.primary">
            {editId ? 'Edit FAQ' : 'Add FAQ'}
          </Typography>
        </Breadcrumbs>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {editId ? 'Edit FAQ' : 'Add New FAQ'}
              </Typography>
              <Button
                startIcon={<ArrowBack />}
                onClick={handleBackToList}
                variant="outlined"
              >
                Back to List
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <RichTextEditor
                label="Question"
                value={form.question}
                onChange={(content) => setForm({ ...form, question: content })}
                height={200}
                placeholder="Enter question..."
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <RichTextEditor
                label="Answer"
                value={form.answer}
                onChange={(content) => setForm({ ...form, answer: content })}
                height={300}
                placeholder="Enter answer..."
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : (editId ? 'Update FAQ' : 'Create FAQ')}
              </Button>
              <Button
                variant="outlined"
                onClick={handleBackToList}
                disabled={loading}
              >
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Render List View
  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/dashboard" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none' }}>
          <Home sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Typography color="text.primary">
          FAQ Management
        </Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">FAQ Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => handleOpenForm()}
        >
          Add FAQ
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
                  <IconButton onClick={() => handleOpenForm(faqa)} color="primary">
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