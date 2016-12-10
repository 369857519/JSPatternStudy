function Promise(executor){
	var self=this
	self.statue='pendig';
	self.data=undefined;
	self.onResolvedCallback=[];
	self.onRejectedCallback=[]

	function resolve(value){
		if(self.status==='pending'){
			self.status='resolved'
			self.data=value
			for (var i = 0; i < self.onResolvedCallback.length; i++) {
				self.onResolvedCallback[i]();
			};
		}
	}

	function reject(reason){
		if(self.status==='pending'){
			self.status='rejected';
			self.data=reason;
			for (var i = 0; i < self.onRejectedCallback.length; i++) {
				self.onRejectedCallback[i](reason);
			};
		}
	}

	try{
		executor(resolve,reject)
	}catch(e){
		reject(e)
	}
}

Promise.prototype.then=(onResolved,onRejected)=>{
	var self=this;
	var promise2;

	onResolved=typeof onResolved==='function'?onResolved:(v)=>{};
	onRejected=typeof onRejected==='function'?onRejected:(r)=>{};

	if (self.status==='resolved'){
		return promise2=new Promise((resolve,rejecte)=>{
			try{
				var x=onResolved(self.data);
				if(x instanceof Promise){
					x.then(resolve,reject);
				}
				resolve(x)
			}catch(e){
				reject(e)
			}
		})
	};

	if(self.status==='rejected'){
		return promise2=new Promise((resolve,reject)=>{
			try{
				var x=onRejected(self.data)
				if(x instanceof Promise){
					x.then(resolve,reject);
				}
				reject(x);
			}catch(e){
				reject(e);
			}
		})
	}

	if(self.status==='pending'){
		return promise2=new Promise((resolve,reject)=>{
			self.onResolvedCallback.push((value)=>{
				try{
					var x=onRejected(self.data)
					if(x instanceof Promise){
						x.then(resolve,reject);
					}
				}catch(e){
					reject(e);
				}
			})

			self.onRejectedCallback.push((reason)=>{
				try{
					var x=onRejected(self.data)
					if(x instanceof Promise){
						x.then(resolve,reject);
					}
				}catch(e){
					reject(e)
				}
			})
		})
	}

	Promise.prototype.catch=(onRejected)=>{
		return this.then(null.onRejected);
	}
}

new Promise((resolve,reject)=>{
	console.log('start');
	setTimeout(function(){
		resolve('lalala');
	},500)
}).then((data)=>{
	
	console.log(data);
})