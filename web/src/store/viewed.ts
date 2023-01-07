export const useViewedStore = defineStore('viewed', {
  state: (): {
    rowIds: string[]
  } => ({
    rowIds: []
  }),

  getters: {
    getRowIds: (state) => state.rowIds,
    isViewed: (state) => (rowId: string): boolean => state.rowIds.includes(rowId)
  },

  actions: {
    /**
     * 既読済みリストに追加する
     *
     * @param rowId 行 ID
     */
    add(rowId: string) {
      if (this.rowIds.includes(rowId)) { return }
      this.rowIds.push(rowId)
    },
    /**
     * 複数の行 ID 既読済みリストに追加する
     *
     * @param rowIds 行 ID 群
     */
    addAll(rowIds: string[]) {
      for (const rowId of rowIds) {
        this.add(rowId)
      }
    }
  },

  persist: {
    storage: persistedState.localStorage
  }
})
