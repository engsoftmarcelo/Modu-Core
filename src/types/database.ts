export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamps = {
  created_at: string;
  updated_at: string;
};

type OrganizationRow = Timestamps & {
  id: string;
  name: string;
  slug: string;
  business_model: Database["public"]["Enums"]["business_model"];
};

type UserRow = Timestamps & {
  id: string;
  organization_id: string;
  full_name: string;
  role: "owner" | "admin" | "member";
};

type CustomerRow = Timestamps & {
  id: string;
  organization_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  notes: string | null;
  status: "active" | "inactive";
};

type LeadRow = Timestamps & {
  id: string;
  organization_id: string;
  owner_id: string | null;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: "new" | "contacted" | "qualified" | "won" | "lost";
  estimated_value: number;
  notes: string | null;
};

type TaskRow = Timestamps & {
  id: string;
  organization_id: string;
  assignee_id: string | null;
  customer_id: string | null;
  lead_id: string | null;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high";
  due_at: string | null;
};

type AppointmentRow = Timestamps & {
  id: string;
  organization_id: string;
  customer_id: string | null;
  title: string;
  starts_at: string;
  ends_at: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  location: string | null;
  notes: string | null;
};

type ProposalRow = Timestamps & {
  id: string;
  organization_id: string;
  customer_id: string | null;
  title: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  valid_until: string | null;
  subtotal: number;
  discount: number;
  total: number;
  notes: string | null;
};

type ServiceRow = Timestamps & {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number | null;
  active: boolean;
};

type TableDefinition<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      organizations: TableDefinition<
        OrganizationRow,
        {
          id?: string;
          name: string;
          slug: string;
          business_model?: Database["public"]["Enums"]["business_model"];
          created_at?: string;
          updated_at?: string;
        }
      >;
      users: TableDefinition<
        UserRow,
        {
          id: string;
          organization_id: string;
          full_name: string;
          role?: "owner" | "admin" | "member";
          created_at?: string;
          updated_at?: string;
        }
      >;
      customers: TableDefinition<
        CustomerRow,
        {
          id?: string;
          organization_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          document?: string | null;
          notes?: string | null;
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        }
      >;
      leads: TableDefinition<
        LeadRow,
        {
          id?: string;
          organization_id: string;
          owner_id?: string | null;
          name: string;
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          source?: string | null;
          status?: "new" | "contacted" | "qualified" | "won" | "lost";
          estimated_value?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      tasks: TableDefinition<
        TaskRow,
        {
          id?: string;
          organization_id: string;
          assignee_id?: string | null;
          customer_id?: string | null;
          lead_id?: string | null;
          title: string;
          description?: string | null;
          status?: "pending" | "in_progress" | "done" | "cancelled";
          priority?: "low" | "medium" | "high";
          due_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      appointments: TableDefinition<
        AppointmentRow,
        {
          id?: string;
          organization_id: string;
          customer_id?: string | null;
          title: string;
          starts_at: string;
          ends_at: string;
          status?: "scheduled" | "confirmed" | "completed" | "cancelled";
          location?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      proposals: TableDefinition<
        ProposalRow,
        {
          id?: string;
          organization_id: string;
          customer_id?: string | null;
          title: string;
          status?: "draft" | "sent" | "accepted" | "rejected" | "expired";
          valid_until?: string | null;
          subtotal?: number;
          discount?: number;
          total?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      services: TableDefinition<
        ServiceRow,
        {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          price?: number;
          duration_minutes?: number | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      current_organization_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      business_model: "b2b_services" | "appointments" | "courses" | "work_orders";
    };
    CompositeTypes: Record<string, never>;
  };
};
