import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';

const avsExpLink = new HttpLink({
  uri: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.NEXT_PUBLIC_GRAPH_KEY}/subgraphs/id/Hmjb4h1rN5L69eseuMoYtUhqii4wwg8UVo68y8s4dwrb`
});

const eigenLayerLink = new HttpLink({
  uri: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.NEXT_PUBLIC_GRAPH_KEY}/subgraphs/id/68g9WSC4QTUJmMpuSbgLNENrcYha4mPmXhWGCoupM7kB`
});

const eigenDALink = new HttpLink({
  uri: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.NEXT_PUBLIC_GRAPH_KEY}/subgraphs/id/Gnzym6AjPZmmJSHsJY3Lr6nvz9CRnBiYRWorTFZbyXKj`
});

const airdropLink = new HttpLink({
  uri: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.NEXT_PUBLIC_GRAPH_KEY}/subgraphs/id/5qKTQiuSDgvwRyjmcWjx9V8T7md2gvRTrmWdVg82c481
`
});

const splitLink = split(
  (operation) => operation.getContext().subgraph === 'avs',
  avsExpLink,
  split(
    (operation) => operation.getContext().subgraph === 'eigenlayer',
    eigenLayerLink,
    split(
      (operation) => operation.getContext().subgraph === 'airdrop',
      airdropLink,
      eigenDALink
    )
  )
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});

export default client;