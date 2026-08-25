const supabase = require('../config/db');

// Teacher/Admin: Create Class Assignment
const createAssignment = async (req, res) => {
  try {
    const { title, subject, class_level, description, file_url, due_date } = req.body;

    if (!title || !subject || !class_level || !due_date) {
      return res.status(400).json({ error: "Title, subject, class level, and due date are required." });
    }

    const { data: assignment, error } = await supabase
      .from('assignments')
      .insert([{ title, subject, class_level, description, file_url, due_date }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ message: "Assignment uploaded successfully!", assignment });
  } catch (err) {
    res.status(500).json({ error: "Server error creating assignment." });
  }
};

// Student/Teacher: Get Assignments by Class Level
const getAssignmentsByClass = async (req, res) => {
  try {
    const { classLevel } = req.params;

    const { data: assignments, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('class_level', classLevel)
      .order('due_date', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ assignments });
  } catch (err) {
    res.status(500).json({ error: "Server error fetching assignments." });
  }
};

module.exports = { createAssignment, getAssignmentsByClass };