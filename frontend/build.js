import * as esbuild from 'esbuild';
import path from 'path';

const isWatch = process.argv.includes('--watch');

const ctx = await esbuild.context({
    entryPoints: [path.join('src', 'main.jsx')],
    bundle: true,
    outfile: path.join('assets', 'index.js'),
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
    define: { 'process.env.NODE_ENV': '"development"' }
});

if (isWatch) {
    console.log('Watching for changes...');
    await ctx.watch();
    
    // Start a simple dev server using esbuild
    const { host, port } = await ctx.serve({
        servedir: '.',
        port: 5173
    });
    console.log(`React dev server running at http://${host || 'localhost'}:${port}`);
} else {
    console.log('Building for production...');
    await ctx.rebuild();
    await ctx.dispose();
    console.log('Build complete!');
}
