var _=require('./util');

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

	_.each(this.children,function(child){
		var childEl=(child instanceof Element)
		?child.render():document.createTextNode(child)
		el.appendChild(childEl)
	})

	return el;
}

module.exports=Element;