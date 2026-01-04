// Email service for sending test results via SendGrid
const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY
const FROM_EMAIL = import.meta.env.VITE_SENDGRID_FROM_EMAIL || 'info@powergenequipment.com'
const FROM_NAME = 'Generator Source Admin'

export async function sendTestResultEmail(result, branchManagerEmail) {
  try {
    // Prepare email content
    const applicantEmail = result.applicant_email
    const applicantName = result.applicant_name
    const score = result.score
    const totalQuestions = result.total_questions
    const percentage = result.percentage
    const passed = result.passed
    const branch = result.branch
    const skillLevel = result.skill_level
    const testDate = new Date(result.test_date).toLocaleDateString()
    
    // Email subject
    const subject = `Generator Technician Test Results - ${applicantName}`
    
    // Email body
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a8a;">Generator Technician Test Results</h2>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Applicant:</strong> ${applicantName}</p>
          <p><strong>Email:</strong> ${applicantEmail}</p>
          <p><strong>Phone:</strong> ${result.applicant_phone || 'N/A'}</p>
          <p><strong>Branch:</strong> ${branch}</p>
          <p><strong>Skill Level:</strong> ${skillLevel}</p>
          <p><strong>Test Date:</strong> ${testDate}</p>
        </div>
        
        <div style="background-color: ${passed ? '#dcfce7' : '#fee2e2'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: ${passed ? '#166534' : '#991b1b'};">
            Result: ${passed ? 'PASSED' : 'NOT PASSED'}
          </h3>
          <p><strong>Score:</strong> ${score} / ${totalQuestions} (${percentage}%)</p>
          <p><strong>Time Taken:</strong> ${Math.floor(result.time_taken_seconds / 60)} minutes</p>
        </div>
        
        <div style="margin: 20px 0;">
          <p>Please find the test report attached${passed ? ' along with the certificate' : ''}.</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>This is an automated email from Generator Source Test Portal.</p>
        </div>
      </div>
    `
    
    // Prepare attachments
    const attachments = []
    
    // Add report PDF if available
    if (result.report_pdf) {
      attachments.push({
        content: await fetchPdfAsBase64(result.report_pdf),
        filename: `${applicantName.replace(/\s+/g, '_')}_Test_Report.pdf`,
        type: 'application/pdf',
        disposition: 'attachment'
      })
    }
    
    // Add certificate PDF if passed and available
    if (passed && result.certificate_pdf) {
      attachments.push({
        content: await fetchPdfAsBase64(result.certificate_pdf),
        filename: `${applicantName.replace(/\s+/g, '_')}_Certificate.pdf`,
        type: 'application/pdf',
        disposition: 'attachment'
      })
    }
    
    // Send email to applicant
    await sendEmail({
      to: applicantEmail,
      subject,
      html: htmlContent,
      attachments
    })
    
    // Send email to branch manager if email is found
    if (branchManagerEmail) {
      await sendEmail({
        to: branchManagerEmail,
        subject: `[Branch Manager] ${subject}`,
        html: htmlContent,
        attachments
      })
    }
    
    console.log(`✅ Emails sent successfully to ${applicantEmail}${branchManagerEmail ? ` and ${branchManagerEmail}` : ''}`)
    return true
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return false
  }
}

async function fetchPdfAsBase64(url) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error fetching PDF:', error)
    throw error
  }
}

async function sendEmail({ to, subject, html, attachments }) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDGRID_API_KEY}`
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }],
        subject
      }],
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      content: [{
        type: 'text/html',
        value: html
      }],
      attachments: attachments || []
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid API error: ${error}`)
  }
  
  return response
}
