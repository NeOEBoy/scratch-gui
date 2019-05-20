import xhr from 'xhr';
import costumePayload from './backpack/costume-payload';
import soundPayload from './backpack/sound-payload';
import spritePayload from './backpack/sprite-payload';
import codePayload from './backpack/code-payload';
import queryString from 'query-string';

const urlParams = require('./url-params');
const md5 = require('md5')
const KAppid = 'scratch-gui';
const KAppsecret = 'scratch-gui-secret'

/**增加sign begin -neo */
const makeSignParams = ()=> {
  const queryParams = {};
  queryParams._timestamp = new Date().getTime();
  let tsString = queryParams._timestamp + '';
  let rdString = Math.floor(Math.random() * 1000) + '';
  queryParams._nonce = md5(tsString + rdString);
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

  let qs = queryString.stringify(queryParams);
  if (qs) qs = `?${qs}`;

  return qs;
}
/**增加sign end -neo */

// Add a new property for the full thumbnail url, which includes the host.
// Also include a full body url for loading sprite zips
// TODO retreiving the images through storage would allow us to remove this.
const includeFullUrls = (item, host) => Object.assign({}, item, {
    thumbnailUrl: `${host}/${item.thumbnail}`,
    bodyUrl: `${host}/${item.body}`
});

const getBackpackContents = ({
    host,
    username,
    token,
    limit,
    offset
}) => new Promise((resolve, reject) => {
    xhr({
        method: 'GET',
        uri: `${host}/${username}?limit=${limit}&offset=${offset}`,
        headers: {'x-token': token},
        json: true,
        withCredentials: true
    }, (error, response) => {
        if (error || response.statusCode !== 200) {
            return reject();
        }
        return resolve(response.body.map(item => includeFullUrls(item, host)));
    });
});

const saveBackpackObject = ({
    host,
    username,
    token,
    type, // Type of object being saved to the backpack
    mime, // Mime-type of the object being saved
    name, // User-facing name of the object being saved
    body, // Base64-encoded body of the object being saved
    thumbnail // Base64-encoded JPEG thumbnail of the object being saved
}) => new Promise((resolve, reject) => {
    const qs = makeSignParams();
    xhr({
        method: 'POST',
        uri: `${host}/${username}${qs}`,
        headers: {'x-token': token},
        json: {type, mime, name, body, thumbnail},
        withCredentials: true
    }, (error, response) => {
        if (error || response.statusCode !== 200) {
            return reject();
        }
        return resolve(includeFullUrls(response.body, host));
    });
});

const deleteBackpackObject = ({
    host,
    username,
    token,
    id
}) => new Promise((resolve, reject) => {
    const qs = makeSignParams();
    xhr({
        method: 'DELETE',
        uri: `${host}/${username}/${id}${qs}`,
        headers: {'x-token': token},
        withCredentials: true
    }, (error, response) => {
        if (error || response.statusCode !== 200) {
            return reject();
        }
        return resolve(response.body);
    });
});

// Two types of backpack items are not retreivable through storage
// code, as json and sprite3 as arraybuffer zips.
const fetchAs = (responseType, uri) => new Promise((resolve, reject) => {
    xhr({uri, responseType}, (error, response) => {
        if (error || response.statusCode !== 200) {
            return reject();
        }
        return resolve(response.body);
    });
});

// These two helpers allow easy fetching of backpack code and sprite zips
// Use the curried fetchAs here so the consumer does not worry about XHR responseTypes
const fetchCode = fetchAs.bind(null, 'json');
const fetchSprite = fetchAs.bind(null, 'arraybuffer');

export {
    getBackpackContents,
    saveBackpackObject,
    deleteBackpackObject,
    costumePayload,
    soundPayload,
    spritePayload,
    codePayload,
    fetchCode,
    fetchSprite
};
