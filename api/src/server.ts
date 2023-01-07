import fastify, { FastifyInstance } from 'fastify'
import { BaseRouter } from './base-router'
import { getConfig } from './config'
import { ApiRouter } from './endpoints/api-router'
import cors from '@fastify/cors'

/**
 * Fastify アプリケーションを構築する
 *
 * @returns Fastify アプリケーション
 */
export function buildApp(): FastifyInstance {
  const config = getConfig()

  const app = fastify()
  app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET'],
  })

  // routers
  const routers: BaseRouter[] = [new ApiRouter(app, config)]

  routers.forEach((router) => {
    console.log(`Initializing route: ${router.constructor.name}`)
    router.init()
  })

  return app
}