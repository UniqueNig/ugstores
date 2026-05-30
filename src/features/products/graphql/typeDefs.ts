import gql from "graphql-tag";

const productType = gql`
  #graphql
  type SizeStock {
    size: String!
    stock: Int!
  }

  input SizeStockInput {
    size: String!
    stock: Int!
  }

  type Color {
    name: String!
    hex: String
    images: [String]
  }

  input ColorInput {
    name: String!
    hex: String
    images: [String]
  }

  type Product {
    id: ID!
    name: String!
    slug: String
    description: String!
    price: Float!
    image: String
    images: [String]
    stock: Int!
    sizes: [String]
    sizeStock: [SizeStock]
    colors: [Color]
    sizeGuide: String
    materials: String
    sizingFit: String
    careInstructions: String
    category: Category # ✅ FIXED
    isNew: Boolean
    createdBy: ID
    createdAt: String
  }

  input StockCheckInput {
    product: ID!
    quantity: Int!
    size: String
  }

  type StockCheck {
    product: ID!
    name: String
    available: Int!
    requested: Int!
    ok: Boolean!
  }

  # A page of products plus the totals the UI needs to render pagination.
  type ProductPage {
    items: [Product!]!
    total: Int!
    page: Int!
    pages: Int!
  }

  # Server-side filter/sort for the shop & search pages.
  input ProductFilter {
    search: String      # matches product name or category name
    category: String    # category SLUG
    minPrice: Float
    maxPrice: Float
    sizes: [String]     # keep products offering any of these sizes
    sort: String        # "newest" | "price-asc" | "price-desc"
  }

  type Query {
    products: [Product]
    # Paginated + server-filtered product listing (shop & search).
    productsPage(filter: ProductFilter, page: Int = 1, limit: Int = 12): ProductPage!
    product(id: ID!): Product
    # Public product page lookup. Accepts a slug; also falls back to an
    # old Mongo id so existing /product/<id> links keep working.
    productBySlug(slug: ID!): Product
    # Pre-checkout availability check — used to block paying for items that
    # are no longer in stock.
    checkStock(items: [StockCheckInput!]!): [StockCheck!]!
  }

  type Mutation {
    createProduct(
      name: String!
      slug: String # optional — auto-generated from name if omitted
      description: String!
      price: Float!
      image: String
      images: [String]
      stock: Int!
      sizes: [String]
      sizeStock: [SizeStockInput]
      colors: [ColorInput]
      sizeGuide: String
      materials: String
      sizingFit: String
      careInstructions: String
      category: ID! # ✅ FIXED — category is referenced by its id
      isNew: Boolean
    ): Product

    updateProduct(
      id: ID!
      name: String
      slug: String # optional — pass to rename the URL
      description: String
      price: Float
      image: String
      images: [String]
      stock: Int
      sizes: [String]
      sizeStock: [SizeStockInput]
      colors: [ColorInput]
      sizeGuide: String
      materials: String
      sizingFit: String
      careInstructions: String
      category: ID
      isNew: Boolean
    ): Product

    deleteProduct(id: ID!): Product

    # One-time maintenance: generate slugs for any products created before
    # slugs existed. Admin only. Returns how many were updated.
    backfillProductSlugs: Int
  }
`;

export default productType;
