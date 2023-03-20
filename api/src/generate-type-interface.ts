import fs from 'node:fs'
import { createCompoundSchema } from 'genson-js'
import { compile, Options } from 'json-schema-to-typescript'
import { Logger } from '@book000/node-utils'
import { dirname } from 'node:path'
import { Utils } from './lib/utils'
import { GraphQLListLatestTweetsTimelineResponse } from './models/graphql/list-latest-tweets-timeline'

const compileOptions: Partial<Options> = {
  bannerComment: '',
  additionalProperties: false,
  enableConstEnums: true,
  strictIndexSignatures: true,
  style: {
    semi: false,
    singleQuote: true,
  },
  unknownAny: true,
}

async function getJSONFiles(directory: string) {
  if (!fs.existsSync(directory)) {
    return []
  }
  const files = fs.readdirSync(directory)
  const results: string[] = []
  for (const file of files) {
    const path = directory + '/' + file
    const stat = fs.statSync(path)
    if (stat.isDirectory()) {
      results.push(...(await getJSONFiles(path)))
    }
    if (stat.isFile() && path.endsWith('.json')) {
      results.push(path)
    }
  }
  return results
}

async function generateTypeInterfaceFromData(
  schemaPath: string,
  interfacePath: string,
  name: string,
  data: any[]
) {
  const logger = Logger.configure('generateTypeInterfaceFromData')

  if (data.length === 0) {
    logger.warn(`❌ Not found json files`)
    return
  }

  const schema = createCompoundSchema(data)

  fs.mkdirSync(dirname(schemaPath), { recursive: true })
  fs.mkdirSync(dirname(interfacePath), { recursive: true })

  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2))
  const ts = await compile(schema, name, compileOptions)
  fs.writeFileSync(interfacePath, ts)
  logger.info(`📝 ${interfacePath}`)
}

async function generateTypeInterface(
  directory: string,
  type: string,
  fromDirectory: string
) {
  const logger = Logger.configure('generateTypeInterface')
  logger.info(`✨ generateTypeInterface(${type})`)

  const hyphenType = type
    .replace(/(GraphQL|Rest)/g, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
  if (!fs.existsSync(fromDirectory)) {
    logger.warn(`❌ Not found fromDir: ${fromDirectory}`)
    return
  }

  const files = await getJSONFiles(fromDirectory)
  const data = files.map((f) => JSON.parse(fs.readFileSync(f, 'utf8')))

  if (data.length === 0) {
    logger.warn(`❌ Not found json files`)
    return
  }

  const schema = createCompoundSchema(data)

  const schemaPath = `../data/schema/${directory}/${type.toLocaleLowerCase()}.json`
  fs.mkdirSync(dirname(schemaPath), { recursive: true })
  const interfacePath = `./src/models/${directory}/${hyphenType}.ts`
  fs.mkdirSync(dirname(interfacePath), { recursive: true })

  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2))
  const ts = await compile(schema, `${type}Response`, compileOptions)
  fs.writeFileSync(interfacePath, ts)
  logger.info(`📝 ${interfacePath}`)
}

async function generateCustomListTweets() {
  const logger = Logger.configure('generateCustomListTweets')
  logger.info(`✨ generateCustomListTweets()`)

  const files = await getJSONFiles(
    '../data/debug/graphql/ListLatestTweetsTimeline'
  )
  const data = files
    .map((f) => JSON.parse(fs.readFileSync(f, 'utf8')))
    .flatMap((d: GraphQLListLatestTweetsTimelineResponse) =>
      Utils.filterUndefined(
        Utils.filterUndefined(
          d.data.list.tweets_timeline.timeline.instructions
            .filter((instruction) => instruction.type === 'TimelineAddEntries')
            .flatMap((instruction) => instruction.entries)
        )
          .filter((entry) => entry.entryId.startsWith('tweet-'))
          .flatMap((entry) => entry.content.itemContent?.tweet_results.result)
      )
    )

  if (data.length === 0) {
    logger.warn(`❌ Not found json files`)
    return
  }

  const schemaPath = `../data/schema/custom/custom-graphql-list-tweets.json`
  const interfacePath = `./src/models/custom/custom-graphql-list-tweets.ts`

  await generateTypeInterfaceFromData(
    schemaPath,
    interfacePath,
    'CustomGraphQLListTweet',
    data
  )
}

async function generateTypeInterfaces() {
  const promises = []

  if (fs.existsSync('../data/debug/graphql/')) {
    const graphqlDirectories = fs.readdirSync('../data/debug/graphql/')
    for (const directory of graphqlDirectories) {
      promises.push(
        generateTypeInterface(
          'graphql',
          `GraphQL${directory}`,
          `../data/debug/graphql/${directory}`
        )
      )
    }

    promises.push(generateCustomListTweets())
  }

  if (fs.existsSync('../data/debug/rest/')) {
    const restDirectories = fs.readdirSync('../data/debug/rest/')
    for (const directory of restDirectories) {
      promises.push(
        generateTypeInterface(
          'rest',
          `Rest${directory}`,
          `../data/debug/rest/${directory}`
        )
      )
    }
  }

  await Promise.all(promises)
}

;(async () => {
  await generateTypeInterfaces()
})()
