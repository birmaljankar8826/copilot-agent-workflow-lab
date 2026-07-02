const { v4: uuidv4 } = require('uuid');

const notifications = new Map();

function sendNotification(notification) {
  if (!notification || !notification.userId || typeof notification.userId !== 'string') {
    throw new Error('Invalid notification: userId must be a non-empty string');
  }
  if (!notification.message || typeof notification.message !== 'string') {
    throw new Error('Invalid notification: message must be a non-empty string');
  }
  const record = {
    id: uuidv4(),
    userId: notification.userId,
    message: notification.message,
    read: false,
    createdAt: new Date().toISOString()
  };
  if (!notifications.has(notification.userId)) {
    notifications.set(notification.userId, []);
  }
  notifications.get(notification.userId).push(record);
  return record;
}

function markAsRead(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid id: id must be a non-empty string');
  }
  for (const [userId, userNotifications] of notifications.entries()) {
    const index = userNotifications.findIndex(n => n.id === id);
    if (index !== -1) {
      const updatedNotification = { ...userNotifications[index], read: true };
      userNotifications[index] = updatedNotification;
      return updatedNotification;
    }
  }
  throw new Error('Notification ' + id + ' not found');
}

function getUnread(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  const userNotifications = notifications.get(userId) || [];
  return userNotifications.filter(n => !n.read);
}

function getAll(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  return notifications.get(userId) || [];
}

module.exports = { sendNotification, markAsRead, getUnread, getAll };
