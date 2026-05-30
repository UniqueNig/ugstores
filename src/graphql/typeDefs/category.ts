import gql from "graphql-tag";

const categoryType = gql`
  #graphql
  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    productCount: Int
  }

  # NOTE: the Product type, the products query, and createProduct live in
  # product.ts (the authoritative definition). They used to be duplicated
  # here with conflicting field types, which is schema-fragile.

  type Query {
    categories: [Category]
  }

  type Mutation {
    createCategory(name: String!, slug: String!, description: String): Category
    updateCategory(id: ID!, name: String, description: String): Category
    deleteCategory(id: ID!): Category
  }
`;

export default categoryType;
