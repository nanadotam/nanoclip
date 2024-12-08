import { adminDb } from '@/lib/firebase-admin';

export async function GET(request, { params }) {
  const { slug } = params;
  
  try {
    const clipDoc = await adminDb.collection('clips').doc(slug).get();
    
    if (!clipDoc.exists) {
      return new Response(JSON.stringify({ error: 'Clip not found' }), {
        status: 404,
      });
    }

    const clipData = clipDoc.data();
    const expiryDate = clipData.expiryDate?.toDate();

    return new Response(JSON.stringify({ expiryDate }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error fetching clip:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch clip' }), {
      status: 500,
    });
  }
} 