"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField,
  IconButton, Alert, Snackbar, CircularProgress, Container, Typography, Autocomplete,
  Select, MenuItem, Pagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import apiFetch from '../../utils/apiFetch';

// Location detail options will be fetched from the API

// Define TypeScript interfaces for our data
interface Location {
  _id: string;
  name: string;
  slug: string;
  pincode: string;
  country: string | { _id: string; name: string };
  state: string | { _id: string; name: string };
  city: string | { _id: string; name: string };
  language: string;
  latitude?: number;
  longitude?: number;
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
  country: string | { _id: string; name: string };
}

interface City {
  _id: string;
  name: string;
  pincode: string;
  state: string | { _id: string; name: string };
}

interface LocationDetailOption {
  _id: string;
  name: string;
  slug: string;
  pincode?: string;
  city: string | { _id: string; name: string };
  latitude?: number;
  longitude?: number;
}

interface FormState {
  name: string;
  slug: string;
  pincode: string;
  country: string;
  state: string;
  city: string;
  language: string;
  latitude?: number;
  longitude?: number;
  country_name?: string;
  state_name?: string;
  city_name?: string;
}

export default function LocationPage() {
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [isClient, setIsClient] = useState(false);
  const _router = useRouter(); // eslint-disable-line @typescript-eslint/no-unused-vars

  useEffect(() => {
    setIsClient(true);
    const getLocationPagePermission = () => {
      const email = localStorage.getItem('admin-email');
      const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN;
      if (email && superAdmin && email === superAdmin) return 'all access';
      const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
      if (perms && perms.filter) {
        return perms.filter;
      }
      return 'no access';
    };

    const access = getLocationPagePermission();
    setPageAccess(access);
  }, []);

  const [locations, setLocations] = useState<Location[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '',
    slug: '',
    pincode: '',
    country: '',
    state: '',
    city: '',
    language: 'en',
    latitude: undefined,
    longitude: undefined
  });
  const [editId, setEditId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [openFormDialog, setOpenFormDialog] = useState(false);
  // Snackbar state
  interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }

  // Form and UI state
  const [search, setSearch] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [locationDetails, setLocationDetails] = useState<LocationDetailOption[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const refreshCountries = useCallback(async () => {
    try {
      const res = await apiFetch('/countries');
      const data = await res.json();
      let list: Country[] = [];
      if (data?.status === 'success' && data.data?.countries) {
        list = data.data.countries;
      } else if (Array.isArray(data)) {
        list = data;
      }
      // Sort countries alphabetically by name
      list.sort((a, b) => a.name.localeCompare(b.name));
      setCountries(list);
    } catch (error) {
      console.log("error",error);
    }
  }, []);

  const refreshStates = useCallback(async () => {
    try {
      const res = await apiFetch('/states');
      const data = await res.json();
      let list: State[] = [];
      if (data?.status === 'success' && data.data?.states) {
        list = data.data.states;
      } else if (Array.isArray(data)) {
        list = data;
      }
      // Sort states alphabetically by name
      list.sort((a, b) => a.name.localeCompare(b.name));
      setStates(list);
    } catch (error) {
      console.log("error",error);
    }
  }, []);

  const refreshCities = useCallback(async () => {
    try {
      const res = await apiFetch('/cities');
      const data = await res.json();
      let list: City[] = [];
      if (data?.status === 'success' && data.data?.cities) {
        list = data.data.cities;
      } else if (Array.isArray(data)) {
        list = data;
      }
      // Sort cities alphabetically by name
      list.sort((a, b) => a.name.localeCompare(b.name));
      setCities(list);
    } catch (error) {
      console.log("error",error);
    }
  }, []);

  const refreshLocationDetails = useCallback(async () => {
    try {
      const res = await apiFetch('/location-details');
      const data = await res.json();
      let list: LocationDetailOption[] = [];
      if (data?.status === 'success' && data.data?.locationDetails) {
        list = data.data.locationDetails;
      } else if (Array.isArray(data)) {
        list = data;
      }
      setLocationDetails(list);
    } catch (error) {
      console.log("error",error);
    }
  }, []);

  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Log state changes in development only
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Countries updated:', countries);
      console.log('States updated:', states);
      console.log('Cities updated:', cities);
      console.log('Locations updated:', locations);
    }
  }, [countries, states, cities, locations]);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Fetch all required data in parallel
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [locationsRes, countriesRes, statesRes, citiesRes, locationDetailsRes] = await Promise.all([
        apiFetch(`/locations?page=${pagination.page}&limit=${pagination.limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
        apiFetch('/countries'),
        apiFetch('/states'),
        apiFetch('/cities'),
        apiFetch('/location-details')
      ]);

      // Process all responses
      const [locationsData, countriesData, statesData, citiesData, locationDetailsData] = await Promise.all([
        locationsRes.json(),
        countriesRes.json(),
        statesRes.json(),
        citiesRes.json(),
        locationDetailsRes.json()
      ]);

      // Process locations
      let processedLocations: Location[] = [];
      if (locationsData?.status === 'success' && locationsData.data?.locations) {
        processedLocations = locationsData.data.locations;
        setPagination(prev => ({
          ...prev,
          total: locationsData.data.pagination.total,
          totalPages: locationsData.data.pagination.totalPages,
          currentPage: locationsData.data.pagination.currentPage
        }));
      } else if (Array.isArray(locationsData)) {
        processedLocations = locationsData;
      }

      // Process countries
      let processedCountries: Country[] = [];
      if (countriesData?.status === 'success' && countriesData.data?.countries) {
        processedCountries = countriesData.data.countries;
      } else if (Array.isArray(countriesData)) {
        processedCountries = countriesData;
      }
      // Sort countries alphabetically by name
      processedCountries.sort((a, b) => a.name.localeCompare(b.name));

      // Process states
      let processedStates: State[] = [];
      if (statesData?.status === 'success' && statesData.data?.states) {
        processedStates = statesData.data.states;
      } else if (Array.isArray(statesData)) {
        processedStates = statesData;
      }
      // Sort states alphabetically by name
      processedStates.sort((a, b) => a.name.localeCompare(b.name));

      // Process cities
      let processedCities: City[] = [];
      if (citiesData?.status === 'success' && citiesData.data?.cities) {
        processedCities = citiesData.data.cities;
      } else if (Array.isArray(citiesData)) {
        processedCities = citiesData;
      }
      // Sort cities alphabetically by name
      processedCities.sort((a, b) => a.name.localeCompare(b.name));

      // Process location details
      let processedLocationDetails: LocationDetailOption[] = [];
      if (locationDetailsData?.status === 'success' && locationDetailsData.data?.locationDetails) {
        processedLocationDetails = locationDetailsData.data.locationDetails;
      } else if (Array.isArray(locationDetailsData)) {
        processedLocationDetails = locationDetailsData;
      }

      // Update state in a single batch
      setLocations(processedLocations);
      setCountries(processedCountries);
      setStates(processedStates);
      setCities(processedCities);
      setLocationDetails(processedLocationDetails);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      console.error('Error fetching data:', error);
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search]);

  // Load initial data
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get locations filtered by selected city - handles both API and local data
  const getFilteredLocations = useCallback(() => {
    if (!form.city) return [];
    return locationDetails.filter(detail => {
      const cityId = typeof detail.city === 'object' ? detail.city._id : detail.city;
      return cityId === form.city;
    });
  }, [form.city, locationDetails]);

  const filteredLocationOptions: LocationDetailOption[] = useMemo(
    () => getFilteredLocations(),
    [getFilteredLocations]
  );

 

  // Handle location selection from dropdown
  const handleLocationSelect = (value: string | null) => {
    if (!value) return;

    const location = filteredLocationOptions.find(loc => loc.name === value);
    if (location) {
      setForm(prev => ({
        ...prev,
        name: location.name,
        slug: location.slug,
        pincode: location.pincode || '',
        latitude: location.latitude,
        longitude: location.longitude
      }));
    }
  };

  // Type guard for Autocomplete change event
  const handleAutocompleteChange = (_: React.SyntheticEvent, value: string | null) => {
    if (value) {
      handleLocationSelect(value);
    } else {
      setForm(prev => ({
        ...prev,
        name: '',
        slug: '',
        pincode: '',
        latitude: undefined,
        longitude: undefined
      }));
    }
  };

  useEffect(() => {
    // This effect is no longer needed as we removed LocalBusinessJsonLd fields
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validation for required fields in order
    if (!form.country) {
      setError('Please select a country first');
      setSubmitting(false);
      return;
    }

    if (!form.state) {
      setError('Please select a state after selecting a country');
      setSubmitting(false);
      return;
    }

    if (!form.city) {
      setError('Please select a city after selecting a state');
      setSubmitting(false);
      return;
    }

    if (!form.name || !form.slug) {
      setError('Location name and slug are required');
      setSubmitting(false);
      return;
    }

    try {
      const url = editId ? `/locations/${editId}` : '/locations';
      const method = editId ? 'PUT' : 'POST';

      // Prepare the request body with only the fields that have values
      const requestBody: Partial<Location> & { country_name?: string; state_name?: string; city_name?: string } = {
        name: form.name,
        slug: form.slug,
      };

      // Add optional fields only if they have values
      if (form.pincode) requestBody.pincode = form.pincode;
      if (form.country) requestBody.country = form.country;
      if (form.state) requestBody.state = form.state;
      if (form.city) requestBody.city = form.city;
      if (form.language) requestBody.language = form.language;
      if (form.latitude !== undefined) requestBody.latitude = form.latitude;
      if (form.longitude !== undefined) requestBody.longitude = form.longitude;

      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSnackbar({
        open: true,
        message: editId ? 'Location updated successfully' : 'Location added successfully',
        severity: 'success',
      });

      // Refresh the data
      fetchAllData();

      // Reset form
      setForm({
        name: '',
        slug: '',
        pincode: '',
        country: '',
        state: '',
        city: '',
        language: 'en',
        latitude: undefined,
        longitude: undefined
      });
      setEditId(null);
      setOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save location';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete button click
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleteSubmitting(true);
    setDeleteError(null);

    try {
      const response = await apiFetch(`/locations/${deleteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete location');
      }

      setSnackbar({
        open: true,
        message: 'Location deleted successfully',
        severity: 'success',
      });

      // Refresh the data
      fetchAllData();
      setOpenDeleteDialog(false);
      setDeleteId(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete location';
      setDeleteError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Handle view details
  const handleView = (location: Location) => {
    setSelectedLocation(location);
    setViewDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (location: Location) => {
    // Helper function to safely get ID from a field that could be string or object
    const getId = (field: string | { _id: string;[key: string]: unknown } | undefined): string => {
      if (!field) return '';
      return typeof field === 'string' ? field : field._id || '';
    };

    // Helper function to safely get name from a field that could be string or object
    const getName = (field: string | { name: string;[key: string]: unknown } | undefined): string => {
      if (!field) return '';
      if (typeof field === 'string') {
        // If it's a string ID, find the corresponding name from the countries array
        if (field === location.country) {
          const country = countries.find(c => c._id === field);
          return country ? country.name : '';
        }
        return '';
      }
      return field.name || '';
    };

    const countryId = getId(location.country);
    const countryName = typeof location.country === 'object'
      ? location.country.name
      : countries.find(c => c._id === countryId)?.name || '';

    setForm({
      name: location.name || '',
      slug: location.slug || '',
      pincode: location.pincode || '',
      country: countryId,
      state: getId(location.state),
      city: getId(location.city),
      language: location.language || 'en',
      latitude: location.latitude,
      longitude: location.longitude,
      country_name: countryName,
      state_name: getName(location.state),
      city_name: getName(location.city)
    });

    if (location._id) {
      setEditId(location._id);
    } else {
      console.error('Cannot edit location: No _id found');
      return;
    }

    setOpen(true);
  };

  // Handle form open/close
  const handleOpen = () => {
    setForm({
      name: '',
      slug: '',
      pincode: '',
      country: '',
      state: '',
      city: '',
      language: 'en',
      latitude: undefined,
      longitude: undefined
    });
    setEditId(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
  };

  // Get states filtered by selected country
  const getFilteredStates = useCallback(() => {
    if (!form.country) return [];
    if (!Array.isArray(states)) return [];

    return states.filter(state => {
      const countryId = typeof state.country === 'object' ? state.country._id : state.country;
      return countryId === form.country;
    });
  }, [form.country, states]);

  // Get cities filtered by selected state
  const getFilteredCities = useCallback(() => {
    if (!form.state) return [];
    if (!Array.isArray(cities)) return [];

    return cities.filter(city => {
      const stateId = typeof city.state === 'object' ? city.state._id : city.state;
      return stateId === form.state;
    });
  }, [form.state, cities]);

  // Get locations filtered by selected city - handled by the main implementation

  // Handle country change
  const handleCountryChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      country: value,
      // Reset dependent fields when country changes
      state: '',
      city: '',
      state_name: '',
      city_name: ''
    }));
  };

  // Handle state change
  const handleStateChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      state: value,
      // Reset dependent fields when state changes
      city: '',
      city_name: ''
    }));
  };

  // Handle city change - reset location and pincode
  const handleCityChange = (event: React.SyntheticEvent, value: { _id: string; name: string } | null) => {
    if (value) {
      setForm(prev => ({
        ...prev,
        city: value._id,
        city_name: value.name,
        name: '', // Reset location name
        slug: '',  // Reset slug
        pincode: '' // Reset pincode
      }));
    } else {
      setForm(prev => ({
        ...prev,
        city: '',
        city_name: '',
        name: '', // Reset location name
        slug: '',  // Reset slug
        pincode: '' // Reset pincode
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

  // Fetch all data when component mounts or when pagination/search changes
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Handle search
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // Reset to first page when searching
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  }, []);

  // Fetch data when pagination or search changes
  useEffect(() => {
    fetchAllData();
  }, [pagination.page, pagination.limit, search, fetchAllData]);

  const viewOnly = pageAccess === 'only view';

  if (!isClient) {
    return null; // or a loading spinner
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
        <Typography variant="h4" component="h1">Locations</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          disabled={viewOnly}
          sx={{ mb: 2 }}
        >
          Add Location
        </Button>
      </Box>

      {/* Search and Pagination Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search locations"
          placeholder="Search locations..."
          value={search}
          onChange={handleSearch}
          sx={{ maxWidth: 400 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Rows per page:
          </Typography>
          <Select
            size="small"
            value={pagination.limit}
            onChange={(e) => {
              setPagination(prev => ({
                ...prev,
                limit: Number(e.target.value),
                page: 1
              }));
            }}
            sx={{ minWidth: 80 }}
          >
            {[10, 25, 50, 100].map((rows) => (
              <MenuItem key={rows} value={rows}>
                {rows}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>City</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>Pincode</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locations.length > 0 ? (
                locations.map((location) => (
                  <TableRow key={location._id}>
                    <TableCell>{location.name}</TableCell>
                    <TableCell>{
                      typeof location.city === 'object' && location.city ? location.city.name : ''
                    }</TableCell>
                    <TableCell>{
                      typeof location.state === 'object' && location.state ? location.state.name : ''
                    }</TableCell>
                    <TableCell>{
                      typeof location.country === 'object' && location.country ? location.country.name : ''
                    }</TableCell>
                    <TableCell>{location.pincode || ''}</TableCell>
                    <TableCell>{location.language || ''}</TableCell>
                    <TableCell>{location.slug || ''}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleView(location)}
                        color="info"
                        title="View Details"
                      >
                        <SearchIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleEdit(location)}
                        color={viewOnly ? 'default' : 'primary'}
                        disabled={viewOnly}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => setDeleteId(location._id)}
                        color={viewOnly ? 'default' : 'error'}
                        disabled={viewOnly}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {search ? 'No matching locations found' : 'No locations available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {pagination.total > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
            sx={{ '& .MuiPagination-ul': { flexWrap: 'nowrap' } }}
          />
        </Box>
      )}

      {/* Add/Edit Location Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="xl"
        fullScreen
        sx={{ '& .MuiDialog-container': { height: '100%' } }}
      >
        <form onSubmit={handleSubmit} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <DialogTitle sx={{ m: 0, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="div">
                {editId ? 'Edit' : 'Add'} Location
              </Typography>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ flexGrow: 1, overflow: 'auto' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
              {/* Location Information */}
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>Location Information</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <Autocomplete
                    onOpen={refreshCountries}
                    options={Array.isArray(countries) ? countries : []}
                    getOptionLabel={(option) => option?.name || ''}
                    value={Array.isArray(countries) ? (countries.find(c => c._id === form.country) || null) : null}
                    onChange={(_, newValue) => handleCountryChange(newValue?._id || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        margin="normal"
                        label="Country"
                        error={!Array.isArray(countries)}
                        helperText={!Array.isArray(countries) ? 'Error loading countries' : ''}
                        fullWidth
                      />
                    )}
                  />

                  <Autocomplete
                    onOpen={() => refreshStates()}
                    options={getFilteredStates()}
                    getOptionLabel={(option) => option?.name || ''}
                    value={getFilteredStates().find(s => s._id === form.state) || null}
                    onChange={(_, newValue) => handleStateChange(newValue?._id || '')}
                    disabled={!form.country}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        margin="normal"
                        label="State"
                        error={!Array.isArray(states)}
                        helperText={!form.country ? 'Please select a country first' :
                          (!Array.isArray(states) ? 'Error loading states' :
                            getFilteredStates().length === 0 ? 'No states available for selected country' : 'Select a state')}
                        fullWidth
                      />
                    )}
                  />

                  <Autocomplete
                    onOpen={() => refreshCities()}
                    options={getFilteredCities()}
                    getOptionLabel={(option) => option?.name || ''}
                    value={getFilteredCities().find(c => c._id === form.city) || null}
                    onChange={handleCityChange}
                    disabled={!form.state}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        margin="normal"
                        label="City"
                        error={!Array.isArray(cities)}
                        helperText={!form.state ? 'Please select a state first' :
                          (!Array.isArray(cities) ? 'Error loading cities' :
                            getFilteredCities().length === 0 ? 'No cities available for selected state' : 'Select a city')}
                        fullWidth
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
                    disabled={!form.city}
                    helperText={!form.city ? 'Please select a city first' : 'Enter pincode'}
                    inputProps={{
                      pattern: '^[0-9]*$',
                      title: 'Please enter a valid pincode (numbers only)'
                    }}
                  />
                </Box>
              </Box>

              {/* Basic Information */}
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <Autocomplete
                    onOpen={() => refreshLocationDetails()}
                    options={filteredLocationOptions.map(loc => loc.name)}
                    value={form.name}
                    onChange={handleAutocompleteChange}
                    disabled={!form.city || filteredLocationOptions.length === 0}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        margin="normal"
                        fullWidth
                        label="Location Name"
                        name="name"
                        placeholder="Select a location detail..."
                        required
                        helperText={
                          !form.city
                            ? 'Please select a city first'
                            : filteredLocationOptions.length === 0
                              ? `No location details found for ${cities.find(c => c._id === form.city)?.name || 'the selected city'}`
                              : `Select a location from Location Details for ${cities.find(c => c._id === form.city)?.name || 'the selected city'}`
                        }
                      />
                    )}
                    renderOption={(props: React.HTMLAttributes<HTMLLIElement>, option: string) => {
                      const location = filteredLocationOptions.find(loc => loc.name === option);
                      return (
                        <li {...props} key={option}>
                          <Box>
                            <div>{option}</div>
                            {location?.pincode && <div style={{ fontSize: '0.8em', color: '#666' }}>Pincode: {location.pincode}</div>}
                          </Box>
                        </li>
                      );
                    }}
                  />

                  <TextField
                    margin="normal"
                    fullWidth
                    label="Slug"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    helperText="Auto-generated from name but can be edited"
                  />

                  <TextField
                    margin="normal"
                    fullWidth
                    label="Language"
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    helperText="Language code (e.g., en, hi, es)"
                  />

                  <TextField
                    margin="normal"
                    fullWidth
                    label="Latitude"
                    name="latitude"
                    type="number"
                    value={form.latitude || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, latitude: e.target.value ? Number(e.target.value) : undefined }))}
                    helperText="Geographic latitude"
                  />

                  <TextField
                    margin="normal"
                    fullWidth
                    label="Longitude"
                    name="longitude"
                    type="number"
                    value={form.longitude || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, longitude: e.target.value ? Number(e.target.value) : undefined }))}
                    helperText="Geographic longitude"
                  />
                </Box>
              </Box>
            </Box>
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

      {/* View Location Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Location Details</DialogTitle>
        <DialogContent>
          {selectedLocation && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '200px' }}>Name</TableCell>
                      <TableCell>{selectedLocation.name || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Slug</TableCell>
                      <TableCell>{selectedLocation.slug || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Pincode</TableCell>
                      <TableCell>{selectedLocation.pincode || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Country</TableCell>
                      <TableCell>{typeof selectedLocation.country === 'object' && selectedLocation.country ? selectedLocation.country.name : (selectedLocation.country || 'N/A')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>State</TableCell>
                      <TableCell>{typeof selectedLocation.state === 'object' && selectedLocation.state ? selectedLocation.state.name : (selectedLocation.state || 'N/A')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>City</TableCell>
                      <TableCell>{typeof selectedLocation.city === 'object' && selectedLocation.city ? selectedLocation.city.name : (selectedLocation.city || 'N/A')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Language</TableCell>
                      <TableCell>{selectedLocation.language || 'N/A'}</TableCell>
                    </TableRow>
                    {selectedLocation.latitude && selectedLocation.longitude && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Coordinates</TableCell>
                        <TableCell>{selectedLocation.latitude}, {selectedLocation.longitude}</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => setViewDialogOpen(false)}
                  variant="contained"
                  color="primary"
                >
                  Close
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Location</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setDeleteError(null)}
            >
              {deleteError}
            </Alert>
          )}
          <DialogContentText>
            Are you sure you want to delete this location? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteId(null)}
            disabled={deleteSubmitting}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={deleteSubmitting}
            startIcon={deleteSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {deleteSubmitting ? 'Deleting...' : 'Delete'}
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
