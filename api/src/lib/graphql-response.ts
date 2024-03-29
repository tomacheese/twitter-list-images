import { Page } from 'puppeteer-core'
import { dirname } from 'node:path'
import fs from 'node:fs'
import { GraphQLListLatestTweetsTimelineResponse } from '@/models/graphql/list-latest-tweets-timeline'

type GraphQLEndPoint = 'ListLatestTweetsTimeline'

type Return<T extends GraphQLEndPoint> = T extends 'ListLatestTweetsTimeline'
  ? GraphQLListLatestTweetsTimelineResponse
  : never

interface Errors {
  RATE_LIMIT_EXCEEDED: number
  [key: string]: number
}

export class GraphQLResponse<T extends GraphQLEndPoint> {
  private errors: Errors = {
    RATE_LIMIT_EXCEEDED: 0,
  }

  private responses: Return<T>[] = []

  constructor(page: Page, endpoint?: T) {
    this.init(page, endpoint)
  }

  public getResponses(): Return<T>[] {
    return this.responses
  }

  public getSingleResponse(timeout: number): Promise<Return<T> | null> {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.responses.length > 0) {
          clearInterval(interval)
          resolve(this.responses[0])
        }
      }, 100)
      setTimeout(() => {
        clearInterval(interval)
        resolve(null)
      }, timeout)
    })
  }

  public shiftResponse(): Return<T> | null {
    return this.responses.shift() ?? null
  }

  public getErrors(): Errors {
    return this.errors
  }

  private init(page: Page, endpoint?: T) {
    const apiRegex = /https:\/\/api\.twitter\.com\/graphql\/.+?\/(.+?)\?/
    const graphqlRegex = /https:\/\/twitter\.com\/i\/api\/graphql\/.+?\/(.+?)\?/
    page.on('response', async (response) => {
      if (response.request().method() === 'OPTIONS') {
        return
      }
      const apiMatch = response.url().match(apiRegex)
      const graphqlMatch = response.url().match(graphqlRegex)
      if (!apiMatch && !graphqlMatch) {
        return
      }
      const match = apiMatch ?? graphqlMatch
      if (!match || match.length !== 2) {
        return
      }
      if (response.status() !== 200) {
        return
      }

      let text
      try {
        text = await response.text()
      } catch {
        return
      }
      const path = `/data/debug/graphql/${match[1]}/${Date.now()}.json`
      fs.mkdirSync(dirname(path), { recursive: true })
      fs.writeFileSync(path, text)

      if (endpoint && match[1] !== endpoint) {
        return
      }

      if (response.status() === 429) {
        this.errors.RATE_LIMIT_EXCEEDED += 1
        return
      }
      if (response.status() !== 200) {
        this.errors[`HTTP_STATUS_${response.status()}`] += 1
        return
      }

      const json = JSON.parse(text) as Return<T>
      this.responses.push(json)
    })
  }
}
