'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getOnlineUsers = () => require('../socket/socket').getOnlineUsers();

const push = async (io, { userId, type, title, message, link = null }) => {
  const notification = await prisma.notification.create({
    data: { userId, type, title, message, link },
  });
  if (io) {
    const onlineUsers = getOnlineUsers();
    const socketId = onlineUsers.get(userId);
    if (socketId) {
      io.to(socketId).emit('notification', notification);
    }
  }
  return notification;
};

const getForUser = (userId, { skip = 0, take = 20 } = {}) =>
  prisma.notification.findMany({
    where: { userId },
    orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
    skip,
    take,
  });

const countUnread = (userId) =>
  prisma.notification.count({ where: { userId, isRead: false } });

const markRead = (id, userId) =>
  prisma.notification.updateMany({
    where: { id, userId },
    data: { isRead: true },
  });

const markAllRead = (userId) =>
  prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

const remove = (id, userId) =>
  prisma.notification.deleteMany({ where: { id, userId } });

module.exports = { push, getForUser, countUnread, markRead, markAllRead, remove };
