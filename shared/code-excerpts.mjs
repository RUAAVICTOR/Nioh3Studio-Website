// Presentation-only normalization. Never writes into the referenced source.
export const escapeHTML=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

export function normalizeIndent(text,tabWidth=4){
  if(!Number.isInteger(tabWidth)||tabWidth<1)throw Error('Invalid tab width.');
  const expanded=text.replaceAll('\r\n','\n').replaceAll('\r','\n').split('\n').map(line=>{
    const prefix=line.match(/^[\t ]*/)[0];
    let columns=0;
    for(const character of prefix)columns+=character==='\t'?tabWidth-columns%tabWidth:1;
    return ' '.repeat(columns)+line.slice(prefix.length);
  });
  const nonempty=expanded.filter(line=>/\S/.test(line));
  if(!nonempty.length)return expanded.map(()=>'').join('\n');
  const indent=Math.min(...nonempty.map(line=>line.match(/^ */)[0].length));
  return expanded.map(line=>/\S/.test(line)?line.slice(indent):'').join('\n');
}

function highlight(text){
  // Tokenize the original text first; escape every token before emitting markup.
  const pattern=/("(?:\\.|[^"\\])*"|\b(?:pub|fn|let|mut|for|in|if|else|match|continue|return|def|or|bool|int|pow|as|None|Some)\b|\b(?:0x[\dA-Fa-f_]+|\d+)\b)/g;
  return text.split(pattern).map(token=>{
    const escaped=escapeHTML(token);
    if(/^"/.test(token))return `<span class="engine-code-string">${escaped}</span>`;
    if(/^(?:0x[\dA-Fa-f_]+|\d+)$/.test(token))return `<span class="engine-code-number">${escaped}</span>`;
    if(/^(?:pub|fn|let|mut|for|in|if|else|match|continue|return|def|or|bool|int|pow|as|None|Some)$/.test(token))return `<span class="engine-code-keyword">${escaped}</span>`;
    return escaped;
  }).join('');
}

export function renderCodeFragments(panel,{tabWidth=4}={}){
  return `<code class="engine-code-lines">${panel.fragments.map((fragment,index)=>{
    const lines=normalizeIndent(fragment.text,tabWidth).split('\n');
    if(lines.length!==fragment.endLine-fragment.startLine+1)throw Error('Source line range mismatch.');
    return `${index?'<span class="engine-code-gap" aria-hidden="true"></span>':''}${lines.map((line,i)=>`<span class="engine-code-line" data-source-line="${fragment.startLine+i}"><span class="engine-line-number" aria-hidden="true">${fragment.startLine+i}</span><span class="engine-code-text">${highlight(line)}</span></span>`).join('')}`;
  }).join('')}</code>`;
}
