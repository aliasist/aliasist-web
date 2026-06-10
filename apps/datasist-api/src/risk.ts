export interface CountryRisk {
  country: string;
  iso_a3: string;
  water_stress_score: number;
  water_stress_label: string;
}

export const WATER_STRESS_DATA: CountryRisk[] = [
  { country: "Bahrain", iso_a3: "BHR", water_stress_score: 5.0, water_stress_label: "Extremely High" },
  { country: "Cyprus", iso_a3: "CYP", water_stress_score: 5.0, water_stress_label: "Extremely High" },
  { country: "Kuwait", iso_a3: "KWT", water_stress_score: 5.0, water_stress_label: "Extremely High" },
  { country: "Lebanon", iso_a3: "LBN", water_stress_score: 5.0, water_stress_label: "Extremely High" },
  { country: "Oman", iso_a3: "OMN", water_stress_score: 5.0, water_stress_label: "Extremely High" },
  { country: "Qatar", iso_a3: "QAT", water_stress_score: 5.0, water_stress_label: "Extremely High" },
  { country: "United Arab Emirates", iso_a3: "ARE", water_stress_score: 4.91, water_stress_label: "Extremely High" },
  { country: "Saudi Arabia", iso_a3: "SAU", water_stress_score: 4.83, water_stress_label: "Extremely High" },
  { country: "Israel", iso_a3: "ISR", water_stress_score: 4.82, water_stress_label: "Extremely High" },
  { country: "Egypt", iso_a3: "EGY", water_stress_score: 4.81, water_stress_label: "Extremely High" },
  { country: "Libya", iso_a3: "LBY", water_stress_score: 4.77, water_stress_label: "Extremely High" },
  { country: "Yemen", iso_a3: "YEM", water_stress_score: 4.74, water_stress_label: "Extremely High" },
  { country: "Jordan", iso_a3: "JOR", water_stress_score: 4.71, water_stress_label: "Extremely High" },
  { country: "Tunisia", iso_a3: "TUN", water_stress_score: 4.66, water_stress_label: "Extremely High" },
  { country: "Iraq", iso_a3: "IRQ", water_stress_score: 4.65, water_stress_label: "Extremely High" },
  { country: "Algeria", iso_a3: "DZA", water_stress_score: 4.58, water_stress_label: "Extremely High" },
  { country: "Syria", iso_a3: "SYR", water_stress_score: 4.51, water_stress_label: "Extremely High" },
  { country: "Morocco", iso_a3: "MAR", water_stress_score: 4.43, water_stress_label: "Extremely High" },
  { country: "Belgium", iso_a3: "BEL", water_stress_score: 4.32, water_stress_label: "Extremely High" },
  { country: "Greece", iso_a3: "GRC", water_stress_score: 4.3, water_stress_label: "Extremely High" },
  { country: "India", iso_a3: "IND", water_stress_score: 4.21, water_stress_label: "Extremely High" },
  { country: "Pakistan", iso_a3: "PAK", water_stress_score: 4.05, water_stress_label: "Extremely High" },
  { country: "Mexico", iso_a3: "MEX", water_stress_score: 4.0, water_stress_label: "Extremely High" },
  { country: "Chile", iso_a3: "CHL", water_stress_score: 4.0, water_stress_label: "Extremely High" },
  { country: "United States", iso_a3: "USA", water_stress_score: 1.53, water_stress_label: "Low-Medium" },
  { country: "China", iso_a3: "CHN", water_stress_score: 2.3, water_stress_label: "Medium-High" },
  { country: "Brazil", iso_a3: "BRA", water_stress_score: 0.5, water_stress_label: "Low" },
  { country: "Australia", iso_a3: "AUS", water_stress_score: 3.1, water_stress_label: "High" },
  { country: "United Kingdom", iso_a3: "GBR", water_stress_score: 1.2, water_stress_label: "Low-Medium" },
  { country: "Germany", iso_a3: "DEU", water_stress_score: 1.4, water_stress_label: "Low-Medium" },
  { country: "Japan", iso_a3: "JPN", water_stress_score: 2.1, water_stress_label: "Medium-High" },
  { country: "South Africa", iso_a3: "ZAF", water_stress_score: 3.8, water_stress_label: "High" },
];

export function getRiskByCountry(nameOrIso: string) {
  return WATER_STRESS_DATA.find(d => 
    d.country.toLowerCase() === nameOrIso.toLowerCase() || 
    d.iso_a3.toLowerCase() === nameOrIso.toLowerCase()
  );
}
