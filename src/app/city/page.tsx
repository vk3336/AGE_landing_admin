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
  pincode: string;
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
  pincode: string;
  country: string;
  state: string;
  country_name?: string;
  state_name?: string;
};

interface City {
  _id: string;
  name: string;
  slug: string;
  pincode: string;
  country: string | { _id: string; name: string };
  state: string | { _id: string; name: string };
  state_name?: string;
  country_name?: string;
  createdAt: string;
  updatedAt: string;
}

// Sample city data
const sampleCities: CityOption[] = [
    { name: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    { name: 'Delhi', state: 'Delhi', pincode: '110001' },
    { name: 'Bangalore', state: 'Karnataka', pincode: '560001' },
    { name: 'Hyderabad', state: 'Telangana', pincode: '500001' },
    { name: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
    { name: 'Kolkata', state: 'West Bengal', pincode: '700001' },
    { name: 'Ahmedabad', state: 'Gujarat', pincode: '380001' },
    { name: 'Pune', state: 'Maharashtra', pincode: '411001' },
    { name: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
    { name: 'Lucknow', state: 'Uttar Pradesh', pincode: '226001' },
    { name: 'Kanpur', state: 'Uttar Pradesh', pincode: '208001' },
    { name: 'Nagpur', state: 'Maharashtra', pincode: '440001' },
    { name: 'Indore', state: 'Madhya Pradesh', pincode: '452001' },
    { name: 'Bhopal', state: 'Madhya Pradesh', pincode: '462001' },
    { name: 'Patna', state: 'Bihar', pincode: '800001' },
    { name: 'Ludhiana', state: 'Punjab', pincode: '141001' },
    { name: 'Agra', state: 'Uttar Pradesh', pincode: '282001' },
    { name: 'Varanasi', state: 'Uttar Pradesh', pincode: '221001' },
    { name: 'Amritsar', state: 'Punjab', pincode: '143001' },
    { name: 'Coimbatore', state: 'Tamil Nadu', pincode: '641001' },
    { name: 'Thiruvananthapuram', state: 'Kerala', pincode: '695001' },
    { name: 'Kochi', state: 'Kerala', pincode: '682001' },
    { name: 'Surat', state: 'Gujarat', pincode: '395003' },
    { name: 'Rajkot', state: 'Gujarat', pincode: '360001' },
    { name: 'Ranchi', state: 'Jharkhand', pincode: '834001' },
    { name: 'Guwahati', state: 'Assam', pincode: '781001' },
    { name: 'Dehradun', state: 'Uttarakhand', pincode: '248001' },
    { name: 'Shimla', state: 'Himachal Pradesh', pincode: '171001' },
    { name: 'Panaji', state: 'Goa', pincode: '403001' },
    { name: 'Shillong', state: 'Meghalaya', pincode: '793001' }
];

interface City {
  _id: string;
  name: string;
  slug: string;
  pincode: string;
  country: string | { _id: string; name: string };
  state: string | { _id: string; name: string };
  state_name?: string;
  country_name?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CityPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);
  
  const [form, setForm] = useState<CityFormData>({
    name: '',
    slug: '',
    pincode: '',
    country: '',
    state: '',
    country_name: '',
    state_name: ''
  });
  
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _router = useRouter();

  // Fetch cities
  const fetchCities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/cities');
      const response = await res.json();
      
      let citiesData: City[] = [];
      if (response && response.status === 'success' && response.data && Array.isArray(response.data.cities)) {
        citiesData = response.data.cities;
      } else if (Array.isArray(response)) {
        citiesData = response;
      } else if (response && response.data) {
        citiesData = response.data.cities || [];
      }
      
      setCities(citiesData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load cities';
      setError(errorMessage);
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Load initial data
  useEffect(() => {
    fetchCities();
    fetchCountries();
    fetchStates();
  }, [fetchCities, fetchCountries, fetchStates]);

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
        pincode: selectedCity.pincode,
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
      if (form.pincode) formData.pincode = form.pincode.trim();
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
      fetchCities();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save city';
      setError(errorMessage);
      console.error('Error saving city:', error);
    }
  };

  // Handle edit button click
  const handleEdit = (city: City) => {
    setForm({
      name: city.name,
      slug: city.slug,
      pincode: city.pincode || '',
      country: typeof city.country === 'string' ? city.country : city.country._id,
      state: typeof city.state === 'string' ? city.state : city.state._id,
      country_name: typeof city.country === 'string' ? '' : city.country.name,
      state_name: typeof city.state === 'string' ? '' : city.state.name
    });
    setEditId(city._id);
    setOpenForm(true);
    
    // No need to fetch states here as we're loading all states at once
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
        fetchCities();
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
      pincode: '',
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

        {/* Loading state */}
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Cities table */}
        {!loading && !error && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Pincode</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cities.length > 0 ? (
                  cities.map((city) => (
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
                      <TableCell>{city.pincode || '-'}</TableCell>
                      <TableCell>{city.slug || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(city)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(city._id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No cities found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
              
              <TextField
                margin="normal"
                fullWidth
                id="pincode"
                label="Pincode"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
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
