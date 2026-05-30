import gql from "graphql-tag";

const reviewType = gql`
  type Review {
    id: ID!
    product: ID!
    productName: String
    user: ID
    name: String!
    rating: Int!
    comment: String
    createdAt: String
  }

  type ReviewSummary {
    average: Float!
    count: Int!
  }

  type CanReview {
    allowed: Boolean!
    reason: String
  }

  type Query {
    productReviews(product: ID!): [Review!]!
    reviewSummary(product: ID!): ReviewSummary!
    canReview(product: ID!): CanReview!
    adminReviews: [Review!]!
  }

  type Mutation {
    createReview(product: ID!, rating: Int!, comment: String): Review!
    deleteReview(id: ID!): Review!
  }
`;

export default reviewType;
