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
    const subject = `Generator Technician Skill Test Results - ${applicantName}`
    
    // Format date and time
    const testDateTime = new Date(result.test_date).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    
    // Email body - simple and concise
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p>Dear Recipient,</p>
        
        <p>${applicantName} performed the Generator Technician Skill Test and scored ${score} out of ${totalQuestions} (${percentage}%).</p>
        
        <p>Please see attached test results${passed ? ' and certificate achieved' : ''}.</p>
        
        <p><strong>Test Date & Time:</strong> ${testDateTime}</p>
        
        <p>Best regards,<br>Generator Source Admin</p>
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
