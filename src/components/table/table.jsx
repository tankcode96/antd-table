import React, { useState, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import './table.less';

const reducerType = {
  UPDATE_PAGINATION: 'UPDATE_PAGINATION',
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
    case reducerType.UPDATE_PAGINATION:
      return { ...state, ...payload };
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
  useEffect(() => {
    console.log('listData改变了', pagination)
    props.onListChange && props.onListChange(pagination);
  }, [listData]);

  // 加载状态
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    console.log('loading改变了', loading)
    props.onLoadingChange && props.onLoadingChange(loading);
  }, [loading]);
  
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
    requestData({ current: 1, pageSize: 10 })
      // .then(() => {
      //   props.onListChange && props.onListChange({ pagination, loading });
      // });
  };

  // /**
  //  * refresh
  //  */
  // function refreshList() {
  //   requestData()
  //    .then(() => {
  //      props.onListChange && props.onListChange({ pagination, loading });
  //    });
  // };

  /**
   * 切换页码
   * @param {number} current
   * @param {number} pageSize
   */
  function handlePageChange(current, pageSize) {
    requestData({ current, pageSize })
      // .then(() => {
      //   props.onListChange && props.onListChange({ pagination, loading });
      // });
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
      paginationDispatch({
        type: reducerType.UPDATE_PAGINATION,
        payload: {
          current: pageNum,
          total: result.total
        },
      });
      setListData(result.data || []);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
    </>
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
  // Table的loading更新回调
  onLoadingChange: () => {},
};

TableComp.propTypes = {
  requestFunc: PropTypes.func.isRequired,
  requestQuery: PropTypes.object,
  extraPagination: PropTypes.object,
  validateFunc: PropTypes.func,
  onListChange: PropTypes.func,
  onLoadingChange: PropTypes.func,
};

export default TableComp;
