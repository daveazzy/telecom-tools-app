// User Types
export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// Signal Measurement Types
export interface SignalMeasurement {
  id: number;
  user_id: number;
  latitude: number;
  longitude: number;
  altitude?: number;
  signal_type: '4g' | '5g' | 'wifi';
  operator?: string;
  signal_strength_dbm: number;
  signal_quality?: number;
  frequency_mhz?: number;
  technology?: string;
  cell_id?: string;
  measured_at: string;
  created_at: string;
}

export interface SignalMeasurementCreate {
  latitude: number;
  longitude: number;
  altitude?: number;
  signal_type: '4g' | '5g' | 'wifi';
  operator?: string;
  signal_strength_dbm: number;
  signal_quality?: number;
  frequency_mhz?: number;
  technology?: string;
  cell_id?: string;
  measured_at: string;
}

export interface HeatmapDataPoint {
  lat: number;
  lon: number;
  signal_dbm: number;
  quality?: number;
  operator?: string;
}

export interface CoverageStatistics {
  total_measurements: number;
  average_signal_dbm?: number;
  median_signal_dbm?: number;
  min_signal_dbm?: number;
  max_signal_dbm?: number;
  std_deviation?: number;
  coverage_percentage: number;
  good_signal_count: number;
  poor_signal_count: number;
}

// Tower Types
export interface Tower {
  id: number;
  latitude: number;
  longitude: number;
  altitude?: number;
  operator: string;
  cell_id: string;
  technology?: string;
  frequency_mhz?: number;
  opencellid_id?: string;
  anatel_code?: string;
  created_at: string;
  updated_at?: string;
}

export interface TowerCreate {
  latitude: number;
  longitude: number;
  altitude?: number;
  operator: string;
  cell_id: string;
  technology?: string;
  frequency_mhz?: number;
}

// RF Calculation Types
export interface LinkBudgetRequest {
  tx_power_dbm: number;
  tx_gain_dbi: number;
  rx_gain_dbi: number;
  frequency_mhz: number;
  distance_km: number;
  additional_losses_db?: number;
  rx_sensitivity_dbm?: number;
}

export interface LinkBudgetResponse {
  received_power_dbm: number;
  path_loss_db: number;
  free_space_loss_db: number;
  eirp_dbm: number;
  total_gain_db: number;
  link_margin_db: number;
  is_viable: boolean;
  fade_margin_db: number;
}

export interface PathLossRequest {
  frequency_mhz: number;
  distance_km: number;
  tx_height_m?: number;
  rx_height_m?: number;
  environment?: 'urban' | 'suburban' | 'rural';
}

export interface PathLossResponse {
  path_loss_db: number;
  model_used: string;
  parameters: Record<string, any>;
}

// Report Types
export interface Report {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  report_type: string;
  data: Record<string, any>;
  pdf_path?: string;
  csv_path?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface ReportCreate {
  title: string;
  description?: string;
  report_type: string;
  data: Record<string, any>;
}

// Speed Test Types
export interface SpeedTest {
  id: number;
  user_id: number;
  latitude?: number;
  longitude?: number;
  download_mbps: number;
  upload_mbps: number;
  ping_ms: number;
  jitter_ms?: number;
  packet_loss_percent?: number;
  connection_type?: string;
  isp?: string;
  signal_strength_dbm?: number;
  operator?: string;
  tested_at: string;
  created_at: string;
}

export interface SpeedTestCreate {
  latitude?: number;
  longitude?: number;
  download_mbps: number;
  upload_mbps: number;
  ping_ms: number;
  jitter_ms?: number;
  packet_loss_percent?: number;
  connection_type?: string;
  isp?: string;
  signal_strength_dbm?: number;
  operator?: string;
  tested_at: string;
}

export interface SpeedTestStatistics {
  total_tests: number;
  avg_download_mbps: number;
  avg_upload_mbps: number;
  avg_ping_ms: number;
  max_download_mbps: number;
  max_upload_mbps: number;
  min_ping_ms: number;
  by_connection_type: Record<string, any>;
}

