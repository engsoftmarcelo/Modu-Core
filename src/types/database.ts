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

type OrganizationMembershipRow = Timestamps & {
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  is_default: boolean;
};

type CustomerRow = Timestamps & {
  id: string;
  organization_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  segment: string | null;
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
  status:
    | "new"
    | "contacted"
    | "proposal_sent"
    | "negotiation"
    | "won"
    | "lost";
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
  professional_id: string | null;
  service_id: string | null;
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
  service_summary: string | null;
  notes: string | null;
};

type ProposalItemRow = Timestamps & {
  id: string;
  organization_id: string;
  proposal_id: string;
  service_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
  position: number;
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

type ProfessionalRow = Timestamps & {
  id: string;
  organization_id: string;
  name: string;
  specialty: string | null;
  available_hours: string | null;
  active: boolean;
};

type ProfessionalServiceRow = {
  organization_id: string;
  professional_id: string;
  service_id: string;
  created_at: string;
};

type ProfessionalAvailabilityRow = Timestamps & {
  id: string;
  organization_id: string;
  professional_id: string;
  weekday: number;
  starts_at: string;
  ends_at: string;
  active: boolean;
};

type StudentRow = Timestamps & {
  id: string;
  organization_id: string;
  customer_id: string | null;
  name: string;
  whatsapp: string | null;
  email: string | null;
  cpf: string | null;
  notes: string | null;
  status: "active" | "inactive";
};

type CourseRow = Timestamps & {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  workload_hours: number;
  price: number;
  modality: "presencial" | "online" | "hibrido";
  active: boolean;
};

type CourseClassRow = Timestamps & {
  id: string;
  organization_id: string;
  course_id: string;
  professional_id: string | null;
  teacher: string;
  start_date: string;
  end_date: string;
  weekdays: string[];
  class_time: string;
  capacity: number;
};

type EnrollmentStatus =
  | "interested"
  | "enrolled"
  | "in_progress"
  | "completed"
  | "cancelled";

type EnrollmentPaymentStatus = "pending" | "paid" | "refunded" | "waived";

type EnrollmentRow = Timestamps & {
  id: string;
  organization_id: string;
  student_id: string;
  course_class_id: string;
  status: EnrollmentStatus;
  payment_status: EnrollmentPaymentStatus;
};

type AttendanceStatus = "present" | "absent";

type AttendanceRecordRow = Timestamps & {
  id: string;
  organization_id: string;
  course_class_id: string;
  student_id: string;
  class_date: string;
  status: AttendanceStatus;
};

type WorkOrderStatus =
  | "requested"
  | "quoted"
  | "approved"
  | "in_progress"
  | "completed"
  | "cancelled";

type WorkOrderRow = Timestamps & {
  id: string;
  organization_id: string;
  customer_id: string | null;
  professional_id: string | null;
  address: string;
  service_type: string;
  description: string;
  technician_name: string;
  visit_date: string;
  status: WorkOrderStatus;
  quote_materials: number;
  quote_labor: number;
  quote_discount: number;
  quote_total: number;
  quote_term: string | null;
  quoted_at: string | null;
  completion_approved_by: string | null;
  completion_notes: string | null;
  completion_accepted: boolean;
  completed_at: string | null;
};

type WorkOrderEventRow = {
  id: string;
  organization_id: string;
  work_order_id: string;
  actor_id: string | null;
  event_type:
    | "created"
    | "status_changed"
    | "quote_updated"
    | "completed"
    | "reopened";
  from_status: WorkOrderStatus | null;
  to_status: WorkOrderStatus | null;
  metadata: Json;
  created_at: string;
};

type WorkOrderChecklistItemKey =
  | "arrived_on_site"
  | "assessed_problem"
  | "took_photos"
  | "performed_service"
  | "customer_approved"
  | "finished";

type WorkOrderChecklistItemRow = Timestamps & {
  id: string;
  organization_id: string;
  work_order_id: string;
  item_key: WorkOrderChecklistItemKey;
  label: string;
  position: number;
  completed: boolean;
  completed_at: string | null;
};

type WorkOrderAttachmentStatus = "pending" | "ready";

type WorkOrderAttachmentRow = Timestamps & {
  id: string;
  organization_id: string;
  work_order_id: string;
  uploaded_by: string | null;
  storage_path: string;
  file_name: string;
  mime_type: "image/jpeg" | "image/png" | "image/webp";
  file_size: number;
  upload_status: WorkOrderAttachmentStatus;
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
      organization_memberships: TableDefinition<
        OrganizationMembershipRow,
        {
          organization_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member";
          is_default?: boolean;
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
          company?: string | null;
          email?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          segment?: string | null;
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
          status?:
            | "new"
            | "contacted"
            | "proposal_sent"
            | "negotiation"
            | "won"
            | "lost";
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
          professional_id?: string | null;
          service_id?: string | null;
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
          service_summary?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      proposal_items: TableDefinition<
        ProposalItemRow,
        {
          id?: string;
          organization_id: string;
          proposal_id: string;
          service_id?: string | null;
          description: string;
          quantity?: number;
          unit_price?: number;
          discount?: number;
          position?: number;
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
      professionals: TableDefinition<
        ProfessionalRow,
        {
          id?: string;
          organization_id: string;
          name: string;
          specialty?: string | null;
          available_hours?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      professional_services: TableDefinition<
        ProfessionalServiceRow,
        {
          organization_id: string;
          professional_id: string;
          service_id: string;
          created_at?: string;
        }
      >;
      professional_availability: TableDefinition<
        ProfessionalAvailabilityRow,
        {
          id?: string;
          organization_id: string;
          professional_id: string;
          weekday: number;
          starts_at: string;
          ends_at: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      students: TableDefinition<
        StudentRow,
        {
          id?: string;
          organization_id: string;
          customer_id?: string | null;
          name: string;
          whatsapp?: string | null;
          email?: string | null;
          cpf?: string | null;
          notes?: string | null;
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        }
      >;
      courses: TableDefinition<
        CourseRow,
        {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          workload_hours?: number;
          price?: number;
          modality?: "presencial" | "online" | "hibrido";
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      course_classes: TableDefinition<
        CourseClassRow,
        {
          id?: string;
          organization_id: string;
          course_id: string;
          professional_id?: string | null;
          teacher: string;
          start_date: string;
          end_date: string;
          weekdays?: string[];
          class_time: string;
          capacity: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      enrollments: TableDefinition<
        EnrollmentRow,
        {
          id?: string;
          organization_id: string;
          student_id: string;
          course_class_id: string;
          status?: EnrollmentStatus;
          payment_status?: EnrollmentPaymentStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
      attendance_records: TableDefinition<
        AttendanceRecordRow,
        {
          id?: string;
          organization_id: string;
          course_class_id: string;
          student_id: string;
          class_date: string;
          status: AttendanceStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
      work_orders: TableDefinition<
        WorkOrderRow,
        {
          id?: string;
          organization_id: string;
          customer_id?: string | null;
          professional_id?: string | null;
          address: string;
          service_type: string;
          description: string;
          technician_name: string;
          visit_date: string;
          status?: WorkOrderStatus;
          quote_materials?: number;
          quote_labor?: number;
          quote_discount?: number;
          quote_term?: string | null;
          quoted_at?: string | null;
          completion_approved_by?: string | null;
          completion_notes?: string | null;
          completion_accepted?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      work_order_events: TableDefinition<
        WorkOrderEventRow,
        {
          id?: string;
          organization_id: string;
          work_order_id: string;
          actor_id?: string | null;
          event_type: WorkOrderEventRow["event_type"];
          from_status?: WorkOrderStatus | null;
          to_status?: WorkOrderStatus | null;
          metadata?: Json;
          created_at?: string;
        }
      >;
      work_order_checklist_items: TableDefinition<
        WorkOrderChecklistItemRow,
        {
          id?: string;
          organization_id: string;
          work_order_id: string;
          item_key: WorkOrderChecklistItemKey;
          label: string;
          position: number;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      work_order_attachments: TableDefinition<
        WorkOrderAttachmentRow,
        {
          id?: string;
          organization_id: string;
          work_order_id: string;
          uploaded_by?: string | null;
          storage_path: string;
          file_name: string;
          mime_type: "image/jpeg" | "image/png" | "image/webp";
          file_size: number;
          upload_status?: WorkOrderAttachmentStatus;
          created_at?: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      add_organization_member: {
        Args: {
          target_user_id: string;
          target_role?: "owner" | "admin" | "member";
        };
        Returns: undefined;
      };
      current_organization_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      current_user_can_administer: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      current_user_can_write: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      current_user_is_owner: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: "owner" | "admin" | "member" | null;
      };
      delete_proposal: {
        Args: { p_proposal_id: string };
        Returns: boolean;
      };
      remove_organization_member: {
        Args: { target_user_id: string };
        Returns: undefined;
      };
      save_simple_proposal: {
        Args: {
          p_proposal_id: string | null;
          p_customer_id: string;
          p_proposal_title: string;
          p_service_description: string;
          p_proposal_value: number;
          p_valid_until_date: string;
          p_proposal_status: ProposalRow["status"];
          p_proposal_notes: string;
        };
        Returns: string;
      };
      set_organization_member_role: {
        Args: {
          target_user_id: string;
          target_role: "owner" | "admin" | "member";
        };
        Returns: undefined;
      };
      set_proposal_status: {
        Args: {
          p_proposal_id: string;
          p_proposal_status: ProposalRow["status"];
        };
        Returns: boolean;
      };
      switch_organization: {
        Args: { target_organization_id: string };
        Returns: undefined;
      };
      user_has_organization_membership: {
        Args: { target_organization_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      business_model: "b2b_services" | "appointments" | "courses" | "work_orders";
    };
    CompositeTypes: Record<string, never>;
  };
};
