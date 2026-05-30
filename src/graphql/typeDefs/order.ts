import gql from "graphql-tag";

const orderType = gql`
  type OrderItem {
    product: ID!
    name: String!
    image: String
    price: Float!
    quantity: Int!
    size: String
    color: String
  }

  type ShippingAddress {
    name: String!       
    address: String!
    city: String!
    state: String!
    phone: String!
    email: String!
  }

  type Order {
    id: ID!
    user: ID
    items: [OrderItem!]!
    shippingAddress: ShippingAddress!
    paymentMethod: String
    paymentReference: String
    isPaid: Boolean!
    paidAt: String
    subtotal: Float!
    discount: Float
    couponCode: String
    shippingCost: Float!
    totalAmount: Float!
    status: String!
    deliveredAt: String
    createdAt: String!
    updatedAt: String
  }

  input OrderItemInput {
    product: ID!
    name: String!
    image: String
    price: Float!
    quantity: Int!
    size: String
    color: String
  }

  input ShippingAddressInput {
    name: String!      
    address: String!
    city: String!
    state: String!
    phone: String!
    email: String!
  }

  type Query {
    orders: [Order!]!
    order(id: ID!): Order
    myOrders: [Order!]!
    myOrder(id: ID!): Order
  }

  type Mutation {
    createOrder(
      items: [OrderItemInput!]!
      shippingAddress: ShippingAddressInput!
      subtotal: Float!
      shippingCost: Float!
      totalAmount: Float!
      paymentReference: String
      couponCode: String
    ): Order!

    verifyPaymentAndCreateOrder(
      reference: String!
      items: [OrderItemInput!]!
      shippingAddress: ShippingAddressInput!
      subtotal: Float!
      shippingCost: Float!
      totalAmount: Float!
      couponCode: String
    ): Order!

    updateOrderStatus(id: ID!, status: String!): Order!
  }
`;

export default orderType;
