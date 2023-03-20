export interface GraphQLListByRestIdResponse {
  data: {
    list: {
      created_at: number
      default_banner_media: {
        media_info: {
          original_img_url: string
          original_img_width: number
          original_img_height: number
          salient_rect: {
            left: number
            top: number
            width: number
            height: number
          }
        }
      }
      default_banner_media_results: {
        result: {
          id: string
          media_key: string
          media_id: string
          media_info: {
            __typename: string
            original_img_height: number
            original_img_width: number
            original_img_url: string
            salient_rect: {
              height: number
              left: number
              top: number
              width: number
            }
          }
          __typename: string
        }
      }
      description: string
      following: boolean
      id: string
      id_str: string
      member_count: number
      mode: string
      user_results: {
        result: {
          __typename: string
          id: string
          rest_id: string
          affiliates_highlighted_label: {}
          has_graduated_access: boolean
          is_blue_verified: boolean
          legacy: {
            can_dm: boolean
            can_media_tag: boolean
            created_at: string
            default_profile: boolean
            default_profile_image: boolean
            description: string
            entities: {
              description: {
                urls: unknown[]
              }
            }
            fast_followers_count: number
            favourites_count: number
            followers_count: number
            friends_count: number
            has_custom_timelines: boolean
            is_translator: boolean
            listed_count: number
            location: string
            media_count: number
            name: string
            needs_phone_verification: boolean
            normal_followers_count: number
            pinned_tweet_ids_str: string[]
            possibly_sensitive: boolean
            profile_banner_extensions: {}
            profile_banner_url: string
            profile_image_extensions: {}
            profile_image_url_https: string
            profile_interstitial_type: string
            screen_name: string
            statuses_count: number
            translator_type: string
            verified: boolean
            want_retweets: boolean
            withheld_in_countries: unknown[]
          }
          business_account: {}
        }
      }
      name: string
      is_member: boolean
      subscriber_count: number
      muting: boolean
      pinning: boolean
    }
  }
}
