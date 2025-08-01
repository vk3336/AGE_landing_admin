"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField,
  IconButton, Alert, Snackbar, CircularProgress, Container, Typography, Autocomplete
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import apiFetch from '../../utils/apiFetch';

// Location data with name, slug, and pincode
const locationData = [
  {
    "name":"Navrangpura",
    "slug":"navrangpura",
    "pincode":"380009"
  },
  {
    "name":"Maninagar",
    "slug":"maninagar",
    "pincode":"380008"
  },
  {
    "name":"Satellite",
    "slug":"satellite",
    "pincode":"380015"
  },
  {
    "name":"Bopal",
    "slug":"bopal",
    "pincode":"380058"
  },
  {
    "name":"Vastrapur",
    "slug":"vastrapur",
    "pincode":"380015"
  },
  {
    "name":"Paldi",
    "slug":"paldi",
    "pincode":"380007"
  },
  {
    "name":"Thaltej",
    "slug":"thaltej",
    "pincode":"380059"
  },
  {
    "name":"Andheri West",
    "slug":"andheri-west",
    "pincode":"400058"
  },
  {
    "name":"Andheri East",
    "slug":"andheri-east",
    "pincode":"400069"
  },
  {
    "name":"Bandra West",
    "slug":"bandra-west",
    "pincode":"400050"
  },
  {
    "name":"Powai",
    "slug":"powai",
    "pincode":"400076"
  },
  {
    "name":"Colaba",
    "slug":"colaba",
    "pincode":"400005"
  },
  {
    "name":"Malad West",
    "slug":"malad-west",
    "pincode":"400064"
  },
  {
    "name":"Borivali East",
    "slug":"borivali-east",
    "pincode":"400066"
  },
  {
    "name":"Connaught Place",
    "slug":"connaught-place",
    "pincode":"110001"
  },
  {
    "name":"Lajpat Nagar",
    "slug":"lajpat-nagar",
    "pincode":"110024"
  },
  {
    "name":"Dwarka",
    "slug":"dwarka",
    "pincode":"110075"
  },
  {
    "name":"Saket",
    "slug":"saket",
    "pincode":"110017"
  },
  {
    "name":"Karol Bagh",
    "slug":"karol-bagh",
    "pincode":"110005"
  },
  {
    "name":"Rohini",
    "slug":"rohini",
    "pincode":"110085"
  },
  {
    "name":"Mayur Vihar",
    "slug":"mayur-vihar",
    "pincode":"110091"
  },
  {
    "name":"C-Scheme",
    "slug":"c-scheme",
    "pincode":"302001"
  },
  {
    "name":"Malviya Nagar",
    "slug":"malviya-nagar",
    "pincode":"302017"
  },
  {
    "name":"Vaishali Nagar",
    "slug":"vaishali-nagar",
    "pincode":"302021"
  },
  {
    "name":"Jhotwara",
    "slug":"jhotwara",
    "pincode":"302012"
  },
  {
    "name":"Mansarovar",
    "slug":"mansarovar",
    "pincode":"302020"
  },
  {
    "name":"Hiran Magri",
    "slug":"hiran-magri",
    "pincode":"313001"
  },
  {
    "name":"Bapu Nagar",
    "slug":"bapu-nagar",
    "pincode":"302015"
  }
];

// Define TypeScript interfaces for our data
interface Location {
  _id: string;
  name: string;
  slug: string;
  pincode: string;
  country: string | { _id: string; name: string };
  state: string | { _id: string; name: string };
  city: string | { _id: string; name: string };
  timezone: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

interface Country {
  _id: string;
  name: string;
  code: string;
}

interface State {
  _id: string;
  name: string;
  code: string;
}

interface City {
  _id: string;
  name: string;
  pincode: string;
  state: string | { _id: string; name: string };
}

interface FormState {
  name: string;
  slug: string;
  pincode: string;
  country: string;
  state: string;
  city: string;
  timezone: string;
  language: string;
  country_name?: string;
  state_name?: string;
  city_name?: string;
}

export default function LocationPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '',
    slug: '',
    pincode: '',
    country: '',
    state: '',
    city: '',
    timezone: '',
    language: '',
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  // Snackbar state
  interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }

  // Form and UI state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Data state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('Countries updated:', countries);
  }, [countries]);

  useEffect(() => {
    console.log('States updated:', states);
  }, [states]);

  useEffect(() => {
    console.log('Cities updated:', cities);
  }, [cities]);

  useEffect(() => {
    console.log('Locations updated:', locations);
  }, [locations]);

  // Fetch locations
  const fetchLocations = useCallback(async () => {
    try {
      console.log('Fetching locations...');
      const res = await apiFetch('/locations');
      const response = await res.json();
      console.log('Locations API Response:', response);
      
      let locationsData: Location[] = [];
      if (response && response.status === 'success' && response.data && Array.isArray(response.data.locations)) {
        locationsData = response.data.locations;
      } else if (Array.isArray(response)) {
        locationsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        locationsData = response.data;
      } else if (response && response.data && response.data.locations) {
        locationsData = response.data.locations;
      }
      
      console.log('Processed locations data:', locationsData);
      setLocations(locationsData);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load locations';
      console.error('Error fetching locations:', error);
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  }, []);

  // Fetch countries
  const fetchCountries = useCallback(async () => {
    try {
      const res = await apiFetch('/countries');
      const response = await res.json();
      
      let countriesData: Country[] = [];
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
      
      let statesData: State[] = [];
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

  // Fetch all cities
  const fetchCities = useCallback(async () => {
    try {
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
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      setStates([]);
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    fetchLocations();
    fetchCountries();
    fetchStates();
    fetchCities();
  }, [fetchLocations, fetchCountries, fetchStates, fetchCities]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle location selection from dropdown
  const handleLocationSelect = (locationName: string | null) => {
    if (!locationName) return;
    
    const selectedLocation = locationData.find(loc => loc.name === locationName);
    if (selectedLocation) {
      setForm(prev => ({
        ...prev,
        name: selectedLocation.name,
        slug: selectedLocation.slug,
        pincode: selectedLocation.pincode
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editId) {
        // Update existing location
        const response = await apiFetch(`/locations/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            pincode: form.pincode,
            country: form.country,
            state: form.state,
            city: form.city,
            timezone: form.timezone,
            language: form.language
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update location');
        }
        
        setSuccess('Location updated successfully');
      } else {
        // Create new location
        const response = await apiFetch('/locations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            pincode: form.pincode,
            country: form.country,
            state: form.state,
            city: form.city,
            timezone: form.timezone,
            language: form.language
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create location');
        }
        
        setSuccess('Location created successfully');
      }
      
      fetchLocations();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await apiFetch(`/locations/${deleteId}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete location');
      }
      
      setSuccess('Location deleted successfully');
      fetchLocations();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete location');
    } finally {
      setDeleteId(null);
    }
  };

  // Handle edit
  const handleEdit = (location: Location) => {
    setForm({
      name: location.name,
      slug: location.slug,
      pincode: location.pincode,
      country: typeof location.country === 'string' ? location.country : location.country._id,
      state: typeof location.state === 'string' ? location.state : location.state?._id || '',
      city: typeof location.city === 'string' ? location.city : location.city?._id || '',
      timezone: location.timezone,
      language: location.language,
      country_name: typeof location.country === 'object' ? location.country.name : '',
      state_name: typeof location.state === 'object' ? location.state?.name : '',
      city_name: typeof location.city === 'object' ? location.city?.name : ''
    });
    setEditId(location._id);
    setOpen(true);
  };

  // Handle form open/close
  const allTimezones = [
    { value: "UTC", label: "UTC" },
    { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
    { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
    { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
    { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
    { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
    { value: "Asia/Seoul", label: "Asia/Seoul (KST)" },
    { value: "Asia/Jakarta", label: "Asia/Jakarta (WIB)" },
    { value: "Asia/Bangkok", label: "Asia/Bangkok (ICT)" },
    { value: "Asia/Karachi", label: "Asia/Karachi (PKT)" },
    { value: "America/New_York", label: "America/New_York (EST)" },
    { value: "America/Chicago", label: "America/Chicago (CST)" },
    { value: "America/Denver", label: "America/Denver (MST)" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles (PST)" },
    { value: "Europe/London", label: "Europe/London (GMT)" },
    { value: "Europe/Paris", label: "Europe/Paris (CET)" },
    { value: "Europe/Berlin", label: "Europe/Berlin (CET)" },
    { value: "Australia/Sydney", label: "Australia/Sydney (AEST)" },
    { value: "Australia/Melbourne", label: "Australia/Melbourne (AEST)" },
    { value: "Pacific/Auckland", label: "Pacific/Auckland (NZST)" }
  ];

  const allLanguages = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "mr", name: "Marathi" },
    { code: "gu", name: "Gujarati" },

    { code: "kn", name: "Kannada" },
    { code: "ml", name: "Malayalam" },
    { code: "pa", name: "Punjabi" },
    { code: "or", name: "Oriya" },
    { code: "as", name: "Assamese" },
    { code: "ne", name: "Nepali" },
    { code: "si", name: "Sinhala" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ru", name: "Russian" },
    { code: "ar", name: "Arabic" },
    { code: "pt", name: "Portuguese" },
    { code: "bn", name: "Bengali" },
    { code: "pa", name: "Punjabi" },
    { code: "te", name: "Telugu" },
    { code: "mr", name: "Marathi" },
    { code: "ta", name: "Tamil" },
    { code: "ur", name: "Urdu" },
    { code: "tr", name: "Turkish" },
    { code: "ko", name: "Korean" },
    { code: "it", name: "Italian" },
    { code: "nl", name: "Dutch" },
    { code: "th", name: "Thai" }
  ];

  // Filter timezones and languages based on search
  const filteredTimezones = allTimezones.filter(tz => 
    tz.label.toLowerCase().includes(timezoneSearch.toLowerCase())
  );

  const filteredLanguages = allLanguages.filter(lang => 
    lang.name.toLowerCase().includes(languageSearch.toLowerCase()) ||
    lang.code.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const handleOpen = () => {
    setForm({
      name: '',
      slug: '',
      pincode: '',
      country: '',
      state: '',
      city: '',
      timezone: 'Asia/Kolkata',
      language: 'en',
    });
    setEditId(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  // Handle country change
  const handleCountryChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      country: value
    }));
  };

  // Handle state change
  const handleStateChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      state: value
    }));
  };

  // Handle city change - only update city, not pincode
  const handleCityChange = (event: any, value: any) => {
    if (value) {
      setForm(prev => ({
        ...prev,
        city: value._id,
        city_name: value.name
        // Keep existing pincode value
      }));
    } else {
      setForm(prev => ({
        ...prev,
        city: '',
        city_name: ''
        // Keep existing pincode value
      }));
    }
  };

  // Handle pincode change
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      pincode: e.target.value
    }));
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Update slug when name changes
  useEffect(() => {
    if (form.name && !editId) {
      setForm(prev => ({
        ...prev,
        slug: generateSlug(form.name)
      }));
    }
  }, [form.name, editId]);

  // Load data on component mount
  useEffect(() => {
    fetchLocations();
    fetchCountries();
    fetchStates();
    fetchCities();
  }, [fetchLocations, fetchCountries, fetchStates, fetchCities]);

  // Filter locations based on search
  const filteredLocations = useMemo(() => {
    if (!search) return locations;
    const searchLower = search.toLowerCase();
    return locations.filter(location => 
      location.name.toLowerCase().includes(searchLower) ||
      location.pincode.includes(search) ||
      (typeof location.country === 'object' && location.country.name.toLowerCase().includes(searchLower)) ||
      (typeof location.state === 'object' && location.state?.name?.toLowerCase().includes(searchLower)) ||
      (typeof location.city === 'object' && location.city?.name?.toLowerCase().includes(searchLower))
    );
  }, [locations, search]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">Locations</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add Location
        </Button>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success message */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Locations table */}
      {!loading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>City</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Pincode</TableCell>
                <TableCell>Timezone</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <TableRow key={location._id}>
                    <TableCell>{location.name}</TableCell>
                    <TableCell>{
                      typeof location.city === 'object' ? location.city?.name : ''
                    }</TableCell>
                    <TableCell>{
                      typeof location.state === 'object' ? location.state?.name : ''
                    }</TableCell>
                    <TableCell>{
                      typeof location.country === 'object' ? location.country.name : ''
                    }</TableCell>
                    <TableCell>{location.pincode}</TableCell>
                    <TableCell>{location.timezone}</TableCell>
                    <TableCell>{location.language}</TableCell>
                    <TableCell>{location.slug}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(location)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => setDeleteId(location._id)} 
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No locations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Location Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editId ? 'Edit' : 'Add'} Location</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            
            <Autocomplete
              freeSolo
              options={locationData.map(loc => loc.name)}
              value={form.name}
              onChange={(_, newValue) => handleLocationSelect(newValue)}
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
                  required
                  fullWidth
                  label="Location Name"
                  name="name"
                  placeholder="Search for a location..."
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
              label="Slug"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              helperText="Auto-generated from name but can be edited"
            />
            
            <Autocomplete
              options={Array.isArray(countries) ? countries : []}
              getOptionLabel={(option) => option?.name || ''}
              value={Array.isArray(countries) ? (countries.find(c => c._id === form.country) || null) : null}
              onChange={(_, newValue) => handleCountryChange(newValue?._id || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="normal"
                  label="Country"
                  required
                  error={!Array.isArray(countries)}
                  helperText={!Array.isArray(countries) ? 'Error loading countries' : ''}
                />
              )}
            />
            
            <Autocomplete
              options={Array.isArray(states) ? states : []}
              getOptionLabel={(option) => option?.name || ''}
              value={Array.isArray(states) ? (states.find(s => s._id === form.state) || null) : null}
              onChange={(_, newValue) => handleStateChange(newValue?._id || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="normal"
                  label="State"
                  required
                  error={!Array.isArray(states)}
                  helperText={!Array.isArray(states) ? 'Error loading states' : ''}
                />
              )}
            />
            
            <Autocomplete
              options={Array.isArray(cities) ? cities : []}
              getOptionLabel={(option) => option?.name || ''}
              value={Array.isArray(cities) ? (cities.find(c => c._id === form.city) || null) : null}
              onChange={handleCityChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="normal"
                  label="City"
                  required
                  error={!Array.isArray(cities)}
                  helperText={!Array.isArray(cities) ? 'Error loading cities' : ''}
                />
              )}
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Pincode"
              name="pincode"
              value={form.pincode}
              onChange={handlePincodeChange}
              required
              inputProps={{
                pattern: '^[0-9]*$',
                title: 'Please enter a valid pincode (numbers only)'
              }}
            />
            
            <Autocomplete
              options={filteredTimezones}
              getOptionLabel={(option) => option.label}
              value={allTimezones.find(tz => tz.value === form.timezone) || null}
              onChange={(_, newValue) => {
                setForm(prev => ({
                  ...prev,
                  timezone: newValue?.value || ''
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="normal"
                  label="Timezone"
                  required
                  onChange={(e) => setTimezoneSearch(e.target.value)}
                  value={timezoneSearch}
                />
              )}
            />
            
            <Autocomplete
              options={filteredLanguages}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              value={allLanguages.find(lang => lang.code === form.language) || null}
              onChange={(_, newValue) => {
                setForm(prev => ({
                  ...prev,
                  language: newValue?.code || ''
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="normal"
                  label="Language"
                  required
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  value={languageSearch}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError(null)}>
              {deleteError}
            </Alert>
          )}
          <DialogContentText>
            Are you sure you want to delete this location? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={!!deleteError}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" disabled={!!deleteError}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
