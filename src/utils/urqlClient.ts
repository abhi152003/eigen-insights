import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.NEXT_PUBLIC_GRAPH_KEY}/subgraphs/id/Hmjb4h1rN5L69eseuMoYtUhqii4wwg8UVo68y8s4dwrb`
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

export default client;