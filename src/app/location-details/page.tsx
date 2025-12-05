"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
    CircularProgress,
    Autocomplete,
    DialogContentText,
    InputAdornment,
    TablePagination,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
} from "@mui/icons-material";
import apiFetch from "../../utils/apiFetch";

type AccessLevel = "all access" | "only view" | "no access";

interface Country {
    _id: string;
    name: string;
    code?: string;
}

interface State {
    _id: string;
    name: string;
    country?: string | Country;
}

interface City {
    _id: string;
    name: string;
    state?: string | State;
    country?: string | Country;
    pincode?: string;
}

interface LocationDetail {
    _id?: string;
    name: string;
    slug: string;
    pincode: string;
    country: string | Country;
    state: string | State;
    city: string | City;
    longitude?: number;
    latitude?: number;
}

interface FormState {
    name: string;
    slug: string;
    country: string;
    state: string;
    city: string;
    pincode: string;
    latitude: string;
    longitude: string;
}

type SnackbarSeverity = "success" | "error" | "info" | "warning";

interface SnackbarState {
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
}

const defaultFormState: FormState = {
    name: "",
    slug: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    latitude: "",
    longitude: "",
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const getPermission = (): AccessLevel => {
    if (typeof window === "undefined") return "no access";
    const email = localStorage.getItem("admin-email");
    const superAdmin = process.env.NEXT_PUBLIC_SUPER_ADMIN;
    if (email && superAdmin && email === superAdmin) return "all access";
    const perms = JSON.parse(localStorage.getItem("admin-permissions") || "{}");
    if (perms && perms.filter) {
        return perms.filter;
    }
    return "no access";
};

const extractCollection = <T,>(payload: unknown, key?: string): T[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload as T[];

    if (typeof payload === "object") {
        const obj = payload as Record<string, unknown>;
        if (key && Array.isArray(obj[key] as T[])) {
            return obj[key] as T[];
        }
        if (obj.data && typeof obj.data === "object") {
            const data = obj.data as Record<string, unknown>;
            if (key && Array.isArray(data[key] as T[])) {
                return data[key] as T[];
            }
            if (Array.isArray(data as unknown as T[])) {
                return data as unknown as T[];
            }
        }
        if (Array.isArray(obj.results as T[])) {
            return obj.results as T[];
        }
    }
    return [];
};

const getEntityName = <T extends { _id?: string; name?: string }>(
    value: string | T | undefined,
    fallback: T[]
) => {
    if (!value) return "";
    if (typeof value === "object") {
        return value.name || "";
    }
    const match = fallback.find((item) => item._id === value);
    return match?.name || "";
};

const getEntityId = <T extends { _id?: string }>(value: string | T | undefined) => {
    if (!value) return "";
    return typeof value === "string" ? value : value._id || "";
};

export default function LocationDetailsPage() {
    const [isClient, setIsClient] = useState(false);
    const [pageAccess, setPageAccess] = useState<AccessLevel>("no access");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationDetails, setLocationDetails] = useState<LocationDetail[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [form, setForm] = useState<FormState>(defaultFormState);
    const [openForm, setOpenForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: "",
        severity: "success",
    });
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const refreshCountries = useCallback(async () => {
        try {
            const res = await apiFetch("/countries");
            const json = await res.json();
            const countries = extractCollection<Country>(json, "countries");
            // Sort countries alphabetically by name
            countries.sort((a: Country, b: Country) => a.name.localeCompare(b.name));
            setCountries(countries);
        } catch (error) {
      console.log("error",error);
    }
    }, []);

    const refreshStates = useCallback(async () => {
        try {
            const res = await apiFetch("/states");
            const json = await res.json();
            const states = extractCollection<State>(json, "states");
            // Sort states alphabetically by name
            states.sort((a: State, b: State) => a.name.localeCompare(b.name));
            setStates(states);
        } catch (error) {
      console.log("error",error);
    }
    }, []);

    const refreshCities = useCallback(async () => {
        try {
            const res = await apiFetch("/cities");
            const json = await res.json();
            const cities = extractCollection<City>(json, "cities");
            // Sort cities alphabetically by name
            cities.sort((a: City, b: City) => a.name.localeCompare(b.name));
            setCities(cities);
        } catch (error) {
      console.log("error",error);
    }
    }, []);

    useEffect(() => {
        setIsClient(true);
        const permission = getPermission();
        setPageAccess(permission);
    }, []);

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [detailsRes, countriesRes, statesRes, citiesRes] = await Promise.all([
                apiFetch("/location-details"),
                apiFetch("/countries"),
                apiFetch("/states"),
                apiFetch("/cities"),
            ]);

            const [detailsJson, countriesJson, statesJson, citiesJson] = await Promise.all([
                detailsRes.json(),
                countriesRes.json(),
                statesRes.json(),
                citiesRes.json(),
            ]);

            setLocationDetails(extractCollection<LocationDetail>(detailsJson, "locationDetails"));
            const countries = extractCollection<Country>(countriesJson, "countries");
            // Sort countries alphabetically by name
            countries.sort((a: Country, b: Country) => a.name.localeCompare(b.name));
            setCountries(countries);
            const states = extractCollection<State>(statesJson, "states");
            // Sort states alphabetically by name
            states.sort((a: State, b: State) => a.name.localeCompare(b.name));
            setStates(states);
            const cities = extractCollection<City>(citiesJson, "cities");
            // Sort cities alphabetically by name
            cities.sort((a: City, b: City) => a.name.localeCompare(b.name));
            setCities(cities);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load data";
            setError(message);
            setSnackbar({
                open: true,
                message,
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (pageAccess !== "no access") {
            fetchAllData();
        }
    }, [fetchAllData, pageAccess]);

    const filteredDetails = useMemo(() => {
        if (!search.trim()) return locationDetails;
        const term = search.toLowerCase();
        return locationDetails.filter((detail) => {
            const countryName = getEntityName(detail.country, countries);
            const stateName = getEntityName(detail.state, states);
            const cityName = getEntityName(detail.city, cities);
            return [detail.name, detail.slug, detail.pincode, countryName, stateName, cityName]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(term));
        });
    }, [cities, countries, locationDetails, search, states]);

    const paginatedDetails = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredDetails.slice(start, start + rowsPerPage);
    }, [filteredDetails, page, rowsPerPage]);

    useEffect(() => {
        setPage(0);
    }, [search]);

    const availableStates = useMemo(() => {
        if (!form.country) return [];
        return states.filter((state) => getEntityId(state.country) === form.country);
    }, [form.country, states]);

    const availableCities = useMemo(() => {
        if (!form.country) return [];
        // If state is selected, filter cities by state
        if (form.state) {
            return cities.filter((city) => getEntityId(city.state) === form.state);
        }
        // If only country is selected, filter cities by country
        return cities.filter((city) => getEntityId(city.country) === form.country);
    }, [cities, form.country, form.state]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "name" && !editId ? { slug: slugify(value) } : {}),
        }));
    };

    const handleOpenForm = () => {
        setEditId(null);
        setForm(defaultFormState);
        setOpenForm(true);
        setError(null);
    };

    const handleCloseForm = () => {
        if (submitting) return;
        setOpenForm(false);
        setForm(defaultFormState);
        setEditId(null);
        setError(null);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting) return;

        if (!form.country) {
            setError("Please select a country.");
            return;
        }

        if (!form.name || !form.slug || !form.pincode) {
            setError("Name, slug, and pincode are required.");
            return;
        }

        try {
            setSubmitting(true);
            const url = editId ? `/location-details/${editId}` : "/location-details";
            const method = editId ? "PUT" : "POST";
            const payload: Record<string, unknown> = {
                name: form.name.trim(),
                slug: form.slug.trim(),
                country: form.country,
                pincode: form.pincode.trim(),
            };

            if (form.state) payload.state = form.state;
            if (form.city) payload.city = form.city;

            if (form.latitude) payload.latitude = Number(form.latitude);
            if (form.longitude) payload.longitude = Number(form.longitude);

            const response = await apiFetch(url, {
                method,
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.message || "Failed to save location detail");
            }

            setSnackbar({
                open: true,
                message: editId ? "Location detail updated" : "Location detail created",
                severity: "success",
            });

            handleCloseForm();
            fetchAllData();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to save location detail";
            setError(message);
            setSnackbar({
                open: true,
                message,
                severity: "error",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (detail: LocationDetail) => {
        setEditId(detail._id || null);
        setForm({
            name: detail.name || "",
            slug: detail.slug || "",
            country: getEntityId(detail.country),
            state: getEntityId(detail.state),
            city: getEntityId(detail.city),
            pincode: detail.pincode || "",
            latitude: detail.latitude !== undefined ? String(detail.latitude) : "",
            longitude: detail.longitude !== undefined ? String(detail.longitude) : "",
        });
        setOpenForm(true);
        setError(null);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            setDeleteSubmitting(true);
            const response = await apiFetch(`/location-details/${deleteId}`, {
                method: "DELETE",
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.message || "Failed to delete record");
            }

            setSnackbar({
                open: true,
                message: "Location detail deleted",
                severity: "success",
            });
            setDeleteId(null);
            fetchAllData();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete record";
            setSnackbar({
                open: true,
                message,
                severity: "error",
            });
        } finally {
            setDeleteSubmitting(false);
        }
    };

    const viewOnly = pageAccess === "only view";

    if (!isClient) {
        return null;
    }

    if (pageAccess === "no access") {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error">You don&apos;t have permission to access this page.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4">Location Details</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenForm}
                    disabled={viewOnly}
                >
                    Add Location Detail
                </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search by name, slug, pincode, or region"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            ) : (
                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Slug</TableCell>
                                    <TableCell>Pincode</TableCell>
                                    <TableCell>Country</TableCell>
                                    <TableCell>State</TableCell>
                                    <TableCell>City</TableCell>
                                    <TableCell>Latitude</TableCell>
                                    <TableCell>Longitude</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedDetails.length ? (
                                    paginatedDetails.map((detail) => (
                                        <TableRow key={detail._id || detail.slug} hover>
                                            <TableCell>{detail.name}</TableCell>
                                            <TableCell>{detail.slug}</TableCell>
                                            <TableCell>{detail.pincode}</TableCell>
                                            <TableCell>{getEntityName(detail.country, countries)}</TableCell>
                                            <TableCell>{getEntityName(detail.state, states)}</TableCell>
                                            <TableCell>{getEntityName(detail.city, cities)}</TableCell>
                                            <TableCell>{detail.latitude ?? "-"}</TableCell>
                                            <TableCell>{detail.longitude ?? "-"}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleEdit(detail)}
                                                    disabled={viewOnly}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => setDeleteId(detail._id || null)}
                                                    disabled={viewOnly}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">
                                            {search ? "No matching records found" : "No location details available"}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={filteredDetails.length}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                </Paper>
            )}

            <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="md">
                <form onSubmit={handleSubmit}>
                    <DialogTitle>{editId ? "Edit Location Detail" : "Add Location Detail"}</DialogTitle>
                    <DialogContent dividers>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}
                        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                            <Autocomplete
                                onOpen={refreshCountries}
                                options={countries}
                                getOptionLabel={(option) => option.name || ""}
                                value={countries.find((country) => country._id === form.country) || null}
                                onChange={(_, value) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        country: value?._id || "",
                                        state: "",
                                        city: "",
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Country" required />
                                )}
                            />
                            <Autocomplete
                                onOpen={refreshStates}
                                options={availableStates}
                                getOptionLabel={(option) => option.name || ""}
                                value={availableStates.find((state) => state._id === form.state) || null}
                                onChange={(_, value) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        state: value?._id || "",
                                        city: "",
                                    }));
                                }}
                                disabled={!form.country}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="State (Optional)"
                                        helperText={!form.country ? "Select a country first" : "Optional - Select to filter cities"}
                                    />
                                )}
                            />
                            <Autocomplete
                                onOpen={refreshCities}
                                options={availableCities}
                                getOptionLabel={(option) => option.name || ""}
                                value={availableCities.find((city) => city._id === form.city) || null}
                                onChange={(_, value) => {
                                    setForm((prev) => ({
                                        ...prev,
                                        city: value?._id || "",
                                    }));
                                }}
                                disabled={!form.country}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="City (Optional)"
                                        helperText={
                                            !form.country 
                                                ? "Select a country first" 
                                                : form.state 
                                                    ? "Showing cities from selected state" 
                                                    : "Showing cities from selected country"
                                        }
                                    />
                                )}
                            />
                            <TextField
                                label="Pincode"
                                name="pincode"
                                value={form.pincode}
                                onChange={handleChange}
                                required
                                inputProps={{ pattern: "^[0-9A-Za-z\\- ]+$" }}
                            />
                            <TextField
                                label="Location Name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                label="Slug"
                                name="slug"
                                value={form.slug}
                                onChange={handleChange}
                                required
                                helperText="Auto-generated from name. You can override it."
                            />
                            <TextField
                                label="Latitude"
                                name="latitude"
                                value={form.latitude}
                                onChange={handleChange}
                                type="number"
                                inputProps={{ step: "any" }}
                            />
                            <TextField
                                label="Longitude"
                                name="longitude"
                                value={form.longitude}
                                onChange={handleChange}
                                type="number"
                                inputProps={{ step: "any" }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseForm} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={submitting}>
                            {submitting ? "Saving..." : "Save"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={Boolean(deleteId)} onClose={() => (deleteSubmitting ? null : setDeleteId(null))}>
                <DialogTitle>Delete Location Detail</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this location detail? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteId(null)} disabled={deleteSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        color="error"
                        disabled={deleteSubmitting}
                    >
                        {deleteSubmitting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}

