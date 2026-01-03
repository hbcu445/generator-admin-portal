# Generator Source Admin Portal

Professional admin dashboard for managing Generator Technician Knowledge Tests.

## Architecture

- **Frontend:** React + Vite
- **Backend:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth

## Setup & Recovery Instructions

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hbcu445/generator-admin-portal.git
   cd generator-admin-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file with:
   ```
   SUPABASE_URL=https://nnaakuspoqjdyzheklyb.supabase.co
   SUPABASE_KEY=your_supabase_anon_key
   PORT=3000
   NODE_ENV=production
   ```

4. **Build the frontend**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   ```

   Or for development:
   ```bash
   npm run dev
   ```

### Project Structure

```
generator-admin-portal/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   └── DashboardPage.jsx
│   ├── components/
│   │   ├── ApplicantsTab.jsx
│   │   ├── TestSessionsTab.jsx
│   │   ├── ResultsTab.jsx
│   │   ├── BranchesTab.jsx
│   │   └── ActivityLogTab.jsx
│   ├── App.jsx
│   └── main.jsx
├── server.js (Express backend)
├── package.json
├── vite.config.js
└── netlify.toml
```

### Features

- **Admin Authentication:** Secure login with Supabase Auth
- **Applicant Management:** Add, view, and delete test applicants
- **Test Sessions:** Create and manage test sessions for applicants
- **Results Analytics:** View test results with filtering and statistics
- **Branch Management:** Manage multiple branch locations (admin only)
- **Activity Logging:** Track all admin actions

### API Endpoints

- `POST /api/auth/login` - Admin login
- `GET /api/data/:table` - Fetch data from any table
- `POST /api/data/:table` - Create new records
- `DELETE /api/data/:table/:id` - Delete records

### Recovery & Rebuild

If you need to rebuild the project:

1. **Clear build artifacts**
   ```bash
   rm -rf dist node_modules
   npm install
   ```

2. **Rebuild frontend**
   ```bash
   npm run build
   ```

3. **Start server**
   ```bash
   npm start
   ```

### Deployment

The project is configured for deployment on Netlify or similar platforms.

**Netlify Configuration:**
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variables: Set `SUPABASE_URL` and `SUPABASE_KEY` in Netlify dashboard

### Troubleshooting

**Build fails with module not found:**
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules: `rm -rf node_modules && npm install`

**Server won't start:**
- Check that port 3000 is available
- Verify environment variables are set correctly
- Check server logs for errors

**Authentication issues:**
- Verify Supabase credentials
- Ensure admin user exists in Supabase
- Check browser console for error messages

### Support

For issues or questions, refer to the Supabase documentation or contact the development team.
