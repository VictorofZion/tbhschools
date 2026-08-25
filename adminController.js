const supabase = require('../config/db');

// Get all users (including student profile data & avatars)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let query = supabase
      .from('users')
      .select('id, full_name, email, role, avatar_url, created_at, students(id, reg_number, serial_number, class_level, fee_status)');

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error } = await query;

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ error: "Server error fetching users." });
  }
};

// Update user details & display photo
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, email, avatar_url, role, reg_number, serial_number, class_level } = req.body;

    // 1. Update primary user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .update({ full_name, email, avatar_url })
      .eq('id', userId)
      .select()
      .single();

    if (userError) return res.status(400).json({ error: userError.message });

    // 2. If student, update student table details
    if (role === 'student' || user.role === 'student') {
      const { error: studentError } = await supabase
        .from('students')
        .update({ reg_number, serial_number, class_level })
        .eq('user_id', userId);

      if (studentError) return res.status(400).json({ error: studentError.message });
    }

    res.status(200).json({ message: "User profile updated successfully!", user });
  } catch (err) {
    res.status(500).json({ error: "Server error updating user profile." });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error deleting user." });
  }
};

// Update Student Fee Status
const updateFeeStatus = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { fee_status } = req.body;

    if (!['PAID', 'PARTIAL', 'UNPAID'].includes(fee_status)) {
      return res.status(400).json({ error: "Invalid status. Must be PAID, PARTIAL, or UNPAID." });
    }

    const { data, error } = await supabase
      .from('students')
      .update({ fee_status })
      .eq('id', studentId)
      .select();

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ message: "Student fee status updated.", student: data });
  } catch (err) {
    res.status(500).json({ error: "Server error updating fee status." });
  }
};

module.exports = { getAllUsers, updateUser, deleteUser, updateFeeStatus };