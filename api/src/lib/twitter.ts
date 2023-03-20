import { TLIBrowser } from './browser'
import { GraphQLResponse } from './graphql-response'
import { Status } from 'twitter-d'
import { GraphQLListLatestTweetsTimelineResponse } from '@/models/graphql/list-latest-tweets-timeline'
import { Utils } from './utils'
import { CustomGraphQLListTweet } from '@/models/custom/custom-graphql-list-tweets'

export class Twitter {
  private readonly browser: TLIBrowser

  constructor(browser: TLIBrowser) {
    this.browser = browser
  }

  public async getListTweets(listId: string, limit: number) {
    const page = await this.browser.newPage()

    const graphqlResponse = new GraphQLResponse(
      page,
      'ListLatestTweetsTimeline'
    )
    await page.goto(`https://twitter.com/i/lists/${listId}`, {
      waitUntil: 'networkidle2',
    })

    const scrollInterval = setInterval(async () => {
      await Utils.pageScroll(page)
    }, 1000)

    const tweets: Status[] = []
    while (tweets.length < limit) {
      try {
        tweets.push(...(await this.waitListTweet(graphqlResponse)))
      } catch {
        break
      }
    }

    clearInterval(scrollInterval)
    await page.close()

    return tweets
  }

  private waitListTweet(
    graphqlResponse: GraphQLResponse<'ListLatestTweetsTimeline'>
  ): Promise<Status[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('TIMEOUT'))
      }, 10_000)
      const interval = setInterval(async () => {
        const response = graphqlResponse.shiftResponse()
        if (!response) {
          return
        }

        const tweets = this.getTweet(response)
        if (tweets.length > 0) {
          clearInterval(interval)
          resolve(tweets)
        }
      }, 1000)
    })
  }

  waitTweet(
    graphqlResponse: GraphQLResponse<'ListLatestTweetsTimeline'>
  ): Promise<Status[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('TIMEOUT'))
      }, 10_000)
      const interval = setInterval(async () => {
        const response = graphqlResponse.shiftResponse()
        if (!response) {
          return
        }

        const tweets = this.getTweet(response)
        if (tweets.length > 0) {
          clearInterval(interval)
          resolve(tweets)
        }
      }, 1000)
    })
  }

  getTweet(response: GraphQLListLatestTweetsTimelineResponse): Status[] {
    const result = response.data.list.tweets_timeline.timeline.instructions
    return (
      Utils.filterUndefined(
        Utils.filterUndefined(
          result
            .filter((instruction) => instruction.type === 'TimelineAddEntries')
            .flatMap((instruction) => instruction.entries)
        )
          .filter((entry) => entry.entryId.startsWith('tweet-'))
          .flatMap((entry) => entry.content.itemContent?.tweet_results.result)
      ) as CustomGraphQLListTweet[]
    ).map((tweet) => {
      return this.createStatusObject(tweet)
    })
  }

  createStatusObject(tweet: CustomGraphQLListTweet): Status {
    const legacy = tweet.legacy ?? tweet.tweet?.legacy ?? undefined
    const userResult =
      tweet.core?.user_results.result ??
      tweet.tweet?.core.user_results.result ??
      undefined
    if (!legacy) {
      throw new Error('Failed to get legacy')
    }
    return {
      id: Number(legacy.id_str),
      source: tweet.source ?? 'NULL',
      truncated: false,
      user: {
        id: Number(userResult?.rest_id),
        id_str: userResult?.rest_id ?? 'NULL',
        ...userResult?.legacy,
      },
      ...legacy,
      display_text_range: legacy.display_text_range
        ? [legacy.display_text_range[0], legacy.display_text_range[1]]
        : undefined,
      // @ts-ignore
      entities: legacy.entities,
    }
  }
}
