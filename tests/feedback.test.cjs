const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const ts=require('typescript');
const m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync('lib/feedback.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);const {FEEDBACK_EMAIL,feedbackMail}=m.exports;
test('feedback email keeps recipient fixed and safely encodes clinic links, line breaks and query delimiters',()=>{
 const link=feedbackMail('correction','Address is wrong & needs fixing\n한글도 확인','https://map.clinicinkorea.com/clinics/detail/test?x=1&y=2');const url=new URL(link);
 assert.equal(url.pathname,FEEDBACK_EMAIL);assert.equal(url.searchParams.size,2);assert.match(url.searchParams.get('subject'),/Incorrect clinic information/);assert.match(url.searchParams.get('body'),/x=1&y=2/);assert.match(url.searchParams.get('body'),/한글도 확인/);
 assert.match(new URL(feedbackMail('unknown',' Idea ','')).searchParams.get('subject'),/Feature suggestion/);
});
