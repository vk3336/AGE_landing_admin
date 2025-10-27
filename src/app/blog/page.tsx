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
  InputAdornment,
  Breadcrumbs,
  Link,
  CircularProgress,
  TextareaAutosize
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import CloseIcon from '@mui/icons-material/Close';
import { apiFetch } from '../../utils/apiFetch';

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

const BlogRow = React.memo(({ blog, onEdit, onDelete, viewOnly }: {
  blog: Blog;
  onEdit: () => void;
  onDelete: () => void;
  viewOnly: boolean;
}) => (
  <TableRow>
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
          onClick={onEdit} 
          color="primary"
          disabled={viewOnly}
          size="small"
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton 
          onClick={onDelete} 
          color="error"
          disabled={viewOnly}
          size="small"
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editId ? (viewOnly ? 'View Blog' : 'Edit Blog') : 'Add New Blog'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent dividers>
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
          />
          <TextField
            name="author"
            label="Author"
            fullWidth
            margin="normal"
            value={form.author}
            onChange={handleChange}
            required
            disabled={viewOnly}
          />
          <TextField
            name="heading"
            label="Heading"
            fullWidth
            margin="normal"
            value={form.heading}
            onChange={handleChange}
            required
            disabled={viewOnly}
          />
          <Box mt={2} mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Paragraph 1 *
            </Typography>
            <TextareaAutosize
              name="paragraph1"
              value={form.paragraph1}
              onChange={handleChange}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid rgba(0, 0, 0, 0.23)',
                marginBottom: '16px',
              }}
              disabled={viewOnly}
              required
            />
          </Box>
          
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Paragraph 2
            </Typography>
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
              disabled={viewOnly}
            />
          </Box>
          
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Paragraph 3
            </Typography>
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
          <DialogActions>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {editId ? 'Update' : 'Create'}
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
  const rowsPerPage = 10;

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
                      <TableCell>Content Preview</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedBlogs.length > 0 ? (
                      paginatedBlogs.map((blog) => (
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
                            <Typography variant="subtitle2">{blog.heading || 'No heading'}</Typography>
                          </TableCell>
                          <TableCell sx={{ maxWidth: '300px' }}>
                            <Box sx={{ maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <Typography variant="body2" paragraph sx={{ margin: 0 }}>
                                {blog.paragraph1?.substring(0, 100)}{blog.paragraph1 && blog.paragraph1.length > 100 ? '...' : ''}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton 
                                onClick={() => handleOpenForm(blog)}
                                color="primary"
                                disabled={permission === 'view'}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                onClick={() => handleDelete(blog._id)}
                                color="error"
                                disabled={permission === 'view'}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
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
