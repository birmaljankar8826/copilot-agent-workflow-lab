const { v4: uuidv4 } = require('uuid');
const sanitizeHtml = require('sanitize-html');

const notifications = new Map();
const notificationById = new Map();

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
  const sanitizedMessage = sanitizeHtml(notification.message, {
    allowedTags: [],
    allowedAttributes: {}
  });
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
  notificationById.set(record.id, { userId: notification.userId, notification: record });
  return record;
}

function markAsRead(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid id: id must be a non-empty string');
  }
  if (!notificationById.has(id)) {
    throw new Error('Notification ' + id + ' not found');
  }
  const { userId, notification } = notificationById.get(id);
  const updatedNotification = { ...notification, read: true };
  const userNotifications = notifications.get(userId);
  const updatedNotifications = userNotifications.map(n => (n.id === id ? updatedNotification : n));
  notifications.set(userId, updatedNotifications);
  notificationById.set(id, { userId, notification: updatedNotification });
  return updatedNotification;
}

function getUnread(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  if (!notifications.has(userId)) {
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
    return [];
  }
  return [...notifications.get(userId)];
}

module.exports = { sendNotification, markAsRead, getUnread, getAll };
