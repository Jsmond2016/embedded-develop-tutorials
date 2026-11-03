declare module 'markdown-it-task-lists' {
  interface TaskListOptions {
    enabled?: boolean
    label?: boolean
    labelAfter?: boolean
  }

  const taskLists: (md: unknown, options?: TaskListOptions) => void

  export default taskLists
}
