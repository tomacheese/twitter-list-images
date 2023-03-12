import axios, { AxiosInstance } from 'axios'
import { Status } from 'twitter-d'

interface TwApiOptions {
  baseUrl: string
  basicUsername: string
  basicPassword: string
  targetListId: string
}

export class TwApi {
  private twApiAxios: AxiosInstance | undefined
  private targetListId: string | undefined

  constructor(options: TwApiOptions) {
    this.twApiAxios = axios.create({
      baseURL: options.baseUrl,
      auth: {
        username: options.basicUsername,
        password: options.basicPassword,
      },
    })
    this.targetListId = options.targetListId
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
