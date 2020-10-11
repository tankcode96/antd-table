import React, { useState, useEffect, useReducer } from 'react';
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
      throw new Error({
        message: 'table组件的useReducer使用了不在定义范围内的Key~',
      });
  }
}

function TableComp(props) {
  // 传入参数
  const { requestFunc, requestQuery, extraPagination } = props;
  // 分页器useReducer
  const [pagination, paginationDispatch] = useReducer(
    paginationReducer,
    initPagination
  );
  // 列表数据
  const [listData, setListData] = useState([]);
  // 加载状态
  const [loading, setLoading] = useState(false);

  /**
   * DidMount
   */
  useEffect(() => {
    init();
  }, []);

  /**
   * 初始化
   */
  function init() {
    requestData({ current: 1, pageSize: 10 }).then(() => {
      props.onListChange && props.onListChange(pagination, loading);
    });
  };

  /**
   * refresh
   */
  function refreshList() {
    requestData().then(() => {
      props.onListChange && props.onListChange(pagination, loading);
    });
  };

  /**
   * 切换页码
   * @param {number} current
   * @param {number} pageSize
   */
  function handlePageChange(current, pageSize) {
    requestData({ current, pageSize }).then(() => {
      props.onListChange && props.onListChange(pagination, loading);
    });
  };

  /**
   * 请求数据
   * @param {number} current
   * @param {number} size
   * @returns<Promise>
   */
  async function requestData({ current, size } = {}) {
    if (!props.validateFunc || !props.validateFunc()) return Promise.reject();
    if (loading) return Promise.resolve();
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
        payload: pageNum,
      });
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Table
      dataSource={listData}
      loading={loading}
      pagination={{
        ...pagination,
        ...extraPagination,
        onChange: handlePageChange,
      }}
      {...props}
    />
  );
}

TableComp.defaultProps = {
  // 请求function
  requestFunc: () => {},
  // 请求参数
  requestQuery: {},
  // 分页器的其他配置
  extraPagination: {},
  // 校验方法，默认通过验证
  validateFunc: () => true,
  // TableList数据更新回调
  onListChange: () => {},
};

TableComp.propTypes = {
  requestFunc: PropTypes.func.isRequired,
  requestQuery: PropTypes.object,
  extraPagination: PropTypes.object,
  validateFunc: PropTypes.func,
  onListChange: PropTypes.func,
};

export default TableComp;
