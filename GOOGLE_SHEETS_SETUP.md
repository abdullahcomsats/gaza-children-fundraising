# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for the Gaza Children Fundraising questionnaire responses.

## Prerequisites

1. A Google account
2. Access to Google Cloud Console
3. A Google Sheets spreadsheet to store the data

## Step 1: Create a Google Sheets Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "Gaza Fundraising Questionnaire Responses"
4. Set up the column headers in row 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Anonymous ID | Timestamp | Donation Amount | Q1: Motivation | Q2: Emotions | Q3: Prior Support | Q4: Campaign Resonance | Q5: Impact Importance | Q6: Urgent Need | Q7: Contribution Change | Q8: Personal Value | Q9: Future Updates | Q10: Message Hope |

5. Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)
   - Example: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
   - Spreadsheet ID: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## Step 2: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click on it and press "Enable"

## Step 3: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional but recommended) Restrict the API key:
   - Click on the API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API"
   - Under "Website restrictions", add your domain(s)

## Step 4: Make Spreadsheet Public (for API access)

1. Open your Google Sheets spreadsheet
2. Click "Share" in the top right
3. Click "Change to anyone with the link"
4. Set permission to "Viewer" (the API will append data)
5. Click "Done"

## Step 5: Update Configuration

1. Open `config.js` in your project
2. Replace the placeholder values:

```javascript
// Google Sheets API configuration
GOOGLE_SHEETS_API_KEY: "YOUR_ACTUAL_API_KEY_HERE",
GOOGLE_SHEETS_SPREADSHEET_ID: "YOUR_ACTUAL_SPREADSHEET_ID_HERE",
GOOGLE_SHEETS_RANGE: "Sheet1!A:M", // Keep this as is unless you renamed the sheet
```

## Step 6: Test the Integration

1. Start your local server: `python3 -m http.server 8000`
2. Navigate to the donate page
3. Fill out the questionnaire completely
4. Submit a test donation
5. Check your Google Sheets spreadsheet for the new row with:
   - Anonymous ID (format: `anon_[timestamp]_[random]`)
   - Timestamp in ISO format
   - Donation amount
   - All questionnaire responses

## Data Structure

Each questionnaire submission will create a new row with the following data:

- **Column A**: Anonymous ID (e.g., `anon_l8x9k2_abc123`)
- **Column B**: Timestamp (ISO format, e.g., `2025-01-27T10:30:45.123Z`)
- **Column C**: Donation Amount (e.g., `25`)
- **Columns D-M**: Questionnaire responses in order

## Security Notes

- The API key allows read/write access to your spreadsheet
- Consider using environment variables for production deployments
- Never commit API keys to version control
- The anonymous ID ensures user privacy while allowing data analysis

## Troubleshooting

### Common Issues:

1. **"API key not valid"**: Check that the API key is correct and the Google Sheets API is enabled
2. **"Spreadsheet not found"**: Verify the spreadsheet ID and ensure it's publicly accessible
3. **"Permission denied"**: Make sure the spreadsheet is shared with "Anyone with the link" as Viewer
4. **CORS errors**: These are expected in development; the data should still be submitted successfully

### Testing:

- Check browser console for success/error messages
- Verify data appears in your Google Sheets
- Test with different questionnaire responses to ensure all fields are captured

## Data Analysis

Once data is collected, you can:
- Use Google Sheets built-in charts and pivot tables
- Export data to CSV for external analysis
- Create automated reports using Google Apps Script
- Analyze response patterns while maintaining anonymity