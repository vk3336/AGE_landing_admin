"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from 'next/image';
import {
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Box, 
  Avatar, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  IconButton, 
  Pagination,
  Chip,
  InputAdornment,
  Breadcrumbs,
  Link,
  CircularProgress
} from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';
import { apiFetch } from '../../utils/apiFetch';

interface Category {
  _id?: string;
  name: string;
  image?: string;
  altimg?: string;
}

const CategoryRow = React.memo(({ category, onEdit, onDelete, viewOnly }: {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  viewOnly: boolean;
}) => {
  const [imgDim, setImgDim] = React.useState<{ width: number; height: number } | null>(null);

  return (
    <TableRow hover sx={{ 
      transition: 'all 0.3s ease', 
      '&:hover': { 
        backgroundColor: 'rgba(115, 103, 240, 0.08)',
        transform: 'translateY(-1px)',
      } 
    }}>
      <TableCell sx={{ 
        fontSize: 14, 
        fontWeight: 500, 
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        {category.name}
      </TableCell>
      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box>
          <Typography variant="body1" fontWeight={500}>{category.name}</Typography>
          {category.altimg && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {category.altimg}
            </Typography>
          )}
        </Box>
      </TableCell>
      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        {category.image ? (
          <Box>
            <Avatar 
              variant="rounded" 
              src={category.image} 
              sx={{ 
                width: 40, 
                height: 40,
                border: '2px solid',
                borderColor: 'divider'
              }}
              imgProps={{
                onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
                  const { width, height } = e.currentTarget;
                  setImgDim({ width, height });
                }
              }}
            >
              <ImageIcon />
            </Avatar>
            {imgDim && (
              <Typography variant="caption" sx={{ display: "block", mt: 0.5, textAlign: "center" }}>
                {imgDim.width}×{imgDim.height}
              </Typography>
            )}
          </Box>
        ) : (
          <Avatar 
            variant="rounded" 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: 'grey.200',
              border: '2px solid',
              borderColor: 'divider'
            }}
          >
            <ImageIcon />
          </Avatar>
        )}
      </TableCell>
      <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            size="small" 
            onClick={() => onEdit(category)}
            sx={{ 
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(115, 103, 240, 0.08)',
              }
            }}
            disabled={viewOnly}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => onDelete(category._id || "")}
            sx={{ 
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'rgba(234, 84, 85, 0.08)',
              }
            }}
            disabled={viewOnly}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
});

CategoryRow.displayName = 'CategoryRow';

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: Category;
  setForm: React.Dispatch<React.SetStateAction<Category>>;
  loading: boolean;
  editId: string | null;
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: () => void;
  viewOnly: boolean;
  formError: string | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  loading,
  editId,
  imagePreview,
  onImageChange,
  onDeleteImage,
  viewOnly,
  formError
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, [setForm]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md"
      fullScreen
      PaperProps={{
        sx: {
          borderRadius: 0,
          height: '100vh',
          maxHeight: '100vh',
          width: '100%',
          maxWidth: '100%',
          m: 0,
          bgcolor: 'background.default'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
        <DialogTitle sx={{ 
          fontWeight: 600, 
          fontSize: 24, 
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'background.paper',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {editId ? "Edit Category" : "Add New Category"}
          <IconButton onClick={onClose} size="large" sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <form onSubmit={onSubmit} style={{ flex: 1, overflow: 'auto' }}>
          <DialogContent sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 4, 
            p: 4,
            maxWidth: 1200,
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
            flex: 1
          }}>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 4,
              alignItems: 'flex-start',
              maxWidth: 1200,
              width: '100%',
              margin: '0 auto'
            }}>
              <Box sx={{ 
                bgcolor: 'background.paper', 
                p: 3, 
                borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                  Category Information
                </Typography>
                
                <TextField 
                  fullWidth
                  label="Category Name" 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange}
                  required
                  disabled={loading || viewOnly}
                  sx={{ mb: 3 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                
                <TextField 
                  fullWidth
                  label="Alt Text (For SEO)" 
                  name="altimg" 
                  value={form.altimg || ''} 
                  onChange={handleChange}
                  helperText="Describe the image for search engines and accessibility"
                  disabled={loading || viewOnly}
                  sx={{ mb: 3 }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                
                {formError && (
                  <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                    {formError}
                  </Typography>
                )}
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mt: 4, 
                  pt: 2, 
                  borderTop: '1px solid', 
                  borderColor: 'divider' 
                }}>
                  <Button 
                    variant="outlined" 
                    onClick={onClose}
                    disabled={loading}
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                  {!viewOnly && (
                    <Button 
                      type="submit" 
                      variant="contained"
                      disabled={loading || !form.name}
                      sx={{ textTransform: 'none', minWidth: 120 }}
                    >
                      {loading ? <CircularProgress size={24} /> : (editId ? 'Update' : 'Create')}
                    </Button>
                  )}
                </Box>
              </Box>
              
              <Box sx={{ 
                bgcolor: 'background.paper', 
                p: 3, 
                borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                  Category Image
                </Typography>
                
                <Box 
                  sx={{
                    width: '100%',
                    height: 300,
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      borderColor: viewOnly ? 'divider' : 'primary.main',
                      cursor: viewOnly ? 'default' : 'pointer',
                    },
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => !viewOnly && document.getElementById('category-image-upload')?.click()}
                >
                  {form.image || imagePreview ? (
                    <Image 
                      src={typeof form.image === 'string' ? form.image : imagePreview || ''} 
                      alt={form.altimg || 'Category preview'}
                      width={200}
                      height={200}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <>
                      <ImageIcon sx={{ 
                        fontSize: 40, 
                        color: 'text.secondary', 
                        mb: 1,
                        opacity: viewOnly ? 0.5 : 1
                      }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        textAlign="center"
                        sx={{ opacity: viewOnly ? 0.7 : 1 }}
                      >
                        {viewOnly ? 'No image' : 'Click to upload an image or drag and drop'}
                      </Typography>
                      {!viewOnly && (
                        <Typography variant="caption" color="text.disabled">
                          Recommended: 800x800px, PNG/JPG/JPEG
                        </Typography>
                      )}
                    </>
                  )}
                  <input
                    type="file"
                    id="category-image-upload"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={onImageChange}
                    disabled={viewOnly}
                  />
                </Box>
                
                {(form.image || imagePreview) && !viewOnly && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={onDeleteImage}
                    size="small"
                    sx={{ mt: 2 }}
                    fullWidth
                    disabled={loading}
                  >
                    Remove Image
                  </Button>
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={onClose} 
              sx={{ 
                fontWeight: 500, 
                borderRadius: '6px',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(108, 117, 125, 0.08)',
                }
              }} 
              disabled={loading || viewOnly}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ 
                fontWeight: 500, 
                borderRadius: '6px',
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }} 
              disabled={loading || viewOnly}
            >
              {editId ? "Update" : "Add Category"}
            </Button>
          </DialogActions>
        </form>
      </Box>
    </Dialog>
  );
};

CategoryForm.displayName = 'CategoryForm';

function getCategoryPagePermission() {
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

function isFile(value: unknown): value is File {
  return typeof File !== 'undefined' && value instanceof File;
}

export default function CategoryPage() {
  // All hooks at the top
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Category>({ name: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const rowsPerPage = 8;
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (searchTerm = '') => {
    try {
      setIsLoading(true);
      const url = searchTerm 
        ? `/category/search/${encodeURIComponent(searchTerm)}`
        : '/category';
      
      const res = await apiFetch(url);
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories(search);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [search, fetchCategories]);

  // Initial data fetch and permission check
  useEffect(() => {
    const checkPermissions = async () => {
      const permission = getCategoryPagePermission();
      setPageAccess(permission);
      
      if (permission !== 'no access') {
        await fetchCategories();
      }
    };
    
    checkPermissions();
  }, [fetchCategories]);

  const handleOpen = useCallback((category: Category | null = null) => {
    setEditId(category?._id || null);
    setForm(category ? { ...category } : { name: "", altimg: "" });
    setImagePreview(category?.image || null);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setImagePreview(null);
    setForm({ name: "", altimg: "" });
    setFormError(null); // Clear form error when closing
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file as File }));
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const handleDeleteImage = useCallback(async () => {
    if (!editId || !form.image) return;
    
    try {
      // If it's a string URL, it's an existing image that needs to be deleted from Cloudinary
      if (typeof form.image === 'string') {
        await apiFetch(`/category/${editId}/image`, {
          method: 'DELETE',
        });
      }
      
      // Clear the image from the form and preview
      setForm(prev => ({ ...prev, image: undefined }));
      setImagePreview(null);
      
      // Clear the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error) {
      console.error('Error deleting image:', error);
      // Handle error (e.g., show a toast or alert)
    }
  }, [editId, form.image]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Clear any previous errors
    
    // Validate image is required when adding new category
    if (!editId && !isFile(form.image)) {
      setFormError("Please select an image for the category.");
      return;
    }
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      if (form.altimg) {
        formData.append("altimg", form.altimg);
      }
      if (isFile(form.image)) {
        formData.append("image", form.image);
      }
      const method = editId ? "PUT" : "POST";
      const url = `/category${editId ? "/" + editId : ""}`;
      const response = await apiFetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Operation failed');
      }
      fetchCategories();
      handleClose();
    } finally {
      setSubmitting(false);
    }
  }, [form, editId, fetchCategories, handleClose]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleteError(null);
    try {
      const res = await apiFetch(`/category/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.message && data.message.includes("in use")) {
          setDeleteError("Cannot delete: Category is in use by one or more products.");
        } else {
          setDeleteError(data.message || "Failed to delete category.");
        }
        return;
      }
      setDeleteId(null);
      fetchCategories();
    } catch {}
  }, [deleteId, fetchCategories]);

  const handleEdit = useCallback((category: Category) => {
    handleOpen(category);
  }, [handleOpen]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  // Show loading state initially
  if (isLoading && categories.length === 0) {
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

  // Filter categories by search
  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  
  // Pagination
  const paginatedCategories = filteredCategories.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
        separator={<NavigateNextIcon fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link href="/dashboard" sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <CategoryIcon sx={{ mr: 0.5 }} fontSize="small" />
          Categories
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
            <CategoryIcon sx={{ fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              mb: 0.5
            }}>
              Category Management
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary'
            }}>
              Manage your product categories
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
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
          Add Category
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
              Categories ({categories.length})
            </Typography>
            <Chip 
              label={`${paginatedCategories.length} of ${filteredCategories.length}`}
              size="small"
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                fontWeight: 500
              }}
            />
          </Box>
          
          <TextField
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Categories Table */}
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
                <TableRow sx={{ 
                  backgroundColor: 'rgba(115, 103, 240, 0.04)',
                  '& th': {
                    fontWeight: 600, 
                    color: 'text.primary',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    py: 2,
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }
                }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCategories.map((category) => (
                  <CategoryRow
                    key={category._id}
                    category={category}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    viewOnly={pageAccess === 'only view'}
                  />
                ))}
                {paginatedCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pagination */}
      {categories.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(categories.length / rowsPerPage)}
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
      <CategoryForm
        open={open}
        onClose={handleClose}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        loading={submitting}
        editId={editId}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
        onDeleteImage={handleDeleteImage}
        viewOnly={pageAccess === 'only view'}
        formError={formError}
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
            Are you sure you want to delete this category? This action cannot be undone.
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