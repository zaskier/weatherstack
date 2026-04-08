export const schema = `
  "Represents a real estate property and its associated data."
  type Property {
    "The unique identifier for the property."
    id: ID!
    "The city where the property is located."
    city: String!
    "The street address of the property."
    street: String!
    "The state or region where the property is located."
    state: String!
    "The postal code for the property."
    zipCode: String!
    "Current weather conditions at the property location, fetched from Weatherstack."
    weather: JSON
    "The latitude coordinate of the property city from weatherstack api."
    lat: Float
    "The longitude coordinate of the property city from weatherstack api."
    long: Float
    "The timestamp when the property record was created using ISO 8601 format."
    createdAt: String!
  }

  type Query {
    "Retrieve a list of properties, optionally filtered and sorted."
    properties(
      "Field to sort the properties by (e.g., 'createdAt')."
      sortBy: String
      "Sort order, either 'ASC' or 'DESC'."
      order: String
      "Filter properties by city."
      city: String
      "Filter properties by postal code."
      zipCode: String
      "Filter properties by state."
      state: String
    ): [Property!]!
    
    "Retrieve a specific property by its unique identifier."
    property(
      "The unique identifier of the property to retrieve."
      id: ID!
    ): Property
  }

  type Mutation {
    "Create a new property record."
    createProperty(
      "The city where the property is located."
      city: String!
      "The street address of the property."
      street: String!
      "The state or region where the property is located."
      state: String!
      "The postal code for the property."
      zipCode: String!
    ): Property!
    
    "Delete an existing property record by its unique identifier."
    deleteProperty(
      "The unique identifier of the property to delete."
      id: ID!
    ): Boolean!
  }

  scalar JSON
`;
