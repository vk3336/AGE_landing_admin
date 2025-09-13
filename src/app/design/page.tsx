"use client";
import React, { useEffect, useState } from "react";
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Pagination, Breadcrumbs, Link, CircularProgress
} from '@mui/material';
import BrushIcon from '@mui/icons-material/Brush';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import { apiFetch } from '../../utils/apiFetch';

interface Design {
  _id?: string;
  name: string;
}

const DesignRow = React.memo(({ design, onEdit, onDelete, viewOnly }: {
  design: Design;
  onEdit: (design: Design) => void;
  onDelete: (id: string) => void;
  viewOnly: boolean;
}) => (
  <TableRow hover sx={{ transition: 'background 0.2s', '&:hover': { background: 'rgba(41,72,255,0.08)' } }}>
    <TableCell sx={{ fontSize: 16 }}>{design.name}</TableCell>
    <TableCell>
      <IconButton color="primary" onClick={() => onEdit(design)} disabled={viewOnly}><EditIcon /></IconButton>
      <IconButton color="error" onClick={() => onDelete(design._id || "")} disabled={viewOnly}><DeleteIcon /></IconButton>
    </TableCell>
  </TableRow>
));

DesignRow.displayName = 'DesignRow';

const DesignForm = React.memo(({ 
  open, 
  onClose, 
  form, 
  setForm, 
  onSubmit, 
  submitting, 
  editId, 
  viewOnly
}: {
  open: boolean;
  onClose: () => void;
  form: Design;
  setForm: (form: Design) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editId: string | null;
  viewOnly: boolean;
}) => {
  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }, [form, setForm]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 24, background: 'linear-gradient(90deg,#396afc,#2948ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{editId ? "Edit Design" : "Add Design"}</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, pt: 3 }}>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} required fullWidth sx={{ fontSize: 18 }} disabled={submitting || viewOnly} InputProps={{ readOnly: viewOnly }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{ fontWeight: 700, borderRadius: 3, fontSize: 16 }} disabled={submitting || viewOnly}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ fontWeight: 700, borderRadius: 3, fontSize: 16 }} disabled={submitting || viewOnly}>{editId ? "Update" : "Add"}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

DesignForm.displayName = 'DesignForm';


function getDesignPagePermission() {
  if (typeof window === 'undefined') return 'no access';
  const email = localStorage.getItem('admin-email');
  const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN;
  if (email && superAdmin && email === superAdmin) return 'all access';
  const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
  if (perms && perms.filter) {
    return perms.filter;
  }
  return 'no access';
}

export default function DesignPage() {
  // All hooks at the top
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [designs, setDesigns] = useState<Design[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Design>({ name: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDesigns = React.useCallback(async (searchTerm = '') => {
    try {
      setIsLoading(true);
      const url = searchTerm 
        ? `/design/search/${encodeURIComponent(searchTerm)}`
        : '/design';
      
      const res = await apiFetch(url);
      const data = await res.json();
      setDesigns(data.data || []);
    } catch (error) {
      console.error('Error fetching designs:', error);
      setDesigns([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDesigns(search);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [search, fetchDesigns]);

  // Initial data fetch and permission check
  useEffect(() => {
    const checkPermissions = async () => {
      const permission = getDesignPagePermission();
      setPageAccess(permission);
      
      if (permission !== 'no access') {
        await fetchDesigns();
      }
    };
    
    checkPermissions();
  }, [fetchDesigns]);

  const handleOpen = React.useCallback((design: Design | null = null) => {
    setEditId(design?._id || null);
    setForm(design ? { ...design } : { name: "" });
    setOpen(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    setEditId(null);
    setForm({ name: "" });
  }, []);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = `/design${editId ? "/" + editId : ""}`;
      
      const response = await apiFetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        fetchDesigns();
        handleClose();
      }
    } finally {
      setSubmitting(false);
    }
  }, [form, editId, fetchDesigns, handleClose]);

  const handleDelete = React.useCallback(async () => {
    if (!deleteId) return;
    setDeleteError(null);
    try {
      const res = await apiFetch(`/design/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.message && data.message.includes("in use")) {
          setDeleteError("Cannot delete: Design is in use by one or more products.");
        } else {
          setDeleteError(data.message || "Failed to delete design.");
        }
        return;
      }
      setDeleteId(null);
      fetchDesigns();
    } catch {}
  }, [deleteId, fetchDesigns]);

  const handleEdit = React.useCallback((design: Design) => {
    handleOpen(design);
  }, [handleOpen]);

  const handleDeleteClick = React.useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  // Pagination
  const paginatedDesigns = designs.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Show loading state initially
  if (isLoading && designs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Permission check rendering
  if (pageAccess === 'no access') {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: '#e74c3c', mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
          You don&apos;t have permission to access this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {pageAccess === 'only view' && (
        <Box sx={{ mb: 2 }}>
          <Paper elevation={2} sx={{ p: 2, bgcolor: '#fffbe6', border: '1px solid #ffe58f' }}>
            <Typography color="#ad6800" fontWeight={600}>
              You have view-only access. To make changes, contact your admin.
            </Typography>
          </Paper>
        </Box>
      )}
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<HomeIcon fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link href="/dashboard" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <BrushIcon sx={{ mr: 0.5 }} fontSize="small" />
          Designs
        </Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            bgcolor: 'info.main', 
            color: 'white', 
            width: 48, 
            height: 48 
          }}>
            <BrushIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              mb: 0.5
            }}>
              Design Management
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary'
            }}>
              Manage your product designs
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<BrushIcon />}
          onClick={() => handleOpen()}
          disabled={pageAccess === 'only view'}
          sx={{
            fontWeight: 500,
            borderRadius: '6px',
            px: 3,
            py: 1.2,
            fontSize: 14,
            backgroundColor: 'info.main',
            boxShadow: '0 4px 24px 0 rgba(115, 103, 240, 0.24)',
            '&:hover': { 
              backgroundColor: 'info.dark',
              boxShadow: '0 4px 25px 0 rgba(115, 103, 240, 0.24)',
            },
          }}
        >
          Add Design
        </Button>
      </Box>

      {/* Search and Stats */}
      <Card sx={{
        background: 'background.paper',
        borderRadius: '6px',
        boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.24)',
        border: '1px solid',
        borderColor: 'divider',
        mb: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Designs ({designs.length})
            </Typography>
          </Box>
          <TextField
            placeholder="Search designs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <BrushIcon sx={{ color: 'text.secondary', mr: 1 }} />
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'success.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'success.main',
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Designs Table */}
      <Card sx={{
        background: 'background.paper',
        borderRadius: '6px',
        boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.24)',
        border: '1px solid',
        borderColor: 'divider',
      }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(115, 103, 240, 0.04)' }}>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}>
                    Design Name
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDesigns.map((design) => (
                  <DesignRow
                    key={design._id}
                    design={design}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    viewOnly={pageAccess === 'only view'}
                  />
                ))}
                {paginatedDesigns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      No designs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pagination */}
      {designs.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(designs.length / rowsPerPage)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '6px',
                fontWeight: 500,
              },
            }}
          />
        </Box>
      )}

      {/* Form Dialog */}
      <DesignForm
        open={open}
        onClose={handleClose}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        editId={editId}
        viewOnly={pageAccess === 'only view'}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => { setDeleteId(null); setDeleteError(null); }}
        PaperProps={{
          sx: {
            borderRadius: '6px',
            boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.24)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: 'text.primary' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete this design? This action cannot be undone.
          </Typography>
          {deleteError && (
            <Typography sx={{ color: 'error.main', mt: 2 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => { setDeleteId(null); setDeleteError(null); }}
            sx={{ 
              fontWeight: 500, 
              borderRadius: '6px',
              color: 'text.secondary',
            }}
            disabled={pageAccess === 'only view'}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            color="error"
            sx={{ 
              fontWeight: 500, 
              borderRadius: '6px',
            }}
            disabled={pageAccess === 'only view'}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 