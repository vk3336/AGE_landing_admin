"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';

import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import PaletteIcon from '@mui/icons-material/Palette';
import ArticleIcon from '@mui/icons-material/Article';
import BrushIcon from '@mui/icons-material/Brush';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BusinessIcon from '@mui/icons-material/Business';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonIcon from '@mui/icons-material/Person';
import { keyframes } from '@mui/system';
import { apiFetch } from '../../utils/apiFetch';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: none; }
`;

// DattaAble styled components
const StatCard = React.memo(({ value, subtitle, icon, color }: {
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) => {
  return (
    <Card sx={{
      background: `linear-gradient(135deg, #fff 60%, ${color}10 100%)`,
      borderRadius: '12px',
      boxShadow: '0 4px 20px 0 rgba(34, 41, 47, 0.10)',
      border: 'none',
      transition: 'all 0.3s cubic-bezier(.4,2,.3,1)',
      animation: `${fadeIn} 0.7s cubic-bezier(.4,2,.3,1)`,
      '&:hover': {
        boxShadow: '0 8px 28px 0 rgba(34, 41, 47, 0.16)',
        transform: 'translateY(-2px)',
        background: `linear-gradient(135deg, #fff 50%, ${color}18 100%)`,
      },
      m: 0.75,
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: `radial-gradient(circle at 60% 40%, ${color} 60%, #fff 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 8px 0 ${color}33`,
            position: 'relative',
          }}>
            <Box sx={{
              position: 'absolute',
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: `conic-gradient(${color}33 0% 40%, transparent 40% 100%)`,
              zIndex: 0,
              top: '-6px',
              left: '-6px',
              filter: 'blur(2px)',
            }} />
            <Box sx={{ position: 'relative', zIndex: 1, color: '#fff', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {icon}
            </Box>
          </Box>
        </Box>
        <Typography variant="h4" sx={{
          fontWeight: 800,
          color: color,
          mb: 0.25,
          textAlign: 'center',
          letterSpacing: 1,
        }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        <Typography variant="body2" sx={{
          color: 'text.secondary',
          fontWeight: 500,
          fontSize: '13px',
          textAlign: 'center',
          letterSpacing: 0.5,
        }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

const ProgressCard = React.memo(({ title, value, progress, color }: {
  title: string;
  value: string;
  progress: number;
  color: string;
}) => {
  return (
    <Card sx={{
      background: 'background.paper',
      borderRadius: '6px',
      boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.24)',
      border: '1px solid',
      borderColor: 'divider',
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {title}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: color }}>
            {value}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(115, 103, 240, 0.12)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
              borderRadius: 3,
            }
          }}
        />
        <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary' }}>
          {progress}% Complete
        </Typography>
      </CardContent>
    </Card>
  );
});

ProgressCard.displayName = 'ProgressCard';

const RecentActivityCard = React.memo(() => {
  return (
    <Card sx={{
      background: 'background.paper',
      borderRadius: '6px',
      boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.24)',
      border: '1px solid',
      borderColor: 'divider',
    }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Recent Activity
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          {[
            { user: 'John Doe', action: 'added a new product', time: '2 minutes ago', color: '#7367f0' },
            { user: 'Jane Smith', action: 'updated category', time: '1 hour ago', color: '#28c76f' },
            { user: 'Mike Johnson', action: 'deleted vendor', time: '3 hours ago', color: '#ea5455' },
            { user: 'Sarah Wilson', action: 'created new design', time: '5 hours ago', color: '#ff9f43' },
          ].map((activity, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: activity.color, fontSize: '11px' }}>
                {activity.user.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary', lineHeight: 1.3 }}>
                  <strong>{activity.user}</strong> {activity.action}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {activity.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
});

RecentActivityCard.displayName = 'RecentActivityCard';

const ProductsTable = React.memo(() => {
  return (
    <Card sx={{
      background: 'background.paper',
      borderRadius: '6px',
      boxShadow: '0 4px 24px 0 rgba(34, 41, 47, 0.24)',
      border: '1px solid',
      borderColor: 'divider',
    }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Recent Products
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 1 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 1 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 1 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', py: 1 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { name: 'Product A', category: 'Electronics', status: 'Active' },
                { name: 'Product B', category: 'Clothing', status: 'Inactive' },
                { name: 'Product C', category: 'Home', status: 'Active' },
                { name: 'Product D', category: 'Sports', status: 'Active' },
              ].map((product, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: 'text.primary', py: 0.75 }}>{product.name}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', py: 0.75 }}>{product.category}</TableCell>
                  <TableCell sx={{ py: 0.75 }}>
                    <Chip
                      label={product.status}
                      size="small"
                      sx={{
                        bgcolor: product.status === 'Active' ? 'success.main' : 'error.main',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" sx={{ color: 'primary.main' }}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'warning.main' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'error.main' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
});

ProductsTable.displayName = 'ProductsTable';


export default function DashboardPage() {
  const router = useRouter();
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [productCount, setProductCount] = useState<number>(0);
  const [seoCount, setSeoCount] = useState<number>(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    const checkAuth = () => {
      const hasAuthCookie = document.cookie.includes('admin-auth=true');
      const hasLocalStorage = localStorage.getItem('admin-auth') === 'true';

      if (!hasAuthCookie && !hasLocalStorage) {
        router.push('/login');
        return;
      }

      setIsAuthenticated(true);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL;
        const [
          productsRes,
          categoriesRes,
          colorsRes,
          contentsRes,
          designsRes,
          finishesRes,
          groupcodesRes,
          structuresRes,
          subfinishesRes,
          substructuresRes,
          subsuitablesRes,
          suitableforsRes,
          vendorsRes,
          seoRes,
          Countryres,
          stateres,
          cityres,
          locationres,
          contactRes,
          aboutUsRes,
          officeInfoRes,
          usersRes

        ] = await Promise.all([
          apiFetch(`${base}/product`),
          apiFetch(`${base}/category`),
          apiFetch(`${base}/color`),
          apiFetch(`${base}/content`),
          apiFetch(`${base}/design`),
          apiFetch(`${base}/finish`),
          apiFetch(`${base}/groupcode`),
          apiFetch(`${base}/structure`),
          apiFetch(`${base}/subfinish`),
          apiFetch(`${base}/substructure`),
          apiFetch(`${base}/subsuitable`),
          apiFetch(`${base}/suitablefor`),
          apiFetch(`${base}/vendor`),
          apiFetch(`${base}/seo`),
          apiFetch(`${base}/countries`),
          apiFetch(`${base}/states`),
          apiFetch(`${base}/cities`),
          apiFetch(`${base}/locations`),
          apiFetch(`${base}/contacts`),
          apiFetch(`${base}/aboutus`),
          apiFetch(`${base}/officeinformation`),
          apiFetch(`${base}/users`)
        ]);
        const results = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          colorsRes.json(),
          contentsRes.json(),
          designsRes.json(),
          finishesRes.json(),
          groupcodesRes.json(),
          structuresRes.json(),
          subfinishesRes.json(),
          substructuresRes.json(),
          subsuitablesRes.json(),
          suitableforsRes.json(),
          vendorsRes.json(),
          seoRes.json(),
          Countryres.json(),
          stateres.json(),
          cityres.json(),
          locationres.json(),
          contactRes.json(),
          aboutUsRes.json(),
          officeInfoRes.json(),
          usersRes.json()
        ]);

        // Debug log for about us response
        console.log('Full About Us Response:', JSON.stringify(results[19], null, 2));
        console.log('About Us Data Type:', typeof results[19]?.data);
        console.log('About Us Data Keys:', results[19]?.data ? Object.keys(results[19].data) : 'No data');

        const newCounts: { [key: string]: number } = {};
        newCounts['product'] = Array.isArray(results[0].data) ? results[0].data.length : 0;
        newCounts['category'] = Array.isArray(results[1].data) ? results[1].data.length : 0;
        newCounts['color'] = Array.isArray(results[2].data) ? results[2].data.length : 0;
        newCounts['content'] = Array.isArray(results[3].data) ? results[3].data.length : 0;
        newCounts['design'] = Array.isArray(results[4].data) ? results[4].data.length : 0;
        newCounts['finish'] = Array.isArray(results[5].data) ? results[5].data.length : 0;
        newCounts['groupcode'] = Array.isArray(results[6].data) ? results[6].data.length : 0;
        newCounts['structure'] = Array.isArray(results[7].data) ? results[7].data.length : 0;
        newCounts['subfinish'] = Array.isArray(results[8].data) ? results[8].data.length : 0;
        newCounts['substructure'] = Array.isArray(results[9].data) ? results[9].data.length : 0;
        newCounts['subsuitable'] = Array.isArray(results[10].data) ? results[10].data.length : 0;
        newCounts['suitablefor'] = Array.isArray(results[11].data) ? results[11].data.length : 0;
        newCounts['vendor'] = Array.isArray(results[12].data) ? results[12].data.length : 0;
        newCounts['countries'] = Array.isArray(results[14].data.countries) ? results[14].data.countries.length : 0;
        newCounts['states'] = Array.isArray(results[15].data.states) ? results[15].data.states.length : 0;
        newCounts['cities'] = Array.isArray(results[16].data.cities) ? results[16].data.cities.length : 0;
        newCounts['locations'] = Array.isArray(results[17].data.locations) ? results[17].data.locations.length : 0;
        // Contact data is in results[18].data as an array
        const contactResponse = results[18] || {};
        const contactData = contactResponse.data || [];
        newCounts['contacts'] = Array.isArray(contactData) ? contactData.length : 0;
        // Handle different possible response structures for about us
        const aboutUsResponse = results[19] || {};
        let aboutUsCount = 0;

        if (Array.isArray(aboutUsResponse)) {
          aboutUsCount = aboutUsResponse.length;
        } else if (aboutUsResponse && typeof aboutUsResponse === 'object') {
          if (Array.isArray(aboutUsResponse.data)) {
            aboutUsCount = aboutUsResponse.data.length;
          } else if (aboutUsResponse.data && typeof aboutUsResponse.data === 'object') {
            aboutUsCount = Object.keys(aboutUsResponse.data).length;
          } else if (aboutUsResponse.count !== undefined) {
            aboutUsCount = aboutUsResponse.count;
          } else if (aboutUsResponse.length !== undefined) {
            aboutUsCount = aboutUsResponse.length;
          }
        }
        newCounts['aboutus'] = aboutUsCount;
        newCounts['officeInfo'] = Array.isArray(results[20]?.data) ? results[20].data.length : 0;
        // Users may return { data: array, total }
        const usersPayload = results[21] || {};
        const usersTotal = typeof usersPayload.total === 'number' ? usersPayload.total : (Array.isArray(usersPayload.data) ? usersPayload.data.length : 0);
        newCounts['users'] = usersTotal;

        setCounts(newCounts);
        setProductCount(Array.isArray(results[0].data) ? results[0].data.length : 0);
        setSeoCount(Array.isArray(results[13].data) ? results[13].data.length : 0);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #7367f0 0%, #9c8cfc 100%)'
      }}>
        <Box sx={{
          textAlign: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: '500'
        }}>
          Loading...
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Card data for dashboard
  const cardData = [
    {
      title: 'Users',
      value: counts['users'] || 0,
      subtitle: 'Total Users',
      icon: <PersonIcon />,
      color: '#1976d2',
      href: '/shofy-users',
    },
    {
      title: 'Products',
      value: productCount,
      subtitle: 'Total Products',
      icon: <InventoryIcon />,
      color: '#7367f0',
      href: '/products',
    },
    {
      title: 'Categories',
      value: counts['category'] || 0,
      subtitle: 'Categories',
      icon: <CategoryIcon />,
      color: '#00cfe8',
      href: '/category',
    },
    {
      title: 'Colors',
      value: counts['color'] || 0,
      subtitle: 'Colors',
      icon: <PaletteIcon />,
      color: '#ff6b6b',
      href: '/color',
    },
    {
      title: 'Contents',
      value: counts['content'] || 0,
      subtitle: 'Contents',
      icon: <ArticleIcon />,
      color: '#4ecdc4',
      href: '/content',
    },
    {
      title: 'Designs',
      value: counts['design'] || 0,
      subtitle: 'Designs',
      icon: <BrushIcon />,
      color: '#45b7d1',
      href: '/design',
    },
    {
      title: 'Finishes',
      value: counts['finish'] || 0,
      subtitle: 'Finishes',
      icon: <BrushIcon />,
      color: '#96ceb4',
      href: '/finish',
    },
    {
      title: 'Group Codes',
      value: counts['groupcode'] || 0,
      subtitle: 'Group Codes',
      icon: <ArticleIcon />,
      color: '#feca57',
      href: '/groupcode',
    },
    {
      title: 'Structures',
      value: counts['structure'] || 0,
      subtitle: 'Structures',
      icon: <CategoryIcon />,
      color: '#ff9ff3',
      href: '/structure',
    },
    {
      title: 'Sub Finishes',
      value: counts['subfinish'] || 0,
      subtitle: 'Sub Finishes',
      icon: <BrushIcon />,
      color: '#5f27cd',
      href: '/subfinish',
    },
    {
      title: 'Sub Structures',
      value: counts['substructure'] || 0,
      subtitle: 'Sub Structures',
      icon: <CategoryIcon />,
      color: '#1dd1a1',
      href: '/substructure',
    },
    {
      title: 'Sub Suitables',
      value: counts['subsuitable'] || 0,
      subtitle: 'Sub Suitables',
      icon: <CategoryIcon />,
      color: '#ff9f43',
      href: '/subsuitable',
    },
    {
      title: 'Suitable For',
      value: counts['suitablefor'] || 0,
      subtitle: 'Suitable For',
      icon: <CategoryIcon />,
      color: '#2e86de',
      href: '/suitablefor',
    },
    {
      title: 'Vendors',
      value: counts['vendor'] || 0,
      subtitle: 'Vendors',
      icon: <BusinessIcon />,
      color: '#ea5455',
      href: '/vendor',
    },
    {
      title: 'Countries',
      value: counts['countries'] || 0,
      subtitle: 'Countries',
      icon: <CategoryIcon />,
      color: '#28c76f',
      href: '/countries',
    },
    {
      title: 'States',
      value: counts['states'] || 0,
      subtitle: 'States',
      icon: <CategoryIcon />,
      color: '#ff9f43',
      href: '/states',
    },
    {
      title: 'Cities',
      value: counts['cities'] || 0,
      subtitle: 'Cities',
      icon: <CategoryIcon />,
      color: '#9c8cfc',
      href: '/cities',
    },
    {
      title: 'Locations',
      value: counts['locations'] || 0,
      subtitle: 'Locations',
      icon: <BrushIcon />,
      color: '#00cfe8',
      href: '/location',
    },
    {
      title: 'Office Info',
      value: counts['officeInfo'] || 0,
      subtitle: 'Office Information',
      icon: <BusinessCenterIcon />,
      color: '#6c5ce7',
      href: '/office-information',
    },
    {
      title: 'SEO',
      value: seoCount,
      subtitle: 'SEO Entries',
      icon: <ArticleIcon />,
      color: '#ff6b6b',
      href: '/seo',
    },
    {
      title: 'Contacts',
      value: counts['contacts'] || 0,
      subtitle: 'Contact Entries',
      icon: <ArticleIcon />,
      color: '#9c27b0',
      href: '/contact',
    },
    {
      title: 'About Us',
      value: counts['aboutus'] || 0,
      subtitle: 'About Us Entries',
      icon: <ArticleIcon />,
      color: '#9c27b0',
      href: '/aboutus',
    },
  ];

  // Group cards into categories
  const cardCategories = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <DashboardIcon />,
      cards: cardData.filter(card => 
        ['Users', 'Products', 'Categories', 'Vendors', 'SEO', 'Contacts', 'About Us', 'Office Info'].includes(card.title)
      )
    },
    {
      id: 'products',
      label: 'Products',
      icon: <InventoryIcon />,
      cards: cardData.filter(card => 
        ['Products', 'Categories', 'Vendors', 'Designs', 'Colors', 'Finishes', 'Sub Finishes', 'Structures', 'Sub Structures', 'Suitable For', 'Sub Suitables', 'Group Codes'].includes(card.title)
      )
    },
    {
      id: 'locations',
      label: 'Locations',
      icon: <LocationOnIcon />,
      cards: cardData.filter(card => 
        ['Countries', 'States', 'Cities', 'Locations'].includes(card.title)
      )
    },
    {
      id: 'content',
      label: 'Content',
      icon: <DescriptionIcon />,
      cards: cardData.filter(card => 
        ['SEO', 'Contents', 'About Us', 'Office Info', 'Contacts'].includes(card.title)
      )
    },
    {
      id: 'users',
      label: 'Users',
      icon: <PeopleIcon />,
      cards: cardData.filter(card => 
        ['Users'].includes(card.title)
      )
    }
  ];


  return (
    <Box sx={{ p: 0 }}>
      {/* Header Section */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 0.5
        }}>
          AGE Dashboard
        </Typography>
        <Typography variant="body2" sx={{
          color: 'text.secondary',
          fontSize: '14px',
          mb: 2
        }}>
          Overview of your product, SEO, and filter data.
        </Typography>
        
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 3,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {cardCategories.map((category) => (
            <Tab 
              key={category.id}
              label={category.label}
              icon={category.icon}
              iconPosition="start"
              sx={{
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {cardCategories.map((category, index) => (
          <Box 
            key={category.id}
            role="tabpanel"
            hidden={activeTab !== index}
            id={`dashboard-tabpanel-${index}`}
            aria-labelledby={`dashboard-tab-${index}`}
          >
            {activeTab === index && (
              <Grid container spacing={2}>
                {category.cards.map((card, idx) => (
                  <div 
                    key={card.title + idx}
                    style={{
                      width: '100%',
                      padding: '8px',
                      boxSizing: 'border-box'
                    }}
                    className="grid-item"
                  >
                    <Card
                      sx={{
                        height: '100%',
                        background: 'background.paper',
                        borderRadius: '8px',
                        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.05)',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                          transform: 'translateY(-2px)',
                          borderColor: 'primary.main',
                        },
                      }}
                      onClick={() => router.push(card.href)}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '8px',
                            bgcolor: `${card.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1.5,
                            color: card.color
                          }}>
                            {React.cloneElement(card.icon, { fontSize: 'small' })}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h5" sx={{
                              fontWeight: 700,
                              color: 'text.primary',
                              lineHeight: 1.2,
                              fontSize: '1.5rem'
                            }}>
                              {card.value}
                            </Typography>
                            <Typography variant="body2" sx={{
                              color: 'text.secondary',
                              fontWeight: 500,
                              fontSize: '0.8125rem',
                              mt: 0.25
                            }}>
                              {card.subtitle}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{
                          mt: 1.5,
                          pt: 1.5,
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <Typography variant="caption" sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}>
                            View Details
                            <ArrowForwardIcon sx={{ fontSize: '1rem', ml: 0.5 }} />
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </Grid>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
} 