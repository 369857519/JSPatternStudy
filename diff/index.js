el=require('./element');
diff=require('./diff');
patch=require('./patch');

var tree = el('div', {'id': 'container'}, [
    el('p', ['Hello, virtual-dom']),
    el('h1', {style: 'color: blue'}, ['simple virtual dom']),
    el('ul', [el('li',["I'm an li,not a p"])])
])

var root = tree.render()
window.document.body.append(root);
var newTree = el('div', {'id': 'container'}, [
    el('h1', {style: 'color: red'}, ['simple virtal dom']),
    el('p', ['Hello, virtual-dom']),
    el('ul', [el('li'), el('li')])
])

var patches=diff(tree,newTree);
console.log(patches);
// 2. generate a real dom from virtual dom. `root` is a `div` element
patch(root,patches);
