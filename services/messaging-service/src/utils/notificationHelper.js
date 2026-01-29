import User from '../models/User.js';

export const createNotification = async (userId, type, title, message, link) => {
    try {
        const user = await User.findById(userId);
        if (user) {
            user.notifications.push({
                notificationType: type,
                title,
                message,
                link,
                createdAt: new Date()
            });
            await user.save();
        }
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
};
