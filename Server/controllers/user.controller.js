const User = require('../models/user');

module.exports.register = async (req, res) => {
    try {
        const { email, password, name, mobile, gender } = req.body;

        // Validate password
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid password format' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await User.hashPassword(password);

        const user = await User.create({ email, password: hashedPassword, name, mobile, gender });

        const token = user.generateToken();

        res.status(201).json({ message: 'User registered successfully', token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare the hashed password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = user.generateToken();
        res.status(200).json({ message: 'User logged in successfully', token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in user' });
    }
};