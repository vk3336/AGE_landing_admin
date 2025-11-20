"use client";
import React, { useState, useEffect, useCallback } from 'react';
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
  slug?: string;
  longitude?: number;
  latitude?: number;
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
  IconButton, Alert, Snackbar, CircularProgress, Container, Typography, Autocomplete,
  Pagination, MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';

interface State {
  _id?: string;
  name: string;
  code: string;
  country: string | { _id: string; name: string };
  slug?: string;
  longitude?: number;
  latitude?: number;
  status?: 'active' | 'inactive';
  is_default?: boolean;
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
  country_name: string; // Add country_name to match the form state
  country_code: string;
  slug: string;
  longitude: number;
  latitude: number;
  _id?: string;
  status?: 'active' | 'inactive';
  is_default?: boolean;
}

// Get all states from a comprehensive list
const getAllStates = (): StateData[] => {
  const allStates: StateData[] = [];
  
  // Add US states with coordinates
  const usStates = [
    { name: 'Alabama', code: 'AL', longitude: -86.829534, latitude: 33.258882 },
    { name: 'Alaska', code: 'AK', longitude: -149.900284, latitude: 61.218056 },
    { name: 'Arizona', code: 'AZ', longitude: -112.074036, latitude: 33.448376 },
    { name: 'Arkansas', code: 'AR', longitude: -92.289595, latitude: 34.746483 },
    { name: 'California', code: 'CA', longitude: -119.417931, latitude: 36.778259 },
    { name: 'Colorado', code: 'CO', longitude: -105.550567, latitude: 39.113014 },
    { name: 'Connecticut', code: 'CT', longitude: -72.673371, latitude: 41.765804 },
    { name: 'Delaware', code: 'DE', longitude: -75.527672, latitude: 39.158169 },
    { name: 'Florida', code: 'FL', longitude: -81.515755, latitude: 27.994402 },
    { name: 'Georgia', code: 'GA', longitude: -84.390185, latitude: 33.748997 },
    { name: 'Hawaii', code: 'HI', longitude: -157.858337, latitude: 21.306944 },
    { name: 'Idaho', code: 'ID', longitude: -116.237654, latitude: 43.61656 },
    { name: 'Illinois', code: 'IL', longitude: -89.398528, latitude: 40.633125 },
    { name: 'Indiana', code: 'IN', longitude: -86.162827, latitude: 39.768402 },
    { name: 'Iowa', code: 'IA', longitude: -93.620866, latitude: 41.591064 },
    { name: 'Kansas', code: 'KS', longitude: -95.689018, latitude: 39.048191 },
    { name: 'Kentucky', code: 'KY', longitude: -84.27002, latitude: 38.200905 },
    { name: 'Louisiana', code: 'LA', longitude: -91.14032, latitude: 30.458283 },
    { name: 'Maine', code: 'ME', longitude: -69.765261, latitude: 44.310624 },
    { name: 'Maryland', code: 'MD', longitude: -76.641273, latitude: 39.045753 },
    { name: 'Massachusetts', code: 'MA', longitude: -71.382439, latitude: 42.407211 },
    { name: 'Michigan', code: 'MI', longitude: -84.555534, latitude: 42.732536 },
    { name: 'Minnesota', code: 'MN', longitude: -93.094116, latitude: 44.955097 },
    { name: 'Mississippi', code: 'MS', longitude: -90.203689, latitude: 32.298757 },
    { name: 'Missouri', code: 'MO', longitude: -92.288368, latitude: 38.576702 },
    { name: 'Montana', code: 'MT', longitude: -110.362566, latitude: 46.96526 },
    { name: 'Nebraska', code: 'NE', longitude: -99.901813, latitude: 41.50082 },
    { name: 'Nevada', code: 'NV', longitude: -119.753877, latitude: 38.80261 },
    { name: 'New Hampshire', code: 'NH', longitude: -71.572395, latitude: 43.193852 },
    { name: 'New Jersey', code: 'NJ', longitude: -74.405661, latitude: 40.058323 },
    { name: 'New Mexico', code: 'NM', longitude: -105.87009, latitude: 34.51994 },
    { name: 'New York', code: 'NY', longitude: -74.217933, latitude: 42.65258 },
    { name: 'North Carolina', code: 'NC', longitude: -78.644257, latitude: 35.780398 },
    { name: 'North Dakota', code: 'ND', longitude: -100.779004, latitude: 47.650589 },
    { name: 'Ohio', code: 'OH', longitude: -82.907123, latitude: 40.367474 },
    { name: 'Oklahoma', code: 'OK', longitude: -97.516428, latitude: 35.007752 },
    { name: 'Oregon', code: 'OR', longitude: -120.554201, latitude: 43.804133 },
    { name: 'Pennsylvania', code: 'PA', longitude: -77.194527, latitude: 40.264378 },
    { name: 'Rhode Island', code: 'RI', longitude: -71.477429, latitude: 41.580093 },
    { name: 'South Carolina', code: 'SC', longitude: -81.163727, latitude: 33.836082 },
    { name: 'South Dakota', code: 'SD', longitude: -100.247164, latitude: 44.299782 },
    { name: 'Tennessee', code: 'TN', longitude: -86.580444, latitude: 35.860119 },
    { name: 'Texas', code: 'TX', longitude: -99.901813, latitude: 31.968599 },
    { name: 'Utah', code: 'UT', longitude: -111.931176, latitude: 40.233845 },
    { name: 'Vermont', code: 'VT', longitude: -72.577841, latitude: 44.558803 },
    { name: 'Virginia', code: 'VA', longitude: -78.024139, latitude: 37.926868 },
    { name: 'Washington', code: 'WA', longitude: -120.740135, latitude: 47.751076 },
    { name: 'West Virginia', code: 'WV', longitude: -80.184525, latitude: 38.920171 },
    { name: 'Wisconsin', code: 'WI', longitude: -89.301438, latitude: 44.5 },
    { name: 'Wyoming', code: 'WY', longitude: -107.290283, latitude: 43.07597 },
  ];

  // Add Indian states with coordinates
  const indianStates = [
    { name: 'Andhra Pradesh', code: 'AP', longitude: 80.049922, latitude: 15.9129 },
    { name: 'Arunachal Pradesh', code: 'AR', longitude: 93.616669, latitude: 27.10038 },
    { name: 'Assam', code: 'AS', longitude: 91.750168, latitude: 26.143316 },
    { name: 'Bihar', code: 'BR', longitude: 85.137566, latitude: 25.679658 },
    { name: 'Chhattisgarh', code: 'CG', longitude: 81.866066, latitude: 21.278657 },
    { name: 'Goa', code: 'GA', longitude: 73.856255, latitude: 15.49093 },
    { name: 'Gujarat', code: 'GJ', longitude: 72.571365, latitude: 23.022505 },
    { name: 'Haryana', code: 'HR', longitude: 77.015026, latitude: 28.704059 },
    { name: 'Himachal Pradesh', code: 'HP', longitude: 77.101944, latitude: 31.104815 },
    { name: 'Jharkhand', code: 'JH', longitude: 85.279935, latitude: 23.610181 },
    { name: 'Karnataka', code: 'KA', longitude: 77.577511, latitude: 12.971599 },
    { name: 'Kerala', code: 'KL', longitude: 76.27108, latitude: 10.850516 },
    { name: 'Madhya Pradesh', code: 'MP', longitude: 78.032192, latitude: 23.473324 },
    { name: 'Maharashtra', code: 'MH', longitude: 73.789803, latitude: 18.52043 },
    { name: 'Manipur', code: 'MN', longitude: 93.906269, latitude: 24.663717 },
    { name: 'Meghalaya', code: 'ML', longitude: 91.678152, latitude: 25.467031 },
    { name: 'Mizoram', code: 'MZ', longitude: 92.937574, latitude: 23.810332 },
    { name: 'Nagaland', code: 'NL', longitude: 94.164127, latitude: 26.158435 },
    { name: 'Odisha', code: 'OD', longitude: 85.817825, latitude: 20.296059 },
    { name: 'Punjab', code: 'PB', longitude: 75.341217, latitude: 31.147131 },
    { name: 'Rajasthan', code: 'RJ', longitude: 74.217933, latitude: 27.023804 },
    { name: 'Sikkim', code: 'SK', longitude: 88.512218, latitude: 27.532972 },
    { name: 'Tamil Nadu', code: 'TN', longitude: 80.270186, latitude: 13.067439 },
    { name: 'Telangana', code: 'TS', longitude: 78.486671, latitude: 17.385044 },
    { name: 'Tripura', code: 'TR', longitude: 91.988153, latitude: 23.831457 },
    { name: 'Uttar Pradesh', code: 'UP', longitude: 80.946166, latitude: 26.846694 },
    { name: 'Uttarakhand', code: 'UK', longitude: 78.032192, latitude: 30.316496 },
    { name: 'West Bengal', code: 'WB', longitude: 88.363892, latitude: 22.572645 },
  ];

  // Add other countries' states/regions with coordinates
  const otherStates = [
    // Canada
    { name: 'Alberta', code: 'AB', country: 'Canada', country_code: 'CA', longitude: -114.0719, latitude: 51.0447 },
    { name: 'British Columbia', code: 'BC', country: 'Canada', country_code: 'CA', longitude: -123.3656, latitude: 48.4284 },
    { name: 'Manitoba', code: 'MB', country: 'Canada', country_code: 'CA', longitude: -97.1384, latitude: 49.8951 },
    { name: 'New Brunswick', code: 'NB', country: 'Canada', country_code: 'CA', longitude: -66.4619, latitude: 46.5653 },
    { name: 'Newfoundland and Labrador', code: 'NL', country: 'Canada', country_code: 'CA', longitude: -56.1242, latitude: 48.5107 },
    { name: 'Northwest Territories', code: 'NT', country: 'Canada', country_code: 'CA', longitude: -114.3718, latitude: 64.8255 },
    { name: 'Nova Scotia', code: 'NS', country: 'Canada', country_code: 'CA', longitude: -63.5752, latitude: 44.6816 },
    { name: 'Nunavut', code: 'NU', country: 'Canada', country_code: 'CA', longitude: -85.2532, latitude: 70.4536 },
    { name: 'Ontario', code: 'ON', country: 'Canada', country_code: 'CA', longitude: -79.3832, latitude: 43.6532 },
    { name: 'Prince Edward Island', code: 'PE', country: 'Canada', country_code: 'CA', longitude: -63.4057, latitude: 46.5107 },
    { name: 'Quebec', code: 'QC', country: 'Canada', country_code: 'CA', longitude: -71.2080, latitude: 46.8139 },
    { name: 'Saskatchewan', code: 'SK', country: 'Canada', country_code: 'CA', longitude: -106.3346, latitude: 52.9399 },
    { name: 'Yukon', code: 'YT', country: 'Canada', country_code: 'CA', longitude: -135.0568, latitude: 64.2823 },
    
    // United Kingdom
    { name: 'England', code: 'ENG', country: 'United Kingdom', country_code: 'GB', longitude: -1.1743, latitude: 52.3555 },
    { name: 'Scotland', code: 'SCT', country: 'United Kingdom', country_code: 'GB', longitude: -4.2026, latitude: 56.4907 },
    { name: 'Wales', code: 'WLS', country: 'United Kingdom', country_code: 'GB', longitude: -3.7837, latitude: 52.1307 },
    { name: 'Northern Ireland', code: 'NIR', country: 'United Kingdom', country_code: 'GB', longitude: -6.4923, latitude: 54.5973 },
    
    // Australia
    { name: 'Australian Capital Territory', code: 'ACT', country: 'Australia', country_code: 'AU', longitude: 149.1289, latitude: -35.2809 },
    { name: 'New South Wales', code: 'NSW', country: 'Australia', country_code: 'AU', longitude: 150.8931, latitude: -33.8688 },
    { name: 'Northern Territory', code: 'NT', country: 'Australia', country_code: 'AU', longitude: 132.5508, latitude: -19.4914 },
    { name: 'Queensland', code: 'QLD', country: 'Australia', country_code: 'AU', longitude: 145.0233, latitude: -20.9176 },
    { name: 'South Australia', code: 'SA', country: 'Australia', country_code: 'AU', longitude: 138.6007, latitude: -34.9285 },
    { name: 'Tasmania', code: 'TAS', country: 'Australia', country_code: 'AU', longitude: 147.3272, latitude: -42.8821 },
    { name: 'Victoria', code: 'VIC', country: 'Australia', country_code: 'AU', longitude: 144.9631, latitude: -37.8136 },
    { name: 'Western Australia', code: 'WA', country: 'Australia', country_code: 'AU', longitude: 121.4747, latitude: -25.2744 },
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
  const [allStates, setAllStates] = useState<StateData[]>([]);
  const [filteredStates, setFilteredStates] = useState<StateData[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  
  useEffect(() => {
    const access = getStatePagePermission();
    setPageAccess(access);
  }, []);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Load all states when component mounts
  useEffect(() => {
    try {
      console.log('Loading states...');
      const loadedStates = getAllStates();
      console.log('Loaded states:', loadedStates);
      setAllStates(loadedStates);
    } catch (error) {
      console.error('Error loading states:', error);
    }
  }, []);

  

  // Handle country change
  const handleCountryChange = useCallback((event: React.SyntheticEvent, value: Country | null) => {
    const newCountryCode = value?.code || '';
    console.log('Selected country code:', newCountryCode);
    
    setForm(prev => ({
      ...prev,
      country: value?._id || '',
      country_name: value?.name || '',
      country_code: newCountryCode,
      // Reset state when country changes
      name: '',
      code: '',
      slug: ''
    }));

    // Filter states based on selected country
    if (newCountryCode) {
      const filtered = allStates.filter(state => state.country_code === newCountryCode);
      console.log(`Filtered states for ${value?.name} (${newCountryCode}):`, filtered);
      setFilteredStates(filtered);
    } else {
      console.log('No country code provided, clearing states');
      setFilteredStates([]);
    }
  }, [allStates]);

  const [form, setForm] = useState<FormState>({ 
    name: '', 
    code: '', 
    country: '',
    country_name: '',
    country_code: '',
    slug: '',
    longitude: 0,
    latitude: 0,
    status: 'active'
  });
  // Update filteredStates when selected country_code or allStates changes
  useEffect(() => {
    if (form.country_code) {
      const filtered = allStates.filter(state => state.country_code === form.country_code);
      setFilteredStates(filtered);
    } else {
      setFilteredStates([]);
    }
  }, [form.country_code, allStates]);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [viewOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch states
  const fetchStates = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      console.log('Fetching states from API...');
      const query = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search })
      }).toString();
      
      const res = await apiFetch(`/states?${query}`);
      const response = await res.json();
      console.log('API response:', response);
      
      if (response && response.status === 'success' && response.data) {
        const { states: statesData, pagination: paginationData } = response.data;
        setStates(statesData || []);
        
        if (paginationData) {
          setPagination(prev => ({
            ...prev,
            page: paginationData.page || 1,
            total: paginationData.total || 0,
            pages: paginationData.pages || 1,
            limit: paginationData.limit || 10
          }));
        }
      } else {
        setStates([]);
      }
    } catch (error: unknown) {
      let errorMessage = 'Failed to load states';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      setError(errorMessage);
      console.error('Error fetching states:', error);
      setStates([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStates(1, searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm, fetchStates]);
  
  // Initial load and page change
  useEffect(() => {
    fetchStates(pagination.page, searchTerm);
  }, [pagination.page, fetchStates, form.country, form.country_code, searchTerm]);
  
  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const handleStateSelect = useCallback((state: StateData) => {
    const slug = state.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    // Find the country object that matches the selected state's country_code
    const selectedCountry = countries.find(c => c.code === state.country_code);
    
    setForm(prev => ({
      ...prev,
      name: state.name || '',
      code: state.code || '',
      country: selectedCountry?._id || '',
      country_name: state.country || '',
      country_code: state.country_code || '',
      longitude: state.longitude ?? 0,
      latitude: state.latitude ?? 0,
      slug: slug
    }));
  }, [countries]);

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
        longitude?: number;
        latitude?: number;
      }

      // Prepare data for submission
      const formData: FormSubmissionData = {
        name: form.name.trim(),
        code: form.code.trim(),
        slug: form.slug?.trim() || form.name.toLowerCase().replace(/\s+/g, '-'),
        longitude: form.longitude,
        latitude: form.latitude
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

  const handleEdit = (state: State) => {
    // Get the country ID and name
    const countryId = typeof state.country === 'object' ? state.country._id : state.country;
    const countryName = typeof state.country === 'object' ? state.country.name : '';
    
    // Find the country in our countries list to get its code
    const selectedCountry = countries.find(c => c._id === countryId);
    
    setEditId(state._id || null);
    
    // Create form data with proper types
    setForm({
      name: state.name,
      code: state.code,
      country: countryId || '',
      country_name: countryName,
      country_code: selectedCountry?.code || '',
      slug: state.slug || '',
      longitude: state.longitude ?? 0,
      latitude: state.latitude ?? 0,
      status: state.status || 'active',
      is_default: state.is_default || false
    });
    
    // If we have a country code, update the filtered states
    if (selectedCountry?.code) {
      const filtered = allStates.filter(s => s.country_code === selectedCountry.code);
      setFilteredStates(filtered);
    }
    
    setOpenForm(true);
  };

  const handleAddNew = () => {
    setEditId(null);
    setForm({ 
      name: '', 
      code: '', 
      country: '', 
      country_name: '',
      country_code: '', 
      slug: '', 
      longitude: 0, 
      latitude: 0,
      status: 'active'
    });
    setOpenForm(true);
  };

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
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">States</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            disabled={pageAccess === 'only view'}
          >
            Add State
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search states by name, code, or country..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              // Reset to first page when searching
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
            }}
          />
          <TextField
            select
            variant="outlined"
            value={pagination.limit}
            onChange={(e) => {
              const newLimit = Number(e.target.value);
              setPagination(prev => ({
                ...prev,
                limit: newLimit,
                page: 1 // Reset to first page when changing page size
              }));
            }}
            sx={{ minWidth: 100 }}
          >
            {[5, 10, 25, 50, 100].map((size) => (
              <MenuItem key={size} value={size}>
                {size} per page
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Longitude</TableCell>
              <TableCell>Latitude</TableCell>
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
                <TableCell>{state.longitude?.toFixed(6) || '-'}</TableCell>
                <TableCell>{state.latitude?.toFixed(6) || '-'}</TableCell>
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
            {states.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="subtitle1" color="textSecondary">
                    No states found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
          <Pagination 
            count={pagination.pages} 
            page={pagination.page}
            onChange={(_, page) => {
              setPagination(prev => ({ ...prev, page }));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            color="primary"
            showFirstButton
            showLastButton
            disabled={loading}
          />
        </Box>
      )}
      
      {/* Pagination Info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Showing {states.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} states
        </Typography>
      </Box>

      {/* State Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editId ? 'Edit State' : 'Add New State'}</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Autocomplete
              onOpen={fetchCountries}
              options={countries}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              value={countries.find(c => c._id === form.country) || null}
              onChange={handleCountryChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Country "
                  margin="normal"
                  InputProps={{
                    ...params.InputProps,
                  }}
                  helperText="Select the country first, then choose the state"
                />
              )}
            />

            <Autocomplete<string, false, false, false>
              options={form.country_code 
                ? Array.from(new Set(filteredStates.map(s => s.name)))
                : []}
              value={form.name}
              disabled={!form.country_code}
              noOptionsText={form.country_code ? 'No states found for this country' : 'Please select a country first'}
              onChange={(event: React.SyntheticEvent, newValue: string | null) => {
                if (newValue) {
                  const selectedState = filteredStates.find(s => s.name === newValue);
                  if (selectedState) {
                    handleStateSelect(selectedState);
                  }
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Longitude"
                fullWidth
                margin="normal"
                type="number"
                value={form.longitude}
                onChange={(e) => setForm({...form, longitude: parseFloat(e.target.value) || 0})}
                inputProps={{ step: "0.000001" }}
                helperText="Enter the longitude coordinate"
              />
              <TextField
                label="Latitude"
                fullWidth
                margin="normal"
                type="number"
                value={form.latitude}
                onChange={(e) => setForm({...form, latitude: parseFloat(e.target.value) || 0})}
                inputProps={{ step: "0.000001" }}
                helperText="Enter the latitude coordinate"
              />
            </Box>
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
