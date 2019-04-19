
// const Asset = require('./Asset');
// const AssetType = require('./AssetType');
// const DataFormat = require('./DataFormat');

/**
 * 注意：Helper没有export出来，这里复制一份，保持和scratch-storage一致，
 * InternalHelper也可以不继承Helper，为了严谨，还是和内置Helper在继承关系上保持一致。
 * */
/**
 * Base class for asset load/save helpers.
 * @abstract
 */
class Helper {
  constructor(parent) {
    this.parent = parent;
  }

  /**
   * Fetch an asset but don't process dependencies.
   * @param {AssetType} assetType - The type of asset to fetch.
   * @param {string} assetId - The ID of the asset to fetch: a project ID, MD5, etc.
   * @param {DataFormat} dataFormat - The file format / file extension of the asset to fetch: PNG, JPG, etc.
   * @return {Promise.<Asset>} A promise for the contents of the asset.
   */
  load(assetType, assetId, dataFormat) {
    return Promise.reject(new Error(`No asset of type ${assetType} for ID ${assetId} with format ${dataFormat}`));
  }
}

/**
  * 自定义Helper，该helper会从项目工程里读取预置的aseet文件，
  * Storage应优先从该helper读取asset。
 */
class InternalHelper extends Helper {
  constructor(parent) {
    super(parent);
  }

  /**
   * Fetch an asset from project
   * @param {AssetType} assetType - The type of asset to fetch.
   * @param {string} assetId - The ID of the asset to fetch: a project ID, MD5, etc.
   * @return {?Promise.<Asset>} A promise for the contents of the asset.
   */
  load(assetType, assetId, dataFormat) {
    // console.log('assetType = ' + JSON.stringify(assetType));
    // console.log('assetId = ' + assetId);
    // console.log('dataFormat = ' + dataFormat);

    let asset = this.parent.createAsset(assetType, dataFormat, null, assetId);

    // 由于arraybuffer-loader加载二进制数据到data中较慢，为避免卡住UI，使用delay 0s策略，模拟异步过程。
    const delayLoadAsset = () => {
      const timerPromise = new Promise((resolve) => {
        return setTimeout(resolve, 0);
      })

      return timerPromise.then(() => {
        // 文件不存在会抛出Error: Cannot find module './cd21514d0531fdffb22204e0ec5ed84a.svg'
        let data = Buffer.from(
          require(`!arraybuffer-loader!./assets/${assetId}.${dataFormat}`));
        asset.setData(data, dataFormat);
      }).catch((err) => {
        return Promise.reject(err);
      })
    };

    return delayLoadAsset().then(() => asset);
  }
}

export default InternalHelper;
