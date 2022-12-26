const Config = () => {
  if (process.env.REACT_APP_NODE_ENV === 'staging') {
    // staging
    return {
      restful: {
        apiURL: process.env.REACT_APP_STG_API_URL,
        wsURL: process.env.REACT_APP_STG_WS_URL,
        noVNCURL: process.env.REACT_APP_STG_NOVNC_URL,
      },
    }
  }
  if (process.env.REACT_APP_NODE_ENV === 'prod') {
    // production
    return {
      restful: {
        apiURL: process.env.REACT_APP_PROD_API_URL,
        wsURL: process.env.REACT_APP_PROD_WS_URL,
        noVNCURL: process.env.REACT_APP_PROD_NOVNC_URL,
      },
    }
  }
  // development
  return {
    restful: {
      apiURL: process.env.REACT_APP_DEV_API_URL,
      wsURL: process.env.REACT_APP_DEV_WS_URL,
      noVNCURL: process.env.REACT_APP_DEV_NOVNC_URL,
    },
  }
}

export const restfulApiConfig = Config().restful
