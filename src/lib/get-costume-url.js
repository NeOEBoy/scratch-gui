import storage from './storage';
import {inlineSvgFontsAsync} from 'scratch-svg-renderer';

// Contains 'font-family', but doesn't only contain 'font-family="none"'
const HAS_FONT_REGEXP = 'font-family(?!="none")';

const getCostumeUrl = (function () {
    let cachedAssetId;
    let cachedUrl;

    return function (asset) {

        if (cachedAssetId === asset.assetId) {
            return Promise.resolve(cachedUrl);
        }

        cachedAssetId = asset.assetId;

        // If the SVG refers to fonts, they must be inlined in order to display correctly in the img tag.
        // Avoid parsing the SVG when possible, since it's expensive.
        if (asset.assetType === storage.AssetType.ImageVector) {
            const svgString = asset.decodeText();
            if (svgString.match(HAS_FONT_REGEXP)) {
                return inlineSvgFontsAsync(svgString).then((svgText)=>{
                  cachedUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgText)}`;
                  return Promise.resolve(cachedUrl);
                });
            } else {
                cachedUrl = asset.encodeDataURI();
                return Promise.resolve(cachedUrl);
            }
        } else {
            cachedUrl = asset.encodeDataURI();
            return Promise.resolve(cachedUrl);
        }

        // return cachedUrl;
    };
}());

export {
    getCostumeUrl as default,
    HAS_FONT_REGEXP
};
