"use client";
"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import apiFetch from '../../utils/apiFetch';
import {
  Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  IconButton, Pagination, Breadcrumbs, Link, CircularProgress, Alert, Snackbar, Autocomplete, InputAdornment 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import PublicIcon from '@mui/icons-material/Public';
import ClearIcon from '@mui/icons-material/Clear';

interface Country {
  _id?: string;
  name: string;
  code: string;
  slug?: string;
  flag?: string;
  longitude?: number;
  latitude?: number;
}

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  longitude?: number;
  latitude?: number;
}

type FormState = Required<Pick<Country, 'name' | 'code' | 'slug'>> & {
  longitude?: number;
  latitude?: number;
};

const CountryRow = React.memo(({ country, onEdit, onDelete, viewOnly }: {
  country: Country;
  onEdit: (country: Country) => void;
  onDelete: (id: string) => void;
  viewOnly: boolean;
}) => (
  <TableRow hover sx={{ transition: 'background 0.2s', '&:hover': { background: 'rgba(41,72,255,0.08)' } }}>
    <TableCell sx={{ fontSize: 16 }}>{country.name}</TableCell>
    <TableCell sx={{ fontSize: 16 }}>{country.code}</TableCell>
    <TableCell sx={{ fontSize: 16 }}>{country.slug || '-'}</TableCell>
    <TableCell sx={{ fontSize: 16 }}>{country.longitude !== undefined ? country.longitude.toFixed(6) : '0.000000'}</TableCell>
    <TableCell sx={{ fontSize: 16 }}>{country.latitude !== undefined ? country.latitude.toFixed(6) : '0.000000'}</TableCell>
    <TableCell>
      <IconButton color="primary" onClick={() => onEdit(country)} disabled={viewOnly}><EditIcon /></IconButton>
      <IconButton 
        color="error" 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(country._id || '');
        }} 
        disabled={viewOnly}
      >
        <DeleteIcon />
      </IconButton>
    </TableCell>
  </TableRow>
));

CountryRow.displayName = 'CountryRow';

const countriesList: CountryOption[] = [
    {
      "code": "US",
      "name": "United States",
      "flag": "🇺🇸",
      "longitude": -95.7129,
      "latitude": 37.0902
    },
    {
      "code": "GB",
      "name": "United Kingdom",
      "flag": "🇬🇧",
      "longitude": -3.4360,
      "latitude": 55.3781
    },
    {
      "code": "CA",
      "name": "Canada",
      "flag": "🇨🇦",
      "longitude": -106.3468,
      "latitude": 56.1304
    },
    {
      "code": "AU",
      "name": "Australia",
      "flag": "🇦🇺",
      "longitude": 133.7751,
      "latitude": -25.2744
    },
    {
      "code": "IN",
      "name": "India",
      "flag": "🇮🇳",
      "longitude": 78.9629,
      "latitude": 20.5937
    },
    {
      "code": "CN",
      "name": "China",
      "flag": "🇨🇳",
      "longitude": 104.1954,
      "latitude": 35.8617
    },
    {
      "code": "JP",
      "name": "Japan",
      "flag": "🇯🇵",
      "longitude": 138.2529,
      "latitude": 36.2048
    },
    {
      "code": "DE",
      "name": "Germany",
      "flag": "🇩🇪",
      "longitude": 10.4515,
      "latitude": 51.1657
    },
    {
      "code": "FR",
      "name": "France",
      "flag": "🇫🇷",
      "longitude": 1.8883,
      "latitude": 46.6034
    },
    {
      "code": "BR",
      "name": "Brazil",
      "flag": "🇧🇷",
      "longitude": -51.9253,
      "latitude": -14.2350
    },
    {
      "code": "IT",
      "name": "Italy",
      "flag": "🇮🇹",
      "longitude": 12.5674,
      "latitude": 41.8719
    },
    {
      "code": "ES",
      "name": "Spain",
      "flag": "🇪🇸",
      "longitude": -3.7492,
      "latitude": 40.4637
    },
    {
      "code": "RU",
      "name": "Russian Federation",
      "flag": "🇷🇺",
      "longitude": 105.3188,
      "latitude": 61.5240
    },
    {
      "code": "MX",
      "name": "Mexico",
      "flag": "🇲🇽",
      "longitude": -102.5528,
      "latitude": 23.6345
    },
    {
      "code": "KR",
      "name": "Korea, Republic of",
      "flag": "🇰🇷",
      "longitude": 127.7669,
      "latitude": 35.9078
    },
    {
      "code": "ID",
      "name": "Indonesia",
      "flag": "🇮🇩",
      "longitude": 113.9213,
      "latitude": -0.7893
    },
    {
      "code": "TR",
      "name": "Turkey",
      "flag": "🇹🇷",
      "longitude": 35.2433,
      "latitude": 38.9637
    },
    {
      "code": "SA",
      "name": "Saudi Arabia",
      "flag": "🇸🇦",
      "longitude": 45.0792,
      "latitude": 23.8859
    },
    {
      "code": "CH",
      "name": "Switzerland",
      "flag": "🇨🇭",
      "longitude": 8.2275,
      "latitude": 46.8182
    },
    {
      "code": "AE",
      "name": "United Arab Emirates",
      "flag": "🇦🇪",
      "longitude": 53.8478,
      "latitude": 23.4241
    },
    {
      "code": "SG",
      "name": "Singapore",
      "flag": "🇸🇬",
      "longitude": 103.8198,
      "latitude": 1.3521
    },
    {
      "code": "NL",
      "name": "Netherlands",
      "flag": "🇳🇱",
      "longitude": 5.2913,
      "latitude": 52.1326
    },
    {
      "code": "SE",
      "name": "Sweden",
      "flag": "🇸🇪",
      "longitude": 18.6435,
      "latitude": 60.1282
    },
    {
      "code": "NO",
      "name": "Norway",
      "flag": "🇳🇴",
      "longitude": 8.4689,
      "latitude": 60.4720
    },
    {
      "code": "DK",
      "name": "Denmark",
      "flag": "🇩🇰",
      "longitude": 9.5018,
      "latitude": 56.2639
    },
    {
      "code": "FI",
      "name": "Finland",
      "flag": "🇫🇮",
      "longitude": 25.7482,
      "latitude": 61.9241
    },
    {
      "code": "AT",
      "name": "Austria",
      "flag": "🇦🇹",
      "longitude": 14.5501,
      "latitude": 47.5162
    },
    {
      "code": "BE",
      "name": "Belgium",
      "flag": "🇧🇪",
      "longitude": 4.4699,
      "latitude": 50.5039
    },
    {
      "code": "PT",
      "name": "Portugal",
      "flag": "🇵🇹",
      "longitude": -8.2245,
      "latitude": 39.3999
    },
    {
      "code": "GR",
      "name": "Greece",
      "flag": "🇬🇷",
      "longitude": 21.8243,
      "latitude": 39.0742
    },
    {
      "code": "PL",
      "name": "Poland",
      "flag": "🇵🇱",
      "longitude": 19.1451,
      "latitude": 51.9194
    },
    {
      "code": "ZA",
      "name": "South Africa",
      "flag": "🇿🇦",
      "longitude": 22.9375,
      "latitude": -30.5595
    },
    {
      "code": "EG",
      "name": "Egypt",
      "flag": "🇪🇬",
      "longitude": 30.8025,
      "latitude": 26.8206
    },
    {
      "code": "NG",
      "name": "Nigeria",
      "flag": "🇳🇬",
      "longitude": 8.6753,
      "latitude": 9.0820
    },
    {
      "code": "KE",
      "name": "Kenya",
      "flag": "🇰🇪",
      "longitude": 37.9062,
      "latitude": -0.0236
    },
    {
      "code": "AR",
      "name": "Argentina",
      "flag": "🇦🇷",
      "longitude": -63.6167,
      "latitude": -38.4161
    },
    {
      "code": "CL",
      "name": "Chile",
      "flag": "🇨🇱",
      "longitude": -71.5430,
      "latitude": -35.6751
    },
  {
    "code": "AF",
    "name": "Afghanistan",
    "flag": "🇦🇫",
    "longitude": 67.709953,
    "latitude": 33.93911
  },
  {
    "code": "AO",
    "name": "Angola",
    "flag": "🇦🇴",
    "longitude": 17.873887,
    "latitude": -11.202692
  },
  {
    "code": "AI",
    "name": "Anguilla",
    "flag": "🇦🇮",
    "longitude": -63.068615,
    "latitude": 18.220554
  },
  {
    "code": "AX",
    "name": "Åland Islands",
    "flag": "🇦🇽",
    "longitude": 19.8875,
    "latitude": 60.1785
  },
  {
    "code": "AL",
    "name": "Albania",
    "flag": "🇦🇱",
    "longitude": 20.1683,
    "latitude": 41.1533
  },
  {
    "code": "AD",
    "name": "Andorra",
    "flag": "🇦🇩",
    "longitude": 1.5218,
    "latitude": 42.5063
  },
  {
    "code": "AE",
    "name": "United Arab Emirates",
    "flag": "🇦🇪"
  },
  {
    "code": "AR",
    "name": "Argentina",
    "flag": "🇦🇷"
  },
  {
    "code": "AM",
    "name": "Armenia",
    "flag": "🇦🇲",
    "longitude": 45.0382,
    "latitude": 40.0691
  },
  {
    "code": "AS",
    "name": "American Samoa",
    "flag": "🇦🇸",
    "longitude": -170.6945,
    "latitude": -14.2710
  },
  {
    "code": "AQ",
    "name": "Antarctica",
    "flag": "🇦🇶",
    "longitude": 0.0000,
    "latitude": -90.0000
  },
  {
    "code": "TF",
    "name": "French Southern Territories",
    "flag": "🇹🇫",
    "longitude": 69.3486,
    "latitude": -49.2804
  },
  {
    "code": "AG",
    "name": "Antigua and Barbuda",
    "flag": "🇦🇬",
    "longitude": -61.7964,
    "latitude": 17.0608
  },
  {
    "code": "AU",
    "name": "Australia",
    "flag": "🇦🇺"
  },
  {
    "code": "AT",
    "name": "Austria",
    "flag": "🇦🇹"
  },
  {
    "code": "AZ",
    "name": "Azerbaijan",
    "flag": "🇦🇿",
    "longitude": 47.5769,
    "latitude": 40.1431
  },
  {
    "code": "BI",
    "name": "Burundi",
    "flag": "🇧🇮",
    "longitude": 29.8739,
    "latitude": -3.3731
  },
  {
    "code": "BE",
    "name": "Belgium",
    "flag": "🇧🇪"
  },
  {
    "code": "BJ",
    "name": "Benin",
    "flag": "🇧🇯",
    "longitude": 2.3158,
    "latitude": 9.3077
  },
  {
    "code": "BQ",
    "name": "Bonaire, Sint Eustatius and Saba",
    "flag": "🇧🇶",
    "longitude": -68.2385,
    "latitude": 12.1784
  },
  {
    "code": "BF",
    "name": "Burkina Faso",
    "flag": "🇧🇫",
    "longitude": -1.5616,
    "latitude": 12.2383
  },
  {
    "code": "BD",
    "name": "Bangladesh",
    "flag": "🇧🇩",
    "longitude": 90.3563,
    "latitude": 23.6850
  },
  {
    "code": "BG",
    "name": "Bulgaria",
    "flag": "🇧🇬",
    "longitude": 25.4858,
    "latitude": 42.7339
  },
  {
    "code": "BH",
    "name": "Bahrain",
    "flag": "🇧🇭",
    "longitude": 50.5577,
    "latitude": 26.0667
  },
  {
    "code": "BS",
    "name": "Bahamas",
    "flag": "🇧🇸",
    "longitude": -77.3963,
    "latitude": 25.0343
  },
  {
    "code": "BA",
    "name": "Bosnia and Herzegovina",
    "flag": "🇧🇦",
    "longitude": 17.6791,
    "latitude": 43.9159
  },
  {
    "code": "BL",
    "name": "Saint Barthélemy",
    "flag": "🇧🇱",
    "longitude": -62.8407,
    "latitude": 17.9000
  },
  {
    "code": "BY",
    "name": "Belarus",
    "flag": "🇧🇾",
    "longitude": 27.9534,
    "latitude": 53.7098
  },
  {
    "code": "BZ",
    "name": "Belize",
    "flag": "🇧🇿",
    "longitude": -88.4976,
    "latitude": 17.1899
  },
  {
    "code": "BM",
    "name": "Bermuda",
    "flag": "🇧🇲",
    "longitude": -64.7505,
    "latitude": 32.3078
  },
  {
    "code": "BO",
    "name": "Bolivia, Plurinational State of",
    "flag": "🇧🇴",
    "longitude": -63.5887,
    "latitude": -16.2902
  },
  {
    "code": "BR",
    "name": "Brazil",
    "flag": "🇧🇷"
  },
  {
    "code": "BB",
    "name": "Barbados",
    "flag": "🇧🇧",
    "longitude": -59.5432,
    "latitude": 13.1939
  },
  {
    "code": "BN",
    "name": "Brunei Darussalam",
    "flag": "🇧🇳",
    "longitude": 114.7277,
    "latitude": 4.5353
  },
  {
    "code": "BT",
    "name": "Bhutan",
    "flag": "🇧🇹",
    "longitude": 90.4336,
    "latitude": 27.5142
  },
  {
    "code": "BV",
    "name": "Bouvet Island",
    "flag": "🇧🇻",
    "longitude": 3.4132,
    "latitude": -54.4232
  },
  {
    "code": "BW",
    "name": "Botswana",
    "flag": "🇧🇼",
    "longitude": 24.6849,
    "latitude": -22.3285
  },
  {
    "code": "CF",
    "name": "Central African Republic",
    "flag": "🇨🇫",
    "longitude": 20.9394,
    "latitude": 6.6111
  },
  {
    "code": "CA",
    "name": "Canada",
    "flag": "🇨🇦"
  },
  {
    "code": "CC",
    "name": "Cocos (Keeling) Islands",
    "flag": "🇨🇨",
    "longitude": 96.8710,
    "latitude": -12.1642
  },
  {
    "code": "CH",
    "name": "Switzerland",
    "flag": "🇨🇭"
  },
  {
    "code": "CL",
    "name": "Chile",
    "flag": "🇨🇱"
  },
  {
    "code": "CN",
    "name": "China",
    "flag": "🇨🇳"
  },
  {
    "code": "CI",
    "name": "Côte d'Ivoire",
    "flag": "🇨🇮",
    "longitude": -5.5471,
    "latitude": 7.5400
  },
  {
    "code": "CM",
    "name": "Cameroon",
    "flag": "🇨🇲",
    "longitude": 12.3547,
    "latitude": 7.3697
  },
  {
    "code": "CD",
    "name": "Congo, The Democratic Republic of the",
    "flag": "🇨🇩",
    "longitude": 21.7587,
    "latitude": -4.0383
  },
  {
    "code": "CG",
    "name": "Congo",
    "flag": "🇨🇬",
    "longitude": 15.2832,
    "latitude": -0.2280
  },
  {
    "code": "CK",
    "name": "Cook Islands",
    "flag": "🇨🇰",
    "longitude": -159.7777,
    "latitude": -21.2367
  },
  {
    "code": "CO",
    "name": "Colombia",
    "flag": "🇨🇴",
    "longitude": -74.2973,
    "latitude": 4.5709
  },
  {
    "code": "KM",
    "name": "Comoros",
    "flag": "🇰🇲",
    "longitude": 43.3333,
    "latitude": -11.8750
  },
  {
    "code": "CV",
    "name": "Cabo Verde",
    "flag": "🇨🇻",
    "longitude": -23.6052,
    "latitude": 16.0021
  },
  {
    "code": "CR",
    "name": "Costa Rica",
    "flag": "🇨🇷",
    "longitude": -83.7534,
    "latitude": 9.7489
  },
  {
    "code": "CU",
    "name": "Cuba",
    "flag": "🇨🇺",
    "longitude": -77.7812,
    "latitude": 21.5218
  },
  {
    "code": "CW",
    "name": "Curaçao",
    "flag": "🇨🇼",
    "longitude": -68.8824,
    "latitude": 12.1696
  },
  {
    "code": "CX",
    "name": "Christmas Island",
    "flag": "🇨🇽",
    "longitude": 105.6905,
    "latitude": -10.4475
  },
  {
    "code": "KY",
    "name": "Cayman Islands",
    "flag": "🇰🇾",
    "longitude": -80.5667,
    "latitude": 19.3133
  },
  {
    "code": "CY",
    "name": "Cyprus",
    "flag": "🇨🇾",
    "longitude": 33.4299,
    "latitude": 35.1264
  },
  {
    "code": "CZ",
    "name": "Czechia",
    "flag": "🇨🇿",
    "longitude": 15.4730,
    "latitude": 49.8175
  },
  {
    "code": "DE",
    "name": "Germany",
    "flag": "🇩🇪"
  },
  {
    "code": "DJ",
    "name": "Djibouti",
    "flag": "🇩🇯",
    "longitude": 42.5903,
    "latitude": 11.8251
  },
  {
    "code": "DM",
    "name": "Dominica",
    "flag": "🇩🇲",
    "longitude": -61.3700,
    "latitude": 15.4150
  },
  {
    "code": "DK",
    "name": "Denmark",
    "flag": "🇩🇰"
  },
  {
    "code": "DO",
    "name": "Dominican Republic",
    "flag": "🇩🇴",
    "longitude": -70.1627,
    "latitude": 18.7357
  },
  {
    "code": "DZ",
    "name": "Algeria",
    "flag": "🇩🇿",
    "longitude": 1.6596,
    "latitude": 28.0339
  },
  {
    "code": "EC",
    "name": "Ecuador",
    "flag": "🇪🇨",
    "longitude": -78.1834,
    "latitude": -1.8312
  },
  {
    "code": "EG",
    "name": "Egypt",
    "flag": "🇪🇬"
  },
  {
    "code": "ER",
    "name": "Eritrea",
    "flag": "🇪🇷",
    "longitude": 39.7823,
    "latitude": 15.1794
  },
  {
    "code": "EH",
    "name": "Western Sahara",
    "flag": "🇪🇭",
    "longitude": -12.8858,
    "latitude": 24.2155
  },
  {
    "code": "ES",
    "name": "Spain",
    "flag": "🇪🇸"
  },
  {
    "code": "EE",
    "name": "Estonia",
    "flag": "🇪🇪",
    "longitude": 25.0136,
    "latitude": 58.5953
  },
  {
    "code": "ET",
    "name": "Ethiopia",
    "flag": "🇪🇹",
    "longitude": 40.4897,
    "latitude": 9.1450
  },
  {
    "code": "FI",
    "name": "Finland",
    "flag": "🇫🇮"
  },
  {
    "code": "FJ",
    "name": "Fiji",
    "flag": "🇫🇯",
    "longitude": 178.0650,
    "latitude": -17.7134
  },
  {
    "code": "FK",
    "name": "Falkland Islands (Malvinas)",
    "flag": "🇫🇰",
    "longitude": -59.5236,
    "latitude": -51.7963
  },
  {
    "code": "FR",
    "name": "France",
    "flag": "🇫🇷"
  },
  {
    "code": "FO",
    "name": "Faroe Islands",
    "flag": "🇫🇴",
    "longitude": -6.9118,
    "latitude": 61.8926
  },
  {
    "code": "FM",
    "name": "Micronesia, Federated States of",
    "flag": "🇫🇲",
    "longitude": 150.5508,
    "latitude": 7.4256
  },
  {
    "code": "GA",
    "name": "Gabon",
    "flag": "🇬🇦",
    "longitude": 11.6094,
    "latitude": -0.8037
  },
  {
    "code": "GB",
    "name": "United Kingdom",
    "flag": "🇬🇧"
  },
  {
    "code": "GE",
    "name": "Georgia",
    "flag": "🇬🇪",
    "longitude": 43.3569,
    "latitude": 42.3154
  },
  {
    "code": "GG",
    "name": "Guernsey",
    "flag": "🇬🇬"
  },
  {
    "code": "GH",
    "name": "Ghana",
    "flag": "🇬🇭"
  },
  {
    "code": "GI",
    "name": "Gibraltar",
    "flag": "🇬🇮"
  },
  {
    "code": "GN",
    "name": "Guinea",
    "flag": "🇬🇳"
  },
  {
    "code": "GP",
    "name": "Guadeloupe",
    "flag": "🇬🇵"
  },
  {
    "code": "GM",
    "name": "Gambia",
    "flag": "🇬🇲"
  },
  {
    "code": "GW",
    "name": "Guinea-Bissau",
    "flag": "🇬🇼"
  },
  {
    "code": "GQ",
    "name": "Equatorial Guinea",
    "flag": "🇬🇶"
  },
  {
    "code": "GR",
    "name": "Greece",
    "flag": "🇬🇷"
  },
  {
    "code": "GD",
    "name": "Grenada",
    "flag": "🇬🇩"
  },
  {
    "code": "GL",
    "name": "Greenland",
    "flag": "🇬🇱"
  },
  {
    "code": "GT",
    "name": "Guatemala",
    "flag": "🇬🇹"
  },
  {
    "code": "GF",
    "name": "French Guiana",
    "flag": "🇬🇫"
  },
  {
    "code": "GU",
    "name": "Guam",
    "flag": "🇬🇺"
  },
  {
    "code": "GY",
    "name": "Guyana",
    "flag": "🇬🇾"
  },
  {
    "code": "HK",
    "name": "Hong Kong",
    "flag": "🇭🇰"
  },
  {
    "code": "HM",
    "name": "Heard Island and McDonald Islands",
    "flag": "🇭🇲"
  },
  {
    "code": "HN",
    "name": "Honduras",
    "flag": "🇭🇳"
  },
  {
    "code": "HR",
    "name": "Croatia",
    "flag": "🇭🇷"
  },
  {
    "code": "HT",
    "name": "Haiti",
    "flag": "🇭🇹"
  },
  {
    "code": "HU",
    "name": "Hungary",
    "flag": "🇭🇺"
  },
  {
    "code": "ID",
    "name": "Indonesia",
    "flag": "🇮🇩"
  },
  {
    "code": "IM",
    "name": "Isle of Man",
    "flag": "🇮🇲"
  },
  {
    "code": "IN",
    "name": "India",
    "flag": "🇮🇳"
  },
  {
    "code": "IO",
    "name": "British Indian Ocean Territory",
    "flag": "🇮🇴"
  },
  {
    "code": "IE",
    "name": "Ireland",
    "flag": "🇮🇪"
  },
  {
    "code": "IR",
    "name": "Iran, Islamic Republic of",
    "flag": "🇮🇷"
  },
  {
    "code": "IQ",
    "name": "Iraq",
    "flag": "🇮🇶"
  },
  {
    "code": "IS",
    "name": "Iceland",
    "flag": "🇮🇸"
  },
  {
    "code": "IL",
    "name": "Israel",
    "flag": "🇮🇱"
  },
  {
    "code": "IT",
    "name": "Italy",
    "flag": "🇮🇹"
  },
  {
    "code": "JM",
    "name": "Jamaica",
    "flag": "🇯🇲"
  },
  {
    "code": "JE",
    "name": "Jersey",
    "flag": "🇯🇪"
  },
  {
    "code": "JO",
    "name": "Jordan",
    "flag": "🇯🇴"
  },
  {
    "code": "JP",
    "name": "Japan",
    "flag": "🇯🇵"
  },
  {
    "code": "KZ",
    "name": "Kazakhstan",
    "flag": "🇰🇿"
  },
  {
    "code": "KE",
    "name": "Kenya",
    "flag": "🇰🇪"
  },
  {
    "code": "KG",
    "name": "Kyrgyzstan",
    "flag": "🇰🇬"
  },
  {
    "code": "KH",
    "name": "Cambodia",
    "flag": "🇰🇭"
  },
  {
    "code": "KI",
    "name": "Kiribati",
    "flag": "🇰🇮"
  },
  {
    "code": "KN",
    "name": "Saint Kitts and Nevis",
    "flag": "🇰🇳"
  },
  {
    "code": "KR",
    "name": "Korea, Republic of",
    "flag": "🇰🇷"
  },
  {
    "code": "KW",
    "name": "Kuwait",
    "flag": "🇰🇼"
  },
  {
    "code": "LA",
    "name": "Lao People's Democratic Republic",
    "flag": "🇱🇦"
  },
  {
    "code": "LB",
    "name": "Lebanon",
    "flag": "🇱🇧"
  },
  {
    "code": "LR",
    "name": "Liberia",
    "flag": "🇱🇷"
  },
  {
    "code": "LY",
    "name": "Libya",
    "flag": "🇱🇾"
  },
  {
    "code": "LC",
    "name": "Saint Lucia",
    "flag": "🇱🇨"
  },
  {
    "code": "LI",
    "name": "Liechtenstein",
    "flag": "🇱🇮"
  },
  {
    "code": "LK",
    "name": "Sri Lanka",
    "flag": "🇱🇰"
  },
  {
    "code": "LS",
    "name": "Lesotho",
    "flag": "🇱🇸"
  },
  {
    "code": "LT",
    "name": "Lithuania",
    "flag": "🇱🇹"
  },
  {
    "code": "LU",
    "name": "Luxembourg",
    "flag": "🇱🇺"
  },
  {
    "code": "LV",
    "name": "Latvia",
    "flag": "🇱🇻"
  },
  {
    "code": "MO",
    "name": "Macao",
    "flag": "🇲🇴"
  },
  {
    "code": "MF",
    "name": "Saint Martin (French part)",
    "flag": "🇲🇫"
  },
  {
    "code": "MA",
    "name": "Morocco",
    "flag": "🇲🇦"
  },
  {
    "code": "MC",
    "name": "Monaco",
    "flag": "🇲🇨"
  },
  {
    "code": "MD",
    "name": "Moldova, Republic of",
    "flag": "🇲🇩"
  },
  {
    "code": "MG",
    "name": "Madagascar",
    "flag": "🇲🇬"
  },
  {
    "code": "MV",
    "name": "Maldives",
    "flag": "🇲🇻"
  },
  {
    "code": "MX",
    "name": "Mexico",
    "flag": "🇲🇽"
  },
  {
    "code": "MH",
    "name": "Marshall Islands",
    "flag": "🇲🇭"
  },
  {
    "code": "MK",
    "name": "North Macedonia",
    "flag": "🇲🇰"
  },
  {
    "code": "ML",
    "name": "Mali",
    "flag": "🇲🇱"
  },
  {
    "code": "MT",
    "name": "Malta",
    "flag": "🇲🇹"
  },
  {
    "code": "MM",
    "name": "Myanmar",
    "flag": "🇲🇲"
  },
  {
    "code": "ME",
    "name": "Montenegro",
    "flag": "🇲🇪"
  },
  {
    "code": "MN",
    "name": "Mongolia",
    "flag": "🇲🇳"
  },
  {
    "code": "MP",
    "name": "Northern Mariana Islands",
    "flag": "🇲🇵"
  },
  {
    "code": "MZ",
    "name": "Mozambique",
    "flag": "🇲🇿"
  },
  {
    "code": "MR",
    "name": "Mauritania",
    "flag": "🇲🇷"
  },
  {
    "code": "MS",
    "name": "Montserrat",
    "flag": "🇲🇸"
  },
  {
    "code": "MQ",
    "name": "Martinique",
    "flag": "🇲🇶"
  },
  {
    "code": "MU",
    "name": "Mauritius",
    "flag": "🇲🇺"
  },
  {
    "code": "MW",
    "name": "Malawi",
    "flag": "🇲🇼"
  },
  {
    "code": "MY",
    "name": "Malaysia",
    "flag": "🇲🇾"
  },
  {
    "code": "YT",
    "name": "Mayotte",
    "flag": "🇾🇹"
  },
  {
    "code": "NA",
    "name": "Namibia",
    "flag": "🇳🇦"
  },
  {
    "code": "NC",
    "name": "New Caledonia",
    "flag": "🇳🇨"
  },
  {
    "code": "NE",
    "name": "Niger",
    "flag": "🇳🇪"
  },
  {
    "code": "NF",
    "name": "Norfolk Island",
    "flag": "🇳🇫"
  },
  {
    "code": "NG",
    "name": "Nigeria",
    "flag": "🇳🇬"
  },
  {
    "code": "NI",
    "name": "Nicaragua",
    "flag": "🇳🇮"
  },
  {
    "code": "NU",
    "name": "Niue",
    "flag": "🇳🇺"
  },
  {
    "code": "NL",
    "name": "Netherlands",
    "flag": "🇳🇱"
  },
  {
    "code": "NO",
    "name": "Norway",
    "flag": "🇳🇴"
  },
  {
    "code": "NP",
    "name": "Nepal",
    "flag": "🇳🇵"
  },
  {
    "code": "NR",
    "name": "Nauru",
    "flag": "🇳🇷"
  },
  {
    "code": "NZ",
    "name": "New Zealand",
    "flag": "🇳🇿"
  },
  {
    "code": "OM",
    "name": "Oman",
    "flag": "🇴🇲"
  },
  {
    "code": "PK",
    "name": "Pakistan",
    "flag": "🇵🇰"
  },
  {
    "code": "PA",
    "name": "Panama",
    "flag": "🇵🇦"
  },
  {
    "code": "PN",
    "name": "Pitcairn",
    "flag": "🇵🇳"
  },
  {
    "code": "PE",
    "name": "Peru",
    "flag": "🇵🇪"
  },
  {
    "code": "PH",
    "name": "Philippines",
    "flag": "🇵🇭"
  },
  {
    "code": "PW",
    "name": "Palau",
    "flag": "🇵🇼"
  },
  {
    "code": "PG",
    "name": "Papua New Guinea",
    "flag": "🇵🇬"
  },
  {
    "code": "PL",
    "name": "Poland",
    "flag": "🇵🇱"
  },
  {
    "code": "PR",
    "name": "Puerto Rico",
    "flag": "🇵🇷"
  },
  {
    "code": "KP",
    "name": "Korea, Democratic People's Republic of",
    "flag": "🇰🇵"
  },
  {
    "code": "PT",
    "name": "Portugal",
    "flag": "🇵🇹"
  },
  {
    "code": "PY",
    "name": "Paraguay",
    "flag": "🇵🇾"
  },
  {
    "code": "PS",
    "name": "Palestine, State of",
    "flag": "🇵🇸"
  },
  {
    "code": "PF",
    "name": "French Polynesia",
    "flag": "🇵🇫"
  },
  {
    "code": "QA",
    "name": "Qatar",
    "flag": "🇶🇦"
  },
  {
    "code": "RE",
    "name": "Réunion",
    "flag": "🇷🇪"
  },
  {
    "code": "RO",
    "name": "Romania",
    "flag": "🇷🇴"
  },
  {
    "code": "RU",
    "name": "Russian Federation",
    "flag": "🇷🇺"
  },
  {
    "code": "RW",
    "name": "Rwanda",
    "flag": "🇷🇼"
  },
  {
    "code": "SA",
    "name": "Saudi Arabia",
    "flag": "🇸🇦"
  },
  {
    "code": "SD",
    "name": "Sudan",
    "flag": "🇸🇩"
  },
  {
    "code": "SN",
    "name": "Senegal",
    "flag": "🇸🇳"
  },
  {
    "code": "SG",
    "name": "Singapore",
    "flag": "🇸🇬"
  },
  {
    "code": "GS",
    "name": "South Georgia and the South Sandwich Islands",
    "flag": "🇬🇸"
  },
  {
    "code": "SH",
    "name": "Saint Helena, Ascension and Tristan da Cunha",
    "flag": "🇸🇭"
  },
  {
    "code": "SJ",
    "name": "Svalbard and Jan Mayen",
    "flag": "🇸🇯"
  },
  {
    "code": "SB",
    "name": "Solomon Islands",
    "flag": "🇸🇧"
  },
  {
    "code": "SL",
    "name": "Sierra Leone",
    "flag": "🇸🇱"
  },
  {
    "code": "SV",
    "name": "El Salvador",
    "flag": "🇸🇻"
  },
  {
    "code": "SM",
    "name": "San Marino",
    "flag": "🇸🇲"
  },
  {
    "code": "SO",
    "name": "Somalia",
    "flag": "🇸🇴"
  },
  {
    "code": "PM",
    "name": "Saint Pierre and Miquelon",
    "flag": "🇵🇲"
  },
  {
    "code": "RS",
    "name": "Serbia",
    "flag": "🇷🇸"
  },
  {
    "code": "SS",
    "name": "South Sudan",
    "flag": "🇸🇸"
  },
  {
    "code": "ST",
    "name": "Sao Tome and Principe",
    "flag": "🇸🇹"
  },
  {
    "code": "SR",
    "name": "Suriname",
    "flag": "🇸🇷"
  },
  {
    "code": "SK",
    "name": "Slovakia",
    "flag": "🇸🇰"
  },
  {
    "code": "SI",
    "name": "Slovenia",
    "flag": "🇸🇮"
  },
  {
    "code": "SE",
    "name": "Sweden",
    "flag": "🇸🇪"
  },
  {
    "code": "SZ",
    "name": "Eswatini",
    "flag": "🇸🇿"
  },
  {
    "code": "SX",
    "name": "Sint Maarten (Dutch part)",
    "flag": "🇸🇽"
  },
  {
    "code": "SC",
    "name": "Seychelles",
    "flag": "🇸🇨"
  },
  {
    "code": "SY",
    "name": "Syrian Arab Republic",
    "flag": "🇸🇾"
  },
  {
    "code": "TC",
    "name": "Turks and Caicos Islands",
    "flag": "🇹🇨"
  },
  {
    "code": "TD",
    "name": "Chad",
    "flag": "🇹🇩"
  },
  {
    "code": "TG",
    "name": "Togo",
    "flag": "🇹🇬"
  },
  {
    "code": "TH",
    "name": "Thailand",
    "flag": "🇹🇭"
  },
  {
    "code": "TJ",
    "name": "Tajikistan",
    "flag": "🇹🇯"
  },
  {
    "code": "TK",
    "name": "Tokelau",
    "flag": "🇹🇰"
  },
  {
    "code": "TM",
    "name": "Turkmenistan",
    "flag": "🇹🇲"
  },
  {
    "code": "TL",
    "name": "Timor-Leste",
    "flag": "🇹🇱"
  },
  {
    "code": "TO",
    "name": "Tonga",
    "flag": "🇹🇴"
  },
  {
    "code": "TT",
    "name": "Trinidad and Tobago",
    "flag": "🇹🇹"
  },
  {
    "code": "TN",
    "name": "Tunisia",
    "flag": "🇹🇳"
  },
  {
    "code": "TR",
    "name": "Turkey",
    "flag": "🇹🇷"
  },
  {
    "code": "TV",
    "name": "Tuvalu",
    "flag": "🇹🇻"
  },
  {
    "code": "TW",
    "name": "Taiwan, Province of China",
    "flag": "🇹🇼"
  },
  {
    "code": "TZ",
    "name": "Tanzania, United Republic of",
    "flag": "🇹🇿"
  },
  {
    "code": "UG",
    "name": "Uganda",
    "flag": "🇺🇬"
  },
  {
    "code": "UA",
    "name": "Ukraine",
    "flag": "🇺🇦"
  },
  {
    "code": "UM",
    "name": "United States Minor Outlying Islands",
    "flag": "🇺🇲"
  },
  {
    "code": "UY",
    "name": "Uruguay",
    "flag": "🇺🇾"
  },
  {
    "code": "US",
    "name": "United States",
    "flag": "🇺🇸"
  },
  {
    "code": "UZ",
    "name": "Uzbekistan",
    "flag": "🇺🇿"
  },
  {
    "code": "VA",
    "name": "Holy See (Vatican City State)",
    "flag": "🇻🇦"
  },
  {
    "code": "VC",
    "name": "Saint Vincent and the Grenadines",
    "flag": "🇻🇨"
  },
  {
    "code": "VE",
    "name": "Venezuela, Bolivarian Republic of",
    "flag": "🇻🇪"
  },
  {
    "code": "VG",
    "name": "Virgin Islands, British",
    "flag": "🇻🇬"
  },
  {
    "code": "VI",
    "name": "Virgin Islands, U.S.",
    "flag": "🇻🇮"
  },
  {
    "code": "VN",
    "name": "Viet Nam",
    "flag": "🇻🇳"
  },
  {
    "code": "VU",
    "name": "Vanuatu",
    "flag": "🇻🇺"
  },
  {
    "code": "WF",
    "name": "Wallis and Futuna",
    "flag": "🇼🇫"
  },
  {
    "code": "WS",
    "name": "Samoa",
    "flag": "🇼🇸"
  },
  {
    "code": "YE",
    "name": "Yemen",
    "flag": "🇾🇪"
  },
  {
    "code": "ZA",
    "name": "South Africa",
    "flag": "🇿🇦"
  },
  {
    "code": "ZM",
    "name": "Zambia",
    "flag": "🇿🇲"
  },
  {
    "code": "ZW",
    "name": "Zimbabwe",
    "flag": "🇿🇼"
  }
];

const CountryForm = React.memo(({ 
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
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editId: string | null;
  viewOnly: boolean;
  error: string | null;
}) => {
  const [inputValue, setInputValue] = useState('');
  
  const selectedCountry = countriesList.find(country => 
    country.name.toLowerCase() === form.name?.toLowerCase() || 
    country.code.toLowerCase() === form.code?.toLowerCase()
  ) || null;
  
  console.log('Form data:', form);
  console.log('Selected country:', selectedCountry);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={onSubmit}>
        <DialogTitle>{editId ? (viewOnly ? 'View' : 'Edit') : 'Add'} Country</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          <Autocomplete
            id="country-select"
            options={countriesList}
            autoHighlight
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => 
              option.code === value.code || 
              option.name.toLowerCase() === value.name?.toLowerCase()
            }
            value={selectedCountry}
            onChange={async (event, newValue) => {
              if (newValue) {
                try {
                  // Get the full country data from the countriesList
                  const selectedCountryData = countriesList.find(
                    country => country.code === newValue.code
                  ) || newValue;
                  
                  // Use the coordinates from the country data or default to 0,0
                  let longitude = selectedCountryData.longitude || 0;
                  let latitude = selectedCountryData.latitude || 0;
                  
                  // Only try to fetch coordinates if we don't have them
                  if ((!longitude || !latitude) && newValue.code) {
                    try {
                      const response = await fetch(`https://restcountries.com/v3.1/alpha/${newValue.code.toLowerCase()}`);
                      if (response.ok) {
                        const countryData = await response.json();
                        if (countryData && countryData[0]?.latlng) {
                          [latitude, longitude] = countryData[0].latlng;
                        }
                      }
                    } catch (error) {
                      console.error('Error fetching country coordinates:', error);
                    }
                  }
                  
                  setForm({
                    ...form,
                    name: newValue.name,
                    code: newValue.code,
                    slug: newValue.name.toLowerCase().replace(/\s+/g, '-'),
                    longitude: longitude,
                    latitude: latitude
                  });
                } catch (error) {
                  console.error('Error processing country selection:', error);
                  // Fallback to default values if there's an error
                  setForm({
                    ...form,
                    name: newValue.name,
                    code: newValue.code,
                    slug: newValue.name.toLowerCase().replace(/\s+/g, '-'),
                    longitude: 0,
                    latitude: 0
                  });
                }
              } else {
                setForm({
                  ...form,
                  name: '',
                  code: '',
                  slug: '',
                  longitude: 0,
                  latitude: 0
                });
              }
            }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <Box 
                  component="li" 
                  key={key}
                  sx={{ '& > img': { mr: 2, flexShrink: 0 } }} 
                  {...otherProps}
                >
                  <span style={{ marginRight: 10 }}>{option.flag}</span>
                  {option.name} ({option.code})
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Choose a country"
                margin="dense"
                variant="outlined"
                required
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            disabled={viewOnly || submitting}
            sx={{ mb: 2 }}
          />
        <TextField
          margin="dense"
          label="Country Code (2-3 letters)"
          type="text"
          fullWidth
          variant="outlined"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          name="code"
          disabled={viewOnly || submitting}
          inputProps={{ maxLength: 3, minLength: 2 }}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Slug (auto-generated if empty)"
          type="text"
          fullWidth
          variant="outlined"
          value={form.slug || ''}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          onBlur={(e) => {
            if (!e.target.value && form.name) {
              setForm({ ...form, slug: form.name.toLowerCase().replace(/\s+/g, '-') });
            }
          }}
          name="slug"
          disabled={viewOnly || submitting}
          helperText="Leave empty to auto-generate from name"
        />
        <Box display="flex" gap={2} mt={2}>
          <TextField
            margin="dense"
            label="Longitude"
            type="number"
            fullWidth
            variant="outlined"
            value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })}
            name="longitude"
            disabled={viewOnly || submitting}
            inputProps={{ step: "0.000001" }}
          />
          <TextField
            margin="dense"
            label="Latitude"
            type="number"
            fullWidth
            variant="outlined"
            value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })}
            name="latitude"
            disabled={viewOnly || submitting}
            inputProps={{ step: "0.000001" }}
          />
        </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          {!viewOnly && (
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Saving...' : editId ? 'Update' : 'Save'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
});

CountryForm.displayName = 'CountryForm';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ApiResponse<T = unknown> {
  data?: T;
  total?: number;
  error?: boolean;
  message?: string;
}

function getCountryPagePermission() {
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

export default function CountryPage() {
  const [pageAccess, setPageAccess] = useState<'all access' | 'only view' | 'no access'>('no access');
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  
  const initialFormState = useMemo<FormState>(() => ({
    name: '', 
    code: '', 
    slug: '',
    longitude: 0,
    latitude: 0
  }), []);
  
  const [form, setForm] = useState<FormState>(initialFormState);
  const [openForm, setOpenForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const itemsPerPage = 10;
  const viewOnly = pageAccess === 'only view';
  const noAccess = pageAccess === 'no access';

  // Add debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Update debounced search term after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to first page when search term changes
      if (searchTerm !== debouncedSearchTerm) {
        setPage(1);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/countries';
      
      // Use the search endpoint if there's a search term
      if (debouncedSearchTerm.trim()) {
        url = `/countries/search/${encodeURIComponent(debouncedSearchTerm.trim())}`;
      } else {
        // For the main listing, use pagination
        url = `/countries?page=${page}&limit=${itemsPerPage}`;
      }

      const response = await apiFetch(url);
      const result = await response.json();
      
      if (debouncedSearchTerm.trim()) {
        // Handle search response
        if (result.status === 1 && Array.isArray(result.data)) {
          setCountries(result.data);
          setTotalPages(1); // Search results are not paginated
        } else {
          setCountries([]);
        }
      } else {
        // Handle normal paginated response
        if (result.status === 'success' && result.data && Array.isArray(result.data.countries)) {
          setCountries(result.data.countries);
          setTotalPages(Math.ceil((result.data.pagination?.total || 0) / itemsPerPage));
        } else {
          setCountries([]);
        }
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load countries',
        severity: 'error',
      });
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, debouncedSearchTerm]);

  useEffect(() => {
    setPageAccess(getCountryPagePermission());
    if (!noAccess) {
      fetchCountries();
    }
  }, [noAccess, fetchCountries]);

  const handleOpenForm = useCallback((country: Country | null = null) => {
    if (viewOnly) return;
    
    if (country) {
      setForm({
        name: country.name,
        code: country.code,
        slug: country.slug || '',
        longitude: country.longitude || 0,
        latitude: country.latitude || 0
      });
      setEditId(country._id || null);
      setOpenForm(true);
    } else {
      setForm(initialFormState);
      setEditId(null);
      setOpenForm(true);
    }
  }, [viewOnly, initialFormState]);

  const handleCloseForm = useCallback(() => {
    setForm(initialFormState);
    setEditId(null);
    setError(null);
    setOpenForm(false);
  }, [initialFormState]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (viewOnly) return;
    
    if (!form.name || !form.code) {
      setError('Name and code are required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const url = editId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/countries/${editId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/countries`;
      
      const method = editId ? 'PUT' : 'POST';
      
      const response = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
          longitude: Number(form.longitude) || 0,
          latitude: Number(form.latitude) || 0
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save country');
      }

      setSnackbar({
        open: true,
        message: editId ? 'Country updated successfully' : 'Country added successfully',
        severity: 'success'
      });
      
      fetchCountries();
      handleCloseForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  }, [editId, form, fetchCountries, handleCloseForm, viewOnly]);

  const handleAddClick = useCallback(() => {
    if (viewOnly) return;
    setEditId(null);
    setForm(initialFormState);
    handleOpenForm();
  }, [viewOnly, handleOpenForm, initialFormState]);

  const handleDeleteClick = useCallback((id: string) => {
    if (viewOnly) return;
    setDeleteId(id);
    setDeleteError(null);
  }, [viewOnly]);

  const handleCloseDeleteDialog = () => {
    setDeleteId(null);
    setDeleteError(null);
  };

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    
    try {
      setSubmitting(true);
      setDeleteError(null);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/countries/${deleteId}`, { 
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.NEXT_PUBLIC_API_KEY_NAME && process.env.NEXT_PUBLIC_API_SECRET_KEY ? {
            [process.env.NEXT_PUBLIC_API_KEY_NAME]: process.env.NEXT_PUBLIC_API_SECRET_KEY
          } : {})
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSnackbar({
          open: true,
          message: data.message || 'Country deleted successfully',
          severity: 'success'
        });
        setDeleteId(null);
        fetchCountries();
        return;
      }
      
      let errorMessage = data?.message || 'Failed to delete country';
      
      if (res.status === 400 && errorMessage.includes('being used by other records')) {
        errorMessage = 'Cannot delete country because it is being used by other records (states, cities, or locations)';
      }
      
      setDeleteError(errorMessage);
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      
    } catch (error) {
      console.error('Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting the country';
      setDeleteError(errorMessage);
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  }, [deleteId, fetchCountries]);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // handleChange function removed as it was not being used

  if (noAccess) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error">You don&apos;t have permission to view this page.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link color="inherit" href="/dashboard" style={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Typography color="text.primary">Countries</Typography>
      </Breadcrumbs>

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center">
              <PublicIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h5" component="div">
                Countries
              </Typography>
            </Box>
            {!viewOnly && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleAddClick}
                startIcon={<EditIcon />}
              >
                Add Country
              </Button>
            )}
          </Box>

          <Box mb={3}>
            <TextField
              label="Search countries"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              placeholder="Search by name..."
              sx={{ maxWidth: 400 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchTerm('');
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                )
              }}
            />
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : countries.length === 0 ? (
            <Box p={3} textAlign="center">
              <Typography>No countries found</Typography>
              {!viewOnly && (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={handleAddClick}
                  sx={{ mt: 2 }}
                >
                  Add your first country
                </Button>
              )}
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: 16 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: 16 }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: 16 }}>Slug</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: 16 }}>Longitude</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: 16 }}>Latitude</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: 16 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {countries.map((country) => (
                      <CountryRow 
                        key={country._id} 
                        country={country} 
                        onEdit={handleOpenForm}
                        onDelete={handleDeleteClick}
                        viewOnly={viewOnly}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={(_, value) => setPage(value)} 
                    color="primary" 
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CountryForm
        open={openForm}
        onClose={handleCloseForm}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        editId={editId}
        viewOnly={viewOnly}
        error={error}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={!!deleteId}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Country</DialogTitle>
        <DialogContent>
          {deleteError ? (
            <Typography color="error">{deleteError}</Typography>
          ) : (
            <Typography>Are you sure you want to delete this country? This action cannot be undone.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            disabled={submitting || !!deleteError}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
