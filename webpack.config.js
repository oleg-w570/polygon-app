const path = require('path');

module.exports = {
    entry: './src/index.js', // Главный файл для сборки
    output: {
        filename: 'bundle.js', // Выходной файл
        path: path.resolve(__dirname, 'dist'), // Путь для выходного файла
    },
    devServer: {
        static: path.join(__dirname, 'dist'), // Статические файлы для сервера
        compress: true, // Сжатие для увеличения скорости
        port: 9000, // Порт локального сервера
    },
    module: {
        rules: [
            {
                test: /\.css$/, // Поиск CSS файлов
                use: ['style-loader', 'css-loader'], // Загрузчики для обработки CSS
            },
        ],
    },
};
