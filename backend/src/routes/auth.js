import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { getUploadAvatar } from "../config/cloudinary.js"
import { generateInitialsAvatar } from "../utils/avatarGenerator.js"

const router = express.Router()

// Register user with optional avatar upload
router.post("/register", (req, res, next) => {
  const uploadAvatar = getUploadAvatar()

  uploadAvatar.single("avatar")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message })
    }

    try {
      const { name, email, password } = req.body

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Please provide all required fields" })
      }

      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" })
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      let avatarUrl
      if (req.file) {
        avatarUrl = req.file.path
      } else {
        avatarUrl = generateInitialsAvatar(name)
      }

      const user = new User({
        name,
        email,
        password: hashedPassword,
        avatar: avatarUrl,
      })

      await user.save()

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Server error during registration" })
    }
  })
})

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
})

export default router
