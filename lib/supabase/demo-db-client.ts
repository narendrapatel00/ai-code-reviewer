// Client-side mock database using localStorage. Safe for browser bundles.

interface DemoDbSchema {
  reviews: any[];
  review_findings: any[];
  prompts: any[];
  users: any[];
  api_usage: any[];
  favorites: any[];
}

const DEFAULT_DB: DemoDbSchema = {
  reviews: [
    {
      id: 'mock-1',
      user_id: '00000000-0000-0000-0000-000000000000',
      language: 'typescript',
      original_code: `function calculateTotal(items) {
  let total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`,
      title: 'typescript Review - 6/26/2026',
      score: 85,
      summary: 'The code is functional but could benefit from modern JavaScript constructs and type safety.',
      improved_code: `interface Item {
  price: number;
}

function calculateTotal(items: Item[]): number {
  return items.reduce((total, item) => total + item.price, 0);
}`,
      overall_feedback: 'Replaced var loop with a modern reduce accumulator and added TypeScript interface definitions.',
      created_at: '2026-06-26T12:00:00.000Z',
      updated_at: '2026-06-26T12:00:00.000Z'
    }
  ],
  review_findings: [
    {
      id: 'f-1',
      review_id: 'mock-1',
      category: 'style',
      severity: 'Low',
      title: 'Use let/const instead of var',
      description: 'The variable i is declared using var, which has function scope rather than block scope.',
      how_to_fix: 'Change var to let in the for loop declaration.',
      line_number: 3
    }
  ],
  prompts: [
    {
      id: 'p-1',
      user_id: '00000000-0000-0000-0000-000000000000',
      title: 'Review like Google',
      content: 'Act as a Senior Software Engineer at Google. Focus heavily on scalability, clean architecture, performance, strict typing, and writing extensive unit tests.',
      is_public: false,
      created_at: '2026-06-26T10:00:00.000Z'
    }
  ],
  users: [
    {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'demo@example.com',
      name: 'Demo User',
      avatar_url: '',
      created_at: '2026-06-26T00:00:00.000Z'
    }
  ],
  api_usage: [],
  favorites: []
};

export function getDemoDb(): DemoDbSchema {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('ai_code_reviewer_demo_db');
    if (stored) {
      try {
        return JSON.parse(stored) as DemoDbSchema;
      } catch {
        // ignore
      }
    }
    window.localStorage.setItem('ai_code_reviewer_demo_db', JSON.stringify(DEFAULT_DB));
  }
  return DEFAULT_DB;
}

export function saveDemoDb(db: DemoDbSchema) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('ai_code_reviewer_demo_db', JSON.stringify(db));
  }
}

class MockQueryBuilder {
  private tableName: keyof DemoDbSchema;
  private filters: Array<(item: any) => boolean> = [];
  private orderColumn: string | null = null;
  private orderAscending: boolean = true;
  private limitCount: number | null = null;
  private isSingle: boolean = false;

  constructor(tableName: keyof DemoDbSchema) {
    this.tableName = tableName;
  }

  select(_columns?: string) {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  order(column: string, { ascending } = { ascending: true }) {
    this.orderColumn = column;
    this.orderAscending = ascending;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const res = await this.execute();
      if (onfulfilled) return onfulfilled(res);
      return res;
    } catch (err) {
      if (onrejected) return onrejected(err);
      throw err;
    }
  }

  private async execute() {
    const db = getDemoDb();
    let data = db[this.tableName] || [];

    for (const filter of this.filters) {
      data = data.filter(filter);
    }

    if (this.orderColumn) {
      data = [...data].sort((a, b) => {
        const valA = a[this.orderColumn!];
        const valB = b[this.orderColumn!];
        if (valA < valB) return this.orderAscending ? -1 : 1;
        if (valA > valB) return this.orderAscending ? 1 : -1;
        return 0;
      });
    }

    if (this.limitCount !== null) {
      data = data.slice(0, this.limitCount);
    }

    if (this.isSingle) {
      if (data.length === 0) {
        return { data: null, error: { message: 'Row not found', code: 'PGRST116' } };
      }
      return { data: data[0], error: null };
    }

    return { data, error: null };
  }

  insert(insertData: any) {
    const db = getDemoDb();
    if (!db[this.tableName]) db[this.tableName] = [];

    const itemsToInsert = Array.isArray(insertData) ? insertData : [insertData];
    const insertedItems: any[] = [];

    for (const item of itemsToInsert) {
      const newItem = {
        id: Math.random().toString(36).substring(2, 15),
        created_at: new Date().toISOString(),
        ...item,
      };
      db[this.tableName].push(newItem);
      insertedItems.push(newItem);
    }

    saveDemoDb(db);

    const resultData = Array.isArray(insertData) ? insertedItems : insertedItems[0];

    return {
      select: () => ({
        single: () => ({
          then: (onfulfilled: any) => onfulfilled({ data: insertedItems[0], error: null })
        }),
        then: (onfulfilled: any) => onfulfilled({ data: insertedItems, error: null })
      }),
      then: (onfulfilled: any) => onfulfilled({ data: resultData, error: null })
    };
  }

  async update(updateData: any) {
    const db = getDemoDb();
    let data = db[this.tableName] || [];

    let updatedCount = 0;
    db[this.tableName] = data.map((item: any) => {
      let matches = true;
      for (const filter of this.filters) {
        if (!filter(item)) {
          matches = false;
          break;
        }
      }
      if (matches) {
        updatedCount++;
        return { ...item, ...updateData, updated_at: new Date().toISOString() };
      }
      return item;
    });

    if (updatedCount > 0) {
      saveDemoDb(db);
    }

    return { data: null, error: null };
  }

  async delete() {
    const db = getDemoDb();
    let data = db[this.tableName] || [];

    let deletedCount = 0;
    db[this.tableName] = data.filter((item: any) => {
      let matches = true;
      for (const filter of this.filters) {
        if (!filter(item)) {
          matches = false;
          break;
        }
      }
      if (matches) {
        deletedCount++;
        return false;
      }
      return true;
    });

    if (deletedCount > 0) {
      saveDemoDb(db);
    }

    return { data: null, error: null };
  }
}

export function createMockSupabaseClient() {
  const auth = {
    getUser: async () => {
      return { data: { user: { id: '00000000-0000-0000-0000-000000000000', email: 'demo@example.com' } }, error: null };
    },
    getSession: async () => {
      return { data: { session: { user: { id: '00000000-0000-0000-0000-000000000000', email: 'demo@example.com' } } }, error: null };
    },
    signInWithPassword: async (data: any) => {
      return { data: { user: { id: '00000000-0000-0000-0000-000000000000', email: data.email } }, error: null };
    },
    signUp: async (data: any) => {
      return { data: { user: { id: '00000000-0000-0000-0000-000000000000', email: data.email } }, error: null };
    },
    signOut: async () => {
      return { error: null };
    },
    signInWithOAuth: async (options: any) => {
      return { data: { url: options.options?.redirectTo || '/auth/callback' }, error: null };
    }
  };

  return {
    auth,
    from: (table: keyof DemoDbSchema) => new MockQueryBuilder(table)
  };
}
