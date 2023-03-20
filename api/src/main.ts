import { Logger } from '@book000/node-utils'
import { TLIConfiguration } from './lib/config'
import { buildApp } from './lib/server'

async function main() {
  const logger = Logger.configure('main')

  logger.info('🔄 Loading configuration')
  const config = new TLIConfiguration()
  config.load()
  if (!config.validate()) {
    logger.error('❌ Configuration is invalid')
    logger.error(
      `💡 Missing check(s): ${config.getValidateFailures().join(', ')}`
    )
    process.exitCode = 1
    return
  }

  const app = await buildApp(config)
  const host = process.env.API_HOST || '0.0.0.0'
  const port = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 8000
  app.listen({ host, port }, (err, address) => {
    if (err) {
      logger.error('❌ Fastify.listen error', err)
      process.exit(1)
    }
    logger.info(`✅ Server listening at ${address}`)
  })
}

;(async () => {
  await main()
})()
