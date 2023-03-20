import { FastifyInstance } from 'fastify'
import { TLIConfiguration } from './config'
import { Twitter } from './twitter'

/**
 * REST API ルーターの基底クラス
 */
export abstract class BaseRouter {
  protected fastify: FastifyInstance
  protected config: TLIConfiguration
  protected twitter: Twitter

  constructor(
    fastify: FastifyInstance,
    config: TLIConfiguration,
    twitter: Twitter
  ) {
    this.fastify = fastify
    this.config = config
    this.twitter = twitter
  }

  /**
   * ルーターを初期化する
   *
   * this.fastify.register() でルーターを登録する
   */
  abstract init(): void
}
