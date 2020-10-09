import React from 'react';
import TableComp from './components/table'
import { getTableList } from './api'
import './App.less';

function App() {
  return (
    <div className="App">
      <TableComp
        requestFunc={getTableList}
      />
    </div>
  );
}

export default App;
