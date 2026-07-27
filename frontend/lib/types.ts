export type ZoneType = 'public' | 'private';

export type RecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS' | 'PTR' | 'SRV' | 'CAA' | 'SOA';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface HostedZone {
  id: string;
  domain_name: string;
  description: string | null;
  type: ZoneType;
  record_count: number;
  tags?: TagItem[];
  created_at: string;
  updated_at: string;
}

export interface DNSRecord {
  id: string;
  hosted_zone_id: string;
  name: string;
  type: RecordType;
  value: string;
  ttl: number;
  priority: number | null;
  alias: boolean;
  routing_policy: string;
  created_at: string;
  updated_at: string;
}

export interface HostedZonePage {
  items: HostedZone[];
  total: number;
  page: number;
  page_size: number;
}

export interface DNSRecordPage {
  items: DNSRecord[];
  total: number;
  page: number;
  page_size: number;
}

export interface TagItem {
  key: string;
  value: string;
}

export interface HostedZoneCreate {
  domain_name: string;
  description?: string;
  type?: ZoneType;
  tags?: TagItem[];
}

export interface HostedZoneUpdate {
  description?: string;
  type?: ZoneType;
  tags?: TagItem[];
}

export interface DNSRecordCreate {
  name: string;
  type: RecordType;
  value: string;
  ttl?: number;
  priority?: number;
  alias?: boolean;
  routing_policy?: string;
}

export interface DNSRecordUpdate {
  name?: string;
  type?: RecordType;
  value?: string;
  ttl?: number;
  priority?: number | null;
  alias?: boolean;
  routing_policy?: string;
  region?: string;
  failure_type?: string;
}
