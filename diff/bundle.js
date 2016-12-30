/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	el=__webpack_require__(1);
	diff=__webpack_require__(3);
	patch=__webpack_require__(4);
	
	var tree = el('div', {'id': 'container'}, [
	    el('h1', {style: 'color: blue'}, ['simple virtual dom']),
	    el('p', ['Hello, virtual-dom']),
	    el('ul', [el('li',["I'm an li"])])
	])
	
	// 2. generate a real dom from virtual dom. `root` is a `div` element
	var root = tree.render()
	console.log(root);
	console.log(window.document);
	
	window.document.body.append(root);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var _=__webpack_require__(2);
	
	function Element(tagName,props,children){
		if(!(this instanceof Element)){
			if(!_.isArray(children)&&children!=null){
				children=_.slice(arguments,2).filter(_truthy)
			}
			return new Element(tagName,props,children)
		}
	
		if(_.isArray(props)){
			children=props
			props={}
		}
	
		this.tagName=tagName
		this.props=props||{}
		this.children=children||[]
		this.key=props?props.key:void 666
	
		var count=0
	
		_.each(this.children,function(child,i){
			if(child instanceof Element){
				count+=child.count
			}else{
				children[i]=''+child;
			}
			count++;
		})
	
		this.count=count;
	}
	
	Element.prototype.render=function(){
		var el=document.createElement(this.tagName);
		var props=this.props;
	
		for(var propName in props){
			var propValue = props[propName]
			_.setAttr(el,propName,propValue);
		}
	
		_.each(this.children,function(child){
			var childEl=(child instanceof Element)
				?child.render()
				:document.createTextNode(child)
			el.appendChild(childEl);
		})
	
		return el;
	}
	
	module.exports=Element;

/***/ },
/* 2 */
/***/ function(module, exports) {

	var _=exports
	
	_.type=function(obj){
		return Object.prototype.toString.call(obj).replace(/\[object\s|\]/g,'');
	}
	
	_.isArray=function isArray(list){
		return _.type(list)==='Array'
	}
	
	_slice=function slice(arrLike,index){
		return Array.prototype.slice.call(arrayLike,index);
	}
	
	_.truthy=function truthy(value){
		return !!value
	}
	
	_.isString=function isString(list){
		return _.type(list)==='String'
	}
	
	_.each=function each(array,fn){
		for(var i=0,len=array.length;i<len;i++){
			fn(array[i],i);
		}
	}
	
	_.toArray=function toArray(listLike){
		if(!listLike){
			return []
		}
	
		var list=[]
	
		for(var i=0,len=listLike.length;i<len;i++){
			list.push(listLike[i]);
		}
	
		return list
	}
	
	_.setAttr=function setAttr(node,key,value){
		switch(key){
			case 'style':
				node.style.cssText=value
				break
			case 'value':
				var tagName=node.tagName||''
				tagName=tagName.toLowerCase()
				if(
					tagName==='input'||tagName==='textArea'){
					node.value=value
				}else{
					node.setAttribute(key,value)
				}
				break
			default:
				node.setAttribute(key,value)
				break
		}
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var _=__webpack_require__(2);
	var patch=__webpack_require__(4);
	var listDiff=__webpack_require__(5);
	
	
	
	
	
	
	
	function diff(oldTree,newTree){
		var index=0;
		var patches={};
		dfsWalk(oldTree,newTree,index,patches);
		return patches;
	}
	
	function dfsWalk (oldNode,newNode,index,patches){
		var currentPatch=[];
		//Node被删掉了
		if(newNode===null){
	
		}else if(_.isString(oldNode)&&_.isString()){
			if(newNode!==oldNode){
				currentPatch.push({type:patch.TEXT,content:newNode})
			}
		}else if(
			oldNode.tagName===newNode.tagName &&
			oldNode.key===newNode.key
			){
			var propsPatches=diffProps(oldNode,newNode)
			if(propsPatches){
				currentPatch.push({type:patch.PROPS,props:propsPatches});
			}
			if(!isIgnoreChildren('newNode')){
				diffChildren(
					oldNode.children,
					newNode.children,
					index,
					patches,
					currentPatch
					)
			}
		}else{
			currentPatch.push({type:patch.REPLACE,node:newNode})
		}
	
		if(currentPatch.length){
			patches[index]=currentPatch
		}
	}
	
	function diffChildren(oldChildren,newChildren,index,patches,currentPatch){
		var diffs=listDiff(oldChildren,newChildren,'key');
		newChildren=diffs.children;
	
		if(diffs.moves.length){
			var reorderPatch={type:patch.REORDER,moves:diffs.moves};
			currentPatch.push(reorderPatch);
		}
	
		var leftNode=null
		var currentNodeIndex=index;
		_.each(oldChildren,function(child,i){
			var newChild=newChildren[i];
			currentNodeIndex=(leftNode&&leftNode.count)
			?currentNodeIndex+leftNode.count+1
			:currentNodeIndex+1
			dfsWalk(child,newChild,currentNodeIndex,patches)
			leftNode=child
		})
	}
	
	function diffProps(oldNode,newNode){
		var count=0;
		var oldProps=oldNode.props
		var newProps=newNode.props
	
		var key,value
		var propsPatches={}
	
		for(key in oldProps){
			value=oldProps[key]
			if(newProps[key]!==value){
				count++
				propsPatches[key]=newProps[key]
			}
		}
	
		for(key in newProps){
			value=newProps[key]
			if(!oldProps.hasOwnProperty(key)){
				count++
				propsPatches[key]=newProps[key]
			}
		}
	
		if(count===0){
			return null
		}
	
		return propsPatches
	}
	
	function isIgnoreChildren(node){
		return (node.props&&node.props.hasOwnProperty('ignore'))
	}
	
	module.exports=diff;
	


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var _=__webpack_require__(2)
	
	
	
	var REPLACE=0;
	var REORDER=1
	var PROPS=2
	var TEXT=3
	
	function patch(node,patches){
		var walker={index:0}
		dfsWalk(node,walker,patches);
	}
	
	function dfsWalk(node,walker,patches){
		var currentPatches=patches[walker.index]
	
		var len=node.childNodes?node.childNodes.length:0;
	
		for(var i=0;i<len;i++){
			var child=node.childNodes[i]
			walker.index++
			dfsWalk(child,walker,patches);
		}
	
		if(currentPatches){
			applyPatches(node,currentPatches);
		}
	}
	
	function applyPatches(node,currentPatches){
		_.each(currentPatches,function(currentPatch){
			switch(currentPatch.type){
				case REPLACE:
					var newNode=(typeof currentPatch.node==='string')
					?document.createTextNode(currentPatch.node)
					:currentPatch.node.render()
					node.parentNode.replaceChild(newNode,node)
					break
				case REORDER:
					reorderChildren(node,currentPatch.moves)
					break
				case TEXT:
					if(node.textContent){
						node.textContent=currentPatch.content
					}else{
						node.nodeValue=currentPatch.content
					}
					break
				default:
					throw new Error('Unkonown patch type '+currentPatch.type)
			}
		})
	}
	
	function setProps(node,props){
		for(var key in props){
			if(props[key]===void 666){
				node.removeAttribute(key)
			}else{
				var value=props[key]
				_setAttr(node,key,value)
			}
		}
	}
	
	function reorderChildren(node,moves){
		var staticNodeList=_.toArray(node.childNodes)
		var maps={}
	
		_.each(staticNodeList,function(node){
			if(node.nodeType===1){
				var key=node.getAttribute('key')
				if(key){
					maps[key]=node
				}
			}
		})
	
		_.each(moves,function(move){
			var index=move.index
			if(move.type===0){
				if(staticNodeList[index]===node.childNodes[index]){
					node.removeChild(node.childNodes[index])
				}
				staticNodeList.splice(index,1)
			}else if(move.type===1){
				var insertNode=maps[move.item.key]?maps[move.item.key]:(typeof move.item==='object')?move.item.render():document.createTextNode(move.item)
				staticNodeList.splice(index,0,insertNode);
				node.insertBefore(insertNode,node.childNodes[index]||null);			
			}
		})
	}
	
	patch.REPLACE=REPLACE
	patch.REORDER=REORDER
	patch.PROPS=PROPS
	patch.TEXT=TEXT
	
	module.exports=patch

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(6).diff


/***/ },
/* 6 */
/***/ function(module, exports) {

	/**
	 * Diff two list in O(N).
	 * @param {Array} oldList - Original List
	 * @param {Array} newList - List After certain insertions, removes, or moves
	 * @return {Object} - {moves: <Array>}
	 *                  - moves is a list of actions that telling how to remove and insert
	 */
	function diff (oldList, newList, key) {
	  var oldMap = makeKeyIndexAndFree(oldList, key)
	  var newMap = makeKeyIndexAndFree(newList, key)
	
	  var newFree = newMap.free
	
	  var oldKeyIndex = oldMap.keyIndex
	  var newKeyIndex = newMap.keyIndex
	
	  var moves = []
	
	  // a simulate list to manipulate
	  var children = []
	  var i = 0
	  var item
	  var itemKey
	  var freeIndex = 0
	
	  // fist pass to check item in old list: if it's removed or not
	  while (i < oldList.length) {
	    item = oldList[i]
	    itemKey = getItemKey(item, key)
	    if (itemKey) {
	      if (!newKeyIndex.hasOwnProperty(itemKey)) {
	        children.push(null)
	      } else {
	        var newItemIndex = newKeyIndex[itemKey]
	        children.push(newList[newItemIndex])
	      }
	    } else {
	      var freeItem = newFree[freeIndex++]
	      children.push(freeItem || null)
	    }
	    i++
	  }
	
	  var simulateList = children.slice(0)
	
	  // remove items no longer exist
	  i = 0
	  while (i < simulateList.length) {
	    if (simulateList[i] === null) {
	      remove(i)
	      removeSimulate(i)
	    } else {
	      i++
	    }
	  }
	
	  // i is cursor pointing to a item in new list
	  // j is cursor pointing to a item in simulateList
	  var j = i = 0
	  while (i < newList.length) {
	    item = newList[i]
	    itemKey = getItemKey(item, key)
	
	    var simulateItem = simulateList[j]
	    var simulateItemKey = getItemKey(simulateItem, key)
	
	    if (simulateItem) {
	      if (itemKey === simulateItemKey) {
	        j++
	      } else {
	        // new item, just inesrt it
	        if (!oldKeyIndex.hasOwnProperty(itemKey)) {
	          insert(i, item)
	        } else {
	          // if remove current simulateItem make item in right place
	          // then just remove it
	          var nextItemKey = getItemKey(simulateList[j + 1], key)
	          if (nextItemKey === itemKey) {
	            remove(i)
	            removeSimulate(j)
	            j++ // after removing, current j is right, just jump to next one
	          } else {
	            // else insert item
	            insert(i, item)
	          }
	        }
	      }
	    } else {
	      insert(i, item)
	    }
	
	    i++
	  }
	
	  function remove (index) {
	    var move = {index: index, type: 0}
	    moves.push(move)
	  }
	
	  function insert (index, item) {
	    var move = {index: index, item: item, type: 1}
	    moves.push(move)
	  }
	
	  function removeSimulate (index) {
	    simulateList.splice(index, 1)
	  }
	
	  return {
	    moves: moves,
	    children: children
	  }
	}
	
	/**
	 * Convert list to key-item keyIndex object.
	 * @param {Array} list
	 * @param {String|Function} key
	 */
	function makeKeyIndexAndFree (list, key) {
	  var keyIndex = {}
	  var free = []
	  for (var i = 0, len = list.length; i < len; i++) {
	    var item = list[i]
	    var itemKey = getItemKey(item, key)
	    if (itemKey) {
	      keyIndex[itemKey] = i
	    } else {
	      free.push(item)
	    }
	  }
	  return {
	    keyIndex: keyIndex,
	    free: free
	  }
	}
	
	function getItemKey (item, key) {
	  if (!item || !key) return void 666
	  return typeof key === 'string'
	    ? item[key]
	    : key(item)
	}
	
	exports.makeKeyIndexAndFree = makeKeyIndexAndFree // exports for test
	exports.diff = diff


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map