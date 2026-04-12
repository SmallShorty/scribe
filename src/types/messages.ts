export type MessageAction =
  | { action: 'openMessageTab'; text: string }
  | { action: 'sendReply'; text: string; vkTabId: number }
  | { action: 'injectReply'; text: string }

export interface MessageResponse {
  success: boolean
  error?: string
}
