
import {client} from './rundeckClient'
import {getParameters} from './pluginService'

export const filterProjectNodes = async (project:string, filter:string) => {

  const params = await getParameters()
  try {
    const resp = await client.sendRequest({
      pathTemplate: `/api/{apivers}/project/{project}/resources`,
      pathParameters: {project: project, apivers:params.apiVersion},
      baseUrl: params.rdBase,
      method: 'GET',
      queryParameters: {filter}
    });
    if (!resp.parsedBody) {
      throw new Error(`Error getting service providers list for ${filter}`);
    }
    else {
      return resp.parsedBody;
    }
  }
  catch (e) {
    return console.warn('Error getting service providers list', e);
  }
}



export default {
  filterProjectNodes
}
