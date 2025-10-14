"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField,
  IconButton, Alert, Snackbar, CircularProgress, Container, Typography, Autocomplete,
  Select, MenuItem, Pagination
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
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

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
    setSuccess(null);

    // Basic validation - only require name and slug
    if (!form.name || !form.slug) {
      setError('Name and slug are required fields');
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

      setSuccess(editId ? 'Location updated successfully' : 'Location added successfully');
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
  const handleCityChange = (event: React.SyntheticEvent, value: { _id: string; name: string } | null) => {
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
            onChange={(e) => setPagination(prev => ({
              ...prev,
              limit: Number(e.target.value),
              page: 1 // Reset to first page when changing page size
            }))}
            sx={{ minWidth: 80 }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </Box>
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
                        onClick={() => handleEdit(location)} 
                        color={viewOnly ? 'default' : 'primary'}
                        disabled={viewOnly}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => setDeleteId(location._id)}
                        color={viewOnly ? 'default' : 'error'}
                        disabled={viewOnly}
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
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  value={languageSearch}
                />
              )}
            />
            
            {/* LocalBusinessJsonLd Section */}
            <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
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
                rows={3}
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
        onClose={() => !deleteSubmitting && setDeleteId(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
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
