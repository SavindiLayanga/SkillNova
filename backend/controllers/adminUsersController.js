import { User } from '../models/User.js';
import { CVAnalysis } from '../models/CVAnalysis.js';
import { SkillTest } from '../models/SkillTest.js';
import mongoose from 'mongoose';
import { getFirebaseAuth } from '../firebase.js';

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Cap at 50
    const search = req.query.search || '';
    const status = req.query.status || 'all';

    const query = { role: 'user', isDeleted: false };

    if (search) {
      const cleanSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: cleanSearch, $options: 'i' } },
        { email: { $regex: cleanSearch, $options: 'i' } }
      ];
    }

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }

    const user = await User.findOne({ _id: id, role: 'user', isDeleted: false }).select('-password -__v').lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Fetch related data
    const [latestCV, skillTests] = await Promise.all([
      CVAnalysis.findOne({ userId: user.uid, isActive: true }).sort({ createdAt: -1 }).lean(),
      SkillTest.find({ userId: user.uid }).sort({ createdAt: -1 }).limit(10).lean()
    ]);

    res.json({
      user,
      cvAnalysis: latestCV || null,
      skillTests: skillTests || []
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details.' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean.' });
    }

    const user = await User.findOne({ _id: id, role: 'user', isDeleted: false });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.isActive = isActive;
    await user.save();

    // Sync with Firebase if possible
    try {
      const auth = getFirebaseAuth();
      await auth.updateUser(user.uid, { disabled: !isActive });
    } catch (fbErr) {
      console.warn('Failed to sync disabled status to Firebase (might be local dev):', fbErr.message);
    }

    res.json({ message: `User successfully ${isActive ? 'enabled' : 'disabled'}.`, user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status.' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, careerGoal, targetRole, location, experience } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }

    const user = await User.findOne({ _id: id, role: 'user', isDeleted: false });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Whitelist fields
    if (name !== undefined) user.name = name;
    if (careerGoal !== undefined) user.careerGoal = careerGoal;
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (location !== undefined) user.location = location;
    if (experience !== undefined) user.experience = experience;

    await user.save();
    
    // Don't send back full doc directly in case of unselected fields
    const updatedUser = await User.findById(id).select('-password -__v').lean();

    res.json({ message: 'User updated successfully.', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user.' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the current admin is super_admin
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super Admin access required for deletion.' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }

    const user = await User.findOne({ _id: id, role: 'user', isDeleted: false });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Soft delete
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.isActive = false; // Disable them too
    await user.save();

    // Sync with Firebase
    try {
      const auth = getFirebaseAuth();
      await auth.updateUser(user.uid, { disabled: true });
    } catch (fbErr) {
      console.warn('Failed to sync deletion to Firebase:', fbErr.message);
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
};
