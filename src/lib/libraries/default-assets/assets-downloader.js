const https = require('https')
const fs = require('fs')

const costumeLibraryContent = require('../costumes.json')
const backdropLibraryContent = require('../backdrops.json')
const soundLibraryContent = require('../sounds.json')

// const testUrl = 'https://cdn.assets.scratch.mit.edu/internalapi/asset/76fa99f67569fcd39b4be74ed38c33f3.png/get/';
/**
 * 实现一个资源下载器，从mit官网下载library配置的资源到本地目录assets
 * excute cmd: ps node downloader.js
 */
const makeSyncAssetFromMit = async function () {
  try {
    console.info(`[costumes.json里的资源,开始下载]............`);
    for (let i = 0; i < costumeLibraryContent.length; ++i) {
      let element = costumeLibraryContent[i];
      let assetUrl = `https://cdn.assets.scratch.mit.edu/internalapi/asset/${element.md5}/get/`
      let localFileName = `assets/${element.md5}`;
      let result = await downloadAsset(assetUrl, localFileName);
      console.info(`[success]${result}`);
    }
    console.info(`............[costumes.json里的资源,下载完毕]............`);

    console.info(`[backdrops.json里的资源,开始下载]............`);
    for (let i = 0; i < backdropLibraryContent.length; ++i) {
      let element = backdropLibraryContent[i];
      let assetUrl = `https://cdn.assets.scratch.mit.edu/internalapi/asset/${element.md5}/get/`
      let localFileName = `assets/${element.md5}`;
      let result = await downloadAsset(assetUrl, localFileName);
      console.info(`[success]${result}`);
    }
    console.info(`............[backdrops.json里的资源,下载完毕]............`);

    console.info(`[sounds.json里的资源,开始下载]............`);
    for (let i = 0; i < soundLibraryContent.length; ++i) {
      let element = soundLibraryContent[i];
      let assetUrl = `https://cdn.assets.scratch.mit.edu/internalapi/asset/${element.md5}/get/`
      let localFileName = `assets/${element.md5}`;
      let result = await downloadAsset(assetUrl, localFileName);
      console.info(`[success]${result}`);
    }
    console.info(`............[sounds.json里的资源,下载完毕]............`);
  } catch (err) {
    console.error(`[failure]${err}`);
  }
}

const downloadAsset = function (remoteUrl, localFileName) {
  let downloadPromise = new Promise((resolve, rejects) => {
    https.get(remoteUrl, function (res) {
      if (res.statusCode !== 200) {
        rejects(`${remoteUrl}下载出错,状态码:${res.statusCode}`);
        return;
      }

      let allChunks = '';
      res.setEncoding('binary');
      res.on('data', function (chunk) {
        allChunks += chunk;
      })
      res.on('end', function () {
        if (allChunks.length === 0) {
          rejects(`${remoteUrl}下载出错，没有读取到数据`);
          return;
        }

        if (!localFileName) {
          rejects(`${remoteUrl}没有指定本地存储路径`);
          return;
        }

        fs.writeFile(localFileName, allChunks, 'binary', function (err) {  //path为本地路径例如public/logo.png
          if (err) {
            rejects(`${remoteUrl}没有正确保存到${localFileName};错误:${err}`);
          } else {
            resolve(`${remoteUrl}=>${localFileName}`);
          }
        })
      })
    })
  });

  return downloadPromise;
}

makeSyncAssetFromMit();
