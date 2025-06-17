// Utility for email service that can switch between mock and real email
import nodemailer from "nodemailer"

class EmailService {
  constructor() {
    this.isConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)

    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "EMAIL.gmail.com",
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })
    }
  }

  async sendEmail(to, subject, text, html = null) {
    if (!this.isConfigured) {
      // Mock email service
      console.log(`📧 Mock Email Service`)
      console.log(`📧 To: ${to}`)
      console.log(`📧 Subject: ${subject}`)
      console.log(`📧 Content: ${text}`)
      console.log("---")
      return Promise.resolve({ messageId: "mock-" + Date.now() })
    }

    try {
      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
      })

      console.log(`✅ Email sent successfully to ${to}`)
      return result
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error)
      throw error
    }
  }

  async sendInquiryEmails(inquiryData) {
    const { item, quantity, unit, email, message } = inquiryData

    const adminEmailContent = `
      New Inquiry Received:
      
      Item: ${item}
      Quantity: ${quantity} ${unit}
      Customer Email: ${email}
      Message: ${message || "No additional message"}
      
      Date: ${new Date().toLocaleString()}
    `

    const customerEmailContent = `
      Thank you for your inquiry!
      
      We have received your request for: ${item}
      Quantity: ${quantity} ${unit}
      
      Our team will review your inquiry and get back to you within 24 hours.
      
      Best regards,
      ECommerce Team
    `

    // Send to admin
    await this.sendEmail(
      process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "admin@ecommerce.com",
      `New Inquiry: ${item}`,
      adminEmailContent,
    )

    // Send confirmation to customer
    await this.sendEmail(email, "Inquiry Received - We'll get back to you soon!", customerEmailContent)
  }
}

export default new EmailService()
