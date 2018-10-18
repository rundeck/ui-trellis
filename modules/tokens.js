export const getUIAjaxTokens = () => {
  return new Promise((resolve, reject) => {
    if (window._rundeck.token) {
      resolve(window._rundeck.token)
    } else {
      let uiTokenElement = document.getElementById('ui_token')

      if (uiTokenElement) {
        let jsonText = uiTokenElement.textContent || uiTokenElement.innerText
        let response = jsonText && jsonText !== '' ? JSON.parse(jsonText) : null
        window._rundeck.token = response
        resolve(response)
      } else {
        reject(new Error('No token exists'))
      }
    }
  })
}

export const setNewUIToken = (responseHeaders) => {
  return new Promise((resolve) => {
    window._rundeck.token = {
      'TOKEN': responseHeaders['x-rundeck-token-key'],
      'URI': responseHeaders['x-rundeck-token-uri']
    }
    resolve()
  })
}

export const getToken = (token_name) => {
  return new Promise((resolve, reject) => {
    if (window._rundeck[token_name]) {
      resolve(window._rundeck[token_name])
    } else {
      let uiTokenElement = document.getElementById(token_name)

      if (uiTokenElement) {
        let jsonText = uiTokenElement.textContent || uiTokenElement.innerText
        let response = jsonText && jsonText !== '' ? JSON.parse(jsonText) : null
        window._rundeck[token_name] = response
        resolve(response)
      } else {
        reject(new Error('No token exists'))
      }
    }
  })
}

export const setToken = (responseHeaders, token_name) => {
  return new Promise((resolve) => {
    window._rundeck[token_name] = {
      'TOKEN': responseHeaders['x-rundeck-token-key'],
      'URI': responseHeaders['x-rundeck-token-uri']
    }
    resolve()
  })
}

export default {
  getUIAjaxTokens,
  setNewUIToken,
  getToken,
  setToken
}
