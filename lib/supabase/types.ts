export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type CampaignStatus = "recruiting" | "in_progress" | "review" | "completed";
export type ApplicationStatus = "pending" | "approved" | "rejected";
export type InfluencerCampaignStatus =
  | "selected"
  | "shipped"
  | "received"
  | "submitted"
  | "revision"
  | "final_ok"
  | "settled";
export type Platform = "Instagram" | "TikTok" | "Twitter";
export type Country = "미국" | "캐나다" | "일본" | "동남아시아" | "중동";
export type Gender = "여성" | "남성" | "무관";
export type UserRole = "brand" | "influencer";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: UserRole;
        };
      };
      brand_profiles: {
        Row: {
          id: string;
          user_id: string;
          brand_name: string;
          logo_url: string | null;
          website: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          brand_name: string;
          logo_url?: string | null;
          website?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          brand_name?: string;
          logo_url?: string | null;
          website?: string | null;
          description?: string | null;
        };
      };
      influencer_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          avatar_url: string | null;
          bio: string | null;
          instagram_handle: string | null;
          tiktok_handle: string | null;
          twitter_handle: string | null;
          instagram_followers: number | null;
          tiktok_followers: number | null;
          twitter_followers: number | null;
          primary_platform: Platform | null;
          categories: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          avatar_url?: string | null;
          bio?: string | null;
          instagram_handle?: string | null;
          tiktok_handle?: string | null;
          twitter_handle?: string | null;
          instagram_followers?: number | null;
          tiktok_followers?: number | null;
          twitter_followers?: number | null;
          primary_platform?: Platform | null;
          categories?: string[];
          created_at?: string;
        };
        Update: {
          name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          instagram_handle?: string | null;
          tiktok_handle?: string | null;
          twitter_handle?: string | null;
          instagram_followers?: number | null;
          tiktok_followers?: number | null;
          twitter_followers?: number | null;
          primary_platform?: Platform | null;
          categories?: string[];
        };
      };
      campaigns: {
        Row: {
          id: string;
          brand_id: string;
          brand_name: string;
          product_name: string;
          product_image_url: string | null;
          category: string;
          description: string;
          guidelines: string[];
          platforms: Platform[];
          target_countries: Country[];
          target_gender: Gender;
          target_age_min: number;
          target_age_max: number;
          recruit_count: number;
          budget_per_influencer: number;
          recruit_start_date: string;
          recruit_deadline: string;
          selection_deadline: string;
          shipping_date: string;
          content_deadline: string;
          status: CampaignStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          brand_name: string;
          product_name: string;
          product_image_url?: string | null;
          category: string;
          description: string;
          guidelines: string[];
          platforms: Platform[];
          target_countries: Country[];
          target_gender: Gender;
          target_age_min: number;
          target_age_max: number;
          recruit_count: number;
          budget_per_influencer: number;
          recruit_start_date: string;
          recruit_deadline: string;
          selection_deadline: string;
          shipping_date: string;
          content_deadline: string;
          status?: CampaignStatus;
          created_at?: string;
        };
        Update: {
          product_name?: string;
          product_image_url?: string | null;
          category?: string;
          description?: string;
          guidelines?: string[];
          platforms?: Platform[];
          target_countries?: Country[];
          target_gender?: Gender;
          target_age_min?: number;
          target_age_max?: number;
          recruit_count?: number;
          budget_per_influencer?: number;
          recruit_start_date?: string;
          recruit_deadline?: string;
          selection_deadline?: string;
          shipping_date?: string;
          content_deadline?: string;
          status?: CampaignStatus;
        };
      };
      campaign_applications: {
        Row: {
          id: string;
          campaign_id: string;
          influencer_id: string;
          message: string | null;
          status: ApplicationStatus;
          applied_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          influencer_id: string;
          message?: string | null;
          status?: ApplicationStatus;
          applied_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          status?: ApplicationStatus;
          reviewed_at?: string | null;
        };
      };
      campaign_influencers: {
        Row: {
          id: string;
          campaign_id: string;
          influencer_id: string;
          status: InfluencerCampaignStatus;
          tracking_number: string | null;
          content_url: string | null;
          revision_note: string | null;
          joined_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          influencer_id: string;
          status?: InfluencerCampaignStatus;
          tracking_number?: string | null;
          content_url?: string | null;
          revision_note?: string | null;
          joined_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: InfluencerCampaignStatus;
          tracking_number?: string | null;
          content_url?: string | null;
          revision_note?: string | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
      };
    };
  };
}
