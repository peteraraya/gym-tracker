import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configurar VAPID keys
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

// Solo configurar si las claves están disponibles
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:support@gymtracker.app',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

export async function POST(request: NextRequest) {
  try {
    // Verificar que las claves estén configuradas
    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      return NextResponse.json(
        { error: 'VAPID keys not configured. Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env.local' },
        { status: 500 }
      );
    }

    const { subscription, notification } = await request.json();
    
    if (!subscription || !notification) {
      return NextResponse.json(
        { error: 'Subscription and notification data required' },
        { status: 400 }
      );
    }

    // Payload de la notificación
    const payload = JSON.stringify({
      title: notification.title || 'Gym Tracker',
      body: notification.body || 'Nueva notificación',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: notification.tag || 'default',
      data: notification.data || {},
      actions: notification.actions || [
        { action: 'open', title: 'Abrir' },
        { action: 'close', title: 'Cerrar' }
      ]
    });

    // Enviar notificación
    await webpush.sendNotification(subscription, payload);

    console.log('[API] Push notification sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully'
    });

  } catch (error: any) {
    console.error('[API] Error sending push notification:', error);
    
    // Si la suscripción expiró o es inválida
    if (error.statusCode === 410 || error.statusCode === 404) {
      return NextResponse.json(
        { error: 'Subscription expired or invalid', expired: true },
        { status: 410 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send notification', details: error.message },
      { status: 500 }
    );
  }
}

// Endpoint para enviar notificaciones a todos los usuarios suscritos
export async function GET(request: NextRequest) {
  try {
    // Obtener todas las suscripciones (en producción, desde base de datos)
    const subscriptionsResponse = await fetch(
      `${request.nextUrl.origin}/api/push-subscribe`,
      { method: 'GET' }
    );
    
    const { subscriptions } = await subscriptionsResponse.json();

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscriptions found',
        sent: 0
      });
    }

    // Notificación de ejemplo
    const notification = {
      title: '¡Hora de entrenar! 💪',
      body: 'No olvides completar tu rutina de hoy',
      tag: 'workout-reminder',
      data: { url: '/routines' }
    };

    const payload = JSON.stringify({
      ...notification,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      actions: [
        { action: 'open', title: 'Ver rutinas' },
        { action: 'close', title: 'Cerrar' }
      ]
    });

    // Enviar a todos
    const results = await Promise.allSettled(
      subscriptions.map((sub: any) => 
        webpush.sendNotification(sub, payload)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      message: 'Notifications sent',
      sent: successful,
      failed: failed,
      total: subscriptions.length
    });

  } catch (error) {
    console.error('[API] Error sending bulk notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
