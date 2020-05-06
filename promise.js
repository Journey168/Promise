

class Promise {
  constructor(executor){
    // 不能相信用户的输入 要做参数的校检
    if(typeof executor !== "function"){
      throw new TypeError(`Promise resolve ${executor} is not a function`)
    }

    //初始化参数
    this.initValue()
    //绑定this指向
    this.initBind()

    try{
      executor(this.resolve,this.reject)
    }catch(err){
      this.reject(err)
    }
  }

  //初始化this指向
  initBind(){
    this.resolve = this.resolve.bind(this)
    this.reject = this.reject.bind(this)
  }
  //初始化参数
  initValue(){
    this.value = null //终值
    this.reason = null //拒因
    this.state = Promise.PENDING //状态
    this.onFulfilledCallbacks = [] //成功回调
    this.onRejectedCallbacks = [] //失败回调
  }
  //成功回调
  resolve(value){
    // 成功后的一系列操作（状态的改变 成功回调的执行）
    if(this.state === Promise.PENDING){
      this.state = Promise.FULFILLED
      this.value = value
      this.onFulfilledCallbacks.forEach( cb=>cb(this.value) ) 
    }
  }
  //拒绝回调
  reject(reason){
    // 失败后的一系列操作 （状态的改变 失败回调的执行）
    if(this.state === Promise.PENDING){
      this.state = Promise.REJECTED
      this.reason = reason
      this.onRejectedCallbacks.forEach( cb=> cb(this.reason) )
    }
  }

  then(onFulfilled,onRejected){
    // 参数校检
    if(typeof onFulfilled !== "function"){
      onFulfilled = function(value){
        return value
      }
    }
    if(typeof onRejected !== "function"){
      onRejected = function(reason){
        throw reason
      }
    }
    // 实现链式调用 且改变来后面then方法的值  通过返回新的实例
    let promise2 = new Promise((resolve,reject)=>{
      // 用settimeout来模拟then方法的异步操作
      if(this.state === Promise.FULFILLED){
        setTimeout(()=>{
          let x = onFulfilled(this.value)
          try {
            Promise.resolvePromise(promise2,x,resolve,reject)
          } catch (err) {
            reject(err)
          }
        })
      }
      if(this.state === Promise.REJECTED){
        setTimeout(()=>{
          let x = onRejected(this.reason)
          try {
            Promise.resolvePromise(promise2,x,resolve,reject)
          } catch (err) {
            reject(err)
          }
        })
      }

      // 没有应答前 先将then里面的方法加入执行队列
      if(this.state === Promise.PENDING){
        this.onFulfilledCallbacks.push(value=>{
          setTimeout(()=>{
            let x = onFulfilled(value)
            try {
              Promise.resolvePromise(promise2,x,resolve,reject)
            } catch (err) {
              reject(err)
            }
          })
        })
        this.onRejectedCallbacks.push(reason=>{
          setTimeout(()=>{
            let x = onRejected(reason)
            try {
              Promise.resolvePromise(promise2,x,resolve,reject)
            } catch (err) {
              reject(err)
            }
          })
        })
      }
    })
    return promise2
  }
}

Promise.PENDING = "pending"
Promise.FULFILLED = "fulfilled"
Promise.REJECTED = "rejected"
Promise.resolvePromise = function(promise2,x,resolve,reject){
  // 避免循环引用
  if(x===promise2){
    return reject(new TypeError(`Chaining cycle detected for promise`))
  }
  let called = false
  if(x instanceof Promise){
    // 判断x是否为Promise
    const then = x.then
    then.call(x,value=>{
      Promise.resolvePromise(promise2,value,resolve,reject)
    },reason=>{
      Promise.resolvePromise(promise2,reason,resolve,reject)
    })
  }else if(x!==null&&(typeof x==='function'||typeof x==='object')){
    // x为对象或者函数
    try {
      const then = x.then
      if(typeof then === 'function'){
        then.call(x,value=>{
          if(called) return
          called = true
          Promise.resolvePromise(promise2,value,resolve,reject)
        },reason=>{
          if(called) return
          called = true
          reject(reason)
        })
      }else{
        if(called) return
        called = true
        resolve(x)
      }
    } catch (err) {
      if(called) return
      called = true
      reject(err)
    }
  }else{
    resolve(x)
  }
}

//测试代码
Promise.deferred = function() { // 延迟对象
  let defer = {};
  defer.promise = new Promise((resolve, reject) => {
      defer.resolve = resolve;
      defer.reject = reject;
  });
  return defer;
}
module.exports = Promise