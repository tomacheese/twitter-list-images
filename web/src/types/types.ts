export interface Tweet {
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
