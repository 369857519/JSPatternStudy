var _=require('./util');
var patch=require('./patch');
var listDiff=require('list-diff2');







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

