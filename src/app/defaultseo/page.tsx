"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, 
  Dialog, DialogContent, DialogActions, TextField, IconButton, Chip, FormControl, 
  InputLabel, Select, MenuItem, Pagination, Snackbar, Alert, InputBase,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon, 
  Visibility as VisibilityIcon,
  Close as CloseIcon 
} from '@mui/icons-material';
import { apiFetch } from '../../utils/apiFetch';

interface DefaultSeo {
  _id?: string;
  status?: 'draft' | 'published' | 'archived';
  robots?: string;
  charset?: string;
  xUaCompatible?: string;
  viewport?: string;
  googleSiteVerification?: string;
  microsofttoken: string;
  gaId: string;
  clarityId: string;
  mobileWebAppCapable?: string;
  appleStatusBarStyle?: string;
  formatDetection?: string;
  twittersite?: string;
  ogsitename?: string;
  
  // Local business SEO
  localbussinessjsonldtype?: string;
  localbussinessjsonldcontext?: string;
  localbussinessjsonldname?: string;
  localbussinessjsonldtelephone?: string;
  localbussinessjsonldareaserved?: string;
  localbussinessjsonldaddresstype?: string;
  localbussinessjsonldaddressstreetaddress?: string;
  localbussinessjsonldaddressaddresslocality?: string;
  localbussinessjsonldaddressaddressregion?: string;
  localbussinessjsonldaddresspostalcode?: string;
  localbussinessjsonldaddressaddresscountry?: string;
  localbussinessjsonldgeotype?: string;
  localbussinessjsonldgeolatitude?: number;
  localbussinessjsonldgeolongitude?: number;
  
  // Logo JSON
  LogoJsonLdcontext?: string;
  LogoJsonLdtype?: string;
  logoJsonLdurl?: string;
  logoJsonLdwidth?: string;
  logoJsonLdheight?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
  
  [key: string]: string | number | boolean | undefined | null | Date;
}

function getDefaultSeoPermission() {
  if (typeof window === 'undefined') return 'no access';
  
  try {
    const email = localStorage.getItem('admin-email');
    const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN;
    if (email && superAdmin && email === superAdmin) return 'all access';
    
    const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
    if (perms && perms.seo) {
      return perms.seo;
    }
  } catch (error) {
    console.error('Error checking permissions:', error);
  }
  
  return 'no access';
}

export default function DefaultSeoPage() {
  const [defaultSeos, setDefaultSeos] = useState<Partial<DefaultSeo>[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSeo, setEditingSeo] = useState<Partial<DefaultSeo> | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedSeo, setSelectedSeo] = useState<Partial<DefaultSeo> | null>(null);
  const [open, setOpen] = useState(false);
  
  // Update page access after component mounts (client-side only)
  useEffect(() => {
    setPageAccess(getDefaultSeoPermission());
  }, []);

  const DEFAULT_SEO_FIELDS: Array<{
    section?: string;
    key?: string;
    label?: string;
    type?: 'text' | 'number' | 'textarea' | 'select';
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
    required?: boolean;
  }> = [
    { section: "Basic Configuration" },
    { 
      key: "status", 
      label: "Status", 
      type: "select", 
      placeholder: "Select status",
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
        { value: 'archived', label: 'Archived' }
      ]
    },
    { key: "robots", label: "Robots", type: "text", placeholder: "e.g., index, follow" },
    { key: "charset", label: "Charset", type: "text", placeholder: "e.g., UTF-8" },
    { key: "xUaCompatible", label: "X-UA-Compatible", type: "text", placeholder: "e.g., IE=edge" },
    { key: "viewport", label: "Viewport", type: "text", placeholder: "e.g., width=device-width, initial-scale=1.0" },
    
    { section: "Analytics & Verification" },
    { key: "googleSiteVerification", label: "Google Site Verification", type: "text", placeholder: "Verification code" },
    { key: "microsofttoken", label: "Microsoft Token", type: "text", required: true, placeholder: "Token" },
    { key: "gaId", label: "Google Analytics ID", type: "text", required: true, placeholder: "GA ID" },
    { key: "clarityId", label: "Clarity ID", type: "text", required: true, placeholder: "Clarity ID" },
    
    { section: "Mobile & App Configuration" },
    { key: "mobileWebAppCapable", label: "Mobile Web App Capable", type: "text", placeholder: "yes/no" },
    { key: "appleStatusBarStyle", label: "Apple Status Bar Style", type: "text", placeholder: "e.g., black-translucent" },
    { key: "formatDetection", label: "Format Detection", type: "text", placeholder: "e.g., telephone=no" },
    
    { section: "Social Media" },
    { key: "twittersite", label: "Twitter Site", type: "text", placeholder: "@username" },
    { key: "ogsitename", label: "OG Site Name", type: "text", placeholder: "Site name" },
    
    { section: "Local Business JSON-LD" },
    { key: "localbussinessjsonldtype", label: "Type", type: "text", placeholder: "LocalBusiness" },
    { key: "localbussinessjsonldcontext", label: "Context", type: "text", placeholder: "https://schema.org" },
    { key: "localbussinessjsonldname", label: "Name", type: "text", placeholder: "Business name" },
    { key: "localbussinessjsonldtelephone", label: "Telephone", type: "text", placeholder: "+1-000-000-0000" },
    { key: "localbussinessjsonldareaserved", label: "Area Served", type: "text", placeholder: "Service area" },
    { key: "localbussinessjsonldaddresstype", label: "Address Type", type: "text", placeholder: "PostalAddress" },
    { key: "localbussinessjsonldaddressstreetaddress", label: "Street Address", type: "text", placeholder: "123 Main St" },
    { key: "localbussinessjsonldaddressaddresslocality", label: "Locality", type: "text", placeholder: "City" },
    { key: "localbussinessjsonldaddressaddressregion", label: "Region", type: "text", placeholder: "State" },
    { key: "localbussinessjsonldaddresspostalcode", label: "Postal Code", type: "text", placeholder: "ZIP code" },
    { key: "localbussinessjsonldaddressaddresscountry", label: "Country", type: "text", placeholder: "Country" },
    { key: "localbussinessjsonldgeotype", label: "Geo Type", type: "text", placeholder: "GeoCoordinates" },
    { key: "localbussinessjsonldgeolatitude", label: "Latitude", type: "number", placeholder: "Latitude" },
    { key: "localbussinessjsonldgeolongitude", label: "Longitude", type: "number", placeholder: "Longitude" },
    
    { section: "Logo JSON-LD" },
    { key: "LogoJsonLdcontext", label: "Context", type: "text", placeholder: "https://schema.org" },
    { key: "LogoJsonLdtype", label: "Type", type: "text", placeholder: "Organization" },
    { key: "logoJsonLdurl", label: "Logo URL", type: "text", placeholder: "https://example.com/logo.png" },
    { key: "logoJsonLdwidth", label: "Width", type: "text", placeholder: "Width in pixels" },
    { key: "logoJsonLdheight", label: "Height", type: "text", placeholder: "Height in pixels" },
  ];

  const fetchDefaultSeos = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = `/defaultseo`;
      
      console.log('Fetching default SEOs from:', endpoint);
      const response = await apiFetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received default SEOs data:', data);
      
      setDefaultSeos(Array.isArray(data) ? data : []);
      setTotalPages(1);
    } catch (error) {
      console.error('Error fetching default SEOs:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching default SEOs',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDefaultSeos();
  }, [fetchDefaultSeos]);

  const handleOpen = (seo?: Partial<DefaultSeo>) => {
    if (seo) {
      setEditingSeo({ ...seo });
    } else {
      setEditingSeo({ 
        status: 'draft',
        robots: 'index, follow',
        charset: 'UTF-8',
        xUaCompatible: 'IE=edge',
        viewport: 'width=device-width, initial-scale=1.0'
      });
    }
    setOpen(true);
  };

  const handleView = (seo: Partial<DefaultSeo>) => {
    setSelectedSeo(seo);
    setViewOpen(true);
  };

  const handleViewClose = () => {
    setViewOpen(false);
    setSelectedSeo(null);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSeo(null);
  };

  type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
  type GenericChangeEvent = { target: { name?: string; value: unknown } } | { currentTarget: { name?: string; value: unknown } } | { name: string; value: unknown };

  const handleChange = (e: InputChangeEvent | GenericChangeEvent) => {
    let name: string | undefined;
    let value: unknown;
    let type: string | undefined;

    if ('target' in e && e.target) {
      const target = e.target as { name?: string; value: unknown; type?: string };
      name = target.name;
      value = target.value;
      type = target.type;
    } else if ('currentTarget' in e && e.currentTarget) {
      const target = e.currentTarget as { name?: string; value: unknown };
      name = target.name;
      value = target.value;
    } else if ('name' in e && 'value' in e) {
      name = e.name;
      value = e.value;
    }

    if (!editingSeo || !name) return;

    setEditingSeo(prev => {
      if (!prev) return prev;
      return { ...prev, [name!]: type === 'number' ? Number(value) : value } as Partial<DefaultSeo>;
    });
  };

  const handleSubmit = async () => {
    if (pageAccess !== 'all access') {
      setSnackbar({ open: true, message: 'You do not have permission to perform this action', severity: 'error' });
      return;
    }

    try {
      setLoading(true);
      if (editingSeo?._id) {
        // Update existing
        await apiFetch(`/defaultseo/${editingSeo._id}`, {
          method: 'PUT',
          body: JSON.stringify(editingSeo)
        });
        setSnackbar({ open: true, message: 'Default SEO updated successfully', severity: 'success' });
      } else if (editingSeo) {
        // Create new
        await apiFetch('/defaultseo', {
          method: 'POST',
          body: JSON.stringify(editingSeo)
        });
        setSnackbar({ open: true, message: 'Default SEO created successfully', severity: 'success' });
      }
      fetchDefaultSeos();
      handleClose();
    } catch (error) {
      console.error('Error saving default SEO:', error);
      setSnackbar({ open: true, message: 'Failed to save default SEO', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (pageAccess !== 'all access') {
      setSnackbar({ open: true, message: 'You do not have permission to perform this action', severity: 'error' });
      return;
    }

    if (window.confirm('Are you sure you want to delete this default SEO entry?')) {
      try {
        await apiFetch(`/defaultseo/${id}`, { method: 'DELETE' });
        setSnackbar({ open: true, message: 'Default SEO deleted successfully', severity: 'success' });
        fetchDefaultSeos();
      } catch (error) {
        console.error('Error deleting default SEO:', error);
        setSnackbar({ open: true, message: 'Failed to delete default SEO', severity: 'error' });
      }
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown> | null, value: number) => {
    setPage(value);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {pageAccess === 'no access' ? (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" color="error">
            You don&apos;t have permission to access this page.
          </Typography>
        </Box>
      ) : (
        <Box>
          {pageAccess === 'only view' && (
            <Box sx={{ mb: 2 }}>
              <Paper elevation={2} sx={{ p: 2, bgcolor: '#fffbe6', border: '1px solid #ffe58f' }}>
                <Typography color="#ad6800" fontWeight={600}>
                  You have view-only access. To make changes, contact your admin.
                </Typography>
              </Paper>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Default SEO Management</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              disabled={pageAccess !== 'all access'}
            >
              Add New Default SEO
            </Button>
          </Box>

          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', backgroundColor: 'background.paper', borderRadius: 1, px: 2, py: 1, maxWidth: 400 }}>
            <SearchIcon color="action" sx={{ mr: 1 }} />
            <InputBase
              placeholder="Search default SEO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  fetchDefaultSeos();
                }
              }}
              sx={{ flex: 1 }}
            />
          </Box>

          <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>GA ID</TableCell>
                    <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Clarity ID</TableCell>
                    <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Microsoft Token</TableCell>
                    <TableCell align="right" sx={{ color: 'common.white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : defaultSeos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No default SEO entries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    defaultSeos.map((seo) => (
                      <TableRow key={seo._id}>
                        <TableCell>
                          <Chip
                            label={seo.status || 'draft'}
                            color={
                              seo.status === 'published' 
                                ? 'success' 
                                : seo.status === 'archived' 
                                  ? 'default' 
                                  : 'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{seo.gaId || '-'}</TableCell>
                        <TableCell>{seo.clarityId || '-'}</TableCell>
                        <TableCell>{seo.microsofttoken || '-'}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handleView(seo)} title="View">
                            <VisibilityIcon color="info" />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleOpen(seo)} 
                            title="Edit"
                            disabled={pageAccess !== 'all access'}
                          >
                            <EditIcon color="primary" />
                          </IconButton>
                          <IconButton 
                            onClick={() => seo._id && handleDelete(seo._id)} 
                            title="Delete"
                            disabled={pageAccess !== 'all access'}
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>

          <Dialog 
            open={open} 
            onClose={handleClose} 
            fullScreen
            maxWidth="xl"
          >
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6">
                  {editingSeo?._id ? 'Edit Default SEO' : 'Create New Default SEO'}
                </Typography>
                <IconButton color="inherit" onClick={handleClose} edge="end">
                  <CloseIcon />
                </IconButton>
              </Box>
              <DialogContent sx={{ p: 3, height: 'calc(100vh - 120px)' }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 2,
                  height: '100%',
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: '#555',
                  }
                }}>
                  {DEFAULT_SEO_FIELDS.map((field, index) => {
                    if ('section' in field) {
                      return (
                        <Typography key={`section-${index}`} variant="h6" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
                          {field.section}
                        </Typography>
                      );
                    }

                    if (!field.key) return null;

                    const value = editingSeo ? editingSeo[field.key] : undefined;

                    if (field.type === 'select' && field.key) {
                      return (
                        <FormControl key={field.key} fullWidth margin="normal">
                          <InputLabel>{field.label}</InputLabel>
                          <Select
                            name={field.key}
                            value={value || ''}
                            onChange={handleChange}
                            label={field.label}
                          >
                            {field.options?.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      );
                    }

                    if (field.type === 'textarea') {
                      return (
                        <TextField
                          key={field.key}
                          name={field.key}
                          label={field.label}
                          value={value || ''}
                          onChange={handleChange}
                          multiline
                          rows={4}
                          fullWidth
                          margin="normal"
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                      );
                    }

                    return (
                      <TextField
                        key={field.key}
                        name={field.key}
                        label={field.label}
                        value={value || ''}
                        onChange={handleChange}
                        type={field.type === 'number' ? 'number' : 'text'}
                        fullWidth
                        margin="normal"
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    );
                  })}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? 'Saving...' : editingSeo?._id ? 'Update' : 'Create'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
          >
            <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>

          {/* View Dialog */}
          <Dialog 
            open={viewOpen} 
            onClose={handleViewClose}
            fullScreen
            maxWidth="xl"
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">View Default SEO Details</Typography>
              <IconButton color="inherit" onClick={handleViewClose} edge="end">
                <CloseIcon />
              </IconButton>
            </Box>
            <DialogContent sx={{ p: 3, height: 'calc(100vh - 120px)' }}>
              {selectedSeo ? (
                <Box sx={{ 
                  height: '100%',
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: '#555',
                  }
                }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                    Basic Configuration
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, mb: 3 }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={selectedSeo.status || 'draft'} 
                        color={
                          selectedSeo.status === 'published' 
                            ? 'success' 
                            : selectedSeo.status === 'archived' 
                              ? 'default' 
                              : 'warning'
                        }
                        size="small"
                      />
                    </Box>
                    {selectedSeo.robots && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Robots</Typography>
                        <Typography>{selectedSeo.robots}</Typography>
                      </Box>
                    )}
                    {selectedSeo.charset && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Charset</Typography>
                        <Typography>{selectedSeo.charset}</Typography>
                      </Box>
                    )}
                    {selectedSeo.xUaCompatible && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">X-UA-Compatible</Typography>
                        <Typography>{selectedSeo.xUaCompatible}</Typography>
                      </Box>
                    )}
                    {selectedSeo.viewport && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Viewport</Typography>
                        <Typography>{selectedSeo.viewport}</Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                    Analytics & Verification
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, mb: 3 }}>
                    {selectedSeo.googleSiteVerification && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Google Site Verification</Typography>
                        <Typography>{selectedSeo.googleSiteVerification}</Typography>
                      </Box>
                    )}
                    {selectedSeo.microsofttoken && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Microsoft Token</Typography>
                        <Typography>{selectedSeo.microsofttoken}</Typography>
                      </Box>
                    )}
                    {selectedSeo.gaId && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Google Analytics ID</Typography>
                        <Typography>{selectedSeo.gaId}</Typography>
                      </Box>
                    )}
                    {selectedSeo.clarityId && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Clarity ID</Typography>
                        <Typography>{selectedSeo.clarityId}</Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                    Mobile & App Configuration
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, mb: 3 }}>
                    {selectedSeo.mobileWebAppCapable && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Mobile Web App Capable</Typography>
                        <Typography>{selectedSeo.mobileWebAppCapable}</Typography>
                      </Box>
                    )}
                    {selectedSeo.appleStatusBarStyle && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Apple Status Bar Style</Typography>
                        <Typography>{selectedSeo.appleStatusBarStyle}</Typography>
                      </Box>
                    )}
                    {selectedSeo.formatDetection && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Format Detection</Typography>
                        <Typography>{selectedSeo.formatDetection}</Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                    Social Media
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, mb: 3 }}>
                    {selectedSeo.twittersite && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Twitter Site</Typography>
                        <Typography>{selectedSeo.twittersite}</Typography>
                      </Box>
                    )}
                    {selectedSeo.ogsitename && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG Site Name</Typography>
                        <Typography>{selectedSeo.ogsitename}</Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                    Local Business JSON-LD
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, mb: 3 }}>
                    {selectedSeo.localbussinessjsonldtype && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                        <Typography>{selectedSeo.localbussinessjsonldtype}</Typography>
                      </Box>
                    )}
                    {selectedSeo.localbussinessjsonldcontext && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Context</Typography>
                        <Typography>{selectedSeo.localbussinessjsonldcontext}</Typography>
                      </Box>
                    )}
                    {selectedSeo.localbussinessjsonldname && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                        <Typography>{selectedSeo.localbussinessjsonldname}</Typography>
                      </Box>
                    )}
                    {selectedSeo.localbussinessjsonldtelephone && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Telephone</Typography>
                        <Typography>{selectedSeo.localbussinessjsonldtelephone}</Typography>
                      </Box>
                    )}
                    {selectedSeo.localbussinessjsonldareaserved && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Area Served</Typography>
                        <Typography>{selectedSeo.localbussinessjsonldareaserved}</Typography>
                      </Box>
                    )}
                    {selectedSeo.localbussinessjsonldaddresstype && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Address Type</Typography>
                        <Typography>{selectedSeo.localbussinessjsonldaddresstype}</Typography>
                      </Box>
                    )}
                    {selectedSeo.localbussinessjsonldaddressstreetaddress && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Street Address</Typography>
                        <Typography>{selectedSeo.localbussinessjsonldaddressstreetaddress}</Typography>
                      </Box>
                    )}
                    {selectedSeo.localbussinessjsonldaddressaddresslocality && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Locality</Typography>
                        <Typography>{selectedSeo.localbussinessjsonldaddressaddresslocality}</Typography>
                      </Box>
                    )}
                    {selectedSeo.localbussinessjsonldaddressaddressregion && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Region</Typography>
                        <Typography>{selectedSeo.localbussinessjsonldaddressaddressregion}</Typography>
                      </Box>
                    )}
                    {selectedSeo.localbussinessjsonldaddresspostalcode && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Postal Code</Typography>
                        <Typography>{selectedSeo.localbussinessjsonldaddresspostalcode}</Typography>
                      </Box>
                    )}
                    {selectedSeo.localbussinessjsonldaddressaddresscountry && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Country</Typography>
                        <Typography>{selectedSeo.localbussinessjsonldaddressaddresscountry}</Typography>
                      </Box>
                    )}
                    {selectedSeo.localbussinessjsonldgeotype && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Geo Type</Typography>
                        <Typography>{selectedSeo.localbussinessjsonldgeotype}</Typography>
                      </Box>
                    )}
                    {selectedSeo.localbussinessjsonldgeolatitude && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Latitude</Typography>
                        <Typography>{selectedSeo.localbussinessjsonldgeolatitude}</Typography>
                      </Box>
                    )}
                    {selectedSeo.localbussinessjsonldgeolongitude && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Longitude</Typography>
                        <Typography>{selectedSeo.localbussinessjsonldgeolongitude}</Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                    Logo JSON-LD
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, mb: 3 }}>
                    {selectedSeo.LogoJsonLdcontext && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Context</Typography>
                        <Typography>{selectedSeo.LogoJsonLdcontext}</Typography>
                      </Box>
                    )}
                    {selectedSeo.LogoJsonLdtype && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                        <Typography>{selectedSeo.LogoJsonLdtype}</Typography>
                      </Box>
                    )}
                    {selectedSeo.logoJsonLdurl && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Logo URL</Typography>
                        <Typography>{selectedSeo.logoJsonLdurl}</Typography>
                      </Box>
                    )}
                    {selectedSeo.logoJsonLdwidth && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Width</Typography>
                        <Typography>{selectedSeo.logoJsonLdwidth}</Typography>
                      </Box>
                    )}
                    {selectedSeo.logoJsonLdheight && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Height</Typography>
                        <Typography>{selectedSeo.logoJsonLdheight}</Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Timestamps */}
                  {(selectedSeo.createdAt || selectedSeo.updatedAt) && (
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Timestamps</Typography>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        {selectedSeo.createdAt && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Created At</Typography>
                            <Typography variant="body2">
                              {new Date(selectedSeo.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                        {selectedSeo.updatedAt && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">Updated At</Typography>
                            <Typography variant="body2">
                              {new Date(selectedSeo.updatedAt).toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography>No data available</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleViewClose}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
}