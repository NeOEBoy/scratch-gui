import ScratchStorage from 'scratch-storage';

import defaultProject from './default-project';
import InternalHelper from './libraries/default-assets/internal-helper'
const urlParams = require('./url-params');
const md5 = require('md5')

const KAppid = 'scratch-gui';
const KAppsecret = 'scratch-gui-secret'

/**
 * Wrapper for ScratchStorage which adds default web sources.
 * @todo make this more configurable
 */
class Storage extends ScratchStorage {
  constructor() {
    super();

    /**
     * super()会初始两个Helper，这里对helper做一个扩展。
     * builtinHelper(内存来源)，priority为100。
     * webHelper(网络来源)，priority为-100。
     * internalHelper(自定义来源，这里从工程里读取)，priority为0。
     */
    let internalHelper = new InternalHelper(this);
    this.addHelper(internalHelper, 0);

    this.cacheDefaultProject();
  }
  addOfficialScratchWebStores() {
    this.addWebStore(
      [this.AssetType.Project],
      this.getProjectGetConfig.bind(this),
      this.getProjectCreateConfig.bind(this),
      this.getProjectUpdateConfig.bind(this)
    );
    this.addWebStore(
      [this.AssetType.ImageVector, this.AssetType.ImageBitmap, this.AssetType.Sound],
      this.getAssetGetConfig.bind(this),
      // We set both the create and update configs to the same method because
      // storage assumes it should update if there is an assetId, but the
      // asset store uses the assetId as part of the create URI.
      this.getAssetCreateConfig.bind(this),
      this.getAssetCreateConfig.bind(this)
    );
    this.addWebStore(
      [this.AssetType.Sound],
      asset => `static/extension-assets/scratch3_music/${asset.assetId}.${asset.dataFormat}`
    );
  }
  setProjectHost(projectHost) {
    this.projectHost = projectHost;
  }
  getProjectGetConfig(projectAsset) {
    return `${this.projectHost}/${projectAsset.assetId}`;
  }
  getProjectCreateConfig() {
    return {
      url: `${this.projectHost}/` + '?' + this.makeExtraParam(),
      withCredentials: true
    };
  }
  getProjectUpdateConfig(projectAsset) {
    return {
      url: `${this.projectHost}/${projectAsset.assetId}` + '?' + this.makeExtraParam(),
      withCredentials: true
    };
  }
  setAssetHost(assetHost) {
    this.assetHost = assetHost;
  }
  getAssetGetConfig(asset) {
    // return `${this.assetHost}/internalapi/asset/${asset.assetId}.${asset.dataFormat}/get/`;
    // 地址和create或者update接口保持统一 -neo
    return `${this.assetHost}/${asset.assetId}.${asset.dataFormat}`;
  }
  getAssetCreateConfig(asset) {
    return {
      // There is no such thing as updating assets, but storage assumes it
      // should update if there is an assetId, and the asset store uses the
      // assetId as part of the create URI. So, force the method to POST.
      // Then when storage finds this config to use for the "update", still POSTs
      method: 'post',
      url: `${this.assetHost}/${asset.assetId}.${asset.dataFormat}` + '?' + this.makeExtraParam(),
      withCredentials: true
    };
  }
  setTranslatorFunction(translator) {
    this.translator = translator;
    this.cacheDefaultProject();
  }
  cacheDefaultProject() {
    const defaultProjectAssets = defaultProject(this.translator);
    defaultProjectAssets.forEach(asset => this.builtinHelper._store(
      this.AssetType[asset.assetType],
      this.DataFormat[asset.dataFormat],
      asset.data,
      asset.id
    ));
  }
  makeExtraParam() {
    const params = {};
    params._timestamp = new Date().getTime();
    params._nonce = md5(params._timestamp);
    params._appid = KAppid;

    // 根据属性排序
    var paramsKeys = Object.keys(params).sort();
    var sortedParams = {};
    for (var i = 0; i < paramsKeys.length; i++) {
      sortedParams[paramsKeys[i]] = params[paramsKeys[i]];
    }
    const rawSign = urlParams(sortedParams)
    // console.log('rawSign = ' + rawSign);
    const rawSignWithSecret = rawSign + KAppsecret;
    // console.log('rawSignWithSecret = ' + rawSignWithSecret)
    const md5SignWithSecret = md5(rawSignWithSecret)
    // console.log('md5SignWithSecret = ' + md5SignWithSecret)
    params._sign = md5SignWithSecret;

    return urlParams(params);
  }
}

const storage = new Storage();

export default storage;
