'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getOnlineUsers = () => require('../socket/socket').getOnlineUsers();

const push = async (io, { userId, type, title, message, link = null }) => {
  try {
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
  } catch (err) {
    console.error('[NotificationService] push failed, bypassing to prevent breaking primary flow:', err);
    return null;
  }
};

const getForUser = (userId, { skip = 0, take = 20, category, isRead, search } = {}) => {
  const where = { userId };

  if (isRead !== undefined) {
    where.isRead = isRead;
  }

  if (category) {
    const cat = category.toLowerCase();
    if (cat === 'messages') {
      where.type = { in: ['NEW_MESSAGE'] };
    } else if (cat === 'events') {
      where.type = { in: ['EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_CANCELLED', 'EVENT_REGISTERED'] };
    } else if (cat === 'jobs') {
      where.type = { in: ['JOB_POSTED', 'JOB_UPDATED'] };
    } else if (cat === 'stories') {
      where.type = { in: ['STORY_APPROVED', 'STORY_REJECTED', 'NEW_STORY'] };
    } else if (cat === 'connections') {
      where.type = { in: ['CONNECTION_REQUEST', 'CONNECTION_ACCEPTED'] };
    } else if (cat === 'system') {
      where.type = { in: ['GENERAL', 'SYSTEM'] };
    } else if (cat === 'unread') {
      where.isRead = false;
    }
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
      { type: { contains: search, mode: 'insensitive' } }
    ];
  }

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
};

const countUnread = (userId) =>
  prisma.notification.count({ where: { userId, isRead: false } });

const countTotal = (userId, { category, isRead, search } = {}) => {
  const where = { userId };

  if (isRead !== undefined) {
    where.isRead = isRead;
  }

  if (category) {
    const cat = category.toLowerCase();
    if (cat === 'messages') {
      where.type = { in: ['NEW_MESSAGE'] };
    } else if (cat === 'events') {
      where.type = { in: ['EVENT_CREATED', 'EVENT_UPDATED', 'EVENT_CANCELLED', 'EVENT_REGISTERED'] };
    } else if (cat === 'jobs') {
      where.type = { in: ['JOB_POSTED', 'JOB_UPDATED'] };
    } else if (cat === 'stories') {
      where.type = { in: ['STORY_APPROVED', 'STORY_REJECTED', 'NEW_STORY'] };
    } else if (cat === 'connections') {
      where.type = { in: ['CONNECTION_REQUEST', 'CONNECTION_ACCEPTED'] };
    } else if (cat === 'system') {
      where.type = { in: ['GENERAL', 'SYSTEM'] };
    } else if (cat === 'unread') {
      where.isRead = false;
    }
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
      { type: { contains: search, mode: 'insensitive' } }
    ];
  }

  return prisma.notification.count({ where });
};

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

module.exports = { push, getForUser, countUnread, countTotal, markRead, markAllRead, remove };
