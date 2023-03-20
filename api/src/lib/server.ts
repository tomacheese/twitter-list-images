import fastify, { FastifyInstance } from 'fastify'
import { BaseRouter } from './base-router'
import cors from '@fastify/cors'
import { Logger } from '@book000/node-utils'
import { TLIConfiguration } from './config'
import { TLIBrowser } from './browser'
import { Twitter } from './twitter'
import { ApiRouter } from '@/endpoints/api-router'

/**
 * Fastify アプリケーションを構築する
 *
 * @param config 設定
 * @returns Fastify アプリケーション
 */
export async function buildApp(
  config: TLIConfiguration
): Promise<FastifyInstance> {
  const logger = Logger.configure('buildApp')

  const app = fastify()
  app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET'],
  })

  const browser = await TLIBrowser.init(config.get('twitter'))
  const twitter = new Twitter(browser)

  // routers
  const routers: BaseRouter[] = [new ApiRouter(app, config, twitter)]

  routers.forEach((router) => {
    logger.info(`⏩ Initializing route: ${router.constructor.name}`)
    router.init()
  })

  return app
}
