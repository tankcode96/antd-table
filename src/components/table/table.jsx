import React, {
  useState,
  forwardRef,
  useEffect,
  useReducer,
  useImperativeHandle,
} from 'react';
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

const TableComp = forwardRef((props, ref) => {
  // 传入参数
  const {
    useOutsideData,
    dataSource,
    rowKey,
    requestFunc,
    requestQuery,
    extraPagination,
  } = props;
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

  useImperativeHandle(ref, () => ({
    init,
    refreshList,
  }));

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
    if (!useOutsideData) return requestData({ current: 1, pageSize: 10 });
  }

  function refreshList() {
    if (!useOutsideData) return requestData();
  }

  /**
   * 切换页码
   * @param {number} current
   * @param {number} pageSize
   */
  function handlePageChange(current, pageSize) {
    requestData({ current, pageSize });
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
   * 请求数据，也可通过调用此方法实现刷新列表
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
      const result = requestFunc ? await requestFunc(params) : [];
      if (unNeedPaging) {
        setListData(result || []);
        return Promise.resolve(result);
      }
      const { list, pageNo, totalCount = 0 } = result;
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
    <Table
      {...props}
      rowKey={rowKey}
      dataSource={useOutsideData ? dataSource : listData}
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
    />
  );
});

TableComp.defaultProps = {
  // 使用外部的数据，不用请求数据
  useOutsideData: false,
  // useOutsideData为true时，此数据为表格数据
  dataSource: [],
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
  useOutsideData: PropTypes.bool,
  dataSource: PropTypes.array,
  rowKey: PropTypes.string.isRequired,
  requestFunc: PropTypes.func,
  requestQuery: PropTypes.object,
  queryTransformMap: PropTypes.object,
  extraPagination: PropTypes.object,
  validateFunc: PropTypes.func,
  onListChange: PropTypes.func,
  onLoadingChange: PropTypes.func,
};

export default TableComp;
