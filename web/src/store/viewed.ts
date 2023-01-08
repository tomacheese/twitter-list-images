export const useViewedStore = defineStore('viewed', {
  state: (): {
    imageIds: string[]
  } => ({
    imageIds: []
  }),

  getters: {
    isViewed: (state) => (imageId: string): boolean => state.imageIds.includes(imageId)
  },

  actions: {
    /**
     * 既読済みリストに追加する
     *
     * @param imageId 行 ID
     */
    add(imageId: string) {
      if (this.imageIds.includes(imageId)) { return }
      this.imageIds.push(imageId)
    },
    /**
     * 複数の行 ID 既読済みリストに追加する
     *
     * @param imageIds 行 ID 群
     */
    addAll(imageIds: string[]) {
      for (const imageId of imageIds) {
        this.add(imageId)
      }
    }
  },

  persist: {
    storage: persistedState.localStorage
  }
})
