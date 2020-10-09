import { get } from './request';

export const getTableList = ({
  pageNum,
  pageSize,
  ...options
} = {}) => {
  return get({
    pageNum,
    pageSize,
    ...options
  })
}
