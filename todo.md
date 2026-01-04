# Admin Portal TODO

## Completed Features
- [x] Display test results in consolidated table
- [x] Show all 11 required fields (Name, Email, Phone, Location, Level, Date, Score, Time, Passed, Report PDF, Certificate PDF)
- [x] View Report and Certificate PDFs in new tab

## In Progress
- [x] Implement automatic email sending when new test result is added
- [x] Send email to applicant with report PDF + certificate PDF (if passed)
- [x] Send email to branch manager with report PDF + certificate PDF (if passed)
- [x] Match branch manager email from Admin Users table by branch name
- [x] Simplify email body to concise summary format
- [ ] Configure Netlify environment variables for SendGrid

## New Tasks
- [x] Update admin portal to show Test Sessions tab with all 11 fields: Name, Email, Phone, Location, Level, Date, Score, Time (min), Passed, Report PDF, Certificate PDF
- [x] Remove unnecessary tabs: Applicants and Results (merged into Test Sessions)
- [x] Keep tabs: Dashboard, Test Sessions, Questions, Scoring, Settings

## PDF Generation Issues (New - Jan 4, 2026)
- [ ] Investigate test app PDF generation implementation
- [ ] Check if report_pdf and certificate_pdf columns exist in results table
- [ ] Implement PDF generation for test reports
- [ ] Implement PDF generation for certificates (passing tests only)
- [ ] Store PDFs in accessible location (Supabase Storage or CDN)
- [ ] Update database with real PDF URLs
- [ ] Verify PDFs display correctly in admin portal
