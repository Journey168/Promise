const Promise = require('./promise')

console.log(1)
new Promise(function(resolve,rejected){
  setTimeout(() => {
    resolve(1)
  });
})
.then(res=>{
  console.log(4)
  console.log('value',res)
},err=>{
  console.log('reason',err)
})
.then(res=>{
  console.log(5)
  console.log('value',res)
},err=>{
  console.log('reason',err)
})
console.log(3)