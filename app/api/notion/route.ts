import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

interface NotionProperty {
  rich_text?: Array<{ plain_text: string }>;
  title?: Array<{ plain_text: string }>;
  select?: { name: string };
  url?: string;
  checkbox?: boolean;
  plain_text?: string;
}

interface NotionPage {
  id: string;
  properties: Record<string, NotionProperty>;
  created_time: string;
  last_edited_time: string;
}

interface NotionResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    const filter: Record<string, unknown> = {};
    
    if (category && category !== 'All') {
      filter.property = 'Category';
      filter.rich_text = { contains: category };
    }

    const allResults: NotionPage[] = [];
    let hasMore = true;
    let nextCursor: string | undefined = undefined;

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID!,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        page_size: 100,
        start_cursor: nextCursor
      }) as NotionResponse;

      allResults.push(...response.results);
      hasMore = response.has_more;
      nextCursor = response.next_cursor || undefined;
    }

    const data = allResults.map((page: NotionPage, index: number) => {
      const categoryValue = 
        page.properties.Category?.rich_text?.[0]?.plain_text ||
        page.properties.Category?.plain_text ||
        'Other';

      const titleValue = 
        page.properties.Title?.title?.[0]?.plain_text ||
        page.properties.Name?.title?.[0]?.plain_text ||
        `Item ${index + 1}`;

      const descriptionValue = 
        page.properties.Description?.rich_text?.[0]?.plain_text ||
        'No description available';

      const linkValue = 
        page.properties.Link?.url ||
        '#';

      const authorValue = 
        page.properties.Author?.rich_text?.[0]?.plain_text ||
        'Anonymous';

      return {
        id: page.id || `notion-${index}`,
        title: titleValue.trim(),
        description: descriptionValue.trim(),
        category: categoryValue.trim(),
        link: linkValue,
        author: authorValue.trim(),
        created: page.created_time,
        last_edited: page.last_edited_time,
        stats: {
          views: Math.floor(Math.random() * 500000) + 10000,
          downloads: Math.floor(Math.random() * 100) + 1,
          rating: parseFloat((Math.random() * 2 + 3).toFixed(1))
        },
        tags: [categoryValue.trim()].filter(Boolean),
        isFree: page.properties.IsFree?.checkbox ?? true
      };
    });

    data.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    let filteredData = data;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = data.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.author.toLowerCase().includes(searchLower)
      );
    }

    const categories = [...new Set(
      allResults
        .map((page: NotionPage) => 
          page.properties.Category?.rich_text?.[0]?.plain_text ||
          page.properties.Category?.plain_text
        )
        .filter(Boolean)
        .map((cat: string) => cat.trim())
        .filter((cat: string) => cat.length > 0)
    )];

    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      categories
    });

  } catch (error) {
    console.error('Notion API Error:', error);
    
    return NextResponse.json({
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 12,
        hasNextPage: false,
        hasPrevPage: false
      },
      categories: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}