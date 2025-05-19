import React from 'react';

type HelloWorldProps = {
    name?: string;
};

/**
 * HelloWorldコンポーネント
 * @param name 表示する名前（省略時は"World"）
 */
const HelloWorld: React.FC<HelloWorldProps> = ({ name = 'World' }) => {
    return (
        <div className="text-center text-2xl font-semibold text-blue-600 p-4 border border-blue-300 rounded-md shadow-md">
            Hello, {name}!
        </div>
    );
};

export default HelloWorld;