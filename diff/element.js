var _=require('./util');

function Element(tagName,props,children){
	//判断是不是是不是Element对象，如果不是，则初始化
	if(!(this instanceof Element)){
		if(!_.isArray(children)&&children!=null){
			children=_.slice(arguments,2).filter(_.truthy)
		}
		return new Element(tagName,props,children)
	}

	//判断是否只穿了children
	if(_.isArray(props)){
		children=props
		props={}
	}

	//初始化
	this.tagName=tagName
	this.props=props||{}
	this.children=children||[]
	this.key=props?props.key:void 666

	var count=0

	_.each(this.children,function(child,i){
		if(child instanceof Element){
			count+=child.count
		}else{
			//如果不是Element，就转一下字符串
			children[i]=''+child;
		}
		count++;
	})

	//计算所有的孩子数
	this.count=count;
}

Element.prototype.render=function(){
	//render会创建一棵DOM树
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