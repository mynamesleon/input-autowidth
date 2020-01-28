module.exports = {
    mode: 'production',
    entry: './input-autowidth.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        libraryTarget: 'umd',
        path: __dirname + '/dist',
        filename: 'input-autowidth.min.js'
    }
};
