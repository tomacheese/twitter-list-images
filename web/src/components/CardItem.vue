<!-- 個別カードアイテムコンポーネント -->

<script setup lang="ts">
import { Buffer } from 'buffer'
import { getColor, Palette } from 'color-thief-node'
import { PropType } from 'vue'
import { useViewedStore } from '../store/viewed'
import { Tweet } from '../types/types'

// --- store
const viewedStore = useViewedStore()

// --- emit
interface Emits {
  /** ツイートをいいねする */
  (e: 'like', tweet: Tweet): void
}
const emit = defineEmits<Emits>()

// --- props
/**
 * Props: コンポーネントを呼び出されたときに渡されるプロパティ
 *
 * @param item ツイートの情報
 * @param isAnd ツイートが AND 検索で取得されているか
 */
const props = defineProps({
  item: {
    type: Object as PropType<Tweet>,
    required: true
  }
})

// --- data
/** 画像ファイルの Data Url: https://developer.mozilla.org/ja/docs/Web/HTTP/Basics_of_HTTP/Data_URLs */
const dataUrl = ref<string | null>()
/** 画像に掛けるグラデーション */
const gradient = ref<string>()
/** カードタイトルのクラス（色指定など） */
const cardTitleClass = ref<string>()
/** 初めて表示するか */
const isNew = ref<boolean>(false)
/** 画像をロード中か */
const isLoading = ref<boolean>(true)

// --- methods
/**
 * 画像の高さを計算する
 *
 * - Twitter が画像の高さを提供する場合、横幅に応じて高さを計算する
 * - 画像の高さが提供されない場合は、デフォルトの高さ(338px)を返す
 *
 * @param item ツイートの情報
 * @returns 画像の高さ
 */
const calcHeight = (item: Tweet): string => {
  const image = item.media.size
  if (!image || !image.h) { return '338px' }
  return `${(image.h / image.w) * 240}px`
}

/**
 * RGB を輝度に変換する
 *
 * @param rgb RGB パレット
 */
const rgb2Lightness = (rgb: Palette): number => {
  const r = rgb[0] / 255
  const g = rgb[1] / 255
  const b = rgb[2] / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  return (max + min) / 2
}

/**
 * 値が ArrayBuffer かどうかを判定する
 *
 * @param value 値
 * @returns ArrayBuffer なら true
 */
const isArrayBuffer = (value: unknown): value is ArrayBuffer => {
  return value instanceof ArrayBuffer
}

/**
 * 画像の URL をもとに Data URL を取得する
 *
 * @param url 画像の URL
 * @returns Data URL
 */
const getDataUrl = async (url: string): Promise<string> => {
  const response = await useFetch<ArrayBuffer>(url, { responseType: 'arrayBuffer' })
  if (!response.data) {
    throw new Error('response.data is undefined')
  }
  const data = response.data.value
  if (!data) {
    throw new Error('data is undefined')
  }
  if (!isArrayBuffer(data)) {
    throw new Error('data is not ArrayBuffer')
  }
  const base64 = Buffer.from(data).toString('base64')
  return `data:image/jpeg;base64,${base64}`
}

/**
 * 画像の Data URL をもとにカラーパレットを取得する
 *
 * @param dataUrl 画像の Data URL
 * @returns カラーパレット
 */
const getPalette = async (dataUrl: string): Promise<Palette> => {
  const image = new Image()
  return await new Promise<Palette>((resolve, reject) => {
    image.onload = (): void => {
      resolve(getColor(image))
    }
    image.onerror = (error): void => {
      reject(error)
    }
    image.src = dataUrl
  })
}

/**
 * カードタイトルのクラスを作成する
 *
 * - 輝度が 0.7 以上なら白文字色、0.7 未満なら黒文字色
 *
 * @param palette カラーパレット
 * @returns クラス
 */
const getCardTitleClass = (palette: Palette): string => {
  const commonClasses = 'text-right text-subtitle-2'
  const lightness = rgb2Lightness(palette)
  // 0.7以上なら白、0.7未満なら黒
  return lightness <= 0.7 ? `${commonClasses} text-white` : `${commonClasses} text-black`
}

/**
 * グラデーションを作成する
 *
 * @param palette カラーパレット
 * @returns グラデーション
 */
const getGradient = (palette: Palette): string => {
  // Palette.toString() は、"r, g, b" の形式っぽい
  return `to bottom, rgba(${palette}, .1), rgba(${palette}, .5)`
}

/**
 * ツイートを開く
 */
const openTweet = (): void => {
  window.open(
    `https://twitter.com/${props.item.user.screen_name}/status/${props.item.tweet_id}`
  )
}

/**
 * ツイートをいいねする
 */
const likeTweet = (): void => {
  emit('like', props.item)
}

// --- computed
/**
 * いいねアイコン
 */
const heartIcon = computed((): string => {
  return props.item.liked ? 'mdi-heart' : 'mdi-heart-outline'
})

// --- onMounted
onMounted(async () => {
  isLoading.value = true
  isNew.value = !viewedStore.isViewed(props.item.image_id)

  // ツイートの画像 URL
  const imageURL = props.item.media.media_url_https
  if (!imageURL) {
    isLoading.value = false
    throw new Error('imageURL is undefined')
  }
  // 画像を Data URL に変換
  dataUrl.value = await getDataUrl(imageURL).catch(() => {
    return null
  })
  if (!dataUrl.value) {
    isLoading.value = false
    return
  }
  // パレットを取得
  const palette = await getPalette(dataUrl.value)
  // カードタイトルのクラスを作成
  cardTitleClass.value = getCardTitleClass(palette)
  // gradientを作成
  gradient.value = getGradient(palette)
  isLoading.value = false
})
</script>

<template>
  <v-badge v-model="isNew" overlap content="NEW" offset-x="20" color="green">
    <v-card width="240px">
      <v-img
        v-if="dataUrl && !isLoading"
        :height="calcHeight(item)"
        :src="dataUrl"
        class="align-end"
        style="cursor: pointer"
        :gradient="gradient"
        @click="openTweet()"
      >
        <v-row align="end" justify="space-between">
          <v-spacer />
          <v-btn class="ma-2" variant="plain" :icon="heartIcon" color="#f45b91" @click.stop="likeTweet()" />
        </v-row>
        <template #placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular indeterminate color="grey lighten-5" />
          </v-row>
        </template>
      </v-img>
      <v-card-text
        v-else-if="isLoading"
        class="text-center"
        :style="`height:${ calcHeight(item)}; line-height:${ calcHeight(item)}`"
      >
        <v-progress-circular indeterminate color="grey lighten-5" />
      </v-card-text>
    </v-card>
  </v-badge>
</template>
