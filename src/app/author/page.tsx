"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from 'next/image';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, 
  Dialog, DialogContent, DialogActions, TextField, IconButton, Avatar, 
 Pagination, Snackbar, Alert, InputBase, 
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon, 
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { apiFetch } from '../../utils/apiFetch';

interface Author {
  _id?: string;
  name?: string;
  description?: string;
  designation?: string;
  authorimage?: string;
  altimage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

function getAuthorPermission() {
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

export default function AuthorPage() {
  const [authors, setAuthors] = useState<Partial<Author>[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Partial<Author> | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Partial<Author> | null>(null);
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Update page access after component mounts (client-side only)
  useEffect(() => {
    setPageAccess(getAuthorPermission());
  }, []);

  const fetchAuthors = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = `/author`;
      
      console.log('Fetching authors from:', endpoint);
      const response = await apiFetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received authors data:', data);
      
      setAuthors(Array.isArray(data) ? data : []);
      setTotalPages(1);
    } catch (error) {
      console.error('Error fetching authors:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching authors',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  const handleOpen = (author?: Partial<Author>) => {
    if (author) {
      setEditingAuthor({ ...author });
      setImagePreview(author.authorimage || null);
    } else {
      setEditingAuthor({});
      setImagePreview(null);
    }
    setImageFile(null);
    setOpen(true);
  };

  const handleView = (author: Partial<Author>) => {
    setSelectedAuthor(author);
    setViewOpen(true);
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedAuthor(null);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAuthor(null);
    setImagePreview(null);
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
  type GenericChangeEvent = { target: { name?: string; value: unknown } } | { currentTarget: { name?: string; value: unknown } } | { name: string; value: unknown };

  const handleChange = (e: InputChangeEvent | GenericChangeEvent) => {
    let name: string | undefined;
    let value: unknown;

    if ('target' in e && e.target) {
      const target = e.target as { name?: string; value: unknown; type?: string };
      name = target.name;
      value = target.value;
    } else if ('currentTarget' in e && e.currentTarget) {
      const target = e.currentTarget as { name?: string; value: unknown };
      name = target.name;
      value = target.value;
    } else if ('name' in e && 'value' in e) {
      name = e.name;
      value = e.value;
    }

    if (!editingAuthor || !name) return;

    setEditingAuthor(prev => {
      if (!prev) return prev;
      return { ...prev, [name!]: value } as Partial<Author>;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pageAccess !== 'all access') {
      setSnackbar({ open: true, message: 'You do not have permission to perform this action', severity: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      
      // Add all fields to formData
      if (editingAuthor) {
        Object.entries(editingAuthor).forEach(([key, value]) => {
          if (key !== 'authorimage' && key !== '_id' && value !== undefined) {
            formData.append(key, String(value));
          }
        });
      }
      
      // Add image file if selected
      if (imageFile) {
        formData.append('authorimage', imageFile);
      }
      
      if (editingAuthor?._id) {
        // Update existing
        const response = await apiFetch(`/author/${editingAuthor._id}`, {
          method: 'PUT',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to update author');
        }
        
        setSnackbar({ open: true, message: 'Author updated successfully', severity: 'success' });
      } else {
        // Create new
        const response = await apiFetch('/author', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Failed to create author');
        }
        
        setSnackbar({ open: true, message: 'Author created successfully', severity: 'success' });
      }
      
      fetchAuthors();
      handleClose();
    } catch (error) {
      console.error('Error saving author:', error);
      setSnackbar({ open: true, message: 'Failed to save author', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (pageAccess !== 'all access') {
      setSnackbar({ open: true, message: 'You do not have permission to perform this action', severity: 'error' });
      return;
    }

    if (window.confirm('Are you sure you want to delete this author?')) {
      try {
        await apiFetch(`/author/${id}`, { method: 'DELETE' });
        setSnackbar({ open: true, message: 'Author deleted successfully', severity: 'success' });
        fetchAuthors();
      } catch (error) {
        console.error('Error deleting author:', error);
        setSnackbar({ open: true, message: 'Failed to delete author', severity: 'error' });
      }
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown> | null, value: number) => {
    setPage(value);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {pageAccess === 'no access' ? (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" color="error">
            You don&apos;t have permission to access this page.
          </Typography>
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Author Management</Typography>
            {pageAccess === 'all access' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
              >
                Add New Author
              </Button>
            )}
          </Box>

          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', backgroundColor: 'background.paper', borderRadius: 1, px: 2, py: 1, maxWidth: 400 }}>
            <SearchIcon color="action" sx={{ mr: 1 }} />
            <InputBase
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  fetchAuthors();
                }
              }}
              sx={{ flex: 1 }}
            />
          </Box>

          <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Author</TableCell>
                    <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Designation</TableCell>
                    <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell align="right" sx={{ color: 'common.white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : authors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No authors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    authors.map((author) => (
                      <TableRow key={author._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {author.authorimage ? (
                              <Avatar src={author.authorimage} alt={author.altimage || author.name} />
                            ) : (
                              <Avatar>
                                <PersonIcon />
                              </Avatar>
                            )}
                            <Box>
                              <Typography variant="body1">{author.name || '-'}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{author.designation || '-'}</TableCell>
                        <TableCell>
                          {author.description ? (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {author.description}
                            </Typography>
                          ) : '-'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleView(author)} title="View">
                            <VisibilityIcon color="info" />
                          </IconButton>
                          {pageAccess === 'all access' && (
                            <>
                              <IconButton onClick={() => handleOpen(author)} title="Edit">
                                <EditIcon color="primary" />
                              </IconButton>
                              <IconButton onClick={() => author._id && handleDelete(author._id)} title="Delete">
                                <DeleteIcon color="error" />
                              </IconButton>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>

          <Dialog 
            open={open} 
            onClose={handleClose} 
            fullScreen
            maxWidth="xl"
          >
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6">
                  {editingAuthor?._id ? 'Edit Author' : 'Create New Author'}
                </Typography>
                <IconButton color="inherit" onClick={handleClose} edge="end">
                  <CloseIcon />
                </IconButton>
              </Box>
              <DialogContent sx={{ p: 3, height: 'calc(100vh - 120px)' }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2,
                  height: '100%',
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: '#555',
                  }
                }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                      <TextField
                        name="name"
                        label="Author Name"
                        value={editingAuthor?.name || ''}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                      />
                      
                      <TextField
                        name="designation"
                        label="Designation"
                        value={editingAuthor?.designation || ''}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                      />
                      
                      <TextField
                        name="description"
                        label="Description"
                        value={editingAuthor?.description || ''}
                        onChange={handleChange}
                        multiline
                        rows={4}
                        fullWidth
                        margin="normal"
                      />
                      
                      <TextField
                        name="altimage"
                        label="Image Alt Text"
                        value={editingAuthor?.altimage || ''}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                      />
                    </Box>
                    
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Author Image</Typography>
                        <Box 
                          sx={{ 
                            border: '1px dashed grey', 
                            borderRadius: 1, 
                            p: 2, 
                            textAlign: 'center',
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                          />
                          {imagePreview ? (
                            <Box sx={{ position: 'relative' }}>
                              <Image 
                                src={imagePreview} 
                                alt="Preview" 
                                width={300}
                                height={300}
                                style={{ maxWidth: '100%', maxHeight: '300px', width: 'auto', height: 'auto' }} 
                              />
                              <IconButton 
                                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImagePreview(null);
                                  setImageFile(null);
                                }}
                              >
                                <CloseIcon />
                              </IconButton>
                            </Box>
                          ) : (
                            <Box sx={{ p: 3 }}>
                              <UploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 1 }} />
                              <Typography>Click to upload image</Typography>
                              <Typography variant="caption" color="text.secondary">
                                JPG, PNG (Max 5MB)
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? 'Saving...' : editingAuthor?._id ? 'Update' : 'Create'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
          >
            <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>

          {/* View Dialog */}
          <Dialog 
            open={viewOpen} 
            onClose={handleViewClose}
            fullScreen
            maxWidth="xl"
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">View Author Details</Typography>
              <IconButton color="inherit" onClick={handleViewClose} edge="end">
                <CloseIcon />
              </IconButton>
            </Box>
            <DialogContent sx={{ p: 3, height: 'calc(100vh - 120px)' }}>
              {selectedAuthor ? (
                <Box sx={{ 
                  height: '100%',
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: '#555',
                  }
                }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                        Author Information
                      </Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                          <Typography variant="body1">{selectedAuthor.name || '-'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Designation</Typography>
                          <Typography variant="body1">{selectedAuthor.designation || '-'}</Typography>
                        </Box>
                        <Box sx={{ gridColumn: '1 / -1' }}>
                          <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                          <Typography variant="body1">{selectedAuthor.description || '-'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Alt Text</Typography>
                          <Typography variant="body1">{selectedAuthor.altimage || '-'}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                        Author Image
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        {selectedAuthor.authorimage ? (
                          <Box sx={{ textAlign: 'center' }}>
                            <Image 
                              src={selectedAuthor.authorimage} 
                              alt={selectedAuthor.altimage || selectedAuthor.name || 'Author'} 
                              width={400}
                              height={400}
                              style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: 8, width: 'auto', height: 'auto' }}
                            />
                            {selectedAuthor.altimage && (
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Alt: {selectedAuthor.altimage}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            width: '100%',
                            height: '200px',
                            border: '1px dashed grey',
                            borderRadius: 1
                          }}>
                            <Typography>No image available</Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Timestamps */}
                  {(selectedAuthor.createdAt || selectedAuthor.updatedAt) && (
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Timestamps</Typography>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        {selectedAuthor.createdAt && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Created At</Typography>
                            <Typography variant="body2">
                              {new Date(selectedAuthor.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                        {selectedAuthor.updatedAt && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Updated At</Typography>
                            <Typography variant="body2">
                              {new Date(selectedAuthor.updatedAt).toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography>No data available</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleViewClose}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
}