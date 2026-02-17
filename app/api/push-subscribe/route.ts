import { NextRequest, NextResponse } from 'next/server';

// Almacenamiento temporal de suscripciones (en producción usar base de datos)
const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();
    
    // Validar que la suscripción tenga los campos necesarios
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      );
    }

    // Guardar la suscripción (en producción, guardar en base de datos)
    const subscriptionId = subscription.endpoint;
    subscriptions.set(subscriptionId, {
      ...subscription,
      createdAt: new Date().toISOString()
    });

    // console.log('[API] Push subscription saved:', subscriptionId);
    // console.log('[API] Total subscriptions:', subscriptions.size);

    return NextResponse.json({
      success: true,
      message: 'Subscription saved successfully'
    });

  } catch (error) {
    console.error('[API] Error saving subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Endpoint para obtener todas las suscripciones (solo para desarrollo)
  const subscriptionList = Array.from(subscriptions.values());
  
  return NextResponse.json({
    count: subscriptionList.length,
    subscriptions: subscriptionList
  });
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    subscriptions.delete(endpoint);
    
    return NextResponse.json({
      success: true,
      message: 'Subscription removed successfully'
    });

  } catch (error) {
    console.error('[API] Error removing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}
