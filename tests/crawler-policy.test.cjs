const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
test('only Meta collection is excluded, while search bots inherit full access and sitemaps',()=>{
 const m={exports:{}};
 new Function('require','module','exports',ts.transpileModule(fs.readFileSync('app/robots.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(()=>({SITE_URL:'https://map.clinicinkorea.com'}),m,m.exports);
 const result=m.exports.default();
 assert.deepEqual(result.rules,[{userAgent:'*',allow:'/'},{userAgent:'meta-externalagent',disallow:'/'}]);
 assert.equal(result.sitemap.length,2);
});
