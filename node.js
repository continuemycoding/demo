// const { default: Axios } = require('axios')
// const asyncPool = require('tiny-async-pool')

// const url = 'https://wm-h5.kerzhi.com/favicon-32x32.png'
// // const url = 'https://wm-h5.kerzhi.com/p/3xkrk8h.o'
// // const url = 'http://localhost:3000/p/3xkrk8h'
// // const url = 'http://localhost:3000/doc/%E9%9A%B1%E7%A7%81%E5%8D%94%E8%AD%B0'

// const num = 1000000
// const urls = []
// for (let i = 0; i < num; ++i) {
//   // urls.push(url + (Math.random() > 0.2 ? (Math.random()+"").replace(".", "") : ""))
//   urls.push("https://wm-h5.kerzhi.com/../../env")
//   // console.log(urls[urls.length-1])
// }
// let allCount = 0
// let successCount = 0
// let failCount = 0

// asyncPool(100, urls, async (url) => {
//   const st = Date.now()
//   await Axios.get(url).then(res => {
//     if (res.status === 200) {
//       console.log('访问成功', Date.now() - st, ++successCount, ++allCount, url)
//     } else {
//       console.log('访问失败xxxx', Date.now() - st, ++failCount, ++allCount)
//     }
//   }).catch(e => {

//     console.log('访问失败', Date.now() - st, ++failCount, ++allCount, e.toString(), url)
//   })
// }).then(() => {
//   console.log('执行完成')
//   console.log('访问成功', ++successCount, ++allCount)
//   console.log('访问失败', ++failCount, ++allCount)
//   console.log('访问失败', ++failCount, ++allCount)
// })

let raf = (callback) => +setTimeout(callback, 1);
let caf = (num) => clearTimeout(num);

// if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
//   raf = (callback) => window.requestAnimationFrame(callback);
//   caf = (handle) => window.cancelAnimationFrame(handle);
// }

let rafUUID = 0;
const rafIds = new Map();

function cleanup(id) {
  rafIds.delete(id);
}
let firstStr = JSON.stringify(process.memoryUsage())
let st = Date.now()
let ttttt = 10
function wrapperRaf(callback, times = 1) {
  rafUUID += 1;
  const id = rafUUID;

  function callRef(leftTimes) {

    ttttt++
    if (ttttt % 100 === 0) {
      console.log(ttttt, Date.now(), JSON.stringify(process.memoryUsage()))
      console.log("firstStr", Date.now() - st, firstStr, rafIds)
    }


    if (leftTimes === 0) {
      // Clean up
      cleanup(id);

      // Trigger
      callback();
    } else {
      // Next raf
      const realId = raf(() => {
        callRef(leftTimes - 1);
      });

      // Bind real raf id
      rafIds.set(id, realId);
    }
  }

  callRef(times);

  return id;
}

wrapperRaf.cancel = (id) => {
  const realId = rafIds.get(id);
  cleanup(realId);
  return caf(realId);
};


wrapperRaf(() => {
  console.log("xx", rafIds)
  wrapperRaf(() => {

    console.log(rafIds)
  }, 3000000)
}, 3000000)



