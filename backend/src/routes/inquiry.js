// Alternative implementation with real nodemailer (for production)
import express from "express"
import nodemailer from "nodemailer"

const router = express.Router()

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    // Fixed: createTransport (not createTransporter)
    host: process.env.EMAIL_HOST || "EMAIL.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

// Submit inquiry with real email
router.post("/", async (req, res) => {
  try {
    const { item, quantity, unit, email, message } = req.body

    if (!item || !quantity || !email) {
      return res.status(400).json({ message: "Please provide all required fields" })
    }

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("📧 Email credentials not configured, using mock service")

      // Fall back to mock service
      console.log(`📧 Mock email sent to: ${email}`)
      console.log(`📧 Subject: Inquiry Received - ${item}`)

      return res.json({
        message: "Inquiry sent successfully (mock)",
        inquiry: { item, quantity, unit, email, message, createdAt: new Date() },
      })
    }

    // Create email content
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

    // Send emails with real nodemailer
    const transporter = createTransporter()

    // Send email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Inquiry: ${item}`,
      text: adminEmailContent,
    })

    // Send confirmation email to customer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Inquiry Received - We'll get back to you soon!",
      text: customerEmailContent,
    })

    res.json({
      message: "Inquiry sent successfully",
      inquiry: {
        item,
        quantity,
        unit,
        email,
        message,
        createdAt: new Date(),
      },
    })
  } catch (error) {
    console.error("Inquiry submission error:", error)
    res.status(500).json({ message: "Failed to send inquiry" })
  }
})

export default router
