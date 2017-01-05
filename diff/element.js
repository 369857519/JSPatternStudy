var _=require('./util');

//单页面应用－》观察react小例子，修改state后自动刷新－》观察真实的DOM模型－》引出virtual DOM树

//首先我们来看Element，这里是创建一个虚拟Element的基础
//当我们想创建一个虚拟DOm对象的时候，我们就调用new Element
function Element(tagName,props,children){
	
	//好我们来看第一步
	//判断这个这时的上下文是不是Element
	if(!(this instanceof Element)){
		if(!_.isArray(children)&&children!=null){
			children=_.slice(arguments,2).filter(_.truthy)
		}
		return new Element(tagName,props,children)
	}

	//这一步是用来判断props是否穿入，如果没有的话，则props这个参数的位置时children
	//那么这个时候我们需要把props的值赋予children
	
	if(_.isArray(props)){
		children=props
		props={}
	}

	//初始化
	//主要有这个几个属性
	//标签名称，标签属性，标签的字节点，标签的key
	this.tagName=tagName
	this.props=props||{}
	this.children=children||[]
	this.key=props?props.key:void 666

	//声明一个count
	var count=0

	//循环这个节点的children
	_.each(this.children,function(child,i){
		if(child instanceof Element){
			//如果孩子节点是Element对象
			//则count加上这个孩子的count
			count+=child.count
		}else{
			//如果不是,则当成字符串进行处理
			children[i]=''+child;
		}
		//最终count再加1
		count++;
	})

	//这个count是本元素的孩子个数与孩子的孩子的个数
	this.count=count;
}

//每个虚拟Element都会有一个人的人的方法
Element.prototype.render=function(){
	//创建这个元素
	var el=document.createElement(this.tagName);
	//更新这个元素
	var props=this.props;
	//循环props并创建props
	for(var propName in props){
		var propValue = props[propName]
		_.setAttr(el,propName,propValue);
	}
	//循环一下每个元素的孩子节点
	//如果孩子是Element对象
	//则调用孩子节点的render方法，把所有的孩子进行渲染，并返回到childEl，如果不是，直接创建childEl
	//这个时候，进行el的child append
	//最后讲el返回
	_.each(this.children,function(child){
		var childEl=(child instanceof Element)
			?child.render()
			:document.createTextNode(child)
		el.appendChild(childEl);
	})

	return el;
}

module.exports=Element;