import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useQueryStore = defineStore('query', () => {
    const queryParams = ref({
        search: '',
        category: ''
    })

    const setQueryParams = (search: string = '', category: string = '') => {
        queryParams.value = { search, category }
        return
    }
    return { queryParams, setQueryParams }
}) 