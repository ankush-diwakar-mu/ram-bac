import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
  try {

    // Get page and limit from query params
    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1),50);

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Fetch paginated users
   const users = await User.find({})
  .select("-password")
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

    // Total users count
    const totalUsers = await User.countDocuments();

    // Total pages
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,

      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },

      count: users.length,

      users,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};