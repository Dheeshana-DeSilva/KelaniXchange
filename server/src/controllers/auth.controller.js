const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// REGISTER USER
const registerUser = async (req, res) => {
    try {
        const { fullName, username, email, phone, password } = req.body;
        const cleanPhone = (phone || "").replace(/\s+/g, "");
        const isValidPhone = /^(?:0\d{9}|\+94\d{9})$/.test(cleanPhone);

        if (!fullName || !username || !email || !phone || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        if (!isValidPhone) {
            return res.status(400).json({
                message: "Enter a valid phone number",
            });
        }

        const existingEmail = await User.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({
                message: "Email already registered",
            });
        }

        const existingUsername = await User.findOne({ username });

        if (existingUsername) {
            return res.status(400).json({
                message: "Username already taken",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName,
            username,
            email,
            phone: cleanPhone,
            password: hashedPassword,
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profileImage: user.profileImage || "",
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Registration failed",
            error: error.message,
        });
    }
};

// LOGIN USER
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        if (user.isSuspended) {
            return res.status(403).json({
                message: "Your account has been suspended",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profileImage: user.profileImage || "",
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Login failed",
            error: error.message,
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
