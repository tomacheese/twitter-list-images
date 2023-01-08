<script setup lang="ts">
import ItemWrapper from './components/ItemWrapper.vue'
import { useViewedStore } from './store/viewed'
import { useSettingsStore } from './store/settings'
import { useSnackbarStore } from './store/snackbar'
import { Tweet } from './types/types'

type ImagesApiResponse = {
  items: Tweet[]
  next_max_id: string
  rate_limit: {
    limit: number
    remaining: number
    reset: number
  }
}

const config = useRuntimeConfig()

// --- store
const viewedStore = useViewedStore()
const settings = useSettingsStore()
const snackbarStore = useSnackbarStore()

// --- data
/** アイテム一覧 */
const items = ref<Tweet[]>([])
/** 次回リクエスト用 max_id */
const maxId = ref<string | undefined>(undefined)
/** ローディング中かどうか */
const loading = ref(true)
/** 既読アイテム一覧 */
const viewedIds = ref<string[]>([...viewedStore.imageIds])

// --- settings computed
const isOnlyNew = computed({
  get: () => settings.isOnlyNew,
  set: (val) => settings.setOnlyNew(val)
})
const { magicGrid: magicGridSettings } = toRefs(settings)

// --- refs
/** MagicGrid.update() アクセス用 ref */
const magicgrid = ref()

// --- methods
/** MagicGrid.update() を遅延実行する */
const updateMagicGrid = (): void => {
  setTimeout(() => {
    magicgrid.value?.update()
  }, 100)
}

/** トップにスクロールする */
const scrollToTop = (): void => {
  window.scroll({ top: 0, behavior: 'smooth' })
}

/** アイテム一覧をAPIから取得する */
const fetchItems = async (): Promise<void> => {
  loading.value = true
  const response = await useFetch<ImagesApiResponse>(
    `${config.public.apiBaseURL}/images`,
    {
      method: 'GET',
      params: {
        max_id: maxId.value
      }
    }
  )
  if (response.error.value) {
    alert(`Error: "Failed to fetch images: ${response.error.value}`)
    return
  }
  if (!response || !response.data.value) {
    return
  }
  const results = response.data.value.items.filter((item) => {
    return isOnlyNew.value ? !viewedIds.includes(item.image_id) : true
  })
  items.value = [...items.value, ...results].filter((tweet, index, self) => {
    return self.findIndex((t) => t.image_id === tweet.image_id) === index
  })
  maxId.value = response.data.value.next_max_id
  loading.value = false
}

/** 既読状態をアップデートする */
const onViewed = (item: Tweet): void => {
  viewedStore.add(item.image_id)
}

/** すべてのアイテムを既読にする */
const onAllViewed = (): void => {
  viewedStore.addAll(items.value.map((item) => item.image_id))

  snackbarStore.start('表示中のすべてのアイテムを既読にしました。3秒後に再読み込みします。', 'green')
  setTimeout(() => {
    location.reload()
  }, 3000)
}

/** さらに読み込む */
const loadMore = async (): Promise<void> => {
  scrollToTop()
  await fetchItems()
  viewedIds.value = [...viewedStore.imageIds]
  updateMagicGrid()
}

/** ツイートをいいねする */
const likeTweet = async (item: Tweet): Promise<void> => {
  if (item.liked) {
    return
  }
  const response = await useFetch(`${config.public.apiBaseURL}/like/${item.tweet_id}`, {
    method: 'POST'
  })
  if (response.error.value) {
    alert(`Error: "Failed to like tweet: ${response.error.value}`)
    return
  }
  if (!response || !response.data.value) {
    return
  }
  snackbarStore.start('いいねしました。', 'green')
  items.value = items.value.map((i) => {
    if (i.tweet_id === item.tweet_id) {
      return { ...i, liked: true }
    }
    return i
  })
}

// --- watch
/** 新しいアイテムのみ表示かどうかが変更されたら、設定に反映したうえでアイテム一覧を取得する */
watch(isOnlyNew, () => {
  settings.setOnlyNew(isOnlyNew.value)
  maxId.value = undefined
  fetchItems().then(() => {
    viewedIds.value = [...viewedStore.imageIds]
    updateMagicGrid()
  })
})

// --- onMounted
onMounted(async () => {
  // localStorageにある設定を反映する
  isOnlyNew.value = settings.isOnlyNew

  await fetchItems()
})
</script>

<template>
  <v-app>
    <v-main>
      <TheHeader :loading="loading" @all-viewed="onAllViewed" />
      <v-container v-if="items.length === 0 && !loading">
        <v-card>
          <v-card-text class="text-h6 text-center my-3">
            該当するアイテムが見つかりませんでした
          </v-card-text>
        </v-card>
      </v-container>
      <div v-if="loading" class="d-flex justify-center my-5">
        <v-progress-circular v-if="loading" indeterminate />
      </div>
      <MagicGrid
        v-if="!loading && items.length !== 0"
        ref="magicgrid"
        :animate="true"
        :use-min="true"
        :gap="magicGridSettings.gap"
        :max-cols="magicGridSettings.maxCols"
        :max-col-width="magicGridSettings.maxColWidth"
      >
        <ItemWrapper v-for="item of items" :key="item.image_id" :item="item" @intersect="onViewed">
          <CardItem :item="item" @like="likeTweet" />
        </ItemWrapper>
      </MagicGrid>
      <v-container>
        <v-btn class="py-5" block color="blue" :loading="loading" @click="loadMore">
          さらに読み込む
        </v-btn>
      </v-container>
      <GlobalSnackbar />
    </v-main>
  </v-app>
</template>
