const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

// Unified Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    let studentProfile = null;
    if (user.role === 'student') {
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', user.id)
        .single();
      studentProfile = studentData;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        studentProfile
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error during authentication." });
  }
};

// Admin Route: Create New Account with Avatar & Serial Number
const createUser = async (req, res) => {
  try {
    const { full_name, email, password, role, reg_number, class_level, serial_number, avatar_url } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ error: "All required user fields must be supplied." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const profilePic = avatar_url || 'https://via.placeholder.com/150';

    // Insert into users
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{ full_name, email, password_hash, role, avatar_url: profilePic }])
      .select()
      .single();

    if (userError) return res.status(400).json({ error: userError.message });

    // If role is student, insert profile with Serial Number
    if (role === 'student') {
      if (!reg_number || !class_level) {
        return res.status(400).json({ error: "Registration number and class level are required for student accounts." });
      }

      // Generate random unique serial number if not provided
      const finalSerialNumber = serial_number || `SN-TBHS-${Math.floor(100000 + Math.random() * 900000)}`;

      const { error: studentError } = await supabase
        .from('students')
        .insert([{ 
          user_id: user.id, 
          reg_number, 
          class_level, 
          serial_number: finalSerialNumber 
        }]);

      if (studentError) return res.status(400).json({ error: studentError.message });
    }

    res.status(201).json({ message: `${role} user created successfully!`, userId: user.id });
  } catch (err) {
    res.status(500).json({ error: "Server error during account creation." });
  }
};

module.exports = { login, createUser };