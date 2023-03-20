import { BaseRouter } from '@/lib/base-router'
import { Utils } from '@/lib/utils'
import { FastifyReply, FastifyRequest } from 'fastify'

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
        page?: string
      }
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const page = request.query.page ? parseInt(request.query.page) : 1
    const tweets = await this.twitter.getListTweets(
      this.config.get('twitter').targetListId,
      100 * page
    )

    const imagesTweets = tweets.filter(
      (tweet) => tweet.extended_entities && tweet.extended_entities.media
    )
    const images: Tweet[] = Utils.filterNull(
      imagesTweets.flatMap((tweet) => {
        if (!Utils.isFullUser(tweet.user)) {
          return null
        }
        if (!tweet.extended_entities || !tweet.extended_entities.media) {
          return null
        }
        const user = tweet.user

        const media = tweet.extended_entities.media
        return media.map((m) => {
          if (m.type !== 'photo') return null
          return {
            tweet_id: tweet.id_str,
            image_id: m.id_str,
            user: {
              user_id: user.id_str,
              screen_name: user.screen_name,
              name: user.name,
              profile_image_url_https: user.profile_image_url_https,
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
      next_page: page + 1,
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

    const result = await this.twitter
      .likeTweet(tweetId)
      .then(() => true)
      .catch((e) => e.message)
    if (result === true) {
      reply.send({
        liked: true,
      })
      return
    }
    reply.send({
      liked: false,
      error: result,
    })
  }
}
