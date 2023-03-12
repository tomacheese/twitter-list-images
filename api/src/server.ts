import fastify, { FastifyInstance } from 'fastify'
import { BaseRouter } from './base-router'
import { ApiRouter } from './endpoints/api-router'
import cors from '@fastify/cors'
import { Logger } from '@book000/node-utils'
import { TLIConfiguration } from './config'

/**
 * Fastify アプリケーションを構築する
 *
 * @param config 設定
 * @returns Fastify アプリケーション
 */
export function buildApp(config: TLIConfiguration): FastifyInstance {
  const logger = Logger.configure('buildApp')

  const app = fastify()
  app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET'],
  })

  // routers
  const routers: BaseRouter[] = [new ApiRouter(app, config)]

  routers.forEach((router) => {
    logger.info(`⏩ Initializing route: ${router.constructor.name}`)
    router.init()
  })

  return app
}
