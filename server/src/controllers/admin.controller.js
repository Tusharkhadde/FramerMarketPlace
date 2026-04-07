import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/apiResponse.js';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const farmersCount = await User.countDocuments({ userType: 'farmer' });
  const buyersCount = await User.countDocuments({ userType: 'buyer' });
  const pendingVerifications = await User.countDocuments({ userType: 'farmer', isVerified: false });
  const bannedUsers = await User.countDocuments({ isBanned: true });

  const totalProducts = await Product.countDocuments();
  
  // Get revenue and total orders
  const orders = await Order.find({ paymentStatus: 'completed' });
  const revenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
  const totalOrders = await Order.countDocuments();

  // Optionally, get some recent activities
  const recentFarmers = await User.find({ userType: 'farmer' }).sort('-createdAt').limit(5).select('fullName district isVerified createdAt');

  sendResponse(res, 200, {
    users: {
      total: totalUsers,
      farmers: farmersCount,
      buyers: buyersCount,
      pendingVerifications,
      banned: bannedUsers,
    },
    products: {
      total: totalProducts,
    },
    orders: {
      total: totalOrders,
      revenue,
    },
    recentFarmers
  }, 'Admin stats fetched');
});

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const { search, type, status } = req.query;

  let query = {};

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  if (type && type !== 'all') {
    query.userType = type;
  }

  if (status && status !== 'all') {
    if (status === 'verified') query.isVerified = true;
    if (status === 'unverified') query.isVerified = false;
    if (status === 'banned') query.isBanned = true;
  }

  const users = await User.find(query).sort('-createdAt');

  sendResponse(res, 200, { users }, 'Users fetched successfully');
});

// @desc    Update user status (ban, unban, verify)
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { action } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  if (user.userType === 'admin') {
    return next(new ApiError('Cannot alter admin account', 403));
  }

  switch (action) {
    case 'verify':
      user.isVerified = true;
      break;
    case 'ban':
      user.isBanned = true;
      user.isActive = false;
      break;
    case 'unban':
      user.isBanned = false;
      user.isActive = true;
      break;
    default:
      return next(new ApiError('Invalid action', 400));
  }

  await user.save({ validateBeforeSave: false });

  sendResponse(res, 200, { user }, `User ${action} successful`);
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError('User not found', 404));
  }

  if (user.userType === 'admin') {
    return next(new ApiError('Cannot delete admin account', 403));
  }

  // Delete all products by this user if they are a farmer
  if (user.userType === 'farmer') {
    await Product.deleteMany({ farmer: user._id });
  }

  await user.deleteOne();

  sendResponse(res, 200, {}, 'User deleted successfully');
});
