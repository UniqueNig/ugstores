import gql from "graphql-tag";

const couponType = gql`
  type Coupon {
    id: ID!
    code: String!
    type: String! # "percent" | "fixed"
    value: Float!
    minSubtotal: Float
    active: Boolean!
    expiresAt: String
    createdAt: String
  }

  # Result of validating a coupon against a subtotal.
  type CouponResult {
    ok: Boolean!
    message: String!
    code: String
    type: String
    value: Float
    discount: Float!
  }

  type Query {
    coupons: [Coupon!]! # admin only
    validateCoupon(code: String!, subtotal: Float!): CouponResult!
  }

  type Mutation {
    createCoupon(
      code: String!
      type: String!
      value: Float!
      minSubtotal: Float
      active: Boolean
      expiresAt: String
    ): Coupon!

    updateCoupon(
      id: ID!
      code: String
      type: String
      value: Float
      minSubtotal: Float
      active: Boolean
      expiresAt: String
    ): Coupon!

    deleteCoupon(id: ID!): Coupon!
  }
`;

export default couponType;
