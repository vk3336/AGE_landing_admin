"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useRouter } from 'next/navigation';
// Import a comprehensive list of countries
import countriesData from 'world-countries';

// Define TypeScript interfaces for our state data
interface StateData {
  name: string;
  code: string;
  country: string;
  country_code: string;
}

// Interface for country data from world-countries
interface WorldCountry {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  cca3: string;
  flag: string;
  region: string;
  subregion?: string;
  idd: {
    root: string;
    suffixes: string[];
  };
  // Add other properties as needed
}
import apiFetch from '../../utils/apiFetch';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField,
  IconButton, Alert, Snackbar, CircularProgress, Container, Typography, Autocomplete
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';

interface State {
  _id?: string;
  name: string;
  code: string;
  country: string | { _id: string; name: string };
  slug?: string;
}

interface Country {
  _id: string;
  name: string;
  code: string;
  slug: string;
}

interface StateItem {
  name: string;
  state_code: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CountryItem {
  name: string;
  iso2: string;
  states: StateItem[];
}

interface FormState {
  name: string;
  code: string;
  country: string;  // This will store the country ID
  country_name?: string;  // For display purposes
  country_code?: string;
  slug?: string;
}

// Get all states from a comprehensive list
const getAllStates = (): StateData[] => {
  const allStates: StateData[] = [];
  
  // Add US states
  const usStates = [
    { name: 'Alabama', code: 'AL' },
    { name: 'Alaska', code: 'AK' },
    { name: 'Arizona', code: 'AZ' },
    { name: 'Arkansas', code: 'AR' },
    { name: 'California', code: 'CA' },
    { name: 'Colorado', code: 'CO' },
    { name: 'Connecticut', code: 'CT' },
    { name: 'Delaware', code: 'DE' },
    { name: 'Florida', code: 'FL' },
    { name: 'Georgia', code: 'GA' },
    { name: 'Hawaii', code: 'HI' },
    { name: 'Idaho', code: 'ID' },
    { name: 'Illinois', code: 'IL' },
    { name: 'Indiana', code: 'IN' },
    { name: 'Iowa', code: 'IA' },
    { name: 'Kansas', code: 'KS' },
    { name: 'Kentucky', code: 'KY' },
    { name: 'Louisiana', code: 'LA' },
    { name: 'Maine', code: 'ME' },
    { name: 'Maryland', code: 'MD' },
    { name: 'Massachusetts', code: 'MA' },
    { name: 'Michigan', code: 'MI' },
    { name: 'Minnesota', code: 'MN' },
    { name: 'Mississippi', code: 'MS' },
    { name: 'Missouri', code: 'MO' },
    { name: 'Montana', code: 'MT' },
    { name: 'Nebraska', code: 'NE' },
    { name: 'Nevada', code: 'NV' },
    { name: 'New Hampshire', code: 'NH' },
    { name: 'New Jersey', code: 'NJ' },
    { name: 'New Mexico', code: 'NM' },
    { name: 'New York', code: 'NY' },
    { name: 'North Carolina', code: 'NC' },
    { name: 'North Dakota', code: 'ND' },
    { name: 'Ohio', code: 'OH' },
    { name: 'Oklahoma', code: 'OK' },
    { name: 'Oregon', code: 'OR' },
    { name: 'Pennsylvania', code: 'PA' },
    { name: 'Rhode Island', code: 'RI' },
    { name: 'South Carolina', code: 'SC' },
    { name: 'South Dakota', code: 'SD' },
    { name: 'Tennessee', code: 'TN' },
    { name: 'Texas', code: 'TX' },
    { name: 'Utah', code: 'UT' },
    { name: 'Vermont', code: 'VT' },
    { name: 'Virginia', code: 'VA' },
    { name: 'Washington', code: 'WA' },
    { name: 'West Virginia', code: 'WV' },
    { name: 'Wisconsin', code: 'WI' },
    { name: 'Wyoming', code: 'WY' },
  ];

  // Add Indian states
  const indianStates = [
    { name: 'Andhra Pradesh', code: 'AP' },
    { name: 'Arunachal Pradesh', code: 'AR' },
    { name: 'Assam', code: 'AS' },
    { name: 'Bihar', code: 'BR' },
    { name: 'Chhattisgarh', code: 'CG' },
    { name: 'Goa', code: 'GA' },
    { name: 'Gujarat', code: 'GJ' },
    { name: 'Haryana', code: 'HR' },
    { name: 'Himachal Pradesh', code: 'HP' },
    { name: 'Jharkhand', code: 'JH' },
    { name: 'Karnataka', code: 'KA' },
    { name: 'Kerala', code: 'KL' },
    { name: 'Madhya Pradesh', code: 'MP' },
    { name: 'Maharashtra', code: 'MH' },
    { name: 'Manipur', code: 'MN' },
    { name: 'Meghalaya', code: 'ML' },
    { name: 'Mizoram', code: 'MZ' },
    { name: 'Nagaland', code: 'NL' },
    { name: 'Odisha', code: 'OD' },
    { name: 'Punjab', code: 'PB' },
    { name: 'Rajasthan', code: 'RJ' },
    { name: 'Sikkim', code: 'SK' },
    { name: 'Tamil Nadu', code: 'TN' },
    { name: 'Telangana', code: 'TS' },
    { name: 'Tripura', code: 'TR' },
    { name: 'Uttar Pradesh', code: 'UP' },
    { name: 'Uttarakhand', code: 'UK' },
    { name: 'West Bengal', code: 'WB' },
  ];

  // Add other countries' states/regions
  const otherStates = [
    // Canada
    { name: 'Alberta', code: 'AB', country: 'Canada', country_code: 'CA' },
    { name: 'British Columbia', code: 'BC', country: 'Canada', country_code: 'CA' },
    { name: 'Manitoba', code: 'MB', country: 'Canada', country_code: 'CA' },
    { name: 'New Brunswick', code: 'NB', country: 'Canada', country_code: 'CA' },
    { name: 'Newfoundland and Labrador', code: 'NL', country: 'Canada', country_code: 'CA' },
    { name: 'Northwest Territories', code: 'NT', country: 'Canada', country_code: 'CA' },
    { name: 'Nova Scotia', code: 'NS', country: 'Canada', country_code: 'CA' },
    { name: 'Nunavut', code: 'NU', country: 'Canada', country_code: 'CA' },
    { name: 'Ontario', code: 'ON', country: 'Canada', country_code: 'CA' },
    { name: 'Prince Edward Island', code: 'PE', country: 'Canada', country_code: 'CA' },
    { name: 'Quebec', code: 'QC', country: 'Canada', country_code: 'CA' },
    { name: 'Saskatchewan', code: 'SK', country: 'Canada', country_code: 'CA' },
    { name: 'Yukon', code: 'YT', country: 'Canada', country_code: 'CA' },
    
    // United Kingdom
    { name: 'England', code: 'ENG', country: 'United Kingdom', country_code: 'GB' },
    { name: 'Scotland', code: 'SCT', country: 'United Kingdom', country_code: 'GB' },
    { name: 'Wales', code: 'WLS', country: 'United Kingdom', country_code: 'GB' },
    { name: 'Northern Ireland', code: 'NIR', country: 'United Kingdom', country_code: 'GB' },
    
    // Australia
    { name: 'Australian Capital Territory', code: 'ACT', country: 'Australia', country_code: 'AU' },
    { name: 'New South Wales', code: 'NSW', country: 'Australia', country_code: 'AU' },
    { name: 'Northern Territory', code: 'NT', country: 'Australia', country_code: 'AU' },
    { name: 'Queensland', code: 'QLD', country: 'Australia', country_code: 'AU' },
    { name: 'South Australia', code: 'SA', country: 'Australia', country_code: 'AU' },
    { name: 'Tasmania', code: 'TAS', country: 'Australia', country_code: 'AU' },
    { name: 'Victoria', code: 'VIC', country: 'Australia', country_code: 'AU' },
    { name: 'Western Australia', code: 'WA', country: 'Australia', country_code: 'AU' },
  ];

  // Add US states with country info
  usStates.forEach(state => {
    allStates.push({
      ...state,
      country: 'United States',
      country_code: 'US'
    });
  });

  // Add Indian states with country info
  indianStates.forEach(state => {
    allStates.push({
      ...state,
      country: 'India',
      country_code: 'IN'
    });
  });

  // Add other states
  allStates.push(...otherStates);

  // Add countries as fallback for states we don't have data for
  (countriesData as unknown as WorldCountry[]).forEach((country) => {
    // Only add if we don't already have states for this country
    if (!allStates.some(s => s.country_code === country.cca2)) {
      allStates.push({
        name: country.name.common,
        code: country.cca2,
        country: country.name.common,
        country_code: country.cca2
      });
    }
  });

  console.log(`Loaded ${allStates.length} states/provinces/regions`);
  return allStates;
};

function getStatePagePermission() {
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

export default function StatePage() {
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [states, setStates] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const access = getStatePagePermission();
    setPageAccess(access);
  }, []);

  useEffect(() => {
    const access = getStatePagePermission();
    setPageAccess(access);
  }, []);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const allStates = useMemo(() => {
    try {
      console.log('Loading states...');
      const loadedStates = getAllStates();
      console.log('Loaded states:', loadedStates);
      
      if (loadedStates.length === 0) {
        console.warn('No states were loaded. The state-list package might not be working correctly.');
        // Return some default states if loading from state-list fails
        const defaultStates = [
          { name: 'Maharashtra', code: 'MH', country: 'India', country_code: 'IN' },
          { name: 'California', code: 'CA', country: 'United States', country_code: 'US' },
          { name: 'England', code: 'ENG', country: 'United Kingdom', country_code: 'GB' },
        ];
        console.log('Using default states:', defaultStates);
        return defaultStates;
      }
      return loadedStates;
    } catch (error) {
      console.error('Error loading states:', error);
      // Return default states if there's an error
      return [
        { name: 'Maharashtra', code: 'MH', country: 'India', country_code: 'IN' },
        { name: 'California', code: 'CA', country: 'United States', country_code: 'US' },
        { name: 'England', code: 'ENG', country: 'United Kingdom', country_code: 'GB' },
      ];
    }
  }, []);

  const [form, setForm] = useState<FormState>({ 
    name: '', 
    code: '', 
    country: '',
    country_name: '',
    country_code: '',
    slug: ''
  });
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [viewOnly] = useState(false);

  // Fetch states
  const fetchStates = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching states from API...');
      const res = await apiFetch('/states');
      const response = await res.json();
      console.log('API response:', response);
      
      // Handle the response structure: { status: 'success', results: number, data: { states: [...] } }
      let statesData = [];
      if (response && response.status === 'success' && response.data && Array.isArray(response.data.states)) {
        statesData = response.data.states;
      } else if (Array.isArray(response)) {
        statesData = response;
      } else if (response && Array.isArray(response.data)) {
        statesData = response.data;
      } else if (response && response.states) {
        statesData = response.states;
      } else if (response && response.data && response.data.states) {
        statesData = response.data.states;
      }
      
      console.log('Processed states data:', statesData);
      setStates(statesData);
    } catch (error: unknown) {
      let errorMessage = 'Failed to load states';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      setError(errorMessage);
      console.error('Error fetching states:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch countries from API
  const fetchCountries = useCallback(async () => {
    try {
      const res = await apiFetch('/countries');
      const response = await res.json();
      console.log('Countries API response:', response);
      
      // Handle different response structures
      let countriesData = [];
      if (response && response.status === 'success' && response.data && Array.isArray(response.data.countries)) {
        countriesData = response.data.countries;
      } else if (Array.isArray(response)) {
        countriesData = response;
      } else if (response && response.data) {
        countriesData = response.data.countries || [];
      }
      
      console.log('Processed countries data:', countriesData);
      setCountries(countriesData);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  }, []);

  useEffect(() => {
    fetchStates();
    fetchCountries();
  }, [fetchCountries, fetchStates]);

  const handleStateChange = (event: React.SyntheticEvent, value: StateData | null) => {
    if (!value) return;
    
    const selectedState = allStates.find(s => s.name === value.name);
    if (selectedState) {
      const slug = selectedState.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

      setForm(prev => ({
        ...prev,
        name: selectedState.name,
        code: selectedState.code,
        country: selectedState.country,
        country_name: selectedState.country,
        country_code: selectedState.country_code,
        slug: slug
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const url = editId ? `/states/${editId}` : '/states';
      const method = editId ? 'PUT' : 'POST';
      
      // Define interface for form submission data
      interface FormSubmissionData {
        name: string;
        code: string;
        slug: string;
        country?: string;
      }

      // Prepare data for submission
      const formData: FormSubmissionData = {
        name: form.name.trim(),
        code: form.code.trim(),
        slug: form.slug?.trim() || form.name.toLowerCase().replace(/\s+/g, '-')
      };

      // Only include country if it's a valid ObjectId
      if (form.country) {
        // If country is an ObjectId string, use it directly
        if (/^[0-9a-fA-F]{24}$/.test(form.country)) {
          formData.country = form.country;
        } 
        // If it's a country name, try to find the corresponding country
        else if (form.country_name) {
          const foundCountry = countries.find(c => c.name === form.country_name);
          if (foundCountry) {
            formData.country = foundCountry._id;
          }
        }
      }
      
      console.log('Submitting form data:', formData);
      
      console.log('Submitting form data:', formData);
      
      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      console.log('Submit response:', result);

      if (!res.ok) {
        throw new Error(result.message || 'Failed to save state');
      }
      
      setSnackbar({
        open: true,
        message: editId ? 'State updated successfully' : 'State added successfully',
        severity: 'success'
      });
      
      setOpenForm(false);
      fetchStates();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save state';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleEdit = useCallback((state: State) => {
    if (viewOnly) return;
    
    setForm({
      name: state.name,
      code: state.code,
      country: typeof state.country === 'object' ? state.country._id : state.country,
      country_name: typeof state.country === 'object' ? state.country.name : '',
      country_code: '',
      slug: state.slug || ''
    });
    
    setEditId(state._id || null);
    setOpenForm(true);
  }, [viewOnly]);
  
  const handleDeleteClick = useCallback((id: string) => {
    if (viewOnly) return;
    setDeleteId(id);
    setDeleteError(null);
  }, [viewOnly]);
  
  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteId(null);
    setDeleteError(null);
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setDeleteSubmitting(true);
      setDeleteError(null);
      console.log('Deleting state with ID:', deleteId);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/states/${deleteId}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.NEXT_PUBLIC_API_KEY_NAME && process.env.NEXT_PUBLIC_API_SECRET_KEY ? {
            [process.env.NEXT_PUBLIC_API_KEY_NAME]: process.env.NEXT_PUBLIC_API_SECRET_KEY
          } : {})
        },
      });
      
      const data = await res.json();
      console.log('Delete response:', data);
      
      if (res.ok) {
        setSnackbar({
          open: true,
          message: data.message || 'State deleted successfully',
          severity: 'success'
        });
        
        // Refresh the states list
        await fetchStates();
        handleCloseDeleteDialog();
        return;
      }
      
      // Handle error responses
      let errorMessage = data?.message || 'Failed to delete state';
      
      // Show specific error message for in-use states
      if (res.status === 400 && errorMessage.includes('being used by other records')) {
        errorMessage = 'Cannot delete state because it is being used by one or more cities or locations';
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
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting the state';
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">States</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setForm({ name: '', code: '', country: '' });
            setEditId(null);
            setOpenForm(true);
          }}
          disabled={pageAccess === 'only view'}
        >
          Add State
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {states.map((state) => (
              <TableRow key={state._id}>
                <TableCell>{state.name}</TableCell>
                <TableCell>{state.code}</TableCell>
                <TableCell>{state.slug || '-'}</TableCell>
                <TableCell>{
                  typeof state.country === 'object' 
                    ? state.country.name 
                    : (countries.find(c => c._id === state.country)?.name || state.country)
                }</TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleEdit(state)}
                    disabled={pageAccess === 'only view'}
                  >
                    <EditIcon color={pageAccess === 'only view' ? 'disabled' : 'inherit'} />
                  </IconButton>
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(state._id || '');
                    }}
                    disabled={pageAccess === 'only view' || deleteSubmitting}
                  >
                    <DeleteIcon color={pageAccess === 'only view' || deleteSubmitting ? 'disabled' : 'error'} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* State Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editId ? 'Edit State' : 'Add New State'}</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Autocomplete
              options={Array.from(new Set(allStates.map(s => s.name)))}
              value={form.name}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleStateChange(event, { name: newValue, code: '', country: '', country_code: '' });
                } else {
                  setForm(prev => ({
                    ...prev,
                    name: '',
                    code: '',
                    slug: ''
                  }));
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select State"
                  margin="normal"
                  required
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                  }}
                />
              )}
            />
            <TextField
              label="Code"
              fullWidth
              margin="normal"
              value={form.code}
              onChange={(e) => setForm({...form, code: e.target.value})}
              inputProps={{ maxLength: 3, readOnly: true }}
              required
              variant="filled"
            />
            <Autocomplete
              options={countries}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              value={countries.find(c => c._id === form.country) || null}
              onChange={(_, newValue) => {
                setForm({
                  ...form,
                  country: newValue?._id || '',
                  country_name: newValue?.name,
                  country_code: newValue?.code
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Country (Optional)"
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                  }}
                  helperText="Leave empty if not applicable"
                />
              )}
            />
            <TextField
              label="Slug"
              fullWidth
              margin="normal"
              value={form.slug || ''}
              onChange={(e) => {
                const newSlug = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, '-') // Only allow letters, numbers, and hyphens
                  .replace(/-+/g, '-') // Replace multiple hyphens with single
                  .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
                
                setForm(prev => ({
                  ...prev,
                  slug: newSlug
                }));
              }}
              placeholder="e.g., california, new-york"
              helperText="Auto-generated if left empty. Use lowercase with hyphens (e.g., new-york)"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                },
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  color: form.slug ? 'text.primary' : 'text.secondary',
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editId ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete State</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this state? This action cannot be undone.
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDeleteDialog}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        message={snackbar.message}
      />
    </Container>
  );
}
