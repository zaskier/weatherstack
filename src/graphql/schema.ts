export const schema = `
  type Property {
    id: ID!
    city: String!
    street: String!
    state: String!
    zipCode: String!
    weatherData: JSON
    lat: Float
    long: Float
    createdAt: String!
  }

  type Query {
    properties(
      sortBy: String
      order: String
      city: String
      zipCode: String
      state: String
    ): [Property!]!
    property(id: ID!): Property
  }

  type Mutation {
    createProperty(
      city: String!
      street: String!
      state: String!
      zipCode: String!
    ): Property!
    deleteProperty(id: ID!): Boolean!
  }

  scalar JSON
`;
