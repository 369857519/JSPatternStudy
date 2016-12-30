var _=require('./util');
var patch=require('./patch');
var listDiff=require('list-diff2');

function diff(oldTree,newTree){
	var index=0;
	var patches={};
	//深度优先比较
	dfsWalk(oldTree,newTree,index,patches);
	return patches;
}

function dfsWalk (oldNode,newNode,index,patches){
	var currentPatch=[];
	//Node被删掉了
	if(newNode===null){
		//如果node为空，不用做其他的事情
	}else if(_.isString(oldNode)&&_.isString(newNode)){
		//新旧节点都是字符串
		if(newNode!==oldNode){
			currentPatch.push({type:patch.TEXT,content:newNode})
		}
		//类型相同，替换字符串
	}else if(oldNode.tagName===newNode.tagName &&
		oldNode.key===newNode.key){
		//是其他的dom元素,做props更新
		var propsPatches=diffProps(oldNode,newNode)
		if(propsPatches){
			currentPatch.push({type:patch.PROPS,props:propsPatches});
		}

		//在这一步完成一个递归
		//如果没有标记ignore，则进行新旧孩子的diff
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
		//否则，更新整个node
		currentPatch.push({type:patch.REPLACE,node:newNode})
	}

	if(currentPatch.length){
		patches[index]=currentPatch
	}
}

function diffChildren(oldChildren,newChildren,index,patches,currentPatch){
	//使用diffs计算区别
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

