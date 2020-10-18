# antd-table
基于Ant Design封装的表格组件 (A table component base Ant Design)

仅针对数据请求和分页设置进行简单的封装。

## **场景**

在做管理后台时，免不了需要大量的表单和表格进行数据的查询和展示，在不使用一些公共组件的情况下，我们需要在多个页面编写重复的逻辑代码，而这些繁复的代码会让项目变得代码变得越来越难以维护。所以我们面对繁复的代码时，最好是从中提取出公共逻辑，并将其封装成公共方法或公共组件，简化我们的项目代码。

例如在管理后台项目中使用Ant Design组件库时，我们会在多个页面/模块使用table组件。antd table内部已经是集成了pagination了，但是我们使用antd table时，还是需要写一些api调用方法、分页处理逻辑。所以我打算将此重复逻辑进行一个封装，可以满足相对简单的使用场景，简化项目代码。

## **思路**

- antd table封装得已经非常好用，暴露出来的api非常复杂，如果想要对其所有api进行再封装，是一件非常复杂且得不偿失的工作，一般我们想要用的功能更多是简单的请求数据和分页处理。所以我们只针对常用的数据请求功能和分页设置进行封装。

- 通常我们是在外部请求到数据后传入antd table，然后再传入table的其他配置（columns、pagination、rowKey等等）。在我们封装的组件中，请求数据是在组件内部完成的，只需传入一个`requestFunc`，内部会调用此方法，进行数据请求。

- 要在组件内部实现分页器逻辑，所以就在组件内部定义了默认的`pagination`对象，这个只三个默认的属性`current`、`pageSize`、`total`，其他的属性可通过`extraPagination`传入组件。

- 除了组件暴露出来的api，antd table提供的所有api，都可以使用，传入组件的话，组件会不加处理就出入到内部的antd table组件中，也就是说，平常怎么给antd table配置，在这个组件中就可以怎么用。

- 使用无状态组件，使用Hook。React团队将会重写React文档，文档中的代码示例会用无状态组件的方式编写，所以无状态组件的编写方式未来应该是主推的写法。本人也在学习Hook，具体Hook的用法可参阅文档[React Hook](https://react.docschina.org/docs/hooks-intro.html)。

## **版本**

>暴露出来的api
```js
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
  // TableList数据更新回调，参数是当前pagination对象
  onListChange: () => {},
  // Table的loading更新回调，参数是当前loading状态
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
```

## **代码片段**
```js
// 模版部分
···
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
···
```

## **使用**
```js
import React from 'react';
import PropTypes from 'prop-types';
import { getConfigList, } from 'api/xxx';
import TableComp from 'components/table';

class Table extends React.Component {
  // 表格组件实例
  tableRef = null;

  constructor(props) {
    super(props);
    this.state = {
      categoryId: null,
    };
    // 绑定作用域
    this.validateConfigQuest = this.validateConfigQuest.bind(this);
    this.handleListChange = this.handleListChange.bind(this);
    this.handleLoadingChange = this.handleLoadingChange.bind(this);
  }

  /**
   * 列表数据请求的校验方法
   */
  validateConfigQuest() {
    // return true or false
  }

  /**
   * 列表更新回调
   * @param {object} pagination 分页器对象
   */
  handleListChange(pagination) {
    ...
  }

  /**
   * 表格状态更新回调
   * @param {boolean} loading 分页器对象
   */
  handleLoadingChange(loading) {
    ...
  }

  render() {
    const { categoryId } = this.state;
    // 分页器额外配置
    const extraPagination = {
      showQuickJumper: true,
    };

    const columns = [
      ...
    ];
    return (
      <TableComp
        ref={node => (this.tableRef = node)}
        rowKey="id"
        columns={columns}
        requestFunc={getConfigList}
        requestQuery={{ categoryId }}
        queryTransformMap={{ current: 'pageNo' }}
        extraPagination={extraPagination}
        validateFunc={this.validateConfigQuest}
        onListChange={this.handleListChange}
        onLoadingChange={this.handleLoadingChange}
      />
    );
  }
}

export default TableCmpTest;
```

## **更多**
Ant Design团队还对Ant Design的一些组件进行了更高级的封装，具体可参阅[PreComponents](http://procomponents.ant.design/)
