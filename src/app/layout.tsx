"use client";
import React, { useMemo, useCallback, useState, useEffect, createContext, useContext } from "react";
import NextLink from "next/link";
import { 
  Box, 
  Drawer, 
  List, 
  ListItemText, 
  Collapse, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  ListItemIcon, 
  ListItemButton, 
  Badge, 
  Menu, 
  MenuItem, 
  Divider,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { usePathname } from "next/navigation";
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';

// Sidebar context for managing collapse state
interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);
  
  const value = useMemo(() => ({
    isCollapsed,
    toggleSidebar,
  }), [isCollapsed, toggleSidebar]);
  
  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

// DattaAble styled components
const drawerWidth = 260;
const collapsedDrawerWidth = 60;

const filterModels = [
  { name: "Category", path: "/category" },
  { name: "City", path: "/city" },
  { name: "Color", path: "/color" },
  { name: "Content", path: "/content" },
  { name: "Country", path: "/country" },
  { name: "Design", path: "/design" },
  { name: "Finish", path: "/finish" },
  { name: "Groupcode", path: "/groupcode" },
  { name: "Location", path: "/location" },
  { name: "Motif", path: "/motif" },
  { name: "State", path: "/state" },
  { name: "Structure", path: "/structure" },
  { name: "Subfinish", path: "/subfinish" },
  { name: "Substructure", path: "/substructure" },
  { name: "Subsuitable", path: "/subsuitable" },
  { name: "Suitablefor", path: "/suitablefor" },
  { name: "Vendor", path: "/vendor" },
];

// Create DattaAble theme
const createDattaAbleTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#7367f0',
    },
    secondary: {
      main: '#82868b',
    },
    background: {
      default: mode === 'light' ? '#f8f8f8' : '#161d31',
      paper: mode === 'light' ? '#ffffff' : '#283046',
    },
    text: {
      primary: mode === 'light' ? '#6e6b7b' : '#d0d2d6',
      secondary: mode === 'light' ? '#b9b9c3' : '#676d7d',
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#283046',
          borderRight: `1px solid ${mode === 'light' ? '#ebe9f1' : '#3b4253'}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#283046',
          color: mode === 'light' ? '#6e6b7b' : '#d0d2d6',
          boxShadow: mode === 'light' ? '0 4px 24px 0 rgba(34, 41, 47, 0.24)' : '0 4px 24px 0 rgba(0, 0, 0, 0.24)',
        },
      },
    },
  },
});

const Sidebar = React.memo(() => {
  const [open, setOpen] = React.useState(true);
  const pathname = usePathname();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { isCollapsed } = useSidebar();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('admin-email');
      const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN;
      setIsSuperAdmin(Boolean(email && superAdmin && email === superAdmin));
    }
  }, []);
  const handleClick = useCallback(() => setOpen(prev => !prev), []);
  const handleLogout = useCallback(() => {
    document.cookie = "admin-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("admin-auth");
    window.location.href = "/login";
  }, []);

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: isCollapsed ? collapsedDrawerWidth : drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        }
      }}
    >
      {/* Logo Section */}
      <Box sx={{ 
        p: isCollapsed ? 1 : 3, 
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        display: 'flex',
        justifyContent: isCollapsed ? 'center' : 'flex-start',
        alignItems: 'center',
        minHeight: 72
      }}>
        {isCollapsed ? (
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            <DashboardIcon sx={{ fontSize: 20 }} />
          </Avatar>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ 
              color: 'text.primary', 
              fontWeight: 600,
              fontSize: '16px'
            }}>
              Admin Panel
            </Typography>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              fontSize: '12px'
            }}>
              Dashboard
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ overflow: 'auto', py: 2 }}>
        <List sx={{ px: isCollapsed ? 0.5 : 2 }}>
          {/* Dashboard */}
          <ListItemButton 
            component={NextLink} 
            href="/dashboard" 
            sx={{
              borderRadius: '6px',
              mb: 1,
              py: 1.5,
              px: isCollapsed ? 0 : 2,
              transition: 'all 0.3s ease',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              minHeight: 48,
              ...(pathname === '/dashboard' && {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }),
              '&:hover': {
                backgroundColor: pathname === '/dashboard' ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: pathname === '/dashboard' ? 'white' : 'text.secondary', 
              minWidth: 0, 
              mr: isCollapsed ? 0 : 2,
              justifyContent: 'center',
              display: 'flex'
            }}>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText 
                primary="Dashboard" 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontSize: '14px',
                    fontWeight: 500
                  } 
                }} 
              />
            )}
          </ListItemButton>
          
          {/* Products */}
          <ListItemButton 
            component={NextLink} 
            href="/products" 
            sx={{
              borderRadius: '6px',
              mb: 1,
              py: 1.5,
              px: isCollapsed ? 0 : 2,
              transition: 'all 0.3s ease',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              minHeight: 48,
              ...(pathname === '/products' && {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }),
              '&:hover': {
                backgroundColor: pathname === '/products' ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: pathname === '/products' ? 'white' : 'text.secondary', 
              minWidth: 0, 
              mr: isCollapsed ? 0 : 2,
              justifyContent: 'center',
              display: 'flex'
            }}>
              <InventoryIcon fontSize="small" />
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText 
                primary="Products" 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontSize: '14px',
                    fontWeight: 500
                  } 
                }} 
              />
            )}
          </ListItemButton>

          

          {/* SEO */}
          <ListItemButton 
            component={NextLink} 
            href="/seo" 
            sx={{
              borderRadius: '6px',
              mb: 1,
              py: 1.5,
              px: isCollapsed ? 0 : 2,
              transition: 'all 0.3s ease',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              minHeight: 48,
              ...(pathname === '/seo' && {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }),
              '&:hover': {
                backgroundColor: pathname === '/seo' ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: pathname === '/seo' ? 'white' : 'text.secondary', 
              minWidth: 0, 
              mr: isCollapsed ? 0 : 2,
              justifyContent: 'center',
              display: 'flex'
            }}>
              <InventoryIcon fontSize="small" />
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText 
                primary="SEO" 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontSize: '14px',
                    fontWeight: 500
                  } 
                }} 
              />
            )}
          </ListItemButton>

          {/* Static SEO */}
          <ListItemButton 
            component={NextLink} 
            href="/static-seo" 
            sx={{
              borderRadius: '6px',
              mb: 1,
              py: 1.5,
              px: isCollapsed ? 0 : 2,
              transition: 'all 0.3s ease',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              minHeight: 48,
              ...(pathname === '/static-seo' && {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }),
              '&:hover': {
                backgroundColor: pathname === '/static-seo' ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: pathname === '/static-seo' ? 'white' : 'text.secondary', 
              minWidth: 0, 
              mr: isCollapsed ? 0 : 2,
              justifyContent: 'center',
              display: 'flex'
            }}>
              <SearchIcon fontSize="small" />
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText 
                primary="Static SEO" 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontSize: '14px',
                    fontWeight: 500
                  } 
                }} 
              />
            )}
          </ListItemButton>

          {/* Admin Restriction */}
          {isSuperAdmin && (
            <ListItemButton 
              component={NextLink} 
              href="/admin-restriction" 
              sx={{
                borderRadius: '6px',
                mb: 1,
                py: 1.5,
                px: isCollapsed ? 0 : 2,
                transition: 'all 0.3s ease',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                minHeight: 48,
                ...(pathname === '/admin-restriction' && {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  }
                }),
                '&:hover': {
                  backgroundColor: pathname === '/admin-restriction' ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: pathname === '/admin-restriction' ? 'white' : 'text.secondary', 
                minWidth: 0, 
                mr: isCollapsed ? 0 : 2,
                justifyContent: 'center',
                display: 'flex'
              }}>
                <PeopleIcon fontSize="small" />
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText 
                  primary="Admin Restriction" 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontSize: '14px',
                      fontWeight: 500
                    } 
                  }} 
                />
              )}
            </ListItemButton>
          )}

          {/* Filters Dropdown */}
          <ListItemButton 
            onClick={handleClick} 
            sx={{
              borderRadius: '6px',
              mb: 1,
              py: 1.5,
              px: 2,
              transition: 'all 0.3s ease',
              ...(pathname.startsWith('/category')||pathname.startsWith('/color')||pathname.startsWith('/content')||pathname.startsWith('/design')||pathname.startsWith('/finish')||pathname.startsWith('/groupcode')||pathname.startsWith('/structure')||pathname.startsWith('/subfinish')||pathname.startsWith('/substructure')||pathname.startsWith('/subsuitable')||pathname.startsWith('/suitablefor')||pathname.startsWith('/vendor')||pathname.startsWith('/motif') ? {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              } : {}),
              '&:hover': {
                backgroundColor: (pathname.startsWith('/category')||pathname.startsWith('/color')||pathname.startsWith('/content')||pathname.startsWith('/design')||pathname.startsWith('/finish')||pathname.startsWith('/groupcode')||pathname.startsWith('/structure')||pathname.startsWith('/subfinish')||pathname.startsWith('/substructure')||pathname.startsWith('/subsuitable')||pathname.startsWith('/suitablefor')||pathname.startsWith('/vendor')||pathname.startsWith('/motif')) ? 'primary.dark' : 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: (pathname.startsWith('/category')||pathname.startsWith('/color')||pathname.startsWith('/content')||pathname.startsWith('/design')||pathname.startsWith('/finish')||pathname.startsWith('/groupcode')||pathname.startsWith('/structure')||pathname.startsWith('/subfinish')||pathname.startsWith('/substructure')||pathname.startsWith('/subsuitable')||pathname.startsWith('/suitablefor')||pathname.startsWith('/vendor')||pathname.startsWith('/motif')) ? 'white' : 'text.secondary', 
              minWidth: 0, 
              mr: 2 
            }}>
              <FilterListIcon fontSize="small" />
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText 
                primary="Filters" 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontSize: '14px',
                    fontWeight: 500
                  } 
                }} 
              />
            )}
            {!isCollapsed && (open ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
          
          {/* Filter Submenu */}
          <Collapse in={open && !isCollapsed} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 2 }}>
              {filterModels.map((model) => (
                <ListItemButton 
                  component={NextLink} 
                  href={model.path} 
                  key={model.name} 
                  sx={{
                    borderRadius: '6px',
                    mb: 0.5,
                    py: 1,
                    px: 2,
                    transition: 'all 0.3s ease',
                    ...(pathname === model.path && {
                      backgroundColor: 'primary.dark',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                      }
                    }),
                    '&:hover': {
                      backgroundColor: pathname === model.path ? 'primary.main' : 'action.hover',
                    },
                  }}
                >
                  <ListItemText 
                    primary={model.name} 
                    sx={{ 
                      '& .MuiTypography-root': { 
                        fontSize: '13px',
                        fontWeight: 400
                      } 
                    }} 
                  />
                </ListItemButton>
              ))}
            </List>
          </Collapse>

          <Divider sx={{ my: 2 }} />

          {/* Logout */}
          <ListItemButton 
            onClick={handleLogout}
            sx={{
              borderRadius: '6px',
              mb: 1,
              py: 1.5,
              px: 2,
              transition: 'all 0.3s ease',
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'white',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: 'inherit', 
              minWidth: 0, 
              mr: 2 
            }}>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            {!isCollapsed && (
              <ListItemText 
                primary="Logout" 
                sx={{ 
                  '& .MuiTypography-root': { 
                    fontSize: '14px',
                    fontWeight: 500
                  } 
                }} 
              />
            )}
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
});

Sidebar.displayName = 'Sidebar';

const Header = React.memo(() => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [userEmail, setUserEmail] = useState('');
  const { isCollapsed, toggleSidebar } = useSidebar();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserEmail(localStorage.getItem('admin-email') || '');
    }
  }, []);
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => setNotifAnchor(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNotifClose = () => setNotifAnchor(null);
  const handleLogout = () => {
    document.cookie = "admin-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("admin-auth");
    window.location.href = "/login";
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#f6f7fb',
        color: '#6c7890',
        boxShadow: 'none',
        height: 56,
        minHeight: 56,
        left: `${isCollapsed ? collapsedDrawerWidth : drawerWidth}px`, // Header starts after sidebar
        width: `calc(100% - ${isCollapsed ? collapsedDrawerWidth : drawerWidth}px)`, // Header does not overlap sidebar
        transition: 'left 0.3s ease, width 0.3s ease',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
        border: 'none',
      }}
      elevation={0}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: 56,
          height: 56,
          width: '100%',
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1,
          background: 'transparent',
          boxShadow: 'none',
        }}
      >
        {/* Left: Hamburger/Menu and Search Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton size="small" onClick={toggleSidebar} sx={{ color: '#6c7890', width: 36, height: 36 }}>
            <MenuOutlinedIcon sx={{ fontSize: 24 }} />
          </IconButton>
          <IconButton size="small" sx={{ color: '#6c7890', width: 36, height: 36 }}>
            <SearchIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>
        {/* Right: Theme, Settings, Notifications, User */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton size="small" sx={{ color: '#6c7890', width: 36, height: 36 }}>
            <WbSunnyOutlinedIcon sx={{ fontSize: 22 }} />
          </IconButton>
          <IconButton size="small" onClick={handleNotifClick} sx={{ color: '#6c7890', width: 36, height: 36 }}>
            <Badge badgeContent={3} color="success" sx={{ '& .MuiBadge-badge': { fontSize: 11, height: 18, minWidth: 18, background: '#1de9b6' } }}>
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>
          <IconButton size="small" onClick={handleAvatarClick} sx={{ color: '#6c7890', width: 36, height: 36 }}>
            <PersonOutlineOutlinedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>
        {/* Notifications Menu */}
        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={handleNotifClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 320,
              maxHeight: 400,
              overflow: 'auto',
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
          </Box>
          <MenuItem onClick={handleNotifClose}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  New message received
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  2 minutes ago
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotifClose}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  New user registered
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  1 hour ago
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        </Menu>
        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Admin User
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userEmail}
            </Typography>
          </Box>
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            {/* Settings menu item removed */}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
});

Header.displayName = 'Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = useMemo(() => createDattaAbleTheme('light'), []);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <SidebarProvider>
            <Box sx={{ display: 'flex' }}>
              {mounted && <Sidebar />}
              <Box sx={{ flexGrow: 1 }}>
                {mounted && <Header />}
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    p: 3,
                    mt: 8,
                    backgroundColor: 'background.default',
                    minHeight: '100vh',
                  }}
                >
                  {children}
                </Box>
              </Box>
            </Box>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
