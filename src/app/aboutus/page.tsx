"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Pagination, Breadcrumbs, Link, InputAdornment, Avatar
} from '@mui/material';
import { apiFetch } from '../../utils/apiFetch';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';


interface AboutUs {
  _id?: string;
  descriptionsmall: string;
  descriptionmedium: string;
  descriptionlarger: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper functions for permissions
function getCurrentAdminEmail() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin-email');
}

function getAboutUsPagePermission() {
  if (typeof window === 'undefined') return 'no access';
  const email = localStorage.getItem('admin-email');
  const superAdmin = process.env.NEXT_PUBLIC_Role_Management_Key_Value;
  if (email && superAdmin && email === superAdmin) return 'all access';
  const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
  if (perms && perms.filter) {
    return perms.filter;
  }
  return 'no access';
}

export default function AboutUsPage() {
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [aboutUsList, setAboutUsList] = useState<AboutUs[]>([]);
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AboutUs>({ 
    descriptionsmall: "",
    descriptionmedium: "",
    descriptionlarger: ""
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const handleClose = useCallback(() => {
    setOpen(false);
    setViewMode(false);
    setEditId(null);
    setForm({ 
      descriptionsmall: "",
      descriptionmedium: "",
      descriptionlarger: ""
    });
  }, []);

  const fetchAboutUs = useCallback(async () => {
    try {
      console.log('Fetching about us data...');
      const res = await apiFetch('/aboutus');
      console.log('Response status:', res.status);
      const response = await res.json();
      console.log('API Response:', response);
      
      // Handle the response according to backend structure
      if (response.status === 'success' && response.data) {
        // The backend now returns an array of aboutUs records
        const aboutUsData = Array.isArray(response.data.aboutUs) ? response.data.aboutUs : [];
        console.log('Processed about us data:', aboutUsData);
        setAboutUsList(aboutUsData);
      } else {
        console.log('No data in response, setting empty array');
        setAboutUsList([]);
      }
    } catch (error) {
      console.error("Failed to fetch about us:", error);
      setAboutUsList([]);
    }
  }, []);

  useEffect(() => {
    const checkPermission = async () => {
      const email = getCurrentAdminEmail();
      if (!email) {
        return;
      }
      try {
        await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/allowed-admins-permissions`);
      } catch (error) {
        console.error("Permission check failed:", error);
      }
    };
    checkPermission();
  }, [fetchAboutUs]);

  useEffect(() => {
    fetchAboutUs();
    setPageAccess(getAboutUsPagePermission());
  }, [fetchAboutUs]);

  useEffect(() => {
    // Check permission from localStorage
    const permission = getAboutUsPagePermission();
    setPageAccess(permission);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editId ? "PUT" : "POST";
      const url = `/aboutus${editId ? "/" + editId : ""}`;
      
      console.log('Submitting form:', { method, url, form });
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const response = await res.json();
      console.log('Submit response:', response);
      
      setOpen(false);
      setEditId(null);
      setForm({ 
        descriptionsmall: "",
        descriptionmedium: "",
        descriptionlarger: ""
      });
      fetchAboutUs();
    } catch (error) {
      console.error("Failed to save about us:", error);
    } finally {
      setSubmitting(false);
    }
  }, [form, editId, fetchAboutUs]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      console.log('Deleting about us with ID:', deleteId);
      const res = await apiFetch(`/aboutus/${deleteId}`, {
        method: "DELETE",
      });
      const response = await res.json();
      console.log('Delete response:', response);
      
      setDeleteId(null);
      fetchAboutUs();
    } catch (error) {
      console.error("Failed to delete about us:", error);
    }
  }, [deleteId, fetchAboutUs]);

  // Ensure we're working with an array and filter safely
  const filteredAboutUs = Array.isArray(aboutUsList) 
    ? aboutUsList.filter((about: AboutUs) => {
        if (!about) return false;
        const searchTerm = search.toLowerCase();
        return (
          String(about.descriptionsmall || '').toLowerCase().includes(searchTerm) ||
          String(about.descriptionmedium || '').toLowerCase().includes(searchTerm) ||
          String(about.descriptionlarger || '').toLowerCase().includes(searchTerm)
        );
      })
    : [];

  // Safe pagination
  const paginatedAboutUs = filteredAboutUs.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  ) || [];

  // Render actions for each row
  const renderActions = (about: AboutUs) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <IconButton 
        size="small" 
        color="info"
        onClick={() => {
          setForm(about);
          setViewMode(true);
          setOpen(true);
        }}
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>
      <IconButton 
        size="small" 
        onClick={() => {
          setForm(about);
          setEditId(about._id || null);
          setViewMode(false);
          setOpen(true);
        }}
        disabled={pageAccess === 'only view'}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton 
        size="small" 
        color="error"
        onClick={() => setDeleteId(about._id || null)}
        disabled={pageAccess === 'only view'}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  if (pageAccess === 'no access') {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1">
          You don&apos;t have permission to access this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/dashboard" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Typography color="text.primary">About Us</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <InfoIcon />
          </Avatar>
          <Typography variant="h5" component="h1">
            About Us Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          disabled={pageAccess === 'only view'}
        >
          Add New
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search about us..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Small Description</TableCell>
                <TableCell>Medium Description</TableCell>
                <TableCell>Large Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAboutUs.map((about) => (
                <TableRow key={about?._id || 'unknown'}>
                  <TableCell>
                    {about?.descriptionsmall && about.descriptionsmall.length > 30 
                      ? `${about.descriptionsmall.substring(0, 30)}...` 
                      : about?.descriptionsmall || ''}
                  </TableCell>
                  <TableCell>
                    {about?.descriptionmedium && about.descriptionmedium.length > 30 
                      ? `${about.descriptionmedium.substring(0, 30)}...` 
                      : about?.descriptionmedium || ''}
                  </TableCell>
                  <TableCell>
                    {about?.descriptionlarger && about.descriptionlarger.length > 30 
                      ? `${about.descriptionlarger.substring(0, 30)}...` 
                      : about?.descriptionlarger || ''}
                  </TableCell>
                  <TableCell>
                    {renderActions(about)}
                  </TableCell>
                </TableRow>
              ))}
              {paginatedAboutUs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                    No about us entries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {filteredAboutUs.length > rowsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={Math.ceil(filteredAboutUs.length / rowsPerPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {viewMode ? 'View About Us' : editId ? 'Edit About Us' : 'Add New About Us'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {viewMode ? (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Small Description
                  </Typography>
                  <div 
                    dangerouslySetInnerHTML={{ __html: form.descriptionsmall || '' }}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      padding: '16px',
                      minHeight: '60px',
                      backgroundColor: '#f9f9f9'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Medium Description
                  </Typography>
                  <div 
                    dangerouslySetInnerHTML={{ __html: form.descriptionmedium || '' }}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      padding: '16px',
                      minHeight: '100px',
                      backgroundColor: '#f9f9f9'
                    }}
                  />
                </div>
                <div>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Large Description
                  </Typography>
                  <div 
                    dangerouslySetInnerHTML={{ __html: form.descriptionlarger || '' }}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      padding: '16px',
                      minHeight: '150px',
                      backgroundColor: '#f9f9f9'
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <TextField
                  name="descriptionsmall"
                  label="Small Description"
                  value={form.descriptionsmall || ''}
                  onChange={(e) => setForm({...form, descriptionsmall: e.target.value})}
                  fullWidth
                  margin="normal"
                  required
                  disabled={pageAccess === 'only view'}
                  multiline
                  rows={2}
                />
                <TextField
                  name="descriptionmedium"
                  label="Medium Description"
                  value={form.descriptionmedium || ''}
                  onChange={(e) => setForm({...form, descriptionmedium: e.target.value})}
                  fullWidth
                  margin="normal"
                  required
                  disabled={pageAccess === 'only view'}
                  multiline
                  rows={3}
                />
                <TextField
                  name="descriptionlarger"
                  label="Large Description"
                  value={form.descriptionlarger || ''}
                  onChange={(e) => setForm({...form, descriptionlarger: e.target.value})}
                  fullWidth
                  margin="normal"
                  required
                  disabled={pageAccess === 'only view'}
                  multiline
                  rows={4}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={submitting || pageAccess === 'only view'}>
              {viewMode ? 'Close' : 'Cancel'}
            </Button>
            {!viewMode && (
            <Button 
                type="submit" 
                variant="contained" 
                disabled={submitting || pageAccess === 'only view'}
              >
                {editId ? "Update" : "Create"}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={!!deleteId} 
        onClose={() => setDeleteId(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this about us entry?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={submitting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
