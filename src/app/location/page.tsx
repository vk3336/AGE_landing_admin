"use client";

import React, { useState, useEffect, useCallback } from 'react';
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

// Location data with name, slug, and pincode
const locationData = [
  {
    "name":"Navrangpura",
    "slug":"navrangpura",
    "pincode":"380009",
    "city":"Ahmedabad",
    "latitude":23.0339,
    "longitude":72.58
  },
  {
    "name":"Maninagar",
    "slug":"maninagar",
    "pincode":"380008",
    "city":"Ahmedabad",
    "latitude":22.9997,
    "longitude":72.6144
  },
  {
    "name":"Satellite",
    "slug":"satellite",
    "pincode":"380015",
    "city":"Ahmedabad",
    "latitude":23.0339,
    "longitude":72.5
  },
  {
    "name":"Bopal",
    "slug":"bopal",
    "pincode":"380058",
    "city":"Ahmedabad",
    "latitude":22.9916,
    "longitude":72.4798
  },
  {
    "name":"Vastrapur",
    "slug":"vastrapur",
    "pincode":"380015",
    "city":"Ahmedabad",
    "latitude":23.0424,
    "longitude":72.5136
  },
  {
    "name":"Paldi",
    "slug":"paldi",
    "pincode":"380007",
    "city":"Ahmedabad",
    "latitude":23.0086,
    "longitude":72.5617
  },
  {
    "name":"Thaltej",
    "slug":"thaltej",
    "pincode":"380059",
    "city":"Ahmedabad",
    "latitude":23.0574,
    "longitude":72.5168
  },
  {
    "name":"Andheri West",
    "slug":"andheri-west",
    "pincode":"400058",
    "city":"Mumbai",
    "latitude":19.1379,
    "longitude":72.8295
  },
  {
    "name":"Andheri East",
    "slug":"andheri-east",
    "pincode":"400069",
    "city":"Mumbai",
    "latitude":19.1197,
    "longitude":72.8464
  },
  {
    "name":"Bandra West",
    "slug":"bandra-west",
    "pincode":"400050",
    "city":"Mumbai",
    "latitude":19.055,
    "longitude":72.8297
  },
  {
    "name":"Powai",
    "slug":"powai",
    "pincode":"400076",
    "city":"Mumbai",
    "latitude":19.1197,
    "longitude":72.9056
  },
  {
    "name":"Colaba",
    "slug":"colaba",
    "pincode":"400005",
    "city":"Mumbai",
    "latitude":18.9068,
    "longitude":72.8146
  },
  {
    "name":"Malad West",
    "slug":"malad-west",
    "pincode":"400064",
    "city":"Mumbai",
    "latitude":19.1869,
    "longitude":72.8486
  },
  {
    "name":"Borivali East",
    "slug":"borivali-east",
    "pincode":"400066",
    "city":"Mumbai",
    "latitude":19.2307,
    "longitude":72.8567
  },
  {
    "name":"Connaught Place",
    "slug":"connaught-place",
    "pincode":"110001",
    "city":"New Delhi",
    "latitude":28.628,
    "longitude":77.2065
  },
  {
    "name":"Lajpat Nagar",
    "slug":"lajpat-nagar",
    "pincode":"110024",
    "city":"New Delhi",
    "latitude":28.5693,
    "longitude":77.2406
  },
  {
    "name":"Dwarka",
    "slug":"dwarka",
    "pincode":"110075",
    "city":"New Delhi",
    "latitude":28.5929,
    "longitude":77.0596
  },
  {
    "name":"Saket",
    "slug":"saket",
    "pincode":"110017",
    "city":"New Delhi",
    "latitude":28.5246,
    "longitude":77.2065
  },
  {
    "name":"Karol Bagh",
    "slug":"karol-bagh",
    "pincode":"110005",
    "city":"New Delhi",
    "latitude":28.6517,
    "longitude":77.1895
  },
  {
    "name":"Rohini",
    "slug":"rohini",
    "pincode":"110085",
    "city":"New Delhi",
    "latitude":28.7396,
    "longitude":77.0919
  },
  {
    "name":"Mayur Vihar",
    "slug":"mayur-vihar",
    "pincode":"110091",
    "city":"New Delhi",
    "latitude":28.5983,
    "longitude":77.2921
  },
  {
    "name":"C-Scheme",
    "slug":"c-scheme",
    "pincode":"302001",
    "city":"Jaipur",
    "latitude":26.9045,
    "longitude":75.8008
  },
  {
    "name":"Malviya Nagar",
    "slug":"malviya-nagar",
    "pincode":"302017",
    "city":"Jaipur",
    "latitude":26.8434,
    "longitude":75.8008
  },
  {
    "name":"Vaishali Nagar",
    "slug":"vaishali-nagar",
    "pincode":"302021",
    "city":"Jaipur",
    "latitude":26.9083,
    "longitude":75.7437
  },
  {
    "name":"Jhotwara",
    "slug":"jhotwara",
    "pincode":"302012",
    "city":"Jaipur",
    "latitude":26.9344,
    "longitude":75.7576
  },
  {
    "name":"Mansarovar",
    "slug":"mansarovar",
    "pincode":"302020",
    "city":"Jaipur",
    "latitude":26.8121,
    "longitude":75.7899
  },
  {
    "name":"Hiran Magri",
    "slug":"hiran-magri",
    "pincode":"313001",
    "city":"Udaipur",
    "latitude":24.5713,
    "longitude":73.6868
  },
  {
    "name":"Bapu Nagar",
    "slug":"bapu-nagar",
    "pincode":"302015",
    "city":"Jaipur",
    "latitude":26.8786,
    "longitude":75.7974
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
  latitude?: number;
  longitude?: number;
  // Local Business JSON-LD fields
  LocalBusinessJsonLd?: string;
  LocalBusinessJsonLdtype?: string;
  LocalBusinessJsonLdcontext?: string;
  LocalBusinessJsonLdname?: string;
  LocalBusinessJsonLdtelephone?: string;
  LocalBusinessJsonLdareaserved?: string;
  LocalBusinessJsonLdaddress?: string;
  LocalBusinessJsonLdaddresstype?: string;
  LocalBusinessJsonLdaddressstreetAddress?: string;
  LocalBusinessJsonLdaddressaddressLocality?: string;
  LocalBusinessJsonLdaddressaddressRegion?: string;
  LocalBusinessJsonLdaddresspostalCode?: string;
  LocalBusinessJsonLdaddressaddressCountry?: string;
  LocalBusinessJsonLdgeo?: string;
  LocalBusinessJsonLdgeotype?: string;
  LocalBusinessJsonLdgeolatitude?: string;
  LocalBusinessJsonLdgeolongitude?: string;
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

interface FormState {
  name: string;
  slug: string;
  pincode: string;
  country: string;
  state: string;
  city: string;
  timezone: string;
  language: string;
  // Local Business JSON-LD fields
  LocalBusinessJsonLd?: string;
  LocalBusinessJsonLdtype?: string;
  LocalBusinessJsonLdcontext?: string;
  LocalBusinessJsonLdname?: string;
  LocalBusinessJsonLdtelephone?: string;
  LocalBusinessJsonLdareaserved?: string;
  LocalBusinessJsonLdaddress?: string;
  LocalBusinessJsonLdaddresstype?: string;
  LocalBusinessJsonLdaddressstreetAddress?: string;
  LocalBusinessJsonLdaddressaddressLocality?: string;
  LocalBusinessJsonLdaddressaddressRegion?: string;
  LocalBusinessJsonLdaddresspostalCode?: string;
  LocalBusinessJsonLdaddressaddressCountry?: string;
  LocalBusinessJsonLdgeo?: string;
  LocalBusinessJsonLdgeotype?: string;
  LocalBusinessJsonLdgeolatitude?: string;
  LocalBusinessJsonLdgeolongitude?: string;
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
    timezone: '',
    language: '',
    // Initialize LocalBusinessJsonLd fields
    LocalBusinessJsonLd: '',
    LocalBusinessJsonLdtype: '',
    LocalBusinessJsonLdcontext: '',
    LocalBusinessJsonLdname: '',
    LocalBusinessJsonLdtelephone: '',
    LocalBusinessJsonLdareaserved: '',
    LocalBusinessJsonLdaddress: '',
    LocalBusinessJsonLdaddresstype: '',
    LocalBusinessJsonLdaddressstreetAddress: '',
    LocalBusinessJsonLdaddressaddressLocality: '',
    LocalBusinessJsonLdaddressaddressRegion: '',
    LocalBusinessJsonLdaddresspostalCode: '',
    LocalBusinessJsonLdaddressaddressCountry: '',
    LocalBusinessJsonLdgeo: '',
    LocalBusinessJsonLdgeotype: '',
    LocalBusinessJsonLdgeolatitude: '',
    LocalBusinessJsonLdgeolongitude: ''
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
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  
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
      const [locationsRes, countriesRes, statesRes, citiesRes] = await Promise.all([
        apiFetch(`/locations?page=${pagination.page}&limit=${pagination.limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
        apiFetch('/countries'),
        apiFetch('/states'),
        apiFetch('/cities')
      ]);

      // Process all responses
      const [locationsData, countriesData, statesData, citiesData] = await Promise.all([
        locationsRes.json(),
        countriesRes.json(),
        statesRes.json(),
        citiesRes.json()
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

      // Process states
      let processedStates: State[] = [];
      if (statesData?.status === 'success' && statesData.data?.states) {
        processedStates = statesData.data.states;
      } else if (Array.isArray(statesData)) {
        processedStates = statesData;
      }

      // Process cities
      let processedCities: City[] = [];
      if (citiesData?.status === 'success' && citiesData.data?.cities) {
        processedCities = citiesData.data.cities;
      } else if (Array.isArray(citiesData)) {
        processedCities = citiesData;
      }

      // Update state in a single batch
      setLocations(processedLocations);
      setCountries(processedCountries);
      setStates(processedStates);
      setCities(processedCities);
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
    if (!form.city) return locationData;
    const selectedCity = cities.find(city => city._id === form.city);
    if (!selectedCity) return locationData;
    
    // First try to filter from the local locationData
    const localFiltered = locationData.filter(location => 
      location.city.toLowerCase() === selectedCity.name.toLowerCase()
    );
    
    // If we have API locations, filter those too
    if (Array.isArray(locations) && locations.length > 0) {
      const apiFiltered = locations.filter(location => {
        const cityId = typeof location.city === 'object' ? location.city._id : location.city;
        return cityId === form.city;
      });
      return [...localFiltered, ...apiFiltered];
    }
    
    return localFiltered;
  }, [form.city, cities, locations]);

  // Handle location selection from dropdown
  const handleLocationSelect = (value: string | null) => {
    if (!value) return;
    
    const location = getFilteredLocations().find(loc => loc.name === value);
    if (location) {
      setForm(prev => ({
        ...prev,
        name: location.name,
        slug: location.slug,
        pincode: location.pincode,
        LocalBusinessJsonLdgeolatitude: location.latitude?.toString() || '',
        LocalBusinessJsonLdgeolongitude: location.longitude?.toString() || ''
      }));
    }
  };

  // Type guard for Autocomplete change event
  const handleAutocompleteChange = (_: React.SyntheticEvent, value: string | null) => {
    if (value) {
      handleLocationSelect(value);
    }
  };

  // Type guard for Autocomplete input change
  const handleAutocompleteInputChange = (_: React.SyntheticEvent, value: string) => {
    setForm(prev => ({
      ...prev,
      name: value
    }));
  };

  // Helper function to clean form data before submission
  // const cleanFormData = (data: FormState) => {
  //   return {
  //     ...data,
  //     country: data.country || undefined,
  //     state: data.state || undefined,
  //     city: data.city || undefined,
  //     pincode: data.pincode || undefined,
  //     timezone: data.timezone || undefined,
  //     language: data.language || undefined
  //   };
  // };

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
      if (form.timezone) requestBody.timezone = form.timezone;
      if (form.language) requestBody.language = form.language;
      
      // Add LocalBusinessJsonLd fields
      if (form.LocalBusinessJsonLd !== undefined) requestBody.LocalBusinessJsonLd = form.LocalBusinessJsonLd;
      if (form.LocalBusinessJsonLdtype !== undefined) requestBody.LocalBusinessJsonLdtype = form.LocalBusinessJsonLdtype;
      if (form.LocalBusinessJsonLdcontext !== undefined) requestBody.LocalBusinessJsonLdcontext = form.LocalBusinessJsonLdcontext;
      if (form.LocalBusinessJsonLdname !== undefined) requestBody.LocalBusinessJsonLdname = form.LocalBusinessJsonLdname;
      if (form.LocalBusinessJsonLdtelephone !== undefined) requestBody.LocalBusinessJsonLdtelephone = form.LocalBusinessJsonLdtelephone;
      if (form.LocalBusinessJsonLdareaserved !== undefined) requestBody.LocalBusinessJsonLdareaserved = form.LocalBusinessJsonLdareaserved;
      if (form.LocalBusinessJsonLdaddress !== undefined) requestBody.LocalBusinessJsonLdaddress = form.LocalBusinessJsonLdaddress;
      if (form.LocalBusinessJsonLdaddresstype !== undefined) requestBody.LocalBusinessJsonLdaddresstype = form.LocalBusinessJsonLdaddresstype;
      if (form.LocalBusinessJsonLdaddressstreetAddress !== undefined) requestBody.LocalBusinessJsonLdaddressstreetAddress = form.LocalBusinessJsonLdaddressstreetAddress;
      if (form.LocalBusinessJsonLdaddressaddressLocality !== undefined) requestBody.LocalBusinessJsonLdaddressaddressLocality = form.LocalBusinessJsonLdaddressaddressLocality;
      if (form.LocalBusinessJsonLdaddressaddressRegion !== undefined) requestBody.LocalBusinessJsonLdaddressaddressRegion = form.LocalBusinessJsonLdaddressaddressRegion;
      if (form.LocalBusinessJsonLdaddresspostalCode !== undefined) requestBody.LocalBusinessJsonLdaddresspostalCode = form.LocalBusinessJsonLdaddresspostalCode;
      if (form.LocalBusinessJsonLdaddressaddressCountry !== undefined) requestBody.LocalBusinessJsonLdaddressaddressCountry = form.LocalBusinessJsonLdaddressaddressCountry;
      if (form.LocalBusinessJsonLdgeo !== undefined) requestBody.LocalBusinessJsonLdgeo = form.LocalBusinessJsonLdgeo;
      if (form.LocalBusinessJsonLdgeotype !== undefined) requestBody.LocalBusinessJsonLdgeotype = form.LocalBusinessJsonLdgeotype;
      if (form.LocalBusinessJsonLdgeolatitude !== undefined) requestBody.LocalBusinessJsonLdgeolatitude = form.LocalBusinessJsonLdgeolatitude;
      if (form.LocalBusinessJsonLdgeolongitude !== undefined) requestBody.LocalBusinessJsonLdgeolongitude = form.LocalBusinessJsonLdgeolongitude;
      
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
        timezone: '',
        language: '',
        // Reset LocalBusinessJsonLd fields
        LocalBusinessJsonLd: '',
        LocalBusinessJsonLdtype: '',
        LocalBusinessJsonLdcontext: '',
        LocalBusinessJsonLdname: '',
        LocalBusinessJsonLdtelephone: '',
        LocalBusinessJsonLdareaserved: '',
        LocalBusinessJsonLdaddress: '',
        LocalBusinessJsonLdaddresstype: '',
        LocalBusinessJsonLdaddressstreetAddress: '',
        LocalBusinessJsonLdaddressaddressLocality: '',
        LocalBusinessJsonLdaddressaddressRegion: '',
        LocalBusinessJsonLdaddresspostalCode: '',
        LocalBusinessJsonLdaddressaddressCountry: '',
        LocalBusinessJsonLdgeo: '',
        LocalBusinessJsonLdgeotype: '',
        LocalBusinessJsonLdgeolatitude: '',
        LocalBusinessJsonLdgeolongitude: ''
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
    const getId = (field: string | { _id: string; [key: string]: unknown } | undefined): string => {
      if (!field) return '';
      return typeof field === 'string' ? field : field._id || '';
    };

    // Helper function to safely get name from a field that could be string or object
    const getName = (field: string | { name: string; [key: string]: unknown } | undefined): string => {
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
      timezone: location.timezone || '',
      language: location.language || '',
      // Set LocalBusinessJsonLd fields
      LocalBusinessJsonLd: location.LocalBusinessJsonLd || '',
      LocalBusinessJsonLdtype: location.LocalBusinessJsonLdtype || '',
      LocalBusinessJsonLdcontext: location.LocalBusinessJsonLdcontext || '',
      LocalBusinessJsonLdname: location.LocalBusinessJsonLdname || '',
      LocalBusinessJsonLdtelephone: location.LocalBusinessJsonLdtelephone || '',
      LocalBusinessJsonLdareaserved: location.LocalBusinessJsonLdareaserved || '',
      LocalBusinessJsonLdaddress: location.LocalBusinessJsonLdaddress || '',
      LocalBusinessJsonLdaddresstype: location.LocalBusinessJsonLdaddresstype || '',
      LocalBusinessJsonLdaddressstreetAddress: location.LocalBusinessJsonLdaddressstreetAddress || '',
      LocalBusinessJsonLdaddressaddressLocality: location.LocalBusinessJsonLdaddressaddressLocality || '',
      LocalBusinessJsonLdaddressaddressRegion: location.LocalBusinessJsonLdaddressaddressRegion || '',
      LocalBusinessJsonLdaddresspostalCode: location.LocalBusinessJsonLdaddresspostalCode || '',
      LocalBusinessJsonLdaddressaddressCountry: location.LocalBusinessJsonLdaddressaddressCountry || '',
      LocalBusinessJsonLdgeo: location.LocalBusinessJsonLdgeo || '',
      LocalBusinessJsonLdgeotype: location.LocalBusinessJsonLdgeotype || '',
      LocalBusinessJsonLdgeolatitude: location.LocalBusinessJsonLdgeolatitude || '',
      LocalBusinessJsonLdgeolongitude: location.LocalBusinessJsonLdgeolongitude || '',
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
    { code: "te", name: "Telugu" },
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
      // Initialize LocalBusinessJsonLd fields
      LocalBusinessJsonLd: '',
      LocalBusinessJsonLdtype: '',
      LocalBusinessJsonLdcontext: '',
      LocalBusinessJsonLdname: '',
      LocalBusinessJsonLdtelephone: '',
      LocalBusinessJsonLdareaserved: '',
      LocalBusinessJsonLdaddress: '',
      LocalBusinessJsonLdaddresstype: '',
      LocalBusinessJsonLdaddressstreetAddress: '',
      LocalBusinessJsonLdaddressaddressLocality: '',
      LocalBusinessJsonLdaddressaddressRegion: '',
      LocalBusinessJsonLdaddresspostalCode: '',
      LocalBusinessJsonLdaddressaddressCountry: '',
      LocalBusinessJsonLdgeo: '',
      LocalBusinessJsonLdgeotype: '',
      LocalBusinessJsonLdgeolatitude: '',
      LocalBusinessJsonLdgeolongitude: ''
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
                <TableCell>Timezone</TableCell>
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
                  <TableCell colSpan={9} align="center">
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
                  <Autocomplete<string, false, false, true>
                    freeSolo
                    options={getFilteredLocations().map(loc => loc.name)}
                    value={form.name}
                    onChange={handleAutocompleteChange}
                    onInputChange={handleAutocompleteInputChange}
                    disabled={!form.city}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        margin="normal"
                        fullWidth
                        label="Location Name"
                        name="name"
                        placeholder="Search for a location..."
                        required
                        helperText={!form.city ? 'Please select a city first' : `Enter or select a location in ${cities.find(c => c._id === form.city)?.name || 'selected city'}`}
                      />
                    )}
                    renderOption={(props: React.HTMLAttributes<HTMLLIElement>, option: string) => {
                      const location = getFilteredLocations().find(loc => loc.name === option);
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimezoneSearch(e.target.value)}
                        value={timezoneSearch}
                        fullWidth
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLanguageSearch(e.target.value)}
                        value={languageSearch}
                        fullWidth
                      />
                    )}
                  />
                </Box>
              </Box>
              
              {/* LocalBusinessJsonLd Section */}
              <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>Local Business JSON-LD</Typography>
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Local Business JSON"
                  name="LocalBusinessJsonLd"
                  value={form.LocalBusinessJsonLd || ''}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  helperText="Raw JSON for Local Business"
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Local Business Type"
                  name="LocalBusinessJsonLdtype"
                  value={form.LocalBusinessJsonLdtype || ''}
                  onChange={handleChange}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Context"
                  name="LocalBusinessJsonLdcontext"
                  value={form.LocalBusinessJsonLdcontext || ''}
                  onChange={handleChange}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Business Name"
                  name="LocalBusinessJsonLdname"
                  value={form.LocalBusinessJsonLdname || ''}
                  onChange={handleChange}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Telephone"
                  name="LocalBusinessJsonLdtelephone"
                  value={form.LocalBusinessJsonLdtelephone || ''}
                  onChange={handleChange}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Area Served"
                  name="LocalBusinessJsonLdareaserved"
                  value={form.LocalBusinessJsonLdareaserved || ''}
                  onChange={handleChange}
                />
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Address</Typography>
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Address JSON"
                  name="LocalBusinessJsonLdaddress"
                  value={form.LocalBusinessJsonLdaddress || ''}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  helperText="Raw JSON for Address"
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Address Type"
                  name="LocalBusinessJsonLdaddresstype"
                  value={form.LocalBusinessJsonLdaddresstype || ''}
                  onChange={handleChange}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Street Address"
                  name="LocalBusinessJsonLdaddressstreetAddress"
                  value={form.LocalBusinessJsonLdaddressstreetAddress || ''}
                  onChange={handleChange}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Address Locality"
                  name="LocalBusinessJsonLdaddressaddressLocality"
                  value={form.LocalBusinessJsonLdaddressaddressLocality || ''}
                  onChange={handleChange}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Address Region"
                  name="LocalBusinessJsonLdaddressaddressRegion"
                  value={form.LocalBusinessJsonLdaddressaddressRegion || ''}
                  onChange={handleChange}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Postal Code"
                  name="LocalBusinessJsonLdaddresspostalCode"
                  value={form.LocalBusinessJsonLdaddresspostalCode || ''}
                  onChange={handleChange}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Address Country"
                  name="LocalBusinessJsonLdaddressaddressCountry"
                  value={form.LocalBusinessJsonLdaddressaddressCountry || ''}
                  onChange={handleChange}
                />
                
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Geo Coordinates</Typography>
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Geo JSON"
                  name="LocalBusinessJsonLdgeo"
                  value={form.LocalBusinessJsonLdgeo || ''}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  helperText="Raw JSON for Geo Coordinates"
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Geo Type"
                  name="LocalBusinessJsonLdgeotype"
                  value={form.LocalBusinessJsonLdgeotype || ''}
                  onChange={handleChange}
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Latitude"
                    name="LocalBusinessJsonLdgeolatitude"
                    value={form.LocalBusinessJsonLdgeolatitude || ''}
                    onChange={handleChange}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Longitude"
                    name="LocalBusinessJsonLdgeolongitude"
                    value={form.LocalBusinessJsonLdgeolongitude || ''}
                    onChange={handleChange}
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
                      <TableCell>{selectedLocation.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Slug</TableCell>
                      <TableCell>{selectedLocation.slug}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Pincode</TableCell>
                      <TableCell>{selectedLocation.pincode}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Country</TableCell>
                      <TableCell>{typeof selectedLocation.country === 'object' ? selectedLocation.country.name : selectedLocation.country}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>State</TableCell>
                      <TableCell>{typeof selectedLocation.state === 'object' ? selectedLocation.state.name : selectedLocation.state}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>City</TableCell>
                      <TableCell>{typeof selectedLocation.city === 'object' ? selectedLocation.city.name : selectedLocation.city}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Timezone</TableCell>
                      <TableCell>{selectedLocation.timezone || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Language</TableCell>
                      <TableCell>{selectedLocation.language || 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedLocation.LocalBusinessJsonLdname && (
                <>
                  <Typography variant="h6" gutterBottom>Business Information</Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', width: '250px' }}>Business Name</TableCell>
                          <TableCell>{selectedLocation.LocalBusinessJsonLdname}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Telephone</TableCell>
                          <TableCell>{selectedLocation.LocalBusinessJsonLdtelephone || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Area Served</TableCell>
                          <TableCell>{selectedLocation.LocalBusinessJsonLdareaserved || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Street Address</TableCell>
                          <TableCell>{selectedLocation.LocalBusinessJsonLdaddressstreetAddress || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Locality</TableCell>
                          <TableCell>{selectedLocation.LocalBusinessJsonLdaddressaddressLocality || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Region</TableCell>
                          <TableCell>{selectedLocation.LocalBusinessJsonLdaddressaddressRegion || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Postal Code</TableCell>
                          <TableCell>{selectedLocation.LocalBusinessJsonLdaddresspostalCode || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Country</TableCell>
                          <TableCell>{selectedLocation.LocalBusinessJsonLdaddressaddressCountry || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Geo Coordinates</TableCell>
                          <TableCell>
                            {selectedLocation.LocalBusinessJsonLdgeolatitude && selectedLocation.LocalBusinessJsonLdgeolongitude 
                              ? `${selectedLocation.LocalBusinessJsonLdgeolatitude}, ${selectedLocation.LocalBusinessJsonLdgeolongitude}` 
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
              
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
