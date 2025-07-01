import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT COUNT(*) as count FROM templates`;
    
    return NextResponse.json({ 
      success: true,
      message: "Database connected!",
      templates_count: result.rows[0].count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}