const notifications = [];

function sendNotification(notification) {
  if (!notification || !notification.userId || typeof notification.userId !== 'string') {
    throw new Error('Invalid notification: userId must be a non-empty string');
  }
  if (!notification.message || typeof notification.message !== 'string') {
    throw new Error('Invalid notification: message must be a non-empty string');
  }
  const record = {
    id: 'NOTIF-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    userId: notification.userId,
    message: notification.message,
    read: false,
    createdAt: new Date().toISOString()
  };
  notifications.push(record);
  return record;
}

function markAsRead(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid id: id must be a non-empty string');
  }
  const index = notifications.findIndex(n => n.id === id);
  if (index === -1) {
    throw new Error('Notification ' + id + ' not found');
  }
  notifications[index] = { ...notifications[index], read: true };
  return notifications[index];
}

function getUnread(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  return notifications.filter(n => n.userId === userId && !n.read);
}

function getAll(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  return notifications.filter(n => n.userId === userId);
}

module.exports = { sendNotification, markAsRead, getUnread, getAll };
