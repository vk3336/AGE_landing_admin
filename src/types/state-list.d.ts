declare module 'state-list' {
  interface StateInfo {
    name: string;
    state_code: string;
  }

  interface CountryInfo {
    name: string;
    iso2: string;
    states: StateInfo[];
  }

  const states: Record<string, CountryInfo>;
  export = states;
}
