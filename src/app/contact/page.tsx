"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Pagination, Breadcrumbs, Link, Checkbox, Tooltip
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HomeIcon from '@mui/icons-material/Home';
import { apiFetch } from '../../utils/apiFetch';

interface Contact {
  _id?: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  businessType: string;
  annualFabricVolume: string;
  primaryMarkets: string;
  fabricTypesOfInterest: string[];
  specificationsRequirements: string;
  timeline: string;
  additionalMessage: string;
  createdAt?: string;
}

const ContactRow = React.memo(({ contact, onView, onEdit, onDelete, viewOnly }: {
  contact: Contact;
  onView: (contact: Contact) => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  viewOnly: boolean;
}) => (
  <TableRow hover>
    <TableCell>{contact.companyName}</TableCell>
    <TableCell>{contact.contactPerson}</TableCell>
    <TableCell>{contact.email}</TableCell>
    <TableCell>{contact.phoneNumber}</TableCell>
    <TableCell>{new Date(contact.createdAt || '').toLocaleDateString()}</TableCell>
    <TableCell sx={{ whiteSpace: 'nowrap' }}>
      <IconButton onClick={() => onView(contact)} title="View">
        <VisibilityIcon color="info" />
      </IconButton>
      <IconButton 
        onClick={() => onEdit(contact)} 
        disabled={viewOnly}
        title={viewOnly ? "No edit permission" : "Edit"}
      >
        <EditIcon color={viewOnly ? "disabled" : "primary"} />
      </IconButton>
      <IconButton 
        onClick={() => onDelete(contact._id || "")} 
        disabled={viewOnly}
        title={viewOnly ? "No delete permission" : "Delete"}
      >
        <DeleteIcon color={viewOnly ? "disabled" : "error"} />
      </IconButton>
    </TableCell>
  </TableRow>
));

ContactRow.displayName = 'ContactRow';

function getContactPagePermission() {
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

export default function ContactPage() {
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  const fabricTypes = [
    'Cotton', 'Linen', 'Silk', 'Wool', 'Polyester', 'Nylon',
    'Acrylic', 'Rayon', 'Viscose', 'Spandex', 'Denim', 'Velvet',
    'Satin', 'Chiffon', 'Jersey', 'Tweed', 'Corduroy', 'Fleece',
    'Chambray', 'Twill', 'Flannel', 'Seersucker', 'Taffeta', 'Organza'
  ];

  const fetchContacts = useCallback(async () => {
    try {
      const data = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts`).then(res => res.json());
      setContacts(data.data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
    setPageAccess(getContactPagePermission());
  }, [fetchContacts]);

  const handleView = (contact: Contact) => {
    setSelectedContact(contact);
    setEditContact(null);
    setIsEditMode(false);
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setEditContact({ ...contact });
    setIsEditMode(true);
  };

  const handleEditChange = (field: keyof Contact, value: string | string[]) => {
    if (!editContact) return;
    setEditContact({
      ...editContact,
      [field]: value
    });
  };

  const handleSave = async () => {
    if (!editContact || !editContact._id) return;
    
    try {
      await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts/${editContact._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editContact)
      });
      
      setContacts(contacts.map(contact => 
        contact._id === editContact._id ? editContact : contact
      ));
      
      setIsEditMode(false);
      setSelectedContact(editContact);
      setEditContact(null);
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleClose = () => {
    setSelectedContact(null);
    setEditContact(null);
    setIsEditMode(false);
  };

  const exportToExcel = () => {
    // Prepare CSV header
    const headers = [
      'Company Name', 'Contact Person', 'Email', 'Phone', 'Business Type',
      'Annual Volume', 'Primary Markets', 'Fabric Types', 'Requirements',
      'Timeline', 'Message', 'Date'
    ];

    // Convert data to CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...contacts.map(contact => {
        const row = [
          `"${contact.companyName?.replace(/"/g, '""') || ''}"`,
          `"${contact.contactPerson?.replace(/"/g, '""') || ''}"`,
          `"${contact.email || ''}"`,
          `"${contact.phoneNumber || ''}"`,
          `"${contact.businessType?.replace(/"/g, '""') || ''}"`,
          `"${contact.annualFabricVolume || ''}"`,
          `"${contact.primaryMarkets?.replace(/"/g, '""') || ''}"`,
          `"${contact.fabricTypesOfInterest?.join(', ') || ''}"`,
          `"${contact.specificationsRequirements?.replace(/"/g, '""') || ''}"`,
          `"${contact.timeline?.replace(/"/g, '""') || ''}"`,
          `"${contact.additionalMessage?.replace(/"/g, '""') || ''}"`,
          `"${new Date(contact.createdAt || '').toLocaleString()}"`
        ];
        return row.join(',');
      })
    ].join('\n');

    // Create download link
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    try {
      await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts/${deleteId}`, { 
        method: "DELETE" 
      });
      setDeleteId(null);
      fetchContacts();
    } catch (error) {
      setDeleteError("Failed to delete contact.");
      console.error('Delete error:', error);
    }
  }, [deleteId, fetchContacts]);

  if (pageAccess === 'no access') {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="error">Access Denied</Typography>
      </Box>
    );
  }

  const filteredContacts = contacts.filter(contact => 
    `${contact.companyName || ''} ${contact.contactPerson || ''} ${contact.email || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} /> Home
        </Link>
        <Typography>Contact Inquiries</Typography>
      </Breadcrumbs>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">Contact Inquiries</Typography>
              <Tooltip title="Export to Excel">
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={exportToExcel}
                  sx={{ ml: 2 }}
                >
                  Export
                </Button>
              </Tooltip>
            </Box>
            <TextField
              label="Search"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 300 }}
            />
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Company</TableCell>
                  <TableCell>Contact Person</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContacts
                  .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                  .map((contact) => (
                    <ContactRow 
                      key={contact._id}
                      contact={contact}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={setDeleteId}
                      viewOnly={pageAccess === 'only view'}
                    />
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={Math.ceil(filteredContacts.length / rowsPerPage)}
              page={page}
              onChange={(e, p) => setPage(p)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* View/Edit Dialog */}
      <Dialog open={!!selectedContact} onClose={handleClose} maxWidth="md" fullWidth>
        {selectedContact && (
          <>
            <DialogTitle>{isEditMode ? 'Edit Contact' : 'Contact Details'}</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField 
                  label="Company Name" 
                  value={isEditMode ? (editContact?.companyName || '') : selectedContact.companyName} 
                  onChange={(e) => isEditMode && handleEditChange('companyName', e.target.value)}
                  fullWidth 
                  margin="normal" 
                  InputProps={{ readOnly: !isEditMode }} 
                />
                <TextField 
                  label="Contact Person" 
                  value={isEditMode ? (editContact?.contactPerson || '') : selectedContact.contactPerson} 
                  onChange={(e) => isEditMode && handleEditChange('contactPerson', e.target.value)}
                  fullWidth 
                  margin="normal" 
                  InputProps={{ readOnly: !isEditMode }} 
                />
                <TextField 
                  label="Email" 
                  value={isEditMode ? (editContact?.email || '') : selectedContact.email} 
                  onChange={(e) => isEditMode && handleEditChange('email', e.target.value)}
                  fullWidth 
                  margin="normal" 
                  InputProps={{ readOnly: !isEditMode }} 
                />
                <TextField 
                  label="Phone" 
                  value={isEditMode ? (editContact?.phoneNumber || '') : selectedContact.phoneNumber} 
                  onChange={(e) => isEditMode && handleEditChange('phoneNumber', e.target.value)}
                  fullWidth 
                  margin="normal" 
                  InputProps={{ readOnly: !isEditMode }} 
                />
                <TextField 
                  label="Business Type" 
                  value={isEditMode ? (editContact?.businessType || '') : selectedContact.businessType} 
                  onChange={(e) => isEditMode && handleEditChange('businessType', e.target.value)}
                  fullWidth 
                  margin="normal" 
                  InputProps={{ readOnly: !isEditMode }} 
                />
                <TextField 
                  label="Annual Volume" 
                  value={isEditMode ? (editContact?.annualFabricVolume || '') : selectedContact.annualFabricVolume} 
                  onChange={(e) => isEditMode && handleEditChange('annualFabricVolume', e.target.value)}
                  fullWidth 
                  margin="normal" 
                  InputProps={{ readOnly: !isEditMode }} 
                />
                <TextField 
                  label="Primary Markets" 
                  value={isEditMode ? (editContact?.primaryMarkets || '') : selectedContact.primaryMarkets} 
                  onChange={(e) => isEditMode && handleEditChange('primaryMarkets', e.target.value)}
                  fullWidth 
                  margin="normal" 
                  InputProps={{ readOnly: !isEditMode }} 
                  sx={{ gridColumn: '1 / -1' }} 
                />
                <Box sx={{ gridColumn: '1 / -1', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Fabric Types of Interest</Typography>
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 1,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1
                  }}>
                    {fabricTypes.map((type) => (
                      <Box key={type} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox 
                          checked={isEditMode 
                            ? (editContact?.fabricTypesOfInterest?.includes(type) || false)
                            : (selectedContact.fabricTypesOfInterest?.includes(type) || false)}
                          onChange={(e) => {
                            if (!isEditMode || !editContact) return;
                            const updatedTypes = e.target.checked
                              ? [...(editContact.fabricTypesOfInterest || []), type]
                              : (editContact.fabricTypesOfInterest || []).filter(t => t !== type);
                            handleEditChange('fabricTypesOfInterest', updatedTypes);
                          }}
                          disabled={!isEditMode}
                          size="small"
                          sx={{ p: 0.5, color: 'primary.main' }}
                        />
                        <Typography variant="body2">{type}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <TextField 
                  label="Requirements" 
                  value={isEditMode ? (editContact?.specificationsRequirements || '') : selectedContact.specificationsRequirements} 
                  onChange={(e) => isEditMode && handleEditChange('specificationsRequirements', e.target.value)}
                  fullWidth 
                  multiline 
                  rows={3} 
                  margin="normal" 
                  InputProps={{ readOnly: !isEditMode }} 
                  sx={{ gridColumn: '1 / -1' }} 
                />
                <TextField 
                  label="Timeline" 
                  value={isEditMode ? (editContact?.timeline || '') : selectedContact.timeline} 
                  onChange={(e) => isEditMode && handleEditChange('timeline', e.target.value)}
                  fullWidth 
                  margin="normal" 
                  InputProps={{ readOnly: !isEditMode }} 
                />
                <TextField 
                  label="Message" 
                  value={isEditMode ? (editContact?.additionalMessage || '') : selectedContact.additionalMessage} 
                  onChange={(e) => isEditMode && handleEditChange('additionalMessage', e.target.value)}
                  fullWidth 
                  multiline 
                  rows={3} 
                  margin="normal" 
                  InputProps={{ readOnly: !isEditMode }} 
                  sx={{ gridColumn: '1 / -1' }} 
                />
              </Box>
            </DialogContent>
            <DialogActions>
              {isEditMode ? (
                <>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button onClick={handleSave} variant="contained" color="primary">Save Changes</Button>
                </>
              ) : (
                <Button onClick={handleClose}>Close</Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this contact?</Typography>
          {deleteError && <Typography color="error">{deleteError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
