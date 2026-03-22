import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold">JSON 工具包</h1>
      <p className="text-gray-600 mt-2">格式化、压缩和验证 JSON 数据</p>
    </div>
  );
};

export default Header;