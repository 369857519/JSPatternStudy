var _=require('./util')


//这里有几个常量，用来统计不同之处
//代替
var REPLACE=0;
//重新排序
var REORDER=1
//props产生变化
var PROPS=2
//文本产生变化
var TEXT=3


//patch,发出patches的入口
function patch(node,patches){
	//walker，初始化带一个index
	var walker={index:0}
	//调用遍历函数
	dfsWalk(node,walker,patches);
}


//dfs walk传入三个参数
function dfsWalk(node,walker,patches){
	//拿到现在正要处理的patches
	var currentPatches=patches[walker.index]
	//获取node的孩子节点的长度
	var len=node.childNodes?node.childNodes.length:0;
	//循环每一个
	for(var i=0;i<len;i++){
		var child=node.childNodes[i]
		walker.index++
		//并继续进行对比
		dfsWalk(child,walker,patches);
	}

	//如果这个节点下面存在patches
	if(currentPatches){
		//则把patches应用到上面
		applyPatches(node,currentPatches);
	}
}


//应用currentPatches
function applyPatches(node,currentPatches){
	_.each(currentPatches,function(currentPatch){
		switch(currentPatch.type){
			case REPLACE:
				//直接替换
				var newNode=(typeof currentPatch.node==='string')
				?document.createTextNode(currentPatch.node)
				:currentPatch.node.render()
				node.parentNode.replaceChild(newNode,node)
				break
			case REORDER:
				//重新排序
				reorderChildren(node,currentPatch.moves)
				break
			case PROPS:
				//设置属性
				setProps(node,currentPatch.props)
				break
			case TEXT:
				//如果是文本
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

//针对不同情况的处理函数
function setProps(node,props){
	for(var key in props){
		if(props[key]===void 666){
			node.removeAttribute(key)
		}else{
			var value=props[key]
			_.setAttr(node,key,value)
		}
	}
}


//重新排列所有的字节点
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