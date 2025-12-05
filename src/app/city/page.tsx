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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

// Define types locally to avoid import issues

type CountryOption = {
  _id: string;
  name: string;
  slug: string;
};

interface StateCountry {
  _id: string;
  name?: string;
  [key: string]: unknown;
}

type StateOption = {
  _id: string;
  name: string;
  slug: string;
  country: string | StateCountry;
  [key: string]: unknown;
};

type CityFormData = {
  _id?: string;
  name: string;
  slug: string;
  country: string;
  state: string;
  country_name?: string;
  state_name?: string;
  longitude?: number;
  latitude?: number;
};

interface City {
  _id: string;
  name: string;
  slug: string;
  country: string | { _id: string; name: string };
  state: string | { _id: string; name: string };
  state_name?: string;
  country_name?: string;
  longitude?: number;
  latitude?: number;
  createdAt: string;
  updatedAt: string;
}

// Removed unused sample city data to satisfy lint rules

interface City {
  _id: string;
  name: string;
  slug: string;
  country: string | { _id: string; name: string };
  state: string | { _id: string; name: string };
  state_name?: string;
  country_name?: string;
  longitude?: number;
  latitude?: number;
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
  // State variables
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]); // For autocomplete dropdown
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pageAccess, setPageAccess] = useState<string>('no access');
  
  useEffect(() => {
    const access = getCityPagePermission();
    setPageAccess(access);

    if (access === 'no access') {
      setError('You do not have permission to access this page');
    }
  }, []);

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  
  const [form, setForm] = useState<CityFormData>({
    name: '',
    slug: '',
    country: '',
    state: '',
    country_name: '',
    state_name: '',
    longitude: undefined,
    latitude: undefined
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
      
      // Sort countries alphabetically by name
      countriesData.sort((a: CountryOption, b: CountryOption) => a.name.localeCompare(b.name));
      
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
      console.log('States API response:', response);
      
      let statesData: StateOption[] = [];
      if (response && response.status === 'success' && response.data && Array.isArray(response.data.states)) {
        statesData = response.data.states;
      } else if (Array.isArray(response)) {
        statesData = response;
      } else if (response && response.data) {
        statesData = response.data.states || [];
      }
      
      // Sort states alphabetically by name
      statesData.sort((a: StateOption, b: StateOption) => a.name.localeCompare(b.name));
      
      console.log('Processed states data:', statesData);
      setStates(statesData);
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  }, []);

  // Fetch city suggestions for autocomplete based on country/state
  const fetchCitySuggestions = useCallback(async (countryId: string, stateId?: string) => {
    try {
      const queryParams = new URLSearchParams({
        limit: '100', // Get more cities for suggestions
      });
      
      if (stateId) {
        queryParams.append('state', stateId);
      } else if (countryId) {
        queryParams.append('country', countryId);
      }
      
      const res = await apiFetch(`/cities?${queryParams}`);
      const response = await res.json();
      
      if (response && response.status === 'success' && response.data) {
        const citiesData = response.data.cities || [];
        // Sort cities alphabetically by name
        citiesData.sort((a: City, b: City) => a.name.localeCompare(b.name));
        setCitySuggestions(citiesData);
      }
    } catch (error) {
      console.error('Failed to fetch city suggestions:', error);
      setCitySuggestions([]);
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
    const selectedCountry = countries.find(c => c._id === countryId);
    console.log('Selected country ID:', countryId);
    console.log('Selected country name:', selectedCountry?.name);
    
    // Log all states for debugging
    console.log('All states:', states);
    const filteredStates = states.filter(state => state.country === countryId);
    console.log('Filtered states for country', countryId, ':', filteredStates);
    
    setForm(prev => ({
      ...prev,
      country: countryId,
      country_name: selectedCountry?.name || '',
      // Reset state when country changes
      state: '',
      state_name: ''
    }));
    
    // Fetch city suggestions for the selected country
    fetchCitySuggestions(countryId);
  };

  // Handle state change
  const handleStateChange = (stateId: string) => {
    const selectedState = states.find(s => s._id === stateId);
    if (!selectedState) {
      // If state is cleared, fetch cities for country only
      if (form.country) {
        fetchCitySuggestions(form.country);
      }
      return;
    }
    
    // Get the country ID whether it's a string or object
    const countryId = selectedState.country && typeof selectedState.country === 'object' 
      ? (selectedState.country as { _id: string })._id 
      : selectedState.country as string;
    
    const countryName = selectedState.country && typeof selectedState.country === 'object'
      ? (selectedState.country as { name?: string }).name || ''
      : countries.find(c => c._id === countryId)?.name || '';
      
    setForm(prev => ({
      ...prev,
      state: stateId,
      state_name: selectedState.name || '',
      country: countryId,
      country_name: countryName,
      // Reset coordinates when state changes
      longitude: undefined,
      latitude: undefined
    }));
    
    // Fetch city suggestions for the selected state
    fetchCitySuggestions(countryId, stateId);
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

  // Add loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate required fields - only name and country are required
      if (!form.name || !form.country) {
        throw new Error('Name and country are required fields');
      }

      const url = editId ? `/cities/${editId}` : '/cities';
      const method = editId ? 'PUT' : 'POST';
      
// Define a type for the form data being sent to the API
      type CityFormSubmitData = {
        name: string;
        slug: string;
        country: string;
        state?: string;
        longitude?: number;
        latitude?: number;
      };

      // Prepare form data
      const formData: CityFormSubmitData = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/\s+/g, '-'),
        country: form.country,
      };

      // Only include state if it's not empty
      if (form.state && form.state.trim()) {
        formData.state = form.state;
      }

      // Handle number fields with proper type conversion
      if (form.longitude !== undefined) {
        formData.longitude = typeof form.longitude === 'string' ? 
          (form.longitude ? parseFloat(form.longitude) : undefined) : 
          form.longitude;
      }
      if (form.latitude !== undefined) {
        formData.latitude = typeof form.latitude === 'string' ? 
          (form.latitude ? parseFloat(form.latitude) : undefined) : 
          form.latitude;
      }

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save city');
      }

      const result = await res.json();
      
      // Handle successful response
      const updatedCity = result.data?.city || result.data;
      if (!updatedCity) {
        throw new Error('Invalid response from server');
      }

      // Show success message
      setSnackbar({
        open: true,
        message: editId ? 'City updated successfully' : 'City created successfully',
        severity: 'success'
      });
      
      // Reset form and refresh the list
      resetForm();
      fetchCities(pagination.page, searchTerm);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save city';
      setError(errorMessage);
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view button click
  const handleView = (city: City) => {
    setSelectedCity(city);
    setViewDialogOpen(true);
  };

  // Handle edit button click
  const handleEdit = (city: City) => {
    try {
      // Safely extract country and state information
      const countryId = typeof city.country === 'string' ? city.country : city.country?._id || '';
      const stateId = typeof city.state === 'string' ? city.state : city.state?._id || '';
      
      const countryName = (city.country && typeof city.country === 'object') ? 
        city.country.name : (city.country_name || '');
        
      const stateName = (city.state && typeof city.state === 'object') ? 
        city.state.name : (city.state_name || '');

      // Update form state
      setForm({
        name: city.name || '',
        slug: city.slug || '',
        country: countryId,
        state: stateId,
        country_name: countryName,
        state_name: stateName,
        longitude: city.longitude,
        latitude: city.latitude
      });
      
      // Fetch city suggestions based on state or country
      if (stateId && countryId) {
        fetchCitySuggestions(countryId, stateId);
      } else if (countryId) {
        fetchCitySuggestions(countryId);
      }
      
      setEditId(city._id);
      setOpenForm(true);
    } catch (error) {
      console.error('Error in handleEdit:', error);
      setError('Failed to load city data for editing');
    }
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

  // Close view dialog
  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedCity(null);
  };

  // Reset form function with useCallback to prevent recreating the function
  const resetForm = useCallback(() => {
    setForm({
      name: '',
      slug: '',
      country: '',
      state: '',
      country_name: '',
      state_name: '',
      longitude: undefined,
      latitude: undefined
    });
    setEditId(null);
    setOpenForm(false);
    setError(null);
  }, []);

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
                    <TableCell>Longitude</TableCell>
                    <TableCell>Latitude</TableCell>
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
                        <TableCell>{city.longitude ?? '-'}</TableCell>
                        <TableCell>{city.latitude ?? '-'}</TableCell>
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
                          <IconButton
                            color="info"
                            onClick={() => handleView(city)}
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
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
                id="country-select"
                onOpen={fetchCountries}
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
                    required
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option._id}>
                    {option.name}
                  </li>
                )}
              />
              
              <Autocomplete
                onOpen={fetchStates}
                options={states}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option.name;
                }}
                filterOptions={(options) => {
                  if (!form.country) {
                    console.log('No country selected, returning all states');
                    return options;
                  }
                  const filtered = options.filter(option => {
                    // Handle both cases where country is a string or an object
                    const countryId = typeof option.country === 'object' ? option.country?._id : option.country;
                    const matches = countryId === form.country;
                    console.log(`State: ${option.name}, Country:`, option.country, 'Matches:', matches);
                    return matches;
                  });
                  console.log('Filtered states:', filtered);
                  return filtered;
                }}
                value={form.state ? states.find(s => s._id === form.state) || null : null}
                onChange={(_, newValue) => {
                  if (newValue && typeof newValue !== 'string') {
                    handleStateChange(newValue._id);
                  } else {
                    setForm(prev => ({ ...prev, state: '', state_name: '' }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="State (Optional)"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    helperText={!form.country ? 'Select a country to filter states' : 'Optional - select to filter cities by state'}
                  />
                )}
                noOptionsText={form.country ? 'No states found for this country' : 'No states available'}
              />
              
              <Autocomplete
                freeSolo
                options={citySuggestions}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option.name;
                }}
                value={form.name}
                onChange={(_, newValue) => {
                  if (newValue && typeof newValue !== 'string') {
                    // When a city is selected, update the form with its details
                    const cityName = typeof newValue === 'string' ? newValue : newValue.name;
                    const citySlug = typeof newValue === 'string' 
                      ? cityName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                      : newValue.slug || '';
                    
                    setForm(prev => ({
                      ...prev,
                      name: cityName,
                      slug: citySlug,
                      // Set coordinates when a city is selected
                      longitude: newValue.longitude,
                      latitude: newValue.latitude
                    }));
                  } else if (newValue) {
                    // When typing manually
                    setForm(prev => ({
                      ...prev,
                      name: newValue,
                      slug: newValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
                      // Clear coordinates when manually typing
                      longitude: undefined,
                      latitude: undefined
                    }));
                  }
                }}
                onInputChange={(_, newInputValue) => {
                  setForm(prev => ({
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
                    required
                    autoFocus
                    placeholder={!form.country 
                      ? 'Please select country first' 
                      : form.state 
                        ? 'Type or select a city in selected state...'
                        : 'Type or select a city in selected country...'}
                    disabled={!form.country}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={typeof option === 'string' ? option : option._id}>
                    {typeof option === 'string' ? option : option.name}
                  </li>
                )}
                noOptionsText={!form.country 
                  ? 'Please select country first' 
                  : form.state
                    ? 'No cities found in selected state. You can type a new city name.'
                    : 'No cities found in selected country. You can type a new city name.'}
                disabled={!form.country}
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
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="longitude"
                  label="Longitude"
                  name="longitude"
                  type="number"
                  inputProps={{
                    step: '0.000001',
                    min: -180,
                    max: 180
                  }}
                  value={form.longitude ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                    setForm(prev => ({
                      ...prev,
                      longitude: value
                    }));
                  }}
                  helperText="Value between -180 and 180"
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  id="latitude"
                  label="Latitude"
                  name="latitude"
                  type="number"
                  inputProps={{
                    step: '0.000001',
                    min: -90,
                    max: 90
                  }}
                  value={form.latitude ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                    setForm(prev => ({
                      ...prev,
                      latitude: value
                    }));
                  }}
                  helperText="Value between -90 and 90"
                />
              </Box>
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

        {/* View City Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={handleCloseViewDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>City Details</DialogTitle>
          <DialogContent>
            {selectedCity && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                  <Typography variant="body1">{selectedCity.name || '-'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Slug</Typography>
                  <Typography variant="body1">{selectedCity.slug || '-'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">State</Typography>
                  <Typography variant="body1">
                    {selectedCity.state && typeof selectedCity.state === 'object' 
                      ? selectedCity.state.name 
                      : selectedCity.state_name || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Country</Typography>
                  <Typography variant="body1">
                    {selectedCity.country && typeof selectedCity.country === 'object' 
                      ? selectedCity.country.name 
                      : selectedCity.country_name || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
                  <Typography variant="body1">
                    {selectedCity.createdAt 
                      ? new Date(selectedCity.createdAt).toLocaleString() 
                      : 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Last Updated</Typography>
                  <Typography variant="body1">
                    {selectedCity.updatedAt 
                      ? new Date(selectedCity.updatedAt).toLocaleString() 
                      : 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Longitude</Typography>
                  <Typography variant="body1">
                    {selectedCity.longitude !== undefined ? selectedCity.longitude : 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Latitude</Typography>
                  <Typography variant="body1">
                    {selectedCity.latitude !== undefined ? selectedCity.latitude : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseViewDialog} color="primary">
              Close
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
