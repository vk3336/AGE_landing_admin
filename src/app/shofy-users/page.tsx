"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Pagination, Breadcrumbs, Link, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Divider, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PhoneIcon from '@mui/icons-material/Phone';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { apiFetch } from '../../utils/apiFetch';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';

interface User {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  userImage?: string;
  role?: string;
  organisation?: string;
  companytaxid?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}


const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UserRow = React.memo(({ user, onEdit, onView, onDelete, viewOnly }: {
  user: User;
  onEdit: (user: User) => void;
  onView: (user: User) => void;
  onDelete: (id: string) => void;
  viewOnly: boolean;
}) => (
  <TableRow 
    hover 
    sx={{ 
      transition: 'all 0.2s ease-in-out',
      '&:nth-of-type(odd)': {
        backgroundColor: '#f8f9fa',
      },
      '&:hover': { 
        backgroundColor: '#e9f5ff',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      },
      '&.Mui-selected, &.Mui-selected:hover': {
        backgroundColor: '#e3f2fd',
      }
    }}
  >
    <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box 
          sx={{
            position: 'relative',
            width: 40,
            height: 40,
          }}
        >
          <Avatar 
            src={user.userImage || undefined}
            alt={user.name}
            sx={{ 
              width: '100%',
              height: '100%',
              bgcolor: 'primary.main',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              border: '2px solid',
              borderColor: 'divider',
              '& .MuiAvatar-img': {
                objectFit: 'cover',
                width: '100%',
                height: '100%',
              },
              '& .MuiAvatar-fallback': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
              }
            }}
            imgProps={{
              onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                const fallback = img.parentElement?.querySelector('.MuiAvatar-fallback') as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'flex';
                }
              },
              style: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: user.userImage ? 'block' : 'none'
              }
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>{user.name}</Typography>
          <Typography variant="body2" color="text.secondary">{user.email}</Typography>
        </Box>
      </Box>
    </TableCell>
    <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>{user.phone || 'N/A'}</TableCell>
    <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
      <Box 
        sx={{
          display: 'inline-block',
          px: 1.5,
          py: 0.5,
          borderRadius: 4,
          backgroundColor: user.role === 'admin' ? '#e3f2fd' : 
                          user.role === 'manager' ? '#e8f5e9' : '#f3e5f5',
          color: user.role === 'admin' ? '#1565c0' : 
                user.role === 'manager' ? '#2e7d32' : '#7b1fa2',
          fontWeight: 500,
          fontSize: '0.75rem',
          textTransform: 'capitalize'
        }}
      >
        {user.role || 'User'}
      </Box>
    </TableCell>
    <TableCell>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton 
          color="info" 
          onClick={() => onView(user)}
          title="View User"
          sx={{ 
            color: 'primary.main',
            '&:hover': { 
              backgroundColor: 'rgba(25, 118, 210, 0.04)' 
            }
          }}
        >
          <VisibilityIcon />
        </IconButton>
        <IconButton 
          color="primary" 
          onClick={() => onEdit(user)} 
          disabled={viewOnly}
          title="Edit User"
        >
          <EditIcon />
        </IconButton>
        <IconButton 
          color="error" 
          onClick={() => onDelete(user._id || "")} 
          disabled={viewOnly}
          title="Delete User"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </TableCell>
  </TableRow>
));

UserRow.displayName = 'UserRow';

const UserForm = React.memo(({ 
  open, 
  onClose, 
  form, 
  setForm, 
  onSubmit, 
  submitting, 
  editId,
  viewOnly,
  onImageChange,
  onRemoveImage
}: {
  open: boolean;
  onClose: () => void;
  form: Omit<User, '_id'>;
  setForm: (form: Omit<User, '_id'> | ((prev: Omit<User, '_id'>) => Omit<User, '_id'>)) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editId: string | null;
  viewOnly: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveImage: () => void;
}) => {
  // Create a typed change handler for form fields
  const createChangeHandler = (field: keyof Omit<User, '_id'>) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = e.target;
      setForm(prev => ({
        ...prev,
        [field]: value
      }));
    };
  };
  
  // Specific handler for Select components
  const handleSelectChange = (field: keyof Omit<User, '_id'>) => 
    (event: SelectChangeEvent<string>) => {
      setForm(prev => ({
        ...prev,
        [field]: event.target.value
      }));
    };

  if (!open) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={submitting}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: 24, background: 'linear-gradient(90deg,#396afc,#2948ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Edit User
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
          <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <Avatar 
                src={form.userImage} 
                alt={form.name} 
                sx={{ width: 100, height: 100, mb: 1 }}
              />
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                disabled={submitting || viewOnly}
              >
                Upload Image
                <VisuallyHiddenInput 
                  type="file" 
                  accept="image/*"
                  onChange={onImageChange}
                />
              </Button>
              {form.userImage && (
                <Button 
                  color="error" 
                  size="small" 
                  onClick={onRemoveImage}
                  disabled={submitting || viewOnly}
                >
                  Remove Image
                </Button>
              )}
            </Box>
            <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Full Name"
                name="name"
                value={form.name || ''}
                onChange={createChangeHandler('name')}
                required
                fullWidth
                disabled={submitting || viewOnly}
                InputProps={{ readOnly: viewOnly }}
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email || ''}
                onChange={createChangeHandler('name')}
                required
                fullWidth
                disabled={submitting || viewOnly || !!editId}
                InputProps={{ readOnly: viewOnly || !!editId }}
              />
              <TextField
                label="Phone"
                name="phone"
                value={form.phone || ''}
                onChange={createChangeHandler('name')}
                fullWidth
                disabled={submitting || viewOnly}
                InputProps={{ readOnly: viewOnly }}
              />
              <FormControl fullWidth disabled={submitting || viewOnly}>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={form.role || 'user'}
                  label="Role"
                  onChange={handleSelectChange('role')}
                  disabled={submitting || viewOnly}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
            <TextField
              label="Organization"
              name="organisation"
              value={form.organisation || ''}
              onChange={createChangeHandler('organisation')}
              fullWidth
              disabled={submitting || viewOnly}
              InputProps={{ readOnly: viewOnly }}
            />
            <TextField
              label="Company Tax ID"
              name="companytaxid"
              value={form.companytaxid || ''}
              onChange={createChangeHandler('companytaxid')}
              fullWidth
              disabled={submitting || viewOnly}
              InputProps={{ readOnly: viewOnly }}
            />
            <TextField
              label="Address"
              name="address"
              value={form.address || ''}
              onChange={createChangeHandler('address')}
              fullWidth
              disabled={submitting || viewOnly}
              InputProps={{ readOnly: viewOnly }}
            />
            <TextField
              label="City"
              name="city"
              value={form.city || ''}
              onChange={createChangeHandler('city')}
              fullWidth
              disabled={submitting || viewOnly}
              InputProps={{ readOnly: viewOnly }}
            />
            <TextField
              label="State"
              name="state"
              value={form.state || ''}
              onChange={createChangeHandler('state')}
              fullWidth
              disabled={submitting || viewOnly}
              InputProps={{ readOnly: viewOnly }}
            />
            <TextField
              label="Country"
              name="country"
              value={form.country || ''}
              onChange={createChangeHandler('country')}
              fullWidth
              disabled={submitting || viewOnly}
              InputProps={{ readOnly: viewOnly }}
            />
            <TextField
              label="Pincode"
              name="pincode"
              value={form.pincode || ''}
              onChange={createChangeHandler('pincode')}
              fullWidth
              disabled={submitting || viewOnly}
              InputProps={{ readOnly: viewOnly }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={onClose} 
            sx={{ fontWeight: 700, borderRadius: 3, fontSize: 16 }} 
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ fontWeight: 700, borderRadius: 3, fontSize: 16 }} 
            disabled={submitting || viewOnly}
          >
            {submitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : editId ? (
              "Update User"
            ) : (
              "Add User"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

// User View Dialog Component
const UserViewDialog = React.memo(({ open, user, onClose }: { 
  open: boolean; 
  user: User | null; 
  onClose: () => void;
}) => {
  if (!user) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        fontWeight: 700, 
        fontSize: 24, 
        background: 'linear-gradient(90deg,#396afc,#2948ff)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <PersonIcon /> User Details
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar 
            src={user.userImage} 
            alt={user.name}
            sx={{ 
              width: 120, 
              height: 120, 
              mb: 2,
              border: '3px solid',
              borderColor: 'primary.main'
            }}
          />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {user.role || 'User'}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <List sx={{ width: '100%' }}>
          <ListItem>
            <ListItemIcon>
              <EmailIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Email" 
              secondary={user.email || 'Not provided'} 
              secondaryTypographyProps={{ color: 'text.primary' }}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <PhoneIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Phone" 
              secondary={user.phone || 'Not provided'} 
              secondaryTypographyProps={{ color: 'text.primary' }}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <BusinessIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Organization" 
              secondary={user.organisation || 'Not provided'} 
              secondaryTypographyProps={{ color: 'text.primary' }}
            />
          </ListItem>

          {user.companytaxid && (
            <ListItem>
              <ListItemIcon>
                <ReceiptIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Tax ID" 
                secondary={user.companytaxid}
                secondaryTypographyProps={{ color: 'text.primary' }}
              />
            </ListItem>
          )}

          {(user.address || user.city || user.state || user.country || user.pincode) && (
            <ListItem>
              <ListItemIcon>
                <LocationOnIcon color="primary" sx={{ alignSelf: 'flex-start', mt: 1 }} />
              </ListItemIcon>
              <ListItemText 
                primary="Address" 
                secondary={
                  <>
                    {user.address && <div>{user.address}</div>}
                    <div>
                      {[user.city, user.state, user.country, user.pincode]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  </>
                }
                secondaryTypographyProps={{ 
                  component: 'div',
                  color: 'text.primary',
                  sx: { '& > div': { marginBottom: 0.5 } }
                }}
              />
            </ListItem>
          )}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary"
          fullWidth
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});

UserViewDialog.displayName = 'UserViewDialog';
UserForm.displayName = 'UserForm';

function getUsersPagePermission() {
  if (typeof window === 'undefined') return 'no access';
  const email = localStorage.getItem('admin-email');
  const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN;
  if (email && superAdmin && email === superAdmin) return 'all access';
  const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
  if (perms && perms.users) {
    return perms.users;
  }
  return 'no access';
}

export default function ShopyUsersPage() {
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<User, '_id'>>({ 
    name: '',
    email: '',
    role: 'user',
    userImage: '',
    phone: '',
    organisation: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: ''
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const rowsPerPage = 10;

  const fetchUsers = useCallback(async (searchTerm = '') => {
    try {
      setIsLoading(true);
      const url = searchTerm 
        ? `/users/search/${encodeURIComponent(searchTerm)}`
        : '/users';
      
      const res = await apiFetch(url);
      const data = await res.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  // Initial data fetch and permission check
  useEffect(() => {
    const checkPermissions = async () => {
      const permission = getUsersPagePermission();
      setPageAccess(permission);
      
      if (permission !== 'no access') {
        await fetchUsers();
      }
    };
    
    checkPermissions();
  }, [fetchUsers]);

  const handleOpen = useCallback((user: User) => {
    if (!user?._id) return;
    setEditId(user._id);
    setForm({ ...user });
    setError(null);
    setImageFile(null);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setViewOpen(false);
    setEditId(null);
    setSelectedUser(null);
    setForm({} as Omit<User, '_id'>);
    setError(null);
    setImageFile(null);
  }, []);

  const handleView = useCallback((user: User) => {
    setSelectedUser(user);
    setViewOpen(true);
  }, []);

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Basic validation
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, GIF)');
        return;
      }

      // Preview image
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm(prev => ({ ...prev, userImage: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
      setImageFile(file);
      setError(null);
    } catch (err) {
      console.error('Error handling image upload:', err);
      setError('Failed to process image');
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setForm(prev => ({ ...prev, userImage: '' }));
    setImageFile(null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Add user data
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      
      // Add image file if it's a new file
      if (imageFile) {
        formData.append('userImage', imageFile);
      }

      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/users/${editId}` : '/users/register';
      
      const response = await apiFetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        fetchUsers();
        handleClose();
      } else {
        setError(result.message || 'Operation failed');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error saving user:', err);
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [form, editId, fetchUsers, handleClose, imageFile]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    
    try {
      setSubmitting(true);
      const res = await apiFetch(`/users/${deleteId}`, { method: 'DELETE' });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to delete user');
        return;
      }
      
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  }, [deleteId, fetchUsers]);

  const handleEdit = useCallback((user: User) => {
    handleOpen(user);
  }, [handleOpen]);

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  // Pagination
  const paginatedUsers = users.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Show loading state initially
  if (isLoading && users.length === 0) {
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
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/dashboard" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography color="text.primary">Users</Typography>
      </Breadcrumbs>

      <Card elevation={0} sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              Manage Users
            </Typography>
          </Box>

          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {/* Users Table */}
          <TableContainer 
            component={Paper} 
            elevation={0}
            variant="outlined"
            sx={{
              borderRadius: 2,
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              overflow: 'hidden',
              border: '1px solid #e0e0e0'
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: '#f5f7fa',
                  '& th': {
                    fontWeight: 700,
                    color: '#2d3748',
                    borderBottom: '2px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }
                }}>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 120 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <UserRow
                      key={user._id}
                      user={user}
                      onEdit={handleEdit}
                      onView={handleView}
                      onDelete={handleDeleteClick}
                      viewOnly={pageAccess === 'only view'}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        {search ? 'No users found matching your search.' : 'No users found.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {users.length > rowsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(users.length / rowsPerPage)}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      {open && (
        <UserForm 
          open={open} 
          onClose={handleClose} 
          form={form} 
          setForm={setForm} 
          onSubmit={handleSubmit} 
          onImageChange={handleImageChange}
          submitting={submitting}
          onRemoveImage={handleRemoveImage}
          editId={editId}
          viewOnly={pageAccess === 'only view'}
        />
      )}
      
      {/* View User Dialog */}
      <UserViewDialog 
        open={viewOpen}
        user={selectedUser} 
        onClose={handleClose}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user? This action cannot be undone.</Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setDeleteId(null)} 
            disabled={submitting}
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained" 
            disabled={submitting}
            sx={{ fontWeight: 600 }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
