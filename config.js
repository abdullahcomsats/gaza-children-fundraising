// Environment configuration for Supabase
// Fill in your actual values. Do NOT commit secrets.

window.__ENV = {
  // Supabase project settings
  SUPABASE_URL: "https://sibgfalbazwfdctpcmhg.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYmdmYWxiYXp3ZmRjdHBjbWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjkzMTUsImV4cCI6MjA3NjkwNTMxNX0.VbWGb47rlGgeCvhDvnPVoUB4zJ5TbXeqVTgElvduuxM",
  
  // Questionnaire field mapping for Supabase database columns
  // Maps form field names to database column names
  QUESTIONNAIRE_FIELDS: {
    // Section 1: Motivation and Emotional Connection
    q1_motivation: "q1_motivation",
    q2_emotions: "q2_emotions", 
    q3_priorSupport: "q3_prior_support",
    q4_campaignResonance: "q4_campaign_resonance",
    q5_impactImportance: "q5_impact_importance",
    // Section 2: Reflection and Perspective
    q6_urgentNeed: "q6_urgent_need",
    q7_contributionChange: "q7_contribution_change",
    q8_personalValue: "q8_personal_value",
    // Section 3: Engagement and Future Involvement
    q9_futureUpdates: "q9_future_updates",
    q10_messageHope: "q10_message_hope"
  }
};

/*
Setup notes:
- Supabase: Create table `donations` with columns
  transaction_id (text), amount (numeric), currency (text), donor_first_name (text),
  donor_last_name (text), donor_email_hash (text), country (text), card_last4 (text),
  card_brand (text), payment_token (text), questionnaire (jsonb), created_at (timestamptz)

- Enable Row Level Security and add policy to allow anonymous inserts only:
  Example (adjust role as needed):
    ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Allow inserts" ON donations
    FOR INSERT WITH CHECK (true);

- PCI/Privacy: Never store full card numbers or raw emails. This app stores only
  last4, brand, and a mock token; emails are SHA-256 hashed before insert.

- Google Forms: Open your form, inspect inputs to find `entry.<id>` values for each question.
  Use the formResponse endpoint and note that `fetch` runs in `no-cors` mode, so
  success can't be confirmed; failures are logged to console.
*/