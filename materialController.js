const supabase = require('../config/db');

// 1. Teacher/Admin: Upload Class Note or Assignment with Document Attachment
const uploadMaterial = async (req, res) => {
  try {
    const { title, subject, class_level, material_type, description, file_name, file_data, due_date } = req.body;

    if (!title || !subject || !class_level || !file_name || !file_data) {
      return res.status(400).json({ error: "Title, subject, class level, file name, and document file are required." });
    }

    const type = material_type === 'assignment' ? 'assignment' : 'note';

    const { data: material, error } = await supabase
      .from('class_materials')
      .insert([{
        title,
        subject,
        class_level,
        material_type: type,
        description,
        file_name,
        file_data,
        due_date: type === 'assignment' ? due_date : null
      }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ message: `${type === 'note' ? 'Class Note' : 'Assignment'} uploaded successfully!`, material });
  } catch (err) {
    res.status(500).json({ error: "Server error uploading class material." });
  }
};

// 2. Student/Teacher: Get Class Materials by Class Level
const getMaterialsByClass = async (req, res) => {
  try {
    const { classLevel } = req.params;
    const { type } = req.query; // Optional filter: ?type=note or ?type=assignment

    let query = supabase
      .from('class_materials')
      .select('*')
      .eq('class_level', classLevel)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('material_type', type);
    }

    const { data: materials, error } = await query;

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ materials });
  } catch (err) {
    res.status(500).json({ error: "Server error fetching class materials." });
  }
};

module.exports = { uploadMaterial, getMaterialsByClass };