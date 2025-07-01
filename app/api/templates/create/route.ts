import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Insert new template
    const result = await sql`
      INSERT INTO templates (
        title, 
        description, 
        category, 
        link, 
        html_content, 
        content_length,
        author
      ) VALUES (
        ${data.title},
        ${data.description || ''},
        ${data.category || 'Other'},
        ${data.link || '#'},
        ${data.html_content || ''},
        ${data.html_content ? data.html_content.length : 0},
        ${data.author || 'Anonymous'}
      ) RETURNING id
    `;
    
    return NextResponse.json({ 
      success: true, 
      id: result.rows[0].id,
      message: 'Template created successfully'
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Failed to create template',
      details: error.message 
    }, { status: 500 });
  }
}