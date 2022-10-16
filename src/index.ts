import { ApolloServer } from 'apollo-server-express';
import { gql } from 'apollo-server-express';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import { EchoAPI } from './data-sources/EchoAPI.js';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`#graphql

  scalar JSON

  type Query {
    echo(echo: String): JSON
  }
`;

const resolvers = {
    Query: {
        async echo(_: any, { echo }: any, { dataSources }: any) {
            return dataSources.echoApi.echo(echo);
        }
    },
};


async function listen(port: number) {
    const app = express();
    const httpServer = http.createServer(app);

    // The ApolloServer constructor requires two parameters: your schema
    // definition and your set of resolvers.
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        csrfPrevention: true,
        cache: 'bounded',
        plugins: [

            ApolloServerPluginLandingPageLocalDefault({ embed: true }),

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