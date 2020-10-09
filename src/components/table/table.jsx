import React, { useState, useEffect, useReducer } from 'react'
import PropTypes from 'prop-types';
import { Table } from 'antd';
import './table.less';

const reducerType = {
  CHANGE_PAGE: 'CHANGE_PAGE',
};

// 分页器
const initPagination = {
  current: 1,
  pageSize: 10,
  total: 0,
};

// 分页器reducer
function paginationReducer(state, action) {
  const { payload, type } = action;
  switch (type) {
    case reducerType.CHANGE_PAGE:
      state.current = payload;
      return state;
    default:
      throw new Error({ message: 'table组件的useReducer使用了不在定义范围内的Key~' });
  }
};

function TableComp(props) {
  // 分页器useReducer
  const [pagination, paginationDispatch] = useReducer(paginationReducer, initPagination);
  // 传入参数
  const { requestFunc, requestQuery, paginationPos } = props;
  // 列表数据
  const [listData, setListData] = useState([]);
  // 加载状态
  const [loading, setLoading] = useState([]);

  /**
   * DidMount
   */
  useEffect(
    init(),
    [],
  );

  /**
   * 初始化
   */
  function init() {
    console.log('init');
    requestData({ current: 1, pageSize: 10 });
  }

  /**
   * refresh
   */
  function refreshList() {
    console.log('refresh');
    requestData();
  }

  // 切换页码
  function handlePageChange(pagination, filters, sorter, extra) {
    console.log('pageChange');
    if(extra.action === 'paginate') {
      const { current, pageSize } = pagination
      requestData({ current, pageSize })
    }
  }

  /**
   * 请求数据
   * @param {number} current
   * @param {number} size
   * @returns<Promise>
   */
  async function requestData({ current, size } = {}) {
    console.log('request')
    if(loading) return Promise.resolve();
    setLoading(true);
    try {
      const pageNum = current || pagination.current || 1;
      const pageSize = size || pagination.pageSize || 10;
      const params = {
        ...requestQuery,
        pageNum,
        pageSize,
      };
      const result = await requestFunc(params);
      setListData(result.data || []);
      paginationDispatch({
        type: reducerType.CHANGE_PAGE,
        payload: pageNum
      });
      return Promise.resolve(result);
    } catch(e) {
      return Promise.reject(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Table
      dataSource={listData}
      loading={loading}
      pagination={{ ...pagination, position: paginationPos }}
      {...props}
      onChange={handlePageChange}
    />
  )
};

TableComp.defaultProps = {
  // 请求function
  requestFunc: () => {},
  // 请求参数
  requestQuery: {},
  // 分页显示位置
  paginationPos: ['bottomRight']
};

TableComp.propTypes = {
  requestFunc: PropTypes.func.isRequired,
  requestQuery: PropTypes.object,
  paginationPos: PropTypes.arrayOf(PropTypes.string),
};

export default TableComp
