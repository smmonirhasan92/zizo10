const { Notification, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get My Notifications (User)
// Get My Notifications (User)
exports.getMyNotifications = async (req, res) => {
    try {
        if (!req.user || !req.user.user || !req.user.user.id) {
            console.error("Auth Fail in Notifications: req.user missing");
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const userId = req.user.user.id;

        // Safety Check: If Model missing
        if (!Notification) {
            console.error("CRITICAL: Notification Model is Undefined!");
            return res.json([]); // Fail Safe: Return empty list
        }

        const notifications = await Notification.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(notifications);
    } catch (err) {
        // Detailed Logging for Debugging
        console.error("Notification Fetch Error:", err.message);
        console.error("Stack:", err.stack);

        // Fail Safe for Frontend: Return empty array instead of 500 Crash
        // This prevents the "White Screen" or "Server Error" on the bell icon.
        return res.json([]);
    }
};

// Mark as Read
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.user.id;
        const { id } = req.body;

        // If id provided, mark one. Else mark all for user.
        if (id) {
            await Notification.update({ isRead: true }, { where: { id, userId } });
        } else {
            await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Send Single Message (Step 7)
exports.sendAdminMessage = async (req, res) => {
    try {
        const { userId, message, title } = req.body;
        if (!userId || !message) return res.status(400).json({ message: 'User ID and Message required' });

        await Notification.create({
            userId,
            type: 'admin_message',
            title: title || 'Message from Admin',
            message,
            isRead: false
        });

        res.json({ message: 'Message sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Send Bulk/Filtered Message (Step 7)
exports.sendBulkMessage = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { userIds, roleFilter, tierFilter, message, title } = req.body;
        // userIds: [1, 2, 3] (Explicit selection)
        // roleFilter: 'user' | 'agent'
        // tierFilter: 'Gold' | 'VIP' (Rank)

        if (!message) return res.status(400).json({ message: 'Message content required' });

        let targetUserIds = [];

        if (userIds && userIds.length > 0) {
            targetUserIds = userIds;
        } else {
            // Usage of Filters
            const whereClause = {};
            if (roleFilter) whereClause.role = roleFilter;
            if (tierFilter) whereClause.account_tier = tierFilter;
            // Only active users? User request didn't specify, but usually yes.
            // Let's include all for now unless specified.
            // whereClause.accountStatus = 'active';

            const users = await User.findAll({ where: whereClause, attributes: ['id'], transaction: t });
            targetUserIds = users.map(u => u.id);
        }

        if (targetUserIds.length === 0) {
            await t.rollback();
            return res.status(404).json({ message: 'No users found for criteria' });
        }

        const notifications = targetUserIds.map(uid => ({
            userId: uid,
            type: 'admin_message', // or 'admin_bulk'
            title: title || 'Notice from Admin',
            message,
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await Notification.bulkCreate(notifications, { transaction: t });

        await t.commit();
        res.json({ message: `Message sent to ${targetUserIds.length} users` });

    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
