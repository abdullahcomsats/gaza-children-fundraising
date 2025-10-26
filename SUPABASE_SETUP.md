# Supabase Questionnaire Integration Setup

This guide explains how to set up the Supabase integration for storing questionnaire responses from the Gaza Children Fundraising app.

## Prerequisites

- Supabase project connected to your Trae IDE
- The migration file `supabase/migrations/create_questionnaire_responses.sql` exists in your project

## Setup Steps

### 1. Apply the Database Migration

The questionnaire responses table has already been created in your Supabase database with the following structure:

```sql
CREATE TABLE questionnaire_responses (
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
```

### 2. Row Level Security (RLS)

The table has RLS enabled with policies that:
- Allow anonymous inserts (anyone can submit questionnaire responses)
- Allow read access for analytics and admin purposes

### 3. Configuration

Your `config.js` file has been updated to:
- Remove Google Sheets configuration
- Keep only Supabase settings
- Map questionnaire fields to database columns

### 4. Anonymous ID Generation

The app generates privacy-focused anonymous IDs in the format: `anon_timestamp_randomstring`

Example: `anon_1761511703_abc123`

## How It Works

1. **User fills out questionnaire** on the donation page
2. **Anonymous ID is generated** using timestamp + random string
3. **Data is submitted** to the `questionnaire_responses` table
4. **Donation amount** is also stored with the questionnaire response
5. **Analytics tracking** is triggered for successful submissions

## Data Structure

Each questionnaire response includes:

- `anonymous_id`: Privacy-focused unique identifier
- `created_at`: Automatic timestamp
- `donation_amount`: Associated donation amount (if any)
- `q1_motivation` through `q10_message_hope`: All 10 questionnaire responses

## Viewing Data

You can view questionnaire responses in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to "Table Editor"
3. Select the `questionnaire_responses` table
4. View all anonymous responses with timestamps

## Privacy Features

- **No personal information** is stored in questionnaire responses
- **Anonymous IDs** cannot be traced back to individuals
- **Donation data** is stored separately in the `donations` table
- **Email addresses** are hashed before storage (in donations table)

## Analytics

The integration includes Google Analytics tracking for:
- Questionnaire submissions
- Anonymous ID tracking
- Donation flow completion

## Troubleshooting

If questionnaire submissions are not working:

1. Check browser console for errors
2. Verify Supabase connection in the network tab
3. Ensure RLS policies allow inserts
4. Check that the `questionnaire_responses` table exists

The app will continue to work even if questionnaire submission fails - it's designed as a fire-and-forget operation that doesn't block the donation process.