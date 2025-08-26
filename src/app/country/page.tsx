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

interface Country {
  _id?: string;
  name: string;
  code: string;
  slug?: string;
  flag?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

type FormState = Required<Pick<Country, 'name' | 'code' | 'slug'>>;

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

const countriesList = [
    {
    "code": "AW",
    "name": "Aruba",
    "flag": "🇦🇼"
  },
  {
    "code": "AF",
    "name": "Afghanistan",
    "flag": "🇦🇫"
  },
  {
    "code": "AO",
    "name": "Angola",
    "flag": "🇦🇴"
  },
  {
    "code": "AI",
    "name": "Anguilla",
    "flag": "🇦🇮"
  },
  {
    "code": "AX",
    "name": "Åland Islands",
    "flag": "🇦🇽"
  },
  {
    "code": "AL",
    "name": "Albania",
    "flag": "🇦🇱"
  },
  {
    "code": "AD",
    "name": "Andorra",
    "flag": "🇦🇩"
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
    "flag": "🇦🇲"
  },
  {
    "code": "AS",
    "name": "American Samoa",
    "flag": "🇦🇸"
  },
  {
    "code": "AQ",
    "name": "Antarctica",
    "flag": "🇦🇶"
  },
  {
    "code": "TF",
    "name": "French Southern Territories",
    "flag": "🇹🇫"
  },
  {
    "code": "AG",
    "name": "Antigua and Barbuda",
    "flag": "🇦🇬"
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
    "flag": "🇦🇿"
  },
  {
    "code": "BI",
    "name": "Burundi",
    "flag": "🇧🇮"
  },
  {
    "code": "BE",
    "name": "Belgium",
    "flag": "🇧🇪"
  },
  {
    "code": "BJ",
    "name": "Benin",
    "flag": "🇧🇯"
  },
  {
    "code": "BQ",
    "name": "Bonaire, Sint Eustatius and Saba",
    "flag": "🇧🇶"
  },
  {
    "code": "BF",
    "name": "Burkina Faso",
    "flag": "🇧🇫"
  },
  {
    "code": "BD",
    "name": "Bangladesh",
    "flag": "🇧🇩"
  },
  {
    "code": "BG",
    "name": "Bulgaria",
    "flag": "🇧🇬"
  },
  {
    "code": "BH",
    "name": "Bahrain",
    "flag": "🇧🇭"
  },
  {
    "code": "BS",
    "name": "Bahamas",
    "flag": "🇧🇸"
  },
  {
    "code": "BA",
    "name": "Bosnia and Herzegovina",
    "flag": "🇧🇦"
  },
  {
    "code": "BL",
    "name": "Saint Barthélemy",
    "flag": "🇧🇱"
  },
  {
    "code": "BY",
    "name": "Belarus",
    "flag": "🇧🇾"
  },
  {
    "code": "BZ",
    "name": "Belize",
    "flag": "🇧🇿"
  },
  {
    "code": "BM",
    "name": "Bermuda",
    "flag": "🇧🇲"
  },
  {
    "code": "BO",
    "name": "Bolivia, Plurinational State of",
    "flag": "🇧🇴"
  },
  {
    "code": "BR",
    "name": "Brazil",
    "flag": "🇧🇷"
  },
  {
    "code": "BB",
    "name": "Barbados",
    "flag": "🇧🇧"
  },
  {
    "code": "BN",
    "name": "Brunei Darussalam",
    "flag": "🇧🇳"
  },
  {
    "code": "BT",
    "name": "Bhutan",
    "flag": "🇧🇹"
  },
  {
    "code": "BV",
    "name": "Bouvet Island",
    "flag": "🇧🇻"
  },
  {
    "code": "BW",
    "name": "Botswana",
    "flag": "🇧🇼"
  },
  {
    "code": "CF",
    "name": "Central African Republic",
    "flag": "🇨🇫"
  },
  {
    "code": "CA",
    "name": "Canada",
    "flag": "🇨🇦"
  },
  {
    "code": "CC",
    "name": "Cocos (Keeling) Islands",
    "flag": "🇨🇨"
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
    "flag": "🇨🇮"
  },
  {
    "code": "CM",
    "name": "Cameroon",
    "flag": "🇨🇲"
  },
  {
    "code": "CD",
    "name": "Congo, The Democratic Republic of the",
    "flag": "🇨🇩"
  },
  {
    "code": "CG",
    "name": "Congo",
    "flag": "🇨🇬"
  },
  {
    "code": "CK",
    "name": "Cook Islands",
    "flag": "🇨🇰"
  },
  {
    "code": "CO",
    "name": "Colombia",
    "flag": "🇨🇴"
  },
  {
    "code": "KM",
    "name": "Comoros",
    "flag": "🇰🇲"
  },
  {
    "code": "CV",
    "name": "Cabo Verde",
    "flag": "🇨🇻"
  },
  {
    "code": "CR",
    "name": "Costa Rica",
    "flag": "🇨🇷"
  },
  {
    "code": "CU",
    "name": "Cuba",
    "flag": "🇨🇺"
  },
  {
    "code": "CW",
    "name": "Curaçao",
    "flag": "🇨🇼"
  },
  {
    "code": "CX",
    "name": "Christmas Island",
    "flag": "🇨🇽"
  },
  {
    "code": "KY",
    "name": "Cayman Islands",
    "flag": "🇰🇾"
  },
  {
    "code": "CY",
    "name": "Cyprus",
    "flag": "🇨🇾"
  },
  {
    "code": "CZ",
    "name": "Czechia",
    "flag": "🇨🇿"
  },
  {
    "code": "DE",
    "name": "Germany",
    "flag": "🇩🇪"
  },
  {
    "code": "DJ",
    "name": "Djibouti",
    "flag": "🇩🇯"
  },
  {
    "code": "DM",
    "name": "Dominica",
    "flag": "🇩🇲"
  },
  {
    "code": "DK",
    "name": "Denmark",
    "flag": "🇩🇰"
  },
  {
    "code": "DO",
    "name": "Dominican Republic",
    "flag": "🇩🇴"
  },
  {
    "code": "DZ",
    "name": "Algeria",
    "flag": "🇩🇿"
  },
  {
    "code": "EC",
    "name": "Ecuador",
    "flag": "🇪🇨"
  },
  {
    "code": "EG",
    "name": "Egypt",
    "flag": "🇪🇬"
  },
  {
    "code": "ER",
    "name": "Eritrea",
    "flag": "🇪🇷"
  },
  {
    "code": "EH",
    "name": "Western Sahara",
    "flag": "🇪🇭"
  },
  {
    "code": "ES",
    "name": "Spain",
    "flag": "🇪🇸"
  },
  {
    "code": "EE",
    "name": "Estonia",
    "flag": "🇪🇪"
  },
  {
    "code": "ET",
    "name": "Ethiopia",
    "flag": "🇪🇹"
  },
  {
    "code": "FI",
    "name": "Finland",
    "flag": "🇫🇮"
  },
  {
    "code": "FJ",
    "name": "Fiji",
    "flag": "🇫🇯"
  },
  {
    "code": "FK",
    "name": "Falkland Islands (Malvinas)",
    "flag": "🇫🇰"
  },
  {
    "code": "FR",
    "name": "France",
    "flag": "🇫🇷"
  },
  {
    "code": "FO",
    "name": "Faroe Islands",
    "flag": "🇫🇴"
  },
  {
    "code": "FM",
    "name": "Micronesia, Federated States of",
    "flag": "🇫🇲"
  },
  {
    "code": "GA",
    "name": "Gabon",
    "flag": "🇬🇦"
  },
  {
    "code": "GB",
    "name": "United Kingdom",
    "flag": "🇬🇧"
  },
  {
    "code": "GE",
    "name": "Georgia",
    "flag": "🇬🇪"
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
            onChange={(event, newValue) => {
              if (newValue) {
                setForm({
                  ...form,
                  name: newValue.name,
                  code: newValue.code,
                  slug: newValue.name.toLowerCase().replace(/\s+/g, '-')
                });
              } else {
                setForm({
                  ...form,
                  name: '',
                  code: '',
                  slug: ''
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
    slug: ''
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

  const fetchCountries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/countries?page=${page}&limit=${itemsPerPage}${searchTerm ? `&search=${searchTerm}` : ''}`
      );
      const result = await response.json();
      
      if (result && result.status === 'success' && result.data && Array.isArray(result.data.countries)) {
        setCountries(result.data.countries);
        setTotalPages(Math.ceil(result.results / itemsPerPage));
      } else {
        console.error('Unexpected API response format:', result);
        setCountries([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load countries',
        severity: 'error',
      });
      setCountries([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, itemsPerPage, searchTerm]);

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
        slug: country.slug || ''
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
          slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-')
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
                setPage(1);
              }}
              placeholder="Search by name or code..."
              sx={{ maxWidth: 400 }}
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
                      <TableCell>Name</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell>Slug</TableCell>
                      <TableCell>Actions</TableCell>
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
