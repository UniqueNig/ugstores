# Features

Each subfolder here is one **feature** (a slice of the app), keeping everything
about that feature in one place instead of spread across global `components/`,
`graphql/`, and `lib/data/` folders.

## Why

Before, working on "products" meant jumping between:

- `src/components/product/*`
- `src/graphql/typeDefs/product.ts` + `src/graphql/resolvers/productResolver.ts`
- `src/lib/data/products.ts`

Now it all lives under `src/features/products/`, so a feature is easy to find,
understand, and (for the boilerplate) copy or remove as a unit.

## Convention

```
src/features/<feature>/
  components/      UI components for this feature
  graphql/
    typeDefs.ts    GraphQL schema for this feature
    resolver.ts    GraphQL resolvers for this feature
  data.ts          server-side data access (DTOs for server components)
  types.ts         feature-specific types (when needed)
```

Not every folder is required — add one only when the feature needs it.

## How it plugs in

The central GraphQL barrels still stitch features together:

- `src/graphql/typeDefs/index.ts` imports each feature's `graphql/typeDefs`
- `src/graphql/resolvers/index.ts` imports each feature's `graphql/resolver`

So features stay self-contained, but the API is still assembled in one place.

## Status

- ✅ `products` — migrated (pilot).
- ⬜ `cart`, `checkout`, `orders`, `auth`, `users` — still in the global folders;
  migrate the same way when needed.
