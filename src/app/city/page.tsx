"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiFetch from '../../utils/apiFetch';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Alert, Snackbar, CircularProgress, Container, Typography, Autocomplete, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';

// Define types locally to avoid import issues
type CityOption = {
  name: string;
  state: string;
};

type CountryOption = {
  _id: string;
  name: string;
  slug: string;
};

type StateOption = {
  _id: string;
  name: string;
  slug: string;
  country?: string;
};

type CityFormData = {
  _id?: string;
  name: string;
  slug: string;
  country: string;
  state: string;
  country_name?: string;
  state_name?: string;
};

interface City {
  _id: string;
  name: string;
  slug: string;
  country: string | { _id: string; name: string };
  state: string | { _id: string; name: string };
  state_name?: string;
  country_name?: string;
  createdAt: string;
  updatedAt: string;
}

// Sample city data
const sampleCities: CityOption[] = [
    { name: 'Mumbai', state: 'Maharashtra' },
    { name: 'Delhi', state: 'Delhi' },
    { name: 'Bangalore', state: 'Karnataka' },
    { name: 'Hyderabad', state: 'Telangana' },
    { name: 'Chennai', state: 'Tamil Nadu' },
    { name: 'Kolkata', state: 'West Bengal' },
    { name: 'Ahmedabad', state: 'Gujarat' },
    { name: 'Pune', state: 'Maharashtra' },
    { name: 'Jaipur', state: 'Rajasthan' },
    { name: 'Lucknow', state: 'Uttar Pradesh' },
    { name: 'Kanpur', state: 'Uttar Pradesh' },
    { name: 'Nagpur', state: 'Maharashtra' },
    { name: 'Indore', state: 'Madhya Pradesh' },
    { name: 'Bhopal', state: 'Madhya Pradesh' },
    { name: 'Patna', state: 'Bihar' },
    { name: 'Ludhiana', state: 'Punjab' },
    { name: 'Agra', state: 'Uttar Pradesh' },
    { name: 'Varanasi', state: 'Uttar Pradesh' },
    { name: 'Amritsar', state: 'Punjab' },
    { name: 'Coimbatore', state: 'Tamil Nadu' },
    { name: 'Thiruvananthapuram', state: 'Kerala' },
    { name: 'Kochi', state: 'Kerala' },
    { name: 'Surat', state: 'Gujarat' },
    { name: 'Rajkot', state: 'Gujarat' },
    { name: 'Ranchi', state: 'Jharkhand' },
    { name: 'Guwahati', state: 'Assam' },
    { name: 'Dehradun', state: 'Uttarakhand' },
    { name: 'Shimla', state: 'Himachal Pradesh' },
    { name: 'Panaji', state: 'Goa' },
    { name: 'Shillong', state: 'Meghalaya' }
];

interface City {
  _id: string;
  name: string;
  slug: string;
  country: string | { _id: string; name: string };
  state: string | { _id: string; name: string };
  state_name?: string;
  country_name?: string;
  createdAt: string;
  updatedAt: string;
}

function getCityPagePermission() {
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

export default function CityPage() {
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  useEffect(() => {
    const access = getCityPagePermission();
    setPageAccess(access);
  }, []);

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);
  
  const [form, setForm] = useState<CityFormData>({
    name: '',
    slug: '',
    country: '',
    state: '',
    country_name: '',
    state_name: ''
  });
  
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _router = useRouter();

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Fetch cities with pagination
  const fetchCities = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });
      
      const res = await apiFetch(`/cities?${queryParams}`);
      const response = await res.json();
      
      if (response && response.status === 'success' && response.data) {
        const { cities, pagination: paginationData } = response.data;
        setCities(cities);
        setFilteredCities(cities);
        
        if (paginationData) {
          setPagination(prev => ({
            ...prev,
            ...paginationData,
            page: paginationData.page || page,
            limit: paginationData.limit || prev.limit
          }));
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load cities';
      setError(errorMessage);
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  // Fetch countries
  const fetchCountries = useCallback(async () => {
    try {
      const res = await apiFetch('/countries');
      const response = await res.json();
      
      let countriesData: CountryOption[] = [];
      if (response && response.status === 'success' && response.data && Array.isArray(response.data.countries)) {
        countriesData = response.data.countries;
      } else if (Array.isArray(response)) {
        countriesData = response;
      }
      
      setCountries(countriesData);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  }, []);

  // Fetch all states
  const fetchStates = useCallback(async () => {
    try {
      const res = await apiFetch('/states');
      const response = await res.json();
      
      let statesData: StateOption[] = [];
      if (response && response.status === 'success' && response.data && Array.isArray(response.data.states)) {
        statesData = response.data.states;
      } else if (Array.isArray(response)) {
        statesData = response;
      } else if (response && response.data) {
        statesData = response.data.states || [];
      }
      
      setStates(statesData);
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCities(1, searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, fetchCities]);

  // Load initial data
  useEffect(() => {
    fetchCities(pagination.page);
    fetchCountries();
    fetchStates();
  }, [fetchCities, fetchCountries, fetchStates, pagination.page]);

  // Handle country change
  const handleCountryChange = (countryId: string) => {
    setForm(prev => ({
      ...prev,
      country: countryId,
      country_name: countries.find(c => c._id === countryId)?.name || ''
    }));
  };

  // Handle state change
  const handleStateChange = (stateId: string) => {
    const selectedState = states.find(s => s._id === stateId);
    setForm(prev => ({
      ...prev,
      state: stateId,
      state_name: selectedState?.name || '',
      // Auto-set country if state has country info
      ...(selectedState?.country && {
        country: selectedState.country,
        country_name: countries.find(c => c._id === selectedState.country)?.name || ''
      })
    }));
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: CityFormData) => ({
      ...prev,
      [name]: value || ''
    }));
    
    // Auto-generate slug from name when creating a new city or when explicitly changing the name
    if (name === 'name' && value && (!editId || form.slug === '' || form.slug === prevSlug)) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setForm((prev: CityFormData) => ({
        ...prev,
        slug: slug
      }));
    }
  };
  
  // Store the initial slug when starting to edit
  const [prevSlug, setPrevSlug] = useState('');
  
  // Update prevSlug when entering edit mode
  useEffect(() => {
    if (editId) {
      setPrevSlug(form.slug);
    }
  }, [editId, form.slug, setPrevSlug]);

  // Handle city selection from autocomplete
  const handleCitySelect = (cityName: string | null) => {
    if (!cityName) return;
    
    const selectedCity = sampleCities.find(city => city.name === cityName);
    
    if (selectedCity) {
      const slug = cityName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Find the state by name to get its ID
      const matchedState = states.find(s => s.name === selectedCity.state);
      
      setForm((prev: CityFormData) => ({
        ...prev,
        name: selectedCity.name,
        slug: slug,
        state: matchedState?._id || '',
        state_name: matchedState ? matchedState.name : selectedCity.state
      }));

      // Show warning if state not found in database
      if (!matchedState) {
        console.warn(`State "${selectedCity.state}" not found in the database. Please add it first.`);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const url = editId ? `/cities/${editId}` : '/cities';
      const method = editId ? 'PUT' : 'POST';
      
      // Only include fields that have values
      const formData: Partial<CityFormData> = {};
      if (form.name) formData.name = form.name.trim();
      if (form.slug) formData.slug = form.slug.trim();
      if (form.country) formData.country = form.country;
      if (form.state) formData.state = form.state;
      
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.message || 'Failed to save city');
      }
      
      setSnackbar({
        open: true,
        message: editId ? 'City updated successfully' : 'City created successfully',
        severity: 'success'
      });
      
      resetForm();
      fetchCities(pagination.page, searchTerm);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save city';
      setError(errorMessage);
      console.error('Error saving city:', error);
    }
  };

  // Handle edit button click
  const handleEdit = (city: City) => {
    console.log('Editing city:', city);
    
    const countryId = !city.country ? '' : 
      typeof city.country === 'string' ? city.country : 
      city.country?._id || '';
      
    const stateId = !city.state ? '' : 
      typeof city.state === 'string' ? city.state : 
      city.state?._id || '';
      
    const countryName = (city.country && typeof city.country === 'object') ? city.country.name : 
      (city.country_name || '');
      
    const stateName = (city.state && typeof city.state === 'object') ? city.state.name : 
      (city.state_name || '');
      
    console.log('Processed values:', { countryId, stateId, countryName, stateName });
      
    setForm({
      name: city.name || '',
      slug: city.slug || '',
      country: countryId,
      state: stateId,
      country_name: countryName,
      state_name: stateName
    });
    
    setEditId(city._id);
    setOpenForm(true);
  };

  // Handle delete button click
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setDeleteSubmitting(true);
      setDeleteError(null);
      
      const res = await apiFetch(`/cities/${deleteId}`, { 
        method: 'DELETE',
      });
      
      const data = await res.json();
      console.log('Delete response:', data);
      
      if (res.ok) {
        setSnackbar({
          open: true,
          message: data.message || 'City deleted successfully',
          severity: 'success'
        });
        
        setDeleteId(null);
        // If this was the last item on the page and not the first page, go to previous page
        if (filteredCities.length === 1 && pagination.page > 1) {
          fetchCities(pagination.page - 1, searchTerm);
        } else {
          fetchCities(pagination.page, searchTerm);
        }
        return;
      }
      
      // Handle error responses
      let errorMessage = data?.message || 'Failed to delete city';
      
      // Show specific error message for in-use cities
      if (res.status === 400 && errorMessage.includes('being used by other records')) {
        errorMessage = 'Cannot delete city because it is being used by one or more locations';
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
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting the city';
      setDeleteError(errorMessage);
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setDeleteSubmitting(false);
    }  
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: '',
      slug: '',
      country: '',
      state: '',
      country_name: '',
      state_name: ''
    });
    setEditId(null);
    setOpenForm(false);
    setError(null);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (pageAccess === 'no access') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">You don&apos;t have permission to access this page.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Cities
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
            disabled={pageAccess === 'only view'}
          >
            Add City
          </Button>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />
        </Box>

        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Cities table */}
        {!loading && !error && (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>State</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <TableRow key={city._id}>
                        <TableCell>{city.name || '-'}</TableCell>
                        <TableCell>{
                          city.state && typeof city.state === 'object' ? city.state.name : 
                          city.state_name || 'N/A'
                        }</TableCell>
                        <TableCell>{
                          city.country && typeof city.country === 'object' ? city.country.name : 
                          city.country_name || 'N/A'
                        }</TableCell>
                        <TableCell>{city.slug || '-'}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color={pageAccess === 'only view' ? 'default' : 'primary'}
                            onClick={() => handleEdit(city)}
                            size="small"
                            disabled={pageAccess === 'only view'}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color={pageAccess === 'only view' ? 'default' : 'error'}
                            onClick={() => handleDeleteClick(city._id)}
                            size="small"
                            disabled={pageAccess === 'only view'}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        {cities.length === 0 ? 'No cities available' : 'No matching cities found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            {pagination.total > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                <Button 
                  onClick={() => fetchCities(1, searchTerm)}
                  disabled={pagination.page === 1}
                  variant="outlined"
                  size="small"
                >
                  First
                </Button>
                <Button 
                  onClick={() => fetchCities(pagination.page - 1, searchTerm)}
                  disabled={!pagination.hasPreviousPage}
                  variant="outlined"
                  size="small"
                >
                  Previous
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                  Page {pagination.page} of {pagination.totalPages}
                </Box>
                <Button 
                  onClick={() => fetchCities(pagination.page + 1, searchTerm)}
                  disabled={!pagination.hasNextPage}
                  variant="outlined"
                  size="small"
                >
                  Next
                </Button>
                <Button 
                  onClick={() => fetchCities(pagination.totalPages, searchTerm)}
                  disabled={pagination.page === pagination.totalPages}
                  variant="outlined"
                  size="small"
                >
                  Last
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total: {pagination.total} cities
                  </Typography>
                </Box>
              </Box>
            )}
          </>
        )}

        {/* Add/Edit City Form Dialog */}
        <Dialog open={openForm} onClose={resetForm} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>{editId ? 'Edit City' : 'Add New City'}</DialogTitle>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Autocomplete
                freeSolo
                options={sampleCities.map(city => city.name)}
                value={form.name}
                onChange={(_, newValue: string | null) => {
                  handleCitySelect(newValue);
                }}
                onInputChange={(_, newInputValue) => {
                  setForm((prev: CityFormData) => ({
                    ...prev,
                    name: newInputValue
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="normal"
                    
                    fullWidth
                    id="name"
                    label="City Name"
                    name="name"
                    autoFocus
                    placeholder="Start typing to search for a city..."
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    {option}
                  </li>
                )}
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="slug"
                label="Slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                helperText="URL-friendly version of the name (auto-generated but can be customized)"
              />
              
              <Autocomplete
                id="country-select"
                options={countries}
                getOptionLabel={(option) => option.name}
                value={countries.find(c => c._id === form.country) || null}
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleCountryChange(newValue._id);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="normal"
                    
                    fullWidth
                    label="Country"
                    name="country"
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option._id}>
                    {option.name}
                  </li>
                )}
              />
              
              <Autocomplete
                id="state-select"
                options={states}
                getOptionLabel={(option) => option.name}
                value={states.find(s => s._id === form.state) || null}
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleStateChange(newValue._id);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="normal"
                    
                    fullWidth
                    label="State"
                    name="state"
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option._id}>
                    {option.name}
                  </li>
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={resetForm}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                {editId ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!deleteId}
          onClose={() => !deleteSubmitting && setDeleteId(null)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography variant="body1" component="div" sx={{ py: 2 }}>
              Are you sure you want to delete this city? This action cannot be undone.
            </Typography>
            {deleteError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {deleteError}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteId(null)} 
              disabled={deleteSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              disabled={deleteSubmitting}
              startIcon={deleteSubmitting ? <CircularProgress size={20} /> : null}
            >
              {deleteSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}
