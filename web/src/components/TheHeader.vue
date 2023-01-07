<!-- ヘッダーコンポーネント -->

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { useSettingsStore } from '../store/settings'

/// --- store
const settings = useSettingsStore()

// --- emit
interface Emits {
  /** すべてのアイテムを既読にする */
  (e: 'allViewed'): void
}
const emit = defineEmits<Emits>()

// --- settings computed
const isOnlyNew = computed({
  get: () => settings.isOnlyNew,
  set: (val) => settings.setOnlyNew(val)
})

// --- props
defineProps<{
  /** ロード中かどうか */
  loading: boolean
}>()

// --- methods
/** すべてのアイテムを既読にする */
const allViewed = (): void => {
  if (!confirm('すべてのアイテムを既読にしますか？')) {
    return
  }
  emit('allViewed')
}

// --- computed
// --- display helpers
const { mdAndUp } = useDisplay()
</script>

<template>
  <v-container fluid>
    <div class="header-box">
      <v-row class="title-container">
        <div class="text-body text-h5 text-sm-h4 font-weight-bold">
          Twitter List Images
        </div>
        <div class="d-flex justify-end">
          <SettingsModal />
          <DarkModeSwitch />
        </div>
      </v-row>
    </div>
    <div class="view-items-container d-flex flex-column flex-md-row justify-md-space-between">
      <v-btn-toggle v-model="isOnlyNew" variant="outlined" mandatory>
        <v-btn :value="true" selected-class="font-weight-bold">
          <v-icon size="x-large" class="mr-1">
            mdi-alert-decagram
          </v-icon>
          新しいアイテムのみ
        </v-btn>
        <v-btn :value="false" selected-class="font-weight-bold">
          <v-icon size="x-large" class="mr-1">
            mdi-all-inclusive
          </v-icon>
          すべて表示
        </v-btn>
      </v-btn-toggle>
      <v-btn :disabled="loading" :block="!mdAndUp" size="large" @click="allViewed">
        <v-icon size="x-large" class="mr-1">
          mdi-check-all
        </v-icon>
        すべて既読
      </v-btn>
    </div>
  </v-container>
</template>

<style scoped>
.header-box {
  padding: 2rem;
  border: 1px solid #464646;
  border-radius: 5px;
  margin: 0 10px;
  background-color: rgb(var(--v-theme-surface))
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.display-settings {
  width: 100%;
  justify-content: space-between;
  align-items: center;
  column-gap: 1rem;
  margin-bottom: 1rem;
}

.view-items-container {
  padding: 1rem;
  gap: 1rem;
}
</style>
