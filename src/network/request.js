import axios from 'axios'

export function request(config) {

  const instance = axios.create({
    baseURL: 'https://taishang.cnmf.net.cn:5000',
    timeout: 5000
  })
  return instance(config)
}
