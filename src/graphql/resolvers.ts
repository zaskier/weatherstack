import { PropertyService } from '../services/PropertyService.js';
import { IResolvers } from 'mercurius';
import { GraphQLJSON } from 'graphql-type-json';

const propertyService = new PropertyService();

export const resolvers: IResolvers = {
  JSON: GraphQLJSON,
  Query: {
    properties: async (_parent, { sortBy, order, city, zipCode, state }) => {
      return await propertyService.getAllProperties({
        sortBy: sortBy as 'createdAt' | undefined,
        order: order as 'ASC' | 'DESC' | undefined,
        filters: { city, zipCode, state }
      });
    },
    property: async (_parent, { id }) => {
      return await propertyService.getPropertyById(id);
    }
  },
  Mutation: {
    createProperty: async (_parent, { city, street, state, zipCode }) => {
      return await propertyService.createProperty({ city, street, state, zipCode });
    },
    deleteProperty: async (_parent, { id }) => {
      return await propertyService.deleteProperty(id);
    }
  }
};
