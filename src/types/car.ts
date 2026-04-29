export type EraName =
  | 'Origins'
  | 'Brass Era'
  | 'Interwar'
  | 'WWII'
  | 'Postwar'
  | 'Jet Age'
  | 'Transition'
  | 'Modern Classic';

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type ReviewStatus = 'pending' | 'in_review' | 'reviewed' | 'approved';
export type SelectionBasis =
  | 'production_start'
  | 'public_debut'
  | 'patent_registration'
  | 'motorsport_breakthrough'
  | 'cultural_breakthrough';

export interface AlternateCar {
  name: string;
  manufacturer: string;
  reason: string;
}

export interface CarRecord {
  year: number;
  hero_car_name: string;
  manufacturer: string;
  country: string;
  era: EraName;
  category: string;
  production_start_year: number;
  production_end_year: number | null;
  exact_date: string | null;
  date_precision: 'year' | 'month' | 'day';
  selection_basis: SelectionBasis;
  why_this_year: string;
  why_iconic: string;
  verified_facts: string[];
  historical_context: string;
  short_description: string;
  long_description: string;
  source_urls: { title: string; url: string; tier: number }[];
  image_url: string;
  image_license: string;
  image_creator: string;
  image_attribution_url: string;
  alternate_cars: AlternateCar[];
  confidence_level: ConfidenceLevel;
  review_status: ReviewStatus;
}
