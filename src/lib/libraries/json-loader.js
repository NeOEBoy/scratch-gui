
const jsonLoader = (jsonUri) => {
  const loaderPromise = new Promise((resolve, reject) => {
    let oReq = new XMLHttpRequest();
    oReq.open("GET", jsonUri, true);
    oReq.responseType = 'json';
    oReq.onload = () => {
      if (oReq.status !== 200) {
        reject();
        return;
      }

      let jsonResponse = oReq.response;
      if (jsonResponse) {
        resolve(jsonResponse);
      }
    };
    oReq.send(null);
  })

  return loaderPromise;
}

export default jsonLoader;