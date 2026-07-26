export type ZoneType = 'public' | 'private';

export type RecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS' | 'PTR' | 'SRV' | 'CAA' | 'SOA';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface HostedZone {
  id: string;
  domain_name: string;
  description: string | null;
  type: ZoneType;
  record_count: number;
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
}

export interface DNSRecordCreate {
  name: string;
  type: RecordType;
  value: string;
  ttl?: number;
  priority?: number;
}

export interface DNSRecordUpdate {
  value?: string;
  ttl?: number;
  priority?: number | null;
}
