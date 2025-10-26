-- Create questionnaire_responses table for storing anonymous questionnaire data
-- This table stores responses from the Gaza Children Fundraising questionnaire

CREATE TABLE IF NOT EXISTS questionnaire_responses (
    id BIGSERIAL PRIMARY KEY,
    anonymous_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    donation_amount NUMERIC(10,2),
    
    -- Section 1: Motivation and Emotional Connection
    q1_motivation TEXT,
    q2_emotions TEXT,
    q3_prior_support TEXT,
    q4_campaign_resonance TEXT,
    q5_impact_importance TEXT,
    
    -- Section 2: Reflection and Perspective  
    q6_urgent_need TEXT,
    q7_contribution_change TEXT,
    q8_personal_value TEXT,
    
    -- Section 3: Engagement and Future Involvement
    q9_future_updates TEXT,
    q10_message_hope TEXT
);

-- Enable Row Level Security
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (anyone can insert data)
CREATE POLICY "Allow anonymous inserts" ON questionnaire_responses
    FOR INSERT 
    WITH CHECK (true);

-- Create policy to allow reading data (for analytics/admin purposes)
CREATE POLICY "Allow read access" ON questionnaire_responses
    FOR SELECT 
    USING (true);

-- Create index on anonymous_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_anonymous_id 
    ON questionnaire_responses(anonymous_id);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_created_at 
    ON questionnaire_responses(created_at);

-- Add comments for documentation
COMMENT ON TABLE questionnaire_responses IS 'Stores anonymous questionnaire responses from Gaza Children Fundraising campaign';
COMMENT ON COLUMN questionnaire_responses.anonymous_id IS 'Privacy-focused anonymous identifier (e.g., anon_xyz123_abc456)';
COMMENT ON COLUMN questionnaire_responses.donation_amount IS 'Associated donation amount in USD';