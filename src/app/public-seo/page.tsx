'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  Typography, Box, CircularProgress, TablePagination, TextField, 
  InputAdornment, IconButton, Chip
} from '@mui/material';
import Image from 'next/image';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { apiFetch } from '../../utils/apiFetch';

interface SeoData {
  // Core Fields
  _id: string;
  title?: string;
  slug?: string;
  sku?: string;
  salesPrice?: number;
  leadtime?: number;
  rating_value?: number;
  rating_count?: number;
  
  // Basic SEO
  description?: string;
  description_html?: string;
  excerpt?: string;
  keywords?: string;
  viewport?: string;
  themeColor?: string;
  robots?: string;
  contentLanguage?: string;
  
  // Technical SEO
  charset?: string;
  xUaCompatible?: string;
  canonical_url?: string;
  
  // Open Graph / Social Media
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogSiteName?: string;
  ogUrl?: string;
  ogImage?: string;
  ogLocale?: string;
  ogVideoUrl?: string;
  ogVideoSecureUrl?: string;
  ogVideoType?: string;
  ogVideoWidth?: number;
  ogVideoHeight?: number;
  
  // Twitter Card
  twitterCard?: string;
  twitterSite?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterPlayer?: string;
  twitterPlayerWidth?: number;
  twitterPlayerHeight?: number;
  
  // Internationalization
  hreflang?: string;
  author_name?: string;
  locationCode?: string;
  
  // JSON-LD
  VideoJsonLd?: Record<string, unknown>;
  VideoJsonLdcontext?: string;
  VideoJsonLdtype?: string;
  
  BreadcrumbJsonLd?: {
    itemListElement: Array<{
      position: number;
      name: string;
      item: string;
    }>;
  };
  
  // Product Information
  productdescription?: string;
  productlocationtitle?: string;
  productlocationtagline?: string;
  productlocationdescription1?: string;
  productlocationdescription2?: string;
  
  // Mobile & Browser
  mobileWebAppCapable?: string;
  appleStatusBarStyle?: string;
  formatDetection?: string;
  
  // Verification
  googleSiteVerification?: string;
  msValidate?: string;
  
  // Product References
  product?: {
    _id: string;
    name: string;
    image1?: string;
    image2?: string;
    img?: string;
    video?: string;
    videoThumbnail?: string;
    category?: {
      _id: string;
      name: string;
    };
    substructure?: {
      _id: string;
      name: string;
    };
    content?: {
      _id: string;
      name: string;
    };
    design?: {
      _id: string;
      name: string;
    };
    subfinish?: {
      _id: string;
      name: string;
    };
    subsuitable?: {
      _id: string;
      name: string;
    };
    vendor?: {
      _id: string;
      name: string;
    };
    color?: Array<{
      _id: string;
      name: string;
    }>;
    motif?: {
      _id: string;
      name: string;
    };
    um?: string;
    currency?: string;
    gsm?: number;
    oz?: number;
    cm?: number;
    inch?: number;
    quantity?: number;
  };
  
  // Location Information
  location?: {
    _id: string;
    name: string;
    country?: {
      _id: string;
      name: string;
      code: string;
    };
    state?: {
      _id: string;
      name: string;
      code: string;
    };
  };
  
  // Status Flags
  popularproduct?: boolean;
  topratedproduct?: boolean;
  landingPageProduct?: boolean;
  shopyProduct?: boolean;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export default function PublicSeoPage() {
  const [seoData, setSeoData] = useState<SeoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeo, setSelectedSeo] = useState<SeoData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState<string>('updatedAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  
  const fetchSeoData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/seo/public');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse = await response.json();
      
      if (result.success) {
        setSeoData(result.data);
      } else {
        console.error('API Error:', result.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching SEO data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

const handleRequestSort = (property: string) => {
  const isAsc = orderBy === property && order === 'asc';
  setOrder(isAsc ? 'desc' : 'asc');
  setOrderBy(property);
};

const getNestedValue = (obj: unknown, path: string): string => {
  if (!obj) return '';
  return path.split('.').reduce<string>((o, p) => {
    if (o && typeof o === 'object' && p in o) {
      return String((o as Record<string, unknown>)[p] || '');
    }
    return '';
  }, obj as string);
};
  interface ApiResponse {
    success: boolean;
    data: SeoData[];
    total: number;
    message?: string;
  }

  useEffect(() => {
    fetchSeoData();
  }, [fetchSeoData]);


  const handleViewDetails = (seo: SeoData) => {
    setSelectedSeo(seo);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSeo(null);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredData = seoData.filter(seo => {
    const searchLower = searchTerm.toLowerCase();
    return (
      seo.title?.toLowerCase().includes(searchLower) ||
      seo.slug?.toLowerCase().includes(searchLower) ||
      seo.product?.name?.toLowerCase().includes(searchLower) ||
      seo.location?.name?.toLowerCase().includes(searchLower) ||
      false
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = getNestedValue(a, orderBy);
    const bValue = getNestedValue(b, orderBy);
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });

const paginatedData = sortedData.slice(
  page * rowsPerPage,
  page * rowsPerPage + rowsPerPage
);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getFullDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Public SEO Data</Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search SEO data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
             <TableRow>
  <TableCell 
    onClick={() => handleRequestSort('slug')}
    sx={{ 
      backgroundColor: 'primary.main', 
      color: 'white', 
      fontWeight: '600',
      cursor: 'pointer',
      '&:hover': { backgroundColor: 'primary.dark' },
      userSelect: 'none'
    }}
  >
    Slug
    {orderBy === 'slug' && (order === 'desc' ? ' ▼' : ' ▲')}
  </TableCell>
  <TableCell 
    onClick={() => handleRequestSort('product.name')}
    sx={{ 
      backgroundColor: 'primary.main', 
      color: 'white', 
      fontWeight: '600',
      cursor: 'pointer',
      '&:hover': { backgroundColor: 'primary.dark' },
      userSelect: 'none'
    }}
  >
    Product
    {orderBy === 'product.name' && (order === 'desc' ? ' ▼' : ' ▲')}
  </TableCell>
  <TableCell 
    onClick={() => handleRequestSort('location.name')}
    sx={{ 
      backgroundColor: 'primary.main', 
      color: 'white', 
      fontWeight: '600',
      cursor: 'pointer',
      '&:hover': { backgroundColor: 'primary.dark' },
      userSelect: 'none'
    }}
  >
    Location
    {orderBy === 'location.name' && (order === 'desc' ? ' ▼' : ' ▲')}
  </TableCell>
  <TableCell 
    onClick={() => handleRequestSort('updatedAt')}
    sx={{ 
      backgroundColor: 'primary.main', 
      color: 'white', 
      fontWeight: '600',
      cursor: 'pointer',
      '&:hover': { backgroundColor: 'primary.dark' },
      userSelect: 'none'
    }}
  >
    Updated
    {orderBy === 'updatedAt' && (order === 'desc' ? ' ▼' : ' ▲')}
  </TableCell>
  <TableCell sx={{ 
    backgroundColor: 'primary.main', 
    color: 'white', 
    fontWeight: '600' 
  }}>
    Actions
  </TableCell>
</TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No SEO data found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((seo) => (
                  <TableRow key={seo._id} hover>
                    <TableCell>{seo.slug || 'N/A'}</TableCell>
                    <TableCell>{seo.product?.name || 'N/A'}</TableCell>
                    <TableCell>{seo.location?.name || 'N/A'}</TableCell>
                    <TableCell 
                      title={getFullDateTime(seo.updatedAt || seo.createdAt)}
                      sx={{
                        whiteSpace: 'nowrap',
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                        '&:hover': {
                          color: 'primary.main',
                        }
                      }}
                    >
                      {formatDate(seo.updatedAt || seo.createdAt)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(seo)}
                        color="primary"
                        title="View Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent dividers>
          {selectedSeo && (
            <Box>
              {/* 1. All Images Section */}
              <Box mb={4}>
                <Typography variant="h6" gutterBottom>Product Images</Typography>
                <Box display="flex" gap={3} flexWrap="wrap">
                  {selectedSeo.product?.img && (
                    <div style={{ 
                      position: 'relative',
                      width: '300px',
                      height: '300px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <Image
                        src={selectedSeo.product.img}
                        alt="Main Product"
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="(max-width: 300px) 100vw, 300px"
                      />
                    </div>
                  )}
                  {selectedSeo.product?.image1 && (
                    <div style={{ 
                      position: 'relative',
                      width: '300px',
                      height: '300px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <Image
                        src={selectedSeo.product.image1}
                        alt="Product Variant 1"
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="(max-width: 300px) 100vw, 300px"
                      />
                    </div>
                  )}
                  {selectedSeo.product?.image2 && (
                    <div style={{ 
                      position: 'relative',
                      width: '300px',
                      height: '300px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <Image
                        src={selectedSeo.product.image2}
                        alt="Product Variant 2"
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="(max-width: 300px) 100vw, 300px"
                      />
                    </div>
                  )}
                </Box>
              </Box>

              {/* 2. Product Details Section */}
              <Box mb={4}>
                <Typography variant="h6" gutterBottom>Product Information</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ width: '200px' }}><strong>Product Name</strong></TableCell>
                            <TableCell>{selectedSeo.product?.name || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>SKU</strong></TableCell>
                            <TableCell>{selectedSeo.sku || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>Price</strong></TableCell>
                            <TableCell>{selectedSeo.salesPrice ? `$${selectedSeo.salesPrice}` : 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>Rating</strong></TableCell>
                            <TableCell>
                              {selectedSeo.rating_value ? 
                                `${selectedSeo.rating_value}/5 (${selectedSeo.rating_count || 0} reviews)` : 'N/A'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>Lead Time</strong></TableCell>
                            <TableCell>{selectedSeo.leadtime ? `${selectedSeo.leadtime} days` : 'N/A'}</TableCell>
                          </TableRow>
                          {selectedSeo.product?.category && (
                            <TableRow>
                              <TableCell><strong>Category</strong></TableCell>
                              <TableCell>{selectedSeo.product.category.name}</TableCell>
                            </TableRow>
                          )}
                          {selectedSeo.product?.content && (
                            <TableRow>
                              <TableCell><strong>Content</strong></TableCell>
                              <TableCell>{selectedSeo.product.content.name}</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                  <Box>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ width: '200px' }}><strong>Design</strong></TableCell>
                            <TableCell>{selectedSeo.product?.design?.name || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>Weave Type</strong></TableCell>
                            <TableCell>{selectedSeo.product?.substructure?.name || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>Finish</strong></TableCell>
                            <TableCell>{selectedSeo.product?.subfinish?.name || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>GSM</strong></TableCell>
                            <TableCell>{selectedSeo.product?.gsm || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>Width</strong></TableCell>
                            <TableCell>
                              {selectedSeo.product?.cm ? `${selectedSeo.product.cm} cm (${selectedSeo.product.inch || 'N/A'}")` : 'N/A'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>In Stock</strong></TableCell>
                            <TableCell>{selectedSeo.product?.quantity || '0'} units</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                  {selectedSeo.productdescription && (
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Typography variant="subtitle1" gutterBottom>Description</Typography>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        {selectedSeo.productdescription}
                      </Paper>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* 3. Location Details Section */}
              {selectedSeo.location && (
                <Box mb={4}>
                  <Typography variant="h6" gutterBottom>Location Details</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: '200px' }}><strong>Location</strong></TableCell>
                          <TableCell>{selectedSeo.location.name || 'N/A'}</TableCell>
                        </TableRow>
                        {selectedSeo.location.country && (
                          <TableRow>
                            <TableCell><strong>Country</strong></TableCell>
                            <TableCell>
                              {selectedSeo.location.country.name} ({selectedSeo.location.country.code})
                            </TableCell>
                          </TableRow>
                        )}
                        {selectedSeo.location.state && (
                          <TableRow>
                            <TableCell><strong>State/Region</strong></TableCell>
                            <TableCell>
                              {selectedSeo.location.state.name} ({selectedSeo.location.state.code})
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                </Box>
              )}

              {/* 4. SEO Details Section */}
              <Box>
                <Typography variant="h6" gutterBottom>SEO Information</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      {/* Basic SEO */}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ backgroundColor: '#f5f5f5' }}>
                          <Typography variant="subtitle2">Basic SEO</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ width: '250px', verticalAlign: 'top' }}><strong>Page Title</strong></TableCell>
                        <TableCell>{selectedSeo.title || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Slug</strong></TableCell>
                        <TableCell>{selectedSeo.slug || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Meta Description</strong></TableCell>
                        <TableCell>{selectedSeo.description || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Keywords</strong></TableCell>
                        <TableCell>{selectedSeo.keywords || 'N/A'}</TableCell>
                      </TableRow>
                      
                      {/* Technical SEO */}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ backgroundColor: '#f5f5f5', mt: 2 }}>
                          <Typography variant="subtitle2">Technical SEO</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Viewport</strong></TableCell>
                        <TableCell>{selectedSeo.viewport || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Charset</strong></TableCell>
                        <TableCell>{selectedSeo.charset || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>X-UA-Compatible</strong></TableCell>
                        <TableCell>{selectedSeo.xUaCompatible || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Robots</strong></TableCell>
                        <TableCell>{selectedSeo.robots || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Content Language</strong></TableCell>
                        <TableCell>{selectedSeo.contentLanguage || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Canonical URL</strong></TableCell>
                        <TableCell>
                          {selectedSeo.canonical_url ? (
                            <a href={selectedSeo.canonical_url} target="_blank" rel="noopener noreferrer">
                              {selectedSeo.canonical_url}
                            </a>
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                      
                      {/* Open Graph / Social Media */}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ backgroundColor: '#f5f5f5' }}>
                          <Typography variant="subtitle2">Open Graph / Social Media</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>OG Title</strong></TableCell>
                        <TableCell>{selectedSeo.ogTitle || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>OG Description</strong></TableCell>
                        <TableCell>{selectedSeo.ogDescription || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>OG Type</strong></TableCell>
                        <TableCell>{selectedSeo.ogType || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>OG Site Name</strong></TableCell>
                        <TableCell>{selectedSeo.ogSiteName || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>OG URL</strong></TableCell>
                        <TableCell>
                          {selectedSeo.ogUrl ? (
                            <a href={selectedSeo.ogUrl} target="_blank" rel="noopener noreferrer">
                              {selectedSeo.ogUrl}
                            </a>
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>OG Image</strong></TableCell>
                        <TableCell>
                          {selectedSeo.ogImage ? (
                            <a href={selectedSeo.ogImage} target="_blank" rel="noopener noreferrer">
                              View Image
                            </a>
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>OG Locale</strong></TableCell>
                        <TableCell>{selectedSeo.ogLocale || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>OG Video URL</strong></TableCell>
                        <TableCell>
                          {selectedSeo.ogVideoUrl ? (
                            <a href={selectedSeo.ogVideoUrl} target="_blank" rel="noopener noreferrer">
                              {selectedSeo.ogVideoUrl}
                            </a>
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>OG Video Type</strong></TableCell>
                        <TableCell>{selectedSeo.ogVideoType || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>OG Video Secure URL</strong></TableCell>
                        <TableCell>
                          {selectedSeo.ogVideoSecureUrl ? (
                            <a href={selectedSeo.ogVideoSecureUrl} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
                              {selectedSeo.ogVideoSecureUrl}
                            </a>
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>OG Video Dimensions</strong></TableCell>
                        <TableCell>
                          {selectedSeo.ogVideoWidth && selectedSeo.ogVideoHeight 
                            ? `${selectedSeo.ogVideoWidth} × ${selectedSeo.ogVideoHeight}px` 
                            : 'N/A'}
                        </TableCell>
                      </TableRow>

                      {/* Twitter Card */}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ backgroundColor: '#f5f5f5', mt: 2 }}>
                          <Typography variant="subtitle2">Twitter Card</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Twitter Card Type</strong></TableCell>
                        <TableCell>{selectedSeo.twitterCard || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Twitter Site</strong></TableCell>
                        <TableCell>{selectedSeo.twitterSite || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Twitter Title</strong></TableCell>
                        <TableCell>{selectedSeo.twitterTitle || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Twitter Description</strong></TableCell>
                        <TableCell>{selectedSeo.twitterDescription || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Twitter Image</strong></TableCell>
                        <TableCell>
                          {selectedSeo.twitterImage ? (
                            <a href={selectedSeo.twitterImage} target="_blank" rel="noopener noreferrer">
                              View Image
                            </a>
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Twitter Player</strong></TableCell>
                        <TableCell>
                          {selectedSeo.twitterPlayer ? (
                            <a href={selectedSeo.twitterPlayer} target="_blank" rel="noopener noreferrer">
                              {selectedSeo.twitterPlayer}
                            </a>
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Twitter Player Dimensions</strong></TableCell>
                        <TableCell>
                          {selectedSeo.twitterPlayerWidth && selectedSeo.twitterPlayerHeight 
                            ? `${selectedSeo.twitterPlayerWidth} × ${selectedSeo.twitterPlayerHeight}px` 
                            : 'N/A'}
                        </TableCell>
                      </TableRow>

                      {/* Localization */}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ backgroundColor: '#f5f5f5', mt: 2 }}>
                          <Typography variant="subtitle2">Localization</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Hreflang</strong></TableCell>
                        <TableCell>{selectedSeo.hreflang || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Author</strong></TableCell>
                        <TableCell>{selectedSeo.author_name || 'N/A'}</TableCell>
                      </TableRow>

                      {/* Product Location */}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ backgroundColor: '#f5f5f5', mt: 2 }}>
                          <Typography variant="subtitle2">Product Location</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Location Title</strong></TableCell>
                        <TableCell>{selectedSeo.productlocationtitle || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Location Tagline</strong></TableCell>
                        <TableCell>{selectedSeo.productlocationtagline || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Location Description 1</strong></TableCell>
                        <TableCell>
                          {selectedSeo.productlocationdescription1 ? (
                            <div dangerouslySetInnerHTML={{ __html: selectedSeo.productlocationdescription1 }} />
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Location Description 2</strong></TableCell>
                        <TableCell>
                          {selectedSeo.productlocationdescription2 ? (
                            <div dangerouslySetInnerHTML={{ __html: selectedSeo.productlocationdescription2 }} />
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>

                      {/* JSON-LD Data */}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ backgroundColor: '#f5f5f5', mt: 2 }}>
                          <Typography variant="subtitle2">Structured Data (JSON-LD)</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Video JSON-LD</strong></TableCell>
                        <TableCell style={{ wordBreak: 'break-all' }}>
                          {selectedSeo.VideoJsonLd ? '✓ Set' : 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Breadcrumb JSON-LD</strong></TableCell>
                        <TableCell style={{ wordBreak: 'break-all' }}>
                          {selectedSeo.BreadcrumbJsonLd ? '✓ Set' : 'N/A'}
                        </TableCell>
                      </TableRow>
                      
                      {/* Mobile & Browser */}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ backgroundColor: '#f5f5f5', mt: 2 }}>
                          <Typography variant="subtitle2">Mobile & Browser</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Theme Color</strong></TableCell>
                        <TableCell>
                          {selectedSeo.themeColor ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box 
                                width={20} 
                                height={20} 
                                bgcolor={selectedSeo.themeColor} 
                                border="1px solid #ccc"
                                borderRadius="4px"
                              />
                              {selectedSeo.themeColor}
                            </Box>
                          ) : 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Mobile Web App Capable</strong></TableCell>
                        <TableCell>{selectedSeo.mobileWebAppCapable || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Apple Status Bar Style</strong></TableCell>
                        <TableCell>{selectedSeo.appleStatusBarStyle || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Format Detection</strong></TableCell>
                        <TableCell>{selectedSeo.formatDetection || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Google Site Verification</strong></TableCell>
                        <TableCell style={{ wordBreak: 'break-all' }}>
                          {selectedSeo.googleSiteVerification || 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>MS Validate</strong></TableCell>
                        <TableCell style={{ wordBreak: 'break-all' }}>
                          {selectedSeo.msValidate || 'N/A'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Format Detection</strong></TableCell>
                        <TableCell>{selectedSeo.formatDetection || 'N/A'}</TableCell>
                      </TableRow>
                      
                      {/* Verification */}
                      <TableRow>
                        <TableCell><strong>Google Site Verification</strong></TableCell>
                        <TableCell>{selectedSeo.googleSiteVerification ? '✓ Set' : 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>MS Validate</strong></TableCell>
                        <TableCell>{selectedSeo.msValidate ? '✓ Set' : 'N/A'}</TableCell>
                      </TableRow>
                      
                      {/* Product Status */}
                      <TableRow>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {selectedSeo.popularproduct && <Chip label="Popular" color="primary" size="small" />}
                            {selectedSeo.topratedproduct && <Chip label="Top Rated" color="success" size="small" />}
                            {selectedSeo.landingPageProduct && <Chip label="On Landing Page" color="secondary" size="small" />}
                            {selectedSeo.shopyProduct && <Chip label="Shopy Product" color="info" size="small" />}
                          </Box>
                        </TableCell>
                      </TableRow>
                                            {/* Additional SEO Fields */}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ backgroundColor: '#f5f5f5' }}>
                          <Typography variant="subtitle2">Additional SEO Fields</Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Description HTML</strong></TableCell>
                        <TableCell>{selectedSeo.description_html || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Excerpt</strong></TableCell>
                        <TableCell>{selectedSeo.excerpt || 'N/A'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Location Code</strong></TableCell>
                        <TableCell>{selectedSeo.locationCode || 'N/A'}</TableCell>
                      </TableRow>

                      {/* JSON-LD Details */}
                      <TableRow>
                        <TableCell colSpan={2} sx={{ backgroundColor: '#f5f5f5' }}>
                          <Typography variant="subtitle2">JSON-LD Details</Typography>
                        </TableCell>
                        <TableCell><strong>Video JSON-LD Context</strong></TableCell>
                        <TableCell>{selectedSeo.VideoJsonLdcontext || 'N/A'}</TableCell>
                      </TableRow>

                      {/* Timestamps */}
                      
                      {/* Timestamps */}
                      <TableRow>
                        <TableCell><strong>Created</strong></TableCell>
                        <TableCell>{formatDate(selectedSeo.createdAt)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Last Updated</strong></TableCell>
                        <TableCell>{formatDate(selectedSeo.updatedAt)}</TableCell>
                      </TableRow>
                      
                      {/* Canonical URL */}
                      {selectedSeo.canonical_url && (
                        <TableRow>
                          <TableCell><strong>Canonical URL</strong></TableCell>
                          <TableCell>
                            <a href={selectedSeo.canonical_url} target="_blank" rel="noopener noreferrer">
                              {selectedSeo.canonical_url}
                            </a>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
