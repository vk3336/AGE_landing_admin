"use client";
import React, { useEffect, useState, useCallback } from "react";
import apiFetch from '../../utils/apiFetch';
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, TextField, 
  IconButton, Pagination, Breadcrumbs, Link, CircularProgress, Alert, Snackbar, Autocomplete, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import PublicIcon from '@mui/icons-material/Public';

interface Country {
  _id?: string;
  name: string;
  code: string;
  slug?: string;
  flag?: string;
}

interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

// Define form state type to match Country interface but make all fields required
type FormState = Required<Pick<Country, 'name' | 'code' | 'slug'>>;

const CountryRow = React.memo(({ country, onEdit, onDelete, viewOnly }: {
  country: Country;
  onEdit: (country: Country) => void;
  onDelete: (id: string) => void;
  viewOnly: boolean;
}) => (
  <TableRow hover sx={{ transition: 'background 0.2s', '&:hover': { background: 'rgba(41,72,255,0.08)' } }}>
    <TableCell sx={{ fontSize: 16 }}>{country.name}</TableCell>
    <TableCell sx={{ fontSize: 16 }}>{country.code}</TableCell>
    <TableCell sx={{ fontSize: 16 }}>{country.slug || '-'}</TableCell>
    <TableCell>
      <IconButton color="primary" onClick={() => onEdit(country)} disabled={viewOnly}><EditIcon /></IconButton>
      <IconButton 
        color="error" 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(country._id || '');
        }} 
        disabled={viewOnly}
      >
        <DeleteIcon />
      </IconButton>
    </TableCell>
  </TableRow>
));

CountryRow.displayName = 'CountryRow';

// List of major countries with their codes and flags
const countriesList = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' }
];

const CountryForm = React.memo(({ 
  open, 
  onClose, 
  form, 
  setForm, 
  onSubmit, 
  submitting, 
  editId, 
  viewOnly, 
  error 
}: {
  open: boolean;
  onClose: () => void;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editId: string | null;
  viewOnly: boolean;
  error: string | null;
}) => {
  const [inputValue, setInputValue] = useState('');
  
  // Find the selected country object - match by name or code to handle both add and edit cases
  const selectedCountry = countriesList.find(country => 
    country.name.toLowerCase() === form.name?.toLowerCase() || 
    country.code.toLowerCase() === form.code?.toLowerCase()
  ) || null;
  
  // Log for debugging
  console.log('Form data:', form);
  console.log('Selected country:', selectedCountry);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={onSubmit}>
        <DialogTitle>{editId ? (viewOnly ? 'View' : 'Edit') : 'Add'} Country</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          <Autocomplete
            id="country-select"
            options={countriesList}
            autoHighlight
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => 
              option.code === value.code || 
              option.name.toLowerCase() === value.name?.toLowerCase()
            }
            value={selectedCountry}
            onChange={(event, newValue) => {
              if (newValue) {
                setForm({
                  ...form,
                  name: newValue.name,
                  code: newValue.code,
                  slug: newValue.name.toLowerCase().replace(/\s+/g, '-')
                });
              } else {
                setForm({
                  ...form,
                  name: '',
                  code: '',
                  slug: ''
                });
              }
            }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            renderOption={(props, option) => {
              // Extract key from props to prevent it from being spread
              const { key, ...otherProps } = props;
              return (
                <Box 
                  component="li" 
                  key={key}
                  sx={{ '& > img': { mr: 2, flexShrink: 0 } }} 
                  {...otherProps}
                >
                  <span style={{ marginRight: 10 }}>{option.flag}</span>
                  {option.name} ({option.code})
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Choose a country"
                margin="dense"
                variant="outlined"
                required
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            disabled={viewOnly || submitting}
            sx={{ mb: 2 }}
          />
        <TextField
          margin="dense"
          label="Country Code (2-3 letters)"
          type="text"
          fullWidth
          variant="outlined"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          name="code"
          disabled={viewOnly || submitting}
          inputProps={{ maxLength: 3, minLength: 2 }}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Slug (auto-generated if empty)"
          type="text"
          fullWidth
          variant="outlined"
          value={form.slug || ''}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          onBlur={(e) => {
            if (!e.target.value && form.name) {
              setForm({ ...form, slug: form.name.toLowerCase().replace(/\s+/g, '-') });
            }
          }}
          name="slug"
          disabled={viewOnly || submitting}
          helperText="Leave empty to auto-generate from name"
        />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          {!viewOnly && (
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Saving...' : editId ? 'Update' : 'Save'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
});

CountryForm.displayName = 'CountryForm';

interface ApiResponse<T = any> {
  data?: T;
  total?: number;
  error?: boolean;
  message?: string;
}

function getCountryPagePermission() {
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

export default function CountryPage() {
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  
  const initialFormState: FormState = { 
    name: '', 
    code: '', 
    slug: '' 
  };
  
  const [form, setForm] = useState<FormState>(initialFormState);
  
  // Helper function to update form state
  const updateForm = (updates: Partial<FormState>) => {
    setForm(prev => ({
      ...prev,
      ...updates
    }));
  };
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const itemsPerPage = 10;
  const viewOnly = pageAccess === 'only view';
  const noAccess = pageAccess === 'no access';

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/countries?page=${page}&limit=${itemsPerPage}${searchTerm ? `&search=${searchTerm}` : ''}`
      );
      const result = await response.json();
      
      // Handle the API response format: { status: 'success', results: number, data: { countries: [] } }
      if (result && result.status === 'success' && result.data && Array.isArray(result.data.countries)) {
        setCountries(result.data.countries);
        setTotalPages(Math.ceil(result.results / itemsPerPage));
      } else {
        console.error('Unexpected API response format:', result);
        setCountries([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load countries',
        severity: 'error',
      });
      setCountries([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, searchTerm]);

  // Initialize page access and fetch countries
  useEffect(() => {
    setPageAccess(getCountryPagePermission());
    if (!noAccess) {
      fetchCountries();
    }
  }, [noAccess, fetchCountries]);

  const handleOpenForm = (country: Country | null = null) => {
    if (viewOnly) return;
    
    if (country) {
      setForm({
        name: country.name,
        code: country.code,
        slug: country.slug || ''
      });
      setEditId(country._id || null);
      setOpenForm(true);
    } else {
      setForm(initialFormState);
      setEditId(null);
      setOpenForm(true);
    }
  };

  const handleCloseForm = () => {
    setForm(initialFormState);
    setEditId(null);
    setError(null);
    setOpenForm(false);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (viewOnly) return;
    
    if (!form.name || !form.code) {
      setError('Name and code are required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const url = editId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/countries/${editId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/countries`;
      
      const method = editId ? 'PUT' : 'POST';
      
      const response = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-')
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save country');
      }

      setSnackbar({
        open: true,
        message: editId ? 'Country updated successfully' : 'Country added successfully',
        severity: 'success'
      });
      
      fetchCountries();
      handleCloseForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }, [editId, form]);

  const handleAddClick = () => {
    if (viewOnly) return;
    setForm({ name: '', code: '', slug: '' });
    setEditId(null);
    setOpenForm(true);
  };

  const handleDeleteClick = useCallback((id: string) => {
    if (viewOnly) return;
    setDeleteId(id);
    setDeleteError(null);
  }, [viewOnly]);

  const handleCloseDeleteDialog = () => {
    setDeleteId(null);
    setDeleteError(null);
  };

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    
    try {
      setSubmitting(true);
      setDeleteError(null);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/countries/${deleteId}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.NEXT_PUBLIC_API_KEY_NAME && process.env.NEXT_PUBLIC_API_SECRET_KEY ? {
            [process.env.NEXT_PUBLIC_API_KEY_NAME]: process.env.NEXT_PUBLIC_API_SECRET_KEY
          } : {})
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSnackbar({
          open: true,
          message: data.message || 'Country deleted successfully',
          severity: 'success'
        });
        setDeleteId(null);
        fetchCountries();
        return;
      }
      
      // Handle error responses
      let errorMessage = data?.message || 'Failed to delete country';
      
      // Show specific error message for in-use countries
      if (res.status === 400 && errorMessage.includes('being used by other records')) {
        errorMessage = 'Cannot delete country because it is being used by other records (states, cities, or locations)';
      }
      
      setDeleteError(errorMessage);
      
      // Also show error in snackbar
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting the country';
      setDeleteError(errorMessage);
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  }, [deleteId]);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (viewOnly) return;
    const { name, value } = e.target;
    
    const updates: Partial<FormState> = {};
    
    if (name === 'name') {
      updates.name = value;
      // Auto-generate slug when name changes and slug is empty
      if (!form.slug) {
        updates.slug = value.toLowerCase().replace(/\s+/g, '-');
      }
    } else if (name === 'code') {
      updates.code = value.toUpperCase();
    } else if (name === 'slug') {
      updates.slug = value;
    }
    
    updateForm(updates);
  };

  if (noAccess) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error">You don't have permission to view this page.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link color="inherit" href="/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Typography color="text.primary">Countries</Typography>
      </Breadcrumbs>

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center">
              <PublicIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h5" component="div">
                Countries
              </Typography>
            </Box>
            {!viewOnly && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => handleOpenForm()}
                startIcon={<EditIcon />}
              >
                Add Country
              </Button>
            )}
          </Box>

          <Box mb={3}>
            <TextField
              label="Search countries"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or code..."
              sx={{ maxWidth: 400 }}
            />
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : countries.length === 0 ? (
            <Box p={3} textAlign="center">
              <Typography>No countries found</Typography>
              {!viewOnly && (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => handleOpenForm()}
                  sx={{ mt: 2 }}
                >
                  Add your first country
                </Button>
              )}
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell>Slug</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {countries.map((country) => (
                      <CountryRow 
                        key={country._id} 
                        country={country} 
                        onEdit={handleOpenForm}
                        onDelete={handleDeleteClick}
                        viewOnly={viewOnly}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
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

      <CountryForm
        open={openForm}
        onClose={handleCloseForm}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        editId={editId}
        viewOnly={viewOnly}
        error={error}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={!!deleteId}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Country</DialogTitle>
        <DialogContent>
          {deleteError ? (
            <Typography color="error">{deleteError}</Typography>
          ) : (
            <Typography>Are you sure you want to delete this country? This action cannot be undone.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={submitting || !!deleteError}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
