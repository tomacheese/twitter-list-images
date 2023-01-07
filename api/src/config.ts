import fs from 'fs'
import yaml from 'js-yaml'

export interface TwitterAccount {
  name: string
  emoji: string
  discordUserId: string
  accessToken: string
  accessSecret: string
}

export interface TwitterAuth {
  appKey: string
  appSecret: string
  callbackUrl: string
}

export interface Config {
  twitter: {
    consumerKey: string
    consumerSecret: string
    accessToken: string
    accessSecret: string
    targetListId: string
  }
}

export function getConfig(): Config {
  const path = process.env.CONFIG_PATH || 'config.yml'
  return yaml.load(fs.readFileSync(path, 'utf8')) as Config
}
