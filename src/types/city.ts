export interface CityFormData {
  _id?: string;
  name: string;
  slug: string;
  pincode: string;
  country: string;
  state: string;
  country_name?: string;
  state_name?: string;
}

export interface CityOption {
  name: string;
  state: string;
  pincode: string;
}

export interface CountryOption {
  _id: string;
  name: string;
  slug: string;
}

export interface StateOption {
  _id: string;
  name: string;
  slug: string;
  country: string;
}
