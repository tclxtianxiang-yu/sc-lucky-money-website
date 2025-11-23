import { GraphQLClient } from 'graphql-request'

const endpoint =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL ??
  'http://localhost:8000/subgraphs/name/lucky-money'

export const graphClient = new GraphQLClient(endpoint)
