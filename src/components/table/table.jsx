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
  const { rowKey, requestFunc, requestQuery, extraPagination } = props;
  // 分页器useReducer
  const [pagination, paginationDispatch] = useReducer(
    paginationReducer,
    initPagination
  );

  // 列表数据
  const [listData, setListData] = useState([]);
  useEffect(() => {
    props.onListChange && props.onListChange(pagination);
  }, [listData]);

  // 加载状态
  const [loading, setLoading] = useState(false);
  useEffect(() => {
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
    requestData({ current: 1, pageSize: 10 });
    // .then(() => {
    //   props.onListChange && props.onListChange({ pagination, loading });
    // });
  }

  /**
   * refresh
   */
  function refreshList() {
    requestData()
    //  .then(() => {
    //    props.onListChange && props.onListChange({ pagination, loading });
    //  });
  };

  /**
   * 切换页码
   * @param {number} current
   * @param {number} pageSize
   */
  function handlePageChange(current, pageSize) {
    requestData({ current, pageSize });
    // .then(() => {
    //   props.onListChange && props.onListChange({ pagination, loading });
    // });
  }

  /**
   * 表单参数命名转换
   * @param {object} sourceData 源数据
   * @param {object} transformMap 对象key转换规则，形如{ aB: 'AB' }，将{ aB: 'value' }转换成{ AB: 'value' }
   */
  function transformData(sourceData = {}, transformMap = {}) {
    if (Object.keys(transformMap).length === 0) return sourceData;
    const formData = {};
    for (const [key, value] of Object.entries(sourceData)) {
      const k = transformMap[key] || key;
      formData[k] = value;
    }
    return formData;
  }

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
      const { unNeedPaging: unNeedPaging = false } = extraPagination;
      const pageNum = current || pagination.current || 1;
      const pageSize = size || pagination.pageSize || 10;
      const sourceParams = !unNeedPaging
        ? {
            ...requestQuery,
            current: pageNum,
            pageSize,
          }
        : requestQuery;
      // 修改参数Key值
      const params = transformData(sourceParams, props.queryTransformMap);
      const result = await requestFunc(params);
      if (unNeedPaging) {
        setListData(result.data || []);
        return Promise.resolve(result);
      }
      const { list = [], pageNo, totalCount = 0 } = result.data;
      paginationDispatch({
        type: reducerType.UPDATE_PAGINATION,
        payload: {
          current: pageNo,
          total: totalCount,
        },
      });
      setListData(list || []);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.reject(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Table
        rowKey={rowKey}
        dataSource={listData}
        loading={loading}
        pagination={
          !extraPagination.unNeedPaging
            ? {
                ...pagination,
                ...extraPagination,
                onChange: handlePageChange,
              }
            : false
        }
        {...props}
      />
    </>
  );
}

TableComp.defaultProps = {
  // 表格的rowKey
  rowKey: '',
  // 请求function
  requestFunc: () => {},
  // 请求参数
  requestQuery: {},
  // 请求参数转换映射
  queryTransformMap: {},
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
  rowKey: PropTypes.string.isRequired,
  requestFunc: PropTypes.func.isRequired,
  requestQuery: PropTypes.object,
  queryTransformMap: PropTypes.object,
  extraPagination: PropTypes.object,
  validateFunc: PropTypes.func,
  onListChange: PropTypes.func,
  onLoadingChange: PropTypes.func,
};

export default TableComp;
