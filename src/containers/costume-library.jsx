import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import VM from 'scratch-vm';

import LibraryComponent from '../components/library/library.jsx';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose a Costume',
        description: 'Heading for the costume library',
        id: 'gui.costumeLibrary.chooseACostume'
    }
});

class CostumeLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelected'
        ]);

        this.state = {
          isLoading: true,
          libraryContent: [],
          tags: []
        }
    }
    componentDidMount () {
      const spriteTags = require('../lib/libraries/sprite-tags').default;
      this.setState({
        tags: spriteTags
      });

      const jsonLoader = require('../lib/libraries/json-loader').default;
      jsonLoader(`/static/libraries-json/costumes.json`)
        .then((jsonResponse) => {
          this.setState({
            isLoading: false,
            libraryContent: jsonResponse
          });
        })
    }
    handleItemSelected (item) {
        const split = item.md5.split('.');
        const type = split.length > 1 ? split[1] : null;
        const rotationCenterX = type === 'svg' ? item.info[0] : item.info[0] / 2;
        const rotationCenterY = type === 'svg' ? item.info[1] : item.info[1] / 2;
        const vmCostume = {
            name: item.name,
            rotationCenterX,
            rotationCenterY,
            bitmapResolution: item.info.length > 2 ? item.info[2] : 1,
            skinId: null
        };
        this.props.vm.addCostumeFromLibrary(item.md5, vmCostume);
    }
    render () {
        const { isLoading, libraryContent, tags } = this.state;
        return (
          <LibraryComponent
              isLoading={isLoading}
              data={libraryContent}
              id="costumeLibrary"
              tags={tags}
              title={this.props.intl.formatMessage(messages.libraryTitle)}
              onItemSelected={this.handleItemSelected}
              onRequestClose={this.props.onRequestClose}
          />
        );
    }
}

CostumeLibrary.propTypes = {
    intl: intlShape.isRequired,
    onRequestClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(CostumeLibrary);
