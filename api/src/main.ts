import { Logger } from './logger'
import { buildApp } from './server'

async function main() {
  const logger = Logger.configure('main')
  const app = buildApp()
  const host = process.env.API_HOST || '0.0.0.0'
  const port = process.env.API_PORT ? parseInt(process.env.API_PORT, 10) : 8000
  app.listen({ host, port }, (err, address) => {
    if (err) {
      logger.error('Fastify.listen error', err)
      process.exit(1)
    }
    logger.info(`✅ Server listening at ${address}`)
  })
}

;(async () => {
  await main()
})()
