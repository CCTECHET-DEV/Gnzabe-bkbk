import Notification from '../model/notificationModel';
async function deleteOldNotifications() {
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  try {
    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
    });
    console.log(`Deleted ${result.deletedCount} old notifications`);
  } catch (error) {
    console.error('Error deleting old notifications:', error);
  }
}
export default deleteOldNotifications;
