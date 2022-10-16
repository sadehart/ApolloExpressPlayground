import { ApolloServer } from 'apollo-server-express';
import { gql } from 'apollo-server-express';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import responseCachePlugin from 'apollo-server-plugin-response-cache'
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import express from 'express';
import http from 'http';
import { EchoAPI } from './data-sources/EchoAPI.js';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`#graphql

  scalar JSON

  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }
  
  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

  type Query {
    echo(echo: String): JSON @cacheControl(maxAge: 30)
  }
`;

const resolvers = {
    Query: {
        async echo(_: any, { echo }: any, { dataSources }: any) {
            return dataSources.echoApi.echo(echo);
        }
    },
};

//this dumb piece of code is here because the response cache plugin isn't typed properly
var cachePlugin : any = responseCachePlugin;

async function listen(port: number) {
    const app = express();
    const httpServer = http.createServer(app);

    // The ApolloServer constructor requires two parameters: your schema
    // definition and your set of resolvers.
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        csrfPrevention: true,
        cache: new InMemoryLRUCache(),
        plugins: [

            ApolloServerPluginLandingPageLocalDefault({ embed: true }),
            cachePlugin.default(),

        ],

        dataSources: () => {
            return {
                echoApi: new EchoAPI(),
            };
        },
    });

    await server.start();

    server.applyMiddleware({ app });

    return new Promise((resolve, reject) => {
        httpServer.listen(port).once('listening', resolve).once('error', reject);
    })
}

async function main() {

    try {
        await listen(4000);
        console.log(`🚀  Server ready at: http://localhost:4000/graphql`);
    } catch (err) {
        console.error('failed to start server', err);
    }

}

void main();