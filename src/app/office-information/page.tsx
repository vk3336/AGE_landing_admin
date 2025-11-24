"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Pagination, Breadcrumbs, Link, CircularProgress, FormControl, InputLabel, Select, MenuItem, Divider
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { apiFetch } from '../../utils/apiFetch';

interface OfficeInformation {
  _id?: string;
  companyName: string;
  companyPhone1: string;
  companyPhone2: string;
  companyEmail: string;
  companyAddress: string;
  companyLanguages: string[];
  companyFoundingDate: string;
  companyEmployeeRange: string;
  companyAwards: string;
  whatsappNumber: string;
  n8nApiKey: string;
  n8nAuthHeader: string;
  n8nAuthScheme: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
}

const OfficeInfoRow = React.memo(({ office, onEdit, onDelete, onView, viewOnly }: {
  office: OfficeInformation;
  onEdit: (office: OfficeInformation) => void;
  onDelete: (id: string) => void;
  onView: (office: OfficeInformation) => void;
  viewOnly: boolean;
}) => (
  <TableRow hover sx={{ transition: 'background 0.2s', '&:hover': { background: 'rgba(41,72,255,0.08)' } }}>
    <TableCell>{office.companyName}</TableCell>
    <TableCell>{office.companyEmail}</TableCell>
    <TableCell>{office.companyPhone1}</TableCell>
    <TableCell>
      <IconButton color="info" onClick={() => onView(office)} title="View Details">
        <VisibilityIcon />
      </IconButton>
      <IconButton color="primary" onClick={() => onEdit(office)} disabled={viewOnly} title="Edit">
        <EditIcon />
      </IconButton>
      <IconButton color="error" onClick={() => onDelete(office._id || "")} disabled={viewOnly} title="Delete">
        <DeleteIcon />
      </IconButton>
    </TableCell>
  </TableRow>
));

OfficeInfoRow.displayName = 'OfficeInfoRow';

const ViewOfficeDetails = ({ open, onClose, office }: { open: boolean; onClose: () => void; office: OfficeInformation | null }) => {
  if (!office) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 24, background: 'linear-gradient(90deg,#396afc,#2948ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Office Details
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Company Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Company Name</Typography>
              <Typography variant="body1">{office.companyName}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{office.companyEmail}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Primary Phone</Typography>
              <Typography variant="body1">{office.companyPhone1}</Typography>
            </Box>
            {office.companyPhone2 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Secondary Phone</Typography>
                <Typography variant="body1">{office.companyPhone2}</Typography>
              </Box>
            )}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Address</Typography>
              <Typography variant="body1" sx={{ 
                whiteSpace: 'pre-line',
                backgroundColor: '#f9f9f9',
                p: 2,
                borderRadius: 1,
                border: '1px solid #eee',
                minHeight: '80px'
              }}>
                {office.companyAddress || '-'}
              </Typography>
            </Box>
            {office.companyLanguages?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Languages</Typography>
                <Typography variant="body1">{office.companyLanguages.join(', ')}</Typography>
              </Box>
            )}
            {office.companyAwards && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Awards & Achievements</Typography>
                <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>{office.companyAwards}</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Additional Information</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Founding Date</Typography>
              <Typography variant="body1">
                {office.companyFoundingDate || '-'}
              </Typography>
            </Box>
            {office.companyEmployeeRange && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Employee Range</Typography>
                <Typography variant="body1">{office.companyEmployeeRange}</Typography>
              </Box>
            )}
            {office.whatsappNumber && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">WhatsApp Number</Typography>
                <Typography variant="body1">{office.whatsappNumber}</Typography>
              </Box>
            )}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>Social Media</Typography>
              <Divider sx={{ mb: 2 }} />
              {(office.facebook || office.instagram || office.youtube || office.linkedin || office.twitter) ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  {office.facebook && (
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      href={office.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      startIcon={<span>f</span>}
                      sx={{ textTransform: 'none' }}
                    >
                      Facebook
                    </Button>
                  )}
                  {office.instagram && (
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      href={office.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      startIcon={<span>📷</span>}
                      sx={{ textTransform: 'none' }}
                    >
                      Instagram
                    </Button>
                  )}
                  {office.youtube && (
                    <Button 
                      variant="outlined" 
                      color="error" 
                      href={office.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      startIcon={<span>▶️</span>}
                      sx={{ textTransform: 'none' }}
                    >
                      YouTube
                    </Button>
                  )}
                  {office.linkedin && (
                    <Button 
                      variant="outlined" 
                      color="info" 
                      href={office.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      startIcon={<span>in</span>}
                      sx={{ textTransform: 'none' }}
                    >
                      LinkedIn
                    </Button>
                  )}
                  {office.twitter && (
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      href={office.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      startIcon={<span>𝕏</span>}
                      sx={{ textTransform: 'none' }}
                    >
                      Twitter
                    </Button>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No social media links added</Typography>
              )}
              
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>Integration Details</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">n8n API Key</Typography>
                <Typography variant="body2" sx={{ 
                  fontFamily: 'monospace', 
                  wordBreak: 'break-all',
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#f5f5f5',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid #eee',
                  minHeight: '60px'
                }}>
                  {office.n8nApiKey || '-'}
                </Typography>
              </Box>
              {office.n8nAuthHeader && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">n8n Auth Header</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{office.n8nAuthHeader}</Typography>
                </Box>
              )}
              {office.n8nAuthScheme && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">n8n Auth Scheme</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{office.n8nAuthScheme}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const OfficeInfoForm = React.memo(({ 
  open, 
  onClose, 
  form, 
  setForm, 
  onSubmit, 
  submitting, 
  editId, 
  viewOnly, 
  error 
}: {
  open: boolean;
  onClose: () => void;
  form: OfficeInformation;
  setForm: (form: OfficeInformation) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editId: string | null;
  viewOnly: boolean;
  error?: string | null;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: string; value: string };
    setForm({ ...form, [name]: value });
  };

  const handleLanguageChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value as string;
    const languages = value.split(',').map(lang => lang.trim());
    setForm({ ...form, companyLanguages: languages });
  };

  const languagesString = form.companyLanguages?.join(', ') || '';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 24, background: 'linear-gradient(90deg,#396afc,#2948ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {editId ? "Edit Office Information" : "Add Office Information"}
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pt: 3 }}>
          <TextField label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} required fullWidth disabled={submitting || viewOnly} />
          <TextField label="Email" name="companyEmail" type="email" value={form.companyEmail} onChange={handleChange} required fullWidth disabled={submitting || viewOnly} />
          <TextField label="Phone 1" name="companyPhone1" value={form.companyPhone1} onChange={handleChange} required fullWidth disabled={submitting || viewOnly} />
          <TextField label="Phone 2" name="companyPhone2" value={form.companyPhone2} onChange={handleChange} fullWidth disabled={submitting || viewOnly} />
          <TextField 
            label="Address" 
            name="companyAddress" 
            value={form.companyAddress} 
            onChange={handleChange} 
            required 
            fullWidth 
            multiline 
            rows={4} 
            disabled={submitting || viewOnly} 
            sx={{ gridColumn: '1 / -1' }}
          />
          <TextField 
            label="Languages (comma separated)" 
            name="companyLanguages" 
            value={languagesString}
            onChange={handleLanguageChange}
            required 
            fullWidth 
            disabled={submitting || viewOnly} 
            helperText="Enter languages separated by commas"
          />
          <TextField 
            label="Founding Date" 
            name="companyFoundingDate" 
            value={form.companyFoundingDate} 
            onChange={handleChange} 
            required 
            fullWidth 
            disabled={submitting || viewOnly} 
            placeholder="e.g., January 1, 2000"
          />
          <TextField label="Employee Range" name="companyEmployeeRange" value={form.companyEmployeeRange} onChange={handleChange} required fullWidth disabled={submitting || viewOnly} />
          <TextField label="Awards" name="companyAwards" value={form.companyAwards} onChange={handleChange} fullWidth multiline rows={2} disabled={submitting || viewOnly} />
          <TextField label="WhatsApp Number" name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} required fullWidth disabled={submitting || viewOnly} />
          <TextField 
            label="N8N API Key" 
            name="n8nApiKey" 
            value={form.n8nApiKey} 
            onChange={handleChange} 
            required 
            fullWidth 
            multiline
            rows={2}
            disabled={submitting || viewOnly} 
            sx={{ gridColumn: '1 / -1' }}
          />
          <TextField label="N8N Auth Header" name="n8nAuthHeader" value={form.n8nAuthHeader} onChange={handleChange} required fullWidth disabled={submitting || viewOnly} />
          <FormControl fullWidth disabled={submitting || viewOnly}>
            <InputLabel>N8N Auth Scheme</InputLabel>
            <Select
              name="n8nAuthScheme"
              value={form.n8nAuthScheme}
              onChange={(e) => {
                const value = e.target.value as string;
                setForm({ ...form, n8nAuthScheme: value as 'Bearer' | 'Basic' });
              }}
              label="N8N Auth Scheme"
              required
            >
              <MenuItem value="Bearer">Bearer</MenuItem>
              <MenuItem value="Basic">Basic</MenuItem>
            </Select>
          </FormControl>
          <TextField 
            label="Facebook URL" 
            name="facebook" 
            value={form.facebook || ''} 
            onChange={handleChange} 
            fullWidth 
            disabled={submitting || viewOnly}
            placeholder="https://facebook.com/yourpage"
          />
          <TextField 
            label="Instagram URL" 
            name="instagram" 
            value={form.instagram || ''} 
            onChange={handleChange} 
            fullWidth 
            disabled={submitting || viewOnly}
            placeholder="https://instagram.com/yourpage"
          />
          <TextField 
            label="YouTube URL" 
            name="youtube" 
            value={form.youtube || ''} 
            onChange={handleChange} 
            fullWidth 
            disabled={submitting || viewOnly}
            placeholder="https://youtube.com/yourchannel"
          />
          <TextField 
            label="LinkedIn URL" 
            name="linkedin" 
            value={form.linkedin || ''} 
            onChange={handleChange} 
            fullWidth 
            disabled={submitting || viewOnly}
            placeholder="https://linkedin.com/company/yourcompany"
          />
          <TextField 
            label="Twitter URL" 
            name="twitter" 
            value={form.twitter || ''} 
            onChange={handleChange} 
            fullWidth 
            disabled={submitting || viewOnly}
            placeholder="https://twitter.com/yourhandle"
            sx={{ gridColumn: '1 / -1' }}
          />
          
          {error && (
            <Typography sx={{ color: 'error.main', mt: 1, gridColumn: '1 / -1' }}>{error}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{ fontWeight: 700, borderRadius: 3, fontSize: 16 }} disabled={submitting || viewOnly}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ fontWeight: 700, borderRadius: 3, fontSize: 16 }} disabled={submitting || viewOnly}>
            {submitting ? <CircularProgress size={24} /> : editId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
});

OfficeInfoForm.displayName = 'OfficeInfoForm';

function getOfficeInfoPagePermission() {
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

export default function OfficeInfoPage() {
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [officeInfo, setOfficeInfo] = useState<OfficeInformation[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<OfficeInformation>({
    companyName: '',
    companyPhone1: '',
    companyPhone2: '',
    companyEmail: '',
    companyAddress: '',
    companyLanguages: [],
    companyFoundingDate: '',
    companyEmployeeRange: '',
    companyAwards: '',
    whatsappNumber: '',
    n8nApiKey: '',
    n8nAuthHeader: '',
    n8nAuthScheme: 'Bearer'
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 10;
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<OfficeInformation | null>(null);

  const fetchOfficeInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/officeinformation');
      const data = await response.json();
      if (data.success) {
        setOfficeInfo(Array.isArray(data.data) ? data.data : []);
        setTotalPages(Math.ceil(data.data.length / rowsPerPage));
      } else {
        throw new Error(data.message || 'Failed to fetch office information');
      }
    } catch (error) {
      console.error('Error fetching office information:', error);
      setError('Failed to load office information');
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage]);

  useEffect(() => {
    const access = getOfficeInfoPagePermission();
    setPageAccess(access);
    if (access !== 'no access') {
      fetchOfficeInfo();
    }
  }, [fetchOfficeInfo]);

  const handleOpen = () => {
    setForm({
      companyName: '',
      companyPhone1: '',
      companyPhone2: '',
      companyEmail: '',
      companyAddress: '',
      companyLanguages: [],
      companyFoundingDate: '',
      companyEmployeeRange: '',
      companyAwards: '',
      whatsappNumber: '',
      n8nApiKey: '',
      n8nAuthHeader: '',
      n8nAuthScheme: 'Bearer'
    });
    setEditId(null);
    setError(null);
    setOpen(true);
  };

  const handleEdit = (office: OfficeInformation) => {
    setForm({
      ...office,
      companyFoundingDate: office.companyFoundingDate?.split('T')[0] || ''
    });
    setEditId(office._id || null);
    setError(null);
    setOpen(true);
  };

  const handleViewClick = (office: OfficeInformation) => {
    setSelectedOffice(office);
    setViewOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setViewOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = editId 
        ? await apiFetch(`/officeinformation/${editId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(form)
          })
        : await apiFetch('/officeinformation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(form)
          });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save office information');
      }
      
      await fetchOfficeInfo();
      setOpen(false);
    } catch (error) {
      console.error('Error saving office information:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save office information';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    
    try {
      const response = await apiFetch(`/officeinformation/${deleteId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete office information');
      }
      
      await fetchOfficeInfo();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting office information:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete office information';
      setError(errorMessage);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const filteredOfficeInfo = officeInfo.filter(office => 
    office.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    office.companyEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    office.companyPhone1.includes(searchTerm) ||
    office.companyPhone2.includes(searchTerm)
  );

  const paginatedOfficeInfo = filteredOfficeInfo.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  if (pageAccess === 'no access') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          You don&apos;t have permission to view this page.
        </Typography>
      </Box>
    );
  }

  const viewOnly = pageAccess === 'only view';

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href="/dashboard" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Typography color="text.primary">Office Information</Typography>
      </Breadcrumbs>

      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, background: 'linear-gradient(90deg,#396afc,#2948ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Office Information
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              onClick={handleOpen} 
              disabled={viewOnly}
              sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', fontSize: 16 }}
            >
              Add New
            </Button>
          </Box>

          <TextField
            fullWidth
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={handleSearch}
            sx={{ mb: 3, maxWidth: 400 }}
            InputProps={{
              sx: { borderRadius: 3, padding: '8px 16px' },
              startAdornment: (
                <Box component="span" sx={{ color: 'text.secondary', mr: 1 }}>🔍</Box>
              ),
            }}
          />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2, backgroundColor: 'error.light', borderRadius: 1, mb: 2 }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #eee' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f7ff' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Company Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: '120px' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedOfficeInfo.length > 0 ? (
                      paginatedOfficeInfo.map((office) => (
                        <OfficeInfoRow 
                          key={office._id} 
                          office={office} 
                          onEdit={handleEdit} 
                          onDelete={handleDeleteClick}
                          onView={handleViewClick}
                          viewOnly={viewOnly}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No office information found. {!viewOnly && 'Click "Add New" to get started.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={(_, value) => setPage(value)} 
                    color="primary" 
                    shape="rounded"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <OfficeInfoForm 
        open={open} 
        onClose={handleClose} 
        form={form} 
        setForm={setForm} 
        onSubmit={handleSubmit} 
        submitting={submitting} 
        editId={editId} 
        viewOnly={viewOnly}
        error={error}
      />

      <ViewOfficeDetails 
        open={viewOpen} 
        onClose={handleClose} 
        office={selectedOffice}
      />

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this office information? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={submitting} sx={{ borderRadius: 3, fontWeight: 700 }}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained" 
            disabled={submitting}
            sx={{ borderRadius: 3, fontWeight: 700 }}
          >
            {submitting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
