/// <reference types="vite/client" />
/// <reference types="vite-plugin-monkey/client" />
//// <reference types="vite-plugin-monkey/global" />

// Add GM_config wrapper
declare module "$" {
  interface MonkeyWindow {
    GM_config: (options: InitOptions<CustomTypes>) => GM_configStruct
  }
}
