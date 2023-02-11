import axios, { AxiosInstance } from 'axios'
import { Configuration } from './config'
import { Status } from 'twitter-d'

export class TwApi {
  private twApiAxios: AxiosInstance | undefined
  private targetListId: string | undefined

  constructor(config: Configuration) {
    this.twApiAxios = axios.create({
      baseURL: config.twapi.baseUrl,
      auth: {
        username: config.twapi.basicUsername,
        password: config.twapi.basicPassword,
      },
    })
    this.targetListId = config.twapi.targetListId
  }

  public async getListTweets(limit: number) {
    if (!this.twApiAxios) {
      throw new Error('TwAPI is not initialized')
    }
    const { data } = await this.twApiAxios.get<Status[]>(
      `/lists/${this.targetListId}/tweets`,
      {
        params: {
          user_id: this.targetListId,
          limit,
        },
      }
    )
    return data
  }

  public async likeTweet(tweetId: string): Promise<void> {
    if (!this.twApiAxios) {
      throw new Error('TwAPI is not initialized')
    }
    await this.twApiAxios.post(`/tweets/${tweetId}/like`)
  }
}
