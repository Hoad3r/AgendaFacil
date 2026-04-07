const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, requireRole } = require('../middlewares/auth');

const router = Router();
const prisma = new PrismaClient();

router.get('/stats', authenticate, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const [
      totalUsers,
      usersByRole,
      totalEstablishments,
      establishments,
      appointmentsByStatus,
      recentAppointments,
      completedAppointments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
      prisma.establishment.count(),
      prisma.establishment.findMany({
        select: {
          id: true,
          name: true,
          category: true,
          createdAt: true,
          owner: { select: { name: true } },
          _count: { select: { appointments: true, services: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.appointment.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.appointment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { name: true, email: true } },
          establishment: { select: { name: true } },
          service: { select: { name: true, price: true } },
        },
      }),
      prisma.appointment.findMany({
        where: { status: 'COMPLETED' },
        include: { service: { select: { price: true } } },
      }),
    ]);

    const totalRevenue = completedAppointments.reduce(
      (acc, a) => acc + (a.service?.price || 0),
      0
    );

    res.json({
      totalUsers,
      usersByRole,
      totalEstablishments,
      establishments,
      appointmentsByStatus,
      recentAppointments,
      totalRevenue,
      totalAppointments: appointmentsByStatus.reduce((acc, s) => acc + s._count.id, 0),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
