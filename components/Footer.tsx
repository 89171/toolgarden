import React from 'react';

const Footer: React.FC = () => {
  return (
    <div className="text-center mt-8 text-gray-500 text-sm">
      JSON 工具包 © {new Date().getFullYear()}
    </div>
  );
};

export default Footer;