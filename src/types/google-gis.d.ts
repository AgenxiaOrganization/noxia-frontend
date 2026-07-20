/**
 * Type augmentation for the Google Identity Services (GIS) SDK.
 *
 * The SDK is loaded at runtime via a <script> tag, so it is not available
 * as an npm package. This file teaches TypeScript about `window.google` so
 * all files in the project can use it without repeating the declaration.
 *
 * Reference: https://developers.google.com/identity/gsi/web/reference/js-reference
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
          }) => void
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean
              isSkippedMoment: () => boolean
              isDismissedMoment: () => boolean
            }) => void
          ) => void
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>,
          ) => void
          disableAutoSelect: () => void
          revoke: (hint: string, callback: () => void) => void
        }
      }
    }
  }
}

// This empty export makes the file a module (required for `declare global`
// to work correctly when the file has no other imports/exports).
export {}
