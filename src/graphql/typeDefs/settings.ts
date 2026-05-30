import gql from "graphql-tag";

const settingsType = gql`
  type Settings {
    id: ID!
    storeName: String
    currency: String
    contactEmail: String
    whatsapp: String
    paystackPublicKey: String
    paystackSecretKey: String
    emailNotifs: Boolean
    orderNotifs: Boolean
  }

  type Query {
    settings: Settings
  }

  type Mutation {
    updateSettings(
      storeName: String
      currency: String
      contactEmail: String
      whatsapp: String
      paystackPublicKey: String
      paystackSecretKey: String
      emailNotifs: Boolean
      orderNotifs: Boolean
    ): Settings
  }
`;

export default settingsType;