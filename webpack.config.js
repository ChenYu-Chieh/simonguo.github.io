var path = require('path');
var webpack = require('webpack');
var marked = require('marked');
var hl = require('highlight.js');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlwebpackPlugin = require('html-webpack-plugin');

const codeRenderer = function (code, lang) {
    lang = lang === 'js' ? 'javascript' : lang;
    if (lang === 'html') {
        lang = 'xml';
    }

    var hlCode = lang ? hl.highlight(lang, code).value : hl.highlightAuto(code).value;

    return `<div class="doc-highlight"><pre><code class="${lang || ''}">${hlCode}</code></pre></div>`;
};

var renderer = new marked.Renderer();

renderer.code = codeRenderer;

var plugins = [
    new ExtractTextPlugin('[name].css'),
    new HtmlwebpackPlugin({
        title: '郭小铭',
        filename: 'index.html',
        template: 'src/index.html',
        inject: true,
        hash: true
    }),
];

if (process.env.NODE_ENV === 'production') {

    plugins.push(new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor','babel']
    }));

    plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }));

    plugins.push(new webpack.BannerPlugin(`Last update: ${new Date().toString()}`));
}

module.exports = {
    entry: {
        index: './src/index',
        vendor: ['react','react-router', 'react-dom', 'lodash', 'classnames', 'dom-lib','codemirror']
    },
    output: {
        path: path.join(__dirname, 'assets'),
        filename: '[name].bundle.js'
    },
    node: {
        fs: 'empty'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: [
                    'transform/cacheable?brfs',
                    'babel?babelrc'
                ],
                exclude: /node_modules/
            }, {
                test: /\.(less|css)$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader')
            }, {
                test: /\.md$/,
                loader: 'html!markdown'
            }
        ]
    },
    plugins: plugins,
    markdownLoader: {
        renderer: renderer
    }
};
