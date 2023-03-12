const Config = () => {
  return {
    restful: {
      apiURL: import.meta.env.VITE_API_URL,
      wsURL: import.meta.env.VITE_WS_URL,
      noVNCURL: import.meta.env.VITE_NOVNC_URL,
    },
  }
}

export const restfulApiConfig = Config().restful
