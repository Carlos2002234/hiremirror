export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'candidate' | 'recruiter' | 'admin'
export type EvidenceSourceType =
  | 'cv' | 'github' | 'linkedin' | 'htb' | 'tryhackme'
  | 'portswigger' | 'ctftime' | 'bugcrowd' | 'hackerone'
  | 'blog' | 'talk' | 'portfolio' | 'certification_upload'
export type EvidenceStatus = 'pending' | 'processing' | 'ready' | 'error'
export type SkillCategory = 'tool' | 'language' | 'framework' | 'methodology' | 'platform' | 'protocol' | 'domain_knowledge'
export type ProficiencyLevel = 'exposure' | 'working' | 'proficient' | 'expert'
export type CertLevel = 'entry' | 'intermediate' | 'advanced' | 'expert'
export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
export type CompanyPlan = 'free' | 'starter' | 'growth' | 'enterprise'
export type WorkType = 'remote' | 'hybrid' | 'onsite'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'consulting'
export type JobStatus = 'draft' | 'active' | 'paused' | 'closed'
export type ApplicationStatus =
  | 'applied' | 'reviewing' | 'shortlisted'
  | 'interview' | 'offer' | 'rejected' | 'withdrawn'
export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'staff' | 'principal'
export type WorkPreference = 'remote' | 'hybrid' | 'onsite' | 'any'
export type CompanyMemberRole = 'admin' | 'recruiter' | 'viewer'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: UserRole
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          created_at?: string
        }
      }
      candidate_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          headline: string | null
          bio: string | null
          location: string | null
          years_experience: number | null
          primary_specialization: string | null
          secondary_specializations: string[] | null
          profile_completeness: number
          is_open_to_work: boolean
          desired_salary_min: number | null
          desired_salary_max: number | null
          currency: string
          work_preference: WorkPreference
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          headline?: string | null
          bio?: string | null
          location?: string | null
          years_experience?: number | null
          primary_specialization?: string | null
          secondary_specializations?: string[] | null
          profile_completeness?: number
          is_open_to_work?: boolean
          desired_salary_min?: number | null
          desired_salary_max?: number | null
          currency?: string
          work_preference?: WorkPreference
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          headline?: string | null
          bio?: string | null
          location?: string | null
          years_experience?: number | null
          primary_specialization?: string | null
          secondary_specializations?: string[] | null
          profile_completeness?: number
          is_open_to_work?: boolean
          desired_salary_min?: number | null
          desired_salary_max?: number | null
          currency?: string
          work_preference?: WorkPreference
          updated_at?: string
        }
      }
      evidence_sources: {
        Row: {
          id: string
          candidate_id: string
          source_type: EvidenceSourceType
          url: string | null
          raw_data: Json | null
          processed_data: Json | null
          status: EvidenceStatus
          last_synced_at: string | null
        }
        Insert: {
          id?: string
          candidate_id: string
          source_type: EvidenceSourceType
          url?: string | null
          raw_data?: Json | null
          processed_data?: Json | null
          status?: EvidenceStatus
          last_synced_at?: string | null
        }
        Update: {
          id?: string
          candidate_id?: string
          source_type?: EvidenceSourceType
          url?: string | null
          raw_data?: Json | null
          processed_data?: Json | null
          status?: EvidenceStatus
          last_synced_at?: string | null
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          category: SkillCategory
          domain: string[] | null
          aliases: string[] | null
        }
        Insert: {
          id?: string
          name: string
          category: SkillCategory
          domain?: string[] | null
          aliases?: string[] | null
        }
        Update: {
          id?: string
          name?: string
          category?: SkillCategory
          domain?: string[] | null
          aliases?: string[] | null
        }
      }
      candidate_skills: {
        Row: {
          id: string
          candidate_id: string
          skill_id: string
          proficiency_level: ProficiencyLevel
          evidence_count: number
          evidence_refs: Json | null
          ai_confidence: number
        }
        Insert: {
          id?: string
          candidate_id: string
          skill_id: string
          proficiency_level?: ProficiencyLevel
          evidence_count?: number
          evidence_refs?: Json | null
          ai_confidence?: number
        }
        Update: {
          id?: string
          candidate_id?: string
          skill_id?: string
          proficiency_level?: ProficiencyLevel
          evidence_count?: number
          evidence_refs?: Json | null
          ai_confidence?: number
        }
      }
      certifications: {
        Row: {
          id: string
          name: string
          full_name: string | null
          issuer: string
          level: CertLevel
          domain: string[] | null
          is_verifiable: boolean
          verification_url: string | null
        }
        Insert: {
          id?: string
          name: string
          full_name?: string | null
          issuer: string
          level?: CertLevel
          domain?: string[] | null
          is_verifiable?: boolean
          verification_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          full_name?: string | null
          issuer?: string
          level?: CertLevel
          domain?: string[] | null
          is_verifiable?: boolean
          verification_url?: string | null
        }
      }
      candidate_certifications: {
        Row: {
          id: string
          candidate_id: string
          certification_id: string
          obtained_at: string | null
          expires_at: string | null
          credential_id: string | null
          verified: boolean
          verification_status: 'pending' | 'verified' | 'failed'
        }
        Insert: {
          id?: string
          candidate_id: string
          certification_id: string
          obtained_at?: string | null
          expires_at?: string | null
          credential_id?: string | null
          verified?: boolean
          verification_status?: 'pending' | 'verified' | 'failed'
        }
        Update: {
          id?: string
          candidate_id?: string
          certification_id?: string
          obtained_at?: string | null
          expires_at?: string | null
          credential_id?: string | null
          verified?: boolean
          verification_status?: 'pending' | 'verified' | 'failed'
        }
      }
      ai_profiles: {
        Row: {
          id: string
          candidate_id: string
          narrative_summary: string | null
          technical_depth_score: number
          experience_score: number
          certification_score: number
          practical_evidence_score: number
          community_score: number
          overall_score: number
          strengths: Json | null
          growth_areas: Json | null
          specialization_tags: string[] | null
          seniority_estimate: SeniorityLevel | null
          generated_at: string
          model_version: string | null
        }
        Insert: {
          id?: string
          candidate_id: string
          narrative_summary?: string | null
          technical_depth_score?: number
          experience_score?: number
          certification_score?: number
          practical_evidence_score?: number
          community_score?: number
          overall_score?: number
          strengths?: Json | null
          growth_areas?: Json | null
          specialization_tags?: string[] | null
          seniority_estimate?: SeniorityLevel | null
          generated_at?: string
          model_version?: string | null
        }
        Update: {
          id?: string
          candidate_id?: string
          narrative_summary?: string | null
          technical_depth_score?: number
          experience_score?: number
          certification_score?: number
          practical_evidence_score?: number
          community_score?: number
          overall_score?: number
          strengths?: Json | null
          growth_areas?: Json | null
          specialization_tags?: string[] | null
          seniority_estimate?: SeniorityLevel | null
          generated_at?: string
          model_version?: string | null
        }
      }
      companies: {
        Row: {
          id: string
          owner_user_id: string
          name: string
          size: CompanySize | null
          industry: string | null
          website: string | null
          is_verified: boolean
          plan: CompanyPlan
        }
        Insert: {
          id?: string
          owner_user_id: string
          name: string
          size?: CompanySize | null
          industry?: string | null
          website?: string | null
          is_verified?: boolean
          plan?: CompanyPlan
        }
        Update: {
          id?: string
          owner_user_id?: string
          name?: string
          size?: CompanySize | null
          industry?: string | null
          website?: string | null
          is_verified?: boolean
          plan?: CompanyPlan
        }
      }
      job_postings: {
        Row: {
          id: string
          company_id: string
          created_by: string
          title: string
          description: string
          requirements_raw: string | null
          location: string | null
          work_type: WorkType
          employment_type: EmploymentType
          salary_min: number | null
          salary_max: number | null
          currency: string
          status: JobStatus
          application_deadline: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          created_by: string
          title: string
          description: string
          requirements_raw?: string | null
          location?: string | null
          work_type?: WorkType
          employment_type?: EmploymentType
          salary_min?: number | null
          salary_max?: number | null
          currency?: string
          status?: JobStatus
          application_deadline?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          created_by?: string
          title?: string
          description?: string
          requirements_raw?: string | null
          location?: string | null
          work_type?: WorkType
          employment_type?: EmploymentType
          salary_min?: number | null
          salary_max?: number | null
          currency?: string
          status?: JobStatus
          application_deadline?: string | null
          created_at?: string
        }
      }
      job_analyses: {
        Row: {
          id: string
          job_posting_id: string
          required_skills: Json | null
          preferred_skills: Json | null
          required_certifications: Json | null
          required_experience_years: number | null
          seniority_level: string | null
          key_responsibilities: Json | null
          tech_stack: Json | null
          domain_tags: string[] | null
          analyzed_at: string
        }
        Insert: {
          id?: string
          job_posting_id: string
          required_skills?: Json | null
          preferred_skills?: Json | null
          required_certifications?: Json | null
          required_experience_years?: number | null
          seniority_level?: string | null
          key_responsibilities?: Json | null
          tech_stack?: Json | null
          domain_tags?: string[] | null
          analyzed_at?: string
        }
        Update: {
          id?: string
          job_posting_id?: string
          required_skills?: Json | null
          preferred_skills?: Json | null
          required_certifications?: Json | null
          required_experience_years?: number | null
          seniority_level?: string | null
          key_responsibilities?: Json | null
          tech_stack?: Json | null
          domain_tags?: string[] | null
          analyzed_at?: string
        }
      }
      job_matches: {
        Row: {
          id: string
          candidate_id: string
          job_posting_id: string
          compatibility_score: number
          technical_score: number
          experience_score: number
          certification_score: number
          evidence_score: number
          skill_gaps: Json | null
          strengths: Json | null
          recommended_certs: Json | null
          recommended_labs: Json | null
          roadmap: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          job_posting_id: string
          compatibility_score?: number
          technical_score?: number
          experience_score?: number
          certification_score?: number
          evidence_score?: number
          skill_gaps?: Json | null
          strengths?: Json | null
          recommended_certs?: Json | null
          recommended_labs?: Json | null
          roadmap?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          job_posting_id?: string
          compatibility_score?: number
          technical_score?: number
          experience_score?: number
          certification_score?: number
          evidence_score?: number
          skill_gaps?: Json | null
          strengths?: Json | null
          recommended_certs?: Json | null
          recommended_labs?: Json | null
          roadmap?: Json | null
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          candidate_id: string
          job_posting_id: string
          ai_score: number | null
          status: ApplicationStatus
          recruiter_notes: string | null
          ai_generated_feedback: string | null
          human_feedback: string | null
          applied_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          job_posting_id: string
          ai_score?: number | null
          status?: ApplicationStatus
          recruiter_notes?: string | null
          ai_generated_feedback?: string | null
          human_feedback?: string | null
          applied_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          job_posting_id?: string
          ai_score?: number | null
          status?: ApplicationStatus
          recruiter_notes?: string | null
          ai_generated_feedback?: string | null
          human_feedback?: string | null
          applied_at?: string
          updated_at?: string
        }
      }
      interview_questions: {
        Row: {
          id: string
          job_posting_id: string
          candidate_id: string
          questions: Json
          generated_at: string
        }
        Insert: {
          id?: string
          job_posting_id: string
          candidate_id: string
          questions: Json
          generated_at?: string
        }
        Update: {
          id?: string
          job_posting_id?: string
          candidate_id?: string
          questions?: Json
          generated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
