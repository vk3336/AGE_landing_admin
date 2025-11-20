"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem, Select, InputLabel, FormControl, CircularProgress, Pagination, Chip, Autocomplete, InputAdornment, AppBar, Toolbar, Checkbox, FormControlLabel
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import ImageIcon from '@mui/icons-material/Image';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import FilterListIcon from '@mui/icons-material/FilterList';
import Image from 'next/image';
import { apiFetch } from '../../utils/apiFetch';

interface Product {
  _id?: string;
  name: string;
  slug?: string;
  productdescription?: string;
  img?: string;
  image1?: string;
  image2?: string;
  altimg1?: string;
  altimg2?: string;
  altimg3?: string;
  category: string;
  substructure: string;
  content: string;
  design: string;
  subfinish: string;
  subsuitable: string;
  vendor: string;
  groupcode: string;
  color: string | string[];
  motif?: string;
  um?: string;
  currency?: string;
  gsm?: number;
  oz?: number;
  cm?: number;
  inch?: number;
  video?: string;
  videoThumbnail?: string;
  altvideo?: string;
  quantity?: number;
  purchasePrice?: number | string;
  salesPrice?: number | string;
  productIdentifier?: string;
  leadtime?: string;
  sku?: string;
  popularproduct?: boolean;
  topratedproduct?: boolean;
  landingPageProduct?: boolean;
  shopyProduct?: boolean;
  rating_value?: string | number;
  rating_count?: string | number;
  productlocationtitle?: string;
  productlocationtagline?: string;
  productlocationdescription1?: string;
  productlocationdescription2?: string;
}

interface Option { _id: string; name: string; }

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getProductPagePermission() {
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

function getImageUrl(img: string | undefined): string | undefined {
  if (!img) return undefined;
  
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }
  
  return `${API_URL}/images/${img}`;
}

function hasName(obj: unknown): obj is { name: string } {
  return Boolean(obj && typeof obj === 'object' && 'name' in obj && typeof (obj as { name?: unknown }).name === 'string');
}

// Add a type guard for objects with a name property
function isNameObject(val: unknown): val is { name: string } {
  return typeof val === 'object' && val !== null && 'name' in val && typeof (val as { name?: unknown }).name === 'string';
}

export default function ProductPage() {
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [products, setProducts] = useState<Product[]>([]);
  const [dropdowns, setDropdowns] = useState<{ [key: string]: Option[] }>({});
  const [productsLoading, setProductsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  interface FormState {
    name: string;
    slug?: string;
    productdescription?: string;
    category: string;
    substructure: string;
    content: string;
    design: string;
    subfinish: string;
    subsuitable: string;
    vendor: string;
    groupcode: string;
    colors: string[];
    motif?: string;
    um?: string;
    currency?: string;
    gsm?: number | string;
    oz?: number | string;
    cm?: number | string;
    inch?: number | string;
    img?: File | string;
    image1?: File | string;
    image2?: File | string;
    altimg1?: string;
    altimg2?: string;
    altimg3?: string;
    video?: File | string;
    videoThumbnail?: string;
    altvideo?: string;
    quantity?: number | string;
    purchasePrice?: number | string;
    salesPrice?: number | string;
    productIdentifier?: string;
    leadtime?: number | string;
    sku?: string;
    popularproduct?: boolean;
    topratedproduct?: boolean;
    landingPageProduct?: boolean;
    shopyProduct?: boolean;
    rating_value?: number | string;
    rating_count?: number | string;
    productlocationtitle?: string;
    productlocationtagline?: string;
    productlocationdescription1?: string;
    productlocationdescription2?: string;
    [key: string]: string | number | boolean | File | string[] | null | undefined;
  };

  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    productdescription: "",
    category: "",
    substructure: "",
    content: "",
    design: "",
    subfinish: "",
    subsuitable: "",
    vendor: "",
    groupcode: "",
    colors: [],
    motif: "",
    um: "",
    currency: "",
    gsm: "",
    oz: "",
    cm: "",
    inch: "",
    img: undefined,
    image1: undefined,
    image2: undefined,
    altimg1: "",
    altimg2: "",
    altimg3: "",
    video: undefined,
    altvideo: "",
    quantity: "",
    purchasePrice: "",
    salesPrice: "",
    productIdentifier: "",
    leadtime: "",
    sku: "",
    popularproduct: false,
    topratedproduct: false,
    landingPageProduct: false,
    shopyProduct: false,
    rating_value: "",
    rating_count: "",
    productlocationtitle: "",
    productlocationtagline: "",
    productlocationdescription1: "",
    productlocationdescription2: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image1Preview, setImage1Preview] = useState<string | null>(null);
  const [image2Preview, setImage2Preview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  // Helper function to safely get image URL
  const getSafeImageUrl = (img: string | undefined | null): string | null => {
    if (!img) return null;
    const url = getImageUrl(img);
    return url || null;
  };
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const image1InputRef = React.useRef<HTMLInputElement>(null);
  const image2InputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;
  const dropdownFields = React.useMemo(() => [
    { key: "category", label: "Category" },
    { key: "substructure", label: "Substructure" },
    { key: "content", label: "Content" },
    { key: "design", label: "Design" },
    { key: "subfinish", label: "Subfinish" },
    { key: "subsuitable", label: "Subsuitable" },
    { key: "vendor", label: "Vendor" },
    { key: "groupcode", label: "Groupcode" },
    { key: "color", label: "Color" },
    { key: "motif", label: "Motif" },
    // ...add any other dropdown fields you use
  ], []);
  // Add state for image dimensions
  const [imgDims, setImgDims] = useState<{img?: [number, number], image1?: [number, number], image2?: [number, number]}>({});
  // Add state for video dimensions
  const [videoDims, setVideoDims] = useState<[number, number] | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const umOptions: string[] = ["KG", "Yard", "Meter"];
  const currencyOptions: string[] = ["INR", "USD", "EUR", "GBP", "JPY", "CNY", "CAD", "AUD", "SGD", "CHF", "ZAR", "RUB", "BRL", "HKD", "NZD", "KRW", "THB", "MYR", "IDR", "PHP", "VND", "TRY", "SAR", "AED", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "ILS", "MXN", "TWD", "ARS", "CLP", "COP", "PEN", "EGP", "PKR", "BDT", "LKR", "NPR", "KES", "NGN", "GHS", "UAH", "QAR", "OMR", "KWD", "BHD", "JOD", "MAD", "DZD", "TND", "LBP", "IQD", "IRR", "AFN", "MNT", "UZS", "KZT", "AZN", "GEL", "BYN", "MDL", "ALL", "MKD", "BAM", "HRK", "RSD", "BGN", "RON", "ISK"];

  const fetchDropdowns = useCallback(async () => {
    try {
      const results = await Promise.all(
        dropdownFields.map(f => apiFetch(`${API_URL}/${f.key}`))
      );
      const datas = await Promise.all(results.map(r => r.json()));
      const newDropdowns: { [key: string]: Option[] } = {};
      dropdownFields.forEach((f, i) => {
        const options = datas[i].data || [];
        // Sort dropdown options alphabetically by name
        options.sort((a: Option, b: Option) => a.name.localeCompare(b.name));
        newDropdowns[f.key] = options;
      });
      setDropdowns(newDropdowns);
    } finally {
      // setDropdownLoading(false); // Removed as per edit hint
    }
  }, [dropdownFields]);

  const refreshDropdown = useCallback(async (key: string) => {
    try {
      const res = await apiFetch(`${API_URL}/${key}`);
      const data = await res.json();
      const items: Option[] = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      // Sort dropdown options alphabetically by name
      items.sort((a: Option, b: Option) => a.name.localeCompare(b.name));
      setDropdowns(prev => ({ ...prev, [key]: items }));
    } catch (error) {
      console.log("error",error);
    }
  }, []);

  const fetchProducts = useCallback(async (searchTerm = '') => {
    setProductsLoading(true);
    try {
      let url = `${API_URL}/product`;
      if (searchTerm) {
        url = `${API_URL}/product/search/${encodeURIComponent(searchTerm)}`;
      }
      const res = await apiFetch(url);
      const data = await res.json();
      setProducts(Array.isArray(data.data) ? (data.data as Product[]) : []);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkPermission = async () => {
      // Permission logic can be handled by setPageAccess only
    };
    checkPermission();
  }, [fetchProducts, fetchDropdowns]);

  useEffect(() => {
    fetchProducts();
    fetchDropdowns();
  }, [fetchProducts, fetchDropdowns]);

  useEffect(() => {
    setPageAccess(getProductPagePermission());
  }, []);

  useEffect(() => {
    if (form.gsm && !isNaN(Number(form.gsm))) {
      const gsmValue = Number(form.gsm);
      // GSM to OZ conversion: 1 GSM = 0.0295735 OZ
      const ozValue = (gsmValue * 0.0295735).toFixed(4);
      setForm(prev => ({ ...prev, oz: ozValue }));
    } else if (!form.gsm) {
      setForm(prev => ({ ...prev, oz: "" }));
    }
  }, [form.gsm]);

  useEffect(() => {
    if (form.cm && !isNaN(Number(form.cm))) {
      const cmValue = Number(form.cm);
      // CM to INCH conversion: 1 CM = 0.393701 INCH
      const inchValue = (cmValue * 0.393701).toFixed(4);
      setForm(prev => ({ ...prev, inch: inchValue }));
    } else if (!form.cm) {
      setForm(prev => ({ ...prev, inch: "" }));
    }
  }, [form.cm]);

  const getId = useCallback((field: unknown): string => {
    if (field && typeof field === 'object' && '_id' in field && typeof (field as { _id?: unknown })._id === 'string') {
      return (field as { _id: string })._id;
    }
    if (typeof field === 'string') return field;
    return '';
  }, []);

  // Define the shape of a color object for type safety
  interface ColorObject {
    _id: string;
    name?: string;
  }

  const handleOpen = useCallback((product?: Product) => {
    if (product) {
      console.log('Editing product:', product); // Debug log
      
      // Helper function to safely get ID from either string or object
      const getFieldValue = (field: string | { _id?: string } | null | undefined): string => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        if (field && typeof field === 'object' && '_id' in field) {
          return field._id || '';
        }
        return '';
      };

      // Handle colors - ensure we always have an array of color IDs
      let colors: string[] = [];
      if (product.color) {
        if (Array.isArray(product.color)) {
          colors = product.color
            .map(c => {
              if (!c) return '';
              if (typeof c === 'string') return c;
              return (c as ColorObject)._id || '';
            })
            .filter(Boolean) as string[];
        } else if (typeof product.color === 'string') {
          colors = [product.color];
        } else if ('_id' in product.color) {
          colors = [(product.color as ColorObject)._id];
        }
      }
      
      // Generate slug from name if not exists
      const slug = product.slug || generateSlug(product.name);
      
      const formData = {
        name: product.name,
        slug: slug,
        productdescription: product.productdescription || '',
        category: getFieldValue(product.category),
        substructure: getFieldValue(product.substructure),
        content: getFieldValue(product.content),
        design: getFieldValue(product.design),
        subfinish: getFieldValue(product.subfinish),
        subsuitable: getFieldValue(product.subsuitable),
        vendor: getFieldValue(product.vendor),
        groupcode: getFieldValue(product.groupcode),
        colors: colors,
        motif: getFieldValue(product.motif),
        um: getFieldValue(product.um),
        currency: getFieldValue(product.currency),
        gsm: product.gsm !== undefined && product.gsm !== null ? String(product.gsm) : "",
        oz: product.oz !== undefined && product.oz !== null ? String(product.oz) : "",
        cm: product.cm !== undefined && product.cm !== null ? String(product.cm) : "",
        inch: product.inch !== undefined && product.inch !== null ? String(product.inch) : "",
        img: product.img,
        image1: product.image1,
        image2: product.image2,
        altimg1: product.altimg1 || "",
        altimg2: product.altimg2 || "",
        altimg3: product.altimg3 || "",
        video: product.video,
        altvideo: product.altvideo || "",
        quantity: product.quantity !== undefined && product.quantity !== null ? String(product.quantity) : "",
        purchasePrice: product.purchasePrice !== undefined ? String(product.purchasePrice) : "",
        salesPrice: product.salesPrice !== undefined ? String(product.salesPrice) : "",
        productIdentifier: product.productIdentifier || "",
        leadtime: product.leadtime || "",
        sku: product.sku || "",
        popularproduct: product.popularproduct || false,
        topratedproduct: product.topratedproduct || false,
        landingPageProduct: product.landingPageProduct || false,
        shopyProduct: product.shopyProduct || false,
        rating_value: product.rating_value || "",
        rating_count: product.rating_count || "",
        productlocationtitle: product.productlocationtitle || "",
        productlocationtagline: product.productlocationtagline || "",
        productlocationdescription1: product.productlocationdescription1 || "",
        productlocationdescription2: product.productlocationdescription2 || ""
      };
      
      console.log('Form data to be set:', formData); // Debug log
      setForm(formData);
      setEditId(product._id || null);
      setImagePreview(getSafeImageUrl(product.img));
      setImage1Preview(getSafeImageUrl(product.image1));
      setImage2Preview(getSafeImageUrl(product.image2));
      setVideoPreview(getSafeImageUrl(product.video));
    } else {
      setForm({
        name: "",
        category: "",
        substructure: "",
        content: "",
        design: "",
        subfinish: "",
        subsuitable: "",
        vendor: "",
        groupcode: "",
        colors: [],
        motif: "",
        um: "",
        currency: "",
        gsm: "",
        oz: "",
        cm: "",
        inch: "",
        img: undefined,
        image1: undefined,
        image2: undefined,
        video: undefined,
        quantity: "",
      });
      setEditId(null);
      setImagePreview(null);
      setImage1Preview(null);
      setImage2Preview(null);
      setVideoPreview(null);
    }
    setOpen(true);
  }, [setForm, setEditId, setImagePreview, setImage1Preview, setImage2Preview, setVideoPreview, setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setImagePreview(null);
    setImage1Preview(null);
    setImage2Preview(null);
    setVideoPreview(null);
    setForm({
      name: "",
      category: "",
      substructure: "",
      content: "",
      design: "",
      subfinish: "",
      subsuitable: "",
      vendor: "",
      groupcode: "",
      colors: [],
      motif: "",
      um: "",
      currency: "",
      gsm: "",
      oz: "",
      cm: "",
      inch: "",
      img: undefined,
      image1: undefined,
      image2: undefined,
      altimg1: "",
      altimg2: "",
      altimg3: "",
      video: undefined,
      altvideo: "",
      quantity: "",
    });
  }, []);

  const handleView = useCallback(async (product: Product) => {
    try {
      // Fetch the full product details to ensure we have all related data
      const res = await apiFetch(`${API_URL}/product/${product._id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedProduct(data.data);
      } else {
        // Fallback to the original product data if the fetch fails
        setSelectedProduct(product);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setSelectedProduct(product);
    }
    setViewOpen(true);
  }, []);

  const handleViewClose = useCallback(() => {
    setViewOpen(false);
    setSelectedProduct(null);
  }, []);

  const handleDeleteImage = useCallback(async (imageType: 'img' | 'image1' | 'image2') => {
    try {
      // If this is an existing image (not a new upload), delete it from the server
      if (form[imageType] && typeof form[imageType] === 'string' && editId) {
        const imageUrl = form[imageType] as string;
        // Extract the image filename from the URL
        const imagePath = imageUrl.split('/').pop();
        if (imagePath) {
          await apiFetch(`${API_URL}/product/image/${editId}/${imagePath}`, {
            method: 'DELETE'
          });
        }
      }

      // Update the form state
      setForm(prev => ({
        ...prev,
        [imageType]: undefined
      }));
      
      // Clear the preview
      if (imageType === 'img') setImagePreview(null);
      if (imageType === 'image1') setImage1Preview(null);
      if (imageType === 'image2') setImage2Preview(null);
      
      // Reset the file input
      if (imageType === 'img' && fileInputRef.current) fileInputRef.current.value = '';
      if (imageType === 'image1' && image1InputRef.current) image1InputRef.current.value = '';
      if (imageType === 'image2' && image2InputRef.current) image2InputRef.current.value = '';
      
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    }
  }, [form, editId]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, img: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const handleImage1Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image1: file }));
      setImage1Preview(URL.createObjectURL(file));
    }
  }, []);
  
  const handleImage2Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image2: file }));
      setImage2Preview(URL.createObjectURL(file));
    }
  }, []);

  // Function to generate a URL-friendly slug from a string
  const generateSlug = (str: string): string => {
    return str
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters
      .replace(/\-\-+/g, '-')   // Replace multiple - with single -
      .replace(/^\-+/, '')      // Trim - from start of text
      .replace(/\-+$/, '');     // Trim - from end of text
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      
      // Process form data
      const processedForm = { ...form };
      
      // Auto-generate slug from name if slug is empty
      if (!processedForm.slug && processedForm.name) {
        processedForm.slug = generateSlug(processedForm.name);
      }
      
      // Track which images were explicitly removed
      const deletedImages = {
        img: processedForm.img === undefined && form.img !== undefined,
        image1: processedForm.image1 === undefined && form.image1 !== undefined,
        image2: processedForm.image2 === undefined && form.image2 !== undefined
      };
      
      // Append all form fields that have values
      Object.entries(processedForm).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          // If this is an image field that was explicitly set to undefined, mark it for deletion
          if ((key === 'img' || key === 'image1' || key === 'image2') && deletedImages[key as keyof typeof deletedImages]) {
            formData.append(`delete_${key}`, 'true');
          }
          return;
        }
        
        if (key === 'colors' && Array.isArray(value)) {
          // Handle colors array
          value.forEach(v => formData.append('color[]', v));
        } else if (value instanceof File) {
          // Handle new file uploads
          formData.append(key, value);
        } else if (key === 'img' || key === 'image1' || key === 'image2' || key === 'video') {
          // Only append image fields if they're files
          if (value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === 'string' && value.startsWith('blob:')) {
            // Skip blob URLs (they're just for preview)
            return;
          } else if (typeof value === 'string' && value) {
            // If it's a non-empty string URL, include it as a string
            formData.append(key, value);
          }
        } else {
          // Handle all other fields
          // Convert values to string before appending
          let stringValue = String(value);
          
          // Ensure slug is properly formatted
          if (key === 'slug' && stringValue) {
            stringValue = generateSlug(stringValue);
          }
          
          formData.append(key, stringValue);
        }
      });
      
      const url = editId ? `${API_URL}/product/${editId}` : `${API_URL}/product`;
      const method = editId ? "PUT" : "POST";
      const res = await apiFetch(url, {
        method,
        body: formData,
      });
      
      if (res.ok) {
        fetchProducts();
        handleClose();
      } else {
        const error = await res.json();
        console.error("Error:", error);
        alert(error.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while saving the product");
    } finally {
      setSubmitting(false);
    }
  }, [form, editId, fetchProducts, handleClose]);

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      const res = await apiFetch(`${API_URL}/product/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchProducts();
        setDeleteId(null);
      } else {
        const error = await res.json();
        console.error("Error:", error);
        alert(error.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while deleting the product");
    }
  }, [deleteId, fetchProducts]);

  // Update search handler to fetch from backend
  // Handle search input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== '') {
        fetchProducts(search);
      } else {
        fetchProducts();
      }
      setPage(1); // Reset to first page on search
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [search, fetchProducts]);

  // Get paginated products from the current list
  const paginatedProducts = useCallback(() => {
    const start = (page - 1) * rowsPerPage;
    return products.slice(start, start + rowsPerPage);
  }, [page, products]);

  // Keep filteredProducts for backward compatibility
  const filteredProducts = useCallback(() => products, [products]);

  // Define the shape of a color object
  interface ColorObject {
    _id: string;
    name?: string;
    // Add other color properties if they exist
  }

  const handleProductSelect = useCallback((
    _: React.SyntheticEvent,
    value: { label?: string; value?: string } | null
  ) => {
    if (!value) return;
    const selected = products.find(p => p._id === value.value);
    if (selected) {
      // Handle colors - ensure we always have an array of color IDs
      let colors: string[] = [];
      if (selected.color) {
        if (Array.isArray(selected.color)) {
          colors = selected.color.map(c => 
            typeof c === 'string' ? c : (c && '_id' in c ? (c as ColorObject)._id : '')
          ).filter(Boolean) as string[];
        } else if (typeof selected.color === 'string') {
          colors = [selected.color];
        } else if (selected.color && '_id' in selected.color) {
          colors = [(selected.color as ColorObject)._id];
        }
      }

      setForm({
        name: selected.name,
        slug: selected.slug || '',
        productdescription: selected.productdescription || '',
        category: getId(selected.category),
        substructure: getId(selected.substructure),
        content: getId(selected.content),
        design: getId(selected.design),
        subfinish: getId(selected.subfinish),
        subsuitable: getId(selected.subsuitable),
        vendor: getId(selected.vendor),
        groupcode: getId(selected.groupcode),
        colors: colors,
        motif: getId(selected.motif),
        um: getId(selected.um),
        currency: getId(selected.currency),
        gsm: selected.gsm !== undefined && selected.gsm !== null ? String(selected.gsm) : "",
        oz: selected.oz !== undefined && selected.oz !== null ? String(selected.oz) : "",
        cm: selected.cm !== undefined && selected.cm !== null ? String(selected.cm) : "",
        inch: selected.inch !== undefined && selected.inch !== null ? String(selected.inch) : "",
        img: selected.img,
        image1: selected.image1,
        image2: selected.image2,
        video: selected.video,
        quantity: selected.quantity !== undefined && selected.quantity !== null ? String(selected.quantity) : "",
      });
      setImagePreview(selected.img ? getImageUrl(selected.img) || null : null);
      setImage1Preview(selected.image1 ? getImageUrl(selected.image1) || null : null);
      setImage2Preview(selected.image2 ? getImageUrl(selected.image2) || null : null);
      setVideoPreview(selected.video ? getImageUrl(selected.video) || null : null);
    } else {
      setForm(prev => ({ ...prev, name: value.label || "" }));
    }
  }, [products, getId, setForm, setImagePreview, setImage1Preview, setImage2Preview, setVideoPreview]);

  // Add effect to auto-calculate oz and inch
  // Only auto-calculate oz if oz is empty (not set from backend or user input)
  useEffect(() => {
    if (form.gsm && !isNaN(Number(form.gsm)) && (!form.oz || form.oz === "")) {
      const oz = (Number(form.gsm) / 33.906).toFixed(2);
      setForm(prev => ({ ...prev, oz }));
    }
  }, [form.gsm, form.oz]);

  // Only auto-calculate inch if inch is empty (not set from backend or user input)
  useEffect(() => {
    if (form.cm && !isNaN(Number(form.cm)) && (!form.inch || form.inch === "")) {
      const inch = (Number(form.cm) / 2.54).toFixed(2);
      setForm(prev => ({ ...prev, inch }));
    }
  }, [form.cm, form.inch]);

  if (pageAccess === 'no access') {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" sx={{ color: '#e74c3c', mb: 2 }}>
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
          You don&apos;t have permission to access this page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {pageAccess === 'only view' && (
        <Box sx={{ mb: 2 }}>
          <Paper elevation={2} sx={{ p: 2, bgcolor: '#fffbe6', border: '1px solid #ffe58f' }}>
            <Typography color="#ad6800" fontWeight={600}>
              You have view-only access. To make changes, contact your admin.
            </Typography>
          </Paper>
        </Box>
      )}
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 600, 
            color: '#2c3e50'
          }}>
            Product Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            disabled={pageAccess === 'only view'}
            sx={{
              bgcolor: '#3498db',
              '&:hover': { bgcolor: '#2980b9' },
              borderRadius: '8px',
              px: 3,
              py: 1.5,
              fontWeight: 600
            }}
          >
            Add Product
          </Button>
        </Box>
        <Typography variant="body1" sx={{ 
          color: '#7f8c8d',
          fontSize: '16px'
        }}>
          Manage your product catalog and inventory
        </Typography>
      </Box>

      {/* Search and Stats */}
      <Box sx={{ mb: 3 }}>
        <Paper sx={{
          p: 3,
          borderRadius: '12px',
          background: '#fff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          border: '1px solid #ecf0f1',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#f8f9fa',
              borderRadius: '8px',
              px: 2,
              py: 1,
              flex: 1,
              border: '1px solid #ecf0f1'
            }}>
              <SearchIcon sx={{ color: '#7f8c8d', mr: 1 }} />
              <InputBase
                placeholder="Search products by name and slug"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ flex: 1, fontSize: '14px' }}
              />
            </Box>
            <Chip
              icon={<FilterListIcon />}
              label={`${filteredProducts().length} products`}
              sx={{
                bgcolor: '#3498db',
                color: 'white',
                fontWeight: 600
              }}
            />
          </Box>
        </Paper>
      </Box>

      {/* Products Table */}
      <Paper sx={{
        borderRadius: '12px',
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid #ecf0f1',
        overflow: 'hidden'
      }}>
        {productsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>
                    Product
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>
                    Slug
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>
                    productdescription
                  </TableCell>
                 
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts().map((product) => (
                  <TableRow key={product._id} sx={{ '&:hover': { bgcolor: '#f8f9fa' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {product.img && (
                          <Box sx={{ 
                            width: 50, 
                            height: 50, 
                            position: 'relative',
                            flexShrink: 0,
                            bgcolor: '#f8f9fa',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <Image
                              src={getImageUrl(product.img) || ''}
                              alt={product.name}
                              fill
                              style={{ objectFit: 'contain' }}
                              unoptimized
                            />
                          </Box>
                        )}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            <span dangerouslySetInnerHTML={{ __html: product.name }} />
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
                            ID: {product._id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ 
                        maxWidth: '200px', 
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: 1.4
                      }}>
                        {product.slug || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span dangerouslySetInnerHTML={{ __html: product.productdescription || 'N/A' }} />
                      </Box>
                    </TableCell>
                   
                   
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleView(product)}
                          sx={{ color: '#3498db' }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpen(product)}
                          disabled={pageAccess === 'only view'}
                          sx={{ color: '#f39c12' }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteId(product._id || null)}
                          disabled={pageAccess === 'only view'}
                          sx={{ color: '#e74c3c' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {/* Pagination */}
        {filteredProducts().length > rowsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, borderTop: '1px solid #ecf0f1' }}>
            <Pagination
              count={Math.ceil(filteredProducts().length / rowsPerPage)}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '6px',
                }
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <AppBar position="relative" color="default" elevation={1}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
              sx={{ mr: 2 }}
            >
              <ClearIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flex: 1 }}>
              {editId ? 'Edit' : 'Add'} Product
            </Typography>
            <Button
              autoFocus
              color="primary"
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent sx={{ p: 0, '&.MuiDialogContent-root': { overflowY: 'auto' } }}>
          <Box sx={{ p: 3, '& > *:not(:last-child)': { mb: 2.5 } }}>
          {/* Product selection dropdown for duplication/quick fill */}
          <Autocomplete
            options={products.map((p: Product) => ({ label: p.name, value: p._id }))}
            getOptionLabel={option => typeof option === 'string' ? option : option.label}
            onChange={handleProductSelect}
            renderInput={(params) => (
              <TextField {...params} label="Copy From Product" placeholder="Type or select to copy..." />
            )}
            sx={{ minWidth: 220, mb: 2 }}
            disabled={pageAccess === 'only view'}
          />
            <TextField
              label="Product Name"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              helperText="Enter the full name of the product as it should appear on the website"
              InputProps={{ readOnly: pageAccess === 'only view' }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                }
              }}
            />
            <TextField
              label="Slug (URL-friendly name)"
              value={form.slug || ''}
              onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
              fullWidth
              helperText="Leave empty to auto-generate from product name"
              InputProps={{ 
                readOnly: pageAccess === 'only view',
              }}
              inputProps={{
                style: { 
                  textTransform: 'lowercase',
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
                '& .MuiInputBase-input::placeholder': {
                  textTransform: 'none',
                  opacity: 1,
                }
              }}
            />
            <TextField
              label="Product Description"
              value={form.productdescription || ''}
              onChange={(e) => setForm(prev => ({ ...prev, productdescription: e.target.value }))}
              fullWidth
              multiline
              rows={4}
              helperText="Provide a detailed description of the product. Include key features, benefits, and any other relevant information."
              InputProps={{ readOnly: pageAccess === 'only view' }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              inputProps={{
                style: { 
                  minHeight: '80px'
                }
              }}
            />
            
            {dropdownFields.map((field) => {
              if (field.key === 'color') {
                return (
                  <Autocomplete
                    key="colors"
                    onOpen={() => refreshDropdown('color')}
                    multiple
                    options={dropdowns.color || []}
                    getOptionLabel={(option) => {
                      if (!option) return '';
                      if (typeof option === 'string') return option;
                      return option.name || option._id || '';
                    }}
                    isOptionEqualToValue={(option, value) => {
                      if (!option || !value) return false;
                      const optionId = typeof option === 'string' ? option : option._id;
                      const valueId = typeof value === 'string' ? value : value._id;
                      return optionId === valueId;
                    }}
                    value={form.colors
                      .map(colorId => {
                        if (!colorId) return null;
                        // Find the color in dropdowns or return the ID as is
                        const found = (dropdowns.color || []).find(c => c._id === colorId);
                        return found || colorId;
                      })
                      .filter(Boolean)
                    }
                    onChange={(_, newValue) => {
                      const selectedColors = newValue.map(item => {
                        if (!item) return '';
                        return typeof item === 'string' ? item : (item._id || '');
                      }).filter(Boolean);
                      
                      setForm(prev => ({
                        ...prev,
                        colors: selectedColors
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Colors"
                        placeholder="Search and select colors..."
                        sx={{
                          borderRadius: '8px',
                        }}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        if (!option) return null;
                        const optionId = typeof option === 'string' ? option : (option._id || '');
                        const optionLabel = typeof option === 'string' ? option : (option.name || option._id || '');
                        return (
                          <Chip
                            {...getTagProps({ index })}
                            key={optionId}
                            label={optionLabel}
                            size="small"
                            sx={{ 
                              m: 0.5,
                              bgcolor: '#f0f0f0',
                              '& .MuiChip-deleteIcon': {
                                color: '#666',
                                '&:hover': {
                                  color: '#333',
                                },
                              },
                            }}
                          />
                        );
                      })}
                    disabled={pageAccess === 'only view'}
                  />
                );
              }
              
              return (
                <FormControl key={field.key} fullWidth required>
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    onOpen={() => refreshDropdown(field.key)}
                    value={form[field.key] || ""}
                    onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    label={field.label}
                    sx={{
                      borderRadius: '8px',
                    }}
                    disabled={pageAccess === 'only view'}
                    endAdornment={
                      form[field.key] && (
                        <InputAdornment position="end" sx={{ mr: 1 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm(prev => ({ ...prev, [field.key]: '' }));
                            }}
                            sx={{ p: 0.5 }}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  >
                    {dropdowns[field.key]?.map((option: Option, index: number) => (
                      <MenuItem key={`${field.key}-${option._id}-${index}`} value={option._id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            })}
            
            <FormControl fullWidth required>
              <InputLabel>UM</InputLabel>
              <Select
                value={form.um || ""}
                onChange={e => setForm(prev => ({ ...prev, um: e.target.value }))}
                label="UM"
                sx={{ borderRadius: '8px' }}
                disabled={pageAccess === 'only view'}
                endAdornment={
                  form.um && (
                    <InputAdornment position="end" sx={{ mr: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm(prev => ({ ...prev, um: '' }));
                        }}
                        sx={{ p: 0.5 }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              >
                {umOptions.map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Autocomplete
              freeSolo
              options={currencyOptions}
              value={form.currency || ""}
              onInputChange={(_, value) => setForm(prev => ({ ...prev, currency: value }))}
              renderInput={(params) => (
                <TextField {...params} label="Currency" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} disabled={pageAccess === 'only view'} />
              )}
              disabled={pageAccess === 'only view'}
            />
            <TextField
              label="GSM"
              type="number"
              value={form.gsm || ""}
              onChange={e => setForm(prev => ({ ...prev, gsm: e.target.value }))}
              fullWidth
              helperText="Grams per square meter (fabric weight)"
              disabled={pageAccess === 'only view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="OZ"
              type="number"
              value={form.oz || ""}
              fullWidth
              disabled
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="CM"
              type="number"
              value={form.cm || ""}
              onChange={e => setForm(prev => ({ ...prev, cm: e.target.value }))}
              fullWidth
              helperText="Width in centimeters"
              disabled={pageAccess === 'only view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="INCH"
              type="number"
              value={form.inch || ""}
              fullWidth
              disabled
              helperText="Width in inches (auto-calculated from CM)"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="MOQ (Minimum Order Quantity)"
              type="number"
              value={form.quantity || ""}
              onChange={e => setForm(prev => ({ ...prev, quantity: e.target.value }))}
              fullWidth
              helperText="Minimum order quantity required for purchase"
              disabled={pageAccess === 'only view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
            <TextField
              label="Purchase Price"
              type="number"
              value={form.purchasePrice || ""}
              onChange={e => setForm(prev => ({ ...prev, purchasePrice: e.target.value }))}
              fullWidth
              disabled={pageAccess === 'only view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {form.currency || '₹'}
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Sales Price"
              type="number"
              value={form.salesPrice || ""}
              onChange={e => setForm(prev => ({ ...prev, salesPrice: e.target.value }))}
              fullWidth
              disabled={pageAccess === 'only view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {form.currency || '₹'}
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Product Identifier"
              value={form.productIdentifier || ""}
              onChange={e => setForm(prev => ({ ...prev, productIdentifier: e.target.value }))}
              fullWidth
              disabled={pageAccess === 'only view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              helperText="Unique identifier for the product"
            />
            <TextField
              label="Lead Time (days)"
              type="number"
              value={form.leadtime || ""}
              onChange={e => setForm(prev => ({ ...prev, leadtime: e.target.value }))}
              fullWidth
              disabled={pageAccess === 'only view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              helperText="Estimated delivery time in days"
            />
            <TextField
              label="SKU"
              value={form.sku || ""}
              onChange={e => setForm(prev => ({ ...prev, sku: e.target.value }))}
              fullWidth
              disabled={pageAccess === 'only view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              helperText="Stock Keeping Unit"
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={Boolean(form.popularproduct)}
                    onChange={e => setForm(prev => ({ ...prev, popularproduct: e.target.checked }))}
                    disabled={pageAccess === 'only view'}
                  />
                }
                label="Popular Product"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={Boolean(form.topratedproduct)}
                    onChange={e => setForm(prev => ({ ...prev, topratedproduct: e.target.checked }))}
                    disabled={pageAccess === 'only view'}
                  />
                }
                label="Top Rated"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={Boolean(form.landingPageProduct)}
                    onChange={e => setForm(prev => ({ ...prev, landingPageProduct: e.target.checked }))}
                    disabled={pageAccess === 'only view'}
                  />
                }
                label="Landing Page Product"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={Boolean(form.shopyProduct)}
                    onChange={e => setForm(prev => ({ ...prev, shopyProduct: e.target.checked }))}
                    disabled={pageAccess === 'only view'}
                  />
                }
                label="Shopy Product"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Rating Value"
                type="number"
                value={form.rating_value || ""}
                onChange={e => {
                  const value = parseFloat(e.target.value);
                  if ((value >= 0 && value <= 5) || e.target.value === '') {
                    setForm(prev => ({ ...prev, rating_value: e.target.value }));
                  }
                }}
                fullWidth
                disabled={pageAccess === 'only view'}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                helperText="Rating value (0-5)"
              />
              <TextField
                label="Rating Count"
                type="number"
                value={form.rating_count || ""}
                onChange={e => {
                  const value = parseInt(e.target.value);
                  if ((value >= 0) || e.target.value === '') {
                    setForm(prev => ({ ...prev, rating_count: e.target.value }));
                  }
                }}
                fullWidth
                disabled={pageAccess === 'only view'}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                inputProps={{ min: 0 }}
                helperText="Number of ratings"
              />
            </Box>
            <Typography variant="h6" sx={{ mt: 2, mb: 1, color: '#2c3e50', fontWeight: 600 }}>Product Location</Typography>
            <TextField
              label="Location Title"
              value={form.productlocationtitle || ""}
              onChange={e => setForm(prev => ({ ...prev, productlocationtitle: e.target.value }))}
              fullWidth
              disabled={pageAccess === 'only view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, mb: 2 }}
            />
            <TextField
              label="Location Tagline"
              value={form.productlocationtagline || ""}
              onChange={e => setForm(prev => ({ ...prev, productlocationtagline: e.target.value }))}
              fullWidth
              disabled={pageAccess === 'only view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, mb: 2 }}
            />
            <TextField
              label="Location Description 1"
              value={form.productlocationdescription1 || ""}
              onChange={e => setForm(prev => ({ ...prev, productlocationdescription1: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              disabled={pageAccess === 'only view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, mb: 2 }}
            />
            <TextField
              label="Location Description 2"
              value={form.productlocationdescription2 || ""}
              onChange={e => setForm(prev => ({ ...prev, productlocationdescription2: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              disabled={pageAccess === 'only view'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, mb: 2 }}
            />
            <Box>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<ImageIcon />}
                disabled={pageAccess === 'only view'}
                sx={{
                  borderRadius: '8px',
                  borderColor: '#bdc3c7',
                  color: '#7f8c8d',
                  '&:hover': {
                    borderColor: '#95a5a6',
                    bgcolor: '#f8f9fa',
                  }
                }}
              >
                {imagePreview ? 'Change Main Image' : 'Upload Main Image'}
              </Button>
              <Box sx={{ 
                mt: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                {imagePreview && (
                  <Box sx={{ 
                    position: 'relative',
                    width: 200,
                    height: 200,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0',
                    bgcolor: '#f5f5f5',
                    '&:hover .delete-btn': {
                      opacity: 1
                    }
                  }}>
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={200}
                      height={200}
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      className="delete-btn"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage('img');
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 0, 0, 0.7)',
                        color: 'white',
                        width: 28,
                        height: 28,
                        opacity: 0.8,
                        transition: 'opacity 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 0, 0, 0.9)',
                          opacity: 1
                        },
                      }}
                      disabled={pageAccess === 'only view'}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
            <Box>
              <input
                type="file"
                ref={image1InputRef}
                onChange={handleImage1Change}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                onClick={() => image1InputRef.current?.click()}
                startIcon={<ImageIcon />}
                disabled={pageAccess === 'only view'}
                sx={{
                  borderRadius: '8px',
                  borderColor: '#bdc3c7',
                  color: '#7f8c8d',
                  '&:hover': {
                    borderColor: '#95a5a6',
                    bgcolor: '#f8f9fa',
                  }
                }}
              >
                {image1Preview ? 'Change Image 1' : 'Upload Image 1'}
              </Button>
              <Box sx={{ 
                mt: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                {image1Preview && (
                  <Box sx={{ 
                    position: 'relative',
                    width: 200,
                    height: 200,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0',
                    bgcolor: '#f5f5f5',
                    '&:hover .delete-btn': {
                      opacity: 1
                    }
                  }}>
                    <Image
                      src={image1Preview}
                      alt="Preview 1"
                      width={200}
                      height={200}
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      className="delete-btn"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage('image1');
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 0, 0, 0.7)',
                        color: 'white',
                        width: 28,
                        height: 28,
                        opacity: 0.8,
                        transition: 'opacity 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 0, 0, 0.9)',
                          opacity: 1
                        },
                      }}
                      disabled={pageAccess === 'only view'}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
            <Box>
              <input
                type="file"
                ref={image2InputRef}
                onChange={handleImage2Change}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                onClick={() => image2InputRef.current?.click()}
                startIcon={<ImageIcon />}
                disabled={pageAccess === 'only view'}
                sx={{
                  borderRadius: '8px',
                  borderColor: '#bdc3c7',
                  color: '#7f8c8d',
                  '&:hover': {
                    borderColor: '#95a5a6',
                    bgcolor: '#f8f9fa',
                  }
                }}
              >
                {image2Preview ? 'Change Image 2' : 'Upload Image 2'}
              </Button>
              <Box sx={{ 
                mt: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}>
                {image2Preview && (
                  <Box sx={{ 
                    position: 'relative',
                    width: 200,
                    height: 200,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0',
                    bgcolor: '#f5f5f5',
                    '&:hover .delete-btn': {
                      opacity: 1
                    }
                  }}>
                    <Image
                      src={image2Preview}
                      alt="Preview 2"
                      width={200}
                      height={200}
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <IconButton
                      className="delete-btn"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage('image2');
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 0, 0, 0.7)',
                        color: 'white',
                        width: 28,
                        height: 28,
                        opacity: 0.8,
                        transition: 'opacity 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 0, 0, 0.9)',
                          opacity: 1
                        },
                      }}
                      disabled={pageAccess === 'only view'}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>
            {/* Video upload */}
            <Box>
              <input
                type="file"
                accept="video/mp4"
                style={{ display: 'none' }}
                ref={videoInputRef}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setForm(prev => ({ ...prev, video: file }));
                    setVideoPreview(URL.createObjectURL(file));
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={() => videoInputRef.current?.click()}
                startIcon={<ImageIcon />}
                disabled={pageAccess === 'only view'}
                sx={{
                  borderRadius: '8px',
                  borderColor: '#bdc3c7',
                  color: '#7f8c8d',
                  '&:hover': {
                    borderColor: '#95a5a6',
                    bgcolor: '#f8f9fa',
                  }
                }}
              >
                {videoPreview ? 'Change Video' : 'Upload Video'}
              </Button>
              {videoPreview && (
                <Box sx={{ mt: 2 }}>
                  <video
                    src={videoPreview}
                    controls
                    style={{ maxWidth: '200px', borderRadius: '8px' }}
                  />
                </Box>
              )}
            </Box>
            
            {/* Alternative Image URLs */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Alternative Image Text</Typography>
              <TextField
                label="Alternative Image 1 Text"
                value={form.altimg1 || ''}
                onChange={(e) => setForm(prev => ({ ...prev, altimg1: e.target.value }))}
                fullWidth
                margin="normal"
                disabled={pageAccess === 'only view'}
                helperText="Text for alternative image 1"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
              <TextField
                label="Alternative Image 2 Text"
                value={form.altimg2 || ''}
                onChange={(e) => setForm(prev => ({ ...prev, altimg2: e.target.value }))}
                fullWidth
                margin="normal"
                disabled={pageAccess === 'only view'}
                helperText="Text for alternative image 2"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
              <TextField
                label="Alternative Image 3 Text"
                value={form.altimg3 || ''}
                onChange={(e) => setForm(prev => ({ ...prev, altimg3: e.target.value }))}
                fullWidth
                margin="normal"
                disabled={pageAccess === 'only view'}
                helperText="Text for alternative image 3"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
              <TextField
                label="Video Alt Text"
                value={form.altvideo || ''}
                onChange={(e) => setForm(prev => ({ ...prev, altvideo: e.target.value }))}
                fullWidth
                margin="normal"
                disabled={pageAccess === 'only view'}
                helperText="Alternative text for the video (for accessibility)"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>
            </Box>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={handleViewClose} fullScreen>
        <AppBar sx={{ position: 'relative', bgcolor: '#f8f9fa', color: '#2c3e50', borderBottom: '1px solid #ecf0f1' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleViewClose} aria-label="Close">
              <ClearIcon />
            </IconButton>
            <Typography variant="h6" sx={{ ml: 2, flex: 1, fontWeight: 600 }}>
              Product Details
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent sx={{ p: 3 }}>
          {selectedProduct && (
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* Media row with labels */}
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                {/* Main Image */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>Main Image</Typography>
                  {selectedProduct.img && (
                    <Box>
                      <Image
                        src={getImageUrl(selectedProduct.img) || ""}
                        alt="Main"
                        width={200}
                        height={200}
                        style={{ borderRadius: '8px' }}
                        onLoad={e => {
                          const target = e.target as HTMLImageElement;
                          setImgDims(dims => ({ ...dims, img: [target.naturalWidth, target.naturalHeight] }));
                        }}
                      />
                      {imgDims.img && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          w: {imgDims.img[0]} h: {imgDims.img[1]}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
                {/* Image 1 */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>Image 1</Typography>
                  {selectedProduct.image1 && (
                    <Box>
                      <Image
                        src={getImageUrl(selectedProduct.image1) || ""}
                        alt="Image 1"
                        width={200}
                        height={200}
                        style={{ borderRadius: '8px' }}
                        onLoad={e => {
                          const target = e.target as HTMLImageElement;
                          setImgDims(dims => ({ ...dims, image1: [target.naturalWidth, target.naturalHeight] }));
                        }}
                      />
                      {imgDims.image1 && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          w: {imgDims.image1[0]} h: {imgDims.image1[1]}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
                {/* Image 2 */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>Image 2</Typography>
                  {selectedProduct.image2 && (
                    <Box>
                      <Image
                        src={getImageUrl(selectedProduct.image2) || ""}
                        alt="Image 2"
                        width={200}
                        height={200}
                        style={{ borderRadius: '8px' }}
                        onLoad={e => {
                          const target = e.target as HTMLImageElement;
                          setImgDims(dims => ({ ...dims, image2: [target.naturalWidth, target.naturalHeight] }));
                        }}
                      />
                      {imgDims.image2 && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          w: {imgDims.image2[0]} h: {imgDims.image2[1]}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
                {/* Video */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>Video</Typography>
                  {selectedProduct.video && (
                    <Box>
                      <video
                        src={getImageUrl(selectedProduct.video) || ""}
                        controls
                        poster={getImageUrl(selectedProduct.videoThumbnail) || undefined}
                        style={{ maxWidth: '200px', borderRadius: '8px' }}
                        onLoadedMetadata={e => {
                          const target = e.target as HTMLVideoElement;
                          setVideoDims([target.videoWidth, target.videoHeight]);
                        }}
                      />
                      {videoDims && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          w: {videoDims[0]} h: {videoDims[1]}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
              
              {/* Alternative Image URLs and Video Alt Text */}
              {(selectedProduct.altimg1 || selectedProduct.altimg2 || selectedProduct.altimg3 || selectedProduct.altvideo) && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
                    Alternative Media Details
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
                    {selectedProduct.altimg1 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Alternative Image 1 Text:</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{selectedProduct.altimg1}</Typography>
                      </Box>
                    )}
                    {selectedProduct.altimg2 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Alternative Image 2 Text:</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{selectedProduct.altimg2}</Typography>
                      </Box>
                    )}
                    {selectedProduct.altimg3 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Alternative Image 3 Text:</Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{selectedProduct.altimg3}</Typography>
                      </Box>
                    )}
                    {selectedProduct.altvideo && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Video Alt Text:</Typography>
                        <Typography variant="body2">{selectedProduct.altvideo}</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
              
              {/* Product name, ID and description above details grid */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
                  <span dangerouslySetInnerHTML={{ __html: selectedProduct.name }} />
                </Typography>
                <Typography variant="body2" sx={{ color: '#7f8c8d', mb: 1 }}>
                  ID: {selectedProduct._id}
                </Typography>
                {selectedProduct.productdescription && (
                  <Typography variant="body1" sx={{ 
                    color: '#2c3e50', 
                    mt: 2, 
                    p: 2, 
                    bgcolor: '#f8f9fa', 
                    borderRadius: '8px',
                    textAlign: 'left',
                    whiteSpace: 'pre-line'
                  }}>
                    <span dangerouslySetInnerHTML={{ __html: selectedProduct.productdescription }} />
                  </Typography>
                )}
              </Box>
              {/* Details grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                {dropdownFields.filter(field => field.key !== 'motif' && field.key !== 'color').map((field) => {
                  const value = (selectedProduct as unknown as Record<string, unknown>)[field.key];
                  // Helper function to get display value
                  const getDisplayValue = (val: unknown): string => {
                    if (!val) return '-';
                    if (isNameObject(val)) return val.name || '-';
                    if (typeof val === 'object' && val !== null && '_id' in val) {
                      return (val as { _id: string })._id || '-';
                    }
                    return String(val);
                  };
                  
                  return (
                    <Box key={field.key}>
                      <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>
                        {field.label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>
                        {getDisplayValue(value)}
                      </Typography>
                    </Box>
                  );
                })}
                {/* Color field with multiple values */}
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>
                    Colors
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {(() => {
                      // Handle all possible color formats
                      const colors = selectedProduct.color;
                      
                      if (!colors) return <Typography variant="body2" sx={{ color: '#2c3e50' }}>-</Typography>;
                      
                      // Convert single color to array for consistent handling
                      const colorArray = Array.isArray(colors) ? colors : [colors];
                      
                      if (colorArray.length === 0) {
                        return <Typography variant="body2" sx={{ color: '#2c3e50' }}>-</Typography>;
                      }
                      
                      return colorArray.map((color, index) => {
                        let colorLabel = 'N/A';
                        
                        if (color === null || color === undefined) {
                          colorLabel = 'N/A';
                        } else if (typeof color === 'string') {
                          colorLabel = color;
                        } else if (typeof color === 'object' && color !== null) {
                          const colorObj = color as { name?: string; _id?: string };
                          colorLabel = colorObj.name || colorObj._id || 'N/A';
                        }
                        
                        return (
                          <Chip
                            key={`${colorLabel}-${index}`}
                            label={colorLabel}
                            size="small"
                            sx={{ 
                              bgcolor: '#f0f8ff', 
                              color: '#2980b9', 
                              fontWeight: 500,
                              mb: 0.5
                            }}
                          />
                        );
                      });
                    })()}
                  </Box>
                </Box>
                {/* Product Details - First Column */}
                <Box sx={{ gridColumn: '1 / -1', mt: 2, mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', borderBottom: '1px solid #eee', pb: 1 }}>Product Details</Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>Motif</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{hasName(selectedProduct.motif) ? selectedProduct.motif.name || '-' : selectedProduct.motif || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>UM</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.um || '-'}</Typography>
                </Box>
                
                {/* Pricing Information */}
                <Box sx={{ gridColumn: '1 / -1', mt: 2, mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', borderBottom: '1px solid #eee', pb: 1 }}>Pricing & Inventory</Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>Purchase Price</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.purchasePrice || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>Sales Price</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.salesPrice || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>Quantity</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.quantity || '0'}</Typography>
                </Box>
                
                {/* Product Identification */}
                <Box sx={{ gridColumn: '1 / -1', mt: 2, mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', borderBottom: '1px solid #eee', pb: 1 }}>Product Identification</Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>SKU</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.sku || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>Product ID</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.productIdentifier || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>Lead Time</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.leadtime || '-'}</Typography>
                </Box>
                
                {/* Product Flags */}
                <Box sx={{ gridColumn: '1 / -1', mt: 2, mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', borderBottom: '1px solid #eee', pb: 1 }}>Product Flags</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip 
                    label={selectedProduct.popularproduct ? 'Popular Product' : 'Not Popular'} 
                    size="small" 
                    sx={{ 
                      width: 'fit-content',
                      bgcolor: selectedProduct.popularproduct ? '#e3f2fd' : '#f5f5f5',
                      color: selectedProduct.popularproduct ? '#1976d2' : '#757575'
                    }} 
                  />
                  <Chip 
                    label={selectedProduct.topratedproduct ? 'Top Rated' : 'Not Top Rated'} 
                    size="small" 
                    sx={{ 
                      width: 'fit-content',
                      bgcolor: selectedProduct.topratedproduct ? '#e8f5e9' : '#f5f5f5',
                      color: selectedProduct.topratedproduct ? '#2e7d32' : '#757575'
                    }} 
                  />
                  <Chip 
                    label={selectedProduct.landingPageProduct ? 'Featured on Landing Page' : 'Not on Landing Page'} 
                    size="small" 
                    sx={{ 
                      width: 'fit-content',
                      bgcolor: selectedProduct.landingPageProduct ? '#fff3e0' : '#f5f5f5',
                      color: selectedProduct.landingPageProduct ? '#e65100' : '#757575'
                    }} 
                  />
                  <Chip 
                    label={selectedProduct.shopyProduct ? 'Shopy Product' : 'Not a Shopy Product'} 
                    size="small" 
                    sx={{ 
                      width: 'fit-content',
                      bgcolor: selectedProduct.shopyProduct ? '#f3e5f5' : '#f5f5f5',
                      color: selectedProduct.shopyProduct ? '#7b1fa2' : '#757575'
                    }} 
                  />
                </Box>
                
                {/* Ratings */}
                {selectedProduct.rating_value && (
                  <Box sx={{ gridColumn: '1 / -1', mt: 2, mb: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2c3e50', borderBottom: '1px solid #eee', pb: 1 }}>Ratings</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#2c3e50', mr: 1 }}>Rating:</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: '#ffc107' }}>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} style={{ color: i < Math.floor(Number(selectedProduct.rating_value) || 0) ? '#ffc107' : '#e0e0e0' }}>★</span>
                          ))}
                          <Typography variant="body2" sx={{ color: '#2c3e50', ml: 1 }}>
                            ({selectedProduct.rating_value} / 5)
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                        {selectedProduct.rating_count || '0'} ratings
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {/* Product Location Information */}
                {(selectedProduct.productlocationtitle || selectedProduct.productlocationtagline || selectedProduct.productlocationdescription1 || selectedProduct.productlocationdescription2) && (
                  <Box sx={{ gridColumn: '1 / -1', mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50', borderBottom: '1px solid #ddd', pb: 1 }}>
                      Product Location Information
                    </Typography>
                    
                    {selectedProduct.productlocationtitle && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Title:</Typography>
                        <Typography variant="body2">{selectedProduct.productlocationtitle}</Typography>
                      </Box>
                    )}
                    
                    {selectedProduct.productlocationtagline && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Tagline:</Typography>
                        <Typography variant="body2">{selectedProduct.productlocationtagline}</Typography>
                      </Box>
                    )}
                    
                    {selectedProduct.productlocationdescription1 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Description 1:</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{selectedProduct.productlocationdescription1}</Typography>
                      </Box>
                    )}
                    
                    {selectedProduct.productlocationdescription2 && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>Description 2:</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{selectedProduct.productlocationdescription2}</Typography>
                      </Box>
                    )}
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>Currency</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.currency || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>GSM</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.gsm || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>OZ</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.oz || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>CM</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.cm || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>INCH</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.inch || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#7f8c8d', textTransform: 'uppercase', fontWeight: 600 }}>Quantity</Typography>
                  <Typography variant="body2" sx={{ color: '#2c3e50', mt: 0.5 }}>{selectedProduct.quantity ?? '-'}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa' }}>
          <Button onClick={handleViewClose} sx={{ color: '#7f8c8d' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onClose={() => { setDeleteId(null); setDeleteError(null); }}>
        <DialogTitle sx={{ fontWeight: 600, color: '#2c3e50' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this product? This action cannot be undone.
          </Typography>
          {deleteError && (
            <Typography sx={{ color: 'error.main', mt: 2 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteId(null); setDeleteError(null); }} sx={{ color: '#7f8c8d' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              bgcolor: '#e74c3c',
              '&:hover': { bgcolor: '#c0392b' },
              borderRadius: '8px'
            }}
            disabled={pageAccess === 'only view'}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}