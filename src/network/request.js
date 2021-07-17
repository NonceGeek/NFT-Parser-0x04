import axios from 'axios'

export function request(config) {

  const instance = axios.create({
    baseURL:'http://47.106.10.136:5000',
    timeout:5000
  })
  return instance(config)
}
