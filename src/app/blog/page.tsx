"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from 'next/image';
import {
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TextField, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  InputAdornment,
  CircularProgress,
  TextareaAutosize,
  Breadcrumbs,
  Pagination

} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { apiFetch } from '../../utils/apiFetch';
import { Avatar } from '@mui/material';
import Link from 'next/link';

interface Blog {
  _id?: string;
  title: string;
  author: string;
  heading: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  blogimage1?: string;
  blogimage2?: string;
  deleteImage1?: string;
  deleteImage2?: string;
  [key: string]: string | boolean | File | undefined; // Define specific types for dynamic properties
}

const BlogRow = React.memo(({ blog, onEdit, onDelete, onView, viewOnly }: {
  blog: Blog;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  viewOnly: boolean;
}) => (
  <TableRow>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {blog.blogimage1 ? (
          <Image 
            src={blog.blogimage1} 
            alt={blog.title || 'Blog image'}
            width={50} 
            height={50} 
            style={{ objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <Avatar>
            <ArticleIcon />
          </Avatar>
        )}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">{blog.title}</Typography>
          <Typography variant="caption" color="textSecondary">by {blog.author}</Typography>
        </Box>
      </Box>
    </TableCell>
    <TableCell>
      <Typography variant="subtitle2">{blog.heading}</Typography>
    </TableCell>
    <TableCell sx={{ maxWidth: '300px' }}>
      <Box sx={{ maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <Typography variant="body2" paragraph sx={{ margin: 0 }}>
          {blog.paragraph1}
        </Typography>
        {blog.paragraph2 && (
          <Typography variant="body2" paragraph sx={{ margin: 0 }}>
            {blog.paragraph2}
          </Typography>
        )}
        {blog.paragraph3 && (
          <Typography variant="body2" sx={{ margin: 0 }}>
            {blog.paragraph3}
          </Typography>
        )}
      </Box>
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton 
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          color="info"
          size="small"
          title="View"
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
        <IconButton 
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          color="primary"
          disabled={viewOnly}
          size="small"
          title="Edit"
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          color="error"
          disabled={viewOnly}
          size="small"
          title="Delete"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </TableCell>
  </TableRow>
));

BlogRow.displayName = 'BlogRow';

interface BlogFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: Blog;
  setForm: React.Dispatch<React.SetStateAction<Blog>>;
  loading: boolean;
  editId: string | null;
  imagePreview1: string | null;
  imagePreview2: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>, imageNumber: number) => void;
  onDeleteImage: (imageNumber: number) => void;
  viewOnly: boolean;
  formError: string | null;
}

const BlogForm = React.memo(({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  loading,
  editId,
  imagePreview1,
  imagePreview2,
  onImageChange,
  onDeleteImage,
  viewOnly,
  formError
}: BlogFormProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      fullScreen
      PaperProps={{
        sx: {
          maxWidth: '100%',
          width: '100%',
          maxHeight: '100vh',
          m: 0,
          borderRadius: 0
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {editId ? (viewOnly ? 'View Blog Post' : 'Edit Blog Post') : 'Create New Blog Post'}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent dividers sx={{ 
          p: 3,
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
          },
          maxHeight: 'calc(100vh - 180px)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}>
          {formError && (
            <Box color="error.main" mb={2}>
              {formError}
            </Box>
          )}
          <TextField
            name="title"
            label="Title"
            fullWidth
            margin="normal"
            value={form.title}
            onChange={handleChange}
            required
            disabled={viewOnly}
            helperText="Enter a catchy title for your blog post (max 100 characters)"
            inputProps={{ maxLength: 100 }}
          />
          <TextField
            name="author"
            label="Author Name"
            fullWidth
            margin="normal"
            value={form.author}
            onChange={handleChange}
            required
            disabled={viewOnly}
            helperText="Enter the name of the blog post author"
          />
          <TextField
            name="heading"
            label="Blog Subheading"
            fullWidth
            margin="normal"
            value={form.heading}
            onChange={handleChange}
            required
            disabled={viewOnly}
            helperText="A short, attention-grabbing subheading that summarizes your blog post"
          />
          
          <Box mt={2} mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" gutterBottom>
                Paragraph 1 *
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Supports HTML formatting
              </Typography>
            </Box>
            <TextareaAutosize
              name="paragraph1"
              value={form.paragraph1 || ''}
              onChange={handleChange}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid rgba(0, 0, 0, 0.23)',
                marginBottom: '16px',
              }}
              placeholder="First paragraph..."
              disabled={viewOnly}
              required
            />
          </Box>
          
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" gutterBottom>
                Paragraph 2 (Optional)
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Supports HTML formatting
              </Typography>
            </Box>
            <TextareaAutosize
              name="paragraph2"
              value={form.paragraph2 || ''}
              onChange={handleChange}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid rgba(0, 0, 0, 0.23)',
                marginBottom: '16px',
              }}
              placeholder="Second paragraph..."
              disabled={viewOnly}
            />
          </Box>
          
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" gutterBottom>
                Paragraph 3 (Optional)
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Supports HTML formatting
              </Typography>
            </Box>
            <TextareaAutosize
              name="paragraph3"
              value={form.paragraph3 || ''}
              onChange={handleChange}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid rgba(0, 0, 0, 0.23)',
              }}
              placeholder="Third paragraph..."
              disabled={viewOnly}
            />
          </Box>
          
          {/* Image Upload 1 */}
          <Box mt={2} mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Blog Image 1
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="blog-image-1"
              type="file"
              onChange={(e) => onImageChange(e, 1)}
              disabled={viewOnly}
            />
            <label htmlFor="blog-image-1">
              <Button
                variant="outlined"
                component="span"
                startIcon={<ImageIcon />}
                disabled={viewOnly}
              >
                {imagePreview1 ? 'Change Image 1' : 'Upload Image 1'}
              </Button>
            </label>
            {imagePreview1 && (
              <Box mt={1} display="flex" alignItems="center" gap={2}>
                <Image
                  src={imagePreview1}
                  alt="Preview 1"
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
                {!viewOnly && (
                  <IconButton 
                    color="error" 
                    onClick={() => onDeleteImage(1)}
                    disabled={viewOnly}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>

          {/* Image Upload 2 */}
          <Box mt={2} mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Blog Image 2 (Optional)
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="blog-image-2"
              type="file"
              onChange={(e) => onImageChange(e, 2)}
              disabled={viewOnly}
            />
            <label htmlFor="blog-image-2">
              <Button
                variant="outlined"
                component="span"
                startIcon={<ImageIcon />}
                disabled={viewOnly}
              >
                {imagePreview2 ? 'Change Image 2' : 'Upload Image 2'}
              </Button>
            </label>
            {imagePreview2 && (
              <Box mt={1} display="flex" alignItems="center" gap={2}>
                <Image
                  src={imagePreview2}
                  alt="Preview 2"
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
                {!viewOnly && (
                  <IconButton 
                    color="error" 
                    onClick={() => onDeleteImage(2)}
                    disabled={viewOnly}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        {!viewOnly && (
          <DialogActions sx={{ 
            p: 2, 
            borderTop: '1px solid rgba(0, 0, 0, 0.12)',
            justifyContent: 'flex-end',
            '& .MuiButton-root': {
              textTransform: 'none',
              minWidth: '100px',
              ml: 1
            }
          }}>
            <Button 
              variant="outlined" 
              onClick={onClose} 
              disabled={loading}
              startIcon={<CloseIcon />}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {editId ? 'Update Post' : 'Publish Post'}
            </Button>
          </DialogActions>
        )}
      </form>
    </Dialog>
  );
});

BlogForm.displayName = 'BlogForm';

function getBlogPagePermission() {
  if (typeof window === 'undefined') return 'no access';
  const email = localStorage.getItem('admin-email');
  const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN;
  if (email && superAdmin && email === superAdmin) return 'all access';
  const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
  if (perms && perms.blog) {
    return perms.blog;
  }
  return 'no access';
}


export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<Blog>({
    title: '',
    author: '',
    heading: '',
    paragraph1: '',
    paragraph2: '',
    paragraph3: '',
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [imagePreview1, setImagePreview1] = useState<string | null>(null);
  const [imagePreview2, setImagePreview2] = useState<string | null>(null);
  const [selectedImage1, setSelectedImage1] = useState<File | null>(null);
  const [selectedImage2, setSelectedImage2] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [permission, setPermission] = useState<string>('no access');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const rowsPerPage = 10;

  const handleOpenViewDialog = (blog: Blog) => {
    setSelectedBlog(blog);
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedBlog(null);
  };

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/blogs');
      const result = await response.json();
      // Extract the data array from the response
      const blogsData = result && result.success && Array.isArray(result.data) ? result.data : [];
      setBlogs(blogsData);
      setTotalPages(Math.ceil(blogsData.length / rowsPerPage));
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage]);

  useEffect(() => {
    fetchBlogs();
    setPermission(getBlogPagePermission());
  }, [fetchBlogs]);

  const handleOpenForm = (blog: Blog | null = null) => {
    if (blog) {
      // Initialize the form with blog data and reset delete flags
      setForm({
        ...blog,
        deleteImage1: 'false',
        deleteImage2: 'false'
      });
      setEditId(blog._id || null);
      setImagePreview1(blog.blogimage1 || null);
      setImagePreview2(blog.blogimage2 || null);
    } else {
      setForm({
        title: '',
        author: '',
        heading: '',
        paragraph1: '',
        paragraph2: '',
        paragraph3: '',
        deleteImage1: 'false',
        deleteImage2: 'false'
      });
      setEditId(null);
      setImagePreview1(null);
      setImagePreview2(null);
      setSelectedImage1(null);
      setSelectedImage2(null);
    }
    setFormError(null);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, imageNumber: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (imageNumber === 1) {
        setImagePreview1(reader.result as string);
        setSelectedImage1(file);
      } else {
        setImagePreview2(reader.result as string);
        setSelectedImage2(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteImage = (imageNumber: number) => {
    if (imageNumber === 1) {
      setImagePreview1(null);
      setSelectedImage1(null);
      // Set a flag to indicate this image should be deleted
      setForm(prev => ({ ...prev, deleteImage1: 'true' }));
    } else {
      setImagePreview2(null);
      setSelectedImage2(null);
      // Set a flag to indicate this image should be deleted
      setForm(prev => ({ ...prev, deleteImage2: 'true' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.author || !form.heading || !form.paragraph1) {
      setFormError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      
      // Add form fields to formData
      Object.entries(form).forEach(([key, value]) => {
        // Skip the delete flags when appending to formData
        if (key === 'deleteImage1' || key === 'deleteImage2') return;
        
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });

      // Add delete flags if they exist
      if (form.deleteImage1 === 'true') {
        formData.append('deleteImage1', 'true');
      }
      if (form.deleteImage2 === 'true') {
        formData.append('deleteImage2', 'true');
      }

      // Add images if they exist
      if (selectedImage1) formData.append('blogimage1', selectedImage1);
      if (selectedImage2) formData.append('blogimage2', selectedImage2);

      let response: Response;
      
      if (editId) {
        // Update existing blog
        response = await apiFetch(`/blogs/${editId}`, {
          method: 'PUT',
          body: formData,
        });
      } else {
        // Create new blog
        response = await apiFetch('/blogs', {
          method: 'POST',
          body: formData,
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save blog');
      }

      await fetchBlogs();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving blog:', error);
      setFormError('Failed to save blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) {
      console.error('Cannot delete blog: No ID provided');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const response = await apiFetch(`/blogs/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchBlogs();
      } else {
        const error = await response.json();
        console.error('Error deleting blog:', error.message || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.heading.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedBlogs = filteredBlogs.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (permission === 'no access') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography variant="h6" color="error">
          You don&apos;t have permission to access this page.
        </Typography>
      </Box>
    );
  }

  const viewOnly = permission === 'view';

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link color="inherit" href="/">
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Typography color="text.primary">Blog Management</Typography>
      </Breadcrumbs>

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" component="h1">
              Blog Management
            </Typography>
            {!viewOnly && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenForm()}
              >
                Add New Blog
              </Button>
            )}
          </Box>

          <Box mb={3}>
            <TextField
              variant="outlined"
              placeholder="Search blogs..."
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title & Author</TableCell>
                      <TableCell>Heading</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedBlogs.length > 0 ? (
                      paginatedBlogs.map(blog => (
                        <TableRow key={blog._id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {blog.blogimage1 ? (
                                <Image 
                                  src={blog.blogimage1} 
                                  alt="Blog" 
                                  width={50} 
                                  height={50} 
                                  style={{ objectFit: 'cover', borderRadius: 4 }}
                                />
                              ) : (
                                <Avatar>
                                  <ArticleIcon />
                                </Avatar>
                              )}
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">{blog.title}</Typography>
                                <Typography variant="caption" color="textSecondary">by {blog.author}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2">{blog.heading}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenViewDialog(blog);
                                }}
                                color="info"
                                size="small"
                                title="View"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenForm(blog);
                                }}
                                color="primary"
                                disabled={viewOnly}
                                size="small"
                                title="Edit"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(blog._id);
                                }}
                                color="error"
                                disabled={viewOnly}
                                size="small"
                                title="Delete"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No blogs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box mt={3} display="flex" justifyContent="center">
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Blog Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={handleCloseViewDialog} 
        maxWidth="lg" 
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            minHeight: '70vh',
            width: '90%',
            maxWidth: '1200px'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Blog Post Details
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseViewDialog}
            size="small"
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ 
          p: 3,
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
          {selectedBlog && (
            <Box>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: '1fr', 
                  md: selectedBlog?.blogimage1 && selectedBlog?.blogimage2 ? 'repeat(2, 1fr)' : '1fr' 
                },
                gap: 2,
                mb: 3
              }}>
                {/* Debug Info - Can be removed after fixing */}
                <Box sx={{ 
                  gridColumn: '1 / -1',
                  mb: 2, 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  display: 'none' // Set to 'block' to debug
                }}>
                  <Typography variant="subtitle2" gutterBottom>Debug Info:</Typography>
                  <pre style={{ fontSize: '12px', overflowX: 'auto', margin: 0 }}>
                    {JSON.stringify({
                      hasBlogImage1: !!selectedBlog?.blogimage1,
                      hasBlogImage2: !!selectedBlog?.blogimage2,
                      blogImage1: selectedBlog?.blogimage1 ? `${selectedBlog.blogimage1.substring(0, 50)}...` : 'N/A',
                      blogImage2: selectedBlog?.blogimage2 ? `${selectedBlog.blogimage2.substring(0, 50)}...` : 'N/A',
                      image1Valid: selectedBlog?.blogimage1?.startsWith('http') || selectedBlog?.blogimage1?.startsWith('/') || selectedBlog?.blogimage1?.startsWith('data:image'),
                      image2Valid: selectedBlog?.blogimage2?.startsWith('http') || selectedBlog?.blogimage2?.startsWith('/') || selectedBlog?.blogimage2?.startsWith('data:image')
                    }, null, 2)}
                  </pre>
                </Box>
                
                {selectedBlog?.blogimage1 && (
                  <Box sx={{ 
                    border: '1px solid #eee',
                    borderRadius: 1,
                    overflow: 'hidden',
                    boxShadow: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Box sx={{ 
                      flexGrow: 1, 
                      overflow: 'hidden', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      p: 2,
                      minHeight: '200px',
                      bgcolor: '#fafafa'
                    }}>
                      <Image 
                        src={selectedBlog.blogimage1} 
                        alt={`${selectedBlog.title || 'Blog'} - Main`}
                        width={300}
                        height={200}
                        style={{ 
                          objectFit: 'contain', 
                          maxWidth: '100%', 
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const errorMsg = document.createElement('div');
                            errorMsg.textContent = 'Image failed to load';
                            errorMsg.style.color = '#f44336';
                            errorMsg.style.textAlign = 'center';
                            errorMsg.style.padding = '1rem';
                            parent.appendChild(errorMsg);
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ p: 1, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        Main Image
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {selectedBlog?.blogimage2 && (
                  <Box sx={{ 
                    border: '1px solid #eee',
                    borderRadius: 1,
                    overflow: 'hidden',
                    boxShadow: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Box sx={{ 
                      flexGrow: 1, 
                      overflow: 'hidden', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      p: 2,
                      minHeight: '200px',
                      bgcolor: '#fafafa'
                    }}>
                      <Image 
                        src={selectedBlog.blogimage2} 
                        alt={`${selectedBlog.title || 'Blog'} - Secondary`}
                        width={300}
                        height={200}
                        style={{ 
                          objectFit: 'contain', 
                          maxWidth: '100%', 
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const errorMsg = document.createElement('div');
                            errorMsg.textContent = 'Image failed to load';
                            errorMsg.style.color = '#f44336';
                            errorMsg.style.textAlign = 'center';
                            errorMsg.style.padding = '1rem';
                            parent.appendChild(errorMsg);
                          }
                        }}
                      />
                    </Box>
                    <Box sx={{ p: 1, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        Secondary Image
                      </Typography>
                    </Box>
                  </Box>
                )}
              
              </Box>
              
              {/* Content Section in Table */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Blog Content
                </Typography>
                <TableContainer component={Paper} elevation={2} sx={{ mb: 3 }}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ width: '200px', fontWeight: 'bold' }}>Title</TableCell>
                        <TableCell dangerouslySetInnerHTML={{ __html: selectedBlog?.title || 'No title' }} />
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Author</TableCell>
                        <TableCell>{selectedBlog?.author || 'Unknown author'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Heading</TableCell>
                        <TableCell dangerouslySetInnerHTML={{ __html: selectedBlog?.heading || 'N/A' }} />
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', verticalAlign: 'top' }}>Content</TableCell>
                        <TableCell>
                          <Box sx={{ '& > div': { mb: 3 } }}>
                            <Box>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                Paragraph 1
                              </Typography>
                              <div dangerouslySetInnerHTML={{ 
                                __html: selectedBlog.paragraph1 || '<span style="color: #999; font-style: italic;">No content</span>' 
                              }} 
                              style={{ 
                                padding: '12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                borderLeft: '3px solid #1976d2',
                                minHeight: '60px'
                              }} 
                            />
                            </Box>
                            
                            <Box>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                Paragraph 2 {!selectedBlog.paragraph2 && <span style={{ color: '#999', fontWeight: 'normal' }}>(Optional)</span>}
                              </Typography>
                              <div dangerouslySetInnerHTML={{ 
                                __html: selectedBlog.paragraph2 || '<span style="color: #999; font-style: italic;">No content provided</span>' 
                              }} 
                              style={{ 
                                padding: '12px',
                                backgroundColor: selectedBlog.paragraph2 ? '#f8f9fa' : 'transparent',
                                borderRadius: '4px',
                                borderLeft: `3px solid ${selectedBlog.paragraph2 ? '#4caf50' : '#e0e0e0'}`,
                                minHeight: '60px'
                              }} 
                            />
                            </Box>
                            
                            <Box>
                              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                Paragraph 3 {!selectedBlog.paragraph3 && <span style={{ color: '#999', fontWeight: 'normal' }}>(Optional)</span>}
                              </Typography>
                              <div dangerouslySetInnerHTML={{ 
                                __html: selectedBlog.paragraph3 || '<span style="color: #999; font-style: italic;">No content provided</span>' 
                              }} 
                              style={{ 
                                padding: '12px',
                                backgroundColor: selectedBlog.paragraph3 ? '#f8f9fa' : 'transparent',
                                borderRadius: '4px',
                                borderLeft: `3px solid ${selectedBlog.paragraph3 ? '#9c27b0' : '#e0e0e0'}`,
                                minHeight: '60px'
                              }} 
                            />
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Created</TableCell>
                        <TableCell>
                          {new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          justifyContent: 'flex-end',
          '& .MuiButton-root': {
            textTransform: 'none',
            ml: 1
          }
        }}>
          <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
            This is a preview of how your blog will appear to readers.
          </Typography>
          <Button 
            onClick={handleCloseViewDialog} 
            variant="contained" 
            color="primary"
            startIcon={<CloseIcon />}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>

      <BlogForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        loading={loading}
        editId={editId}
        imagePreview1={imagePreview1}
        imagePreview2={imagePreview2}
        onImageChange={handleImageChange}
        onDeleteImage={handleDeleteImage}
        viewOnly={viewOnly}
        formError={formError}
      />
    </Box>
  );
}
