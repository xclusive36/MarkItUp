/**
 * Boolean Search Parser
 *
 * Parses and evaluates boolean search queries with AND, OR, NOT operators.
 * Supports parentheses for grouping and quoted phrases for exact matches.
 *
 * Examples:
 * - "react AND hooks" - Both terms must be present
 * - "react OR vue" - Either term must be present
 * - "react NOT tutorial" - First term present, second absent
 * - "(react OR vue) AND hooks" - Grouped operations
 * - '"exact phrase"' - Match exact phrase
 */

export type SearchOperator = 'AND' | 'OR' | 'NOT';

export interface SearchToken {
  type: 'TERM' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'PHRASE';
  value: string;
}

export interface SearchNode {
  type: 'TERM' | 'PHRASE' | 'NOT' | 'AND' | 'OR';
  value?: string;
  left?: SearchNode;
  right?: SearchNode;
  child?: SearchNode;
}

/**
 * Tokenize search query into terms, operators, and parentheses
 */
export function tokenize(query: string): SearchToken[] {
  const tokens: SearchToken[] = [];
  let i = 0;

  while (i < query.length) {
    const char = query[i];
    if (!char) {
      i++;
      continue;
    }

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Quoted phrase
    if (char === '"') {
      let phrase = '';
      i++; // Skip opening quote
      while (i < query.length && query[i] !== '"') {
        phrase += query[i];
        i++;
      }
      i++; // Skip closing quote
      tokens.push({ type: 'PHRASE', value: phrase });
      continue;
    }

    // Parentheses
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }

    // Term or operator
    let word = '';
    while (i < query.length && !/[\s()"']/.test(query[i]!)) {
      const currentChar = query[i];
      if (currentChar) {
        word += currentChar;
      }
      i++;
    }

    const upperWord = word.toUpperCase();
    if (upperWord === 'AND' || upperWord === 'OR' || upperWord === 'NOT') {
      tokens.push({ type: 'OPERATOR', value: upperWord });
    } else {
      tokens.push({ type: 'TERM', value: word });
    }
  }

  return tokens;
}

/**
 * Parse tokens into an AST (Abstract Syntax Tree)
 */
export function parse(tokens: SearchToken[]): SearchNode | null {
  let position = 0;

  function parseExpression(): SearchNode | null {
    return parseOr();
  }

  function parseOr(): SearchNode | null {
    let left = parseAnd();

    while (position < tokens.length) {
      const token = tokens[position];
      if (!token || token.type !== 'OPERATOR' || token.value !== 'OR') break;

      position++; // consume OR
      const right = parseAnd();
      if (!right) throw new Error('Expected expression after OR');
      left = { type: 'OR', left: left!, right };
    }

    return left;
  }

  function parseAnd(): SearchNode | null {
    let left = parseNot();

    while (position < tokens.length) {
      const token = tokens[position];
      if (!token || token.type !== 'OPERATOR' || token.value !== 'AND') break;

      position++; // consume AND
      const right = parseNot();
      if (!right) throw new Error('Expected expression after AND');
      left = { type: 'AND', left: left!, right };
    }

    return left;
  }

  function parseNot(): SearchNode | null {
    if (position < tokens.length) {
      const token = tokens[position];
      if (token && token.type === 'OPERATOR' && token.value === 'NOT') {
        position++; // consume NOT
        const child = parsePrimary();
        if (!child) throw new Error('Expected expression after NOT');
        return { type: 'NOT', child };
      }
    }

    return parsePrimary();
  }

  function parsePrimary(): SearchNode | null {
    if (position >= tokens.length) return null;

    const token = tokens[position];
    if (!token) return null;

    // Parenthesized expression
    if (token.type === 'LPAREN') {
      position++; // consume (
      const expr = parseExpression();
      const closeToken = tokens[position];
      if (position >= tokens.length || !closeToken || closeToken.type !== 'RPAREN') {
        throw new Error('Expected closing parenthesis');
      }
      position++; // consume )
      return expr;
    }

    // Phrase
    if (token.type === 'PHRASE') {
      position++;
      return { type: 'PHRASE', value: token.value };
    }

    // Term
    if (token.type === 'TERM') {
      position++;
      return { type: 'TERM', value: token.value };
    }

    return null;
  }

  return parseExpression();
}

/**
 * Evaluate search AST against text
 */
export function evaluate(node: SearchNode | null, text: string): boolean {
  if (!node) return false;

  const textLower = text.toLowerCase();

  switch (node.type) {
    case 'TERM':
      return textLower.includes(node.value!.toLowerCase());

    case 'PHRASE':
      return textLower.includes(node.value!.toLowerCase());

    case 'NOT':
      return !evaluate(node.child!, text);

    case 'AND':
      return evaluate(node.left!, text) && evaluate(node.right!, text);

    case 'OR':
      return evaluate(node.left!, text) || evaluate(node.right!, text);

    default:
      return false;
  }
}

/**
 * Main function to search with boolean operators
 */
export function booleanSearch(query: string, text: string): boolean {
  try {
    const tokens = tokenize(query);
    const ast = parse(tokens);
    return evaluate(ast, text);
  } catch (error) {
    // If parsing fails, fall back to simple substring search
    console.warn('Boolean search parse error:', error);
    return text.toLowerCase().includes(query.toLowerCase());
  }
}

/**
 * Filter results using boolean search
 */
export function filterWithBoolean<T extends { content: string; title?: string }>(
  items: T[],
  query: string
): T[] {
  try {
    const tokens = tokenize(query);
    const ast = parse(tokens);

    return items.filter(item => {
      const searchText = `${item.title || ''} ${item.content}`;
      return evaluate(ast, searchText);
    });
  } catch (error) {
    console.warn('Boolean filter error:', error);
    // Fall back to simple search
    const queryLower = query.toLowerCase();
    return items.filter(item => {
      const searchText = `${item.title || ''} ${item.content}`.toLowerCase();
      return searchText.includes(queryLower);
    });
  }
}

/**
 * Explain the search query in human-readable form
 */
export function explainQuery(query: string): string {
  try {
    const tokens = tokenize(query);
    const ast = parse(tokens);

    function explain(node: SearchNode | null): string {
      if (!node) return '';

      switch (node.type) {
        case 'TERM':
          return `contains "${node.value}"`;
        case 'PHRASE':
          return `contains exact phrase "${node.value}"`;
        case 'NOT':
          return `does NOT (${explain(node.child!)})`;
        case 'AND':
          return `(${explain(node.left!)}) AND (${explain(node.right!)})`;
        case 'OR':
          return `(${explain(node.left!)}) OR (${explain(node.right!)})`;
        default:
          return '';
      }
    }

    return explain(ast);
  } catch {
    return `contains "${query}"`;
  }
}
