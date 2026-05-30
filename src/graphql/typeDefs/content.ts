import gql from "graphql-tag";

const contentType = gql`
  type ShippingMethod {
    id: ID!
    label: String!
    description: String
    cost: Float!
    active: Boolean!
    sortOrder: Int
  }

  type TeamMember {
    id: ID!
    name: String!
    role: String
    image: String
    sortOrder: Int
  }

  type Testimonial {
    id: ID!
    name: String!
    location: String
    text: String!
    rating: Int
    active: Boolean!
    sortOrder: Int
  }

  type Subscriber {
    id: ID!
    email: String!
    createdAt: String
  }

  type Query {
    # Public (active only)
    shippingMethods: [ShippingMethod!]!
    teamMembers: [TeamMember!]!
    testimonials: [Testimonial!]!
    # Admin (everything, incl. inactive)
    adminShippingMethods: [ShippingMethod!]!
    adminTestimonials: [Testimonial!]!
    subscribers: [Subscriber!]!
  }

  type Mutation {
    createShippingMethod(label: String!, description: String, cost: Float!, active: Boolean, sortOrder: Int): ShippingMethod!
    updateShippingMethod(id: ID!, label: String, description: String, cost: Float, active: Boolean, sortOrder: Int): ShippingMethod!
    deleteShippingMethod(id: ID!): ShippingMethod!

    createTeamMember(name: String!, role: String, image: String, sortOrder: Int): TeamMember!
    updateTeamMember(id: ID!, name: String, role: String, image: String, sortOrder: Int): TeamMember!
    deleteTeamMember(id: ID!): TeamMember!

    createTestimonial(name: String!, location: String, text: String!, rating: Int, active: Boolean, sortOrder: Int): Testimonial!
    updateTestimonial(id: ID!, name: String, location: String, text: String, rating: Int, active: Boolean, sortOrder: Int): Testimonial!
    deleteTestimonial(id: ID!): Testimonial!

    deleteSubscriber(id: ID!): Subscriber!
  }
`;

export default contentType;
