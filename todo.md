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
