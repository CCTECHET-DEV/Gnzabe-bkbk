import mongoose from 'mongoose';
import User from '../model/userModel'; // Adjust the path as necessary

async function deleteOldUnverifiedUsers() {
  const cutoffDate = new Date(Date.now() - 60 * 1000); // 24 hours ago

  try {
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: cutoffDate },
    });

    console.log(`Deleted ${result.deletedCount} unverified users`);
  } catch (error) {
    console.error('Error deleting unverified users:', error);
  }
}

export default deleteOldUnverifiedUsers;
