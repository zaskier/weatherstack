import { PropertyService } from '../services/PropertyService.js';
import { IResolvers } from 'mercurius';
import { GraphQLJSON } from 'graphql-type-json';
import { formatToISO8601 } from '../utils/date.js';

let propertyService: PropertyService;

const getPropertyService = (config: any) => {
  if (!propertyService) {
    propertyService = new PropertyService(config);
  }
  return propertyService;
};

export const resolvers: IResolvers = {
  JSON: GraphQLJSON,
  Property: {
    createdAt: (parent: { createdAt: Date | string | number }) => formatToISO8601(parent.createdAt)
  },
  Query: {
    properties: async (_parent, { sortBy, order, city, zipCode, state }, context) => {
      return await getPropertyService(context.app.config).getAllProperties({
        sortBy: sortBy as 'createdAt' | undefined,
        order: order as 'ASC' | 'DESC' | undefined,
        filters: { city, zipCode, state }
      });
    },
    property: async (_parent, { id }, context) => {
      return await getPropertyService(context.app.config).getPropertyById(id);
    }
  },
  Mutation: {
    createProperty: async (_parent, { city, street, state, zipCode }, context) => {
      return await getPropertyService(context.app.config).createProperty({
        city,
        street,
        state,
        zipCode
      });
    },
    deleteProperty: async (_parent, { id }, context) => {
      return await getPropertyService(context.app.config).deleteProperty(id);
    }
  }
};
