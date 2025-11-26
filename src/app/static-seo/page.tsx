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

// Removed unused BaseField and SectionField interfaces

interface TopicPageSEO {
  _id?: string;
  // Basic Identification
  name: string;
  slug?: string;
  producttag?: string | string[];
  
  // Standard Meta Tags
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  canonical_url?: string;
  excerpt?: string;
  description_html?: string;
  
  // HTML Meta Configuration
  contentLanguage?: string;
  
  // Open Graph
  ogLocale?: string;
  og_twitter_Title?: string;
  og_twitter_Description?: string;
  ogType?: string;
  openGraph?: {
    images?: string[];
    video?: {
      url?: string;
      secure_url?: string;
      type?: string;
      width?: number;
      height?: number;
    };
  };
  
  // Twitter
  twitterCard?: string;
  twitter?: {
    image?: string;
    player?: string;
    player_width?: number;
    player_height?: number;
  };
  
  // JSON-LD
  VideoJsonLd?: string;
  
  // Status
  status?: 'draft' | 'published' | 'archived';
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
  
  // For form handling
  [key: string]: string | number | boolean | undefined | null | Date | Record<string, unknown> | Array<unknown>;
}

function getTopicPageSeoPermission() {
  // This function will be re-evaluated on the client side
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

export default function TopicPageSeoPage() {
  const [topicPageSeos, setTopicPageSeos] = useState<Partial<TopicPageSEO>[]>([]);
  const [loading, setLoading] = useState(false);
  // Removed unused isSubmitting state
  const [editingSeo, setEditingSeo] = useState<Partial<TopicPageSEO> | null>(null);
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
  const [selectedSeo, setSelectedSeo] = useState<Partial<TopicPageSEO> | null>(null);
  const [open, setOpen] = useState(false);
  const [availableProductTags, setAvailableProductTags] = useState<string[]>([]);
  
  // Update page access after component mounts (client-side only)
  useEffect(() => {
    setPageAccess(getTopicPageSeoPermission());
  }, []);

  const TOPIC_PAGE_SEO_FIELDS: Array<{
    section?: string;
    key?: string;
    label?: string;
    type?: 'text' | 'number' | 'textarea' | 'select';
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
    required?: boolean;
  }> = [
    { section: "Basic Info" },
    { key: "name", label: "Name", type: "text", required: true, placeholder: "Enter name" },
    { key: "slug", label: "Slug", type: "text", placeholder: "Enter URL slug" },
    { key: "meta_title", label: "Meta Title", type: "text", placeholder: "Enter meta title" },
    { key: "meta_description", label: "Meta Description", type: "text", placeholder: "Enter meta description" },
    { key: "keywords", label: "Keywords", type: "text", placeholder: "Enter keywords (comma separated)" },
    { key: "producttag", label: "Product Tag", type: "select", placeholder: "Select product tags" },
    { key: "canonical_url", label: "Canonical URL", type: "text", placeholder: "Enter canonical URL" },
    { key: "excerpt", label: "Excerpt", type: "text", placeholder: "Enter excerpt" },
    { key: "description_html", label: "Description HTML", type: "textarea", placeholder: "Enter HTML description" },
    { key: "contentLanguage", label: "Content Language", type: "text", placeholder: "e.g., en" },
    { section: "OpenGraph & Twitter" },
    { key: "ogLocale", label: "OG Locale", type: "text", placeholder: "e.g., en_US" },
    { key: "og_twitter_Title", label: "OG/Twitter Title", type: "text", placeholder: "Enter OpenGraph/Twitter title" },
    { key: "og_twitter_Description", label: "OG/Twitter Description", type: "text", placeholder: "Enter OpenGraph/Twitter description" },
    { key: "ogType", label: "OG Type", type: "text", placeholder: "e.g., website, article" },
    { key: "openGraph.images[0]", label: "OpenGraph Image URL", type: "text", placeholder: "Enter image URL" },
    { key: "openGraph.video.url", label: "OpenGraph Video URL", type: "text", placeholder: "Enter video URL" },
    { key: "openGraph.video.secure_url", label: "OpenGraph Video Secure URL", type: "text", placeholder: "Enter secure video URL" },
    { key: "openGraph.video.type", label: "OpenGraph Video Type", type: "text", placeholder: "e.g., video/mp4" },
    { key: "openGraph.video.width", label: "OpenGraph Video Width", type: "number", placeholder: "Enter width in pixels" },
    { key: "openGraph.video.height", label: "OpenGraph Video Height", type: "number", placeholder: "Enter height in pixels" },
    { section: "Twitter" },
    { key: "twitterCard", label: "Twitter Card", type: "text", placeholder: "e.g., summary_large_image" },
    { key: "twitter.image", label: "Twitter Image URL", type: "text", placeholder: "Enter Twitter card image URL" },
    { key: "twitter.player", label: "Twitter Player URL", type: "text", placeholder: "Enter Twitter player URL" },
    { key: "twitter.player_width", label: "Twitter Player Width", type: "number", placeholder: "Enter player width" },
    { key: "twitter.player_height", label: "Twitter Player Height", type: "number", placeholder: "Enter player height" },
    { section: "Structured Data" },
    { key: "VideoJsonLd", label: "Video JSON-LD", type: "textarea", placeholder: "Enter Video JSON-LD script" },
    { section: "Status" },
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
  ];


  const fetchTopicPageSeos = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = `/topicpage-seo?page=${page}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`;
      
      console.log('Fetching topic page SEOs from:', endpoint);
      const response = await apiFetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received topic page SEOs data:', data);
      
      setTopicPageSeos(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching topic page SEOs:', error);
      // You might want to show an error toast/notification to the user here
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  // Fetch available product tags from the products API and dedupe
  const fetchProductTags = useCallback(async () => {
    try {
      // Request only productTag field to minimize payload
      const res = await apiFetch('/product?fields=productTag');
      if (!res.ok) return;
      const json = await res.json().catch(() => ({}));
      const products = json.data || [];
      const allTags: string[] = [];
      for (const p of products) {
        if (Array.isArray(p.productTag)) {
          for (const t of p.productTag) {
            if (t && typeof t === 'string') allTags.push(t.trim());
          }
        }
      }
      const unique = Array.from(new Set(allTags)).filter(Boolean);
      setAvailableProductTags(unique.sort((a, b) => a.localeCompare(b)));
    } catch (err) {
      console.error('Error fetching product tags:', err);
    }
  }, []);

  useEffect(() => {
    fetchTopicPageSeos();
    fetchProductTags();
  }, [fetchTopicPageSeos, fetchProductTags]);

  const handleOpen = (seo?: Partial<TopicPageSEO>) => {
    if (seo) {
      setEditingSeo({ ...seo });
    } else {
      setEditingSeo({ status: 'draft' });
    }
    setOpen(true);
  };

  const handleView = (seo: Partial<TopicPageSEO>) => {
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

    // Helper type for nested objects that can contain arrays or nested objects
  type NestedObject = Record<string, unknown>;
  
  const updateNestedValue = (
    obj: NestedObject,
    path: string,
    value: unknown,
    type?: string
  ): NestedObject => {
      const [current, ...rest] = path.split('.');
      const arrayMatch = current.match(/(\w+)\[(\d+)\]/);
      
      if (arrayMatch) {
        const arrayName = arrayMatch[1];
        const index = parseInt(arrayMatch[2]);
        
        // Ensure the array exists and is actually an array
        if (!Array.isArray(obj[arrayName])) {
          obj[arrayName] = [];
        }
        
        // We know this is an array because we just ensured it above
        const currentArray = obj[arrayName] as unknown[];
        
        if (rest.length === 0) {
          const newArray = [...currentArray];
          newArray[index] = type === 'number' ? Number(value) : value;
          return { ...obj, [arrayName]: newArray } as NestedObject;
        }
        
        // Ensure the item at the index is an object
        if (!currentArray[index] || typeof currentArray[index] !== 'object' || currentArray[index] === null) {
          currentArray[index] = {} as NestedObject;
        }
        
        // Create a new array with the updated nested value
        const updatedArray = [
          ...currentArray.slice(0, index),
          updateNestedValue(currentArray[index] as NestedObject, rest.join('.'), value, type),
          ...currentArray.slice(index + 1)
        ];
        
        return {
          ...obj,
          [arrayName]: updatedArray
        } as NestedObject;
      }
      
      if (rest.length === 0) {
        return { ...obj, [current]: type === 'number' ? Number(value) : value } as NestedObject;
      }
      
      // Ensure the nested object exists and is actually an object
      const currentObj = obj[current];
      if (!currentObj || typeof currentObj !== 'object' || currentObj === null) {
        obj[current] = {} as NestedObject;
      }
      
      // Recursively update the nested object
      const updatedNested = updateNestedValue(
        obj[current] as NestedObject, 
        rest.join('.'), 
        value, 
        type
      );
      
      return {
        ...obj,
        [current]: updatedNested
      } as NestedObject;
    };

    setEditingSeo(prev => {
      if (!prev) return prev;
      // Cast the result to Partial<TopicPageSEO> since we know the structure matches
      return updateNestedValue({ ...prev }, name!, value, type) as unknown as Partial<TopicPageSEO>;
    });
  };

  const handleSubmit = async () => {   // No need to check for 'no access' here as it's already handled at the component level

    try {
      setLoading(true);
      if (editingSeo?._id) {
        // Update existing
        await apiFetch(`/topicpage-seo/${editingSeo._id}`, {
          method: 'PUT',
          body: JSON.stringify(editingSeo)
        });
        setSnackbar({ open: true, message: 'Topic Page SEO updated successfully', severity: 'success' });
      } else if (editingSeo) {
        // Create new
        await apiFetch('/topicpage-seo', {
          method: 'POST',
          body: JSON.stringify(editingSeo)
        });
        setSnackbar({ open: true, message: 'Topic Page SEO created successfully', severity: 'success' });
      }
      fetchTopicPageSeos();
      handleClose();
    } catch (error) {
      console.error('Error saving topic page SEO:', error);
      setSnackbar({ open: true, message: 'Failed to save topic page SEO', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (pageAccess !== 'all access') {
      setSnackbar({ open: true, message: 'You do not have permission to perform this action', severity: 'error' });
      return;
    }

    if (window.confirm('Are you sure you want to delete this topic page SEO entry?')) {
      try {
        await apiFetch(`/topicpage-seo/${id}`, { method: 'DELETE' });
        setSnackbar({ open: true, message: 'Topic Page SEO deleted successfully', severity: 'success' });
        fetchTopicPageSeos();
      } catch (error) {
        console.error('Error deleting topic page SEO:', error);
        setSnackbar({ open: true, message: 'Failed to delete topic page SEO', severity: 'error' });
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Topic Page SEO Management</Typography>
            {pageAccess === 'all access' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
              >
                Add New Topic Page SEO
              </Button>
            )}
          </Box>

          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', backgroundColor: 'background.paper', borderRadius: 1, px: 2, py: 1, maxWidth: 400 }}>
            <SearchIcon color="action" sx={{ mr: 1 }} />
            <InputBase
              placeholder="Search topic page SEO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  fetchTopicPageSeos();
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
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Meta Title</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Slug</TableCell>
                <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Status</TableCell>
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
              ) : topicPageSeos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No topic page SEO entries found
                  </TableCell>
                </TableRow>
              ) : (
                topicPageSeos.map((seo) => (
                  <TableRow key={seo._id}>
                    <TableCell>{seo.name}</TableCell>
                    <TableCell>{seo.meta_title || '-'}</TableCell>
                    <TableCell>{seo.slug || '-'}</TableCell>
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
                    <TableCell align="right">
                      <IconButton onClick={() => handleView(seo)} title="View">
                        <VisibilityIcon color="info" />
                      </IconButton>
                      {pageAccess === 'all access' && (
                        <>
                          <IconButton onClick={() => handleOpen(seo)} title="Edit">
                            <EditIcon color="primary" />
                          </IconButton>
                          <IconButton onClick={() => seo._id && handleDelete(seo._id)} title="Delete">
                            <DeleteIcon color="error" />
                          </IconButton>
                        </>
                      )}
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
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">
              {editingSeo?._id ? 'Edit Topic Page SEO' : 'Create New Topic Page SEO'}
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
              {TOPIC_PAGE_SEO_FIELDS.map((field, index) => {
                if ('section' in field) {
                  return (
                    <Typography key={`section-${index}`} variant="h6" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
                      {field.section}
                    </Typography>
                  );
                }

                if (!field.key) return null;

                type NestedValue = string | Record<string, unknown> | unknown[] | undefined;
                
                const value = field.key.split('.').reduce<NestedValue>((obj, key) => {
                  if (obj === null || obj === undefined) return '';
                  
                  const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
                  if (arrayMatch) {
                    const arrayName = arrayMatch[1];
                    const index = parseInt(arrayMatch[2]);
                    if (typeof obj === 'object' && obj !== null && arrayName in obj) {
                      const arr = obj[arrayName as keyof typeof obj];
                      if (Array.isArray(arr)) {
                        return arr[index] ?? '';
                      }
                    }
                    return '';
                  }
                  
                  if (typeof obj === 'object' && obj !== null && key in obj) {
                    return obj[key as keyof typeof obj] as NestedValue;
                  }
                  
                  return '';
                }, editingSeo as NestedValue);

                if (field.type === 'select' && field.key) {
                  // Special handling for producttag: use availableProductTags and allow multiple selection
                  if (field.key === 'producttag') {
                    return (
                      <FormControl key={field.key} fullWidth margin="normal">
                        <InputLabel>{field.label}</InputLabel>
                        <Select
                          name={field.key}
                          multiple
                          value={Array.isArray(value) ? value : (value ? [String(value)] : [])}
                          onChange={(e) => {
                            // Forward a compatible event shape to handleChange
                            const target = e.target as HTMLInputElement & { name?: string; value?: unknown };
                            handleChange({ target });
                          }}
                          label={field.label}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {(Array.isArray(selected) ? selected : []).map((val) => (
                                <Chip key={String(val)} label={String(val)} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {availableProductTags.map((tag) => (
                            <MenuItem key={tag} value={tag}>
                              {tag}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  }

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
                    />
                  );
                }

                if (field.key === 'themeColor') {
                  return (
                    <TextField
                      key={field.key}
                      name={field.key}
                      label="Theme Color (e.g., #ffffff or 'red')"
                      value={value || ''}
                      onChange={handleChange}
                      fullWidth
                      margin="normal"
                      placeholder="Enter color value (hex, rgb, or named color)"
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
            <Button type="submit" variant="contained" color="primary">
              {editingSeo?._id ? 'Update' : 'Create'}
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
          <Typography variant="h6">View SEO Details</Typography>
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
                Basic Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, mb: 3 }}>
                {selectedSeo.name && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                    <Typography>{selectedSeo.name}</Typography>
                  </Box>
                )}
                {selectedSeo.slug && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Slug</Typography>
                    <Typography>{selectedSeo.slug}</Typography>
                  </Box>
                )}
                {selectedSeo.producttag && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Product Tag</Typography>
                    <Typography>{Array.isArray(selectedSeo.producttag) ? selectedSeo.producttag.join(', ') : String(selectedSeo.producttag)}</Typography>
                  </Box>
                )}
                {selectedSeo.status && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={selectedSeo.status} 
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
                )}
                {selectedSeo.contentLanguage && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Content Language</Typography>
                    <Typography>{String(selectedSeo.contentLanguage)}</Typography>
                  </Box>
                )}
                {selectedSeo.canonical_url && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Canonical URL</Typography>
                    <Typography>{String(selectedSeo.canonical_url)}</Typography>
                  </Box>
                )}
                {selectedSeo.excerpt && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Excerpt</Typography>
                    <Typography>{String(selectedSeo.excerpt)}</Typography>
                  </Box>
                )}
              </Box>

              {/* Meta Tags Section */}
              {(selectedSeo.meta_title || selectedSeo.meta_description || selectedSeo.keywords || selectedSeo.description_html) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                    Meta Tags
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                    {selectedSeo.meta_title && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Meta Title</Typography>
                        <Typography>{String(selectedSeo.meta_title)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.meta_description && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Meta Description</Typography>
                        <Typography>{String(selectedSeo.meta_description)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.keywords && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Keywords</Typography>
                        <Typography>{String(selectedSeo.keywords)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.description_html && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Description HTML</Typography>
                        <Box component="pre" sx={{ 
                          bgcolor: 'grey.100', 
                          p: 2, 
                          borderRadius: 1,
                          overflow: 'auto',
                          maxHeight: '200px',
                          fontSize: '0.8rem'
                        }}>
                          {String(selectedSeo.description_html)}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Open Graph Section */}
              {(selectedSeo.og_twitter_Title || selectedSeo.og_twitter_Description || selectedSeo.ogType || selectedSeo.ogLocale || selectedSeo.openGraph?.images?.[0] || selectedSeo.openGraph?.video?.url) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                    Open Graph
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                    {selectedSeo.og_twitter_Title && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG/Twitter Title</Typography>
                        <Typography>{String(selectedSeo.og_twitter_Title)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.og_twitter_Description && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG/Twitter Description</Typography>
                        <Typography>{String(selectedSeo.og_twitter_Description)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.ogType && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG Type</Typography>
                        <Typography>{String(selectedSeo.ogType)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.ogLocale && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG Locale</Typography>
                        <Typography>{String(selectedSeo.ogLocale)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.openGraph?.images?.[0] && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG Image</Typography>
                        <Box component="img" 
                          src={selectedSeo.openGraph.images[0]} 
                          alt="OpenGraph" 
                          sx={{ maxWidth: '100%', maxHeight: '200px', mt: 1, borderRadius: 1 }}
                        />
                      </Box>
                    )}
                    {selectedSeo.openGraph?.video?.url && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG Video URL</Typography>
                        <Typography>{String(selectedSeo.openGraph.video.url)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.openGraph?.video?.secure_url && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG Video Secure URL</Typography>
                        <Typography>{String(selectedSeo.openGraph.video.secure_url)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.openGraph?.video?.type && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG Video Type</Typography>
                        <Typography>{String(selectedSeo.openGraph.video.type)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.openGraph?.video?.width && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG Video Width</Typography>
                        <Typography>{String(selectedSeo.openGraph.video.width)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.openGraph?.video?.height && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">OG Video Height</Typography>
                        <Typography>{String(selectedSeo.openGraph.video.height)}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Twitter Card Section */}
              {(selectedSeo.twitterCard || selectedSeo.og_twitter_Title || selectedSeo.og_twitter_Description || selectedSeo.twitter?.image || selectedSeo.twitter?.player) && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                    Twitter Card
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                    {selectedSeo.twitterCard && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Card Type</Typography>
                        <Typography>{String(selectedSeo.twitterCard)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.og_twitter_Title && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Twitter Title</Typography>
                        <Typography>{String(selectedSeo.og_twitter_Title)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.og_twitter_Description && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Twitter Description</Typography>
                        <Typography>{String(selectedSeo.og_twitter_Description)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.twitter?.image && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Twitter Image</Typography>
                        <Box component="img" 
                          src={String(selectedSeo.twitter.image)} 
                          alt="Twitter Card" 
                          sx={{ maxWidth: '100%', maxHeight: '200px', mt: 1, borderRadius: 1 }}
                        />
                      </Box>
                    )}
                    {selectedSeo.twitter?.player && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Twitter Player URL</Typography>
                        <Typography>{String(selectedSeo.twitter.player)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.twitter?.player_width && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Twitter Player Width</Typography>
                        <Typography>{String(selectedSeo.twitter.player_width)}</Typography>
                      </Box>
                    )}
                    {selectedSeo.twitter?.player_height && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Twitter Player Height</Typography>
                        <Typography>{String(selectedSeo.twitter.player_height)}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* JSON-LD Section */}
              {selectedSeo.VideoJsonLd && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                    Structured Data
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {selectedSeo.VideoJsonLd && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Video JSON-LD</Typography>
                        <Box component="pre" sx={{ 
                          bgcolor: 'grey.100', 
                          p: 2, 
                          borderRadius: 1,
                          overflow: 'auto',
                          maxHeight: '200px',
                          fontSize: '0.8rem'
                        }}>
                          {String(selectedSeo.VideoJsonLd)}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

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
