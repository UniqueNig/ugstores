import gql from "graphql-tag";

const userType = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    phone: String
    address: String
    role: String
    status: String # "Active" | "Inactive"
    createdAt: String! # used as "joined"
    # Computed fields — resolved by counting user's orders
    orders: Int # total number of orders placed
    spent: Float # total amount spent across all orders
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Address {
    id: ID!
    label: String
    name: String!
    phone: String
    address: String!
    city: String
    state: String
    isDefault: Boolean
  }

  input AddressInput {
    label: String
    name: String!
    phone: String
    address: String!
    city: String
    state: String
  }

  type Query {
    users: [User]
    user(id: ID!): User
    me: User
    admins: [User]
    myAddresses: [Address!]!
  }

  type Mutation {
    register(
      name: String!
      email: String!
      phone: String
      address: String
      password: String!
    ): User

    login(email: String!, password: String!): AuthPayload

    updateUser(
      id: ID!
      name: String
      email: String
      phone: String
      address: String
    ): User

    updateProfile(
      name: String!
      email: String!
      phone: String
      address: String
    ): User

    updateUserStatus(id: ID!, status: String!): User # admin toggle Active/Inactive
    changePassword(currentPassword: String!, newPassword: String!): Boolean!

    # Password recovery
    requestPasswordReset(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): Boolean!

    # Saved addresses
    addAddress(input: AddressInput!): [Address!]!
    updateAddress(id: ID!, input: AddressInput!): [Address!]!
    deleteAddress(id: ID!): [Address!]!
    setDefaultAddress(id: ID!): [Address!]!

    deleteUser(id: ID!): User
    # Inside Mutation type, add:
    createAdmin(
      name: String!
      email: String!
      password: String!
      role: String
    ): User

    deleteAccount: Boolean!
  }
`;

export default userType;
