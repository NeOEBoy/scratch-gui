import queryString from 'query-string';
import xhr from 'xhr';
import storage from '../lib/storage';

const urlParams = require('./url-params');
const md5 = require('md5')

const KAppid = 'scratch-gui';
const KAppsecret = 'scratch-gui-secret'

/**
 * Save a project JSON to the project server.
 * This should eventually live in scratch-www.
 * @param {number} projectId the ID of the project, null if a new project.
 * @param {object} vmState the JSON project representation.
 * @param {object} params the request params.
 * @property {?number} params.originalId the original project ID if a copy/remix.
 * @property {?boolean} params.isCopy a flag indicating if this save is creating a copy.
 * @property {?boolean} params.isRemix a flag indicating if this save is creating a remix.
 * @property {?string} params.title the title of the project.
 * @return {Promise} A promise that resolves when the network request resolves.
 */
export default function (projectId, vmState, params) {
  const opts = {
    body: vmState,
    // If we set json:true then the body is double-stringified, so don't
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  };
  const creatingProject = projectId === null || typeof projectId === 'undefined';
  const queryParams = {};
  if (params.hasOwnProperty('originalId')) queryParams.original_id = params.originalId;
  if (params.hasOwnProperty('isCopy')) queryParams.is_copy = params.isCopy;
  if (params.hasOwnProperty('isRemix')) queryParams.is_remix = params.isRemix;
  if (params.hasOwnProperty('title')) queryParams.title = params.title;

  /**增加sign begin -neo */
  queryParams._timestamp = new Date().getTime();
  queryParams._nonce = md5(queryParams._timestamp);
  queryParams._appid = KAppid;

  // 根据属性排序
  var paramsKeys = Object.keys(queryParams).sort();
  var sortedParams = {};
  for (var i = 0; i < paramsKeys.length; i++) {
    sortedParams[paramsKeys[i]] = queryParams[paramsKeys[i]];
  }
  const rawSign = urlParams(sortedParams)
  // console.log('rawSign = ' + rawSign);
  const rawSignWithSecret = rawSign + KAppsecret;
  // console.log('rawSignWithSecret = ' + rawSignWithSecret)
  const md5SignWithSecret = md5(rawSignWithSecret)
  // console.log('md5SignWithSecret = ' + md5SignWithSecret)
  queryParams._sign = md5SignWithSecret;
  /**增加sign end -neo */

  let qs = queryString.stringify(queryParams);
  if (qs) qs = `?${qs}`;
  if (creatingProject) {
    Object.assign(opts, {
      method: 'post',
      url: `${storage.projectHost}/${qs}`
    });
  } else {
    Object.assign(opts, {
      method: 'put',
      url: `${storage.projectHost}/${projectId}${qs}`
    });
  }
  return new Promise((resolve, reject) => {
    xhr(opts, (err, response) => {
      if (err) return reject(err);
      let body;
      try {
        // Since we didn't set json: true, we have to parse manually
        body = JSON.parse(response.body);
      } catch (e) {
        return reject(e);
      }
      body.id = projectId;
      if (creatingProject) {
        body.id = body['content-name'];
      }
      resolve(body);
    });
  });
}
