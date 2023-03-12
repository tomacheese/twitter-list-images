import { ConfigFramework } from '@book000/node-utils'

export interface Configuration {
  twapi: {
    baseUrl: string
    basicUsername: string
    basicPassword: string
    targetListId: string
  }
}

export class TLIConfiguration extends ConfigFramework<Configuration> {
  protected validates(): { [key: string]: (config: Configuration) => boolean } {
    return {
      'twapi is required': (config) => !!config.twapi,
      'twapi.baseUrl is required': (config) => !!config.twapi.baseUrl,
      'twapi.baseUrl is string': (config) =>
        typeof config.twapi.baseUrl === 'string',
      'twapi.basicUsername is required': (config) =>
        !!config.twapi.basicUsername,
      'twapi.basicUsername is string': (config) =>
        typeof config.twapi.basicUsername === 'string',
      'twapi.basicPassword is required': (config) =>
        !!config.twapi.basicPassword,
      'twapi.basicPassword is string': (config) =>
        typeof config.twapi.basicPassword === 'string',
      'twapi.targetListId is required': (config) => !!config.twapi.targetListId,
      'twapi.targetListId is string': (config) =>
        typeof config.twapi.targetListId === 'string',
    }
  }
}
