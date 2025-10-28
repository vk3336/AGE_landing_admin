"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem, Select, InputLabel, FormControl, CircularProgress, Chip, InputAdornment, Card, CardContent, Avatar, Divider, Tooltip, TablePagination
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import { apiFetch } from '../../utils/apiFetch';

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  image1?: string;
  image2?: string;
  img?: string;  // Cloudinary image URL
  images?: string[];      // Array of all product images
  description?: string;   // Product description
  // Add other product fields that might be used
  color?: string[];
  size?: string;
  sku?: string;
}

interface Order {
  _id?: string;
  firstName: string;
  lastName: string;
  country: string;
  streetAddress?: string;
  city?: string;
  postcode?: string;
  phone: string;
  email: string;
  shippingInstructions?: string;
  total: number;
  payment: 'cod' | 'online' | 'wallet' | 'card' | 'upi';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  discount?: number;
  shipping: 'standard' | 'express' | 'overnight';
  shippingCost: number;
  userId: string;
  products?: OrderItem[];
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}


// Permission function matching products page
function getOrderPagePermission() {
  if (typeof window === 'undefined') return 'no access';
  const email = localStorage.getItem('admin-email');
  const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN;
  if (email && superAdmin && email === superAdmin) return 'all access';
  const perms = JSON.parse(localStorage.getItem('admin-permissions') || '{}');
  if (perms && perms.product) {
    return perms.product;
  }
  return 'no access';
}

// Define interface for raw order data from API
interface OrderData {
  _id: string | { $oid: string };
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  total: number;
  payment: string;
  paymentStatus: string;
  shipping: string;
  shippingCost: number;
  productId: Array<string | {
    _id: string;
    name: string;
    price: number;
    image1?: string;
    images?: string[];
  }>;
  quantity?: number[];
  price?: number[];
  userId?: string | { _id: string; name: string; email: string; phone?: string; address?: string };
  streetAddress?: string;
  city?: string;
  country?: string;
  createdAt?: { $date: string } | string;
  updatedAt?: { $date: string } | string;
}

// Status chip component (unused)
/*
const StatusChip = ({ status }: { status: string }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { bgcolor: '#fff3e0', color: '#e65100' };
      case 'paid':
        return { bgcolor: '#e8f5e9', color: '#2e7d32' };
      case 'shipped':
        return { bgcolor: '#e3f2fd', color: '#1565c0' };
      case 'delivered':
        return { bgcolor: '#e8f5e9', color: '#2e7d32' };
      case 'cancelled':
        return { bgcolor: '#ffebee', color: '#c62828' };
      default:
        return { bgcolor: '#f5f5f5', color: '#424242' };
    }
  };

  const statusColors = getStatusColor();

  return (
    <Chip
      label={status?.charAt(0).toUpperCase() + status?.slice(1) || 'N/A'}
      size="small"
      sx={{
        ...statusColors,
        fontWeight: 500,
        minWidth: 85,
        textAlign: 'center',
        borderRadius: 1,
      }}
    />
  );
};
*/

export default function OrdersPage() {
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  // Track whether the edit dialog is open
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Remove unused state
  // const [deleteError, setDeleteError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Form state
  const [form, setForm] = useState<Partial<Order>>({
    firstName: '',
    lastName: '',
    country: 'India',
    streetAddress: '',
    city: '',
    postcode: '',
    phone: '',
    email: '',
    shippingInstructions: '',
    total: 0,
    payment: 'cod',
    paymentStatus: 'pending',
    discount: 0,
    shipping: 'standard',
    shippingCost: 0,
    userId: '',
    products: [],
    user: {
      _id: '',
      name: '',
      email: ''
    }
  });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching orders from:', '/orders');
      const response = await apiFetch('/orders');
      const result = await response.json();
      console.log('API Response:', result);
      
      // Check if we have a valid response with data
      if (result && result.status === 'success' && result.data?.orders) {
        const ordersData = Array.isArray(result.data.orders) ? result.data.orders : [result.data.orders];
        console.log('Raw orders data:', ordersData);
        
        // Transform the data to include product and user details
        const ordersWithDetails = await Promise.all(ordersData.map(async (order: OrderData) => {
          try {
            // Extract product details - handle both string IDs and populated product objects
            const products = [];
            if (Array.isArray(order.productId) && order.productId.length > 0) {
              for (let i = 0; i < order.productId.length; i++) {
                const product = order.productId[i];
                const quantity = order.quantity?.[i] || 0;
                const price = order.price?.[i] || 0;
                
                // If product is a string ID, we need to fetch its details
                if (typeof product === 'string') {
                  try {
                    const productResponse = await apiFetch(`/products/${product}`);
                    const productData = await productResponse.json();
                    if (productData.status === 'success' && productData.data) {
                      const p = productData.data.product || productData.data;
                      products.push({
                        _id: p._id || `unknown-${i}`,
                        name: p.name || 'Product',
                        price: price || p.price || 0,
                        quantity: quantity,
                        total: (price || p.price || 0) * quantity,
                        image1: p.image1 || (p.images?.[0] || ''),
                        img: p.image1 || (p.images?.[0] || '')
                      });
                      continue;
                    }
                  } catch (error) {
                    console.error('Error fetching product details:', error);
                  }
                } else if (typeof product === 'object' && product !== null) {
                  // If product is already an object with product details
                  products.push({
                    _id: product._id || `unknown-${i}`,
                    name: product.name || 'Product',
                    price: price || product.price || 0,
                    quantity: quantity,
                    total: (price || product.price || 0) * quantity,
                    image1: product.image1 || (product.images?.[0] || ''),
                    img: product.image1 || (product.images?.[0] || '')
                  });
                }
              }
            }
            
            // Helper function to handle date conversion
            const parseDate = (dateValue: string | { $date: string } | undefined): string => {
              if (!dateValue) return new Date().toISOString();
              if (typeof dateValue === 'string') return dateValue;
              if (typeof dateValue === 'object' && '$date' in dateValue) {
                return new Date(dateValue.$date).toISOString();
              }
              return new Date().toISOString();
            };

            // Helper function to handle user ID
            const getUserId = (userId: string | { _id: string } | undefined): string => {
              if (!userId) return '';
              if (typeof userId === 'string') return userId;
              return userId._id || '';
            };

            // Helper function to get user info
            const getUserInfo = () => {
              if (!order.userId) return { _id: '', name: 'Unknown', email: '' };
              
              if (typeof order.userId === 'string') {
                return {
                  _id: order.userId,
                  name: `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Customer',
                  email: order.email || 'no-email@example.com',
                  phone: order.phone || '',
                  address: `${order.streetAddress || ''}, ${order.city || ''} ${order.country || ''}`.trim()
                };
              }
              
              return {
                _id: order.userId._id || '',
                name: order.userId.name || `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Customer',
                email: order.userId.email || order.email || 'no-email@example.com',
                phone: order.userId.phone || order.phone || '',
                address: order.userId.address || `${order.streetAddress || ''}, ${order.city || ''} ${order.country || ''}`.trim()
              };
            };

            // Format the order data
            const transformedOrder: Order = {
              _id: typeof order._id === 'object' && order._id !== null ? order._id.$oid : (order._id || ''),
              firstName: order.firstName || 'Unknown',
              lastName: order.lastName || 'Customer',
              phone: order.phone || 'N/A',
              email: order.email || 'no-email@example.com',
              total: order.total || 0,
              payment: ((order.payment as string) === 'stripe' || (order.payment as string) === 'paypal' || (order.payment as string) === 'bank' ? 'online' : 'cod') as 'cod' | 'online' | 'wallet' | 'card' | 'upi',
              paymentStatus: ((order.paymentStatus as string) === 'cancelled' ? 'failed' : order.paymentStatus) as 'pending' | 'paid' | 'failed' | 'refunded',
              shipping: (order.shipping as 'standard' | 'express' | 'overnight') || 'standard',
              shippingCost: order.shippingCost || 0,
              products: products,
              userId: getUserId(order.userId),
              user: getUserInfo(),
              country: order.country || '',
              createdAt: parseDate(order.createdAt),
              updatedAt: parseDate(order.updatedAt)
            };

            console.log('Transformed order:', transformedOrder);
            return transformedOrder;
          } catch (error) {
            console.error('Error processing order:', error, order);
            return null;
          }
        }));
        
        // Filter out any null orders that failed processing
        const validOrders = ordersWithDetails.filter((order): order is Order => order !== null);
        console.log('Setting orders:', validOrders);
        setOrders(validOrders);
      } else {
        console.error('Invalid data format received from API:', result);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check permissions on component mount
  useEffect(() => {
    const permission = getOrderPagePermission();
    setPageAccess(permission);
    if (permission !== 'no access') {
      fetchOrders();
    }
  }, [fetchOrders]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: string; value: unknown };
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }> | 
    { target: { name: string; value: unknown } }
  ) => {
    const target = 'target' in event ? event.target : event;
    const name = target.name as string;
    if (!name) return;
    
    setForm(prev => ({
      ...prev,
      [name]: target.value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pageAccess !== 'all access') return;
    
    setSubmitting(true);
    try {
      // Prepare the order data
      const orderData = {
        ...form,
        total: Number(form.total) || 0,
        shippingCost: Number(form.shippingCost) || 0,
        discount: Number(form.discount) || 0,
        // Ensure arrays are properly formatted
        products: Array.isArray(form.products) ? form.products : []
      };

      if (selectedOrder?._id) {
        // Update existing order
        const response = await apiFetch(`/orders/${selectedOrder._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        });
        const data = await response.json();
        if (data && data.status === 'success') {
          setOrders(orders.map(order => 
            order._id === selectedOrder._id ? { ...order, ...data.data } : order
          ));
          handleClose();
        }
      } else {
        // Create new order
        const response = await apiFetch('/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData)
        });
        const data = await response.json();
        if (data && data.status === 'success') {
          setOrders(prevOrders => [...prevOrders, data.data]);
          handleClose();
        }
      }
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete order
  const handleDelete = async () => {
    if (!deleteId || pageAccess !== 'all access') return;
    
    setSubmitting(true);
    try {
      const response = await apiFetch(`/orders/${deleteId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data && data.success) {
        setOrders(prevOrders => prevOrders.filter(order => order._id !== deleteId));
        setDeleteId(null);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      // Re-add deleteError if you want to show error messages to users
      // setDeleteError('Failed to delete order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle open edit dialog
  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setForm({ ...order });
    setIsEditDialogOpen(true);
  };

  // Handle close dialog
  const handleClose = () => {
    setSelectedOrder(null);
    setIsEditDialogOpen(false);
    setForm({
      firstName: '',
      lastName: '',
      country: 'India',
      streetAddress: '',
      city: '',
      postcode: '',
      phone: '',
      email: '',
      shippingInstructions: '',
      total: 0,
      payment: 'cod',
      paymentStatus: 'pending',
      discount: 0,
      shipping: 'standard',
      shippingCost: 0,
      userId: '',
      products: [],
      user: {
        _id: '',
        name: '',
        email: ''
      }
    });
  };

  // Filter orders based on search query
  const filteredOrders = useMemo(() => 
    orders.filter(order => {
      const searchLower = search.toLowerCase();
      return (
        order._id?.toLowerCase().includes(searchLower) ||
        order.firstName?.toLowerCase().includes(searchLower) ||
        order.lastName?.toLowerCase().includes(searchLower) ||
        order.email?.toLowerCase().includes(searchLower) ||
        order.phone?.toLowerCase().includes(searchLower) ||
        order.paymentStatus?.toLowerCase().includes(searchLower)
      );
    }),
    [orders, search]
  );

  // If no access, show message
  if (pageAccess === 'no access') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          You don&apos;t have permission to access this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Card elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Order Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and manage customer orders
              </Typography>
            </Box>
            <Paper
              component="form"
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: { xs: '100%', md: 400 },
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                border: '1px solid #e0e0e0',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }
              }}
            >
              <InputBase
                sx={{ ml: 2, flex: 1, fontSize: '0.9rem' }}
                placeholder="Search orders by name, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                }
              />
            </Paper>
          </Box>
          
          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mt: 2 }}>
            {[
              { title: 'Total Orders', value: orders.length, color: '#4e73df' },
              { title: 'Pending', value: orders.filter(o => o.paymentStatus === 'pending').length, color: '#f6c23e' },
              { title: 'Paid', value: orders.filter(o => o.paymentStatus === 'paid').length, color: '#1cc88a' },
              { title: 'Failed', value: orders.filter(o => o.paymentStatus === 'failed').length, color: '#e74a3b' }
            ].map((stat, index) => (
              <Card key={index} sx={{ 
                backgroundColor: stat.color + '15', 
                borderRadius: 2,
                borderLeft: `4px solid ${stat.color}`,
                height: '100%'
              }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1, color: stat.color, fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <InputBase
          fullWidth
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
        />
      </Paper>

      {/* Orders Table */}
      <Card elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }} aria-label="orders table">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8f9fc' }}>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>ORDER</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>CUSTOMER</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>DATE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>PRODUCTS</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'right' }}>TOTAL</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>PAYMENT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textAlign: 'center' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading orders...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <SearchIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No orders found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {search ? 'Try adjusting your search or filter to find what you\'re looking for.' 
                               : 'Start by creating a new order or check back later.'}
                      </Typography>
                      {search && (
                        <Button 
                          variant="outlined" 
                          sx={{ mt: 2 }}
                          onClick={() => setSearch('')}
                        >
                          Clear search
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow
                      key={order._id}
                      sx={{
                        '&:hover': { backgroundColor: 'action.hover' },
                        '&:last-child td': { borderBottom: 'none' },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'primary.main' }}>
                          #{order._id?.substring(0, 8).toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>
                            {order.firstName?.charAt(0)}{order.lastName?.charAt(0) || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {`${order.firstName} ${order.lastName}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {order.products && order.products.length > 0 ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box 
                              component="img"
                              src={order.products[0].img || order.products[0].image1 || '/placeholder-product.png'}
                              alt={order.products[0].name}
                              sx={{ 
                                width: 40, 
                                height: 40, 
                                objectFit: 'cover',
                                borderRadius: 1,
                                border: '1px solid #eee'
                              }}
                            />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {order.products[0].name}
                              </Typography>
                              <Tooltip title={`ID: ${order.products[0]._id}`} placement="right" arrow>
                                <Typography variant="caption" color="text.secondary" sx={{ 
                                  display: 'block', 
                                  fontFamily: 'monospace', 
                                  fontSize: '0.7rem',
                                  cursor: 'help',
                                  textDecoration: 'underline',
                                  textDecorationStyle: 'dotted',
                                  textUnderlineOffset: '2px'
                                }}>
                                  ID: {order.products[0]._id}
                                </Typography>
                              </Tooltip>
                              {order.products.length > 1 && (
                                <Typography variant="caption" color="text.secondary">
                                  +{order.products.length - 1} more
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">No products</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                          ${order.total?.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={order.payment?.toUpperCase() || 'N/A'} 
                          size="small" 
                          variant="outlined"
                          sx={{
                            textTransform: 'capitalize',
                            borderColor: order.paymentStatus === 'paid' ? 'success.main' : 'default',
                            color: order.paymentStatus === 'paid' ? 'success.main' : 'inherit',
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => handleEdit(order)}
                              size="small"
                              sx={{
                                color: 'primary.main',
                                '&:hover': { backgroundColor: 'primary.light', color: 'primary.dark' },
                              }}
                              disabled={pageAccess === 'only view'}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Order">
                            <IconButton
                              onClick={() => setDeleteId(order._id || null)}
                              size="small"
                              sx={{
                                color: 'error.main',
                                '&:hover': { backgroundColor: 'error.light', color: 'error.dark' },
                              }}
                              disabled={pageAccess === 'only view'}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing <b>{Math.min(filteredOrders.length, page * rowsPerPage + 1)}-{Math.min((page + 1) * rowsPerPage, filteredOrders.length)}</b> of <b>{filteredOrders.length}</b> orders
          </Typography>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      </Card>

      {/* Add/Edit Order Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onClose={handleClose} 
        maxWidth="xl"
        fullWidth
        fullScreen
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'flex-start',
            pt: 2,
          },
          '& .MuiDialog-paper': {
            m: 0,
            width: '100%',
            maxWidth: 'none',
            height: '100%',
            maxHeight: '100vh',
            borderRadius: 0,
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedOrder ? 'Edit Order' : 'Add New Order'}
          </DialogTitle>
          <DialogContent sx={{ p: 3, '&.MuiDialogContent-root': { p: 3 } }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
              gap: 3, 
              mt: 1,
              '& .MuiTextField-root': {
                mb: 0,
              },
              '& .MuiFormControl-root': {
                mb: 0,
              },
            }}>
              {/* Customer Information */}
              <Typography variant="h6" sx={{ gridColumn: '1 / -1', mt: 1, mb: 1 }}>
                Customer Information
              </Typography>
              
              <TextField
                name="firstName"
                label="First Name"
                value={form.firstName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              
              <TextField
                name="lastName"
                label="Last Name"
                value={form.lastName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              
              <TextField
                name="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              
              <TextField
                name="phone"
                label="Phone"
                value={form.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              
              {/* Shipping Information */}
              <Typography variant="h6" sx={{ gridColumn: '1 / -1', mt: 2, mb: 1 }}>
                Shipping Information
              </Typography>
              
              <TextField
                name="streetAddress"
                label="Street Address"
                value={form.streetAddress || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
                sx={{ gridColumn: '1 / -1' }}
              />
              
              <TextField
                name="city"
                label="City"
                value={form.city || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              
              <TextField
                name="country"
                label="Country"
                value={form.country || 'India'}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
              
              <TextField
                name="postcode"
                label="Postal Code"
                value={form.postcode || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              
              <TextField
                name="shippingInstructions"
                label="Shipping Instructions"
                value={form.shippingInstructions || ''}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                multiline
                rows={2}
                sx={{ gridColumn: '1 / -1' }}
              />
              
              {/* Order Details */}
              <Typography variant="h6" sx={{ gridColumn: '1 / -1', mt: 2, mb: 1 }}>
                Order Details
              </Typography>
              
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  name="payment"
                  value={form.payment || 'cod'}
                  onChange={handleSelectChange}
                  label="Payment Method"
                >
                  <MenuItem value="cod">Cash on Delivery</MenuItem>
                  <MenuItem value="online">Online Payment</MenuItem>
                  <MenuItem value="card">Credit/Debit Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="wallet">Wallet</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Shipping Method</InputLabel>
                <Select
                  name="shipping"
                  value={form.shipping || 'standard'}
                  onChange={handleSelectChange}
                  label="Shipping Method"
                >
                  <MenuItem value="standard">Standard Shipping</MenuItem>
                  <MenuItem value="express">Express Shipping</MenuItem>
                  <MenuItem value="overnight">Overnight Shipping</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                name="shippingCost"
                label="Shipping Cost (₹)"
                type="number"
                value={form.shippingCost || 0}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
              
              <TextField
                name="discount"
                label="Discount (₹)"
                type="number"
                value={form.discount || 0}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                inputProps={{ min: 0, step: 0.01 }}
              />
              
              {/* Products Section */}
              <Box sx={{ 
                gridColumn: '1 / -1', 
                mt: 2, 
                mb: 2,
                maxHeight: '400px',
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#555',
                },
              }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Order Items
                </Typography>
                {selectedOrder?.products && selectedOrder.products.length > 0 ? (
                  <Box sx={{ border: '1px solid #eee', borderRadius: 1, overflow: 'hidden' }}>
                    {selectedOrder.products.map((product, index) => (
                      <Box 
                        key={product._id || index} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          p: 2, 
                          borderBottom: index < selectedOrder.products!.length - 1 ? '1px solid #f5f5f5' : 'none',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                      >
                        <Box 
                          component="img"
                          src={product.img || product.image1 || '/placeholder-product.png'}
                          alt={product.name}
                          sx={{ 
                            width: 60, 
                            height: 60, 
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid #eee',
                            mr: 2
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                              ID: {product._id?.substring(0, 8)}...
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              Qty: {product.quantity}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ₹{product.price?.toFixed(2)}
                            </Typography>
                          </Box>
                          {product.size && (
                            <Typography variant="caption" color="text.secondary">
                              Size: {product.size}
                            </Typography>
                          )}
                          {product.color && product.color.length > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Color: {product.color.join(', ')}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid #eee' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Subtotal:</Typography>
                        <Typography>₹{selectedOrder.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Shipping:</Typography>
                        <Typography>₹{selectedOrder.shippingCost?.toFixed(2) || '0.00'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Discount:</Typography>
                        <Typography color="error">-₹{selectedOrder.discount?.toFixed(2) || '0.00'}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <Typography>Total:</Typography>
                        <Typography>₹{selectedOrder.total?.toFixed(2) || '0.00'}</Typography>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed #ddd' }}>
                    <Typography color="text.secondary">No products in this order</Typography>
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Note: Product management will be implemented in the next phase.
                </Typography>
              </Box>

              <TextField
                name="total"
                label="Total Amount (₹)"
                type="number"
                value={form.total || 0}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                inputProps={{ min: 0, step: 0.01 }}
                required
                sx={{ gridColumn: '1 / -1' }}
              />
              
              {/* User Information */}
              <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 2 }}>
                <TextField
                  name="userId"
                  label="User ID"
                  value={form.userId || ''}
                  fullWidth
                  margin="normal"
                  required
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="User ID (read-only)"
                />
                <TextField
                  name="userEmail"
                  label="User Email"
                  value={form.user?.email || form.email || ''}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    readOnly: true,
                  }}
                  helperText="User's email address"
                />
              </Box>
              
              {/* Product Selection - This would be more complex in a real app */}
             
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, position: 'sticky', bottom: 0, backgroundColor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', zIndex: 1 }}>
            <Button onClick={handleClose} disabled={submitting} variant="outlined">
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Saving...' : 'Save Order'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this order? This action cannot be undone.</Typography>
          {/* Error message removed since deleteError is not used */}
          {/* Uncomment if you want to show error messages
          {deleteError && (
            <Typography color="error" sx={{ mt: 1 }}>{deleteError}</Typography>
          )}
          */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
