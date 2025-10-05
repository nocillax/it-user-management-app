# Email Service Integration Guide

This guide explains how to set up email verification for your IT User Management App deployment.

## The Problem

When deploying on Render, SMTP connections are often blocked for security reasons, causing the email verification system to fail with "connection lost" errors. This is a common issue with many cloud hosting providers.

## The Solution: Brevo (formerly Sendinblue)

We've integrated Brevo, which provides:

- 300 free emails per day
- No need for a custom domain
- API-based sending (no SMTP blocking issues)
- Easy setup process
- Works well with Render and other cloud hosting platforms

## Setup Instructions

### 1. Create a Brevo Account

1. Go to [Brevo's website](https://www.brevo.com/) and sign up for a free account
2. Confirm your email address and log in
3. Navigate to the "SMTP & API" section (or API Keys)
4. Create a new API key and copy it
5. Optional: Verify your sender email address for better deliverability

### 2. Configure Your Environment Variables

Update your `.env` file with the following:

```
# Email Configuration
BREVO_API_KEY=your_api_key_from_brevo
EMAIL_FROM_NAME=Your App Name
EMAIL_FROM_ADDRESS=your-verified-email@example.com
```

### 3. Install Required Dependencies

Run the following command:

```bash
npm install sib-api-v3-sdk --save
```

### 4. Deploy Your Application

Deploy your application to Render or your preferred hosting platform. The email service will now use Brevo's API instead of SMTP connections.

## Troubleshooting

- **Emails not sending:** Check if you've set up your Brevo account correctly and verified your sender email
- **API key issues:** Ensure your API key is copied correctly and has the proper permissions
- **Rate limits:** The free tier allows 300 emails per day - check your usage in the Brevo dashboard

## Alternative Services

If Brevo doesn't meet your needs, other free alternatives include:

- **Mailgun** - 5,000 free emails for 3 months, then requires a credit card
- **Mailjet** - 6,000 free emails per month (200/day)
- **Mailtrap** - Email testing service with a limited free sending plan

## Configuration Details

The email service uses only the Brevo API (no SMTP) for sending emails. This implementation is specifically designed for cloud environments where SMTP connections might be blocked.
