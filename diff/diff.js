var _=require('./util');
var patch=require('./patch');
var listDiff=require('list-diff2');


//当我们有了最重要的Element,并可以使用render方法进行递归的渲染以后
//这个时候我们就需要一个搞笑的diff算法

//首先来看这个diff，只是为了创建index以及patches
//遍历并寻找不同的树用到的主要是dfsWalk
function diff(oldTree,newTree){
	//首先这个diff算法里传入了两个简单的树，
	//旧树和新树
	//同时做一个index，接着往下看index是干嘛的
	var index=0;
	//做一个patches，这个patches则会反悔不同信息
	var patches={};
	//这个时候我们来做第一个比较
	dfsWalk(oldTree,newTree,index,patches);
	//先不管这个返回值
	return patches;
}

//这个函数才是重头戏
function dfsWalk (oldNode,newNode,index,patches){
	//那我们现在需要存储本次的不同
	var currentPatch=[];
	//如果新node为空
	if(newNode===null){
		//如果node为空，什么都不做
	}else if(_.isString(oldNode)&&_.isString(newNode)){
		//如果新旧节点都是字符串
		//那么咱们现在就需要进行TEXT的替换
		//patche的类型就定为 patch.TEXT content:newNode
		if(newNode!==oldNode){
			currentPatch.push({type:patch.TEXT,content:newNode})
		}
	}else if(oldNode.tagName===newNode.tagName &&
		oldNode.key===newNode.key){
		//之前的节点和新节点的名字一样时，同时发现这两个节点key一致时
		//这个时候进行props的对比
		var propsPatches=diffProps(oldNode,newNode)
		//如果propsPatches最终处理出了一部分结果，则放入currentPatch
		if(propsPatches){
			currentPatch.push({type:patch.PROPS,props:propsPatches});
		}

		
		//如果没有标记ignore，需要继续比较这个node的孩子节点，
		//这个时候就用到了我们的diffChildren方法
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
		//这个是非常重要的一个部分，如果以上情况都不满足，则直接替换成新的节点
		currentPatch.push({type:patch.REPLACE,node:newNode})
	}

	if(currentPatch.length){
		//判断一下，如果现在
		//那么这个index有什么用呢，是如何穿进来的呢？咱们来仔细看看
		//可以看到一开始我们会传入一个0，那么如果
		patches[index]=currentPatch
	}
}

//可以看到传入了五个参数
//旧孩子节点集
//新孩子节点集
//刚刚还为0的index
//currentPatch为上一级声明的patch集
function diffChildren(oldChildren,newChildren,index,patches,currentPatch){
	//使用diffs计算区别

	var diffs=listDiff(oldChildren,newChildren,'key');
	console.log(diffs);
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

