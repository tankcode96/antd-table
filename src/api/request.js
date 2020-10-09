const request = () => {
  return new Promise((resolve, reject) => {
    if(true) {
      resolve({})
    } else {
      reject({ errMsg: 'something was wrong', errCode: 500 })
    }
  })
};

const get = () => {
  return request()
};

const post = () => {
  return request()
};

export {
  get,
  post,
}
