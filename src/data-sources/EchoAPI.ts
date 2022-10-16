import { RESTDataSource } from 'apollo-datasource-rest';

export class EchoAPI extends RESTDataSource {
  
  constructor() {
    // Always call super()
    super();
    // Sets the base URL for the REST API
    this.baseURL = 'http://postman-echo.com/';
  }

  async echo(echo: string) {
    // Send a GET request to the specified endpoint
    var ret = await this.get(`get?${echo}`);
    return ret.args;
  }

}