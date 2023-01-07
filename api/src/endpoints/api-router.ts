import { FastifyRequest, FastifyReply } from 'fastify'
import { BaseRouter } from '@/base-router'
import { TwitterApi } from 'twitter-api-v2'

interface Tweet {
  tweet_id: string
  image_id: string
  user: {
    user_id: string
    screen_name: string
    name: string
    profile_image_url_https: string
  }
  media: {
    id_str: string
    media_url_https: string
    type: string
    size: {
      // medium
      w: number
      h: number
    }
  }
  liked: boolean
}

export class ApiRouter extends BaseRouter {
  init(): void {
    this.fastify.register(
      (fastify, _, done) => {
        fastify.get('/images', this.routeGetImages.bind(this))
        fastify.post('/like/:tweet_id', this.routePostLike.bind(this))
        done()
      },
      { prefix: '/api' }
    )
  }

  async routeGetImages(
    request: FastifyRequest<{
      Querystring: {
        max_id?: string
      }
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const maxId = request.query.max_id

    const twitterApi = new TwitterApi({
      appKey: this.config.twitter.consumerKey,
      appSecret: this.config.twitter.consumerSecret,
      accessToken: this.config.twitter.accessToken,
      accessSecret: this.config.twitter.accessSecret,
    })
    const statuses = await twitterApi.v1.listStatuses({
      list_id: this.config.twitter.targetListId,
      include_rts: true,
      include_entities: true,
      tweet_mode: 'extended',
      count: 200,
      max_id: maxId,
    })
    const imagesTweets = statuses.tweets.filter(
      (tweet) => tweet.extended_entities && tweet.extended_entities.media
    )
    const images: Tweet[] = this.filterNull(
      imagesTweets.flatMap((tweet) => {
        if (!tweet.extended_entities || !tweet.extended_entities.media)
          return null
        const media = tweet.extended_entities.media
        return media.map((m) => {
          if (m.type !== 'photo') return null
          return {
            tweet_id: tweet.id_str,
            image_id: m.id_str,
            user: {
              user_id: tweet.user.id_str,
              screen_name: tweet.user.screen_name,
              name: tweet.user.name,
              profile_image_url_https: tweet.user.profile_image_url_https,
            },
            media: {
              id_str: m.id_str,
              media_url_https: m.media_url_https,
              type: m.type,
              size: m.sizes.medium,
            },
            liked: tweet.favorited ?? false,
          }
        })
      })
    )
    reply.send({
      items: images,
      next_max_id: (
        BigInt(statuses.tweets[statuses.data.length - 1].id_str) - BigInt(1)
      ).toString(),
      rate_limit: statuses.rateLimit,
    })
  }

  async routePostLike(
    request: FastifyRequest<{
      Params: {
        tweet_id: string
      }
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const tweetId = request.params.tweet_id

    const twitterApi = new TwitterApi({
      appKey: this.config.twitter.consumerKey,
      appSecret: this.config.twitter.consumerSecret,
      accessToken: this.config.twitter.accessToken,
      accessSecret: this.config.twitter.accessSecret,
    })
    const result = await twitterApi.v1
      .post('favorites/create.json', {
        id: tweetId,
      })
      .catch((err) => {
        reply
          .code(400)
          .send(
            `Bad Request: ${err.errors[0].message} (code: ${err.errors[0].code})`
          )
        return null
      })
    if (!result) {
      return
    }
    reply.send({
      liked: true,
    })
  }

  filterNull<T>(items: (T | null)[]): T[] {
    return items.filter((item) => item !== null).flatMap((item) => item) as T[]
  }
}
