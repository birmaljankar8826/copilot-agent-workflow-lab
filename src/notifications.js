const { v4: uuidv4 } = require('uuid');
const sanitizeHtml = require('sanitize-html');

const notifications = new Map();

function sendNotification(notification) {
  if (!notification || !notification.userId || typeof notification.userId !== 'string') {
    throw new Error('Invalid notification: userId must be a non-empty string');
  }
  if (!notification.message || typeof notification.message !== 'string') {
    throw new Error('Invalid notification: message must be a non-empty string');
  }
  if (notification.message.length > 500) {
    throw new Error('Invalid notification: message must not exceed 500 characters');
  }
  const sanitizedMessage = sanitizeHtml(notification.message);
  const record = {
    id: uuidv4(),
    userId: notification.userId,
    message: sanitizedMessage,
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
  const notificationMap = new Map();
  for (const [userId, userNotifications] of notifications.entries()) {
    for (const notification of userNotifications) {
      notificationMap.set(notification.id, { userId, notification });
    }
  }
  if (!notificationMap.has(id)) {
    throw new Error('Notification ' + id + ' not found');
  }
  const { userId, notification } = notificationMap.get(id);
  const updatedNotification = { ...notification, read: true };
  const userNotifications = notifications.get(userId);
  const index = userNotifications.findIndex(n => n.id === id);
  userNotifications[index] = updatedNotification;
  return updatedNotification;
}

function getUnread(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  if (!notifications.has(userId)) {
    console.warn(`No notifications found for userId: ${userId}`);
    return [];
  }
  const userNotifications = notifications.get(userId);
  return userNotifications.filter(n => !n.read);
}

function getAll(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  if (!notifications.has(userId)) {
    console.warn(`No notifications found for userId: ${userId}`);
    return [];
  }
  return notifications.get(userId);
}

module.exports = { sendNotification, markAsRead, getUnread, getAll };
