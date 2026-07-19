import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Explicitly select the password
    const admin = await User.findOne({ 
      username, 
      role: { $in: ['admin', 'super_admin'] } 
    }).select('+password');

    // Generic error message to prevent enumeration
    if (!admin) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ error: 'This administrator account has been disabled.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid administrator credentials.' });
    }

    const token = jwt.sign(
      { id: admin._id, uid: admin.uid, role: admin.role },
      process.env.JWT_SECRET || 'skillnova_fallback_jwt_secret_dev',
      { expiresIn: '1d' }
    );

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // Don't send the password back
    const adminObj = admin.toObject();
    delete adminObj.password;

    res.json({
      message: 'Login successful',
      user: adminObj
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const adminLogout = (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  res.json({ message: 'Logged out successfully' });
};

export const getAdminMe = async (req, res) => {
  try {
    // req.user is set by authenticateAdmin middleware
    const admin = await User.findById(req.user.id).select('-password -__v');
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ error: 'This administrator account has been disabled.' });
    }

    res.json(admin);
  } catch (error) {
    console.error('Admin me fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { name, phone, email } = req.body;

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    if (name !== undefined) admin.name = name;
    if (phone !== undefined) admin.phone = phone;
    // Don't allow changing email if it's tied to firebase or requires verification, but since it's just profile updates, we'll allow name and phone for now.

    await admin.save();

    const adminObj = admin.toObject();
    delete adminObj.password;
    delete adminObj.__v;

    res.json({ message: 'Profile updated successfully', user: adminObj });
  } catch (error) {
    console.error('Admin profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
