# 📧 Mailway - Modern Email Marketing Platform

**Mailway** is a comprehensive, full-stack email marketing platform built with Next.js 15, TypeScript, and PostgreSQL. It provides powerful tools for creating, managing, and tracking email campaigns with real-time analytics, contact management, and advanced email personalization.

![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue?style=flat-square&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.16.1-2D3748?style=flat-square&logo=prisma)

## Features

### Core Features

- **Email Campaign Management**
  - Create and manage multiple email campaigns
  - Visual email template builder with GrapesJS
  - Drag-and-drop email editor
  - Template library with customizable designs
  - Campaign scheduling and automation

- **Contact Management**
  - Import contacts via CSV bulk upload
  - Contact segmentation and tagging
  - Email validation and verification
  - Contact history and email tracking per contact
  - Advanced contact search and filtering

- **Real-Time Analytics & Tracking**
  - Real-time email progress tracking during bulk sends
  - Open rate tracking with pixel tracking
  - Click tracking for all links
  - Reply tracking and categorization
  - Campaign performance analytics
  - Template performance metrics
  - Deliverability monitoring
  - Geographic and device analytics

- **Email Personalization**
  - Dynamic variable replacement (`[Name]`, `[First Name]`, `[Company]`, etc.)
  - Contact-based personalization
  - Custom variable helper with auto-complete
  - Preview functionality for personalized content

- **Smart Email Sending**
  - Bulk email sending with intelligent batching
  - Rate limiting and throttling
  - Automatic retry mechanism with exponential backoff
  - Parallel processing for small campaigns
  - Real-time progress updates
  - Error handling and logging

- **Multi-Provider Support**
  - AWS SES integration
  - SendGrid support (configurable)
  - Mailgun support (configurable)
  - SMTP support (configurable)
  - Easy provider switching

- **Advanced Settings**
  - Email provider configuration
  - From email and name customization
  - Reply-to email configuration
  - Tracking preferences (open, click, unsubscribe)
  - Rate limits and daily/monthly quotas
  - Bounce and complaint handling

- **Dashboard & Reporting**
  - Campaign overview dashboard
  - KPI metrics (open rate, click rate, reply rate)
  - Campaign comparison
  - Email log history
  - Reply tracking kanban board
  - Deliverability score monitoring

## Tech Stack

### Frontend
- **Next.js 15.1.4** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - UI component library
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **GrapesJS** - Visual page builder
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **AWS SDK** - AWS SES integration

### Email Services
- **AWS SES** - Primary email service
- **SendGrid** - Alternative email provider
- **Mailgun** - Alternative email provider
- **SMTP** - Generic SMTP support

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Prisma Studio** - Database GUI

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** database (local or cloud-hosted)
- **AWS Account** (for SES) or alternative email provider account

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mailway
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mailway?schema=public"

# AWS SES Configuration
MAILWAY_AWS_ACCESS_KEY_ID=your_aws_access_key_id
MAILWAY_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
MAILWAY_AWS_REGION=us-east-1

# Optional: SendGrid (if using SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Optional: Mailgun (if using Mailgun)
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain

# Optional: SMTP (if using SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### AWS SES Setup

1. **Create AWS Account** and navigate to SES console
2. **Verify Email Address** or **Verify Domain**:
   - For testing: Verify individual email addresses
   - For production: Verify your domain (recommended)
3. **Get Access Keys**:
   - Create IAM user with SES permissions
   - Generate Access Key ID and Secret Access Key
4. **Update Environment Variables** with your credentials

### Email Provider Configuration

You can configure email providers through the Settings page:

1. Navigate to **Settings → Email Configuration**
2. Select your provider (AWS SES, SendGrid, Mailgun, or SMTP)
3. Enter your credentials
4. Configure "From Email" and "From Name"
5. Set up tracking preferences
6. Save settings

## 📁 Project Structure

```
mailway/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── analytics/            # Analytics endpoints
│   │   ├── campaigns/            # Campaign management
│   │   ├── contacts/             # Contact management
│   │   ├── send-email/           # Single email sending
│   │   ├── send-bulk-email/      # Bulk email sending
│   │   ├── settings/             # Settings management
│   │   └── track/                # Email tracking (open/click)
│   ├── campaigns/                # Campaign pages
│   ├── contacts/                 # Contact management pages
│   ├── analytics/                # Analytics dashboard
│   ├── dashboard/                # Main dashboard
│   ├── settings/                 # Settings pages
│   └── login/                    # Authentication
├── components/                   # React components
│   ├── analytics/                # Analytics components
│   ├── campaigns/                # Campaign components
│   ├── contacts/                 # Contact components
│   ├── settings/                 # Settings components
│   ├── dashboard/                # Dashboard components
│   └── ui/                       # Reusable UI components
├── lib/                          # Utility libraries
│   ├── email-service.ts          # Email sending service
│   ├── prisma.ts                 # Prisma client
│   ├── db.ts                     # Database utilities
│   └── utils.ts                  # Helper functions
├── prisma/                       # Database schema
│   └── schema.prisma             # Prisma schema
├── hooks/                        # Custom React hooks
├── contexts/                     # React contexts
├── public/                       # Static assets
└── styles/                       # Global styles
```

## 🗄️ Database Schema

### Key Models

- **Contact** - Contact information and metadata
- **Campaign** - Email campaign definitions
- **EmailTemplate** - Reusable email templates
- **EmailLog** - Individual email send logs with tracking
- **EmailProgress** - Real-time progress tracking for bulk sends
- **CampaignAnalytics** - Aggregated campaign metrics
- **TemplatePerformance** - Template performance metrics
- **Settings** - Application and email provider settings
- **EmailSequence** - Automated email sequences
- **EmailSequenceStep** - Steps in email sequences

## API Endpoints

### Campaigns

- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/[id]` - Get campaign details
- `PUT /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign

### Contacts

- `GET /api/contacts` - List contacts with filtering
- `POST /api/contacts` - Create contact
- `GET /api/contacts/[id]` - Get contact details
- `PUT /api/contacts/[id]` - Update contact
- `DELETE /api/contacts/[id]` - Delete contact
- `GET /api/contacts/[id]/email-history` - Get contact email history
- `GET /api/contacts/valid-emails` - Get valid email addresses

### Email Sending

- `POST /api/send-email` - Send single email
- `POST /api/send-bulk-email` - Send bulk emails
- `GET /api/send-bulk-email?progressId=xxx` - Get real-time progress

### Analytics

- `GET /api/analytics` - Get analytics overview
- `GET /api/analytics/deliverability` - Get deliverability metrics
- `GET /api/analytics/templates` - Get template analytics

### Tracking

- `GET /api/track/open/[id]` - Track email opens
- `GET /api/track/click/[id]` - Track email clicks

### Settings

- `GET /api/settings/email` - Get email settings
- `POST /api/settings/email` - Update email settings

## Usage Guide

### Creating a Campaign

1. Navigate to **Campaigns** → **Create Campaign**
2. Select or create an email template
3. Customize the template with personalization variables
4. Preview the email
5. Select recipients from your contacts
6. Send test email (optional)
7. Launch the campaign

### Managing Contacts

1. Navigate to **Contacts**
2. **Add Contact**: Click "Add Contact" and fill in details
3. **Bulk Upload**: Click "Bulk Upload" and upload CSV file
4. **Filter Contacts**: Use filters to segment contacts
5. **View History**: Click on a contact to see email history

### Email Personalization

Use these variables in your email templates:

- `[Name]` - Full recipient name
- `[First Name]` - First name only
- `[Last Name]` - Last name only
- `[Email]` - Email address
- `[Company]` - Company name
- `[Phone]` - Phone number
- `[Tags]` - Contact tags

### Real-Time Progress Tracking

When sending bulk emails:

1. A progress modal appears automatically
2. Real-time updates show:
   - Total emails vs processed
   - Success and error counts
   - Current batch progress
   - Completion status
3. Progress is stored in database and persists across page refreshes

### Analytics Dashboard

1. Navigate to **Analytics**
2. View key metrics:
   - Open rates
   - Click rates
   - Reply rates
   - Bounce rates
   - Deliverability scores
3. Compare campaign performance
4. Track template effectiveness

## Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables
   - Deploy

3. **Set Environment Variables** in Vercel dashboard:
   - `DATABASE_URL`
   - `MAILWAY_AWS_ACCESS_KEY_ID`
   - `MAILWAY_AWS_SECRET_ACCESS_KEY`
   - `MAILWAY_AWS_REGION`
   - `NEXT_PUBLIC_BASE_URL`

### Database Setup

For production, use a managed PostgreSQL service:

- **Neon** (recommended for serverless)
- **Supabase**
- **AWS RDS**
- **Railway**
- **Render**

Update `DATABASE_URL` in your environment variables.

### Build for Production

```bash
npm run build
npm start
```

## Security Considerations

- **Environment Variables**: Never commit `.env` files
- **AWS Credentials**: Use IAM roles with minimal permissions
- **Database**: Use connection pooling and SSL
- **Rate Limiting**: Configure appropriate rate limits
- **Email Validation**: Always validate email addresses
- **CSRF Protection**: Next.js provides built-in CSRF protection

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Generate Prisma Client
npx prisma generate

# Push schema changes
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for code formatting (recommended)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [GrapesJS](https://grapesjs.com/) - Visual page builder
- [AWS SES](https://aws.amazon.com/ses/) - Email delivery service

## Support

For support, email support@eshway.com or open an issue in the repository.

## Roadmap

- [ ] Email automation workflows
- [ ] A/B testing for campaigns
- [ ] Advanced segmentation
- [ ] Email scheduling
- [ ] Multi-language support
- [ ] Webhook integrations
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Mobile app
- [ ] Team collaboration features

---

**Made with ❤️ by Eshway**
