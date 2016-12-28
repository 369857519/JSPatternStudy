el=require('./element');
diff=require('./diff');
patch=require('./patch');

//tagName [properties] children
var tree=el('div',{
	'id':'container'},
	[el('h1',{style:'color:blue'},['simple virtual dom']),
	el('p',['Hello,virtual-dom']),
	el('ul',[el('li')])
])