[?25l
    Select a project:                                                                                 
                                                                                                      
  >  1. dbynywhxdfleqvqbasdk [name: Ecobin, org: ddeuckvfyqpcnxjkhxma, region: eu-north-1]            
    2. ijezddfooyhhqkntuawr [name: hasan0v's Project, org: ddeuckvfyqpcnxjkhxma, region: eu-central-1]
                                                                                                      
                                                                                                      
    ↑/k up • ↓/j down • / filter • q quit • ? more                                                    
                                                                                                      [0D[2K[1A[2K[1A[2K[1A[2K[1A[2K[1A[2K[1A[2K[1A[2K[1A[0D[2K [0D[2K[?25h[?1002l[?1003l[?1006lexport type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      Alert: {
        Row: {
          acknowledged: boolean
          acknowledgedAt: string | null
          deviceId: string
          id: number
          message: string
          severity: Database["public"]["Enums"]["AlertSeverity"]
          timestamp: string
        }
        Insert: {
          acknowledged?: boolean
          acknowledgedAt?: string | null
          deviceId: string
          id?: number
          message: string
          severity: Database["public"]["Enums"]["AlertSeverity"]
          timestamp?: string
        }
        Update: {
          acknowledged?: boolean
          acknowledgedAt?: string | null
          deviceId?: string
          id?: number
          message?: string
          severity?: Database["public"]["Enums"]["AlertSeverity"]
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "Alert_deviceId_fkey"
            columns: ["deviceId"]
            isOneToOne: false
            referencedRelation: "Device"
            referencedColumns: ["id"]
          },
        ]
      }
      CompostCycle: {
        Row: {
          deviceId: string
          endTime: string | null
          id: number
          startTime: string
          status: Database["public"]["Enums"]["CycleStatus"]
        }
        Insert: {
          deviceId: string
          endTime?: string | null
          id?: number
          startTime?: string
          status?: Database["public"]["Enums"]["CycleStatus"]
        }
        Update: {
          deviceId?: string
          endTime?: string | null
          id?: number
          startTime?: string
          status?: Database["public"]["Enums"]["CycleStatus"]
        }
        Relationships: [
          {
            foreignKeyName: "CompostCycle_deviceId_fkey"
            columns: ["deviceId"]
            isOneToOne: false
            referencedRelation: "Device"
            referencedColumns: ["id"]
          },
        ]
      }
      Device: {
        Row: {
          createdAt: string
          firmwareId: number | null
          id: string
          name: string
          ownerId: string
        }
        Insert: {
          createdAt?: string
          firmwareId?: number | null
          id: string
          name: string
          ownerId: string
        }
        Update: {
          createdAt?: string
          firmwareId?: number | null
          id?: string
          name?: string
          ownerId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Device_firmwareId_fkey"
            columns: ["firmwareId"]
            isOneToOne: false
            referencedRelation: "Firmware"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Device_ownerId_fkey"
            columns: ["ownerId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Firmware: {
        Row: {
          description: string | null
          id: number
          releaseTimestamp: string | null
          uploadTimestamp: string
          version: string
        }
        Insert: {
          description?: string | null
          id?: number
          releaseTimestamp?: string | null
          uploadTimestamp?: string
          version: string
        }
        Update: {
          description?: string | null
          id?: number
          releaseTimestamp?: string | null
          uploadTimestamp?: string
          version?: string
        }
        Relationships: []
      }
      IrrigationEvent: {
        Row: {
          deviceId: string
          durationSeconds: number | null
          id: number
          timestamp: string
          volumeMl: number | null
        }
        Insert: {
          deviceId: string
          durationSeconds?: number | null
          id?: number
          timestamp?: string
          volumeMl?: number | null
        }
        Update: {
          deviceId?: string
          durationSeconds?: number | null
          id?: number
          timestamp?: string
          volumeMl?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "IrrigationEvent_deviceId_fkey"
            columns: ["deviceId"]
            isOneToOne: false
            referencedRelation: "Device"
            referencedColumns: ["id"]
          },
        ]
      }
      SensorReading: {
        Row: {
          baroPa: number
          deviceId: string
          humidity: number
          id: number
          soilPct: number
          tankPct: number
          tempC: number
          timestamp: string
          vocIdx: number
        }
        Insert: {
          baroPa: number
          deviceId: string
          humidity: number
          id?: number
          soilPct: number
          tankPct: number
          tempC: number
          timestamp?: string
          vocIdx: number
        }
        Update: {
          baroPa?: number
          deviceId?: string
          humidity?: number
          id?: number
          soilPct?: number
          tankPct?: number
          tempC?: number
          timestamp?: string
          vocIdx?: number
        }
        Relationships: [
          {
            foreignKeyName: "SensorReading_deviceId_fkey"
            columns: ["deviceId"]
            isOneToOne: false
            referencedRelation: "Device"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          createdAt: string
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          createdAt?: string
          email?: string | null
          id: string
          name?: string | null
        }
        Update: {
          createdAt?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      AlertSeverity: "INFO" | "WARNING" | "CRITICAL"
      CycleStatus: "PENDING" | "ACTIVE" | "COMPLETED" | "FAILED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      AlertSeverity: ["INFO", "WARNING", "CRITICAL"],
      CycleStatus: ["PENDING", "ACTIVE", "COMPLETED", "FAILED"],
    },
  },
} as const
