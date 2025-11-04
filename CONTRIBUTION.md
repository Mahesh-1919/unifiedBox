# Contributing to Unified Inbox

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Twilio account (for messaging features)
- Git

### Step-by-Step Setup

1. **Clone Repository**

   ```bash
   git clone <repository-url>
   cd unifiedinbox
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Database Setup**

   Create a PostgreSQL database:

   ```sql
   CREATE DATABASE unifiedinbox;
   ```

4. **Environment Configuration**

   Copy environment template:

   ```bash
   cp .env.example .env.local
   ```

   Configure `.env.local`:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/unifiedinbox"
   DIRECT_URL="postgresql://username:password@localhost:5432/unifiedinbox"

   # Authentication
   BETTER_AUTH_SECRET="generate-random-32-char-string"
   BETTER_AUTH_URL="http://localhost:3000"

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"

   # Twilio (get from Twilio Console)
   TWILIO_ACCOUNT_SID="your_account_sid"
   TWILIO_AUTH_TOKEN="your_auth_token"
   TWILIO_PHONE_NUMBER="+1234567890"
   TWILIO_WHATSAPP_NUMBER="whatsapp:+1234567890"

   # Supabase (for real-time features)
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"

   # Cron Jobs
   CRON_SECRET="any-random-string-for-local"
   VERCEL_CRON_SECRET="any-random-string-for-local"
   ```

5. **Database Migration**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Start Development Server**

   ```bash
   npm run dev
   ```

7. **Access Application**
   - Open http://localhost:3000
   - Create an account via `/signup`
   - Access dashboard at `/inbox`

### Twilio Setup (Optional for Full Functionality)

1. Create Twilio account at https://twilio.com
2. Get Account SID and Auth Token from Console
3. Purchase a phone number for SMS
4. Enable WhatsApp sandbox for testing
5. Configure webhook URLs in Twilio Console:
   `https://your-domain.com/api/webhooks/twilio`

### Supabase Edge Functions Setup (For Scheduled Messages)

1. **Install Supabase CLI**

   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**

   ```bash
   supabase login
   ```

3. **Initialize Supabase in Project**

   ```bash
   supabase init
   ```

4. **Create Edge Function for Cron Jobs**

   ```bash
   supabase functions new send-scheduled-messages
   ```

5. **Add Edge Function Code**
   Create `supabase/functions/send-scheduled-messages/index.ts`:

   ```typescript
   import { serve } from "https://deno.land/std/http/server.ts";

   serve(async () => {
     try {
       const apiUrl = "https://yourdomain.com/api/jobs/sendScheduled"; // 👈 Change this to your actual endpoint

       const res = await fetch(apiUrl, {
         method: "POST", // or GET, depending on your endpoint
         headers: {
           "Content-Type": "application/json",
           // Add auth headers if needed:
           Authorization: `Bearer ${Deno.env.get("API_SECRET") || ""}`,
         },
       });

       const text = await res.text();
       console.log("Response:", res.status, text);

       return new Response(
         JSON.stringify({ ok: true, status: res.status, body: text }),
         { status: 200 }
       );
     } catch (err) {
       console.error("Error calling API:", err);
       return new Response(JSON.stringify({ error: err.message }), {
         status: 500,
       });
     }
   });
   ```

6. **Deploy Edge Function**

   ```bash
   supabase functions deploy send-scheduled-messages
   ```

7. **Set up Cron Job in Supabase Dashboard**

   - Go to Supabase Dashboard → Edge Functions
   - Create a cron job to call your function every minute:

   ```sql
   SELECT cron.schedule(
     'send-scheduled-messages',
     '* * * * *', -- Every minute
     'SELECT net.http_post(
       url:=''https://your-project.supabase.co/functions/v1/send-scheduled-messages'',
       headers:=''{"Authorization": "Bearer YOUR_ANON_KEY"}''
     );'
   );
   ```

8. **Set Environment Variables**
   ```bash
   supabase secrets set TWILIO_ACCOUNT_SID=your_sid
   supabase secrets set TWILIO_AUTH_TOKEN=your_token
   supabase secrets set TWILIO_PHONE_NUMBER=your_number
   ```

## Development Workflow

### Project Structure

```
unifiedinbox/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API endpoints
│   ├── login/             # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Radix)
│   └── *.tsx             # Feature components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication config
│   ├── integrations.ts   # Channel integrations
│   └── prisma-client.ts  # Database client
├── prisma/               # Database schema and migrations
└── hooks/                # Custom React hooks
```

### Code Standards

- **TypeScript**: Strict mode enabled
- **Formatting**: ESLint configuration
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS with component variants
- **Database**: Prisma ORM with type safety

### Making Changes

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Database Changes**

   ```bash
   # Modify prisma/schema.prisma
   npx prisma migrate dev --name your_migration_name
   npx prisma generate
   ```

3. **API Development**

   - Add routes in `app/api/`
   - Use Prisma client for database operations
   - Follow REST conventions

4. **Component Development**

   - Use TypeScript interfaces
   - Implement proper error handling
   - Add loading states

5. **Testing Changes**
   ```bash
   npm run build    # Test build
   npm run lint     # Check code style
   ```

### Common Development Tasks

**Add New Message Channel:**

1. Update `Channel` enum in `prisma/schema.prisma`
2. Add integration in `lib/integrations.ts`
3. Create webhook handler in `app/api/webhooks/`
4. Update UI components for channel display

**Add New API Endpoint:**

1. Create route file in `app/api/`
2. Implement HTTP methods (GET, POST, etc.)
3. Add proper error handling and validation
4. Update frontend queries if needed

**Database Schema Changes:**

1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev`
3. Update TypeScript types
4. Test with existing data

### Debugging

**Database Issues:**

```bash
npx prisma studio    # Visual database browser
npx prisma db push   # Sync schema without migration
```

**API Issues:**

- Check browser Network tab
- Review server logs in terminal
- Use Prisma Studio to verify data

**Build Issues:**

```bash
rm -rf .next         # Clear Next.js cache
npm run build        # Test production build
```

## Deployment

### Vercel Deployment

1. **Connect Repository**

   - Link GitHub repository to Vercel
   - Configure build settings (auto-detected)

2. **Environment Variables**

   - Add all `.env.local` variables to Vercel dashboard
   - Update `BETTER_AUTH_URL` to production domain

3. **Database Setup**

   - Use Vercel Postgres or external PostgreSQL
   - Run migrations: `npx prisma migrate deploy`

4. **Webhook Configuration**
   - Update Twilio webhook URLs to production domain
   - Test message flow

### Manual Deployment

```bash
npm run build
npm start
```

## Contributing Guidelines

1. **Issues**: Use GitHub issues for bugs and feature requests
2. **Pull Requests**: Create PRs against `main` branch
3. **Code Review**: All changes require review
4. **Testing**: Ensure changes don't break existing functionality
5. **Documentation**: Update README for significant changes

## Getting Help

- **Documentation**: Check existing code comments
- **Issues**: Search GitHub issues for similar problems
- **Community**: Create discussion for questions
