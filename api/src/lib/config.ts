import { ConfigFramework } from '@book000/node-utils'

export interface TwitterConfig {
  username: string
  password: string
  authCodeSecret?: string
  targetListId: string
}

export interface Configuration {
  twitter: TwitterConfig
}

export class TLIConfiguration extends ConfigFramework<Configuration> {
  protected validates(): { [key: string]: (config: Configuration) => boolean } {
    return {
      'twitter is required': (config) => !!config.twitter,
      'twitter is object': (config) => typeof config.twitter === 'object',
      'twitter.username is required': (config) => !!config.twitter.username,
      'twitter.username is string': (config) =>
        typeof config.twitter.username === 'string',
      'twitter.password is required': (config) => !!config.twitter.password,
      'twitter.password is string': (config) =>
        typeof config.twitter.password === 'string',
      'twitter.targetListId is required': (config) =>
        !!config.twitter.targetListId,
      'twitter.targetListId is string': (config) =>
        typeof config.twitter.targetListId === 'string',
    }
  }
}
