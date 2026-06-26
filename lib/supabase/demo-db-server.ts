// Server-side mock database using local JSON file. Only imported on the server.
import fs from 'fs';
import path from 'path';

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
    },
    {
      id: 'mock-2',
      user_id: '00000000-0000-0000-0000-000000000000',
      language: 'python',
      original_code: `def get_user_data(user_id):
    # Hardcoded secret
    api_key = "secret_key_12345"
    url = f"https://api.example.com/users/{user_id}?key={api_key}"
    import requests
    response = requests.get(url)
    return response.json()`,
      title: 'python Review - 6/25/2026',
      score: 55,
      summary: 'Major security warning: Hardcoded API secret key and dynamic URL parameter interpolation.',
      improved_code: `import os
import requests

def get_user_data(user_id: str) -> dict:
    api_key = os.environ.get("EXAMPLE_API_KEY")
    if not api_key:
        raise ValueError("EXAMPLE_API_KEY env variable is not set")
    
    url = "https://api.example.com/users"
    params = {"user_id": user_id, "key": api_key}
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()`,
      overall_feedback: 'Removed hardcoded secret, used environment variables, and parameterized the requests client query parameters.',
      created_at: '2026-06-25T14:30:00.000Z',
      updated_at: '2026-06-25T14:30:00.000Z'
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
    },
    {
      id: 'f-2',
      review_id: 'mock-1',
      category: 'performance',
      severity: 'Low',
      title: 'Use Array.prototype.reduce',
      description: 'An imperative for loop can be refactored to a declarative reduce function for better readability.',
      how_to_fix: 'items.reduce((total, item) => total + item.price, 0);',
      line_number: 2
    },
    {
      id: 'f-3',
      review_id: 'mock-2',
      category: 'security',
      severity: 'Critical',
      title: 'Hardcoded API Key',
      description: 'The api_key is hardcoded in the source file, which exposes secrets if code is committed to version control.',
      how_to_fix: 'Use os.environ.get("EXAMPLE_API_KEY") to load keys from the environment.',
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
    },
    {
      id: 'p-2',
      user_id: '00000000-0000-0000-0000-000000000000',
      title: 'Security Auditor',
      content: 'Act as a Lead AppSec Security Researcher. Inspect every line of code for injection vulnerabilities, memory leaks, hardcoded credentials, buffer overflows, and unsafe dependencies.',
      is_public: false,
      created_at: '2026-06-26T10:10:00.000Z'
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

const dbFilePath = path.join(process.cwd(), 'demo-db.json');

export function getDemoDb(): DemoDbSchema {
  try {
    if (!fs.existsSync(dbFilePath)) {
      fs.writeFileSync(dbFilePath, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      return DEFAULT_DB;
    }
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(raw) as DemoDbSchema;
  } catch (e) {
    console.error('Error reading demo-db.json, using defaults', e);
    return DEFAULT_DB;
  }
}

export function saveDemoDb(db: DemoDbSchema) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing demo-db.json', e);
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

  // Promise resolution
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

    // Filter
    for (const filter of this.filters) {
      data = data.filter(filter);
    }

    // Sort
    if (this.orderColumn) {
      data = [...data].sort((a, b) => {
        const valA = a[this.orderColumn!];
        const valB = b[this.orderColumn!];
        if (valA < valB) return this.orderAscending ? -1 : 1;
        if (valA > valB) return this.orderAscending ? 1 : -1;
        return 0;
      });
    }

    // Limit
    if (this.limitCount !== null) {
      data = data.slice(0, this.limitCount);
    }

    // Single
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
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
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
