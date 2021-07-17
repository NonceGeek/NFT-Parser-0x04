import {request} from './request'

export function getSpiritInfo(value) {
  return request({
    url: '/gene_api/' + value,
  })
}

export function getSortArray(value) {
  return request({
    url: '/format_list/',
    data: value,
    method: 'post',
  })
}
