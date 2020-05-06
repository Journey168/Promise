// index.js 进行原生的Promise演示
// promise.js 进行自定义的Promise演示
// test.js是对Promise的测试
// 结合promise/A+规范

console.log(1)
new Promise(function(resolve,rejected){
  throw new Error("error code")
  console.log(2)
  console.log("我来了")
  resolve(1)
})
.then(res=>{
  console.log(4)
  console.log('value',res)
},err=>{
  return 99
  console.log('reason',err)
})
.then(res=>{
  console.log(5)
  console.log('value',res)
},err=>{
  console.log('reason',err)
})
console.log(3)